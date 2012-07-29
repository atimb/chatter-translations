var express = require('express');
var util = require('util');
var app = express.createServer(express.static(__dirname + '/public'), express.cookieParser(), express.session({ secret: "cookie monster" }), express.logger(), express.bodyParser());
var config = require('./conf/config.json');
var port = process.env.PORT || 80;

var Salesforce = require('./lib/salesforce-connector')(config.SALESFORCE);
var WebPage = require("./lib/webpage.js");
var Translation = require('./lib/translation-service')(config.APERTIUM);

// Bootstrap the server
Translation.getLanguagePairs(function(err, pairs) {
    if (err) {
        console.log('Cannot retrieve language pairs.');
        return;
    }
    WebPage.bind(app, pairs, Salesforce, Translation);
    app.listen(port, function() {
        console.log("Listening on " + port);
    });
});
