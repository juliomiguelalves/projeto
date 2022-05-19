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

router.post('/', passport.authenticate('signup-auth'), function(req, res){
  console.log("cheguei")
  console.log(req.body.email)

  UserControl.inserir(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

router.post('/signup', passport.authenticate('signup-auth'), function(req, res) {
  if (req.user.success) {
    jwt.sign({
      email: req.user.user.email, 
      nivel: req.user.user.nivel,
      _id: req.user.user._id,
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
  jwt.sign({ email: req.user.email, nivel: req.user.nivel, 
    sub: 'RPCW2022'}, 
    "RPCW2022",
    {expiresIn: 3600},
    function(e, token) {
      if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
      else res.status(201).jsonp({token: token})
});
})

module.exports = router;