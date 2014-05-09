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
      prod: {
        NODE_ENV: 'production'
      },
      dev: {
        NODE_ENV: 'development',
        NODEUSERID: '1000',
        NODESERVERPORT: '3000'
      },
      test: {
        NODE_ENV: 'test',
        NODEUSERID: '1000',
        NODESERVERPORT: '3000',
        SESSION_SECRET: 'test'
      }
    },

    clean: {
      test: {
        src: ['build/**/*']
      },
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
      },
      test: {
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
        src:['test/mocha/*_test.js','!test/acceptance/*_test.js'],
        options:{
          reporter: 'spec',
          slow: 200,
          timeout: 2000,
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
        tasks:  [ 'clean', 'copy', /*'sass:dev',*/ 'browserify:dev', 'express:dev' ],
        options: {
          // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions.
          // Without this option specified express won't be reloaded
          spawn: false,
          debounceDelay:1000
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
      all: ['Gruntfile.js', 'app.js', 'api/**/*.js', 'site**/*.js', '!api/db/**/*.js'],
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
        db : 'education-test',
        collections : [
          {
            name : 'tags',
            type : 'json',
            file : 'api/db/seeds/tags.json',
            jsonArray : true,  //optional
            //upsert : true,  //optional
            drop : true  //optional
          },
          {
            name : 'creators',
            type : 'json',
            file : 'api/db/seeds/creators.json',
            jsonArray : true,  //optional
            upsert : true,  //optional
            drop : true  //optional
          },
          {
            name : 'channels',
            type :'json',
            file : 'api/db/seeds/channels.json',
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

  grunt.registerTask('build:test', ['clean:test', 'concurrent:buildDev', 'copy:dev']);
  grunt.registerTask('build:dev', ['clean:dev', 'concurrent:buildDev', 'copy:dev']);
  grunt.registerTask('build:prod', ['clean:prod', 'browserify:prod', 'jshint:all', 'copy:prod']);
  grunt.registerTask('test:prepare', ['mongo_drop', 'mongoimport']);
  grunt.registerTask('test', ['env:test', 'simplemocha']);
  grunt.registerTask('test:cover', ['env:test', 'jshint', 'mochacov:unit','mochacov:coverage' ]);
  grunt.registerTask('travis', ['jshint', 'mochacov:unit', 'mochacov:coverage', 'mochacov:coveralls']);
  grunt.registerTask('server', [ 'env:dev', 'build:dev', 'express:dev', 'watch:express','notify' ]);
  grunt.registerTask('server:test', [ 'env:test', 'jshint', 'build:test', 'express:test', 'watch:express','notify' ]);
  grunt.registerTask('test:acceptance',['build:dev', 'express:dev', 'casper']);
  grunt.registerTask('default', ['jshint', 'test','watch:express']);
};
