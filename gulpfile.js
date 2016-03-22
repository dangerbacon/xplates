var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var insert = require('gulp-insert');

//Build is only task
gulp.task('default', function()
{
  //Read package
  var pack = require('./package.json');
  
  //Header
  var header = 
    "/** XPlates version " + pack.version + "\n" +
    "  * @license " + pack.license + "\n" + 
    "  * @preserve \n **/\n";  
  
  //Read
  var ops = { mangle: { except: ['__xphtmlchars','__xphtmlescape','__xphtmlreplace'] } };
  gulp.src('lib/xplates.js').pipe(uglify(ops)).pipe(insert.prepend(header)).pipe(rename('xplates-'+pack.version+'.min.js')).pipe(gulp.dest('dist'));
  gulp.src('lib/xplates.js')                  .pipe(insert.prepend(header)).pipe(rename('xplates-'+pack.version+'.js'    )).pipe(gulp.dest('dist'));
});