var jwt = require('jsonwebtoken')
var keyToken = "RPCW2022"
var crypto = require("crypto")
var fs = require('fs')
var mime = require('mime-types')
var AdmZip = require('adm-zip')
var utils = require('./utils')

function genManifest(ficheiros){
    var manifest = ''
    ficheiros.forEach(f => {
        manifest += `${f.hash} data/${f.nome_ficheiro}\n`
    })
    return manifest
}

function zipMaterial(ficheiros){
    var zip = new AdmZip()
    var dir = __dirname.replace(/\\/g, "/").replace("routes","public")
    var manifest = genManifest(ficheiros)
    zip.addFile("manifest-md5.txt", manifest)
    ficheiros.forEach(f => {
        let nome = f.diretoria.split("/")[3]
        zip.addLocalFile(dir + f.diretoria)
        zip.getEntry(nome).entryName = "data/" + f.nomeFicheiro
    })
    return zip.toBuffer()
}

function zipAll(zips){
    var zip = new AdmZip()
    var manifest = ''
    var dir = __dirname.replace(/\\/g, "/").replace("routes","public")
    zips.forEach(z => {
        var hash = calculateMd5_buffer(z.zip)
        manifest += `${hash} data/${z.tit}.zip\n`
        zip.addFile(`data/${z.tit}.zip`, z.zip)
    })
    zip.addFile("manifest-md5.txt",manifest)
    return zip.toBuffer()
}

function unveilToken(token){  
    var t = null;
    
    jwt.verify(token,keyToken,function(e,decoded){
      if(e){
        console.log('Erro: ' + e)
        t = null
      }
      else return t = decoded
    })

    return t
}

function calculateMd5_buffer(buffer){
  let sum = crypto.createHash('md5');
  sum.update(String(buffer));
  const hex = sum.digest('hex');
  return hex
}

function getSize(file){
  var stats = fs.statSync(file);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

function calculateMd5(file){
  let file_buffer = fs.readFileSync(file);
  let sum = crypto.createHash('md5');
  sum.update(String(file_buffer));
  const hex = sum.digest('hex');
  return hex
}


function genManifest(ficheiros){
  var manifest = ''
  ficheiros.forEach(f => {
      manifest += `${f.hash} data/${f.nomeFicheiro}\n`
  })
  return manifest
}

function clearZipFolder(folder, zipfile){
  fs.rmSync(zipfile)
  fs.rmSync(folder + "/data", {recursive:true})
  fs.rmSync(folder +"/manifest-md5.txt",{recursive:true})
}

function getMimeType(file){
  return mime.lookup(file)
}

function calculateSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  else {
    var kb = bytes/1024;
    if (kb < 1024) return `${(kb.toFixed(2))} KB`;
    else {
      var mb = kb/1024;
      if (mb < 1024) return `${(mb.toFixed(2))} MB`;

      return `${(mb/1024).toFixed(2)} GB`;
    }
  }
}

module.exports ={
    unveilToken,
    calculateMd5,
    calculateMd5_buffer,
    genManifest,
    clearZipFolder,
    getMimeType,
    calculateSize,
    getSize,
    zipAll,
    zipMaterial
}