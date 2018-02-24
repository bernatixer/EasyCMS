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
const pretty = require('pretty');
const MongoClient = require('mongodb').MongoClient;

var db;
const DBurl = 'mongodb://localhost:27017';
const DBname = 'easycms';

const blank = '<div class="hero-body" id="web"><div data-editable="" data-name="header" class="container"><p>Change me!</p></div></div>';
const template = fs.readFileSync("include/template.html", "utf8");

var navbar = '';

var upload = multer({
	dest: 'public/temp/',
	fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'));
        }
        callback(null, true);
    },
	limits: {fileSize: 5000000}
});

var filePath = '';

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

const findTab = function(tab, callback) {
  const collection = db.collection('tabs');
  collection.findOne({ tab: tab }, function(err, docs) {
    if (err) console.log("Failed to find tab");
	callback(err, docs);
  });
}

const getWebInfo = function(name, callback) {
  const collection = db.collection('web');
  collection.findOne({ name: name }, function(err, docs) {
    if (err) console.log("Failed to find tab");
	callback(err, docs);
  });
}

const updateTab = function(tab, html, callback) {
	tab = replaceAll(tab, ' ', '%20');
	const collection = db.collection('tabs');
	collection.updateOne(
	{ tab : tab },
	{ $set: { "html": html } },
	{ upsert: true },
	function(err, result) {
		if (err) console.log("Failed to update");
		callback(err);
	});  
}

const updateNavbar = function(tabName, callback) {
	const collection = db.collection('web');
	
	jsdom.env(navbar, [
	  ['http://code.jquery.com/jquery-3.3.1.min.js']
	],
	function(errors, window) {
		var $ = window.$;
		$(".jsdom").remove();
		
		$('#navbarMenu').append('<a class="navbar-item" href="/'+tabName+'">'+tabName+'</a>');
		navbar = '<nav>'+$("nav").html()+'</nav>';
		collection.updateOne(
		{ name : "navbar" },
		{ $set: { "html": navbar } },
		{ upsert: true },
		function(err, result) {
			if (err) console.log("Failed to update");
			callback(err);
		});
	}); 
}

cloudinary.config({ 
  cloud_name: 'easycms', 
  api_key: '835622277612669', 
  api_secret: 'EPY2WeRXUwzaXpAEOK8VzuImiv0' 
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static('public'));

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
	if (url === '') url = 'home';
	url = replaceAll(url, ' ', '%20');
	delete req.body['__name__'];

	findTab(url, function(err, oldHTML) {
		jsdom.env('<section id="tabContent">'+oldHTML.html+'</section>', [
		  ['http://code.jquery.com/jquery-3.3.1.min.js']
		],
		function(errors, window) {
			var $ = window.$;
			$(".jsdom").remove();
			
			for (var obj in req.body) {
				$('div[data-name="'+obj+'"]').html(req.body[obj]);
			}
			
			updateTab(url, $("#tabContent").html(), function(err) {
				if (err) res.send("error");
				else res.send("ok");
			});
		});
	});
});

app.get('*', function(req, res) {
	console.log((req.url));
	var url = (req.url).substring(1);
	if (url === '') url = 'home';
	findTab(url, function(err, body) {
		if (!err && body) {
			getWebInfo("footer", function(err, footer) {
				getWebInfo("head", function(err, head) {
					var tab = template;
					tab = tab.replace('__HEAD__', head.html);
					tab = tab.replace('__NAVBAR__', navbar);
					tab = tab.replace('__SECTION__', body.html);
					tab = tab.replace('__FOOTER__', footer.html);
					tab = pretty(tab);
					res.send(tab);
				});
			});
		} else {
			res.sendFile(path.join(__dirname, '/public', '404.html'));
		}
	});
});

io.on('connection', function(socket) {
	socket.on('createTab', function(data) {

	updateTab(data.name, blank, function(err) {
		updateNavbar(data.name, function(err) {
			socket.emit('tabCreated');
		});
	});
  });
});

MongoClient.connect(DBurl, function(err, client) {
	if(err) throw err;
	
	console.log("Connected successfully to DB");
	db = client.db(DBname);
	
	getWebInfo("navbar", function(err, content) {
		navbar = content.html;
		server.listen(3000, function() {
			console.log('EasyCMS listening on port 3000!');
		});
	});
});
