const mongoose = require('mongoose')

var ficheiroSchema = new mongoose.Schema({
  nomeFicheiro: {type: String, required: true},
  tamanho: {type: Number, required: true},
  mimetype: {type: String, required: true},
  diretoria: {type: String, required: true},
  hash:{type: String, required: true}

})

var materialSchema = new mongoose.Schema({
    tipo: {type: String, required: true},
    titulo: { type: String, required: true },
    dataCriacao: { type: String, required: true },
    dataRegisto: {type: String, required: true},
    descricao: String,
    idAutor: {type: String, required: true},
    nomeAutor: {type: String, required: true},
    classificacoes: {type: [{
      user: {type: String, required: true},
      pontuacao: {type: Number, required: true}
  }], default: []},
    classificacao:{type:Number, default:-1},
    ficheiros: {type: [ficheiroSchema], default: []}

  });

module.exports = mongoose.model('material', materialSchema)