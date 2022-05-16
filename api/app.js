var createError = require('http-errors');
var express = require('express');
var jwt = require('jsonwebtoken')
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var mongoose = require('mongoose')

var mongodb = 'mongodb://127.0.0.1/Projeto'
mongoose.connect(mongodb,{useNewUrlParser:true,useUnifiedTopology:true})

var db = mongoose.connection
db.on('error',err => console.log("Erro de conexão ao MongoDB..."))
db.once('open',function(){
  console.log("Conexão ao Mongo bem sucedida")
})





app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/*
app.use(function(req, res, next){
  jwt.verify(req.query.token, 'RPCW2022', function(e, payload){
    if(e) res.status(401).jsonp({error: 'Erro na verificação do token: ' + e})
    else{
      req.user = { level: payload.level, username: payload.username }
      next()
    } 
  })
})*/

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
