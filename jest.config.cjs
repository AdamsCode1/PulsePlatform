module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.[jt]s?(x)'],
  moduleFileExtensions: ['js', 'ts', 'json'],
  setupFiles: ['dotenv/config'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
