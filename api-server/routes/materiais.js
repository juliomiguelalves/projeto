// Roteador do servidor API para o problema da gestão de materiais
var express = require('express');
var jwt = require('jsonwebtoken')
var router = express.Router();
const Material = require('../controllers/material')

//verifica o nivel de acesso

function verificaNivel(autorizados,req,res,next){
  if(autorizados.includes(n)){
    next()
  }
  else {
    res.status(403).jsonp({error:"Não tem nível de acesso suficiente"})
  }
}

// Listar todas as materiais
router.get('/', function(req, res) {
  Material.listar()
    .then(dados => res.status(200).jsonp(dados) )
    .catch(e => res.status(500).jsonp({error: e}))
});

// Número de materiais na BD
router.get('/numero', function(req, res) {
  Material.listar()
    .then(dados => res.status(200).jsonp(dados.length) )
    .catch(e => res.status(500).jsonp({error: e}))
});

// Consultar um material
router.get('/:id', function(req, res) {
  Material.consultar(req.params.id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
});

// Inserir uma tarefa
router.post('/', function(req, res){
  console.log(req.body)
  Material.inserir(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Alterar uma tarefa
router.put('/', function(req, res){
  Material.alterar(req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Remover uma tarefa
router.delete('/:id', function(req,res){
  Material.remover(req.params.id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
});

module.exports = router;
