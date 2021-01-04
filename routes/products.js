const router = require('express').Router();
const authenticationMiddleware = require('../functions/authenticationMiddleware');
const { validationResult, param } = require('express-validator');
const sql = require('../db/server');

router.get("/:id?", authenticationMiddleware, function(req,res) {
	if (!req.params.id) {
		sql.query("select * from ss_products LIMIT 0, 10", function(err,results,fields) {
			res.render('products', {data: results, paginaAtual: '/produtos', info: req.flash('info'), result: req.flash('result')});
		});
	}else{
		sql.query("select * from ss_products where pro_id='"+req.params.id+"'", function(err,results,fields) {
			res.render('products', { info:'nada', result: 'nada' ,data: results, paginaAtual: '/produtos' });
		});
	}
});

router.get('/select/:offset/:quantityProducts', authenticationMiddleware, [
	param('offset').exists().notEmpty().isInt().isLength({ min: 1, max: 5 }).escape(),
	param('quantityProducts').exists().notEmpty().isInt().isLength({ min: 1, max: 5 }).escape()
], (req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		return res.json('Erros nos parametros');
	}
	sql.query(`SELECT * FROM ss_products LIMIT ${req.params.offset}, ${req.params.quantityProducts}`, (errors, results, fields) => {
		if(errors) {
			return res.json('Não foi possível realizar a consulta.');
		}
		if(results) {
			return res.json(results);
		}
		return res.json([]);
	});
});

module.exports = router;
