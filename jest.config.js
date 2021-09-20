const {
  resolve
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require('path');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['**/*.{ts}', '!**/node_modules/**', '!**/lib/**', '!**/vendor/**'],
  moduleNameMapper: {
    '^@oauth2/(.*)$': resolve(__dirname, './src/oauth2/$1'),
    '^@auth/(.*)$': resolve(__dirname, './src/auth/$1'),
    '^@shared/(.*)$': resolve(__dirname, './src/shared/$1')
  }
};
