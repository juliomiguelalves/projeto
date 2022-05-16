var jwt = require('jsonwebtoken');
var passport = require('passport');
var express = require('express');
var router = express.Router();
var User = require('../controllers/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.listar()
  .then(dados =>res.status(200).jsonp({users:dados}))
  .catch(erro => res.status(500).jsonp(error))
});

// login de utilizador
router.post('/signup', function(req, res) {
  /*if (req.user.success) {
    jwt.sign({
      email: req.user.user.email, 
      nivel: req.user.user.nivel,
      _id: req.user.user._id,
      sub: 'TP_DAW2020'}, 
      "TP_DAW2020",
      {expiresIn: "1d"},
      function(e, token) {
        if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
        else res.status(201).jsonp({token})
    })*/
    console.log(req.body)
    User.inserir(req.body)
      .then(dados => res.status(201).jsonp({dados}))
      .catch(erro => res.status(501).jsonp({erro}))
 // }
 // else res.status(201).jsonp({error:"ERRO"}) 
})




module.exports = router;
