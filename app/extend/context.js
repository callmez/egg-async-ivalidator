'use strict';

module.exports = {
  /**
   * validate data with rules
   *
   * @param  {Object} rules  - validate rule object, see [parameter](https://github.com/node-modules/parameter)
   * @param  {Object} [data] - validate target, default to `this.request.body`
   * @param  {Object} message
   */
  async validate(rules, data, messages = {}) {
    return new Promise((resolve, reject) => {
      try {
        data = data || this.request.body;
        const Schema = this.app.validator;
        new Schema(rules).validate(data, (errors, fields) => {
          if (errors) {
            this.throw(422, 'Validation Failed', {
              code: 'invalid_param',
              errors,
            });
          }

          const keys = Object.keys(data);
          const result = {};
          for (const key of keys) {
            result[key] = data[key];
          }
          resolve(result); // return pure safety data
        }, {
          ...this.app.config.validate.messages,
          ...messages,
        });
      } catch (e) {
        reject(e);
      }
    });
  },
};
