// requires
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('./db/server');
const pdf = require('html-pdf');
const { body, validationResult, param } = require('express-validator');
const fs = require('fs');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
require('./auth')(passport);

// instancias
const app = express();
const urlencodeParser = bodyParser.urlencoded({extended:false});

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

// nao autenticado
function authenticationMiddleware(req, res, next) {
	if(req.isAuthenticated()) return next();
	res.redirect('/login');
}

//Rotas
app.get("/", function(req,res) {
	// res.sendFile(__dirname + '/views/login.handlebars');
	res.redirect('/index');
});

app.get("/login", function(req,res) {
	res.render('login', { info: req.flash('info'), result: req.flash('result')});
	// res.render('login', { message: req.flash() });
});

app.get("/index", authenticationMiddleware, function(req,res) {
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
app.get("/produtos/:id?", authenticationMiddleware, function(req,res) {
	if (!req.params.id) {
		sql.query("select * from ss_products LIMIT 0, 10", function(err,results,fields) {
			// res.render('index', {data: results});
			res.render('products', {data: results, paginaAtual: '/produtos', info: req.flash('info'), result: req.flash('result')});
		});
	}else{
		sql.query("select * from ss_products where pro_id='"+req.params.id+"'", function(err,results,fields) {
			res.render('products', { info:'nada', result: 'nada' ,data: results, paginaAtual: '/produtos' });
			// res.render('index', {data: results});
		});
	}
});

// app.get("/login", function(req,res) {
// 	res.render('login', {info: req.flash('info'), result: req.flash('result')});
// });

// app.get("/update/:id", function(req,res){
// 	sql.query("select * from ss_products where pro_id ='"+req.params.id+"'", function(err,results,fields) {
// 		res.render('update', {pro_id:req.params.id,pro_name:results[0].pro_name,pro_price:results[0].pro_price,pro_quantity:results[0].pro_quantity,pro_solds:results[0].pro_solds, paginaAtual: '/produtos', message: req.flash('message') });
// 	});

app.get('/products/select/:offset/:quantityProducts', authenticationMiddleware, [
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
app.get('/update/:id', authenticationMiddleware, [
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

app.get("/AddProd", authenticationMiddleware, function(req,res) {
	paginaAtual = "/AddProd";
	res.render('AddProd', { paginaAtual: '/AddProd', result: req.flash('result'), info: req.flash('info') });
	
});

app.get('/delete/:id', authenticationMiddleware, [
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
app.get('/relatorio', authenticationMiddleware, (request, response) => {
	// response.render(`table`);
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
			// pdf.create(htmlPage, options).toFile('./uploads/relatorio_de_produtos.pdf', (error, responseToFile) => {
			// 	if(!error) {
			// 		response.redirect('/downloadPdf');
			// 		return response.status(201);
			// 	}
			// 	return response.status(500);
			// });
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


app.get("/sair", authenticationMiddleware, function(req,res) {
	req.logout();
  	res.redirect('/login');
});
// app.get('/downloadPdf3', (request, response) => {
// 	const tempFile = './uploads/relatorio_de_produtos.pdf';
// 	fs.readFile(tempFile, (error, data) => {
// 		response.contentType('application/pdf');
// 		response.send(data);
// 	});
// });

// app.post("/update", urlencodeParser, function(req,res){
// 	sql.query("update ss_products set pro_name='"+req.body.pro_name+"',pro_price='"+req.body.pro_price+"', pro_quantity='"+req.body.pro_quantity+"', pro_solds='"+req.body.pro_solds+"' where pro_id='"+req.body.pro_id+"'");
// 	// res.render('ConfirmEdit');
// 	paginaAtual = "/update";
// 	res.redirect('/produtos');

// });

// app.get("/AddProd/:id?", function(req,res) {
// 	if (!req.params.id) {
// 		res.render('AddProd');
// 	}else{
// 		console.log(req.params.id);
// 		res.render('AddProd',{pro_id:req.params.id});
// 	}
// });

// app.post("/index", urlencodeParser, function(req,res){
// 	if ((req.body.user == "admin") && (req.body.password) == "admin"){
// 		paginaAtual = "/index";
// 		res.redirect('/index');
// 	}else{
// 		res.redirect('/login');
// 	}
// });
// app.post("/index", [
// 	body('user').exists().notEmpty().escape().isString(),
// 	body('password').exists().notEmpty().escape()
// ], (req,res) => {
// 	const errors = validationResult(req);
// 	if(!errors.isEmpty()) {
// 		req.flash('message', errors.array());
// 		req.redirect('/');
// 		return false;
// 	}
// 	if ((req.body.user == "admin") && (req.body.password) == "admin"){
// 		res.redirect('/index');
// 		return false;
// 	}else{
// 		req.flash('message', 'Combinação usuário e senha icorretos.');
// 		res.redirect('/login');
// 		return false;
// 	}
// });
app.post("/login", [
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

// app.post("/login", passport.authenticate('local', {
// 	successRedirect: '/index',
// 	failureRedirect: '/login'
// }));
// app.post("/AddProd", urlencodeParser, function(req,res){
// 	sql.query("insert into ss_products(pro_name,pro_price,pro_quantity) values('"+req.body.name+"', '"+req.body.price+"', '"+req.body.quantity+"')", function(err,results,fields) {
// 		if(err != null ){
// 			console.log("Deu errado");
// 		}else{
// 			res.render('AddProd', {result: 'toast-add', paginaAtual:'AddProd'});
// 			return false;
// 		}
// 	});
// });
app.post('/update', authenticationMiddleware, [
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

app.post('/AddProd', authenticationMiddleware, [
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

// app.use(function(req, res, next) {
// 	var err = new Error('Not Found');
// 	err.status = 404;
// 	next(err);
// });

app.get('/erro', (req, res) => {
	res.render('error');
});
app.use((req, res, next) => {
	res.redirect('/erro')
});

app.listen(3000, function (req,res) {
	console.log("Servidor funcionando.");
})