// requires
const express = require('express');
const bodyParser = require('body-parser');
const sql = require('./db/server');
const pdf = require('html-pdf');
const { body, validationResult } = require('express-validator');
const fs = require('fs');

var paginaAtual;
// instancias
const app = express();
const urlencodeParser = bodyParser.urlencoded({extended:false});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Templates
app.set('view engine', 'ejs');
// app.engine("handlebars", handlebars({defaultLayout:'main'}));
// app.set('view engine', 'handlebars');

//Importações de CSS e JS
app.use('/css',express.static(__dirname+'/public/css'));
app.use('/js', express.static(__dirname+'/public/js'));
app.use('/img', express.static(__dirname+'/public/img'));
app.use('/fontawesome', express.static(__dirname+'/node_modules/@fortawesome/fontawesome-free'));

//Rotas
app.get("/products/select/:offset/:quantityProducts", function(req,res) {
	// res.sendFile(__dirname + '/views/login.handlebars');
	const offset = req.params.offset;
	const quantityProducts = req.params.quantityProducts;
	sql.query(`SELECT * FROM ss_products LIMIT ${offset}, ${quantityProducts}`, function(err,results,fields) {
		// res.render('index', {data: results});
		return res.json(results);
		// res.render('index', {data: results, paginaAtual: '/index'});
	});
	// res.render('login');
});
app.get("/SystemStock", function(req,res) {
	// res.sendFile(__dirname + '/views/login.handlebars');
	res.render('login');
});

app.get("/index/:id?", function(req,res) {
	if (!req.params.id) {
		sql.query("select * from ss_products", function(err,results,fields) {
			// res.render('index', {data: results});
			res.render('index', {data: results, paginaAtual: '/index'});
		});
	}else{
		sql.query("select * from ss_products where pro_id='"+req.params.id+"'", function(err,results,fields) {
			res.render('index', {data: results, paginaAtual: '/index'});
			// res.render('index', {data: results});
		});
	}
});
app.get("/produtos/:id?", function(req,res) {
	if (!req.params.id) {
		sql.query("select * from ss_products LIMIT 0, 10", function(err,results,fields) {
			// res.render('index', {data: results});
			res.render('products', {data: results, paginaAtual: '/produtos'});
		});
	}else{
		sql.query("select * from ss_products where pro_id='"+req.params.id+"'", function(err,results,fields) {
			res.render('products', {data: results, paginaAtual: '/produtos'});
			// res.render('index', {data: results});
		});
	}
});

app.get("/login", function(req,res) {
	res.render('login');
});

app.get("/update/:id", function(req,res){
	sql.query("select * from ss_products where pro_id ='"+req.params.id+"'", function(err,results,fields) {
		res.render('update', {pro_id:req.params.id,pro_name:results[0].pro_name,pro_price:results[0].pro_price,pro_quantity:results[0].pro_quantity,pro_solds:results[0].pro_solds, paginaAtual: '/update'});
	});
	
})

app.get("/AddProd", function(req,res) {
	paginaAtual = "/AddProd";
	res.render('AddProd', {paginaAtual: '/AddProd', result: 'toast'});
	
});

app.post("/update", urlencodeParser, function(req,res){
	sql.query("update ss_products set pro_name='"+req.body.pro_name+"',pro_price='"+req.body.pro_price+"', pro_quantity='"+req.body.pro_quantity+"', pro_solds='"+req.body.pro_solds+"' where pro_id='"+req.body.pro_id+"'");
	// res.render('ConfirmEdit');
	paginaAtual = "/update";
	res.redirect('/produtos');

});

// app.get("/AddProd/:id?", function(req,res) {
// 	if (!req.params.id) {
// 		res.render('AddProd');
// 	}else{
// 		console.log(req.params.id);
// 		res.render('AddProd',{pro_id:req.params.id});
// 	}
// });

app.post("/index", urlencodeParser, function(req,res){
	if ((req.body.user == "admin") && (req.body.password) == "admin"){
		paginaAtual = "/index";
		res.redirect('/index');
	}else{
		res.redirect('/login');
	}
});
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
app.post('/AddProd', [
	body('name').isString().isLength({min: 3, max: 200}).trim().escape(),
	body('price')
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
	body('quantity').isInt().isLength({ min: 1, max: 2 })
], (req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		res.render('AddProd', { message: errors.array(), paginaAtual: 'AddProd' });
		return false;
	}
	sql.query("INSERT INTO ss_products(pro_name, pro_price, pro_quantity) VALUES(?, ?, ?)", [req.body.name, req.body.price, req.body.quantity], (error, result, fields) => {
		if(error) {
			res.render('AddProd', { message: 'Erro ao cadastrar.', paginaAtual: 'AddProd' });
			return false;
		}
		if(result.affectedRows >= 1) {
			res.render('AddProd', { message: 'Cadastrado com sucesso!', paginaAtual: 'AddProd' });
			return false;
		}
		res.render('AddProd', { message: 'Erro ao cadastrar.', paginaAtual: 'AddProd' });
	});
});
app.get('/delete/:id', function(req,res) {
	sql.query("delete from ss_products where pro_id='"+req.params.id+"'");
	res.redirect('/produtos');
});
app.get('/relatorio', (request, response) => {
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


app.get("/sair", function(req,res) {
	res.redirect('login');
});
// app.get('/downloadPdf3', (request, response) => {
// 	const tempFile = './uploads/relatorio_de_produtos.pdf';
// 	fs.readFile(tempFile, (error, data) => {
// 		response.contentType('application/pdf');
// 		response.send(data);
// 	});
// });

app.listen(3000, function (req,res) {
	console.log("Servidor funcionando.");
})