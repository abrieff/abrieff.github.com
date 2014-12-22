// Express initialization
var express = require('express');
var app = express(express.logger());
app.use(express.bodyParser());
app.set('title', 'nodeapp');
// Mongo initialization: help from Brett Fischler
var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

var db = mongo.Db.connect(mongoUri, function (err, dbConnection) {
  if (err) {
    console.log("Error")
  } else {
    db = dbConnection;
	console.log("success");
  }
});

app.all('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function (request, response) {
response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");
  db.collection('highscores', function(err, highscoresCollection) {
    highscoresCollection.find().toArray( function (er, results) {
      if(!err)
	  response.writeHead(200, { 'Content-Type': 'text/html' });

    var indexpage = '<!DOCTYPE html><html><head><title>Scorecenter</title></head><body><table style = "border:2px solid black;border-collapse:collapse;width:50%">';
	indexpage += '<tr><td style = "border:1px solid black;"> ' + "<h3>Username</h3>" + ' </td><td style = "border:1px solid black;">' + "<h3>Score</h3>" + ' </td><td style = "border:1px solid black;"> ' + "<h3>Game Title</h3>"+ ' </td></tr>';
	for (var i = 0; i < results.length; i++){
    indexpage += '<tr style = "border:1px solid black;"><td style = "border:1px solid black;">'  + (i+1) + '.' + results[i].username + ' </td><td  style = "border:1px solid black;">' + results[i].score + ' </td><td  style = "border:1px solid black;"> ' + results[i].game_title + ' </td></tr>';
}
indexpage += '</table>'
indexpage += '</body></html>';
    response.end(indexpage, 'utf-8');

        //response.send(indexpage);
    })
  })
});

app.get('/highscores.json', function(request, response) {
var game_name = request.param.game_title;
 db.collection('highscores', function(err, highscoresCollection) {
    highscoresCollection.find({"game_title": game_name}).toArray( function (er, results) {
	response.set('Content-Type', 'text/json');
	response.send(results);
	});
	});
  
  
 // response.send('{"status":"good"}');
});
app.post('/submit.json', function(request, response) {
  response.set('Content-Type', 'text/json');
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");
  console.log(request.body.score);
  if (request.body.score != "score"){
  username = request.body.username;
  game_title = request.body.game_title;
  score = parseInt(request.body.score);
  var date = new Date();
  var data = {"username": username, "game_title": game_title, "score": score, "created_at": date};
  db.collection('highscores', function (err, highscoresCollection) {
	highscoresCollection.insert(data);
  })}
  response.send('{"status":"good"}');
});
app.get('/usersearch', function(request, response){
  response.set('Content-Type', 'text/html');
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "X-Requested-With");
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write('User Search<br>');
	response.write('<form method="POST" action="/usersearch">');
	response.write('<input type="text" name="user"><br>');
	response.write('<input type="submit" name="login" value="Submit">');
	response.write('</form>');
	response.end();
});
app.post('/usersearch', function(request, response){
	var user = request.param("user");
	response.writeHead(200, {'Content-Type': 'text/html'});
	db.collection('highscores', function(err, highscoresCollection) {
    highscoresCollection.find({"username":user}).toArray( function (er, results) {
      if(!err)
	var indexpage = '<h1>' + user + '</h1>';
    indexpage += '<table style = "border:2px solid black;border-collapse:collapse;width:50%">';
	indexpage += '<tr><td style = "border:1px solid black;"> ' + "<h3>Username</h3>" + ' </td><td style = "border:1px solid black;">' + "<h3>Score</h3>" + ' </td><td style = "border:1px solid black;"> ' + "<h3>Game Title</h3>"+ ' </td></tr>';
	for (var i = 0; i < results.length; i++){
    indexpage += '<tr style = "border:1px solid black;"><td style = "border:1px solid black;">'  + (i+1) + '.' + results[i].username + ' </td><td  style = "border:1px solid black;">' + results[i].score + ' </td><td  style = "border:1px solid black;"> ' + results[i].game_title + ' </td></tr>';
}
indexpage += '</table>';
response.write(indexpage);
	response.end();
});
});
});

     //response.send('{"status":"good"}');
    
  
			
	
	
  

app.get('/fool', function(request, response) {
  response.set('Content-Type', 'text/html');
  response.send(500, 'Something broke!');
});

// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
