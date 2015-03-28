(function() {
    "use strict";

    var _jukeboxService = module.require('./services/jukeboxservice.js');

    // POST /api/jukeboxes
    // creates a Jukebox and returns the id
    module.exports.createJukebox = function(req, res) {
	    _jukeboxService.createJukebox(req.param('name'), req.param('spotifyUsername'), function(error, jukebox){
		    if (error) {
			    console.error(error.stack);
			    res.send(500, error.message);
			    return;
		    }

		    res.json(jukebox);		
	    });	
    };

    // GET /api/jukeboxes
    // lists jukeboxes
    module.exports.listJukeboxes = function(req, res) {
	    _jukeboxService.listJukeboxes(50, function(error, jukeboxes){
		    if (error) {
			    console.error(error.stack);
			    res.send(500, error.message);
			    return;
		    }

		    res.json(jukeboxes);
	    });
    };

    // GET /api/jukeboxes/:id
    // retrieves a jukebox
    module.exports.getJukebox = function(req, res) {
	    _jukeboxService.getJukebox(req.param("id"), function(error, jukebox){
		    if (error) {
			    console.error(error.stack);
			    res.send(500, error.message);
			    return;
		    }

		    res.json(jukebox);
	    });
    };

    // GET /api/playlists?username=daniellarsennz
        // Gets Spotify Playlists for a given username
    module.exports.getPlaylists = function (req, res) {
        var spotify = require('./services/spotify.js');
    
        spotify.getPlaylists(req.query.username, req.query.offset, function (error, response) {
            if (error) {
                console.error(error.stack);
                res.send(500, error.message);
                return;
            }
        
            res.json(response);
        });
    };

        // POST /api/jukeboxes/:id/tracks {"username":"xxxx", "playlistId":"xxxx"}
        // Adds the tracks from playlist xxxx to the Jukebox.
    module.exports.importPlaylist = function (req, res) {
        var service = require("./services/playlistservice");
        
        var message = {
            jukeboxId: req.params.id,
            username: req.param('username'),
            playlistId: req.param('playlistId'),
            whenCreated: new Date()
        };
        
        service.importPlaylist(message, function (error, callback) {
            if (error) {
                console.error(error.stack);
                res.send(500, error.message);
                return;
            }

            res.send(200, "ok");
        });
    };

    module.exports.getTracks = function (req, res) {
        var tracks = module.require('./services/tracksservice');
        tracks.get(req.params.id, function (data) { res.json(data); });
    };

})();

