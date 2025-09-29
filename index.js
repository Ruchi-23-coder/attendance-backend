const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'nodeuser',        // your MySQL username
  password: 'ruchi23',       // your MySQL password
  database: 'attendance_db',
  port: '3307',
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from('ruchi23\0')
  }
});

db.connect((err) => {
  if (err) {
    console.error("DB Error:", err);
  } else {
    console.log("DB Connected!");
  }
});