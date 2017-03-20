/**
 * Created by Ada on 2017/3/12.
 */
'use strict'
var gulp = require('gulp')
var $G=require('gulp-load-plugins')({
    lazyload: true,//用到这个插件的时候再去require，默认为true

})

gulp.task('minify-html', function(){
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    var stream=gulp.src('server/views/**/*.ejs')
        .pipe($G.htmlmin(options))
        .pipe(gulp.dest('dist/server/views'));
    //返回stream告知task完成
    return stream
});


gulp.task('minify-css', function(){
/*    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };*/
//webpack打包后的css

    var stream= gulp.src('client/*.css')
        .pipe($G.minifyCss())
        .pipe(gulp.dest('dist/client'));
    //返回stream告知task完成
    return stream
});

gulp.task('server-es6', function() {
    gulp.src(['server/**/*.js','!server/**/*not_used*.js','!server/view'])
        .pipe($G.babel({
            presets: ["es2015","stage-0"],
            compact:false,
        }))
		.pipe($G.uglify({
            
        }))
        .pipe(gulp.dest('dist/server/'));
});

/***************        maintain需要(用到其中的shaLua)         ************/
gulp.task('maintain-es6', function() {
    gulp.src(['maintain/preLaunch/*.js'])
        .pipe($G.babel({
            presets: ["es2015","stage-0"],
            compact:false,
        }))
        .pipe($G.uglify({

        }))
        .pipe(gulp.dest('dist/maintain/preLaunch'));
});

gulp.task('client-es6', function() {
    gulp.src(['client/own**.js'])
        .pipe($G.babel({
            presets: ["es2015","stage-0"],
            compact:false,
        }))
        .pipe($G.ngmin({})) //对angular的注入进行处理，以便可以uglify（压缩变量名）
        .pipe($G.uglify({

        }))
        .pipe(gulp.dest('dist/client/'));
	gulp.src(['client/vendor**.js'])
        .pipe($G.babel({
            presets: ["es2015","stage-0"],
            compact:false,
        }))
        .pipe($G.uglify({
        }))
        .pipe(gulp.dest('dist/client/'));
});

gulp.task('default',['minify-html','minify-css','server-es6','client-es6'],function(){

})
