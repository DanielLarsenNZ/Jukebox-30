
/**
 * Module dependencies.
 */

// dan's requires
var dotenv = require('dotenv');
dotenv.load();

var express = require('express');
var routes = require('./routes');
var api = require('./routes/api');
var playerSocket = require('./services/playerSocket');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

// middleware to return 503 for any api calls in offline mode.
var isOffline = process.env.OfflineMode === "true";

if (isOffline) {
    app.use("/api", function (req, res) {
        res.send(503, "Service unavailable. Offline for maintenance, retry soon.");
        console.log('OfflineMode = true. %s %s returned 503 \"Service unavailable. Offline for maintenance, retry soon.\"', req.method, req.url);
    });
}

app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes
// index route returns _index.html or offline.html if in offline mode.
app.get("/", function (req, res) {
    if (isOffline) {
        res.status(503);
        res.sendfile(path.join(__dirname, 'public/offline.html'));
        console.log('OfflineMode = true. %s %s returned 503 /offline.html', req.method, req.url);
        return;
    }

    res.sendfile(path.join(__dirname, 'public/_index.html'));
});

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
