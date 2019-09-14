const path = require('path');
const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const del = require('del');
const replace = require('gulp-replace');
const postcss = require('gulp-postcss');
const px2rpx = require('postcss-px2rpx');

// 相关路径配置
const paths = {
  src: {
    baseDir: 'src',
    scssDir: 'src/assets/scss',
    imgDir: 'src/image',
    imgFiles: 'src/image/**/*',
    scssFiles: 'src/**/*.scss',
    baseFiles: ['src/**/*.{png,js,json}', '!src/assets/**/*', '!src/image/**/*'],
    wxmlFiles: 'src/**/*.wxml',
    jsFiles: 'src/**/*.js'
  },
  dist: {
    baseDir: 'dist',
    imgDir: 'dist/image',
    wxssFiles: 'dist/**/*.wxss',
  }
};

// Sass 编译
function sassCompile() {
  return gulp.src(paths.src.scssFiles)
    .pipe(sass({ outputStyle: 'expanded' })
      .on('error', sass.logError))
    .pipe(postcss([px2rpx()]))
    .pipe(rename({
      'extname': '.wxss'
    }))
    .pipe(replace('.scss', '.wxss'))
    .pipe(gulp.dest(paths.dist.baseDir))
}

// 复制图片文件
function copyImageFile() {
  return gulp.src(paths.src.imgFiles)
    .pipe(gulp.dest(paths.dist.imgDir));
}

// 复制基础文件
function copyBasicFiles() {
  return gulp.src(paths.src.baseFiles, {})
    .pipe(gulp.dest(paths.dist.baseDir));
}

// 复制 WXML
function copyWXML() {
  return gulp.src(paths.src.wxmlFiles, {})
    .pipe(gulp.dest(paths.dist.baseDir));
}

// clean 任务, dist 目录
function cleanDist() {
  return del(paths.dist.baseDir);
}

const watchHandler = function (type, file) {
  const extname = path.extname(file);
  // SCSS 文件
  if (extname === '.scss') {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/').replace(extname, '.wxss');
      del([tmp]);
    } else {
      sassCompile();
    }
  }

  // 图片文件
  else if (extname === '.png' || extname === '.jpg' || extname === '.jpeg'  || extname === '.svg' || extname === '.gif') {
    if (type === 'removed') {
      del([file.replace('src/', 'dist/')]);
    } else {
      copyImageFile()
    }
  }

  // wxml
  else if (extname === '.wxml') {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/')
      del([tmp]);
    } else {
      copyWXML();
    }
  }

  // 其余文件
  else {
    if (type === 'removed') {
      const tmp = file.replace('src/', 'dist/');
      del([tmp]);
    } else {
      copyBasicFiles();
    }
  }
};

//监听文件
function watch(cb) {
  const watcher = gulp.watch([
      paths.src.baseDir
    ],
    {ignored: /[\/\\]\./}
  );
  watcher
    .on('change', function (file) {
      watchHandler('changed', file);
    })
    .on('add', function (file) {
      watchHandler('add', file);
    })
    .on('unlink', function (file) {
      watchHandler('removed', file);
    });

  cb();
}

//注册默认任务
gulp.task('default', gulp.series(
  copyBasicFiles,
  gulp.parallel(
    sassCompile,
    copyWXML,
    copyImageFile
  ),
  watch
));

// 删除任务
gulp.task('clean', gulp.parallel(
  cleanDist
));
