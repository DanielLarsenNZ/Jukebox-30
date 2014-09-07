    // Inserts entity. Invokes callback(error) when done.
// table = table name
module.exports.insert = function (table, entity, callback) {
    var tableService = getTableService();
    createTableIfNotExists(tableService, table, function (error) {
        if (error) {
            callback(error);
            return;
        }

        tableService.insertEntity(table, entity, function (error) {
            if (error) {
                callback(error);
                return;
            }
            console.log("tablestorage inserted ", table, entity);
            callback(null);
        });
    });
};

    // Deletes entity. Invokes callback(error) when done.
module.exports.delete = function (table, entity, callback) {
    var tableService = getTableService();
    tableService.deleteEntity(table, { PartitionKey: entity.PartitionKey, RowKey: entity.RowKey }, function (error) {
        if (error) {
            callback(error);
            return;
        }
        console.log("tablestorage deleted ", table, entity);
        callback(null);
    });
};

    // Returns entities from query. Invokes callback(error, entities) when done.
module.exports.get = function (table, query, callback) {
    var tableService = getTableService();
    createTableIfNotExists(table, tableService, function (error) {
        if (error) {
            callback(error);
            return;
        }

        // get
        tableService.queryEntities(query, function (error, entities) {
            if (error) {
                callback(error);
                return;
            }
            console.log("tablestorage queried ", query);
            callback(null, entities);
        });
    });
}

var createTableIfNotExists = function (tableService, table, callback) {
    tableService.createTableIfNotExists(table, function (error) {
        if (error) {
            callback(error);
            return;
        }
        callback(null);
    });
};

var getTableService = function () {
    var azure = require('azure');

    // The NTVS can't see the AppSettings, so if null, must be debugging, use Development Storage
    var tableService = process.env.StorageAccountName === undefined
                       ? azure.createTableService("devstoreaccount1",
                                                   "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==",
                                                   "127.0.0.1:10002")
                       : azure.createTableService(process.env.StorageAccountName,
                                                   process.env.StorageAccountKey,
                                                   process.env.StorageAccountTableStoreHost);
    return tableService;
};

