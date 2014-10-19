var _jukeboxService = require('../services/jukeboxservice.js');

    // POST /api/jukeboxes
    // creates a Jukebox and returns the id
exports.createJukebox = function(req, res) {
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
exports.listJukeboxes = function(req, res) {
	_jukeboxService.listJukeboxes(20, function(error, jukeboxes){
		if (error) {
			console.error(error.stack);
			res.send(500, error.message);
			return;
		}

		res.json(jukeboxes);
	});
};

// GET /api/jukeboxes/:id
// retrieves a jukeboxe
exports.getJukebox = function(req, res) {
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
exports.getPlaylists = function (req, res) {
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
exports.importPlaylist = function (req, res) {
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
