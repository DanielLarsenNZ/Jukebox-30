module.exports.connection = function(socket) {
    console.log('a user connected');

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
    socket.on('next', function(jukeboxId) {
        console.log('next', jukeboxId);
        play(socket, encodeURIComponent(jukeboxId));
    });
};

var _tracks = null;
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

    // if tracks not cached, get tracks from storage
    if (!_tracks) {
        var storage = require('./tablestorage.js');
        var azure = require('azure');
        storage.get("jukeboxtrack", new azure.TableQuery()
            .from("jukeboxtrack")
            .where('PartitionKey eq ?', jukeboxId)
            , function (error, tracks) {
            if (error) {
                console.log(error);
                return;
            }

            console.log("got tracks", tracks.length);
            _tracks = tracks;
            select();
            socket.emit("play", _currentTrack);
            return;
        });
        return;
    }

    // pick a random track
    select();
    socket.emit("play", _currentTrack);
};

var select = function() {
    var index = (Math.floor(Math.random() * (_tracks.length - 1)) + 1) - 1;
    console.log("selected from tracks", index, _tracks.length);
    //TODO: setTrack(_tracks[index].PreviewUrl, _tracks[index].Duration);
    setTrack(_tracks[index].PreviewUrl, 30000);
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