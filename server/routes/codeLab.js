import express from 'express';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { runLocally } from '../lib/localRunner.js';
import { evaluateDebugging } from '../lib/evaluator.js';
import { generateExplanation } from '../ai/modelAdapter.js';
import { detectGap } from '../services/evidenceService.js';

const router = express.Router();

// Seed initial challenges if empty
async function seedDefaultChallenges() {
  try {
    const countRes = await query('SELECT count(*) FROM coding_challenges');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      await query(
        `INSERT INTO coding_challenges 
         (concept, subconcept, title, description, initial_code, language, expected_behaviour, test_cases, diagnostic_tags)
         VALUES 
         (
           'Recursion', 
           'Base Case Termination', 
           'Recursive Countdown', 
           'Write a Python function countdown(n) that prints integers from n down to 1 separated by newlines, terminating safely when n <= 0.',
           'def countdown(n):\n    # TODO: implement recursive countdown\n    if n <= 0:\n        return\n    print(n)\n    countdown(n - 1)\n\nimport sys\nline = sys.stdin.read().strip()\nif line:\n    countdown(int(line))',
           'python',
           'Prints n down to 1',
           '[{"input": "3", "expected_output": "3\\n2\\n1", "is_hidden": false}, {"input": "1", "expected_output": "1", "is_hidden": false}, {"input": "5", "expected_output": "5\\n4\\n3\\n2\\n1", "is_hidden": true}]'::jsonb,
           '["recursion", "call_stack", "termination"]'::jsonb
         ),
         (
           'Arrays', 
           'Two Pointer Technique', 
           'Reverse String In-Place', 
           'Reverse an input line string using two pointers and print the result.',
           'import sys\ns = sys.stdin.read().strip()\nprint(s[::-1])',
           'python',
           'Reverses input',
           '[{"input": "hello", "expected_output": "olleh", "is_hidden": false}, {"input": "Akademiya", "expected_output": "ayimedakA", "is_hidden": true}]'::jsonb,
           '["two_pointer", "array_indexing"]'::jsonb
         )`
      );
      console.log('🌱 Default coding challenges seeded');
    }
  } catch (err) {
    console.error('Seed challenges error:', err);
  }
}
seedDefaultChallenges();

// GET /api/code-lab/challenges
router.get('/challenges', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM coding_challenges ORDER BY created_at ASC');
    return res.json({ challenges: result.rows });
  } catch (err) {
    console.error('Get challenges error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/code-lab/run - Run code with custom input
router.post('/run', requireAuth, async (req, res) => {
  try {
    const { code, language = 'python', stdin = '' } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'code is required' });
    }
    const result = await runLocally(language, code, stdin);
    return res.json({ result });
  } catch (err) {
    console.error('Code run error:', err);
    return res.status(500).json({ error: 'Execution error' });
  }
});

// POST /api/code-lab/submit - Submit code against challenge test cases
router.post('/submit', requireAuth, async (req, res) => {
  try {
    const studentId = req.user.id;
    const { challenge_id, code, language = 'python' } = req.body;

    const cRes = await query('SELECT * FROM coding_challenges WHERE id = $1', [challenge_id]);
    if (cRes.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    const challenge = cRes.rows[0];

    let testCases = [];
    try {
      testCases = typeof challenge.test_cases === 'string'
        ? JSON.parse(challenge.test_cases)
        : challenge.test_cases;
    } catch {
      testCases = [];
    }

    // Deterministic evaluation via evaluator.js
    const evalResult = await evaluateDebugging(code, language, testCases, 10);

    // Also look up or create a shadow question row for this coding challenge to record attempt & evidence
    let qRes = await query('SELECT id FROM questions WHERE statement = $1 LIMIT 1', [challenge.title]);
    let questionId;
    if (qRes.rows.length > 0) {
      questionId = qRes.rows[0].id;
    } else {
      const newQ = await query(
        `INSERT INTO questions (concept, subconcept, type, statement, source)
         VALUES ($1, $2, 'coding', $3, 'teacher')
         RETURNING id`,
        [challenge.concept, challenge.subconcept, challenge.title]
      );
      questionId = newQ.rows[0].id;
    }

    // Record attempt
    const attemptRes = await query(
      `INSERT INTO attempts (student_id, question_id, source, code, is_correct, marks_awarded)
       VALUES ($1, $2, 'practice', $3, $4, $5)
       RETURNING *`,
      [studentId, questionId, code, evalResult.is_correct, evalResult.marks_awarded]
    );

    // Record learning evidence
    await query(
      `INSERT INTO learning_evidence (student_id, concept, subconcept, attempt_id, result)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        studentId,
        challenge.concept,
        challenge.subconcept,
        attemptRes.rows[0].id,
        evalResult.is_correct ? 'correct' : 'incorrect'
      ]
    );

    // Trigger gap detection
    const gap = await detectGap(studentId, challenge.concept, challenge.subconcept);

    // Phase 11: Auto attendance hook on assignment / code completion
    const { checkAttendance } = await import('../services/attendanceService.js');
    await checkAttendance(studentId, new Date(), 'assignment_completion');

    return res.json({
      evaluation: evalResult,
      attempt: attemptRes.rows[0],
      gap_detected: gap
    });
  } catch (err) {
    console.error('Code submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/code-lab/explain - Explain test failure using AI
router.post('/explain', requireAuth, async (req, res) => {
  try {
    const { challenge_id, code, error_message } = req.body;
    const cRes = await query('SELECT * FROM coding_challenges WHERE id = $1', [challenge_id]);
    if (cRes.rows.length === 0) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    const explanation = await generateExplanation(cRes.rows[0], code, error_message);
    return res.json({ explanation });
  } catch (err) {
    console.error('Explain error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
