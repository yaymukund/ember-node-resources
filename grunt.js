module.exports = function(grunt) {
  grunt.initConfig({
    // Tests
    simplemocha: {
      all: {
        src: 'test/*_test.js',
        options: {
          ui: 'bdd',
          reporter: 'tap'
        }
      }
    },

    watch: {
      all: {
        files: ['test/*_test.js', 'lib/*.js'],
        tasks: 'flushredis simplemocha'
      }
    }
  });

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-flush-redis');

  // Default task.
  grunt.registerTask('default', 'flushredis simplemocha');
};
