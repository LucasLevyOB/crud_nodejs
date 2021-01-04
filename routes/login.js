const router = require('express').Router();
const passport = require('passport');
require('../auth')(passport);
const { body, validationResult } = require('express-validator');

router.get("/", function(req,res) {
	res.render('login', { info: req.flash('info'), result: req.flash('result')});
	// res.render('login', { message: req.flash() });
});

router.post("/", [
	body('user').exists().notEmpty().escape().isString(),
	body('password').exists().notEmpty().escape()
], (req, res, next) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		req.flash('result', 'toast-error');
		req.flash('info', errors.array());
		res.redirect('/login');
		return false;
	}
	next();
}, passport.authenticate('local', {
	successRedirect: '/index',
	failureRedirect: '/login',
	failureFlash: true
}));

module.exports = router;
