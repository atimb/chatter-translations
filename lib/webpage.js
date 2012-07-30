/**
 * Singleton object exposing Rest API to game clients
 */
WebPage = {
    bind: function(app, langs, Salesforce, Translation) {
        
        var Encoder = require('node-html-encoder').Encoder;
        var encoder = new Encoder('entity');
        var dateFormat = require('dateformat');

        /**
         * OAuth2 handlers for Chatter API authorization
         */
        app.get('/oauth2/auth', function(req, res) {
            var conn = Salesforce.newConnection(req.sessionID);
            res.redirect(conn.oauth2.getAuthorizationUrl({ scope : 'chatter_api' }));
        });
        app.get('/oauth2/callback', function(req, res) {
            var conn = Salesforce.retrieveConnection(req.sessionID);
            if (!conn) {
                res.redirect('/oauth2/auth');
                return;
            }
            
            var code = req.param('code');
            conn.authorize(code, function(err) {
                if (!err) {
                    req.session.fromLang = 'en';
                    req.session.toLang = 'es';
                    req.session.currentPage = conn.urls.rest.base + '/chatter/feeds/news/me/feed-items';
                    res.redirect('/');
                } else {
                    res.send(err);
                }
            });
        });
        
        /**
         * The controller for the main view, retrieves feed, translates, and renders it
         */
         app.get('/', function(req, res) {
             var conn = Salesforce.retrieveConnection(req.sessionID);
             if (!conn) {
                 res.redirect('/oauth2/auth');
                 return;
             }

             // adjust paging
             req.session.currentPage = (req.session.nextPage && (req.query.page === 'next')) ? (conn.instanceUrl + req.session.nextPage) : req.session.currentPage;
             req.session.currentPage = (req.query.page === 'first') ? (conn.urls.rest.base + '/chatter/feeds/news/me/feed-items') : req.session.currentPage;

             // retrieve chatter feed
             conn._request({
               method : 'GET',
               url : req.session.currentPage
             }, function(err, feed) {
                 if (err) {
                     res.send('Error caught: ' + err);
                     return;
                 }

                 // retrieve paging urls from feed
                 req.session.nextPage = feed.nextPageUrl;

                 // adjust language if requested
                 req.session.fromLang = req.query.from || req.session.fromLang;
                 req.session.toLang = req.query.to || req.session.toLang;
                 
                 // extract texts from chatter posts and comments, and format dates for humans
                 var texts = [];
                 for (var i = 0; i < feed.items.length; i++) {
                     texts.push(encoder.htmlDecode(feed.items[i].body.text));
                     feed.items[i].createdDate = dateFormat(new Date(feed.items[i].createdDate));
                     for (var j = 0; j < feed.items[i].comments.comments.length; j++) {
                         texts.push(encoder.htmlDecode(feed.items[i].comments.comments[j].body.text));
                         feed.items[i].comments.comments[j].createdDate = dateFormat(new Date(feed.items[i].comments.comments[j].createdDate));
                     }
                 }
                 
                 // Calculate possible from-to pairs to display
                 var from = [], to = [];
                 for (var i = 0; i < langs.length; i++) {
                     if (langs[i].from === req.session.fromLang) {
                         to.push(langs[i].to);
                     }
                     if (from.indexOf(langs[i].from) === -1) {
                         from.push(langs[i].from);
                     }
                 }
                 
                 // if changed `from`, adjust `to` if existing impossible
                 if (to.indexOf(req.session.toLang) === -1) {
                     req.session.toLang = to[0];
                 }

                 // translate the texts
                 Translation.translate(texts, req.session.fromLang, req.session.toLang, function(err, texts) {

                     // insert translated text into chatter object
                     for (var i = 0; i < feed.items.length; i++) {
                         feed.items[i].body.text2 = texts.shift();
                         for (var j = 0; j < feed.items[i].comments.comments.length; j++) {
                             feed.items[i].comments.comments[j].body.text2 = texts.shift();
                         }
                     }
                                  
                     // render the view    
                     res.render('index.ejs', {
                           layout: false,
                           chatter: feed,
                           fromLang: req.session.fromLang,
                           toLang: req.session.toLang,
                           fromLangs: from,
                           toLangs: to
                     });

                 });

             });
         });

    }
};

module.exports = WebPage;
