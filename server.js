const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static('public'));

app.get('/', function(req, res) {
	res.sendFile('/index.html');
});

app.post('/save-my-page', function(req, res) {
	console.log(req.body);
	for (obj in req.body) {
		console.log(obj);
	}
	res.send('200');
});

app.listen(3000, function() {
	console.log('Example app listening on port 3000!')
});
