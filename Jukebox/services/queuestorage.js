var azure = require('azure-storage');

module.exports.createMessage = function (queue, message, callback) {
    var queueService = azure.createQueueService();

    queueService.createQueueIfNotExists(queue, function (error) {
        if (error) {
            callback(error);
            return;
        }

        queueService.createMessage(queue, message, function (error) {
            if (error) {
                callback(error);
                return;
            }

            console.log("queued message", queue, message);
            callback(null);
            return;
        });
    });
};
