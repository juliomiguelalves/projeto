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
    axios.get('http://localhost:8001/materiais?token='+req.cookies.token)
        .then(dados=>{
          res.render('materiais',{materiais:dados.data,nivel:token.nivel})
        })
        .catch(error=>res.render('error',{error:error}))
    
})



router.get('/upload',function(req,res){
    var token = utils.unveilToken(req.cookies.token)
    res.render('insertMaterial',{nivel:token.nivel})
    
})

router.get('/remover/:id',function(req,res){
    axios.delete('http://localhost:8001/materiais/remover/'+req.params.id+'?token='+req.cookies.token)
        .then(dados=>res.redirect('/materiais'))
        .catch(error=>res.render('error',{error:error}))
    
})

router.get('/:id',function(req,res){
    axios.get('http://localhost:8001/materiais/'+req.params.id+'?token='+req.cookies.token)
        .then(dados=>res.render('material',{material:dados.data}))
        .catch(error=>res.render('error',{error:error}))
    
})

router.get('/:id/classificar/:pont', (req,res) => {
  
    var token = utils.unveilToken(req.cookies.token);

    axios.put(`http://localhost:8001/materiais/${req.params.id}/classificar?token=${req.cookies.token}`,
      {user: token._id, pontuacao: Number.parseInt(req.params.pont)})
        .then(dados => res.redirect(req.headers.referer))
        .catch(error => res.render('error', {error}))
    
    
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
          .then(dados => {
            console.log("POSTEI O MATERIAL")
            var qnt = ficheiros.length
            console.log("qnt:",qnt)
            var noticia = {
                nomeAutor:token.nome,
                nomeRecurso:req.body.titulo,
                qntFicheiros:qnt,
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
    
/*router.post('/libxmljs2/validateSessionXml', (req, res, next) => {
    var xmlData = req;
    console.log(xmlData)
    // parse incoming XML data
    var xmlDoc = libxmljs.parseXml(xmlData);  
  
    // load XML schema from file system
    var xmlSchemaDoc = loadXmlSchema('schemaProf.xsd');
  
    // validate XML data against schema
    var validationResult = xmlDoc.validate(xmlSchemaDoc);
  
    // return success or failure with validation errors
    if (validationResult) {
      //res.status(200).send('validation successful');
      console.log("Materiais:",validationResult)
    } else {
      //res.status(400).send(`${xmlDoc.validationErrors}`);
      console.log("Materiais Erro:",xmlDoc.validationErrors)
    }  
  });
  
  function loadXmlSchema(filename) {
    var schemaPath = path.join(__dirname, '..', 'schemas', filename);
    var schemaText = fs.readFileSync(schemaPath, 'utf8');
    return libxmljs.parseXml(xmlSchema); 
  }  */
    
    
    
    
    

module.exports = router;