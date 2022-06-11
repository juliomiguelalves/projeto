// Controlador para o modelo User

var User = require('../models/user')

// Devolve a lista de Users
module.exports.listar = () => {
    return User
        .find()
        .sort('email')
        .exec()
}

module.exports.listarPorID = (id) => {
    return User
        .findOne({_id: id})
        .exec()
}

module.exports.consultar = mail => {
    return User
        .findOne({email: mail})
        .exec()
}

module.exports.inserir = u => {
    var novo = new User(u)
    return novo.save()
}

module.exports.removerPorID = function(id){
    return User
        .deleteOne({_id: id})
        .exec()
}

module.exports.editar = function(u){
    return User.findByIdAndUpdate({_id: u._id}, u, {new: true})
}
