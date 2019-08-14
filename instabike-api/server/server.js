// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-access-control
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

var bodyParser = require('body-parser');
var boot = require('loopback-boot');
var loopback = require('loopback');
var path = require('path');
const logger = require('winston');
const multer = require('multer');
const useragent = require('express-useragent');
require('events').EventEmitter.prototype._maxListeners = 150;

var app = module.exports = loopback();

app.use(useragent.express());

app.use(loopback.token({
  model: app.models.accessToken
}));
app.use(loopback.token(
  process.env.environment === 'development' ? {
    headers: ['access_token', 'X-Access_Token'],
    params: ['access_token', 'access_token']
  } : {
    headers: ['access_token', 'X-Access_Token']
  }
));

app.use(function(req, res, next) {
    var token = req.accessToken;
    if (!token) {
        return next();
    }
    var now = new Date();
    if ( now.getTime() - token.created.getTime() < 1000 ) {
        return next();
    }
    req.accessToken.created = now;
    req.accessToken.ttl = 1800;
    req.accessToken.save(next);
});

app.use(bodyParser.json({limit: '50mb'}));
app.middleware('initial', bodyParser.urlencoded({ extended: true }));

// Bootstrap the application, configure models, datasources and middleware.

boot(app, __dirname);

app.set('view engine', 'ejs'); // LoopBack comes with EJS out-of-box
app.set('json spaces', 2); // format json responses for easier viewing

// must be set to serve views properly when starting the app via `slc run` from
// the project root
app.set('views', path.resolve(__dirname, 'views'));
app.use(multer().any());

//Set the currently authenticated user data
app.use(function (req, res, next) {
  if (!req.accessToken) return next();
  app.models.Users.findOne({
    where:
      {id: req.accessToken.userId},
    include: {
      relation: "user_role",
      scope: { include: "role" }
    }
  }, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new Error("No user with this access token was found."));
    }
    var now = new Date();
    if ( now.getTime() - req.accessToken.created.getTime() < 1000 ) {
      app.models.AccessToken.updateAll(
        { userid: req.accessToken.userId, accesstoken_id: req.accessToken.id },
        { created: new Date() },
      );
    }
    res.locals.user = user;
    next();
  });
});

app.models.Roles.find((err, roles) => {
  global.roles = roles;
  return roles;
});

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    logger.info('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      logger.info('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Create a request audit and check if the endpoint start with /api..
app.all("*", function (req, res, next) {
  req.setTimeout(0);
  if (req.accessToken) {
    console.log(`request ${req.method} --> ${req.originalUrl} --- ${req.accessToken.id}`);
  } else {
    console.log(`request ${req.method} --> ${req.originalUrl}`);
  }
  if(process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
    app.models.RequestAudit.createAudit(req, res, (err, reqAudit) => {
      res.locals.auditId = reqAudit.id;
      next();
    });
  } else {
    next();
  }
});

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}
