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
        files: ['test/*.js', 'lib/**/*.js'],
        tasks: ['flushredis', 'simplemocha']
      }
    }
  });

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-flush-redis');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['flushredis', 'simplemocha']);
};
