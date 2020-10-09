module.exports = {
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': '<rootDir>/babel-jest',
  },
  rootDir: './',
  testMatch: ['<rootDir>/(test.(js|jsx|ts|tsx))'],
  transformIgnorePatterns: [
    'node_modules/',
    '<rootDir>/(?:.+?)/dist/'  
  ],
  // setupFiles: ['dotenv/config']
}
