// Karma configuration
// Generated on Mon Feb 23 2015 15:47:55 GMT+1100 (AEDT)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        plugins: [
            'karma-chrome-launcher',
            //'karma-jquery',
            //'jasmine-jquery',
            //'karma-jasmine-jquery',
            'karma-jasmine',
            'karma-coverage',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher'
        ],


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [
            'jasmine'
            //,'jasmine-jquery'
            ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'web-app/js/**/*.js': ['coverage']
        },

        // list of files / patterns to load in the browser
        files: [
            'web-app/vendor/leaflet-0.7.7/*.js',
            'web-app/vendor/**/*.js',
            'web-app/js/**/*.js',
            'test/js/vendor/**/*.js',
            'test/js/specs/**/*.js'
        ],


        // list of files to exclude
        exclude: [],


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome','Firefox','PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
