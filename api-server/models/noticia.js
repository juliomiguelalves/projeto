const mongoose = require('mongoose')

var noticiaSchema = new mongoose.Schema({
  nomeAutor : {type: String, required: true},
  nomeRecurso : {type: String, required: true},
  qntFicheiros : {type:Number,required:true},
  data: {type: String, default: new Date().toISOString().substring(0,19)}


})

module.exports = mongoose.model('noticia', noticiaSchema)