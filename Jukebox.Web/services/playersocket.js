module.exports.connection = function(socket) {
    console.log('a user connected');

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
    socket.on('next', function(jukeboxId) {
        console.log('next', jukeboxId);
        play(socket, jukeboxId);
    });
};

var _currentTrack = null;

var play = function(socket, jukeboxId) {
    // if track in progress, return details
    if (_currentTrack) {
        if (isPlaying()) {
            // track is playing
            socket.emit("play", _currentTrack);
            console.log("play", _currentTrack);
            return;
        }
    }

    // get tracks from storage. This is the same cost as a message queue check, up to 1000 entities.
    var storage = require('./tablestorage.js');
    var azure = require('azure');
    storage.get("jukeboxtrack", new azure.TableQuery()
        .from("jukeboxtrack")
        .where('PartitionKey eq ?', jukeboxId), function(error, tracks) {
            if (error) {
                console.log(error);
                return;
            }

            console.log("got tracks", tracks.length);
            select(tracks);
            socket.emit("play", _currentTrack);
            return;
        });
    return;
};

var select = function(tracks) {
    var index = (Math.floor(Math.random() * (tracks.length - 1)) + 1) - 1;
    console.log("selected from tracks", index, tracks.length);
    //TODO: setTrack(tracks[index].PreviewUrl, tracks[index].Duration);
    setTrack(tracks[index].PreviewUrl, 30000);
};

var setTrack = function(url, duration) {
    _currentTrack = {
        url: url,
        duration: duration,
        startTime: new Date()
    };
};

var isPlaying = function () {
    var cue = getCue();
    return (cue < _currentTrack.duration);
};

var getCue = function() {
    return Math.min(new Date().getTime() - _currentTrack.startTime.getTime(), _currentTrack.duration);
};