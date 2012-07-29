/**
 * Salesforce (database.com) singleton DAO object
 */
var Salesforce = function(config) {

    var sf = require('node-salesforce');
    var conns = {};

    return {
        /**
         * Returns a new configured connection
         */
        newConnection: function(id) {
            var conn = new sf.Connection({
                clientId : config.clientId,
                clientSecret : config.clientSecret,
                redirectUri : config.redirectUri
            });
            conns[id] = conn;
            return conn;
        },

        /**
         * Returns an existing connection from ID
         */        
        retrieveConnection: function(id) {
            return conns[id];
        }
    }
};

module.exports = function(config) {
    return Salesforce(config);
}
