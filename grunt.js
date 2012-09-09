module.exports = function(grunt) {
  grunt.initConfig({
    // Tests
    mocha: {
      all: {
        src: 'test/*_test.js',
        options: {
          ui: 'bdd',
          reporter: 'tap'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-simple-mocha');

  // Default task.
  grunt.registerTask('default', 'mocha');
};
