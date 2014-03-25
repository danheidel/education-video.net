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
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-mongo-drop');
  grunt.loadNpmTasks('grunt-mocha-cov');
  grunt.loadNpmTasks('grunt-concurrent');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    env: {
      options: {
      },
      dev: {
        NODE_ENV: 'development'
      },
      test: {
        NODE_ENV: 'test'
      }
    },

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
        cwd: 'site',
        src: ['css/*.css', '*.html', 'images/**/*' ],
        dest: 'dist/',
        flatten: false,
        filter: 'isFile'
      },
      dev: {
        expand: true,
        cwd: 'site',
        src: ['css/*.css', '*.html', 'images/**/*' ],
        dest: 'build/',
        flatten: false,
        filter: 'isFile'
      }
    },

    browserify: {
      prod: {
        src: ['site/*.js'],
        dest: 'dist/browser.js',
        options: {
          transform: ['debowerify','hbsfy'],
          debug: false
        }
      },
      dev: {
        src: ['site/js/*.js'],
        dest: 'build/browser.js',
        options: {
          transform: ['debowerify','hbsfy'],
          debug: true
        }
      }
    },

    notify: {
      server: {
        options: {
          message: 'Server is ready'
        }
      },
      express: {
        options: {
          message: 'express is ready'
        }
      },
      watch: {
        options: {
          message: 'watch'
        }
      }
    },

    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'app.js',
          node_env: 'development'
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
          script: 'app.js',
          node_env: 'test'
        }
      }
    },
    simplemocha: {
      test:{
        src:['test/*_test.js','!test/acceptance/*_test.js'],
        options:{
          reporter: 'spec',
          slow: 200,
          timeout: 1000,
          node_env: 'test'
        }
      }
    },

    mochacov: {
      coverage: {
        options: {
          reporter: 'mocha-term-cov-reporter',
          coverage: true
        }
      },
      coveralls: {
        options: {
          coveralls: {
            serviceName: 'travis-ci'
          }
        }
      },
      unit: {
        options: {
          reporter: 'spec',
          require: ['chai']
        }
      },
      html: {
        options: {
          reporter: 'html-cov',
          require: ['chai']
        }
      },
      options: {
        files: 'test/*.js',
        ui: 'bdd',
        colors: true
      }
    },

    watch: {
      all: {
        files:['app.js', './**/*.js' ],
        tasks:['jshint']
      },
      express: {
        files:  [ 'app.js','api/**/*','site/**/*','site/*.js' ],
        tasks:  [ 'clean', 'copy', 'sass:dev', 'browserify:dev', 'express:dev' ],
        options: {
          // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions.
          // Without this option specified express won't be reloaded
          spawn: false
        }
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
      all: ['Gruntfile.js', 'app.js', 'api/**/*.js', 'site**/*.js'],
      options: {
        jshintrc: true
      }
    },
    sass: {
      dist: {
        files: {'build/css/styles.css': 'site/scss/styles.scss'}
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
        db : 'oaa-test',
        //optional
        //host : 'localhost',
        //port: '27017',
        //username : 'username',
        //password : 'password',
        //stopOnError : false,
        collections : [
          {
            name : 'users',
            type : 'json',
            file : 'db/seeds/users.json',
            jsonArray : true,  //optional
            upsert : true,  //optional
            drop : true  //optional
          },
          {
            name : 'meetings',
            type :'json',
            file : 'db/seeds/meetings.json',
            jsonArray : true,
            upsert : true,
            drop : true
          }
        ]
      }
    },
    concurrent: {
      buildDev: [/*'sass:dev',*/ 'browserify:dev', 'jshint:all']
    },
    mongo_drop: {
      test: {
        'uri' : 'mongodb://localhost/education-test'
      }
    }
  });

  grunt.registerTask('build:dev', ['clean:dev', 'concurrent:buildDev', 'copy:dev']);
  grunt.registerTask('build:prod', ['clean:prod', 'browserify:prod', 'jshint:all', 'copy:prod']);
  grunt.registerTask('test:prepare', ['mongo_drop', 'mongoimport']);
  grunt.registerTask('test', ['env:test', 'jshint', 'mochacov:unit','mochacov:coverage' ]);
  grunt.registerTask('travis', ['jshint', 'mochacov:unit', 'mochacov:coverage', 'mochacov:coveralls']);
  grunt.registerTask('server', [ 'env:dev', 'build:dev', 'express:dev', 'watch:express','notify' ]);
  grunt.registerTask('test:acceptance',['build:dev', 'express:dev', 'casper']);
  grunt.registerTask('default', ['jshint', 'test','watch:express']);
};
