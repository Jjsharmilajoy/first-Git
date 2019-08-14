// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-example-access-control
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

module.exports = function(app) {
  var router = app.loopback.Router();

  router.get('/', function(req, res) {
    res.render('index', {
      loginFailed: false
    });
  });

  router.get('/logout', function(req, res) {
    var AccessToken = app.models.AccessToken;
    var token = new AccessToken({id: req.query['access_token']});
    console.log(token);
    token.destroy();

    res.redirect('/');
  });

  app.use(router);
};
