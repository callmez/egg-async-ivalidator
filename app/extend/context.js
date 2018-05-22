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

        hackAfterTransform(data, rules);

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

// Hack async-validator 保存transform后的值
// see https://github.com/yiminghe/async-validator/issues/104
const key = '__hackAfterTransform';
function hackAfterTransform(data, rules) {
  data[key] = undefined;
  rules[key] = {
    validator: function(rule, value, callback, source, options) {
      delete data[key];
      for (const key in data) {
        if (source.hasOwnProperty(key)) data[key] = source[key];
      }
      callback([]);
    }
  }
}