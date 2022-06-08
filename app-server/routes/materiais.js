var express = require('express');
var router = express.Router();
var axios = require('axios')
var multer = require('multer');
var upload = multer({dest: './uploads'});
var utils = require('./utils')
var AdmZip  = require('adm-zip')
var fs = require('fs');
var libxmljs = require('libxmljs2');

router.get('/',function(req,res){
    var token = utils.unveilToken(req.cookies.token)
    if(token){
      if (token.nivel=="Produtor" | token.nivel=="Administrador" | token.nivel=="Consumidor"){

      axios.get('http://localhost:8001/materiais?token='+req.cookies.token)
          .then(dados=>{
            res.render('materiais',{materiais:dados.data,nivel:token.nivel})
          })
          .catch(error=>res.render('materiais',{nivel:"IND"}))
      }
    }
    else{
      res.render('materiais',{nivel:"IND"})
    }
    
})

router.get('/upload',function(req,res){
    var token = utils.unveilToken(req.cookies.token)
    res.render('insertMaterial',{nivel:token.nivel})
    
})

router.get('/remover/:id',function(req,res){
    var dataAtual = new Date().toISOString().substring(0,19)
    axios.delete('http://localhost:8001/materiais/remover/'+req.params.id+'?token='+req.cookies.token)
        .then(dados=>{
            var noticia = {
            existe:0,
            data:dataAtual
            }
            axios.put('http://localhost:8001/noticias/'+req.params.id+'?token='+req.cookies.token,noticia)
            .then(res.redirect('/materiais'))
            .catch(error=>res.render('error',{error:error}))})
            .catch(error=>res.render('error',{error:error}))
    
})

router.get('/:id',function(req,res){
    axios.get('http://localhost:8001/materiais/'+req.params.id+'?token='+req.cookies.token)
        .then(dados=>{
          console.log(dados.data)
            res.render('material',{material:dados.data})
            var vis=0
            vis = dados.data.visualizacoes + 1
            var mat={
                visualizacoes: vis
            }
            axios.put('http://localhost:8001/materiais/'+req.params.id+'?token='+req.cookies.token,mat)
            .then()
            .catch(error=>res.render('error',{error:error}))
        })
        .catch(error=>res.render('error',{error:error}))

    
})

router.get('/:id/classificar/:pont', (req,res) => {
  
    var token = utils.unveilToken(req.cookies.token);

    axios.put(`http://localhost:8001/materiais/${req.params.id}/classificar?token=${req.cookies.token}`,
      {user: token._id, pontuacao: Number.parseInt(req.params.pont)})
        .then(dados => res.redirect(req.headers.referer))
        .catch(error => res.render('error', {error}))
    
    
})

router.post('/:id/addComment',(req,res) =>{
  var token = utils.unveilToken(req.cookies.token);
  if(token.nivel == "Produtor" | token.nivel == "Administrador"){
    req.body["id_autor"] = token._id
    req.body["dataCriacao"] = new Date().toISOString().substring(0,19)
    req.body["nome_autor"] = token.nome
    axios.post('http://localhost:8001/materiais/' + req.params.id + '/addComment?token=' + req.cookies.token, req.body)
          .then(dados => res.redirect("/materiais/"+dados.data._id))
          .catch(error => res.render('error', {error}))
  }
  else{
    req.body["id_autor"] = "0"
    req.body["dataCriacao"] = new Date().toISOString().substring(0,19)
    req.body["nome_autor"] = "Convidado"
    axios.post('http://localhost:8001/materiais/' + req.params.id + '/addComment?token=' + req.cookies.token, req.body)
          .then(dados => res.redirect("/materiais/"+dados.data._id))
          .catch(error => res.render('error', {error}))
  }

})



router.post('/upload', upload.single('zip'), function(req, res) {
    var token = utils.unveilToken(req.cookies.token)
    var zippath = (__dirname + req.file.path).replace("routes","").replace(/\\/g, "/")
    var extractpath = (__dirname + "uploads" ).replace("routes","").replace(/\\/g, "/")
    console.log(zippath)

    if(token.nivel =="Administrador" || token.nivel=="Produtor"){
        var zip = new AdmZip(zippath);

        var ficheiros =[]
        var total = 0
        var entradasZip = []
        var valido = true
        zip.extractAllTo(extractpath)
        zip.getEntries().forEach(entry => {
            if(entry.entryName.match(/data\/.+/)){
              entradasZip[total++] = entry.name
            }
            else if (entry.entryName == "manifest-md5.txt") {
                let entries = entry.getData().toString().split("\n")
                entries.pop()
                if(!fs.existsSync(extractpath.replace("uploads","public/fileStore/"))){
                    fs.mkdirSync(extractpath.replace("uploads","public/fileStore/"))
                }
                entries.forEach(a=>{
                    let separated = a.split(/ (.+)/ ,2)
                    let hash = separated[0]                    
                    let nome_ficheiro = separated[1].split("data/")[1]
                    let diretoria = extractpath + ("/" + separated[1])
                    let newhash = utils.calculateMd5(diretoria)
                    let nova_diretoria = extractpath.replace("uploads","public/fileStore/") + Date.now() 
                    fs.mkdirSync(nova_diretoria)
                    nova_diretoria = nova_diretoria +"/" + nome_ficheiro
                    ficheiros.push({
                        nomeFicheiro:nome_ficheiro,
                        mimetype: utils.getMimeType(diretoria),
                        tamanho: utils.getSize(diretoria),
                        diretoria:nova_diretoria.split("app-server/")[1].replace(/^public/, ""), 
                        hash:newhash
                    })
                    fs.renameSync(diretoria, nova_diretoria, err => { if (err) throw err })
                    let pertence = false

                    entradasZip.forEach(r => { if(r==nome_ficheiro) pertence = true })
                    if(newhash != hash || !pertence) valido = false
                })
        }
    })


    if(valido){

        var dataAtual = new Date().toISOString().substring(0,19)

        var material = {
            tipo:req.body.titulo,
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            dataCriacao: req.body.dataCriacao,
            dataRegisto: dataAtual,
            idAutor: token._id,
            nomeAutor: token.nome,
            visualizacoes: 0,
            downloads: 0,
            ficheiros: ficheiros
          }
          utils.clearZipFolder(extractpath,zippath)



        axios.post("http://localhost:8001/materiais?token="+req.cookies.token,material)
          .then(dados => {
            console.log("POSTEI O MATERIAL")
            var qnt = ficheiros.length
            var noticia = {
                nomeAutor:token.nome,
                idAutor:token._id,
                nomeRecurso:req.body.titulo,
                idMaterial:dados.data.dados._id,
                qntFicheiros:qnt,
                existe:1,
                data:dataAtual
            }
            console.log(noticia)
            console.log("INSTANCIOU A NOTICIA")
            axios.post("http://localhost:8001/noticias?token="+req.cookies.token,noticia)
                .then(dados =>{ res.redirect('/materiais') })
                .catch(error => res.render('error',{error}))
            console.log("postei a noticia");
            })
          .catch(error => res.render('error',{error}))
        }
    else res.render('error', {error})
    }
    else res.redirect('/materiais')
})
    

    
    
    
    

module.exports = router;