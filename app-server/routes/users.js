var express = require('express');
var router = express.Router();
var axios = require('axios')
var utils = require('./utils')

router.get('/',function(req,res){
  var utilizadores
  var nivel
  var token = utils.unveilToken(req.cookies.token)
  axios.get("http://localhost:8002/users")
      .then(dados=>res.render('users',{utilizadores:dados.data,nivel:token.nivel}))
      .catch(erro => res.render('error',{error:erro}))
})

router.get('/login', function(req, res) {
  res.render('login-form');
});

router.get('/signup', function(req, res) {
  res.render('registo');
});

router.get('/delete/:id', function(req, res) {
  axios.delete('http://localhost:8002/users/delete/'+req.params.id)
    .then(dados => res.redirect('/users'))
    .catch(error => res.render('error', {error}));
});


router.get('/logout', function(req, res) {
  res.clearCookie("token");
  res.redirect("/");
})

router.post('/signup', function(req, res) {
  axios.post('http://localhost:8002/users/signup', req.body)
    .then(dados => {
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      res.redirect('/')
    })
    .catch(error => res.render('error', {error}))
});

router.post('/login', function(req, res) {
  axios.post('http://localhost:8002/users/login', req.body)
    .then(dados => {
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      res.redirect('/')
    })
    .catch(error => res.render('error', {error}))
});


router.get('/:id', function(req,res){
  var user
  axios.get("http://localhost:8002/users/"+req.params.id)
      .then(dados=>res.render('user',{user:dados.data}))
      .catch(erro => res.render('error',{error:erro}))
})

module.exports = router;
