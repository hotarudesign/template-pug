var gulp = require("gulp");
var del = require("del");
var browserSync = require("browser-sync");
var notify = require("gulp-notify");
var plumber = require("gulp-plumber");
var pug = require("gulp-pug");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var imagemin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");
var mozjpeg = require("imagemin-mozjpeg");
var htmlbeautify = require("gulp-html-beautify");
var php = require("gulp-connect-php");

// distフォルダを削除するタスク
gulp.task("clean", function () {
  return del("dist");
});

// ローカルサーバの立ち上げタスク
gulp.task("browser", function (done) {
  php.server(
    {
      port: 3000,
      livereload: true,
      base: "./src/",
    },
    function () {
      browserSync({
        proxy: "localhost:3000",
      });
    }
  );

  gulp.watch("src/**", function (done) {
    browserSync.reload();
    done();
  });
});

// Pugのコンパイルタスク
gulp.task("pug", function () {
  return gulp
    .src("src/**/*.pug", "!src/**/_*.pug")
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(
      htmlbeautify({
        indent_size: 4,
      })
    )
    .pipe(gulp.dest("./src"));
});

// Sassのコンパイルタスク
gulp.task("sass", function () {
  return gulp
    .src("src/**/*.scss", { base: "./scss" })
    .pipe(
      sass({
        outputStyle: "compact",
      })
    )
    .pipe(autoprefixer())
    .pipe(gulp.dest("./css"));
});

//　画像圧縮タスク
gulp.task("imagemin", function () {
  return gulp
    .src("src/**/*.{jpg,jpeg,png,gif,svg}")
    .pipe(
      imagemin([
        pngquant({
          quality: [0.65, 0.8],
          speed: 1,
          floyd: 0,
        }),
        mozjpeg({
          quality: 85,
          progressive: true,
        }),
        imagemin.svgo(),
        imagemin.optipng(),
        imagemin.gifsicle({ optimizationLevel: 3 }),
      ])
    )
    .pipe(gulp.dest("dist/img/_min"));
});

// コピータスク
gulp.task("copy", function () {
  return gulp.src(["src/**/*", "!**/*.scss"]).pipe(gulp.dest("dist"));
});

// 削除タスク
gulp.task("clean-dist", function (done) {
  del(["dist/**/*.pug", "dist/**/*.scss", "dist/**/*.css.map"]);
  done();
});

// watchタスク
gulp.task("watch", function () {
  gulp.watch("src/**/*.scss", gulp.task("sass"));
  gulp.watch("src/**/*.pug", gulp.task("pug"));
});

// 納品フォルダ作成タスク
gulp.task(
  "ftp",
  gulp.series("clean", "pug", "sass", "copy", "imagemin", "clean-dist")
);

// デフォルトタスク
gulp.task(
  "default",
  gulp.series(gulp.parallel("browser", "pug", "sass", "watch"))
);
