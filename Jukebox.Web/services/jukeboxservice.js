var JUKEBOX_TABLE = "jukebox";

var _storage = require('../services/tablestorage.js');
var _azure = require('azure');

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
            callback(null, jukebox);
        });
};

module.exports.listJukeboxes = function(top, callback) {
    _storage.get(JUKEBOX_TABLE, new _azure.TableQuery()
        .top(top)
        .from(JUKEBOX_TABLE),
        //.where('PartitionKey ge ?', getPartitionKey()), 	//TODO
		function (error, jukeboxes) {
			if (error) {
				callback(error)
				return;
			}
        
			console.log("got jukeboxes", jukeboxes.length);
			callback(null, jukeboxes);
		});
};

module.exports.getJukebox = function(jukeboxId, callback) {
    _storage.get(JUKEBOX_TABLE, new _azure.TableQuery()
        .from(JUKEBOX_TABLE)
        .where('RowKey eq ?', jukeboxId), 
		function (error, jukebox) {
        if (error) {
            callback(error);
            return;
        }
        
        console.log("got jukebox");
        callback(null, jukebox);
    });
};

module.exports.updateJukebox = function (jukeboxId, trackCount, listenerCount, nowPlaying, callback) {
	module.exports.getJukebox(jukeboxId, function(error, jukebox){
		if (error) callback(error); return;
		
		jukebox.trackCount = trackCount;
		jukebox.listenerCount = listenerCount;
		jukebox.nowPlaying = nowPlaying;
		
		_storage.update(JUKEBOX_TABLE, jukebox, function(error){
			if (error) callback(error); return;
			
			callback(null, jukebox);
		});
	});
};

module.exports.updateJukeboxStopped = function (jukeboxId, callback){
	module.exports.updateJukebox(jukeboxId, undefined, 0, null, function(error, jukebox){
		if (error) callback(error); return;
		
		callback(null, jukebox);
	});
};

var getPartitionKey = function () {
    // current simple implementation returns integer representation of today's date, i.e. number of days since 1970.
    return parseInt(Date.now() / 1000 / 60 / 60 / 24).toString();
};
