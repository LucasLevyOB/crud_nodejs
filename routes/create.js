const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const sql = require('../db/server');
const authenticationMiddleware = require('../functions/authenticationMiddleware');

router.get("/", authenticationMiddleware, function(req,res) {
	res.render('AddProd', { paginaAtual: '/AddProd', result: req.flash('result'), info: req.flash('info') });
});

router.post('/', authenticationMiddleware, [
	body('name').exists().notEmpty().isString().isLength({min: 3, max: 200}).trim().escape(),
	body('price').exists().notEmpty()
		.customSanitizer((value, { req }) => {
			return req.body.price.replace(',', '.');
		})
		.customSanitizer((value, { req }) => {
			if(req.body.price.indexOf('.') > 5) {
				return req.body.price.slice(0, 5);
			}
			return req.body.price;
		})
		.customSanitizer((value, { req }) => {
			if(req.body.price.indexOf('.') === -1 && req.body.price.length > 5) {
				return req.body.price.slice(0, 5);
			}
			return req.body.price;
		})
		.isFloat().isLength({ min: 1, max: 8 }),
	body('quantity').exists().notEmpty().isInt().isLength({ min: 1, max: 5 })
], (req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		req.flash('result', 'toast-error');
		req.flash('info', errors.array());
		res.redirect('/AddProd');
		return false;
	}
	sql.query("INSERT INTO ss_products(pro_name, pro_price, pro_quantity) VALUES(?, ?, ?)", [req.body.name, req.body.price, req.body.quantity], (error, results, fields) => {
		if(error) {
			req.flash('result', 'toast-error');
			req.flash('info', 'Erro ao cadastrar o produto!!');
			res.redirect('/AddProd');
			return false;
		}
		if(results.affectedRows >= 1) {
			req.flash('result', 'toast-success');
			req.flash('info', 'Produto cadastrado com sucesso!!');
			res.redirect('/AddProd');
			return false;
		}
		req.flash('result', 'toast-error');
		req.flash('info', 'Erro ao cadastrar o produto!!');
		res.redirect('/AddProd');
	});
});

module.exports = router;
