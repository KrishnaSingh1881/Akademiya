import express from 'express';
import { query } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.user.id]);
    return res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('Settings get error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const result = await query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role, created_at',
      [name.trim(), req.user.id]
    );
    return res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('Settings put error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
