// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

function teacherAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid Authorization header' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.teacher = payload; // contains teacher_id, email, name (if you signed like that)
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { teacherAuth };