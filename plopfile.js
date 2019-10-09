'use strict'; // eslint-disable-line strict

// eslint-disable-next-line import/no-commonjs
module.exports = function(plop) {
  // add new package
  plop.setGenerator('package', {
    description: 'This sets up the basic files for a new package.',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'name of new package'
      }
    ],
    actions: [
      {
        type: 'add',
        path: `packages/@fmal/{{kebabCase name}}/package.json`,
        templateFile: 'plop-templates/package/package.json.hbs'
      },
      {
        type: 'add',
        path: `packages/@fmal/{{kebabCase name}}/README.md`,
        templateFile: 'plop-templates/package/README.md.hbs'
      },
      {
        type: 'add',
        path: `packages/@fmal/{{kebabCase name}}/tsconfig.json`,
        templateFile: 'plop-templates/package/tsconfig.json.hbs'
      },
      {
        type: 'add',
        path: `packages/@fmal/{{kebabCase name}}/tsconfig.gentypes.json`,
        templateFile: 'plop-templates/package/tsconfig.gentypes.json.hbs'
      },
      {
        type: 'add',
        path: `packages/@fmal/{{kebabCase name}}/jest.config.js`,
        templateFile: 'plop-templates/package/jest.config.js.hbs'
      },
      {
        type: 'add',
        path: `packages/@fmal/{{kebabCase name}}/src/index.ts`,
        templateFile: 'plop-templates/package/src/index.ts.hbs'
      },
      {
        type: 'add',
        path: `packages/@fmal/{{kebabCase name}}/src/__tests__/index.spec.ts`,
        templateFile: 'plop-templates/package/src/__tests__/index.spec.ts.hbs'
      },
      {
        type: 'add',
        path: `packages/@fmal/{{kebabCase name}}/src/__tests__/.eslintrc.json`,
        templateFile: 'plop-templates/package/src/__tests__/.eslintrc.json.hbs'
      }
    ]
  });
};
