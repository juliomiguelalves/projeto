var createError = require('http-errors');
var express = require('express');
var logger = require('morgan');

var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/Repositorio', 
      { useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000});
  
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão ao MongoDB...'));
db.once('open', function() {
  console.log("Conexão ao MongoDB realizada com sucesso...")
});

var UserControl = require('./controllers/user')

// Configuração da estratégia local
passport.use('login',new LocalStrategy(
  {usernameField: 'email'}, (email, password, done) => {
    UserControl.consultar(email)
      .then(dados => {
        const user = dados
        if(!user) { return done(null, false, {message: 'Utilizador inexistente!\n'})}
        if(password != user.password) { return done(null, false, {message: 'Credenciais inválidas!\n'})}
        return done(null, user)
      })
      .catch(e => done(e))
    })
)

passport.use('signup-auth', new LocalStrategy(
  {usernameField: 'email', passReqToCallback: true}, 
  (req, email, password, done) => {
    console.log(req.body)
    UserControl.consultar(email)
      .then(dados => {
        console.log(dados)
        if (dados) return done(null, {strat: 'signup-auth', success: false, invalidInput: 'email', message: 'Email já existe!\n'})
        else {
          UserControl.inserir(req.body)
            .then(dados => {
              console.log(dados)
              return done(null, {strat: 'signup-auth', success: true, user: dados})
            })
            .catch(e => done(e))
        }
      })
      .catch(e => done(e))
    })
)

// Indica-se ao passport como serializar o utilizador
passport.serializeUser((user,done) => {
  if (user.success) {
    console.log('Serialização, email: ' + user.user.email)
    done(null, {strat: user.strat, success: user.success, email: user.user.email})
  }
  else done(null, user)
})
  
// Desserialização: a partir do id obtem-se a informação do utilizador
passport.deserializeUser((user, done) => {
  if (user.success) {
    console.log('Desserialização, email: ' + user.email)
    UserControl.consultar(user.email)
      .then(dados => done(null, {success: true, ...dados}))
      .catch(erro => done(erro, false))
  }
  else {
    delete user.strat
    done(null, user)
  }
})
  
var usersRouter = require('./routes/user');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
