'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const pretty = require('pretty');
const cloudinary = require('cloudinary');
const multer = require('multer');

var upload = multer({ dest: 'public/temp/' });
var filePath = '';

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
	res.send(JSON.stringify({url: req.file.filename, size: req.file.size}));
});

app.get('/upload/confirm', function (req, res) {
	if (filePath !== '') {
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
	var oldHTML = fs.readFileSync("views/index.ejs", "utf8");
	
	require('jsdom/lib/old-api').env(oldHTML, [
	  ['http://code.jquery.com/jquery-3.3.1.min.js']
	],
	function(errors, window) {
		var $ = window.$;
		$(".jsdom").remove();
		
		for (var obj in req.body) {
			$('div[data-name="'+obj+'"]').html(req.body[obj]);
		}
		
		var newHTML = pretty("<!DOCTYPE html>\n<html>\n" + $("html").html() + "\n</html>", {ocd: true});
		fs.writeFile("views/index.ejs", newHTML, function(err) {
			if (err) {
				res.send("error");
				return console.log(err);
			}
			res.send("ok");
		});
	});
});

app.get('*', function(req, res) {
	res.render('404');
});

app.listen(3000, function() {
	console.log('EasyCMS listening on port 3000!')
});
