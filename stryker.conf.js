module.exports = function (config) {
  config.set({
    files: [
      {
        pattern: 'dist/src/**/*.js',
        mutated: true,
        included: false
      },
      'dist/test/**/*.js'
    ],
    testRunner: 'mocha',
    mutator: 'es5',
    transpilers: [],
    reporter: ['html', 'clear-text', 'progress'],
    testFramework: 'mocha',
    coverageAnalysis: 'perTest'
  })
}
