'use strict'; // eslint-disable-line strict

const isCI = Boolean(process.env.CI);

// eslint-disable-next-line import/no-commonjs
module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverageFrom: ['src/**/*.{js,ts}', '!**/*.d.ts', '!**/__tests__/**'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: isCI,
  coverageReporters: ['text', isCI && 'lcov'].filter(Boolean),
  bail: isCI,
  transform: {
    '^.+\\.(js|tsx?)$': ['babel-jest', { rootMode: 'upward' }]
  }
};
