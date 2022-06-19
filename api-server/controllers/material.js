// Controlador para o modelo Material

var Material = require('../models/material')

// Devolve a lista de Tarefas
module.exports.listar = () => {
    return Material
        .find()
        .sort('-dataCriacao')
        .exec()
}

module.exports.consultar = id => {
    return Material
        .findOne({_id: id})
        .exec()
}

module.exports.autor = id => {
    return Material
        .find({idAutor: id})
        .exec()
}

module.exports.inserir = t => {
    var novo = new Material(t)
    return novo.save()
}

module.exports.remover = function(id){
    return Material.deleteOne({_id: id})
}

module.exports.removerComment = (matId,ComId) => {
    return Material.findByIdAndUpdate({_id: matId},{$pull:{"comentarios" :{ "_id": ComId}}},{new:true})
}

module.exports.getComment = (matId,id) => {
    return Material.findOne({_id:matId},{_id:0,comentarios:1})
}

module.exports.alterar = function(t){
    return Material.findByIdAndUpdate({_id: t._id}, t, {new: true})
}



module.exports.alterarPorID = function(id,t){
    return Material.findOneAndUpdate({_id: id}, t, {new: true})
}
module.exports.classificar = (idMat,classif) => {
    return Material.findOneAndUpdate(
        {"_id": idMat},
        {$push: {classificacoes: classif}},
        {useFindAndModify: false, new: true})
}

module.exports.atualizarClassificacao = (idMat,classif) => {
    return Material.findOneAndUpdate(
        {"_id": idMat, "classificacoes.user": classif.user},
        {$set: {'classificacoes.$.pontuacao': classif.pontuacao}}, 
        {useFindAndModify: false, new: true})
}

module.exports.adicionarComentario = (id, com) => {
    return Material
        .findOneAndUpdate(
            {_id: id},
            {$push: {comentarios: com}},
            {useFindAndModify: false, new: true}
        )
}

module.exports.incrementarDownloads = (id) =>{
    return Material
            .findOneAndUpdate(
                {_id:id},
                {$inc:{downloads:1}},
                {useFindAndModify: false, new: true}
            )
}

module.exports.getFicheiros = (id) =>{
    return Material
            .find({_id:id},{_id:0,ficheiros:1})
            .exec()
}

module.exports.getTipo = (t) =>{
    return Material
        .find({tipo:t})
        .sort('-dataCriacao')
        .exec()
}

module.exports.getAutor = (t) =>{
    return Material
        .find({nomeAutor:t})
        .sort('-dataCriacao')
        .exec()
}

module.exports.getTitulo = (t) =>{
    return Material
        .find({titulo:t})
        .sort('-dataCriacao')
        .exec()
}