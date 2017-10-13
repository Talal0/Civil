// Defining log features
var data = { 'app': [], 'nav': [], 'id': [], 'gps': [], 'http': [], 'promise': [], 'apiDataMgr': [], 'memory': [], 'dialog': [], 'map': [] };

// Methods
var getTime = function() {

	var arr = [];
	var now = new Date();
	
	arr[0] = now.getHours();
	arr[1] = now.getMinutes();
	arr[2] = now.getSeconds();

	for (var i = 0; i < arr.length; ++i) {
		if (String(arr[i]).length == 1) { arr[i] = '0' + arr[i]; }
	}

	return arr[0] + ':' + arr[1] + ':' + arr[2];
};
var registerRoutes = function(route) {

	app.get('/' + route, function(req, res) {
		res.header('Content-Type','application/json');
		res.send(JSON.stringify(data[route], null, 4));
	});

	app.post('/' + route, function(req, res) {

		if (Object.keys(req.body).length > 0) {
			req.body[0] = getTime();
			data[route].push(req.body);
			console.log(getTime(), '-> /' + route + ' -> log data received');

		} else {
			data[route] = [];
			console.log(getTime(), '-> /' + route + ' -> log data reset');
		}

		res.end();
	});
};

// Main
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json({}));

var routes = Object.keys(data);
for (var i = 0; i < routes.length; ++i) { registerRoutes(routes[i]); }

var server = app.listen(7100, function () {
	console.log(getTime(), '-> Node listening -> port: ' + server.address().port);
});