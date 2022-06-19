var express = require('express');
var router = express.Router();
var axios = require('axios')
var utils = require('./utils')

router.get('/',function(req,res){
  var utilizadores
  var nivel
  var token = utils.unveilToken(req.cookies.token)
  axios.get("http://authserver:8002/users")
      .then(dados=>res.render('users',{utilizadores:dados.data,nivel:token.nivel,idUser:token._id}))
      .catch(erro => res.render('error',{error:erro}))
})

router.get('/login', function(req, res) {
  res.render('login-form');
});

router.get('/signup', function(req, res) {
  res.render('registo');
});

router.get('/delete/:id', function(req, res) {
  axios.delete('http://authserver:8002/users/delete/'+req.params.id)
    .then(dados => res.redirect('/users'))
    .catch(error => res.render('error', {error}));
});


router.get('/logout', function(req, res) {
  res.clearCookie("token");
  res.redirect("/");
})

router.post('/signup', function(req, res) {
  axios.post('http://authserver:8002/users/signup', req.body)
    .then(dados => {
      if(dados.data.token){
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      res.redirect('/')
    }
    else{
      res.render('registo', {error:"Dados incorretos"})
  }
    })
    .catch(error => {console.log(error.message);res.render('registo', {error:"Dados incorretos"})})
});

router.post('/login', function(req, res) {
  axios.post('http://authserver:8002/users/login', req.body)
    .then(dados => {
      if(dados.data.token){
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      res.redirect('/')
    }
    else{
      res.render('login-form', {error:"Dados incorretos"})
    }
    })
    .catch(error => {
      axios.get("http://authserver:8002/users/email/"+req.body.email)
        .then(dados=> res.render('login-form', {mail: req.body.email, error:"Password incorreta!"}))
        .catch(erro => res.render('login-form', {error:"Email incorreto!"}))
    })
    .catch(error => res.render('login-form', {error:"Dados incorretos"}))
});

router.get('/editar/:id',function(req,res){
  var token = utils.unveilToken(req.cookies.token)
  axios.get("http://authserver:8002/users/"+req.params.id)
      .then(dados =>{
        res.render('registo',{editar:dados.data.dados,idUser:token._id})
      })
      .catch(error=>res.render('error',{error}))
  
})
router.get('/:id', function(req,res){
  var user
  var token = utils.unveilToken(req.cookies.token)
  axios.get("http://authserver:8002/users/"+req.params.id)
      .then(dados=>{
        user=dados.data
        axios.get("http://apiserver:8001/materiais/user/"+req.params.id+'?token='+req.cookies.token)
        .then(dados=> {
          res.render('user',{user:user,materiais:dados.data,nivel:token.nivel,idUser:token._id})
        })
        .catch(erro => res.render('user',{user:user}))
      })
      .catch(erro => res.render('error',{error:erro}))
})

router.post('/editar/:id',function(req,res){
  var token = utils.unveilToken(req.cookies.token)

  if (token.nivel == 'Administrador' || token._id == req.params.id) {
    //var estatuto = {tipo: req.body.estatuto.charAt(0).toUpperCase() + req.body.estatuto.slice(1), filiacao: req.body.filiacao}
    var fixed = {_id: req.params.id, nome: req.body.nome, nivel: req.body.nivel, email:req.body.email, password: req.body.password}
    
    axios.put('http://authserver:8002/users/' + req.params.id , fixed)
      .then(dados => {
        
        res.redirect("/users/"+req.params.id)
        })
      .catch(error => res.render('error', {error}))
  }
  else res.redirect('/users/' + req.params.id)
})

module.exports = router;
