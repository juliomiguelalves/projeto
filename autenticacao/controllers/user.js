var User = require('../models/user')

module.exports.listar= function(){
        return User
            .find()
            .exec()
}

module.exports.inserir = function(u){
    var newUser = new User(u)
    return newUser.save()
}

module.exports.consultar = email => {
    return User
        .findOne({email})
        .exec()
}