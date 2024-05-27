const mysql = require('mysql2');
require('dotenv').config();
// Connect to database
const db = mysql.createConnection(
	{
		host: 'localhost',
		user: process.env.DB_USER,
		database: 'employee_db',
		password: process.env.DB_PASSWORD,
	},
);

db.connect((err) => {
	if (err) {
		console.error('Database connection failed: ' + err.stack);
		return;
	}
	console.info('Connection to employee_db successful.');
});

module.exports = db;
