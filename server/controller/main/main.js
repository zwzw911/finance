/**
 * Created by Ada on 2016/8/28.
 */
'use strict'

var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
    // let a=1;
    // console.log('i')
    return res.render('main/main',{ title:'配置信息',year:new Date().getFullYear()});
})

module.exports = router;