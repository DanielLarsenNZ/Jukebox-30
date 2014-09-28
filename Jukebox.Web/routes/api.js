
    // POST /api/jukeboxes
    // creates a Jukebox and returns the id
exports.createJukebox = function(req, res) {
    var storage = require('../services/tablestorage.js');
    var name = req.param('name');
    var jukebox = { name: name, RowKey: encodeURIComponent(name), PartitionKey: getPartitionKey() };
    storage.insert("jukebox", jukebox,
        function(error) {
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
    var storage = require('../services/tablestorage.js');
    var azure = require('azure');
    storage.get("jukebox", new azure.TableQuery()
        .top(20)
        .from("jukebox")
        .where('PartitionKey ge ?', getPartitionKey()), function (error, jukeboxes) {
        if (error) {
            console.log(error);
            return;
        }
        
        console.log("got jukeboxes", jukeboxes.length);
        res.json(jukeboxes);        
        return;
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

var getPartitionKey = function () {
    // current simple implementation returns integer representation of today's date, i.e. number of days since 1970.
    return parseInt(Date.now() / 1000 / 60 / 60 / 24).toString();
};
