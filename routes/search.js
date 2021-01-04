const router = require('express').Router();

router.get('/', (req, res) => {
    res.render('search', { info:'nada', result: 'nada', paginaAtual: '/pesquisar' })
});

module.exports = router;
