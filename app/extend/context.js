'use strict';

const _ = require('lodash');

module.exports = {
  /**
   * validate data with rules
   *
   * @param  {Object} rules  - 验证规则, see [rules](https://github.com/yiminghe/async-validator#rules)
   * @param  {Object} data - 验证的数据, 默认验证 `this.request.body`
   * @param  {Object} message - 验证错误后的提示信息
   * @return {Promise<data>} - 返回验证后且可以安全使用的数据
   */
  async validate(rules, data, messages = {}) {
    return new Promise((resolve, reject) => {
      try {
        const _data = _.cloneDeep(data || this.request.body); // 拷贝新数据, 保留旧数据
        const Schema = this.app.validator;

        hackAfterTransform(_data, rules);

        new Schema(rules).validate(_data, (errors, fields) => {
          if (errors) {
            this.throw(422, 'Validation Failed', {
              code: 'invalid_param',
              errors,
            });
          }

          const result = filterValidatedData(_data, rules);
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

/**
 * 过滤掉未设置验证的数据
 * @param data
 * @param rules
 * @return {*}
 */
function filterValidatedData(data, rules) {
  const result = _.cloneDeep(data);

  for (const k in rules) {
    const rule = rules[k];
    const _data = data[k] || {};
    if (typeof rule === 'object' && rule.fields) {
      result[k] = filterValidatedData(_data, rule.fields);
    }
  }

  const dataKeys = Object.keys(data);
  const ruleKeys = Object.keys(rules);
  const deleteKeys = _.difference(dataKeys, ruleKeys);
  for (const k of deleteKeys) {
    delete result[k];
  }

  return result;
}

// Hack async-validator 保存transform后的值
// see https://github.com/yiminghe/async-validator/issues/104
const __key = '__hackAfterTransform';
function hackAfterTransform(data, rules) {
  for (const k in rules) {
    const rule = rules[k];
    const _data = data[k] || {};
    if (typeof rule === 'object' && rule.fields) {
      hackAfterTransform(_data, rule.fields);
    }
  }

  data[__key] = undefined;
  rules[__key] = {
    validator: function(rule, value, callback, source, options) {
      for (const k in source) {
        data[k] = source[k]; // 重新记录验证后的值
      }
      delete data[__key];
      delete rules[__key];

      callback([]);
    }
  }
}