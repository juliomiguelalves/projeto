var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require("body-parser")
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var User = require('./models/user')
var passport = require('passport')
var LocalStrategy = require("passport-local")

var usersRouter = require('./routes/users');


var mongoose = require('mongoose')

var mongodb = 'mongodb://127.0.0.1/Projeto'
mongoose.connect(mongodb,{useNewUrlParser:true,useUnifiedTopology:true})

var db = mongoose.connection
db.on('error',err => console.log("Erro de conexão ao MongoDB..."))
db.once('open',function(){
  console.log("Conexão ao Mongo bem sucedida")
})


var app = express();


app.use(bodyParser.urlencoded({ extended: false }));
app.use(require("express-session")({
  secret:"RPCW2022",
  resave: false,
  saveUninitialized: false
}));

app.use(logger('dev'));

passport.use('signup',new LocalStrategy(
  {usernameField:'email'},(email,password,done) => {
    User.consultar(email)
      .then(dados =>{
        if(dados) return done(null,{strat:'signup',success:false,message:'Email já existe!\n'})
        else{
          User.inserir({
            email,password,nivel:"produtor",nome:req.body.nome
          })
          .then(dados =>{ return done(null,{strat:'signup',success:true,user:dados})})
          .catch(e => done(e))
        }
      })
      .catch(erro => done(erro))
  }
))

passport.serializeUser((user,done)=>{

  console.log('Vou serializar o user na sessão: ' + JSON.stringify(user))
  done(null,user.id)
})

passport.deserializeUser((uid,done)=>{
  console.log('Vou desserializar o user: '+ uid)
  axios.get('http:/localhost:3000/users/'+uid)
    .then(dados=> {
      done(null,dados.data)
    
    })
    .catch(erro =>{
     done(erro,false)
    })
})


app.use(passport.initialize());
app.use(passport.session());

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
});

module.exports = app;
