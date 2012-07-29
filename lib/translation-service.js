/**
 * Translation service
 */
Translation = function(config) {
    
    var async = require('async');
    var _ = require('underscore')._;
    var rest = require('restler');
    
    return {
        /**
         * Retrieves the available language pairs for the translator
         */
        getLanguagePairs: function(cb) {
            rest.get('http://api.apertium.org/json/listPairs').on('complete', function(result) {
                if (result instanceof Error) {
                    cb(result.responseDetails);
                } else {
                    var pairs = _.map(result.responseData, function(pair) {
                        return { from: pair.sourceLanguage, to: pair.targetLanguage };
                    });
                    cb(null, pairs);
                }
            });
        },
        
        /**
         * Input is an array of strings and language pair, output is the same array of strings translated delivered via callback
         */
        translate: function(texts, from, to, cb) {
            async.parallel(_.map(texts, function(text) {
              return function(cb) {
                  var options = {
                      query: {
                          key: config.apiKey,
                          q: text,
                          langpair: from + '|' + to
                      }
                  };
                  rest.get('http://api.apertium.org/json/translate', options).on('complete', function(result) {
                      if (result instanceof Error) {
                          cb(result.responseDetails);
                      } else {
                          cb(null, result.responseData.translatedText);
                      }
                  });
              };
            }), function(err, results) {
                cb(err, results);
            });
        }
    }
};

module.exports = function(config) {
    return Translation(config);
}
