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


/*
*       billType
* */
//create
router.post('/billType',function(req,res,next){

})
//read
router.get('/billType',function(req,res,next){

})
router.get('/billType/name',function(req,res,next){

})
//update
router.put('/billType',function(req,res,next){

})
//delete
router.put('/billType',function(req,res,next){

})
module.exports = router;