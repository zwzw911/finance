/**
 * Created by Ada on 2016/8/28.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var express = require('express');
var app=express()
var router = express.Router();

//var checkInterval=require('../../assist/misc-compiled').func.checkInterval

// var controller=require('./mainRouterController-compiled')
// var common=controller.common
// var debugController=controller.debug
// var userController=controller.user

var coll=require('../../define/enum/node').node.coll
/*var departmentController=controller.department
var employeeController=controller.employee
var unifiedRouterController=controller.billType
var unifiedRouterController=controller.bill*/

// import * as unifiedRouterController from './unifiedRouterController-compiled'
var unifiedRouterController=require('./unifiedRouterController-compiled')
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
        unifiedRouterController.removeAll({'req':req,'res':res}).then((v)=>{console.log(`remove all result is ${JSON.stringify(v)}`)},(e)=>console.log(`remove all fail ${JSON.stringify(e)}`))
    }
})
/*************************       employee     *************************/
//create
router.post('/employee',function(req,res,next){
    //employeeController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)}).catch((e)=>console.log(`post fail ${JSON.stringify(e)}`))
    // console.log(`employee in `)
    unifiedRouterController.create({eCurrentColl:coll.employee, 'req':req,'res':res}).then((v)=>{console.log(`${coll.employee} post result is ${JSON.stringify(v)}`)},(e)=>console.log(`${coll.employee} post fail ${JSON.stringify(e)}`))
})
//read
router.get('/employee',function(req,res,next){
    unifiedRouterController.readAll({eCurrentColl:coll.employee, 'req':req,'res':res}).then((v)=>{console.log(`${coll.employee} read all result is ${JSON.stringify(v)}`)},(e)=>console.log(`${coll.employee} read all fail ${JSON.stringify(e)}`))
})
//read single field
router.get('/employee/name',function(req,res,next){
    console.log('get no name ')
    unifiedRouterController.readName({eCurrentColl:coll.employee, 'req':req,'res':res}).then((v)=>{console.log(`${coll.employee} read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`${coll.employee} read name all fail ${JSON.stringify(e)}`))
})
router.get('/employee/name/:name',function(req,res,next){
    console.log('get name ')
    unifiedRouterController.readName({eCurrentColl:coll.employee, 'req':req,'res':res}).then((v)=>{console.log(`${coll.employee} read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`${coll.employee} read name all fail ${JSON.stringify(e)}`))
})
//update
router.put('/employee',function(req,res,next){
    unifiedRouterController.update({eCurrentColl:coll.employee, 'req':req,'res':res}).then((v)=>{console.log(`${coll.employee} put result is ${JSON.stringify(v)}`)},(e)=>console.log(`${coll.employee} put fail ${JSON.stringify(e)}`))
})
//angular的delete无法像post一样传递额外数据，所以id要放在URL
router.delete('/employee/:id',function(req,res,next){
    unifiedRouterController.remove({eCurrentColl:coll.employee, 'req':req,'res':res}).then((v)=>{console.log(`${coll.employee} delete result is ${JSON.stringify(v)}`)},(e)=>console.log(`${coll.employee} delete fail ${JSON.stringify(e)}`))
})
//search
router.post('/employee/search',function(req,res,next){
    console.log(req.body.values)
    unifiedRouterController.search({eCurrentColl:coll.employee, 'req':req,'res':res}).then((v)=>{console.log(`search result is ${JSON.stringify(v)}`)},(e)=>console.log(`search fail ${JSON.stringify(e)}`))
})

/*************************       department     *************************/
//create
router.post('/department',function(req,res,next){
    //departmentController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)}).catch((e)=>console.log(`post fail ${JSON.stringify(e)}`))
    unifiedRouterController.create({eCurrentColl:coll.department, 'req':req,'res':res}).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
})
//read
router.get('/department',function(req,res,next){
    unifiedRouterController.readAll({eCurrentColl:coll.department, 'req':req,'res':res}).then((v)=>{console.log(`read all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read all fail ${JSON.stringify(e)}`))
})
//read single field
router.get('/department/name',function(req,res,next){
    console.log('get no name ')
    unifiedRouterController.readName({eCurrentColl:coll.department, 'req':req,'res':res}).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
router.get('/department/name/:name',function(req,res,next){
    console.log('get name ')
    unifiedRouterController.readName({eCurrentColl:coll.department, 'req':req,'res':res}).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
//update
router.put('/department',function(req,res,next){
    unifiedRouterController.update({eCurrentColl:coll.department, 'req':req,'res':res}).then((v)=>{console.log(`put result is ${JSON.stringify(v)}`)},(e)=>console.log(`put fail ${JSON.stringify(e)}`))
})
//angular的delete无法像post一样传递额外数据，所以id要放在URL
router.delete('/department/:id',function(req,res,next){
    unifiedRouterController.remove({eCurrentColl:coll.department, 'req':req,'res':res}).then((v)=>{console.log(`delete result is ${JSON.stringify(v)}`)},(e)=>console.log(`delete fail ${JSON.stringify(e)}`))
})
//search
router.post('/department/search',function(req,res,next){
    console.log(req.body.values)
    unifiedRouterController.search({eCurrentColl:coll.department, 'req':req,'res':res}).then((v)=>{console.log(`search result is ${JSON.stringify(v)}`)},(e)=>console.log(`search fail ${JSON.stringify(e)}`))
})
/*************************       billType     *************************/
//create
router.post('/billType',function(req,res,next){
    unifiedRouterController.create({eCurrentColl:coll.billType, 'req':req,'res':res}).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
})
//read
router.get('/billType',function(req,res,next){
    unifiedRouterController.readAll({eCurrentColl:coll.billType, 'req':req,'res':res}).then((v)=>{console.log(`read all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read all fail ${JSON.stringify(e)}`))
})
//read single field
router.get('/billType/name',function(req,res,next){
    console.log('get no name ')
    unifiedRouterController.readName({eCurrentColl:coll.billType, 'req':req,'res':res}).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
router.get('/billType/name/:name',function(req,res,next){
    console.log('get name ')
    unifiedRouterController.readName({eCurrentColl:coll.billType, 'req':req,'res':res}).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
//update
router.put('/billType',function(req,res,next){
    unifiedRouterController.update({eCurrentColl:coll.billType, 'req':req,'res':res}).then((v)=>{console.log(`put result is ${JSON.stringify(v)}`)},(e)=>console.log(`put fail ${JSON.stringify(e)}`))
})
//angular的delete无法像post一样传递额外数据，所以id要放在URL
router.delete('/billType/:id',function(req,res,next){
    //console.log(req.params)
    unifiedRouterController.remove({eCurrentColl:coll.billType, 'req':req,'res':res}).then((v)=>{console.log(`delete result is ${JSON.stringify(v)}`)},(e)=>console.log(`delete fail ${JSON.stringify(e)}`))
})
//search
router.post('/billType/search',function(req,res,next){
    console.log(req.body.values)
    unifiedRouterController.search({eCurrentColl:coll.billType, 'req':req,'res':res}).then((v)=>{console.log(`search result is ${JSON.stringify(v)}`)},(e)=>console.log(`search fail ${JSON.stringify(e)}`))
})

/*************************       bill     *************************/
//create
router.post('/bill',function(req,res,next){
    //unifiedRouterController.create(req,res,next).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)}).catch((e)=>console.log(`post fail ${JSON.stringify(e)}`))
    unifiedRouterController.create({eCurrentColl:coll.bill, 'req':req,'res':res}).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
})
//read
router.get('/bill',function(req,res,next){
    unifiedRouterController.readAll({eCurrentColl:coll.bill, 'req':req,'res':res}).then((v)=>{console.log(`read all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read all fail ${JSON.stringify(e)}`))
})
//read single field
router.get('/bill/name',function(req,res,next){
    console.log('get no name ')
    unifiedRouterController.readName({eCurrentColl:coll.bill, 'req':req,'res':res}).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})

//bill中，使用体统了而不是name
router.get('/bill/name/:title',function(req,res,next){
    console.log('get name ')
    unifiedRouterController.readName({eCurrentColl:coll.bill, 'req':req,'res':res}).then((v)=>{console.log(`read anme all result is ${JSON.stringify(v)}`)},(e)=>console.log(`read name all fail ${JSON.stringify(e)}`))
})
//update
router.put('/bill',function(req,res,next){
    unifiedRouterController.update({eCurrentColl:coll.bill, 'req':req,'res':res}).then((v)=>{console.log(`put result is ${JSON.stringify(v)}`)},(e)=>console.log(`put fail ${JSON.stringify(e)}`))
})
//angular的delete无法像post一样传递额外数据，所以id要放在URL
router.delete('/bill/:id',function(req,res,next){
    unifiedRouterController.remove({eCurrentColl:coll.bill, 'req':req,'res':res}).then((v)=>{console.log(`delete result is ${JSON.stringify(v)}`)},(e)=>console.log(`delete fail ${JSON.stringify(e)}`))
})
//search
router.post('/bill/search',function(req,res,next){
    console.log(req.body.values)
    unifiedRouterController.search({eCurrentColl:coll.bill, 'req':req,'res':res}).then((v)=>{console.log(`search result is ${JSON.stringify(v)}`)},(e)=>console.log(`search fail ${JSON.stringify(e)}`))
})

module.exports = router;