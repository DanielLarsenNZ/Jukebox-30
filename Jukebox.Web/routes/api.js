(function() {
    "use strict";

    var _jukeboxService = module.require('../services/jukeboxservice.js');

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
        var spotify = require('../services/spotify.js');
    
        spotify.getPlaylists(req.query.username, function (error, response) {
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
        // queue for import and return
        var queue = require('../services/queuestorage.js');
    
        var message = {
            jukeboxId: req.params.id,
            username: req.param('username'),
            playlistId: req.param('playlistId'),
            whenCreated: new Date()
        };

        queue.createMessage('import-playlist', JSON.stringify(message), function(error) {
            if (error) {
                console.error(error.stack);
                res.send(500, error.message);
                return;
            }

            console.log("process ID", process.pid);

            res.send(200, "ok");
        });
    };
})();

