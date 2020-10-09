const babelJest = require('babel-jest')
// reason for this setup 
// @see https://github.com/facebook/jest/issues/6573
module.exports = babelJest.createTransformer({
  configFile: './tests/.babelrc',
})
