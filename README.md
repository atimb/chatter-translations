chatter-translations
====================

![Demo screenshot](https://github.com/atimb/chatter-translations/raw/master/screenshot/demo.png)

Entry for this challenge: http://www.cloudspokes.com/challenges/1641

Demo: http://chatter-translations.herokuapp.com

Chatter feed translations, implemented in Node.JS, deployable on Heroku.

Using Apertium API for translation.

**Setup instructions:**

 - Fill in the configuration details in `conf/config.json`
 - Create heroku app `heroku app:create`
 - Copy content to new heroku repo
 - Push to heroku `git push origin master`
 - Enjoy

**Modularity:**

 - `server.js` is the main file starting the services
 - `lib/salesforce-connector.js` is a layer above `node-salesforce` module
 - `lib/translation-service.js` has the translation interface implemented (right now with Apertium)
 - `lib/webpage.js` contains the controller for the web app
 - `index.ejs` is the main view
 