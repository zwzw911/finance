/**
 * Created by Ada on 2016/8/28.
 */
'use strict';

require("babel-polyfill");
require("babel-core/register");

var express = require('express');
var router = express.Router();

var common = require('./mainRouterController-compiled').common;

router.use(function (req, res, next) {
    console.log(req.ips);
    console.log(req.ip);
    console.log('router use');
    common(req, res, next).then(function (v) {
        if (0 !== v['rc']) {
            return res.render('main/main', { title: '拒绝请求', content: v['msg'], year: new Date().getFullYear() });
        }
        next();
    }).catch(function (e) {
        console.log("router error is " + e);
    });

    //next()
});

router.get('/', function (req, res, next) {
    // let a=1;
    // console.log('i')
    return res.render('main/main', { title: '配置信息', year: new Date().getFullYear() });
});

/*
*       billType
* */
//create
router.post('/billType', function (req, res, next) {
    validate.checkInput(inputRule.billType, req.params);
});
//read
router.get('/billType', function (req, res, next) {});
//read single field
router.get('/billType/name', function (req, res, next) {});
//update
router.put('/billType', function (req, res, next) {});
//delete
router.put('/billType', function (req, res, next) {});
module.exports = router;

//# sourceMappingURL=main-compiled.js.map

//# sourceMappingURL=main-compiled-compiled.js.map