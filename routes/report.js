const router = require('express').Router();
const pdf = require('html-pdf');
const sql = require('../db/server');
const fs = require('fs');
const authenticationMiddleware = require('../functions/authenticationMiddleware');

router.get('/', authenticationMiddleware, (request, response) => {
	const date = new Date();
	const day = date.getDate() < 10 ? '0' + date.getDate() :  date.getDate();
	const month = date.getMonth() < 10 ? '0' + date.getMonth() :  date.getMonth();
	const formattedDate = `${day}/${month + 1}/${date.getFullYear()}`;
	sql.query("select * from ss_products", function(err,results,fields) {
		response.render('table', {data: results, hoursMinutes: `${date.getHours()}:${date.getMinutes()}`, date: formattedDate}, (error, htmlPage) => {
			if(error) {
				return response.status(500);
			}
			const options = {
				format: 'A4'
			}
			pdf.create(htmlPage, options).toBuffer((error, responseToFile) => {
				if(!error) {
					response.contentType('application/pdf');
					response.send(responseToFile);
					return response.status(201);
				}
				return response.status(500);
			});
		});
	});
});

module.exports = router;
