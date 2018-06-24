'use strict';

const validator = require('async-validator');

module.exports = function(app) {
  app.validator = validator;
};
