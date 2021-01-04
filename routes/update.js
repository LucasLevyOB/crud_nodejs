const router = require('express').Router();
const { body, validationResult, param } = require('express-validator');
const sql = require('../db/server');
const authenticationMiddleware = require('../functions/authenticationMiddleware');

router.get('/:id', authenticationMiddleware, [
	param('id').exists().notEmpty().isInt().isLength({ min: 1, max: 5 }).escape()
], (req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		req.flash('result','toast-error');
		req.flash('info', 'Parametro inválido.')
		res.redirect('/produtos');
		return false;
	}
	sql.query("SELECT * FROM ss_products WHERE pro_id = ?", [req.params.id], (errors, results, fields) => {
		if(errors) {
			req.flash('result', 'toast-error');
			req.flash('info', 'Não foi possível selecionar o produto.')
			res.redirect('/produtos');
			return false;
		}
		if(results) {
			res.render('update', {
				pro_id:req.params.id,
				pro_name:results[0].pro_name,
				pro_price:results[0].pro_price,
				pro_quantity:results[0].pro_quantity,
				pro_solds:results[0].pro_solds,
				paginaAtual: '/produtos',
				result: req.flash('result'),
				info: req.flash('info') 
			});
			return false;
		}
		req.flash('result', 'toast-error');
		req.flash('info', 'Não foi possível selecionar o produto.')
		res.redirect('/produtos');
	});
});

router.post('/', authenticationMiddleware, [
	body('id').exists().notEmpty().isInt().isLength({ min: 1, max: 5 }),
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
	body('quantity').exists().notEmpty().isInt().isLength({ min: 1, max: 5 }),
	body('solds').exists().notEmpty().isInt().isLength({ min: 1, max: 5 })
], (req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		req.flash('result', 'toast-error');
		req.flash('info', errors.array());
		res.redirect(`/update/${req.body.id}`)
		return false;
	}
	sql.query("UPDATE ss_products SET pro_name = ?, pro_price = ?, pro_quantity = ?, pro_solds = ? WHERE pro_id = ?", [req.body.name, req.body.price, req.body.quantity, req.body.solds, req.body.id], (error, results, fields) => {
		if(error) {
			req.flash('result', 'toast-error');
			req.flash('info', 'Não foi possível atualizar o produto.');
			res.redirect(`/update/${req.body.id}`)
			return false;
		}
		if(results.affectedRows >= 1) {
			req.flash('result', 'toast-success');
			req.flash('info', 'Produto atualizado com sucesso!');
			res.redirect(`/update/${req.body.id}`)
			return false;
		}
		req.flash('result', 'toast-error');
		req.flash('info', 'Não foi possível atualizar o produto.');
		res.redirect(`/update/${req.body.id}`)
	});
});

module.exports = router;