const router = require('express').Router();
const authenticationMiddleware = require('../functions/authenticationMiddleware');
const { validationResult, param } = require('express-validator');
const sql = require('../db/server');

router.get('/:id', authenticationMiddleware, [
	param('id').exists().notEmpty().isInt().isLength({ min: 1, max: 5 }).escape()
], (req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		req.flash('result', 'toast-error');
		req.flash('info', 'Parametro inválido.');
		res.redirect('/produtos');
		return false;
	}
	sql.query("DELETE FROM ss_products WHERE pro_id = ?", [req.params.id], (errors, results, fields) => {
		if(errors) {
			req.flash('result', 'toast-error');
			req.flash('info', 'Não foi possível deletar o produto.');
			res.redirect('/produtos');
			return false;
		}
		if(results.affectedRows >= 1) {
			req.flash('result', 'toast-success');
			req.flash('info', 'Produto deletado com sucesso!');
			res.redirect('/produtos');
			return false;
		}
		req.flash('result', 'toast-error');
		req.flash('info', 'Não foi possível deletar o produto.');
		res.redirect('/produtos');
	});
});

module.exports = router;
