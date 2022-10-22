/*
config for the build in server browser-sync for mocha / chai unit testing.
*/
module.exports = {
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: ['test','src'],
      routes: {
        '/node_modules': 'node_modules',
        '/src': 'src',
        '/games': 'games'
      }
    }
};