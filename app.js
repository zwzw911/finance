'use strict'
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
/*var routes = require('./routes/index');
var users = require('./routes/users');*/
// var main= require('./server/controller/main/main')
var main= require('./server/controller/main/unifiedMain')

var app = express();

var appSetting=require('./server/config/global/appSetting')
//设定环境
for(let singleKey in appSetting){
  //console.log(`${singleKey}:${appSetting[singleKey]}`)
  app.set(singleKey,appSetting[singleKey])
}
app.set('env','development')

// view engine setup
app.set('views', path.join(__dirname, 'server/views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//使用和express.static一样的路径（举例，必须是/cliect而不能是/client/stylesheets）
//force：每次请求都重新编译
var force=false
if(app.get('env') === 'development'){
  force=true
}

app.use(lessMiddleware(path.join(__dirname + '/client'),[{debug:true,force:force,render:{compress:'false', 'yuicompress':false}}]))


//开发环境，使用express自带的功能；生产环境，使用nginx
if(app.get('env') === 'development'){
  // var staticResource=['client/stylesheets','client/javascripts','client/images','resource']
  //使用ui-router时，要把templaterUrl中的文件设为可以直接访问
  var staticResource=['client','resource','/server/views/main/router']
  staticResource.forEach(function(e){
    app.use(express.static(path.join(__dirname, e)));
  })

}
//
app.use(['/main','/'],main)

/*app.use('/', routes);
app.use('/users', users);*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
