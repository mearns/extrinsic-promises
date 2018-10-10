module.exports = function (config) {
  config.set({
    mutator: 'javascript',
    packageManager: 'npm',
    reporters: ['html', 'baseline', 'clear-text', 'progress', 'dashboard'],
    testRunner: 'mocha',
    transpilers: ['babel'],
    testFramework: 'mocha',
    coverageAnalysis: 'off',
    mutate: ['src/**/*.js'],
    babelrcFile: '.babelrc'
  })
}
