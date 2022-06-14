var express = require('express');
var router = express.Router();
var axios = require('axios')
var multer = require('multer');
var upload = multer({dest: './uploads'});
var utils = require('./utils')
var AdmZip  = require('adm-zip')
var fs = require('fs');

router.get('/',function(req,res){
    var token = utils.unveilToken(req.cookies.token)
    if(token){
      if (token.nivel=="Produtor" | token.nivel=="Administrador" | token.nivel=="Consumidor"){

      axios.get('http://localhost:8001/materiais?token='+req.cookies.token)
          .then(dados=>{
            res.render('materiais',{materiais:dados.data,nivel:token.nivel,idUser:token._id})
          })
          .catch(error=>res.render('materiais',{nivel:"IND"}))
      }
    }
    else{
      res.render('materiais',{nivel:"IND"})
    }
    
})

router.get('/procurar',function(req,res){
    var token = utils.unveilToken(req.cookies.token)
    texto=req.query.texto.trim()
    if(token){
      if(texto==""){
        axios.get('http://localhost:8001/materiais?token='+req.cookies.token)
        .then(dados=>{
          res.render('materiais',{materiais:dados.data,nivel:token.nivel,idUser:token._id})
        })
        .catch(error=>res.render('materiais',{nivel:"IND"}))
      }
      else{
        axios.get('http://localhost:8001/materiais/'+req.query.procurar+'/'+texto+'?token='+req.cookies.token)
            .then(dados=>{
              res.render('materiais',{materiais:dados.data,nivel:token.nivel,idUser:token._id})
            })
            .catch(error=>res.render('materiais',{nivel:"IND"}))
          }
      }
     
    })


router.get('/upload',function(req,res){
    var token = utils.unveilToken(req.cookies.token)
    if(token.nivel=="Produtor" || token.nivel=="Administrador"){
      axios.get("http://localhost:8001/materiais/tipos?token="+req.cookies.token)
          .then(dados =>{
            res.render('insertMaterial',{nivel:token.nivel,tipos:dados.data,idUser:token._id})
          })
          .catch(error =>res.render('error',{error}))
    }
    else{
      res.render('insertMaterial',{erro:"Acesso negado"})
    }
    
})

router.post('/download/:id',(req,res) =>{
  var token = utils.unveilToken(req.cookies.token)
  if(token){
  var zips =[]
  axios.get('http://localhost:8001/materiais/download/'+req.params.id+'?token='+req.cookies.token)
      .then(materiais =>{
        let tit = req.params.id
        let ficheiros = materiais.data[0].ficheiros
        var zip = utils.zipMaterial(ficheiros)
        zips.push({tit,zip})
        
        let files = utils.zipAll(zips)
        let filename = materiais.data[0].length == 1 ? materiais.data[0].ficheiros[0].nomeFicheiro : Date.now()
        axios.post('http://localhost:8001/materiais/download/'+req.params.id+'?token=' + req.cookies.token, req.params.id)
          .then(() => {
            res.writeHead(200, {
              "Content-Type": "application/zip",
              "Content-Disposition": `attachment; filename=${filename}.zip`,
            })
            materiais.data.length == 1 ? res.write(zips[0].zip) : res.write(files)
            res.end()
          })
          .catch(errors => res.render('error', {error:errors[0]}))
        
      })
      .catch(error => res.render('error',{error}))
  }
  else{
    res.render('error',{error})
  }
})

router.get('/remover/:id',function(req,res){
    var dataAtual = new Date().toISOString().substring(0,19)
    var token = utils.unveilToken(req.cookies.token)
    if(token.nivel == "Administrador"){
    axios.delete('http://localhost:8001/materiais/remover/'+req.params.id+'?token='+req.cookies.token)
        .then(dados=>{
            var noticia = {
            data:dataAtual
            }
            axios.put('http://localhost:8001/noticias/'+req.params.id+'?token='+req.cookies.token,noticia)
            .then(res.redirect('/materiais'))
            .catch(error=>res.render('error',{error:error}))
          })
          .catch(error=>res.render('error',{error:error}))
        
    }
    else{
      res.render('/materiais',{nivel:"IND"})
    }
    
})

router.get('/:id',function(req,res){
  var token = utils.unveilToken(req.cookies.token)

    axios.get('http://localhost:8001/materiais/'+req.params.id+'?token='+req.cookies.token)
        .then(dados=>{
          console.log(dados.data)
            res.render('material',{material:dados.data,nivel:token.nivel,idUser:token._id})
            var vis=0
            vis = dados.data.visualizacoes + 1
            var mat={
                visualizacoes: vis
            }
            axios.put('http://localhost:8001/materiais/'+req.params.id+'?token='+req.cookies.token,mat)
            .then()
            .catch(error=>res.render('error',{error:error}))
            res.render('material',{material:dados.data,nivel:token.nivel,idUser:token._id})

        })
        .catch(error=>res.render('error',{error:error}))

    
})

router.get('/:id/classificar/:pont', (req,res) => {
  
    var token = utils.unveilToken(req.cookies.token);
    if(token){
    axios.put(`http://localhost:8001/materiais/${req.params.id}/classificar?token=${req.cookies.token}`,
      {user: token._id, pontuacao: Number.parseInt(req.params.pont)})
        .then(dados => res.redirect(req.headers.referer))
        .catch(error => res.render('error', {error}))
    }
    else{
      res.render('error',{error})
    }
    
})

router.post('/:id/addComment',(req,res) =>{
  var token = utils.unveilToken(req.cookies.token);
  if(token.nivel == "Produtor" | token.nivel == "Administrador" || token.nivel == "Consumidor"){
    req.body["id_autor"] = token._id
    req.body["dataCriacao"] = new Date().toISOString().substring(0,19)
    req.body["nome_autor"] = token.nome
    axios.post('http://localhost:8001/materiais/' + req.params.id + '/addComment?token=' + req.cookies.token, req.body)
          .then(dados => res.redirect("/materiais/"+dados.data._id))
          .catch(error => res.render('error', {error}))
  }
  else{
    res.render('error',{error})
  }
  

})



router.post('/upload', upload.single('zip'), function(req, res) {
    var token = utils.unveilToken(req.cookies.token)
    var zippath = (__dirname + req.file.path).replace("routes","").replace(/\\/g, "/")
    var extractpath = (__dirname + "uploads" ).replace("routes","").replace(/\\/g, "/")

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
            tipo:req.body.tipo,
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
            axios.post("http://localhost:8001/noticias?token="+req.cookies.token,noticia)
                .then(dados =>{ res.redirect('/materiais') })
                .catch(error => res.render('error',{error}))
            })
          .catch(error => res.render('error',{error}))
        }
    else res.render('error', {error})
    }
    else res.redirect('/materiais')
})
    

    
    
    
    

module.exports = router;