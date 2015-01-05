var appPort =  process.env.PORT || 3000;

var express = require('express') 
  , bodyParser =  require('body-parser')
  , app = express()
  , http = require('http')
  , server = http.createServer(app)
  , MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  , dbUrl = process.env.DATABASE_URL;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use( bodyParser.urlencoded( {extended: true} ) );
app.use( bodyParser.json() );

app.get("/", function(req, res){
  res.status(200).send("You shouldn't be here.");
  res.end();
});

app.post("/:episodeId", function(req, res){
  console.log(req.params.episodeId);
  var episodeObject = {
    seriesTitle:  req.params.seriesTitle,
    seriesId:     parseInt(req.body.seriesId),
    seasonNum:    parseInt(req.body.seasonNum),
    seasonId:     parseInt(req.body.seasonId),
    seasonYear:   parseInt(req.body.seasonYear),
    episodeTitle: req.params.episodeTitle,
    episodeId: parseInt(req.params.episodeId),
    themeStart: parseInt(req.body.themeStart),
    themeEnd: parseInt(req.body.themeEnd),
    timestamp: new Date().getTime()
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
  
  episodes.find({episodeId: parseInt(episodeId)}).toArray(function(err, documents){
    assert.equal(err, null);
    callback(documents);
  })
};
