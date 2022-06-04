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

module.exports.alterar = function(t){
    return Material.findByIdAndUpdate({_id: t._id}, t, {new: true})
}

module.exports.alterarPorID = function(id,t){
    return Material.findOneAndUpdate({_id: id}, t, {new: true})
}