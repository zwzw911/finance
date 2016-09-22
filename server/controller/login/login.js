/**
 * Created by wzhan039 on 2016-07-12.
 */
'use strict'

var express = require('express');
var router = express.Router();

router.get('/',function(rq,res,next){
    let a=1;
    return res.render('login',{ title:'登录',year:new Date().getFullYear()});
})

router.post('/',function(req,res,next){

})
module.exports = router;