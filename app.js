// requires
const express = require('express');
const bodyParser = require('body-parser');
// const handlebars = require('express-handlebars');
const sql = require('./db/server');
const pdf = require('html-pdf');
const fs = require('fs');

var paginaAtual;
// instancias
const app = express();
const urlencodeParser = bodyParser.urlencoded({extended:false});

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
app.get("/SystemStock", function(req,res) {
	// res.sendFile(__dirname + '/views/login.handlebars');
	res.render('login');
});

app.get("/index/:id?", function(req,res) {
	if (!req.params.id) {
		sql.query("select * from ss_products", function(err,results,fields) {
			// res.render('index', {data: results});
			res.render('index', {data: results});
		});
	}else{
		sql.query("select * from ss_products where pro_id='"+req.params.id+"'", function(err,results,fields) {
			res.render('index', {data: results});
			// res.render('index', {data: results});
		});
	}
});

app.get("/login", function(req,res) {
	res.render('login');
});

app.get("/update/:id", function(req,res){
	sql.query("select * from ss_products where pro_id ='"+req.params.id+"'", function(err,results,fields) {
		res.render('update', {pro_id:req.params.id, pro_name:results[0].pro_name,pro_price:results[0].pro_price,pro_quantity:results[0].pro_quantity,pro_solds:results[0].pro_solds});
	});
	
})

app.get("/AddProd", function(req,res) {
	paginaAtual = "/AddProd";
	res.render('AddProd');
	
});

app.post("/update", urlencodeParser, function(req,res){
	sql.query("update ss_products set pro_name='"+req.body.pro_name+"',pro_price='"+req.body.pro_price+"', pro_quantity='"+req.body.pro_quantity+"', pro_solds='"+req.body.pro_solds+"' where pro_id='"+req.body.pro_id+"'");
	// res.render('ConfirmEdit');
	paginaAtual = "/update";
	res.redirect('/index');

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
app.post("/AddProd", urlencodeParser, function(req,res){
	sql.query("insert into ss_products(pro_name,pro_price,pro_quantity) values('"+req.body.name+"', '"+req.body.price+"', '"+req.body.quantity+"')");
	res.redirect('/AddProd');

});
app.get('/delete/:id', function(req,res) {
	sql.query("delete from ss_products where pro_id='"+req.params.id+"'");
	res.redirect('/index');
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