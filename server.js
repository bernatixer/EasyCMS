const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsdom = require('jsdom');
const fs = require('fs');
const pretty = require('pretty');

app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static('public'));

app.get('/', function(req, res) {
	res.render('index');
});
app.get('*', function(req, res) {
	res.render('404');
});

app.post('/save-my-page', function(req, res) {
	var oldHTML = fs.readFileSync("views/index.ejs", "utf8");
	
	require('jsdom/lib/old-api').env(oldHTML, [
	  ['http://code.jquery.com/jquery-3.3.1.min.js']
	],
	function(errors, window) {
		var $ = window.$;
		$(".jsdom").remove();
		
		for (obj in req.body) {
			$('div[data-name="'+obj+'"]').html(req.body[obj]);
		}
		
		var newHTML = pretty("<html>\n" + $("html").html() + "\n</html>", {ocd: true});
		fs.writeFile("views/index.ejs", newHTML, function(err) {
			if(err) {
				res.send('500');
				return console.log(err);
			}
			res.send('200');
		});
	});
});

app.listen(3000, function() {
	console.log('EasyCMS listening on port 3000!')
});
