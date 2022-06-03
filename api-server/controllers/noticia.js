var Noticia = require('../models/noticia')


module.exports.listar = () => {
    return Noticia
        .find()
        .sort('-data')
        .limit(15)
        .exec()
}

module.exports.inserir = t => {
    var novo = new Noticia(t)
    return novo.save()
}

module.exports.alterar = function(t){
    return Noticia.findOneAndUpdate({idMaterial: t.idMaterial}, t, {new: true})
}