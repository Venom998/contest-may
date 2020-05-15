var mysql = require('mysql2');
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var fs = require('fs');
var port = process.env.PORT || 3000;

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(port);

const conn = mysql.createConnection({
	database: "soft0018",
	host: "pgsha.ru",
	port: 35006,
	user: "soft0018",
	password: "d14qGle5"
});
conn.connect(function(err){
	if (err) {
			return console.error("Ошибка: " + err.message);
	}
	else{
			console.log("Подключение к серверу MySQL успешно установлено");
	}
});
// conn.end(function(err) {
// 	if (err) {
// 			return console.log("Ошибка: " + err.message);
// 	}
// 	console.log("Подключение закрыто");
// });
//--------------

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');//
app.set('views', './views');//указание директории с доступными страницами
app.get('/', (req, res)=>{
	if (req.session.loggedin) {
		res.redirect('index');
	}
	else res.render('login');
});
app.get('/index', (req, res)=>{
	if (req.session.loggedin) {
		conn.query('SELECT * FROM tasks', function(error, results) {
			
			if (results.length > 0) {
				req.session.tasks = results;
			}
			res.render('index', {
				username: req.session.username,
				idaccount: req.session.idaccount,
				tasks: req.session.tasks
			});
		});
		
	} else {
		// res.send('Please login to view this page!');
		res.render('login');
	}
	
});
app.get('/contest-page/:ids', (req, res)=>{
	var ids = req.params.ids;
	if (req.session.loggedin) {
		conn.query('SELECT * FROM tasks', function(error, results) {
			
			if (results.length > 0) {
				req.session.tasks = results;
			}
			res.render('contest-page', {
				username: req.session.username,
				contestid: ids,
				idaccount: req.session.idaccount,
				tasks: req.session.tasks
			});
		});
		
	} else {
		// res.send('Please login to view this page!');
		res.render('login');
	}
	
});
app.post('/exit', function(req, res){
	req.session.destroy();
	res.redirect('/');
});
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		conn.query('SELECT * FROM accounts WHERE username = ? AND password = ? LIMIT 1', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				// console.log(results);
				// console.log(results[0].id);
				request.session.loggedin = true;
				request.session.username = username;
				request.session.idaccount = results[0].id;
				response.redirect('index');
			} else {
				// response.send('Incorrect Username and/or Password!');
				res.render('login');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});


io.on('connection', function(socket) {
	console.log('client add');
	socket.on('txt', data => {
		console.log(data);
	});
});



const { exec } = require("child_process");

exec("py scripts/test_py.py < input.txt",{timeout: 3000}, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(stdout);
    if (stdout=='5') {
        console.log("Тест пройден");
    } else{
        console.log("Тест не пройден");
    }
});