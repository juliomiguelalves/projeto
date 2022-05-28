var express = require('express');
var router = express.Router();
var axios = require('axios')
var multer = require('multer');
var upload = multer({dest: './uploads'});
var utils = require('./utils')
var AdmZip  = require('adm-zip')
var fs = require('fs');

router.get('/',function(req,res){
    axios.get('http://localhost:8001/materiais?token='+req.cookies.token)
        .then(dados=>res.render('materiais',{materiais:dados.data}))
        .catch(error=>res.render('error',{error:error}))
    
})



router.get('/upload',function(req,res){
    console.log("BOAS")
    res.render('insertMaterial')
    
})
router.get('/:id',function(req,res){
    axios.get('http://localhost:8001/materiais/'+req.params.id+'?token='+req.cookies.token)
        .then(dados=>res.render('material',{material:dados.data}))
        .catch(error=>res.render('error',{error:error}))
    
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
        console.log("EXTRAI PARA " + extractpath)
        zip.getEntries().forEach(entry => {
            if(entry.entryName.match(/data\/.+/)){
              entradasZip[total++] = entry.name
            }
            else if (entry.entryName == "manifest-md5.txt") {
                let entries = entry.getData().toString().split("\n")
                entries.pop()
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
                    console.log
                    let pertence = false

                    entradasZip.forEach(r => { if(r==nome_ficheiro) pertence = true })
                    if(newhash != hash || !pertence) valido = false
                })
        }
    })


    if(valido){

        var dataAtual = new Date().toISOString().substring(0,19)

        var material = {
            tipo:"outro",
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            dataCriacao: req.body.dataCriacao,
            dataRegisto: dataAtual,
            idAutor: token._id,
            nomeAutor: token.nome,
            ficheiros: ficheiros
          }
          utils.clearZipFolder(extractpath,zippath)



        axios.post("http://localhost:8001/materiais?token="+req.cookies.token,material)
          .then(dados => res.redirect('/materiais'))
          .catch(error => res.render('error',{error}))
        }
    else res.render('error', {error})
    }
    else res.redirect('/materiais')
})
    
    
    
    
    
    
    

module.exports = router;