const mongoose = require('mongoose')


var userSchema = new mongoose.Schema({
    email:String,
    password:String,
    nome:String,
    tipo:String

})

module.exports = mongoose.model('user',userSchema)