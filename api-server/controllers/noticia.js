var Noticia = require('../models/noticia')


module.exports.listar = () => {
    return Noticia
        .find()
        .sort('-data')
        .exec()
}

module.exports.inserir = t => {
    var novo = new Noticia(t)
    return novo.save()
}
