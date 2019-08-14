// import statements
const InstabikeError = require('../error/instabike_error');

/**
 * @author Jaiyashree Subramanian
 */
module.exports = class AuditUtils {
  /**
   * Gets the city based on the Ip location
   * @param  {String}   modelName                  model instance's name
   * @param  {Object}   ctx       database context of the model instance
   * @param  {Function} callback                                callback
   * @author Jaiyashree Subramanian
   */
  persistInstanceUpdatedAt(modelName, ctx, callback) {
    this.modelName = modelName;
    try {
      if (!ctx.isNewInstance) {
        if (ctx.data) {
          ctx.data.updated_at = new Date();
        }
        if (ctx.currentInstance) {
          ctx.currentInstance.updated_at = new Date();
          return callback(null, ctx.currentInstance);
        }
      }
      if (ctx.instance) {
        ctx.instance.updated_at = new Date();
      } else if (ctx.data) {
        ctx.data.updated_at = new Date();
      }
      return callback(null, ctx.instance);
    } catch (error) {
      return callback(new InstabikeError(error));
    }
  }
};
