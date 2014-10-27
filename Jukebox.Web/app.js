
/**
 * Module dependencies.
 */

// dan's requires
var dotenv = require('dotenv');
dotenv.load();

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var api = require('./routes/api');
var playerSocket = require('./services/playerSocket');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// offline page middleware
if (process.env.OfflineMode === "true") {
    app.use(function (req, res, next) {
        res.send(503, "Service Unavailable. Offline for maintenance - retry soon.");
        console.log('OfflineMode = true. %s %s returned 503 \"Service Unavailable. Offline for maintenance - retry soon.\"', req.method, req.url);
        //next();
    });
}

app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/users', user.list);

// dan's routes
app.post('/api/jukeboxes', api.createJukebox);
app.get('/api/jukeboxes', api.listJukeboxes);
app.get('/api/jukeboxes/:id', api.getJukebox);
app.get('/api/playlists', api.getPlaylists);
app.post('/api/jukeboxes/:id/tracks', api.importPlaylist);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// socket.io
var io = require('socket.io').listen(server);
io.on('connection', playerSocket.connection);
playerSocket.start(io);

// //////////////
