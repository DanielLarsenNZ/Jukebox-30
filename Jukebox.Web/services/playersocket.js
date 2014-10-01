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

var _currentTrack = [];

var play = function(socket, jukeboxId) {
    // if track in progress, return details
    var track = getTrack(jukeboxId);
    if (track) {
        if (isPlaying(track)) {
            // track is playing
            socket.emit("play", track);
            console.log("play", track);
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
        if (tracks.length == 0) return;
        setTrack(jukeboxId, select(tracks));
        socket.emit("play", getTrack(jukeboxId));
        return;
    });
    return;
};

var select = function(tracks) {
    var index = (Math.floor(Math.random() * (tracks.length - 1)) + 1) - 1;
    console.log("selected from tracks", index, tracks.length);
    
    return {
        url: tracks[index].PreviewUrl,
        duration: 30000,                //TODO: tracks[index].Duration
        startTime: new Date()
    };    
};

var getTrack = function(jukeboxId) {
    return _currentTrack[jukeboxId];
}

var setTrack = function(jukeboxId, track) {
    _currentTrack[jukeboxId] = track;
};

var isPlaying = function (track) {
    var cue = getCue(track);
    return (cue < track.duration);
};

var getCue = function(track) {
    return Math.min(new Date().getTime() - track.startTime.getTime(), track.duration);
};
