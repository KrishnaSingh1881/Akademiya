import { query } from '../db/index.js';
import { generateQuestion, generateEmbedding } from '../ai/modelAdapter.js';
import { broadcastJobEvent } from '../ws.js';

// In-process bounded queue
class GenerationQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  enqueue(job) {
    this.queue.push(job);
    this.processNext();
  }

  async processNext() {
    if (this.running || this.queue.length === 0) return;
    this.running = true;

    const job = this.queue.shift();
    try {
      await this.runJob(job);
    } catch (err) {
      console.error(`Error processing job ${job.id}:`, err);
    } finally {
      this.running = false;
      this.processNext();
    }
  }

  async runJob(job) {
    const { id: jobId, teacher_id, requested_count, blueprint, assessment_id = null } = job;
    broadcastJobEvent(jobId, 'generation.started', { requested_count });

    let generatedCount = 0;
    const MAX_RETRIES = 3;

    for (let i = 1; i <= requested_count; i++) {
      // 1. Check for cancellation before processing item
      const statusCheck = await query('SELECT status FROM generation_jobs WHERE id = $1', [jobId]);
      if (statusCheck.rows.length === 0 || statusCheck.rows[0].status === 'cancelled') {
        console.log(`[Queue] Job ${jobId} was cancelled by user.`);
        broadcastJobEvent(jobId, 'generation.cancelled', { generated_count: generatedCount });
        return;
      }

      let attemptNo = 0;
      let questionObj = null;
      let isValid = false;

      // 2. Bounded retry loop (max 3 tries per item)
      while (attemptNo < MAX_RETRIES && !isValid) {
        attemptNo++;
        try {
          const generated = await generateQuestion(blueprint);
          // Schema Validation
          if (
            generated &&
            generated.statement &&
            Array.isArray(generated.options) &&
            generated.options.length >= 2 &&
            Array.isArray(generated.correct_option_ids) &&
            (generated.type !== 'mcq_single' || generated.correct_option_ids.length === 1)
          ) {
            questionObj = generated;
            isValid = true;
          }
        } catch (err) {
          console.warn(`[Queue] Attempt ${attemptNo} failed for item ${i}:`, err.message);
        }
      }

      if (!isValid || !questionObj) {
        // Mark failed item
        await query(
          `INSERT INTO generated_questions (job_id, status, attempt_no)
           VALUES ($1, 'failed', $2)`,
          [jobId, attemptNo]
        );
        broadcastJobEvent(jobId, 'question.failed', { index: i, attempt_no: attemptNo });
        continue;
      }

      // 3. Optional: generate vector embedding for Phase 9 semantic layer
      let embedding = null;
      try {
        const textToEmbed = `${questionObj.concept} ${questionObj.subconcept} ${questionObj.statement}`;
        embedding = await generateEmbedding(textToEmbed);
      } catch (err) {
        console.warn('Embedding generation error:', err.message);
      }

      // 4. Insert into questions table (source = 'ai')
      const qRes = await query(
        `INSERT INTO questions 
         (assessment_id, concept, subconcept, type, statement, options, correct_option_ids, bloom_level, difficulty, source, embedding)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'ai', $10)
         RETURNING *`,
        [
          assessment_id,
          questionObj.concept,
          questionObj.subconcept,
          questionObj.type,
          questionObj.statement,
          JSON.stringify(questionObj.options),
          JSON.stringify(questionObj.correct_option_ids),
          questionObj.bloom_level,
          questionObj.difficulty,
          embedding ? `[${embedding.join(',')}]` : null
        ]
      );
      const insertedQuestion = qRes.rows[0];


      // 5. Link in generated_questions
      await query(
        `INSERT INTO generated_questions (job_id, question_id, status, attempt_no)
         VALUES ($1, $2, 'validated', $3)`,
        [jobId, insertedQuestion.id, attemptNo]
      );

      generatedCount++;

      // 6. Update generation_jobs count
      await query(
        `UPDATE generation_jobs
         SET generated_count = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [generatedCount, jobId]
      );

      // 7. Emit WebSocket streaming progress events
      broadcastJobEvent(jobId, 'question.generated', {
        index: i,
        question: insertedQuestion
      });
      broadcastJobEvent(jobId, 'generation.progress', {
        current: generatedCount,
        total: requested_count
      });

      // Small tick delay to allow observable streaming UI experience
      await new Promise(r => setTimeout(r, 200));
    }

    // Mark completed
    await query(
      `UPDATE generation_jobs
       SET status = 'completed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status != 'cancelled'`,
      [jobId]
    );

    broadcastJobEvent(jobId, 'generation.completed', {
      total_generated: generatedCount,
      requested_count
    });
  }
}

export const queue = new GenerationQueue();
