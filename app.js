var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sequelize = require('./database/db');
var session = require('express-session');
require('./database/asociations');

// Autenticar al usuario
require('./auth/auth');

var indexRouter = require('./routes/index');
var todoRouter = require('./routes/todo');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'SECRET', cookie: { sameSite: false } }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/todo', todoRouter);

// conectar a la db
sequelize.sync({ force: false })
	.then(() => console.log('Conectado a la base de datos!'))
	.catch(err => console.log(err));

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

module.exports = app;
