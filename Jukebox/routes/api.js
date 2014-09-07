
    // POST /api/jukeboxes
    // creates a Jukebox and returns the id
exports.createJukebox = function (req, res) {
    var storage = require('../services/tablestorage.js');
    var uuid = require('node-uuid');

    var uid = uuid.v4();
    storage.insert("jukebox", { id: uid, RowKey: uid, PartitionKey: "1" }, function(error) {
        if (error) {
            console.error(error.stack);
            res.send(500, error.message);
            return;
        }
        res.json({ id: uid });
    });
    
};

    // GET /api/playlists?username=daniellarsennz
    // Gets Spotify Playlists for a given username
exports.getPlaylists = function(req, res) {
    var spotify = require('../services/spotify.js');

    spotify.getPlaylists(req.query.username, function(error, response) {
        if (error) {
            console.error(error.stack);
            res.send(500, error.message);
            return;
        }
        res.json(response);
    });
};

    // POST /api/jukeboxes/:id/tracks {"playlistId":"xxxx"}
    // Adds the tracks from playlist xxxx to the Jukebox.
exports.importPlaylist = function (req, res) {
    res.json({

    });
};
