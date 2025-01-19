// spec/support/junit-reporter.js
const JasmineReporters = require('jasmine-reporters');

// add a reporter
jasmine.getEnv().addReporter(
    new JasmineReporters.JUnitXmlReporter({
        savePath: './reports',
        filePrefix: 'junit-report',
        consolidate: true,
        consolidateAll: true
    })
);
