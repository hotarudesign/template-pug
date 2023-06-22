const gulp = require("gulp");
const del = require("del");
const browserSync = require("browser-sync");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
sass.compiler = require("sass");
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");
const mozjpeg = require("imagemin-mozjpeg");
const htmlbeautify = require("gulp-html-beautify");
const php = require("gulp-connect-php");

const paths = {
  src: {
    scss: "src/assets/css/**/*.scss",
  },
  dist: {
    css: "dist/assets/css/",
  },
};
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
      base: "./dist/",
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
// ejsのコンパイル
gulp.task("ejs", (done) => {
  return gulp
    .src(["src/ejs/**/*.ejs", "!" + "src/ejs/**/_*.ejs"])
    .pipe(ejs())
    .pipe(plumber())
    .pipe(rename({ extname: ".html" }))
    .pipe(gulp.dest("./dist"));
  done();
});

gulp.task("sass", (done) => {
  gulp
    .src(paths.src.scss)
    .pipe(
      sass({
        outputStyle: "expanded",
      })
    )
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.dist.css));
  done();
});

// imageコピータスク
gulp.task("imagecopy", (done) => {
  return gulp
    .src("src/assets/images/**/*.{jpg,jpeg,png,gif,svg,webp}")
    .pipe(gulp.dest("./dist/assets/images/"));
  done();
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
gulp.task("copy", (done) => {
  return gulp
    .src(["src/**/*", "!**/*.scss", "!src/ejs/**"])
    .pipe(gulp.dest("dist"));
  done();
});

// 削除タスク
gulp.task("clean-dist", function (done) {
  del(["dist/**/*.scss", "dist/**/*.css.map"]);
  done();
});

// watchタスク
gulp.task("watch", (done) => {
  gulp.watch("src/**/*.scss", gulp.task("sass"));
  gulp.watch("src/ejs/**/*.ejs", gulp.task("ejs"));
  gulp.watch(
    "src/assets/images/**/*.{jpg,jpeg,png,gif,svg,webp}",
    gulp.task("imagecopy")
  );
  done();
});

// 納品フォルダ作成タスク
gulp.task(
  "ftp",
  gulp.series("clean", "ejs", "sass", "copy", "imagemin", "clean-dist")
);

// デフォルトタスク
gulp.task(
  "default",
  gulp.series(gulp.parallel("browser", "ejs", "sass", "imagecopy", "watch"))
);
