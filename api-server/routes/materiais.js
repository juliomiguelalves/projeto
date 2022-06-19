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
      .then(dados2=> {
        res.status(201).jsonp({dados,dados2})
      })
      .catch(e => {
        res.status(501).jsonp({error: e})
      })
      })
    .catch(e => res.status(500).jsonp({error: e}))
})

router.get('/tipos',(req,res)=>{

        TipoMaterial.listar()
        .then(dados => {res.status(200).jsonp(dados)})
        .catch(error => res.status(500).jsonp(error))


})

router.get('/tipo/:tipo',(req,res)=>{
    Material.getTipo(req.params.tipo)
          .then(dados => res.status(200).jsonp(dados))
          .catch(error => res.status(500).jsonp(error))
})

router.get('/autor/:autor',(req,res)=>{
  Material.getAutor(req.params.autor)
        .then(dados => res.status(200).jsonp(dados))
        .catch(error => res.status(500).jsonp(error))
})

router.get('/titulo/:titulo',(req,res)=>{
  Material.getTitulo(req.params.titulo)
        .then(dados => res.status(200).jsonp(dados))
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

router.get('/user/:id', function(req, res) {
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

router.get('/:matId/getComment/:id',(req,res)=>{
  Material.getComment(req.params.matId,req.params.id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp(error))
})


router.delete('/:matId/removerComment/:comId', function(req,res){
  Material.removerComment(req.params.matId,req.params.comId)
    .then(dados => {
      res.status(200).jsonp(dados)})
    .catch(e => {console.log(e.message);res.status(500).jsonp({error: e})})
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
