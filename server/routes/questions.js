import express from 'express';
import { query } from '../db/index.js';
import { requireAuth, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// Teacher seeds an MCQ question
router.post('/seed', requireAuth, requireTeacher, async (req, res) => {
  try {
    const {
      concept,
      subconcept,
      statement,
      options,
      correct_option_ids,
      type = 'mcq_single',
      bloom_level = 'understand',
      difficulty = 'medium',
      assessment_id = null
    } = req.body;

    if (!concept || !subconcept || !statement || !options || !correct_option_ids) {
      return res.status(400).json({
        error: 'concept, subconcept, statement, options, and correct_option_ids are required'
      });
    }

    const result = await query(
      `INSERT INTO questions 
       (assessment_id, concept, subconcept, type, statement, options, correct_option_ids, bloom_level, difficulty, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'teacher')
       RETURNING *`,
      [
        assessment_id,
        concept.trim(),
        subconcept.trim(),
        type,
        statement.trim(),
        JSON.stringify(options),
        JSON.stringify(correct_option_ids),
        bloom_level,
        difficulty
      ]
    );

    return res.status(201).json({ question: result.rows[0] });
  } catch (err) {
    console.error('Seed question error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// List questions
router.get('/', requireAuth, async (req, res) => {
  try {
    const { concept, subconcept, source } = req.query;
    let sql = 'SELECT * FROM questions WHERE 1=1';
    const params = [];

    if (concept) {
      params.push(concept);
      sql += ` AND concept = $${params.length}`;
    }
    if (subconcept) {
      params.push(subconcept);
      sql += ` AND subconcept = $${params.length}`;
    }
    if (source) {
      params.push(source);
      sql += ` AND source = $${params.length}`;
    }

    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    return res.json({ questions: result.rows });
  } catch (err) {
    console.error('Get questions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single question by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM questions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    return res.json({ question: result.rows[0] });
  } catch (err) {
    console.error('Get question error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
