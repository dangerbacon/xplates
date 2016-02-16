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
    "  * @license " + pack.license.name + "\n" + 
    "  * @preserve \n **/\n";  
  
  //Read
  gulp.src('src/xplates.js').pipe(uglify()).pipe(insert.prepend(header)).pipe(rename('xplates-'+pack.version+'.min.js')).pipe(gulp.dest('dist'));
  gulp.src('src/xplates.js')               .pipe(insert.prepend(header)).pipe(rename('xplates-'+pack.version+'.js'    )).pipe(gulp.dest('dist'));
});