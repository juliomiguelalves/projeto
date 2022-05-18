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


router.post('/signup', function(req, res) {
  console.log("estou aqui")
  axios.post('http://localhost:8002/users/', req.body)
    .then(dados => {
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      res.redirect('/users')
    })
    .catch(e => console.log(e))
});

router.post('/login', function(req, res) {
  axios.post('http://localhost:8002/users/login', req.body)
    .then(dados => {
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      res.redirect('/tarefas')
    })
    .catch(e => res.render('error', {error: e}))
});

router.get('/tarefas', function(req, res) {
  console.log(JSON.stringify(req.cookies))
  axios.get('http://localhost:8001/tarefas?token=' + req.cookies.token)
    .then(dados => res.render('tarefas', {lista: dados.data}))
    .catch(e => res.render('error', {error: e}))
});


router.get('/tarefas/remover/:id',function(req,res){
  axios.delete("http://localhost:8001/tarefas/"+req.params.id+'?token='+req.cookies.token)
      .then(dados => res.redirect('/tarefas'))
      .catch(erro => res.render('error',{error:erro}))
})

module.exports = router;
