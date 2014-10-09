module.exports.connection = function (socket) {
    console.log('socket connection');

    socket.on('disconnect', function () {
        console.log('socket disconnect');
    });

    socket.on('join', function(jukeboxId) {
        join(socket, jukeboxId);
    });
};

module.exports.start = function(io) {
    console.log("start");
    setInterval(poll, 5000, io);
};

var _jukeboxes = new Object();

var join = function(socket, jukeboxId) {
    console.log('join', jukeboxId);

    // join the jukebox's room
    socket.join(jukeboxId);
    _jukeboxes[jukeboxId] = jukeboxId;
};

var poll = function (io) {
    for (var jukeboxId in _jukeboxes) {
        checkTrack(io, jukeboxId);
    }
}

var _currentTrack = [];

var checkTrack = function(io, jukeboxId) {
    console.log("checkTrack", jukeboxId);
    
    // if the room is empty, stop playing this jukebox
    var room = io.nsps["/"].adapter.rooms[jukeboxId];
    if (Object.keys(room).length == 0) {
        console.log("no room for jukeboxId. Stopping.", jukeboxId);
        delete _jukeboxes[jukeboxId];
        return;
    }

    // if track has less than 15 seconds to play, select a new track and emit it
    var track = getTrack(jukeboxId); 
    //TODO: //if (!track || getCue(track) > track.duration - 15000) {
    if (!track || getCue(track) > 15000) {
        // get tracks from storage. This is the same cost as a message queue check, up to 1000 entities.
        var storage = require('./tablestorage.js');
        var azure = require('azure');
        storage.get("jukeboxtrack", new azure.TableQuery()
        .from("jukeboxtrack")
        .where('PartitionKey eq ?', jukeboxId), function (error, tracks) {
            if (error) {
                console.log(error);
                return;
            }
            
            console.log("got tracks", tracks.length);

            if (tracks.length == 0) return;
            track = select(track, tracks);
            setTrack(jukeboxId, track);

            io.to(jukeboxId).emit('play', track);
            //io.emit("play", track);

            console.log("emit to play", jukeboxId, track);

            return;
        });
    }
}

var select = function(track, tracks) {
    var index = (Math.floor(Math.random() * (tracks.length - 1)) + 1) - 1;
    console.log("selected from tracks", index, tracks.length);

    var now = new Date();
    //TODO: //var startTime = new Date(track ? track.startTime + tracks[index].duration : new Date().getTime() + 10000);
    var startTime = new Date(track ? track.startTime.getTime() + 30000 : now.getTime() + 10000);
    if (startTime.getTime() < now.getTime()) {
        var newStartTime = new Date(now.getTime() + 10000);
        console.log("{startTime} for next track is too old. Resetting to {now + 10\"}", startTime, newStartTime);
        startTime = newStartTime;
    }

    return {
        id: tracks[index].Id,
        url: tracks[index].PreviewUrl,
        name: tracks[index].Name,
        artist: tracks[index].Artist,
        album: tracks[index].Album,
        imageUrl: tracks[index].ImageUrl,
        duration: 30000, //TODO: tracks[index].Duration
        startTime: startTime
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
    var cue = Math.min(new Date().getTime() - track.startTime.getTime(), track.duration);
    console.log("track cue", cue);
    return cue;
};
