// routes/attendance.js
const express = require('express');
const pool = require('../db');

const router = express.Router();

// Student marks attendance using: name, roll_no, class, code
router.post('/mark', async (req, res) => {
  try {
    const { name, roll_no, class: className, code } = req.body;
    if(!name || !roll_no || !className || !code) return res.status(400).json({ error: 'Missing fields' });

    // find code
    const [codeRows] = await pool.query('SELECT * FROM attendance_codes WHERE code = ?', [code]);
    if(!codeRows.length) return res.status(400).json({ error: 'Invalid code' });

    const c = codeRows[0];

    // check expiry
    if(c.expires_at && new Date() > new Date(c.expires_at)) return res.status(400).json({ error: 'Code expired' });

    // find or create student
    const [sRows] = await pool.query('SELECT student_id FROM students WHERE roll_no = ? AND class = ?', [roll_no, className]);
    let studentId;
    if (sRows.length) studentId = sRows[0].student_id;
    else {
      const [ins] = await pool.query('INSERT INTO students (name, roll_no, class) VALUES (?, ?, ?)', [name, roll_no, className]);
      studentId = ins.insertId;
    }

    // prevent duplicates (unique constraint handles it)
    try {
      await pool.query('INSERT INTO attendance_records (student_id, code_id) VALUES (?, ?)', [studentId, c.code_id]);
      res.json({ message: 'Attendance marked' });
    } catch (err) {
      // likely duplicate entry
      return res.status(400).json({ error: 'Already marked' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;