module.exports = function(grunt) {
  grunt.initConfig({
    // Tests
    simplemocha: {
      options: {
        ui: 'bdd',
        reporter: 'tap'
      },

      all: { src: 'test/*_test.js' }
    },

    watch: {
      all: {
        files: ['test/*_test.js', 'lib/*.js'],
        tasks: ['flushredis', 'simplemocha']
      }
    }
  });

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-flush-redis');

  // Default task.
  grunt.registerTask('default', ['flushredis', 'simplemocha']);
};
