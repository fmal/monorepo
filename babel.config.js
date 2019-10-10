'use strict'; // eslint-disable-line strict

const MIN_IE_VERSION = 11;

// eslint-disable-next-line import/no-commonjs
module.exports = api => {
  const isTest = api.cache(() => process.env.NODE_ENV === 'test');
  const babelEnv = api.cache(() => process.env.BABEL_ENV);
  const isNodeTarget = api.cache(() => process.env.BABEL_TARGET === 'node');

  const envTargets =
    isTest || isNodeTarget ? { node: 'current' } : { ie: MIN_IE_VERSION };

  const envOpts = {
    loose: true,
    modules: babelEnv === 'cjs' || isTest ? 'commonjs' : false,
    targets: envTargets
  };

  const presets = [['@babel/preset-env', envOpts], '@babel/preset-typescript'];

  const plugins = [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    !isNodeTarget && [
      '@babel/plugin-transform-runtime',
      {
        regenerator: false,
        useESModules: babelEnv === 'es'
      }
    ],
    babelEnv === 'cjs' && 'babel-plugin-add-module-exports'
  ].filter(Boolean);

  return {
    presets,
    plugins,
    ignore: babelEnv === 'cjs' || babelEnv === 'es' ? ['**/__tests__/**'] : []
  };
};
