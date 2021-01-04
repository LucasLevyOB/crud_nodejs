// requires
const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

// instancias
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());

// Templates
app.set('view engine', 'ejs');

//Importações de CSS e JS
app.use('/css',express.static(__dirname+'/public/css'));
app.use('/js', express.static(__dirname+'/public/js'));
app.use('/img', express.static(__dirname+'/public/img'));
app.use('/fontawesome', express.static(__dirname+'/node_modules/@fortawesome/fontawesome-free'));

// autenticacao
app.use(session({
	secret: '123', // recomendado ser uma variavel de ambiente
	resave: false,
	saveUninitialized: false,
	cookie: { maxAge: 60 * 60 * 1000 }
}))
app.use(passport.initialize());
app.use(passport.session());

// requires de rotas

const login = require('./routes/login');
const index = require('./routes/index');
const products = require('./routes/products');
const search = require('./routes/search');
const update = require('./routes/update');
const deleteProducts = require('./routes/delete');
const create = require('./routes/create');
const report = require('./routes/report');
const logout = require('./routes/logout');
const notFound = require('./routes/notFound');

// rotas

app.use('/', index);
app.use('/login', login);
app.use('/index', index);
app.use('/produtos', products);
app.use('/pesquisar', search);
app.use('/update', update);
app.use('/delete', deleteProducts);
app.use('/AddProd', create);
app.use('/relatorio', report);
app.use('/sair', logout);
app.use('/erro', notFound);
app.use((req, res, next) => {
	res.redirect('/erro')
});

app.listen(3000, function (req,res) {
	console.log("Servidor funcionando.");
})
