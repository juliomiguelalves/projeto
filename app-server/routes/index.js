var express = require('express');
var router = express.Router();
var utils = require('./utils')

router.get('/',function(req,res){
    if(req.cookies.token){
        var token = utils.unveilToken(req.cookies.token)
        console.log("TOKEN: ",token)
        console.log("COOKIES:",req.cookies.token)
        if (token){
            res.render('index',{nivel:token.nivel})
        }
        else{
            res.render('index')
        }
    }
    else{
        res.render('index')
    }
})


module.exports = router;
