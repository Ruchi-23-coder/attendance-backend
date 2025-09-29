// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();

// Register teacher
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if(!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    const [exists] = await pool.query('SELECT teacher_id FROM teachers WHERE email = ?', [email]);
    if (exists.length) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO teachers (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login teacher
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const [rows] = await pool.query('SELECT teacher_id, name, password_hash FROM teachers WHERE email = ?', [email]);
    if(!rows.length) return res.status(400).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if(!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ teacher_id: user.teacher_id, email, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRES_IN });
    res.json({ token, teacher: { teacher_id: user.teacher_id, name: user.name, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
