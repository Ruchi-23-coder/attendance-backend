// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.js');
const codeRoutes = require('./routes/code.js');
const attendanceRoutes = require('./routes/attendance.js');
const exportRoutes = require('./routes/export.js');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/teacher', codeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/export', exportRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

