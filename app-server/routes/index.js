var express = require('express');
var router = express.Router();
var utils = require('./utils')
var axios = require('axios')

router.get('/',function(req,res){
    if(req.cookies.token){
        var noticias
        var token = utils.unveilToken(req.cookies.token)
        axios.get("http://localhost:8001/noticias?token="+req.cookies.token)
            .then(dados=>res.render('index',{nivel:token.nivel,noticias:dados.data}))
            .catch(erro => res.render('error',{error:error}))
    }
    else{
        res.render('index')
    }
})


module.exports = router;
