const mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    nome: String
  });

module.exports = mongoose.model('user', userSchema)