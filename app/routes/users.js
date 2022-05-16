var express = require('express');
var router = express.Router();
var axios = require('axios')

/* GET users listing. */

router.get('/signup',function(req,res,next){
  res.render('registo')
})

router.post('/signup', function(req, res) {
    console.log(req.body)
    axios.post('http://localhost:5000/users/signup',req.body)
    .then(dados => {
      console.log(dados)
      res.redirect('/')
    })
    .catch(error=>res.render('error',{error:error}))
});

module.exports = router;
