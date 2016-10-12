/**
 * Created by Ada on 2016/8/28.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var express = require('express');
var app=express()
var router = express.Router();

var common=require('./mainRouterController-compiled').common

var controller=require('./mainRouterController-compiled')
var debugController=controller.debug
var userController=controller.user
var departmentController=controller.department
var employeeController=controller.employee
var billTypeController=controller.billType
var billController=controller.bill

router.use(function(req,res,next){
/*    console.log(req.ips)
    console.log(req.ip)*/
    console.log('router use')
    if("development"===app.get('env')){
        console.log('dev, not check interval')
        next()
    }

    if("production"===app.get('env')) {
        console.log(express().get('env'))
        //console.log('%s %s %s', req.method, req.url, req.path);
        //判断请求的是页面还是静态资源（css/js）
        if (req.path) {
            let tmp = req.path.split('.')
            let suffix = tmp[tmp.length - 1]
            //console.log(suffix)
            switch (suffix) {
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
                    common(req, res, next).then(
                        (v)=> {
                            if (0 !== v['rc']) {
                                return res.render('helper/reqReject', {
                                    title: '拒绝请求',
                                    content: v['msg'],
                                    year: new Date().getFullYear()
                                });
                            }
                            next()
                        }
                    ).catch(
                        (e)=> {
                            console.log(`router error is ${e}`)
                        }
                    )

            }

        }
    }

})

router.get('/', function(req,res,next){
    // let a=1;
    // console.log('i')
    return res.render('main/main',{ title:'配置信息',year:new Date().getFullYear()});
})

router.delete("/",function(req,res,next){
    if('development'===app.get('env')){
        debugController['removeAll'](req,res,next).then((v)=>{console.log(`remove all result is ${JSON.stringify(v)}`)},(e)=>console.log(`remove all fail ${JSON.stringify(e)}`))
    }
})
/*************************       employee     *************************/
//create
router.post('/employee',function(req,res,next){
    //employeeController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)}).catch((e)=>console.log(`post fail ${JSON.stringify(e)}`))
    employeeController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
})
//read
router.get('/employee',function(req,res,next){
    employeeController.readAll(req,res,next).then((v)=>{console.log(`read all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read all fail ${JSON.stringify(e)}`))
})
//read single field
router.get('/employee/name',function(req,res,next){
    console.log('get no name ')
    employeeController.readName(req,res,next).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
router.get('/employee/name/:name',function(req,res,next){
    console.log('get name ')
    employeeController.readName(req,res,next).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
//update
router.put('/employee',function(req,res,next){
    employeeController.update(req,res,next).then((v)=>{console.log(`put result is ${JSON.stringify(v)}`)},(e)=>console.log(`put fail ${JSON.stringify(e)}`))
})
//delete
router.delete('/employee',function(req,res,next){
    employeeController.remove(req,res,next).then((v)=>{console.log(`delete result is ${JSON.stringify(v)}`)},(e)=>console.log(`delete fail ${JSON.stringify(e)}`))
})


/*************************       department     *************************/
//create
router.post('/department',function(req,res,next){
    //departmentController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)}).catch((e)=>console.log(`post fail ${JSON.stringify(e)}`))
    departmentController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
})
//read
router.get('/department',function(req,res,next){
    departmentController.readAll(req,res,next).then((v)=>{console.log(`read all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read all fail ${JSON.stringify(e)}`))
})
//read single field
router.get('/department/name',function(req,res,next){
    console.log('get no name ')
    departmentController.readName(req,res,next).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
router.get('/department/name/:name',function(req,res,next){
    console.log('get name ')
    departmentController.readName(req,res,next).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
//update
router.put('/department',function(req,res,next){
    departmentController.update(req,res,next).then((v)=>{console.log(`put result is ${JSON.stringify(v)}`)},(e)=>console.log(`put fail ${JSON.stringify(e)}`))
})
//delete
router.delete('/department',function(req,res,next){
    departmentController.remove(req,res,next).then((v)=>{console.log(`delete result is ${JSON.stringify(v)}`)},(e)=>console.log(`delete fail ${JSON.stringify(e)}`))
})

/*************************       billType     *************************/
//create
router.post('/billType',function(req,res,next){
    billTypeController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
})
//read
router.get('/billType',function(req,res,next){
    billTypeController.readAll(req,res,next).then((v)=>{console.log(`read all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read all fail ${JSON.stringify(e)}`))
})
//read single field
router.get('/billType/name',function(req,res,next){
    console.log('get no name ')
    billTypeController.readName(req,res,next).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
router.get('/billType/name/:name',function(req,res,next){
    console.log('get name ')
    billTypeController.readName(req,res,next).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
//update
router.put('/billType',function(req,res,next){
    billTypeController.update(req,res,next).then((v)=>{console.log(`put result is ${JSON.stringify(v)}`)},(e)=>console.log(`put fail ${JSON.stringify(e)}`))
})
//delete
router.delete('/billType',function(req,res,next){
    billTypeController.remove(req,res,next).then((v)=>{console.log(`delete result is ${JSON.stringify(v)}`)},(e)=>console.log(`delete fail ${JSON.stringify(e)}`))
})


/*************************       bill     *************************/
//create
router.post('/bill',function(req,res,next){
    //billController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)}).catch((e)=>console.log(`post fail ${JSON.stringify(e)}`))
    billController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
})
//read
router.get('/bill',function(req,res,next){
    billController.readAll(req,res,next).then((v)=>{console.log(`read all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read all fail ${JSON.stringify(e)}`))
})
//read single field
router.get('/bill/name',function(req,res,next){
    console.log('get no name ')
    billController.readName(req,res,next).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
router.get('/bill/name/:name',function(req,res,next){
    console.log('get name ')
    billController.readName(req,res,next).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
//update
router.put('/bill',function(req,res,next){
    billController.update(req,res,next).then((v)=>{console.log(`put result is ${JSON.stringify(v)}`)},(e)=>console.log(`put fail ${JSON.stringify(e)}`))
})
//delete
router.delete('/bill',function(req,res,next){
    billController.remove(req,res,next).then((v)=>{console.log(`delete result is ${JSON.stringify(v)}`)},(e)=>console.log(`delete fail ${JSON.stringify(e)}`))
})


module.exports = router;