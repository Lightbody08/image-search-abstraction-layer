var app = require('express')();
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var Search = require('bing.search');
var mongoURL = process.env.MONGOLAB_URI;
var bingAPI = process.env.BING_API_KEY;

var search = new Search(bingAPI);

//Get the URL and call necessary functions.
app.get('/imagesearch/:image', searchImages);
app.get('/imagesearch/:latest', searchHistory);

//Uses the bing API to search for the requested images.
//Takes the requested offset and then sends a JSON for
//each searched image.
function searchImages (req, res) {
	var reqSize = req.query.offset || 10;
	var reqImg = req.params.image;
	console.log(reqSize);
	search.images(reqImg, {
  		top: reqSize
  	},
  	function (err, results) {
  		if (err) throw err;
  		res.send(results.map(createOutput));
  	});

	var history = {
		"term": reqImg,
		"when": new Date().toLocaleString()
	};

	MongoClient.connect(mongoURL, function (err, db){
		if (err) {
	    console.log("Unable to connect to server: ", err);
	  	} else {
	  		console.log("Connected to the Server!")
	  		var collection = db.collection('imgHist')
	  		imgHist.save(history, function(err, added){
	  			if (err) throw err;
	  			console.log("Saved: " + added);
	  		});

	  		db.close();
	  	}
	});
	
}

//Create the object in which the necessary information is stored. 
function createOutput (image) {
	return {
		"url": image.url,
		"snippet": image.title,
		"thumbnail": image.thumbnail.url,
		"context": image.sourceUrl
	};
}

function searchHistory (req, res) {

}

app.listen(process.env.PORT || 80, function () {
	if (process.env.PORT) {
		console.log('Example app listening on port' + process.env.PORT + '!');
	} else {
		console.log('Example app listening on port 80!');
	}
});