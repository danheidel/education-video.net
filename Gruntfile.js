'use strict';

process.env.PHANTOMJS_EXECUTABLE = process.env.PHANTOMJS_EXECUTABLE || '/usr/local/opt/nvm/v0.10.26/bin/phantomjs';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-casper');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-mongoimport');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: ['build'],
      dev: {
        src: ['build/**/*']
      },
      prod: ['dist']
    },

    copy: {
      prod: {
        expand: true,
        cwd: 'site/static',
        src: ['css/*.css', '*.html', 'img/**/*' ],
        dest: 'dist/',
        flatten: false,
        filter: 'isFile'
      },
      dev: {
        expand: true,
        cwd: 'site/static',
        src: ['css/*.css', '*.html', 'images/**/*' ],
        dest: 'build/',
        flatten: false,
        filter: 'isFile'
      }
    },

    browserify: {
      prod: {
        src: ['site/js/*.js'],
        dest: 'dist/browser.js',
        options: {
          transform: ['debowerify'],
          debug: false
        }
      },
      dev: {
        src: ['site/js/*.js'],
        dest: 'build/browser.js',
        options: {
          transform: ['debowerify'],
          debug: true
        }
      }
    },

    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'app.js'
        }
      },
      prod: {
        options: {
          script: 'app.js',
          node_env: 'production'
        }
      },
      test: {
        options: {
          script: 'app.js'
        }
      }
    },
    simplemocha: {
      dev:{
        src:['test/*_test.js','!test/acceptance/*_test.js'],
        options:{
          reporter: 'spec',
          slow: 200,
          timeout: 1000
        }
      }
    },
    watch: {
      all: {
        files:['app.js', './**/*.js' ],
        tasks:['jshint']
      },
      express: {
        files:  [ 'app.js','site/**/*' ],
        tasks:  [ /*'sass:dev',*/ 'browserify:dev', 'express:dev' ],
        options: {
          // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions.
          // Without this option specified express won't be reloaded
          spawn: false
        },
      },
      options:{
        forever: false
      }
    },
    casper: {
      acceptance : {
        options : {
          test : true,
          //'log-level': 'debug'
        },
        files : {
          'test/acceptance/casper-results.xml' : ['test/acceptance/*_test.js']
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'server.js', 'api/**/*.js', 'app/**/*.js'],
      options: {
        jshintrc: true
      }
    },
    sass: {
      dist: {
        files: {'build/css/styles.css': 'app/assets/scss/styles.scss'}
      },
      dev: {
        options: {
          includePaths: ['site/scss/'],
          sourceComments: 'map'
        },
        files: {'build/css/styles.css': 'site/scss/styles.scss'}
      }
    },
    mongoimport: {
      options: {
        db : 'edu',
        //optional
        //host : 'localhost',
        //port: '27017',
        //username : 'username',
        //password : 'password',
        //stopOnError : false,
        collections : [
          {
            name: 'user',
            type: 'json',
            file: 'db/seeds/users.json',
            jsonArray: true,
            upsert: true,
            drop: true
          },
          {
            name : 'creators',
            type : 'json',
            file : 'db/seeds/creators.json',
            jsonArray : true,  //optional
            upsert : true,  //optional
            drop : true  //optional
          },
          {
            name : 'channels',
            type :'json',
            file : 'db/seeds/channels.json',
            jsonArray : true,
            upsert : true,
            drop : true
          }
        ]
      }
    }
  });

  grunt.registerTask('build:dev',  ['clean:dev', /*'sass:dev',*/ 'browserify:dev', 'jshint:all', 'copy:dev']);
  grunt.registerTask('build:prod', ['clean:prod', 'browserify:prod', 'jshint:all', 'copy:prod']);
  grunt.registerTask('test', ['jshint', 'simplemocha:dev']);
  grunt.registerTask('server', [ 'build:dev', 'express:dev','watch:express' ]);
  grunt.registerTask('test:acceptance',['express:dev','casper']);
  grunt.registerTask('default', ['jshint', 'test','watch:express']);

};
