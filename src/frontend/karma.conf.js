module.exports = function(config){
    config.set({

        basePath : './',

        files : [
            'app/bower_components/angular/angular.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/**/*.js',
            //'app/controller/**/*.js',
            //'app/directive/**/*.js'
            //'app/factory/**/*.js',
            //'app/service/**/*.js'
            'test/unit/**/*.js'
        ],

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        autoWatch : true,

        singleRun: false,

        frameworks: ['mocha', 'chai', 'sinon-chai'],

        browsers : ['PhantomJS'],

        plugins : [
            'karma-mocha',
            'karma-chai',
            'karma-coverage',
            'karma-sinon-chai',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-junit-reporter',
            'phantomjs',
            'karma-phantomjs-launcher'
        ],

        // preprocess matching files before serving them to the browser
        preprocessors: {
            'src/*.js': ['coverage']
        },

        coverageReporter: {
            type: 'text-summary',
            dir: 'coverage/'
        },

        // test results reporter to use
        reporters: ['progress', 'coverage']

    });
};
