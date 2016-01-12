# gulp-babel-compile

Simple plugin for server compiling.

## Install

```
$ npm install --save-dev gulp-babel-compile babel-preset-es2015
```


## Usage

Compiling ES6 code from '/src/' folder to '/out/' folder with sourcemaps.

```js
const gulp = require('gulp');
const babel = require('gulp-babel-compile');

gulp.task('default', () => {
	
    watch('src/**/*.js', () => {
        gulp.src('src/**/*.js')
            .pipe(babel({
                presets: ['es2015'],
                sourceMap: true,
                sourceRoot: 'src'
            }))
            .pipe(gulp.dest('out'));
	});
});
```
