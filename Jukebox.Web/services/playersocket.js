(function() {
    "use strict";
    
    var _jukeboxService = require('../services/jukeboxservice.js');

    module.exports.connection = function (socket) {
        console.log('socket connection');

        socket.on('disconnect', function () {
            console.log('socket disconnect');
        });

        socket.on('join', function(jukeboxId) {
            join(socket, jukeboxId);
        });
        
        socket.on('system:getTimeOffset', function(clientTime){
            socket.emit('system:timeOffset', clientTime, new Date().getTime());
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
        var listenerCount = Object.keys(room).length;
        if (listenerCount == 0) {
            console.log("no room for jukeboxId. Stopping.", jukeboxId);
            delete _jukeboxes[jukeboxId];
            _jukeboxService.updateJukeboxStopped(jukeboxId, function(error) {
                if (error) throw error;
            });
            return;
        }

        // if track has less than 15 seconds to play, select a new track and emit it
        var track = getTrack(jukeboxId); 
        //TODO: //if (!track || getCue(track) > track.duration - 15000) {
        if (!track || getCue(track) > 15000) {
            // get tracks from storage. This is the same cost as a message queue check, up to 1000 entities.
            var storage = require('./tablestorage.js');
            var azure = require('azure-storage');   //TODO: tablestorage should provide this.
            storage.get("jukeboxtrack", new azure.TableQuery()
            //.from("jukeboxtrack")
            .where('PartitionKey eq ?', jukeboxId), function (error, tracks) {
                if (error) {
                    console.log(error);
                    return;
                }

                if (tracks.length == 0) return;
                track = select(track, tracks);
                setTrack(jukeboxId, track);

                io.to(jukeboxId).emit('play', track);
                console.log("emit to {jukeboxId} play {track.name}", jukeboxId, track.name);
                
                // update Jukebox entity
                _jukeboxService.updateJukebox(jukeboxId, tracks.length, listenerCount, track.artist + ' / ' + track.name, function (error) {
                    if (error) throw error;
                });

                io.to(jukeboxId).emit('jukebox:data', { jukeboxId: jukeboxId, trackCount: tracks.length, listenerCount: listenerCount });
                console.log("emit to {jukeboxId} play {track.name}", jukeboxId, track.name);
                
                return;
            });
        }
    }

    var select = function(track, tracks) {
        // some tracks don't have a preview URL :(
        // try and find a track with a preview URL n times, where n if the total tracks in the library.
        // if no track is found, a track with a null URL will be returned.
        var index = 0;
        for (var i = 0; i < tracks.length; i++)
        {
          index = (Math.floor(Math.random() * (tracks.length - 1)) + 1) - 1;
          if (tracks[index].PreviewUrl !== undefined) break;
          console.log("track does not have a PreviewUrl. name = %s, id = %s", tracks[index].Name, tracks[index].Id);
        }
      
        console.log("selected track %d \"%s\" from a library of %d tracks.", index, tracks[index].Name, tracks.length);

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
            startTime: startTime,
            webUrl: tracks[index].WebUrl
        };  
    };

    var getTrack = function(jukeboxId) {
        return _currentTrack[jukeboxId];
    }

    var setTrack = function(jukeboxId, track) {
        _currentTrack[jukeboxId] = track;
    };

//    var isPlaying = function (track) {
//        var cue = getCue(track);
//        return (cue < track.duration);
//    };

    var getCue = function(track) {
        var cue = Math.min(new Date().getTime() - track.startTime.getTime(), track.duration);
        console.log("track cue", cue);
        return cue;
    };
})();

