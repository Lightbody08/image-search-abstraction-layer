var app = require('express')();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var mongoURL = process.env.MONGOLAB_URI;
var bingAPI = process.env.BING_API_KEY;
var Search = require('bing.search');

var search = new Search(bingAPI);

app.get('/imagesearch/:image', searchImages);

function searchImages (req, res) {
	var requestedImg = req.params.image;
	search.images(requestedImg, {
  		top: 10
  	},
  	function (err, results) {
  		if (err) throw err;
  		res.send(results.map(createOutput));
  	}
  );
}

function createOutput (image) {
	return {
		"url": image.url,
		"snippet": image.title,
		"thumbnail": image.thumbnail.url,
		"context": image.sourceUrl
	};
}

app.listen(process.env.PORT || 80, function () {
	if (process.env.PORT) {
		console.log('Example app listening on port' + process.env.PORT + '!');
	} else {
		console.log('Example app listening on port 80!');
	}
});