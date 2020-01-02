'use strict'; // eslint-disable-line strict

// eslint-disable-next-line import/no-commonjs
module.exports = api => {
  const isTest = api.cache(() => process.env.NODE_ENV === 'test');
  const babelEnv = api.cache(() => process.env.BABEL_ENV);
  const isNodeTarget = api.cache(() => process.env.BABEL_TARGET === 'node');

  const envTargets = isTest || isNodeTarget ? { node: 'current' } : undefined;

  const envOpts = {
    loose: true,
    modules: babelEnv === 'cjs' || isTest ? 'commonjs' : false,
    targets: envTargets,
    exclude: [
      'transform-typeof-symbol',
      'transform-regenerator',
      'transform-async-to-generator'
    ]
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
    !isNodeTarget && [
      '@babel/plugin-transform-regenerator',
      {
        async: false
      }
    ],
    [
      'transform-async-to-promises',
      {
        inlineHelpers: true
      }
    ],
    [
      '@babel/plugin-proposal-optional-chaining',
      {
        loose: false
      }
    ],
    [
      '@babel/plugin-proposal-nullish-coalescing-operator',
      {
        loose: false
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
