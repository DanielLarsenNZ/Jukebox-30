(function() {
    "use strict";

    var mq = require('./messagequeue.js');
    var Consumer = mq.Consumer;
    var consumer = new Consumer("tracks");
    consumer.on('message', function (message) {
        console.log(message);
    });

    module.exports.get = function (playlistId, cb) {
        var Producer = mq.Producer;
        var publisher = new Producer();
        publisher.send([{ topic: "tracks", messages: ["hello mq"] }], function (data) { cb(data); }); 
    };

})();
