import express from 'express';
import { query } from '../db/index.js';
import { requireAuth, requireTeacher } from '../middleware/auth.js';
import { queue } from '../jobs/generationQueue.js';

const router = express.Router();

// POST /api/generation-jobs
router.post('/', requireAuth, requireTeacher, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { concept, subconcept, requested_count = 5, bloom_level = 'apply', difficulty = 'medium', type = 'mcq_single' } = req.body;

    if (!concept || !subconcept) {
      return res.status(400).json({ error: 'concept and subconcept are required' });
    }

    // Hard cap at 20 per spec
    const count = Math.min(Math.max(1, parseInt(requested_count, 10) || 1), 20);

    // Question blueprint step per spec (Section 6 Phase 4.2)
    const blueprint = {
      concept: concept.trim(),
      subconcept: subconcept.trim(),
      type,
      bloom_level,
      difficulty,
      constraints: req.body.constraints || ''
    };

    const insertRes = await query(
      `INSERT INTO generation_jobs (teacher_id, requested_count, generated_count, status)
       VALUES ($1, $2, 0, 'running')
       RETURNING *`,
      [teacherId, count]
    );

    const job = insertRes.rows[0];

    // Enqueue in-process async worker without blocking HTTP response
    queue.enqueue({
      id: job.id,
      teacher_id: teacherId,
      requested_count: count,
      blueprint
    });

    return res.status(202).json({
      job_id: job.id,
      status: job.status,
      requested_count: count,
      message: 'Generation job scheduled'
    });
  } catch (err) {
    console.error('Create generation job error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/generation-jobs/:id - resync state after refresh
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const jobRes = await query('SELECT * FROM generation_jobs WHERE id = $1', [req.params.id]);
    if (jobRes.rows.length === 0) {
      return res.status(404).json({ error: 'Generation job not found' });
    }
    const job = jobRes.rows[0];

    // Fetch generated questions associated with this job
    const qRes = await query(
      `SELECT q.*, gq.status as generation_status, gq.attempt_no
       FROM generated_questions gq
       JOIN questions q ON gq.question_id = q.id
       WHERE gq.job_id = $1
       ORDER BY gq.created_at ASC`,
      [job.id]
    );

    return res.json({
      job,
      questions: qRes.rows
    });
  } catch (err) {
    console.error('Get job status error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/generation-jobs/:id/cancel
router.post('/:id/cancel', requireAuth, requireTeacher, async (req, res) => {
  try {
    const result = await query(
      `UPDATE generation_jobs
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.json({
      message: 'Job marked as cancelled',
      job: result.rows[0]
    });
  } catch (err) {
    console.error('Cancel job error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
