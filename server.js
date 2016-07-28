var app = require('express')();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(process.env.PORT || 80, function () {
	if (process.env.PORT) {
		console.log('Example app listening on port' + process.env.PORT + '!');
	}
	if (80) {
		console.log('Example app listening on port 80!');
	}
});