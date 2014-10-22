(function() {
    "use strict";

    var _azure = require('azure-storage');
    var _common = require('azure-common');

    // Inserts entity. Invokes callback(error) when done.
    // table = table name
    module.exports.insert = function (table, entity, callback) {
        var tableService = getTableService();
        createTableIfNotExists(tableService, table, function (error) {
            if (error) {
                callback(error);
                return;
            }

            var entry = mapToEntry(entity);

            tableService.insertEntity(table, entry, function (error) {
                if (error) {
                    callback(error);
                    return;
                }
                console.log("tablestorage inserted into ", table);
                callback(null);
            });
        });
    };

    module.exports.update = function(table, entity, callback){
	    var tableService = getTableService();
	
	    tableService.updateEntity(table, entity, function (error) {
		    if (error) {
			    callback(error);
			    return;
		    }
		
		    callback(null);
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
            console.log("tablestorage deleted from ", table);
            callback(null);
        });
    };

        // Returns entities from query. Invokes callback(error, entities) when done.
    module.exports.get = function (table, query, callback) {
        var tableService = getTableService();
        createTableIfNotExists(tableService, table, function (error) {
            if (error) {
                callback(error);
                return;
            }

            // get
            tableService.queryEntities(table, query, null, function (error, result, response) {
                if (error) {
                    callback(error);
                    return;
                }
                console.log("tablestorage got entities ", result.entries.length);

                var entities = [];
                for (var i = 0; i < result.entries.length; i++) {
                    entities[i] = mapToEntity(result.entries[i]);
                }

                callback(null, entities);
            });
        });
    }

    var mapToEntity = function(entry) {
        var entity = new Object();
        entity._entry = entry;
        for (var key in entry) {
            entity[key] = entry[key]["_"];
        }
        return entity;
    }

    var mapToEntry = function (entity) {
        var edmType = _common.edmType;
        
        var entry = new Object();
        for (var key in entity) {
            entry[key] = { "_": entity[key], "$": edmType.propertyType(entity[key]) };
        }
        return entry;
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
        var tableService = _azure.createTableService();
        return tableService;
        };

})();


