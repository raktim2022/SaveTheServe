export default {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: false,
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  transform: {}
};