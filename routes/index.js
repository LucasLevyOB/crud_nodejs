const router = require('express').Router();
const authenticationMiddleware = require('../functions/authenticationMiddleware');
const sql = require('../db/server');

router.get("/", authenticationMiddleware, function(req,res) {
	sql.query("SELECT pro_id, pro_name, (pro_quantity-pro_solds) AS rest FROM ss_products WHERE (pro_quantity-pro_solds) <= 15 ORDER BY rest ASC;", (error, results, fields) => {
		if(error) {
			res.render('index', {message: 'Desculpe houve um erro interno.', paginaAtual: '/index'});
			return false;
		}
		if(results[0]) {
			res.render('index', {data: results, paginaAtual: '/index'});
			return false;
		}
		res.render('index', {message: 'Nenhum produto está perto de se esgotar!', paginaAtual: '/index'});
	});
});

module.exports = router;
