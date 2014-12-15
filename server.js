var appPort =  process.env.PORT || 3000;

var express = require('express') 
  , bodyParser =  require('body-parser')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  , dbUrl = 'mongodb://localhost:27017/myproject';

app.use( bodyParser.urlencoded( {extended: true} ) );
app.use( bodyParser.json() );

app.post("/:episodeId", function(req, res){
  console.log(req.params.episodeId);
  var episodeObject = {
    episodeId: req.params.episodeId,
    themeStart: req.body.themeStart,
    themeEnd: req.body.themeEnd
  };

  MongoClient.connect(dbUrl, function(err, db) {
    assert.equal(null, err);

    insertEpisode(db, episodeObject, function(result) {
      res.status(200).send(result);
      console.log("result from mongo insert", result)
      db.close();
      res.end();
    });
  });
});

app.get("/:episodeId", function(req, res){
  MongoClient.connect(dbUrl, function(err, db) {
    assert.equal(null, err);

    getEpisode(db, req.params.episodeId, function(result) {
      res.status(200).send(result);
      console.log("result from mongo get", result);
      db.close();
      res.end();
    });
  });
});

server.listen(appPort);

function insertEpisode(db, episodeObject, callback) {
  var episodes = db.collection('episodes');

  episodes.insert([episodeObject], function(err, result) {
    assert.equal(err, null);
    callback(result);
  });
}

function getEpisode(db, episodeId, callback) {
  var episodes = db.collection('episodes');
  
  episodes.find({episodeId: episodeId}).toArray(function(err, documents){
    assert.equal(err, null);
    callback(documents);
  })
};
