// routes/export.js
const express = require('express');
const pool = require('../db');
const { teacherAuth } = require('../middleware/auth');
const ExcelJS = require('exceljs');

const router = express.Router();

router.get('/excel', teacherAuth, async (req, res) => {
  try {
    const { class: className, subject, from, to } = req.query;

    let q = `SELECT ar.marked_at, s.name as student_name, s.roll_no, ac.class, ac.subject
             FROM attendance_records ar
             JOIN students s ON ar.student_id = s.student_id
             JOIN attendance_codes ac ON ar.code_id = ac.code_id
             WHERE ac.teacher_id = ?`;
    const params = [req.teacher.teacher_id];

    if (className) { q += ' AND ac.class = ?'; params.push(className); }
    if (subject)   { q += ' AND ac.subject = ?'; params.push(subject); }
    if (from)      { q += ' AND ar.marked_at >= ?'; params.push(from); }
    if (to)        { q += ' AND ar.marked_at <= ?'; params.push(to); }
    q += ' ORDER BY ar.marked_at DESC';

    const [rows] = await pool.query(q, params);

    // Build Excel workbook
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Attendance');

    ws.columns = [
      { header: 'Marked At', key: 'marked_at', width: 25 },
      { header: 'Student Name', key: 'student_name', width: 30 },
      { header: 'Roll No', key: 'roll_no', width: 20 },
      { header: 'Class', key: 'class', width: 20 },
      { header: 'Subject', key: 'subject', width: 25 },
    ];

    rows.forEach(r => ws.addRow(r));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=attendance.xlsx`);
    await wb.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
