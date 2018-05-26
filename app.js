var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Database
var mongo = require('mongodb');
var monk = require('monk');
const url = process.env.MONGODB_URI || "mongodb://localhost:27017/washtubexpresssite"; // Connection URL
var db = monk(url);

var indexRouter = require('./routes/index');
var machinesRouter = require('./routes/machines');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from React app
app.use(express.static(path.join(__dirname, 'client/build')));

// db access for routers
app.use(function(req,res,next){
    req.db = db;
    next();
});

// app.use('/', indexRouter);
app.use('/api/machines', machinesRouter);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// API port
const port = process.env.PORT || 5000;
app.listen(port);

module.exports = app;
