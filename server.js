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
	res.render('login');
});
app.get('/index', (req, res)=>{
	res.render('index');
});
app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
	if (username && password) {
		conn.query('SELECT * FROM accounts WHERE username = ? AND password = ? LIMIT 1', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('index');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
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