var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var passport = require('passport')

var User = require('../models/user')
var UserControl = require('../controllers/user')


router.get('/', function(req, res){
  UserControl.listar()
    .then(dados => res.status(200).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

router.put('/:id',function(req,res){
  console.log(req.body)
  UserControl.editar(req.body)
          .then(dados => {
              console.log(dados)
                jwt.sign({ email: dados.email, nivel: dados.nivel, _id:dados._id,nome:dados.nome,
                  sub: 'RPCW2022'}, 
                  "RPCW2022",
                  {expiresIn: 3600},
                  function(e, token) {
                    if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
                    else res.status(201).jsonp({token: token})
                    res.status(200).jsonp(dados)
              });
            })
          .catch(error=>{
            console.log(error)
            res.status(500).jsonp({error: error})})
            
})

router.post('/signup', passport.authenticate('signup-auth'), function(req, res) {
  console.log("SIGNUP:"+req.user)
  if (req.user.success) {
    jwt.sign({
      email: req.user.user.email, 
      nivel: req.user.user.nivel,
      _id: req.user.user._id,
      nome:req.user.user.nome,
      sub: 'RPCW2022'}, 
      "RPCW2022",
      {expiresIn: "1d"},
      function(e, token) {
        if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
        else res.status(201).jsonp({token})
    })
  }
  else res.status(201).jsonp({invalidInput: req.user.invalidInput, error: req.user.message}) 
})


  
router.post('/login', passport.authenticate('login'), function(req, res){
  console.log("LOGIN:"+req.user)
  jwt.sign({ email: req.user.email, nivel: req.user.nivel, _id:req.user._id,nome:req.user.nome,
    sub: 'RPCW2022'}, 
    "RPCW2022",
    {expiresIn: 3600},
    function(e, token) {
      if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
      else res.status(201).jsonp({token: token})
});
})

router.delete('/delete/:id', function(req, res){
  UserControl.removerPorID(req.params.id)
    .then(dados => res.status(200).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})


router.get('/:id', function(req, res){
  UserControl.listarPorID(req.params.id)
    .then(dados => res.status(200).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

module.exports = router;