module.exports = (RequestAudit) => {
  const requestAudit = RequestAudit;
  /**
   * Method to log all incomming Requests and user-agent details
   * @param  {Request} req                          http request
   * @param  {Response} res                        http response
   * @param  {Function} createAuditCB                   callback
   * @author Jaiyashree Subramanian
   */
  requestAudit.createAudit = (req, res, createAuditCB) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const requestAuditObj = {
      body: JSON.stringify(req.body),
      client_ip: ip,
      request_path: req.path,
      is_mobile: req.useragent.isMobile,
      client_browser: req.useragent.browser,
      request_params: JSON.stringify(req.params),
      browser_version: req.useragent.version,
      client_os: req.useragent.os,
      client_platform: req.useragent.platform,
      user_id: req.accessToken ? req.accessToken.userId : '',
      client_source: req.useragent.source,
    };
    /* eslint-disable no-unused-vars */
    RequestAudit.create(requestAuditObj, createAuditCB);
  };

  /**
   * Updates updated_at time for each save
   * @param  {Context} ctx       database context
   * @param  {Function} next             callback
   * @author Jaiyashree Subramanian
   */
  RequestAudit.observe('before save', (ctx, next) => {
    if (ctx.instance) {
      ctx.instance.updated_at = new Date();
    } else {
      ctx.data.updated_at = new Date();
    }
    next();
  });
};
