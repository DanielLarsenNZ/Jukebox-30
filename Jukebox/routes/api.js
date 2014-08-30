
    // POST /api/jukeboxes
    // creates a Jukebox and returns the id
exports.createJukebox = function (req, res) {
    var storage = require('../tablestorage.js');
    var uuid = require('node-uuid');
    var username = req.body.username;
    if (username === undefined) throw new Error("POST /api/jukeboxes expects username.");

    var uid = uuid.v4();
    storage.insert("jukebox", { id: uid, username: username, RowKey: uid, PartitionKey: username }, function(error) {
        if (error) {
            console.error(error.stack);
            res.send(500, error.message);
            return;
        }
        res.json({ id: uid, username: username });
    });
    
};

    // GET /api/playlists?username=daniellarsennz
    // Gets Spotify Playlists for a given username
exports.getPlaylists = function (req, res) {
    var posts = [];
    data.posts.forEach(function (post, i) {
        posts.push({
            id: i,
            title: post.title,
            text: post.text.substr(0, 50) + '...'
        });
    });
    res.json({
        posts: posts
    });
};


    // POST /api/jukeboxes/:id/tracks {"playlistId":"xxxx"}
    // Adds the tracks from playlist xxxx to the Jukebox.
exports.importPlaylist = function (req, res) {
    res.json({

    });
};

