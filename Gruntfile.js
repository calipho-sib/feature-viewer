module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            basic: {
                src: [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/d3/d3.min.js',
                    'bower_components/bootstrap/js/tooltip.js',
                    'bower_components/bootstrap/js/popover.js',
                    'src/feature-viewer.js'
                ],
                dest: 'dist/feature-viewer.bundle.js'
            },
            nextP: {
                src: [
                    'dist/feature-viewer.bundle.js',
                    'bower_components/nextprot/src/nextprot-core.js',
                    'bower_components/nextprot/src/nextprot-utils.js',
                    'src/fv.nextprot.js'
                ],
                dest: 'dist/feature-viewer.nextprot.js'
            },
            css: {
                src: [
                    'bower_components/bootstrap/dist/css/bootstrap.min.css',
                    'css/style.css'
                ],
                dest: 'dist/feature-viewer.min.css'
            }
            
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'https://github.com/calipho-sib/feature-viewer.git',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            basic: {
                src: 'src/feature-viewer.js',
                dest: 'dist/feature-viewer.min.js'
            },
            nextprot: {
                src: 'dist/feature-viewer.nextprot.js',
                dest: 'dist/feature-viewer.nextprot.js'
            },
            bundle: {
                src: 'dist/feature-viewer.bundle.js',
                dest: 'dist/feature-viewer.bundle.js'
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
    grunt.registerTask('prod', ['concat','uglify']);
    grunt.registerTask('serve', ['connect:server','watch']);

};