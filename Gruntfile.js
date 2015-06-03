module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['bower_components/jquery/dist/jquery.min.js',
                    'bower_components/d3/d3.min.js',
                    'src/feature-viewer.js'
                ],
                dest: 'dist/feature-viewer.bundle.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/feature-viewer.js',
                dest: 'dist/feature-viewer.min.js'
            }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    livereload: true,
                    base: '.'
                }
            }
        },
        watch: {
            all: {
                options: {livereload: true},
                files: ['*.js']
            }
        }
    });



    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bump');


    // Default task(s).
    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('concating', ['concat']);
    grunt.registerTask('serve', ['connect:server','watch']);

};