(function() {
    "use strict";

    // //////////
    // Fake Kafka
    // //////////
    
    //TODO: 2 files, 1 for Producer, 1 for Consumer. nullkafka exports those. See: https://github.com/SOHU-Co/kafka-node/blob/master/kafka.js

    var _ = require("underscore");

    var consumers = [];
    var queueTime = 100;
    
    var FakeKafka = new function () { 

        this.Producer = function () {
            this.send = function (payloads, cb) {
                _.each(payloads, function (payload) {
                    var topicConsumers = _.filter(consumers, function (consumer) { return payload.topic === consumer.topic; });
                
                    if (topicConsumers.length == 0) {
                        console.log("No consumers for {topic}. Message discarded.", payload.topic);
                        cb("ok");
                        return;
                    }
                
                    var index = 0;  
                    if (topicConsumers.length > 1) {
                        index = (Math.floor(Math.random() * (topicConsumers.length - 1)) + 1) - 1;
                    }
                
                    _.each(payload.messages, function (message) {
                        setTimeout(function () { topicConsumers[index].onmessage(message); }, queueTime);
                        console.log("Message for {topic} will be sent to Consumer {index}.", payload.topic, index);
                    });

                    cb("ok");
                });
            };
        };
    
        this.Consumer = function (payloads) {
            this.payloads = payloads;

            this.on = function (name, cb) {
                if (name = 'message') {
                    _.each(this.payloads, function (payload) {
                        consumers.push({ topic: payload.topic, onmessage: cb });
                        console.log("Consumer registered for {topic}.", payload.topic);
                    });
                
                    return;
                }

                throw "on " + name + " is not supported.";  
            };
        };
    }

    module.exports = FakeKafka;
})();