var express = require('express');
var router = express.Router();
var utils = require('./utils')
var axios = require('axios')

router.get('/',function(req,res){
    var token = utils.unveilToken(req.cookies.token)

    if(token){
        axios.get("http://localhost:8001/noticias?token="+req.cookies.token)
            .then(dados=>res.render('index',{nivel:token.nivel,noticias:dados.data,idUser:token._id}))
            .catch(erro => res.render('error',{error:erro}))
    }
    else{
        res.render('index')
    }
})


module.exports = router;
