module.exports = function(grunt) {
  grunt.initConfig({
    watch: {
      files: [
        './js/**/*.js',
        './js/**/*.jsx'
      ],
      tasks: ["browserify"],
      options: {
        spawn: false,
      },
    },
    browserify: {
      dist: {
        files: {
          'public/js/bundle.js': ['js/app.jsx']
        },
        options: {
          transform: [['babelify', {
            presets: ["es2015", "react"],
            plugins: ["transform-class-properties"]
          }], "brfs"]
        }
      }
    },
    /*
    uglify: {
      options: {
        mangle: false,
        compress: false
      },
      js: {
        files: {
          './build/prod/bundles/bg.js': _addPrefix(scripts.bg, "./build/prod/"),
          './build/prod/bundles/newtab.js': _addPrefix(scripts.newtab, "./build/prod/"),
          './build/prod/bundles/options.js': _addPrefix(scripts.options, "./build/prod/"),
          './build/prod/bundles/install_eversync.js': _addPrefix(scripts.install_eversync, "./build/prod/"),
        }
      }
    },
    cssmin: {
      target: {
        files: {
          './build/prod/bundles/newtab.css': _addPrefix(styles.newtab, "./build/prod/"),
          './build/prod/bundles/options.css': _addPrefix(styles.options, "./build/prod/"),
        }
      }
    },
    clean: {
      prod: ["./build/prod/styles", "./build/prod/js"]
    },*/
    copy: {
      deps: {
        files: [
          {
            expand: true,
            cwd: "bower_components/framework7/dist/js",
            src: "**",
            dest: "./public/js/framework7/"
          },
          {
            expand: true,
            cwd: "bower_components/framework7/dist/css",
            src: "**",
            dest: "./public/css/framework7/"
          },
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
};