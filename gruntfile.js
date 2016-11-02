module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
            ' * SoundCloudPlayer v<%= pkg.version %>\n' +
            ' * Copyright 2015-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' */\n',

     //Clean release folder
     clean: {
       contents: 'release/'
     },

     copy: {
        view: {
          expand: true,
          cwd: 'app/view/',
          src: '**',
          dest: 'release/app/view/',
        },
        lib: {
          expand: true,
          cwd: 'public/lib/',
          src: '**',
          dest: 'release/public/lib/',
        },
        font: {
          expand: true,
          cwd: 'public/style/font/',
          src: '**',
          dest: 'release/public/style/font/',
        },
        icons: {
          expand: true,
          cwd: 'public/icons/',
          src: '**',
          dest: 'release/public/icons/',
        },
        files: {
          files: [
            {cwd: 'app/', src: 'app.js', dest: 'release/app/', expand: true},
            {cwd: '', src: 'popup.html', dest: 'release/', expand: true},
            {cwd: '', src: 'background.html', dest: 'release/', expand: true},
            {cwd: '', src: 'manifest.json', dest: 'release/', expand: true},
            {cwd: '', src: 'redirect.html', dest: 'release/', expand: true},
            {cwd: '', src: 'window_mode.html', dest: 'release/', expand: true}
          ]
        }
     },

     less: {
        development: {
            options: {
                paths: ["assets/css"]
            },
            files: {"public/style/theme.css": "public/style/theme.less"}
        },
     },

     concat: {
        options: {
            banner: '<%= banner %>',
            stripBanners: false
        },
        background: {
          src: [
            'app/background/background.js',
            'app/background/APIHelper.js',
            'app/background/player.js',
            'app/background/playerHelper.js',
            'app/background/scHelper.js',
            'app/background/init.js'
          ],
          dest: 'release/app/js/background.js'
        },
        controllers: {
          src: [
            'app/controller/homeTabController.js',
            'app/controller/itemsController.js',
            'app/controller/loginController.js',
            'app/controller/playerController.js',
            'app/controller/playListTabController.js',
            'app/controller/settingsTabController.js',
            'app/controller/stateController.js',
            'app/controller/tracksTabController.js'
          ],
          dest: 'release/app/js/controllers.js'
        },
        styles : {
           src: ['public/style/*.css'],
           dest: 'release/public/style/style.css'
        }
     },

     uglify: {
        app: {
            files: {
              'release/app/app.js': 'release/app/app.js'
            }
        },
        background: {
            files: {
              'release/app/js/background.js': 'release/app/js/background.js'
            }
        },
        controllers: {
            files: {
              'release/app/js/controllers.js': 'release/app/js/controllers.js'
            }
        },
        soundcloud: {
            files: {
              'release/public/lib/soundmanager2.js': 'release/public/lib/soundmanager2.js'
            }
        }
     },

     cssmin: {
        options: {
            shorthandCompacting: false,
            roundingPrecision: -1
        },
        target: {
            files: {
              'release/public/style/style.css': 'release/public/style/style.css'
            }
        }
    }

  });

  require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
  require('time-grunt')(grunt);

  grunt.registerTask('build', ['clean','copy', 'less', 'concat']);
  grunt.registerTask('release', ['build', 'uglify', 'cssmin']);
};
