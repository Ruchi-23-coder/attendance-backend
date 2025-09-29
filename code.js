// routes/code.js
const express = require('express');
const pool = require('../db');
const { teacherAuth } = require('../middleware/auth');

const router = express.Router();

function makeCode(len = 6) {
  return Math.random().toString(36).slice(-len).toUpperCase();
}

router.post('/generate', teacherAuth, async (req, res) => {
  try {
    const { class: className, subject, durationMinutes } = req.body;
    if (!className || !subject) return res.status(400).json({ error: 'Missing fields' });

    const code = makeCode(6);
    let expires_at = null;
    if (durationMinutes) {
      const d = new Date(Date.now() + parseInt(durationMinutes) * 60000);
      expires_at = d.toISOString().slice(0,19).replace('T',' ');
    }

    await pool.query(
      'INSERT INTO attendance_codes (teacher_id, class, subject, code, expires_at) VALUES (?, ?, ?, ?, ?)',
      [req.teacher.teacher_id, className, subject, code, expires_at]
    );

    res.json({ code, expires_at });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;