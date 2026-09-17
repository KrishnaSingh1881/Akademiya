import express from 'express';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/practice/:student_id - returns teacher and AI generated questions available to student
router.get('/:student_id', requireAuth, async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const { concept } = req.query;

    let sql = `
      SELECT q.id, q.concept, q.subconcept, q.type, q.statement, q.options, 
             q.bloom_level, q.difficulty, q.source, q.created_at,
             (
               SELECT json_agg(json_build_object(
                 'id', a.id,
                 'is_correct', a.is_correct,
                 'marks_awarded', a.marks_awarded,
                 'created_at', a.created_at
               ) ORDER BY a.created_at DESC)
               FROM attempts a
               WHERE a.question_id = q.id AND a.student_id = $1
             ) as student_attempts
      FROM questions q
      WHERE 1=1
    `;
    const params = [studentId];

    if (concept) {
      params.push(concept);
      sql += ` AND q.concept = $${params.length}`;
    }

    sql += ' ORDER BY q.created_at DESC LIMIT 50';

    const result = await query(sql, params);
    return res.json({ questions: result.rows });
  } catch (err) {
    console.error('Practice questions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
