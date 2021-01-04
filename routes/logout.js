const router = require('express').Router();
const authenticationMiddleware = require('../functions/authenticationMiddleware');

router.get("/", authenticationMiddleware, function(req,res) {
	req.logout();
  	res.redirect('/login');
});

module.exports = router;
