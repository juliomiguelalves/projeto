// Roteador do servidor API para o problema da gestão de materiais
var express = require('express');
var jwt = require('jsonwebtoken')
var router = express.Router();
const Material = require('../controllers/material')
const TipoMaterial = require('../controllers/tipoMaterial')

// Listar todas as materiais
router.get('/', function(req, res) {
  Material.listar()
    .then(dados => {
      res.status(200).jsonp(dados) 
    })
    .catch(e => res.status(500).jsonp({error: e}))
});

// Inserir uma tarefa
router.post('/', function(req, res){
  Material.inserir(req.body)
    .then(dados =>{ 
      TipoMaterial.inserir(req.body.tipo)
      .then(dados2 => {
        res.status(201).jsonp({dados2})
      })
      .catch(e => {
        res.status(501).jsonp({error: e})
      })
      })
    .catch(e => res.status(500).jsonp({error: e}))
})

router.get('/tipos',(req,res)=>{

TipoMaterial.listar()
        .then(dados => {console.log(dados);res.status(200).jsonp(dados)})
        .catch(error => res.status(500).jsonp(error))


})

router.get('/download/:id',(req,res)=>{
    Material.getFicheiros(req.params.id)
      .then(dados => res.status(200).jsonp(dados))
      .catch(error => res.status(500).jsonp(error))
})



// Consultar um material
router.get('/:id', function(req, res) {
  Material.consultar(req.params.id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
});

router.get('/autor/:id', function(req, res) {
  Material.autor(req.params.id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
});

// Alterar um material
router.put('/:id', function(req, res){
  Material.alterarPorID(req.params.id,req.body)
    .then(dados => res.status(201).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

// Remover uma tarefa
router.delete('/remover/:id', function(req,res){
  
  Material.remover(req.params.id)
    .then(dados => {
      res.status(200).jsonp(dados)})
    .catch(e => res.status(500).jsonp({error: e}))
  
});

// Classificar um material
router.put('/:id/classificar', function(req, res) {
  Material.atualizarClassificacao(req.params.id, req.body)
    .then(dados => {
      if (!dados) {
        Material.classificar(req.params.id, req.body)
          .then(dados => {res.status(201).jsonp({dados})
            
          })
          .catch(e => res.status(500).jsonp({error: e}))
        
      }
      else res.status(201).jsonp({dados})
    })
    .catch(e => res.status(500).jsonp({error: e}))
});

router.post('/download/:id', function(req, res){
  var erros = []
  console.log(req.params.id)
  Material.incrementarDownloads(req.params.id)
  .then(d => {})
  .catch(e => erros.push(e))

  if (!erros.length) res.status(201).jsonp({})
  else res.status(500).jsonp({erros})
})

router.post('/:id/addComment', function(req,res){
  Material.adicionarComentario(req.params.id, req.body)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({error: e}))
})

module.exports = router;
