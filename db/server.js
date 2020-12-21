const mysql = require('mysql');

const sql = mysql.createConnection({
	host:'localhost',
	user: 'lucaslevy',
	password: 'lucaslevy',
	port:3306

});
sql.query('use stock_system');
module.exports = sql;