// global plugin
const {src, dest, watch, series, parallel }  = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');


// html plugins
const webpHTML = require('gulp-webp-html');
const htmlmin = require('gulp-htmlmin');


// scss plugins
const sass = require('gulp-sass')(require('sass'));
const webpCss = require('gulp-webp-css');
const autoprefixer = require('gulp-autoprefixer');
const shorthand = require('gulp-shorthand');
const groupCssMediaQueries = require('gulp-group-css-media-queries');
const rename = require('gulp-rename');
const csso = require('gulp-csso');


// image plugins
const newer = require('gulp-newer');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');



// path
const pathSrc = './src';
const pathDest = './public';

const path = {
	root:pathDest,

	html:{
		src:pathSrc + '/*.html',
		watch:pathSrc + '/html/**/*.html',
		dest:pathDest
	},
	scss:{
		src:pathSrc + '/scss/*.scss',
		watch:pathSrc + '/scss/**/*.scss',
		dest:pathDest +'/css'
	},
	img:{
		src:pathSrc + '/img/*.*',
		watch:pathSrc + '/img/**/*.*',
		dest:pathDest +'/img'
	}
};

// config
const isProd = process.argv.includes('--production');
const isDev = !isProd;


const config = {

	isProd:isProd,

	isDev:isDev,

	sourcemaps:{sourcemaps:isDev},

	html:{collapseWhitespace:isProd},

	rename:{suffix:".min"},

	imagemin:{
		verbose:true
	},

	browserSync:{
		server:{
			baseDir:path.root
		}
	}
};


// clear task
const clear = () =>{
	return del(path.root);
}

// html task
function html() {
	return src(path.html.src)
	.pipe(plumber())
	.pipe(webpHTML())
	.pipe(htmlmin(config.html))
	.pipe(dest(path.html.dest))
	.pipe(browserSync.stream())
}


// scss
function scss() {
	return src(path.scss.src, config.sourcemaps)
	.pipe(plumber())
	.pipe(sass())
	.pipe(webpCss())
	.pipe(autoprefixer())
	.pipe(shorthand())
	.pipe(groupCssMediaQueries())
	.pipe(dest(path.scss.dest, config.sourcemaps))
	.pipe(rename(config.rename))
	.pipe(csso())
	.pipe(dest(path.scss.dest))
	.pipe(browserSync.stream())
};

// image
function image() {
	return src(path.img.src)
	.pipe(plumber())
	.pipe(newer(path.img.dest))
	.pipe(webp())
	.pipe(dest(path.img.dest))
	.pipe(src(path.img.src))
	.pipe(newer(path.img.dest))
	.pipe(imagemin(config.imagemin))
	.pipe(dest(path.img.dest))
	.pipe(browserSync.stream())
}

// watch task
function watcher() {
	watch(path.html.watch, html)
	watch(path.scss.watch, scss)
	watch(path.img.watch, image);
}

// browsersync server
function server() {
	browserSync.init(config.browserSync);
}

// build project
const build = series(clear, parallel(html, scss, image));

// development
const development = series(build,  parallel(watcher, server));


// export tasks
exports.clear = clear;
exports.html = html;
exports.scss = scss;
exports.image = image;
exports.watch = watcher;


//  default
exports.default = config.isProd ? build : development;