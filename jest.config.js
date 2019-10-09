'use strict'; // eslint-disable-line strict

// eslint-disable-next-line import/no-commonjs
const baseConfig = require('./jest.config.base');

// eslint-disable-next-line import/no-commonjs
module.exports = {
  ...baseConfig,
  roots: ['<rootDir>'],
  projects: ['<rootDir>/packages/@fmal/*']
};
