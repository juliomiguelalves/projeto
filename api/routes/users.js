var express = require('express');
var router = express.Router();
const axios = require('axios')
var User = require("../controllers/user")

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.listar()
    .then(dados => res.status(200).jsonp(dados))
    .catch(erro => res.status(500).jsonp({erro:erro})) 
});

module.exports = router;
