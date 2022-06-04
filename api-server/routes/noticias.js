var express = require('express');
var jwt = require('jsonwebtoken')
var router = express.Router();
const Noticia = require('../controllers/noticia')


// Listar todas as materiais
router.get('/', function(req, res) {
    Noticia.listar()
      .then(dados => res.status(200).jsonp(dados) )
      .catch(e => res.status(500).jsonp({error: e}))
  });


router.post('/', function(req, res) {
  console.log(req.body)
    Noticia.inserir(req.body)
      .then(dados => {
        console.log(dados)
        res.status(200).jsonp(dados) })
      .catch(e => {
        console.log(e)
        res.status(500).jsonp({error: e})})
  });

router.put('/update/:id', function(req, res) {
    Noticia.alterar(req.body)
      .then(dados => {
        console.log(dados)
        res.status(200).jsonp(dados) })
      .catch(e => {
        console.log(e)
        res.status(500).jsonp({error: e})})
  });

module.exports = router