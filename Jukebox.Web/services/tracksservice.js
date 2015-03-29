(function() {
    "use strict";

    var mq = require('./fake-kafka.js');
    
    // subscribe to tracks topic
    var Consumer = mq.Consumer;
    var consumer = new Consumer([{ topic: "tracks" }]);
    consumer.on('message', function (message) {
        console.log(message);
    });

    module.exports.get = function (playlistId, cb) {
        // publish to tracks topic
        var Producer = mq.Producer;
        var publisher = new Producer();
        publisher.send([{ topic: "tracks", messages: ["hello mq"] }], function (data) { cb(data); }); 
    };

})();
