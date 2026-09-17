import express from 'express';
import { query } from '../db/index.js';
import { requireAuth, requireStudent } from '../middleware/auth.js';
import { evaluateMCQ, evaluateDebugging } from '../lib/evaluator.js';
import { detectGap } from '../services/evidenceService.js';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      question_id,
      selected_option_ids = null,
      code = null,
      source = 'practice'
    } = req.body;

    if (!question_id) {
      return res.status(400).json({ error: 'question_id is required' });
    }

    // 1. Fetch question
    const qResult = await query('SELECT * FROM questions WHERE id = $1', [question_id]);
    if (qResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    const question = qResult.rows[0];

    // 2. Deterministic evaluation
    let evaluation;
    if (question.type === 'mcq_single' || question.type === 'mcq_multi') {
      let correctOptionIds = [];
      try {
        correctOptionIds = typeof question.correct_option_ids === 'string'
          ? JSON.parse(question.correct_option_ids)
          : question.correct_option_ids;
      } catch {
        correctOptionIds = [];
      }
      evaluation = evaluateMCQ(question.type, selected_option_ids, correctOptionIds, 1);
    } else if (question.type === 'coding') {
      // For coding questions, options may contain test_cases or code runner info
      let testCases = [];
      try {
        testCases = typeof question.options === 'string' ? JSON.parse(question.options) : (question.options || []);
      } catch {
        testCases = [];
      }
      evaluation = await evaluateDebugging(code, 'python', testCases, 1);
    } else {
      return res.status(400).json({ error: `Unsupported question type: ${question.type}` });
    }

    // 3. Insert into attempts table
    const attemptInsert = await query(
      `INSERT INTO attempts 
       (student_id, question_id, source, selected_option_ids, code, is_correct, marks_awarded)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        studentId,
        question_id,
        source,
        selected_option_ids ? JSON.stringify(selected_option_ids) : null,
        code,
        evaluation.is_correct,
        evaluation.marks_awarded
      ]
    );
    const attempt = attemptInsert.rows[0];

    // 4. Insert into learning_evidence table
    const resultStatus = evaluation.is_correct ? 'correct' : 'incorrect';
    const evidenceInsert = await query(
      `INSERT INTO learning_evidence 
       (student_id, concept, subconcept, attempt_id, result)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        studentId,
        question.concept,
        question.subconcept,
        attempt.id,
        resultStatus
      ]
    );
    const evidence = evidenceInsert.rows[0];

    // 5. Trigger gap detection hook
    const gapResult = await detectGap(studentId, question.concept, question.subconcept);

    return res.status(201).json({
      attempt,
      evaluation,
      evidence,
      gap_detected: gapResult
    });
  } catch (err) {
    console.error('Attempt error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/student/:student_id', requireAuth, async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const result = await query(
      `SELECT a.*, q.concept, q.subconcept, q.statement, q.type as question_type
       FROM attempts a
       JOIN questions q ON a.question_id = q.id
       WHERE a.student_id = $1
       ORDER BY a.created_at DESC`,
      [studentId]
    );
    return res.json({ attempts: result.rows });
  } catch (err) {
    console.error('Get attempts error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
