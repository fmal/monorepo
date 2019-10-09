'use strict'; // eslint-disable-line strict

// eslint-disable-next-line import/no-commonjs
const baseConfig = require('../../../jest.config.base');
// eslint-disable-next-line import/no-commonjs
const pkg = require('./package.json');

// eslint-disable-next-line import/no-commonjs
module.exports = {
  ...baseConfig,
  displayName: pkg.name,
  rootDir: __dirname
};
