// Controlador para o modelo User

var User = require('../models/user')

// Devolve a lista de Users
module.exports.listar = () => {
    return User
        .find()
        .sort('email')
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

module.exports.remover = function(mail){
    return User.deleteOne({email: mail})
}

module.exports.alterar = function(u){
    return User.findByIdAndUpdate({email: u.email}, u, {new: true})
}
