// Controlador para o modelo MaterialTipo

var MaterialTipo = require('../models/tipoMaterial')

// lista as publicações
module.exports.listar = () => {
    return MaterialTipo
        .find({}, {_id: 0, tipo: 1})
        .sort({tipo: 1})
        .exec()
}

module.exports.inserir = tipo => {
    var novo = new MaterialTipo({tipo:tipo})
    return novo.save()
}