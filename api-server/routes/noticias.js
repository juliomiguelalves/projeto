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
    Noticia.inserir(req.body)
      .then(dados => {
        res.status(200).jsonp(dados) })
      .catch(e => {
        res.status(500).jsonp({error: e})})
  });

router.put('/:id', function(req, res) {

    Noticia.alterar(req.params.id,req.body.data)
      .then(dados => {
        res.status(200).jsonp(dados) })
      .catch(e => {
        res.status(500).jsonp({error: e})})
  });

module.exports = router