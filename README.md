# monorepo

📦 A monorepo for my NPM libraries.
Managed with [repo-cooker](https://github.com/cerebral/repo-cooker) library.
Using [Jest](https://github.com/facebook/jest), [eslint](https://github.com/eslint/eslint), [prettier](https://github.com/prettier/prettier) and TypeScript through [babel](https://github.com/babel/babel) 7. Semantically versioned and automatically released, following [conventional-commits](https://github.com/conventional-commits/conventionalcommits.org)!

## 🛠 Tasks

- `npm run commit` guide you through creating commits with correct commit messages
- `npm run checkdeps` check if all dependencies are correctly installed and in sync
- `npm run fixdeps` add missing dependencies to the monorepo when you add or upgrade dependencies for your packages
- `npm test` run the tests for all packages
- `npm run test:coverage` run tests across packages and output coverage
- `npm run lint` check for linting errors
- `npm run typecheck` check if the types of your packages are correct
- `npm run build` compile source for all packages
- `npm run release` build & publish using `repo-cooker --release`
- `npm run link` an alias for `repo-cooker --link` which symlinks dependencies. This is automatically run through the `postinstall` hook when you do `npm install`

To compile source or run tests for an individual package, `npm run build` or `npm run test` from the package root.
