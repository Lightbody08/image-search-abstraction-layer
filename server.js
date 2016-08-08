var app = require('express')();
var MongoClient = require('mongodb').MongoClient;
var Search = require('bing.search');
var mongoURL = process.env.MONGOLAB_URI;
var bingAPI = process.env.BING_API_KEY;

var search = new Search(bingAPI);

//Get the URL and call necessary functions.
app.get('/', function (req, res) {
	res.sendFile('index.html', {root:__dirname});
});
app.get('/imagesearch/:image', searchImages);
app.get('/latest/:imagesearch', searchHistory);

//Uses the bing API to search for the requested images.
//Takes the requested offset and then sends a JSON for
//each searched image.
function searchImages (req, res) {
	//Start connection to Mongo database on mLab.
	MongoClient.connect(mongoURL, function (err, db) {
		if (err) {
	    	console.log("Unable to connect to server-- ", err);
	    	process.exit(1);
	  	} else {
	  		var collection = db.collection('imgHist');
	  		console.log("Connected to the Server!");
			var reqSize = req.query.offset || 10;
			var reqImg = req.params.image;
			search.images(reqImg, {
		  		top: reqSize
		  	},
		  	function (err, results) {
		  		if (err) console.error("Error using Bing API-- " + err);
		  		res.send(results.map(createOutput));
		  	});

			var history = {
				"term": reqImg,
				"when": new Date().toLocaleString()
			};
			
			collection.save(history, function(err, added) {
				if (err) console.error("Error while saving to database-- " + err);
					//console.log("Saved: " + JSON.stringify(history));
					db.close();	
				});	
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
	MongoClient.connect(mongoURL, function (err, db) {
		if (err) {
	    	console.log("Unable to connect to server-- ", err);
	    	process.exit(1);
	  	} else {
	  		var collection = db.collection('imgHist');
			var histHolder = new Array();
			var cursor = collection.find({}, {_id: 0}, {
				"limit": 10,
				"sort": {
					"when": -1
				}
			});
			cursor.each(function(err, doc) {
				if (err) console.error(err)
				if (doc != null){
					histHolder.push(doc);
				} else {
					res.send(histHolder);
					db.close();
				}
			});		
		}
	});
}

app.listen(process.env.PORT || 80, function () {
	if (process.env.PORT) {
		console.log('Example app listening on port' + process.env.PORT + '!');
	} else {
		console.log('Example app listening on port 80!');
	}
});