module.exports = function (app) {
  var remotes = app.remotes();

  remotes.options.rest = remotes.options.rest || {}
  remotes.options.rest.handleErrors = false;

  // app.middleware('final', FinalErrorHandler);

  function FinalErrorHandler(err, req, res, next) {
    if (err) {
      app.models.RequestAudit.updateAll({
        id: res.locals.auditId
      }, {
        error: JSON.stringify({
          code: err.statusCode,
          message: err.message,
          data: {},
          stack: err.stack
        }),
        status_code: err.statusCode,
      });
    }
    res.status(err.statusCode).send({
      code: err.statusCode,
      message: err.message,
      data: {},
      stack: err.stack
    }).end();
  }
};
