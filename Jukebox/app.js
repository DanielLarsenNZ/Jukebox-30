
/**
 * Module dependencies.
 */
var dotenv = require('dotenv');
dotenv.load();

require('newrelic');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var api = require('./routes/api');
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
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.post('/api/jukeboxes', api.createJukebox);
app.get('/api/playlists', api.getPlaylists);
// POST /api/jukeboxes/:id/tracks {"username":"xxxx", "playlistId":"xxxx"}
app.post('/api/jukeboxes/:id/tracks', api.importPlaylist);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
