/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const baseConfig = require('./jest.base');
module.exports = {
  ...baseConfig,
  projects: [
      "packages/*",
    ]
  };  
