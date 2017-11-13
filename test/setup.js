/* globals console, require, run */
//var System = require('jspm');

System.import('test/spec/test.js')
    .then(function(m) {
        run();
    })
    .catch(function(e) {
        console.error(e);
        run();
    });