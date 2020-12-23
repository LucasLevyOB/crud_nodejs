const mysql = require('mysql');

const sql = mysql.createConnection({
	host:'localhost',
	user: 'root',
	password: '',
	port:3306

});
sql.query('use stock_system');
module.exports = sql;