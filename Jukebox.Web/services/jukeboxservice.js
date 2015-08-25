(function() {
    "use strict";

    var JUKEBOX_TABLE = "jukebox";

    var _storage = require('../services/tablestorage.js');
    var _azure = require('azure-storage');
    
    // Create jukebox
    module.exports.createJukebox = function(name, spotifyUsername, callback) {
        var uuid = require('node-uuid');
        var uid = uuid.v4();

        var jukebox = {
            id: uid,
            name: name,
            RowKey: uid,
            PartitionKey: getPartitionKey(),
            spotifyUsername: spotifyUsername,
            whenCreated: new Date()
        };

        _storage.insert(JUKEBOX_TABLE, jukebox,
            function(error) {
                if (error) {
                    console.error(error.stack);
                    callback(error);
                    return;
            }
            console.log("Created Jukebox entity (RowKey, PartitionKey)", jukebox.RowKey, jukebox.PartitionKey);
            callback(null, jukebox);
        });
    };
    
    // List Jukeboxes
    module.exports.listJukeboxes = function(top, callback) {
        _storage.get(JUKEBOX_TABLE, new _azure.TableQuery()
            .top(top),
            //.where('trackCount gt ?', 0), 	
            function(error, jukeboxes) {
                if (error) {
                    callback(error);
                    return;
                }

                console.log("Got list of jukeboxes", jukeboxes.length);
                callback(null, jukeboxes);
            });
    };
    
    // Get Jukebox
    module.exports.getJukebox = function(jukeboxId, callback) {
        _storage.get(JUKEBOX_TABLE, new _azure.TableQuery()
            //.from(JUKEBOX_TABLE)
            .where('RowKey eq ?', jukeboxId),
            function(error, jukebox) {
                if (error) {
                    callback(error);
                    return;
                }

                console.log("got jukebox");
                callback(null, jukebox);
            });
    };
    
    // Update Jukebox
    module.exports.updateJukebox = function(jukeboxId, trackCount, listenerCount, nowPlaying, callback) {
        module.exports.getJukebox(jukeboxId, function(error, jukeboxes) {
            if (error) {
                callback(error);
                return;
            }

            if (jukeboxes.length != 1) throw Error('Unexpected result from getJukebox (jukeboxId, jukeboxes)', jukeboxId, jukeboxes);
            var jukebox = jukeboxes[0]._entry;
            
            var entGen = _azure.TableUtilities.entityGenerator; // stinky poo!

            if (trackCount !== undefined) jukebox.trackCount = entGen.Int32(trackCount);
            jukebox.listenerCount = entGen.Int32(listenerCount);
            jukebox.nowPlaying = entGen.String(nowPlaying);

            _storage.update(JUKEBOX_TABLE, jukebox, function(error) {
                if (error) {
                    callback(error);
                    return;
                }
                console.log("Updated Jukebox entity", jukeboxId);
                callback(null, jukebox);
            });
        });
    };
    
    // Update Jukebox is stopped.
    module.exports.updateJukeboxStopped = function (jukeboxId, callback) {
        module.exports.updateJukebox(jukeboxId, undefined, null, null, function(error, jukebox) {
            if (error) {
                callback(error);
                return;
            }
            console.log("Updated Jukebox entity as being stopped.", jukeboxId);
            callback(null, jukebox);
        });
    };

    var getPartitionKey = function() {
        // current simple implementation returns integer representation of today's date, i.e. number of days since 1970.
        return parseInt(Date.now() / 1000 / 60 / 60 / 24).toString();
    };
})();
