import express from 'express';
import { query } from '../db/index.js';
import { requireAuth, requireTeacher } from '../middleware/auth.js';

const router = express.Router();

// Create an assessment / test
router.post('/assessments', requireAuth, requireTeacher, async (req, res) => {
  try {
    const {
      title,
      status = 'published',
      proctoring_enabled = false,
      integrity_rules = { fullscreen: true, block_tab_switch: true, block_clipboard: true, max_violations: 3 }
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }
    const result = await query(
      `INSERT INTO assessments (teacher_id, title, status, proctoring_enabled, integrity_rules)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, title.trim(), status, Boolean(proctoring_enabled), JSON.stringify(integrity_rules)]
    );
    return res.status(201).json({ assessment: result.rows[0] });
  } catch (err) {
    console.error('Create assessment error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// List assessments with question counts and proctoring violation counts
router.get('/assessments', requireAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT a.*, 
              COUNT(DISTINCT q.id) as question_count,
              COUNT(DISTINCT ie.id) as violation_count
       FROM assessments a
       LEFT JOIN questions q ON q.assessment_id = a.id
       LEFT JOIN integrity_events ie ON ie.assessment_id = a.id
       GROUP BY a.id
       ORDER BY a.created_at DESC`
    );
    return res.json({ assessments: result.rows });
  } catch (err) {
    console.error('Get assessments error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single assessment details and its questions
router.get('/assessments/:id', requireAuth, async (req, res) => {
  try {
    const assessRes = await query('SELECT * FROM assessments WHERE id = $1', [req.params.id]);
    if (assessRes.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    const questionsRes = await query(
      'SELECT * FROM questions WHERE assessment_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    return res.json({ assessment: assessRes.rows[0], questions: questionsRes.rows });
  } catch (err) {
    console.error('Get assessment error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Log an integrity / focus violation event (tab switch, window blur, fullscreen exit, paste)
router.post('/assessments/:id/integrity-event', requireAuth, async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const { event_type, metadata = {} } = req.body;
    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }
    const result = await query(
      `INSERT INTO integrity_events (assessment_id, student_id, event_type, metadata)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [assessmentId, req.user.id, event_type, JSON.stringify(metadata)]
    );
    return res.status(201).json({ success: true, event: result.rows[0] });
  } catch (err) {
    console.error('Record integrity event error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve forensic timeline report for an assessment
router.get('/assessments/:id/integrity-report', requireAuth, async (req, res) => {
  try {
    const assessmentId = req.params.id;
    const result = await query(
      `SELECT ie.id, ie.assessment_id, ie.student_id, ie.event_type, ie.metadata, ie.created_at,
              u.name as student_name, u.email as student_email
       FROM integrity_events ie
       JOIN users u ON u.id = ie.student_id
       WHERE ie.assessment_id = $1
       ORDER BY ie.created_at ASC`,
      [assessmentId]
    );
    return res.json({ events: result.rows });
  } catch (err) {
    console.error('Get integrity report error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


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
