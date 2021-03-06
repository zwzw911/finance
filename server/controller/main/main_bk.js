/**
 * Created by Ada on 2016/8/28.
 * 同时支持unified和static的router
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var express = require('express');
//var app=express()
var router = express.Router();

//var checkInterval=require('../../assist/misc-compiled').func.checkInterval

// var controller=require('./mainRouterController-compiled')
// var common=controller.common
// var debugController=controller.debug
// var userController=controller.user

var coll=require('../../define/enum/node').node.coll

var envSetting=require('../../config/global/appSetting').env
/*var departmentController=controller.department
var employeeController=controller.employee
var unifiedRouterController=controller.billType
var unifiedRouterController=controller.bill*/
var checkInterval=require('../../assist/misc').checkInterval

// import * as unifiedRouterController from './unifiedRouterController-compiled'
var unifiedRouterController=require('./routerController')
router.use(async function(req,res,next){
/*    console.log(req.ips)
    console.log(req.ip)*/
    // console.log('router use')
    if("development"===envSetting){
        console.log('dev, not check interval')
        next()
    }

    if("production"===envSetting) {
        next()
    /*    console.log('production, check interval')


        //判断请求的是页面还是静态资源（css/js），还没有想好如何处理
        if (req.path) {
            console.log(`req.path is ${JSON.stringify(req.path)}`)
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
                    let result=await checkInterval(req)
                    if(result.rc>0){
                        return res.render('helper/reqReject', {
                            title: '拒绝请求',
                            content: result['msg'],
                            year: new Date().getFullYear()
                        });
                    }
            }
        }*/
    }

})

router.get('/', function(req,res,next){
    // let a=1;
    // console.log('i')
    return res.render('main/main',{ title:'配置信息',year:new Date().getFullYear()});
})

router.delete("/",function(req,res,next){
    if('development'===envSetting){
        unifiedRouterController.removeAll({'req':req,'res':res}).then(
            //(v)=>{console.log(`remove all result is ${JSON.stringify(v)}`)}
            (v)=>{
                console.log('delete all resolve')
                return res.json(v)
            }
        ).catch(
            (e)=>{
                console.log(`remove all fail ${JSON.stringify(e)}`)
                return res.json(e)
            }
        )
    }
})
/*************************       employee     *************************/
//create
/*router.post('/employee',function(req,res,next){
 unifiedRouterController.create({eCurrentColl:coll.employee, 'req':req,'res':res}).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
 })*/
router.post('/employee',function(req,res,next){
    unifiedRouterController.create({eCurrentColl:coll.employee, 'req':req,'res':res}).then(
        function(v){
            console.log(`create employee success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        }
    ).catch(
        function(err){
            console.log(`create employee fail: ${JSON.stringify(err)}`)
            return res.json(err)
        }
    )
})
//read
/*router.post('/employee',function(req,res,next){
    unifiedRouterController.readAll({eCurrentColl:coll.employee, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read all employee success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read all employee fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})*/
//read single field
router.post('/employee/name',function(req,res,next){
    // console.log('get no name ')
    unifiedRouterController.readName_old({eCurrentColl:coll.employee, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read all employee name success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read all employee name fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})
/*router.get('/employee/name/:name',function(req,res,next){
    console.log('get name ')
    unifiedRouterController.readName_old({eCurrentColl:coll.employee, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read employee name success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read employee name fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})*/
//update
router.put('/employee',function(req,res,next){
    unifiedRouterController.update({eCurrentColl:coll.employee, 'req':req,'res':res}).then(
        (v)=>{
            //console.log(`update employee success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            //console.log(`update employee fail: ${JSON.stringify(e)}`)
            return res.json(e)
        }
    )
})
//angular的delete无法像post一样传递额外数据，所以id要放在URL
router.post('/employee/delete/:id',function(req,res,next){
    //console.log(req.params)
    unifiedRouterController.remove({eCurrentColl:coll.employee, 'req':req,'res':res}).then(
        (v)=>{
            //console.log(`delete employee success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            //console.log(`delete employee fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})
//search
router.post('/employee/search',function(req,res,next){
    //console.log(req.body.values)
    unifiedRouterController.search({eCurrentColl:coll.employee, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`search employee success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`search employee fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})

/*************************       department     *************************/
//create
/*router.post('/department',function(req,res,next){
 unifiedRouterController.create({eCurrentColl:coll.department, 'req':req,'res':res}).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
 })*/
router.post('/department',function(req,res,next){
    unifiedRouterController.create({eCurrentColl:coll.department, 'req':req,'res':res}).then(
        function(v){
            console.log(`create department success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        }
    ).catch(
        function(err){
            console.log(`create department fail: ${JSON.stringify(err)}`)
            return res.json(err)
        }
    )
})
//read
/*router.get('/department',function(req,res,next){
    unifiedRouterController.readAll({eCurrentColl:coll.department, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read all department success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read all department fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})*/
//read single field
router.post('/department/name',function(req,res,next){
    //console.log('get no name ')
    unifiedRouterController.readName_old({eCurrentColl:coll.department, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read all department name success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read all department name fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})
/*router.get('/department/name/:name',function(req,res,next){
    console.log('get name ')
    unifiedRouterController.readName_old({eCurrentColl:coll.department, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read department name success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read department name fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})*/
//update
router.put('/department',function(req,res,next){
    unifiedRouterController.update({eCurrentColl:coll.department, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`update department success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`update department fail: ${JSON.stringify(e)}`)
            return res.json(e)
        }
    )
})
//angular的delete无法像post一样传递额外数据，所以id要放在URL
router.post('/department/delete/:id',function(req,res,next){
    //console.log(req.params)
    unifiedRouterController.remove({eCurrentColl:coll.department, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`delete department success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`delete department fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})
//search
router.post('/department/search',function(req,res,next){
    //console.log(req.body.values)
    unifiedRouterController.search({eCurrentColl:coll.department, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`search department success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`search department fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})
/*************************       billType     *************************/
//create
/*router.post('/billType',function(req,res,next){
    unifiedRouterController.create({eCurrentColl:coll.billType, 'req':req,'res':res}).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
})*/
router.post('/billType',function(req,res,next){
    ///console.log(`post billtype`)
    unifiedRouterController.create({eCurrentColl:coll.billType, 'req':req,'res':res}).then(
        function(v){
            console.log(`create billType success, result:  ${JSON.stringify(v)}`)
             return res.json(v)
        }
    ).catch(
        function(err){
            console.log(`create billType fail: ${JSON.stringify(err)}`)
            return res.json(err)
        }
    )
})
//read
/*router.get('/billType',function(req,res,next){
    unifiedRouterController.readAll({eCurrentColl:coll.billType, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read all billType success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read all billType fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})*/
//read single field
router.post('/billType/name',function(req,res,next){
    //console.log('get no name ')
    unifiedRouterController.readName_old({eCurrentColl:coll.billType, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read all billType name success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read all billType name fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})
/*router.get('/billType/name/:name',function(req,res,next){
    console.log('get name ')
    unifiedRouterController.readName_old({eCurrentColl:coll.billType, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read billType name success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read billType name fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})*/
//update
router.put('/billType',function(req,res,next){
    unifiedRouterController.update({eCurrentColl:coll.billType, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`update billType success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`update billType fail: ${JSON.stringify(e)}`)
            return res.json(e)
        }
    )
})
//angular的delete无法像post一样传递额外数据，所以id要放在URL
router.post('/billType/delete/:id',function(req,res,next){
    //console.log(req.params)
    unifiedRouterController.remove({eCurrentColl:coll.billType, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`delete billType success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`delete billType fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})
//search
router.post('/billType/search',function(req,res,next){
    //console.log(req.body.values)
    unifiedRouterController.search({eCurrentColl:coll.billType, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`search billType success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`search billType fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})

/*************************       bill     *************************/
//create
/*router.post('/bill',function(req,res,next){
 unifiedRouterController.create({eCurrentColl:coll.bill, 'req':req,'res':res}).then((v)=>{console.log(`post result is ${JSON.stringify(v)}`)},(e)=>console.log(`post fail ${JSON.stringify(e)}`))
 })*/
router.post('/bill',function(req,res,next){
    unifiedRouterController.create({eCurrentColl:coll.bill, 'req':req,'res':res}).then(
        function(v){
            console.log(`create bill success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        }
    ).catch(
        function(err){
            console.log(`create bill fail: ${JSON.stringify(err)}`)
            return res.json(err)
        }
    )
})
//read
/*router.get('/bill',function(req,res,next){
    unifiedRouterController.readAll({eCurrentColl:coll.bill, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read all bill success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read all bill fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})*/
//read single field
router.post('/bill/name',function(req,res,next){
    //console.log('get no name ')
    unifiedRouterController.readName_old({eCurrentColl:coll.bill, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read all bill name success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read all bill name fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})
/*router.get('/bill/name/:title',function(req,res,next){
    console.log('get name ')
    unifiedRouterController.readName_old({eCurrentColl:coll.bill, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read bill name success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read bill name fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})*/
//update
router.put('/bill',function(req,res,next){
    unifiedRouterController.update({eCurrentColl:coll.bill, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`update bill success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`update bill fail: ${JSON.stringify(e)}`)
            return res.json(e)
        }
    )
})
//angular的delete无法像post一样传递额外数据，所以id要放在URL
router.post('/bill/delete/:id',function(req,res,next){
    //console.log(req.params)
    unifiedRouterController.remove({eCurrentColl:coll.bill, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`delete bill success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`delete bill fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})
//search
router.post('/bill/search',function(req,res,next){
    // console.log(req.body.values)
    unifiedRouterController.search({eCurrentColl:coll.bill, 'req':req,'res':res}).then(
        (v)=>{
            console.log(`search bill success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`search bill fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})


/*              static                  */
/*router.get('/bill/static/',function(req,res,next){
    console.log('static get in')
})*/
//采用post，以便处理可能的查询参数
router.post('/bill/static/getCurrentCapital',function(req,res,next){
    // console.log(req.body.values)
    unifiedRouterController.getCurrentCapital({'req':req,'res':res}).then(
        (v)=>{
            console.log(`static success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`static fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})

router.post('/bill/static/getGroupCapital',function(req,res,next){
    // console.log(req.body.values)
    unifiedRouterController.getGroupCapital({'req':req,'res':res}).then(
        (v)=>{
            console.log(`static group success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`static group fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})

router.post('/bill/static/getStaticBillType',function(req,res,next){
    // console.log(req.body.values)
    unifiedRouterController.getStaticBillType().then(
        (v)=>{
            console.log(`static bill type success,result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`static bill type fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})

router.get("/getServerTime",function(req,res,next){
    return res.json(new Date())
})


/*          所有读取name的操作都统一              */
router.post('/name',function(req,res,next){
    // console.log('get no name ')
    unifiedRouterController.readName({ 'req':req,'res':res}).then(
        (v)=>{
            console.log(`read all employee name success, result: ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (e)=>{
            console.log(`read all employee name fail: ${JSON.stringify(e)}`)
            return res.json(e)
        })
})
module.exports = router;