/**
 * Created by Ada on 2016/8/28.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var express = require('express');
var router = express.Router();

var common=require('./mainRouterController-compiled').common

var billTypeController=require('./mainRouterController-compiled').billType
router.use(function(req,res,next){
/*    console.log(req.ips)
    console.log(req.ip)*/
    console.log('router use')
    //console.log('%s %s %s', req.method, req.url, req.path);
    //判断请求的是页面还是静态资源（css/js）
    if(req.path){
        let tmp=req.path.split('.')
        let suffix=tmp[tmp.length-1]
        //console.log(suffix)
        switch (suffix){
            case 'css':
                //不对静态资源的请求进行检测
                next()
                break;
            case 'js':
                //不对静态资源的请求进行检测
                next()
                break;
            case 'map':
                //不对静态资源的请求进行检测
                next()
                break;
            default:
                common(req,res,next).then(
                    (v)=>{
                        if(0!==v['rc']){
                            return res.render('helper/reqReject',{ title:'拒绝请求',content:v['msg'],year:new Date().getFullYear()});
                        }
                        next()
                    }
                ).catch(
                    (e)=>{console.log(`router error is ${e}`)}
                )

        }

    }



    //next()
})

router.get('/', function(req,res,next){
    // let a=1;
    // console.log('i')
    return res.render('main/main',{ title:'配置信息',year:new Date().getFullYear()});
})


/*
*       billType
* */
//create
router.post('/billType',function(req,res,next){
    //billTypeController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)}).catch((e)=>console.log(`post fail ${JSON.stringify(e)}`))
    billTypeController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
})
//read
router.get('/billType',function(req,res,next){

})
//read single field
router.get('/billType/name',function(req,res,next){

})
//update
router.put('/billType',function(req,res,next){

})
//delete
router.put('/billType',function(req,res,next){

})
module.exports = router;