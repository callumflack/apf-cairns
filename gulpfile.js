// -----------------------------------------------
//
//   Gulpfile.
//   Based on: https://github.com/drewbarontini/noise
//
// -----------------------------------------------

// Available tasks:
//   `gulp`
//   `gulp build`
//   `gulp compile:coffee`
//   `gulp compile:sass`
//   `gulp connect`
//   `gulp icons`
//   `gulp images`
//   `gulp lint:coffee`
//   `gulp lint:sass`
//   `gulp minify:css`
//   `gulp minify:js`
//   `gulp test:css`
//   `gulp test:js`

// …run from these plugins:
// gulp              : The streaming build system
// gulp-autoprefixer : Prefix CSS
// gulp-coffee       : Compile CoffeeScript files
// gulp-coffeelint   : Lint your CoffeeScript
// gulp-concat       : Concatenate files
// gulp-connect      : Gulp plugin to run a webserver (with LiveReload)
// gulp-csscss       : CSS redundancy analyzer
// gulp-jshint       : JavaScript code quality tool
// gulp-load-plugins : Automatically load Gulp plugins
// gulp-minify-css   : Minify CSS
// gulp-parker       : Stylesheet analysis tool
// gulp-plumber      : Prevent pipe breaking from errors
// gulp-purify       : Replacement for uncss: https://github.com/purifycss/purifycss
// gulp-rename       : Rename files
// gulp-sass         : Compile Sass
// gulp-sass-lint    : Lint Sass
// gulp-svgmin       : Minify SVG files
// gulp-svgstore     : Combine SVG files into one
// gulp-uglify       : Minify JavaScript with UglifyJS
// gulp-util         : Utility functions
// gulp-watch        : Watch stream
// run-sequence      : Run a series of dependent Gulp tasks in order

// ToDo:
// - linting
// - gzip (https://github.com/jstuckey/gulp-gzip)
// - zopfli gzip (eg. pngs) (https://github.com/romeovs/gulp-zopfli)


var gulp    = require( 'gulp' );
var run     = require( 'run-sequence' );
var plugins = require( 'gulp-load-plugins' )({
    lazy: true,
    rename : {
        'gulp-sass-lint'   : 'sasslint',
        'gulp-svg-symbols' : 'svgsymbols',
        'psi'              : 'pagespeedindex'
    }
});


// -----------------------------------------------
//   Options
// -----------------------------------------------

var options = {

    // ---- Primary batched --- //

    default : {
        tasks : [ 'build', 'watch' ]
    },

    build : {
        tasks : [ 'images', 'compile:sass' ],
        destination : 'public/'
    },

    production : {
        tasks : [ 'build', 'minify:css', 'minify:js' ]
    },

    connect : {
        port : 9000,
        base : 'http://localhost',
        root : 'assets'
    },

    // ---- Alphabetical --- //

    css : {
        files       : 'public/styles/*.css',
        file        : 'public/styles/application.css',
        destination : 'public/styles'
    },

    icons : {
        files       : 'src/icons/ic-*.svg',
        destination : 'public/icons'
    },

    images : {
        files       : 'src/images/*',
        destination : 'public/images'
    },

    js : {
        files : [
            'node_modules/fontfaceonload/dist/fontfaceonload.js',
            'src/scripts/*.js'
        ],
        file        : 'src/scripts/application.js',
        destination : 'public/scripts'
    },

    sass : {
        files       : 'src/styles/*.scss',
        destination : 'public/styles'
    },

    watch : {
        files : function() {
            return [
                options.images.files,
                // options.js.files,
                options.sass.files
            ]
        },
        run : function() {
            return [
                [ 'images' ],
                // [ 'minify:js' ],
                [ 'compile:sass' ]
            ]
        }
    }
}


// -----------------------------------------------
//   Primary tasks
// -----------------------------------------------

gulp.task( 'default', options.default.tasks );

gulp.task( 'build', function() {
    options.build.tasks.forEach( function( task ) {
        gulp.start( task );
    } );
});

gulp.task( 'production', options.production.tasks );

gulp.task( 'connect', function() {
    plugins.connect.server( {
        root       : [ options.connect.root ],
        port       : options.connect.port,
        base       : options.connect.base,
        livereload : true
    } );
});


// -------------------------------------
//   Image & icons tasks
// -------------------------------------

// currently broken, awaiting update:
// https://github.com/sindresorhus/gulp-imagemin/issues/221
gulp.task( 'images', function() {
    gulp.src( options.images.files )
        // .pipe( plugins.cache( plugins.imagemin({ })))
        .pipe( plugins.imagemin({
            progressive: true,
            interlaced: true
        }))
        .pipe( gulp.dest( options.images.destination ) )
        .pipe( plugins.size({title: 'images'}) );
});

// Creates SVG sprite and demo page.
// Alt: https://github.com/Hiswe/gulp-svg-symbols & OUI
gulp.task( 'icons', function() {
    gulp.src( options.icons.files )
        .pipe( plugins.svgmin() )
        .pipe( plugins.svgstore( { inlineSvg: true } ) )
        .pipe( gulp.dest( options.icons.destination ) );
});


// -------------------------------------
//   Stylesheet tasks
// -------------------------------------

gulp.task( 'compile:sass', function() {
    gulp.src( options.sass.files )
        // .pipe( plugins.plumber() )
        // .pipe( plugins.sourcemaps.init() )
        // .pipe( plugins.sass().on('error', sass.logError))
        .pipe( plugins.sass( {
            indentedSyntax: true,
            errLogToConsole: true
        } ) )
        .pipe( plugins.autoprefixer( {
                // http://www.analog-ni.co/my-css-autoprefixer-settings-for-ie9-and-up
                browsers: [
                    'last 2 versions',
                    'Explorer >= 9',
                    'iOS >= 5',
                    'Safari >= 5',
                    'OperaMobile >= 11',
                    'ChromeAndroid >= 9',
                    'ExplorerMobile >= 9'
                ],
                cascade  : false
        } ) )
        .pipe( plugins.sourcemaps.write() )
        .pipe( gulp.dest( options.sass.destination ) )
        .pipe( plugins.size({title: 'styles'}) )
        .pipe( plugins.connect.reload() );
});

gulp.task( 'lint:sass', function() {
    gulp.src( options.sass.files )
        .pipe( plugins.plumber() )
        .pipe( plugins.sasslint() )
        .pipe( plugins.sasslint.format() )
        .pipe( plugins.sasslint.failOnError() );
} );

// gulp.task( 'minify:css', function () {
//     gulp.src( options.css.file )
//         .pipe( plugins.plumber() )
//         .pipe( plugins.uncss ( {
//             // for Jekyll:
//             html: [
//                 '_site/**/*.html'
//             ],
//             uncssrc: '.uncssrc'
//         } ) )
//         .pipe( plugins.cssnano( { advanced: false } ) )
//         .pipe( plugins.rename( { suffix: '.min' } ) )
//         .pipe( gulp.dest( options.css.destination ) )
//         .pipe( plugins.size({title: 'styles'}) )
//         .pipe( plugins.connect.reload() );
// });

// purify
gulp.task( 'minify:css' , function() {
    return gulp.src( options.css.file )
        .pipe( plugins.plumber() )
        .pipe( plugins.purifycss(['./public/scripts/**/*.js', './_site/**/*.html']))
        .pipe( plugins.cssnano( { advanced: false } ) )
        .pipe( plugins.rename( { suffix: '.min' } ) )
        .pipe( gulp.dest( options.css.destination ) )
        .pipe( plugins.size({title: 'styles'}) )
});

gulp.task( 'test:css', function() {
    gulp.src( options.css.file )
        .pipe( plugins.plumber() )
        .pipe( plugins.parker() )
    gulp.src( options.css.file )
        .pipe( plugins.plumber() )
        .pipe( plugins.csscss() )
});


// -------------------------------------
//   Javascript tasks
// -------------------------------------

gulp.task( 'minify:js', function () {
    gulp.src( options.js.files )
        .pipe( plugins.plumber() )
        .pipe( plugins.concat('application.js') )
        .pipe( plugins.uglify() )
        .pipe( plugins.rename( { suffix: '.min' } ) )
        .pipe( gulp.dest( options.js.destination ) )
        .pipe( plugins.connect.reload() );
});

gulp.task( 'test:js', function() {
    gulp.src( options.js.file )
        .pipe( plugins.plumber() )
        .pipe( plugins.jshint() )
        .pipe( plugins.jshint.reporter( 'default' ) )
});


// -------------------------------------
//   Watch task
// -------------------------------------

gulp.task( 'watch', function() {
    var watchFiles = options.watch.files();
    watchFiles.forEach( function( files, index ) {
        gulp.watch( files, options.watch.run()[ index ]  );
    } );
});
