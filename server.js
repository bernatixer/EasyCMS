const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsdom = require('jsdom');
const fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static('public'));

/*
app.get('*', function(req, res) {
	res.sendFile('public/404.html');
});
*/

app.post('/save-my-page', function(req, res) {
	var htmlSource = fs.readFileSync("public/index.html", "utf8");
	
	require('jsdom/lib/old-api').env(htmlSource, [
	  ['http://code.jquery.com/jquery-1.5.min.js']
	],
	function(errors, window) {
		var $ = window.$;
		$("#title").text('Hello!');
		$(".jsdom").remove();
		fs.writeFile("public/index.html", "<html>\n" + $("html").html() + "\n</html>", function(err) {
			if(err) return console.log(err);
			console.log("The file was saved!");
		});
	});
	
	/*for (obj in req.body) {
		console.log(obj + ': ' + req.body[obj]);
	}*/
	res.send('200');
});

app.listen(3000, function() {
	console.log('Example app listening on port 3000!')
});
