var express = require('express');
var router = express.Router();
var axios = require('axios')

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/login', function(req, res) {
  res.render('login-form');
});

router.get('/signup', function(req, res) {
  res.render('registo');
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


module.exports = router;
