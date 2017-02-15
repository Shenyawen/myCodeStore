// 载入插件
var gulp = require('gulp');
var minifycss = require('gulp-minify-css');	// 压缩css
var uglify = require('gulp-uglify'); // 压缩js
var concat = require('gulp-concat'); // 合并文件
var rename = require('gulp-rename'); // 文件重命名
var header = require('gulp-header'); // 文件添加头注释
var autoprefixer = require('gulp-autoprefixer'); // 自动添加css样式后缀
var clean = require('gulp-clean'); // 清除文件
var less = require('gulp-less'); // 编译less文件
var htmlmin = require('gulp-htmlmin'); // html压缩
var imagemin = require('gulp-imagemin');
var watch = require('gulp-watch');
var sequence = require('gulp-sequence'); // 定义异步并行队列
var runSequence = require('run-sequence');
// 引入 rev revCollector 模块 版本号控制
var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');
// 文件地图
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create(); // 开启本地服务器
var reload = browserSync.reload;

// 确定任务

// 区分两个模式：开发模式和生产模式
	var pkg = require('./package.json');
	var banner = ['/**',
		' * <%= pkg.name %> - <%= pkg.description %>',
		' * @version v<%= pkg.version %>',
		' * @link <%= pkg.homepage %>',
		' * @license <%= pkg.license %>',
		' */',
		''].join('\n');
// 1)开发模式
	// 合并公共文件(js/css)
	gulp.task('combineLibs',function(){
		gulp.src('./src/assets/common/scripts/*.js')
			.pipe(concat('libs.min.js'))
			.pipe(uglify())
			.pipe(header(banner, { pkg : pkg } ))
			.pipe(gulp.dest('dist/scripts'))
			.pipe(reload({ stream: true }));
		gulp.src('./src/assets/common/styles/*.css')
			.pipe(concat('libs.min.css'))
			.pipe(minifycss())
			.pipe(header(banner, { pkg : pkg } ))
			.pipe(gulp.dest('./dist/styles'))
			.pipe(reload({ stream: true }));
	})		
	// 复制移动文件
	gulp.task('copy', function(){
		gulp.src('./src/html/*.html')
			.pipe(gulp.dest('dist'))
			.pipe(reload({ stream: true }))
		gulp.src('./src/assets/styles/*.css')
			.pipe(minifycss())
			.pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest('dist/styles'))
			.pipe(reload({ stream: true }))
		gulp.src('./src/assets/scripts/*.js')
			.pipe(uglify())
			.pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest('dist/scripts'))
			.pipe(reload({ stream: true }))
		gulp.src('./src/images/*')
			.pipe(gulp.dest('./dist/images'))
			.pipe(reload({ stream: true }))
		// 移动fonts字体图标
		gulp.src('./src/assets/common/styles/fonts/*')
			.pipe(gulp.dest('./dist/styles/fonts'))
	})
	// 样式文件
		// 压缩css文件
		gulp.task('cssmin',function(){
			gulp.src('./src/css/*.css')
				.pipe(sourcemaps.init())
				.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
				.pipe(minifycss())
				.pipe(rename({suffix: '.min'}))
				.pipe(sourcemaps.write())
				.pipe(gulp.dest('./dist/styles'))
				.pipe(reload({ stream: true }));
		})
		// 编译压缩less文件
		gulp.task('less',function(){
			gulp.src('./src/less/*.less')
				.pipe(sourcemaps.init())
				.pipe(less())
				.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
				.pipe(minifycss())
				.pipe(sourcemaps.write())
				.pipe(rename({suffix: '.min'}))
				.pipe(gulp.dest('./dist/styles'))
				.pipe(reload({ stream: true }));
		})
	// 脚本文件
		//压缩混淆js文件
		gulp.task('uglify',function(){
			gulp.src('./src/scripts/*.js')
				.pipe(sourcemaps.init())
				.pipe(uglify().on('error', function (e) {
				   	console.log(e)
				}))
				.pipe(rename({suffix: '.min'}))
				.pipe(sourcemaps.write())
				.pipe(gulp.dest('./dist/scripts'))
				.pipe(reload({ stream: true }));
		})

	// 启动webserver,自动刷新浏览器
	gulp.task('browser-sync', function() {
	    browserSync.init({
	        server: {
	            baseDir: "./dist"
	        }
	    });
	});
	
	

// 2)生产模式
	//给文件增加版本号
	gulp.task('addverJs',function(){
		return gulp.src('./dist/scripts/*.js')
			.pipe(rev())
			.pipe(uglify())
			.pipe(gulp.dest('./build/scripts/'))
			.pipe(rev.manifest())
            .pipe(gulp.dest('./dist/ver/scripts/'));
	})
	gulp.task('addverCss',function(){
        return gulp.src('./dist/styles/*.css')
        	.pipe(rev())
        	.pipe(minifycss())
        	.pipe(gulp.dest('./build/styles/'))
        	.pipe(rev.manifest())
            .pipe(gulp.dest('./dist/ver/styles/'));
	})
	
	// 转移fonts字体文件
	gulp.task('copyFonts', function(){
		gulp.src('./dist/styles/fonts')
		    .pipe('./build/styles')
	})
	//改变html引用文件路径同时压缩html文件
	gulp.task('changeUrl',function(callback){
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
		return gulp.src(['./dist/ver/**/*', './dist/*.html'])
		    .pipe(revCollector())
		    .pipe(htmlmin(options))
		    .pipe(gulp.dest('./build/'));
	})
	
	//压缩图片
	gulp.task('imagemin',function(){
		return gulp.src('./dist/images/*')
			.pipe(imagemin({
				optimizationLevel: 8, //类型：Number  默认：3  取值范围：0-7（优化等级）
           		progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
			}))
			.pipe(gulp.dest('./build/images'))
	})
	//清除dist文件内的内容
	gulp.task('cleanDist',['addver','changeUrl','imagemin'], function(){
		return gulp.src('./dist/**/*')
			.pipe(clean())
	})
	//清除build文件内的内容
	gulp.task('cleanBuild', function(){
		return gulp.src('./build/**/*')
			.pipe(clean())
	})
	
// 开发环境任务初始化
gulp.task('dev',['combineLibs','copy','cssmin','less','uglify'],function(){
	browserSync.init({
        port: 3000,
        server: {
            baseDir: ['./dist']
        }
    });
    gulp.watch(['./src/assets/common/scripts/*.js','./src/assets/common/styles'],['combineLibs']);
	gulp.watch(['./src/html/*.html','./src/assets/styles','./src/assets/scripts/*.js','./src/images/*'],['copy']);
	gulp.watch(['./src/css/*.css'],['cssmin']);
	gulp.watch('./src/less/*.less',['less']);
	gulp.watch('./src/scripts/*.js',['uglify']);
})


// 生产环境任务初始化
gulp.task('build',function(callback){
	runSequence(['addverJs','addverCss'],
        ['changeUrl', 'imagemin','copyFonts'],
        callback);
	browserSync.init({
        port: 8080,
        server: {
            baseDir: ['./build']
        }
    });
})

