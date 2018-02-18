'use strict';

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const fs = require('fs');
const jsdom = require('jsdom/lib/old-api');
const cloudinary = require('cloudinary');
const multer = require('multer');
const sizeOf = require('image-size');
const path = require('path');

var upload = multer({
	dest: 'public/temp/',
	fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
	limits: {fileSize: 5000000}
});

var filePath = '';

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

cloudinary.config({ 
  cloud_name: 'easycms', 
  api_key: '835622277612669', 
  api_secret: 'EPY2WeRXUwzaXpAEOK8VzuImiv0' 
});

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static('public'));

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/upload', upload.single('image'), function (req, res) {
	filePath = req.file.path;
	var dim = sizeOf(filePath);
	res.send(JSON.stringify({url: req.file.filename, size: [dim.width, dim.height]}));
});

app.get('/upload/confirm', function (req, res) {
	if (filePath != '') {
		cloudinary.uploader.upload(filePath, function(result) {
			res.send(result.secure_url);
			fs.unlink(filePath);
			filePath = '';
		});
	} else {
		res.sendStatus(200);
	}
});

app.get('/upload/cancel', function (req, res) {
	if (filePath !== '') fs.unlink(filePath);
	filePath = '';
	res.sendStatus(200);
});

app.post('/save-my-page', function(req, res) {
	var url = (req.body['__name__']).substring(1);
	if (url === '') url = 'index';
	url = replaceAll(url, ' ', '%20');
	delete req.body['__name__'];
	var oldHTML = fs.readFileSync("views/"+url+".ejs", "utf8");
	
	jsdom.env(oldHTML, [
	  ['http://code.jquery.com/jquery-3.3.1.min.js']
	],
	function(errors, window) {
		var $ = window.$;
		$(".jsdom").remove();
		
		for (var obj in req.body) {
			$('div[data-name="'+obj+'"]').html(req.body[obj]);
		}
		
		fs.writeFile("views/"+url+".ejs", "<!DOCTYPE html>\n<html>\n" + $("html").html() + "\n</html>", function(err) {
			if (err) {
				res.send("error");
				return console.log(err.stack);
			}
			res.send("ok");
		});
	});
});

app.get('*', function(req, res) {
	if (fs.existsSync('views'+req.url+'.ejs')) {
		res.render((req.url).substring(1));
	} else {
		res.render('404');
	}
});

io.on('connection', function(socket) {
  socket.on('createTab', function(data) {
	  
	var blank = fs.readFileSync("views/include/blank.ejs", "utf8");
	
	jsdom.env(blank, [
	  ['http://code.jquery.com/jquery-3.3.1.min.js']
	],
	function(errors, window) {
		var $ = window.$;
		$(".jsdom").remove();
		
		$('#navbarItem').append('<a class="navbar-item">'+data.name+'</a>');
		
		fs.writeFile("views/"+data.name+".ejs", "<!DOCTYPE html>\n<html>\n" + $("html").html() + "\n</html>", function(err) {
			if (err) {
				return console.log(err.stack);
			}
			socket.emit('tabCreated');
		});
	});
  });
});

server.listen(3000, function() {
	console.log('EasyCMS listening on port 3000!')
});
