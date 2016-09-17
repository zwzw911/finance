/**
 * Created by wzhan039 on 2015-09-07.
 * 可以和generalFunction合并
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

require("babel-polyfill");
require("babel-core/register");

var fs = require('fs');
//var general=require('../assist/general').general
var miscError = require('../define/error/nodeError').nodeError.assistError.misc;
var gmError = require('../define/error/nodeError').nodeError.assistError.gmImage;
//var input_validate=require('../error_define/input_validate').input_validate

var randomStringType = require('../define/enum/node').node.randomStringType;
var userStateEnum = require('../define/enum/node').node.userState;
var regex = require('../define/regex/regex').regex;

/*var ioredis=require('ioredis')
var ioredisClient=new ioredis()*/
var LuaSHA = require('../define/enum/Lua').LuaEnum;
var redisError = require('../define/error/redisError').redisError;

/*      for CRUDGlobalSetting       */
var defaultSetting = require('../config/global/defaultGlobalSetting').defaultSetting;
//use redis to save get golbalSetting
var ioredisClient = require('../model/redis/connection/redis_connections').ioredisClient;
/*var dataTypeCheck=require('../../../assist/misc').func.dataTypeCheck
var redisError=require('../../../define/error/redisError').redisError*/
//var inputValid=require('./valid').inputValid

/*              for input valid         */
//var regex=require('../define/regex/regex').regex.regex
var validateError = require('../define/error/nodeError').nodeError.assistError.misc.validate;

/*var dataTypeCheck=require('../assist/misc').func.dataTypeCheck
var ruleTypeCheck=require('../assist/misc').func.ruleTypeCheck*/

//var fs=require('fs')
var dataType = require('../define/enum/validEnum').enum.dataType;
var ruleType = require('../define/enum/validEnum').enum.ruleType;
var clientRuleType = require('../define/enum/validEnum').enum.clientRuleType;

var otherFiledNameEnum = require('../define/enum/validEnum').enum.otherFiledName;
//var rightResult={rc:0}
//var CRUDGlobalSetting=require('../model/redis/common/CRUDGlobalSetting').CRUDGlobalSetting
//var async=require('async')
var redisWrapAsync = require('./wrapAsync/db/redis/wrapAsyncRedis.js');

var rightResult = { rc: 0, msg: null };

var checkInterval = function checkInterval(req, cb) {
    var identify = void 0;
    if (req.session && req.session.id) {
        identify = req.session.id;
    }
    //req.ip和req.ips，只有在设置了trust proxy之后才能生效，否则一直是undefined
    if (req.ips && req.ips[0]) {
        identify = req.ips[0];
    }
    if (undefined === identify) {
        return cb(null, miscError.checkInterval.unknownRequestIdentify);
    }
    ioredisClient.evalsha(LuaSHA.Lua_check_interval, 1, identify, new Date().getTime(), function (err, checkResult) {
        //ioredisClient.eval('../model/redis/lua_script/Lua_check_interval.lua',1,ip,new Date().getTime(),function(err,checkResult){
        //ioredisClient.script('load','../model/redis/lua_script/Lua_check_interval.lua',function(err,sha){
        //    ioredisClient.evalsha(sha,1,ip,new Date().getTime(),function(err,checkResult) {
        if (err) {
            //console.log(err)
            return cb(null, redisError.general.luaFail);
        }
        //let result=checkResult.split(':')
        //if(result[0]==checkResult){
        //console.log(checkResult)
        switch (checkResult[0]) {
            case 0:
                return cb(null, { rc: 0 });
            case 10:
                var rc = {};
                rc['rc'] = miscError.checkInterval.tooMuchReq.rc;
                rc['msg'] = miscError.checkInterval.forbiddenReq.msg.client + "，请在" + checkResult[1] + "秒后重试";
                //console.log(rc)
                return cb(null, rc);
            case 11:
                //console.log(intervalCheckBaseIPNodeError.between2ReqCheckFail)
                return cb(null, miscError.checkInterval.between2ReqCheckFail);
                break;
            case 12:
                //console.log(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
                return cb(null, miscError.checkInterval.exceedMaxTimesInDuration);
                break;
            default:
        }
        //})
    });
};

/*//本来先作为路由句柄，但是此功能无法在router上使用（而只能在app上使用）
//可以作为中间件使用，但是不够灵活（get的时候出错，希望返回页面，post/put/delete的时候返回错误，希望在当前页面跳出对话框提示）。中间件只能对所有方式单一处理。
var checkIntervalMid=function(req,res,next){
    let identify
    if(req.session && req.session.id){
        identify=req.session.id
    }else if(req.ips && req.ips[0]){
        identify= req.ips[0]
    }
    if(undefined===identify){
        //return {rc:}
    }
    ioredisClient.evalsha(LuaSHA.Lua_check_interval,1,identify,new Date().getTime(),function(err,checkResult){
        //ioredisClient.eval('../model/redis/lua_script/Lua_check_interval.lua',1,ip,new Date().getTime(),function(err,checkResult){
        //ioredisClient.script('load','../model/redis/lua_script/Lua_check_interval.lua',function(err,sha){
        //    ioredisClient.evalsha(sha,1,ip,new Date().getTime(),function(err,checkResult) {
        if (err) {
            console.log(err)
            return res.json(null, redisError.general.luaFail)
        }
        //let result=checkResult.split(':')
        /!*console.log(checkResult)
         //if(result[0]==checkResult){
         switch (checkResult[0]) {
         case 0:
         //console.log('next')
         next()
         break;
         //return cb(null, {rc: 0})
         case 10:
         let rc = {}
         rc['rc'] = intervalCheckBaseIPNodeError.tooMuchReq.rc
         rc['msg'] = `${intervalCheckBaseIPNodeError.forbiddenReq.msg}，请在${checkResult[1]}秒后重试`
         //console.log(rc)
         return res.json(rc)
         case 11:
         //console.log(intervalCheckBaseIPNodeError.between2ReqCheckFail)
         return res.json( intervalCheckBaseIPNodeError.between2ReqCheckFail)
         break;
         case 12:
         //console.log(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
         return res.json(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
         break;
         default:
         }*!/

        //})
    })
}*/

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime) return;
    }
}

/*
* 数值123.0复制后，实际变成123，影响程序处理方式
* */
var dataTypeCheck = {
    //是否已经赋值
    isSetValue: function isSetValue(variant) {
        return undefined !== variant && null !== variant;
    },

    //已经赋值，赋的值是不是为空（string:空字符串；object:{},array:[]）
    isEmpty: function isEmpty(value) {
        if (undefined === value || null === value) {
            return true;
        }
        switch (typeof value === "undefined" ? "undefined" : _typeof(value)) {
            case "string":
                return "" === value || 0 === value.length || "" === value.trim();
                break;
            case "object":
                if (true === this.isArray(value)) {
                    return 0 === value.length;
                } else {
                    return 0 === Object.keys(value).length;
                }
                break;
        }
        return false;
    },
    isArray: function isArray(obj) {
        return obj && (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === 'object' && Array == obj.constructor;
    },
    isObject: function isObject(obj) {
        return obj && (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === 'object' && Object == obj.constructor;
    },
    isString: function isString(value) {
        return typeof value === 'string';
    },

    //检查是否有效日期; 返回false或者转换后的日期
    isDate: function isDate(date) {
        var parsedDate = new Date(date);
        if (parsedDate.toLocaleString() === 'Invalid Date') {
            return false;
        }
        return parsedDate;
        //}
    },
    isInt: function isInt(value) {
        //首先检查类型，只对number或者string进行处理（否则parseInt对array也起作用）
        var tmpType = typeof value === "undefined" ? "undefined" : _typeof(value);
        if (tmpType != 'number' && tmpType != 'string') {
            return false;
        }
        var parsedInt = parseInt(value);
        if (true === isNaN(parsedInt)) {
            return false;
        }
        //对于字符来说，如果小数点之后是全0，认为不是整数（即'1.0'不等于'1'）
        if (typeof value == 'string') {
            /*console.log(`${value} is string`)
             console.log(parseInt(value).toString()===value)*/
            if (parsedInt.toString() !== value) {
                return false;
            }
        }
        if (typeof value == 'number') {
            //对于数值来说，如果小数点之后是全0，认为是整数（即1.0等于1）
            if (parsedInt !== value) {
                return false;
            }
        }
        return parsedInt;
        //return false
    },

    //整数，但是超出int所能表示的范围（无法处理，大数会变成科学计数法，从而无法用regex判断）。所以只能处理string类型
    isNumber: function isNumber(value) {
        if ('string' !== typeof value) {
            //value=value.toString()
            return false; //无法处理数字，因为大数字在赋值时被转换成科学计数法，从而无法用regex判断
        }
        return regex.number.test(value);
    },


    //对于大的数字，parseFloat会转换成科学计数法(1.23e+56)
    isFloat: function isFloat(value) {
        //首先检查类型，只对number或者string进行处理（否则parseInt对array也起作用）
        var tmpType = typeof value === "undefined" ? "undefined" : _typeof(value);
        if (tmpType != 'number' && tmpType != 'string') {
            return false;
        }
        var parsedValue = parseFloat(value);
        if (true === isNaN(parsedValue)) {
            return false;
        }
        if ('string' === typeof value) {
            //==，string隐式转换成数字进行比较
            if (parsedValue != value) {
                return false;
            }
        }

        if (typeof value == 'number') {
            if (parsedValue !== value) {
                return false;
            }
        }

        return parsedValue;
    },
    isPositive: function isPositive(value) {

        var parsedValue = parseFloat(value);
        /*        if(isNaN(parsedValue)){
                    return false
                }*/
        return parsedValue > 0;
    },
    isFolder: function isFolder(path) {
        return fs.statSync(path).isDirectory();
    },
    isFile: function isFile(file) {
        return fs.statSync(file).isFile();
    }
};

//无法确保带检测的值的类型（在rule定义的文件中，type可以是字符或者数值，甚至是array），所以需要函数对输入进行检测，排除不支持的类型
var ruleTypeCheck = {
    exceedMaxLength: function exceedMaxLength(value, maxLength) {
        //length属性只能在数字/字符/数组上执行
        if (false === dataTypeCheck.isArray(value) && false === dataTypeCheck.isInt(value) && false === dataTypeCheck.isFloat(value) && dataTypeCheck.isString(value)) {
            return false;
        }
        //数字需要转换成字符才能执行length
        if (false !== dataTypeCheck.isFloat(value) || false !== dataTypeCheck.isInt(value)) {
            return value.toString().length > maxLength;
        }
        return value.length > maxLength;
    },
    exceedMinLength: function exceedMinLength(value, minLength) {
        if (false === dataTypeCheck.isArray(value) && false === dataTypeCheck.isInt(value) && false === dataTypeCheck.isFloat(value) && dataTypeCheck.isString(value)) {
            return false;
        }
        //数字需要转换成字符才能执行length
        if (dataTypeCheck.isFloat(value) || dataTypeCheck.isInt(value)) {
            return value.toString().length < minLength;
        }
        return value.length < minLength;
    },
    exactLength: function exactLength(value, _exactLength) {
        if (false === dataTypeCheck.isArray(value) && false === dataTypeCheck.isInt(value) && false === dataTypeCheck.isFloat(value) && dataTypeCheck.isString(value)) {
            return false;
        }
        //数字需要转换成字符才能执行length
        if (dataTypeCheck.isFloat(value) || dataTypeCheck.isInt(value)) {
            return value.toString().length === _exactLength;
        }
        return value.length === _exactLength;
    },


    //广义比较，包括null和undefined的比较
    equalTo: function equalTo(value, equalToValue) {
        //return (false===dataTypeCheck.isEmpty(value) && value===equalToValue)
        if (value instanceof Date && equalToValue instanceof Date) {
            return value.toLocaleString() === equalToValue.toLocaleString();
        }
        return value === equalToValue;
    },
    format: function format(value, _format) {
        return _format.test(value);
    },


    //以下函数只能支持数值，必须由调用者确保参数的类型
    exceedMax: function exceedMax(value, definedValue) {
        return parseFloat(value) > parseFloat(definedValue);
    },
    exceedMin: function exceedMin(value, definedValue) {
        return parseFloat(value) < parseFloat(definedValue);
    },
    isFileFolderExist: function isFileFolderExist(value) {
        return fs.existsSync(value);
    }
};

var CRUDGlobalSetting = {

    /*    _constructNull(){
            let result={}
            for(let item in defaultSetting){
                result[item]={}
                for (let subItem in defaultSetting[item]){
                    result[item][subItem]={}
                    result[item][subItem]['value']=null
                }
            }
            return result
        },*/

    setDefault: function setDefault() {
        //let emptyValue=this._constructNull()
        //预先构建结构
        var result = {};
        for (var item in defaultSetting) {
            result[item] = {};
            for (var subItem in defaultSetting[item]) {
                result[item][subItem] = {};
                result[item][subItem]['value'] = null;
            }
        }

        for (var _item in defaultSetting) {
            //for(let subItem in defaultSetting[item]){
            var checkResult = validate.checkInput(result[_item], defaultSetting[_item]);

            for (var _subItem in checkResult) {
                if (checkResult[_subItem]['rc'] > 0) {
                    // console.log(checkResult)
                    return checkResult;
                }
            }

            //}
        }

        for (var _item2 in defaultSetting) {
            //console.log(item)
            for (var _subItem2 in defaultSetting[_item2]) {
                //console.log(subItem)
                //Is object but not an array, then change value to string
                //for array, change to string automatically
                var val = defaultSetting[_item2][_subItem2]['default'];
                //console.log(`val:${val}`)
                if ((typeof val === "undefined" ? "undefined" : _typeof(val)) == 'object' && !dataTypeCheck.isArray(val)) {
                    val = JSON.stringify(val);
                    //console.log(val.toString())
                }
                //redisClient.select(1,function(err){
                ioredisClient.hset([_item2, _subItem2, val]);
                //})
            }
        }
        //})
    },


    //直接返回subItem的值
    /*    getSingleSetting(item,subItem,cb){
            //redisClient.on('ready',function(){
            ioredisClient.hexists(item,subItem,function(err,exist){
    //console.log(exist)
                if(1===exist){
                    ioredisClient.hget(item,subItem,function(err,result){
                        if(err){return cb(null,redisError.general.getError)}
                        //redis value are string, check if object(JSON)
    
                        if(0===result.indexOf('{') && result[ result.length-1]=='}'){
    
                            result=JSON.parse(result)
                            //console.log(result)
                        }
                        //array
                        else if(-1!==result.indexOf(',')){
                            result=Array.from(result.split(','))
                        }
    
                        return cb(null,{rc:0,msg:result})
                    })
                }else{
                    return cb(null,redisError.general.keyNotExist)
                }
            })
            //})
        },*/
    getSingleSetting: function getSingleSetting(key, subKey) {
        var _this = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
            var exist, result, value;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return redisWrapAsync.asyncHexists(key, subKey);

                        case 2:
                            exist = _context.sent;

                            if (!(exist.rc > 0)) {
                                _context.next = 5;
                                break;
                            }

                            return _context.abrupt("return", exist);

                        case 5:
                            if (!(1 === exist.msg)) {
                                _context.next = 15;
                                break;
                            }

                            _context.next = 8;
                            return redisWrapAsync.asyncHget(key, subKey);

                        case 8:
                            result = _context.sent;
                            value = result.msg;


                            if (0 === value.indexOf('{') && value[value.length - 1] == '}') {

                                value = JSON.parse(value);
                                //console.log(result)
                            }
                            //array
                            else if (-1 !== value.indexOf(',')) {
                                    value = Array.from(value.split(','));
                                    // console.log(value)
                                }
                            rightResult.msg = value;

                            return _context.abrupt("return", rightResult);

                        case 15:
                            return _context.abrupt("return", redisError.other.notExist(key, subKey));

                        case 16:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }))();
    },

    //获得数据项下所有子项的数据,并构成{item:{subItem1:value1,subItem2;value2}}的格式
    getItemSetting: function getItemSetting(item) {
        var _this2 = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
            var wholeResult, subItem, result;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            wholeResult = {};

                            wholeResult[item] = {};
                            //计算item总数，以便确定合适可以返回全部（因为每读一次，都是异步）
                            /*        var totalSubItemNum=0;
                                    //获得数据项下所有子项的数量
                                    if(undefined!==defaultSetting[item]){
                                        wholeResult[item]={}
                                        totalSubItemNum+=Object.keys(defaultSetting[item]).length
                                        /!*        for (let subItem in  defaultSetting[item]){
                                         totalSubItemNum++
                                         }*!/
                                    }else{
                                        return cb(null,{rc:0,msg:wholeResult})
                                    }*/
                            //console.log(new Date().getTime())
                            //redisClient.on('ready',function(){
                            //console.log(new Date().getTime())
                            _context2.t0 = regeneratorRuntime.keys(defaultSetting[item]);

                        case 3:
                            if ((_context2.t1 = _context2.t0()).done) {
                                _context2.next = 13;
                                break;
                            }

                            subItem = _context2.t1.value;
                            _context2.next = 7;
                            return _this2.getSingleSetting(item, subItem);

                        case 7:
                            result = _context2.sent;

                            if (!(result.rc && result.rc > 0)) {
                                _context2.next = 10;
                                break;
                            }

                            return _context2.abrupt("return", result);

                        case 10:
                            // console.log(result)
                            wholeResult[item][subItem] = result.msg;
                            /*            this.getSingleSetting(item,subItem,function(err,result){
                            //console.log(result)
                                            if(result.rc && result.rc>0){
                                                return cb(null,result)
                                            }
                                            wholeResult[item][subItem]=result.msg
                                            totalSubItemNum--
                                            if(0===totalSubItemNum){
                                                cb(null,{rc:0,msg:wholeResult})
                                            }
                                            //console.log(wholeResult)
                                        })*/
                            _context2.next = 3;
                            break;

                        case 13:
                            rightResult.msg = wholeResult;
                            return _context2.abrupt("return", rightResult);

                        case 15:
                        case "end":
                            return _context2.stop();
                    }
                }
            }, _callee2, _this2);
        }))();
    },

    /*    getAllSetting(cb){
            var wholeResult={};
            //计算item总数，以便确定合适可以返回全部（因为每读一次，都是异步）
            var totalSubItemNum=0;
            for(let item in defaultSetting){
                totalSubItemNum+=Object.keys(defaultSetting[item]).length
            }
            for(let item of Object.keys(defaultSetting)){
                if(undefined===wholeResult[item]){
                    wholeResult[item]={}
                }
                for (let subItem of  Object.keys(defaultSetting[item])){
                    this.getSingleSetting(item,subItem,function(err,result){
                        if(result.rc && result.rc>0){
                            return cb(null,result)
                        }
                        wholeResult[item][subItem]=result.msg
                        totalSubItemNum--
                        if(0===totalSubItemNum){
                            cb(null,{rc:0,msg:wholeResult})
                        }
                        //console.log(wholeResult)
                    })
                }
            }
        },*/
    getAllSetting: function getAllSetting() {
        var _this3 = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee3() {
            var wholeResult, item, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, subItem, result;

            return regeneratorRuntime.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            wholeResult = {};
                            //计算item总数，以便确定合适可以返回全部（因为每读一次，都是异步）
                            // var totalSubItemNum=0;
                            /*        for(let item in defaultSetting){
                                        totalSubItemNum+=Object.keys(defaultSetting[item]).length
                                    }*/

                            _context3.t0 = regeneratorRuntime.keys(defaultSetting);

                        case 2:
                            if ((_context3.t1 = _context3.t0()).done) {
                                _context3.next = 38;
                                break;
                            }

                            item = _context3.t1.value;

                            if (undefined === wholeResult[item]) {
                                wholeResult[item] = {};
                            }
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context3.prev = 8;
                            _iterator = Object.keys(defaultSetting[item])[Symbol.iterator]();

                        case 10:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                _context3.next = 22;
                                break;
                            }

                            subItem = _step.value;

                            console.log(item + " " + subItem);
                            _context3.next = 15;
                            return _this3.getSingleSetting(item, subItem);

                        case 15:
                            result = _context3.sent;

                            if (!(result.rc && result.rc > 0)) {
                                _context3.next = 18;
                                break;
                            }

                            return _context3.abrupt("return", result);

                        case 18:
                            wholeResult[item][subItem] = result.msg;
                            // totalSubItemNum--
                            // if(0===totalSubItemNum){
                            //     cb(null,{rc:0,msg:wholeResult})
                            // }
                            //console.log(wholeResult)
                            // })

                        case 19:
                            _iteratorNormalCompletion = true;
                            _context3.next = 10;
                            break;

                        case 22:
                            _context3.next = 28;
                            break;

                        case 24:
                            _context3.prev = 24;
                            _context3.t2 = _context3["catch"](8);
                            _didIteratorError = true;
                            _iteratorError = _context3.t2;

                        case 28:
                            _context3.prev = 28;
                            _context3.prev = 29;

                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }

                        case 31:
                            _context3.prev = 31;

                            if (!_didIteratorError) {
                                _context3.next = 34;
                                break;
                            }

                            throw _iteratorError;

                        case 34:
                            return _context3.finish(31);

                        case 35:
                            return _context3.finish(28);

                        case 36:
                            _context3.next = 2;
                            break;

                        case 38:
                            return _context3.abrupt("return", wholeResult);

                        case 39:
                        case "end":
                            return _context3.stop();
                    }
                }
            }, _callee3, _this3, [[8, 24, 28, 36], [29,, 31, 35]]);
        }))();
    },
    setSingleSetting: function setSingleSetting(item, subItem, newValue) {
        //redisClient.on('ready',function(){
        if ((typeof newValue === "undefined" ? "undefined" : _typeof(newValue)) == 'object' && !dataTypeCheck.isArray(newValue)) {
            newValue = JSON.stringify(newValue);
        }
        //console.log(item+subItem+newValue)
        ioredisClient.hset([item, subItem, newValue]);
        //})
    },

    //setAllSetting不能代替setDefault，因为setAllSetting读取的是{item1:{subItem1:{value:val1}}（和普通的input结构一致）,而setDefault读取的是{item1:{subItem1:{default:val1,type:'int',max:'',client:{}}}}
    setAllSetting: function setAllSetting(newValueObj) {

        //读取固定键
        //console.log(newValueObj)
        for (var item in newValueObj) {
            for (var subItem in newValueObj[item]) {
                var newValue = newValueObj[item][subItem];
                /*                if (!newValueObj[item][subItem]) {
                 newValue = newValueObj[item][subItem]
                 }*/
                //判断是否对象
                if ((typeof newValue === "undefined" ? "undefined" : _typeof(newValue)) == 'object' && !dataTypeCheck.isArray(newValue)) {
                    newValue = JSON.stringify(newValue);
                }
                this.setSingleSetting(item, subItem, newValue);
            }
        }
        //})
    }
};

//len:产生字符串的长度
//type: basic(0-9A-Z)；normal(0-9A-Za-z); complicated(normal+特殊字符)
var generateRandomString = function generateRandomString() {
    var len = arguments.length <= 0 || arguments[0] === undefined ? 4 : arguments[0];
    var type = arguments.length <= 1 || arguments[1] === undefined ? randomStringType.normal : arguments[1];

    /*    if(undefined===len || false===dataTypeCheck.isInt(len)){
            len=4
        }*/
    /*    strict= strict ? true:false
        let validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result=''
        if(true===strict){validString+=`${validString}!@#$%^&*()+={}[]|\?/><`}*/
    var validString = void 0;
    var basicString = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    switch (type) {
        case randomStringType.basic:
            validString = basicString;
            break;
        case randomStringType.normal:
            validString = basicString + "abcdefghijklmnopqrstuvwxyz";
            break;
        case randomStringType.complicated:
            validString = basicString + 'abcdefghijklmnopqrstuvwxyz' + "`" + "!@#%&)(_=}{:\"><,;'[]^$*+|?.-";
            break;
    }
    //console.log(validString)
    var validStringLen = validString.length;
    var result = '';
    for (var i = 0; i < len; i++) {
        result += validString.substr(parseInt(Math.random() * validStringLen, 10), 1);
    }

    return result;
};

/*var generateSimpleRandomString=function(num){
    var validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var len=validString.length
    var randomIdx,result='';
    for(var i=0;i<num;i++){
        randomIdx=Math.round(Math.random()*(len-1));
        result+=validString[randomIdx]
    }
    return result
}*/

//计算当天剩下的毫秒数
var leftMSInDay = function leftMSInDay() {
    var day = new Date().toLocaleDateString();
    var endTime = '23:59:59';
    //毫秒
    //let ttlTime=parseInt(new Date(`${day} ${endTime}`).getTime())-parseInt(new Date().getTime())
    var ttlTime = new Date(day + " " + endTime).getTime() - new Date().getTime();
    //console.log(ttlTime)
    return ttlTime;
};

var leftSecondInDay = function leftSecondInDay() {
    //console.log(leftMSInDay)
    return Math.round(parseInt(leftMSInDay()) / 1000);
};

/**
 * Created by wzhan039 on 2015-11-18.
 */

//解析GM返回的文件大小，返回数值和单位（GM返回Ki，Mi，Gi.没有单位，是Byte。除了Byte，其他都只保留1位小数，并且四舍五入。例如：1.75Ki=1.8Ki）
//1.8Ki，返回1.8和“ki”；900，返回900
//解析失败，或者单位是Gi，返回对应的错误
//{ rc: 0, msg: { sizeNum: '200', sizeUnit: 'Ki' } }
var parseGmFileSize = function parseGmFileSize(fileSize) {
    var p = /(\d{1,}(\.\d{1,})?)([KkMmGg]i)?/; //1.8Ki
    var parseResult = fileSize.match(p);
    if (null === parseResult) {
        return gmError.cantParseGmFileSize;
    }
    if (parseResult[0] !== fileSize) {
        return gmError.cantParseGmFileSize;
    }
    var fileSizeNum = parseFloat(parseResult[1]);
    if (isNaN(fileSizeNum)) {
        return gmError.cantParseGmFileSizeNum;
    }
    //单位是Gi，直接返回大小超限
    if ('Gi' === parseResult[3]) {
        //正则中的第二个子表达式只是用来把小数及之后的数字 放在一起做判断，而无需取出使用
        return gmError.exceedMaxSize;
    }
    return { rc: 0, msg: { sizeNum: parseResult[1], sizeUnit: parseResult[3] } };
};

//把GM返回的fileSize转换成Byte，以便比较
//{ rc: 0, msg: 204800 }
var convertImageFileSizeToByte = function convertImageFileSizeToByte(fileSizeNum, fileSizeUnit) {
    var imageFileSizeInByte, imageFileSizeNum; //最终以byte为单位的大小； GM得到的size的数值部分
    if (undefined === fileSizeUnit) {
        imageFileSizeInByte = parseInt(fileSizeNum);
        if (isNaN(imageFileSizeInByte)) {
            return gmError.cantParseGmFileSizeNum;
        }
        if (imageFileSizeInByte > 1024 || imageFileSizeInByte < 0) {
            return gmError.invalidFileSizeInByte;
        }
        return isNaN(imageFileSizeInByte) ? gmError.fileSizeEmpty : { rc: 0, msg: imageFileSizeInByte };
    }
    if ('Ki' === fileSizeUnit) {
        //console.log('k')
        imageFileSizeNum = parseFloat(fileSizeNum);
        return isNaN(imageFileSizeNum) ? gmError.cantParseGmFileSizeNum : { rc: 0, msg: parseInt(fileSizeNum * 1024) };
    }
    if ('Mi' === fileSizeUnit) {
        imageFileSizeNum = parseFloat(fileSizeNum);
        return isNaN(imageFileSizeNum) ? gmError.cantParseGmFileSizeNum : { rc: 0, msg: parseInt(fileSizeNum * 1024 * 1024) };
    }
    if ('Gi' === fileSizeUnit) {
        imageFileSizeNum = parseFloat(fileSizeNum);
        return isNaN(imageFileSizeNum) ? gmError.cantParseGmFileSizeNum : { rc: 0, msg: parseInt(fileSizeNum * 1024 * 1024 * 1024) };
    }

    return gmError.invalidSizeUnit;
};

var getPemFile = function getPemFile(pemPath) {
    for (var i = 0, n = pemPath.length; i < n; i++) {
        if (true === fileExist(pemPath[i])) {
            //console.log(pemPath[i])
            return pemPath[i];

            //break
        }
    }
    return;
};

//1. 搜索字符串中的+转换成空格
//2. 截取规定的字符数量
var convertURLSearchString = function convertURLSearchString(searchString, cb) {
    var tmpStr = searchString.split('+');
    //console.log(tmpStr)
    CRUDGlobalSetting.getSingleSetting('search', 'totalKeyLen', function (err, totalLen) {
        if (0 < totalLen.rc) {
            return cb(null, totalLen);
        }
        var strNum = tmpStr.length;
        var curStrLen = 0; //计算当前处理的字符长度
        var curStr = ''; //转换后的搜索字符串（使用空格分隔）
        for (var i = 0; i < strNum; i++) {
            //第一个key就超长，直接截取20个字符
            if (0 === i && tmpStr[0].length > totalLen) {
                curStr = tmpStr[0].substring(0, totalLen);
                return cb(null, { rc: 0, msg: curStr.trim() });
            }
            //如果当前已经处理的字符串+下一个要处理的字符串的长度超出，返回当前已经处理的字符串，舍弃之后的字符串
            //-i:忽略空格的长度
            if (curStr.length + tmpStr[i].length - i > totalLen) {
                return cb(null, { rc: 0, msg: curStr.trim() });
            }
            curStr += tmpStr[i];
            curStr += ' ';
        }
        return cb(null, { rc: 0, msg: curStr.trim() });
    });
};

//获得当前用户的信息，以便在toolbar上显示对应的信息
var getUserInfo = function getUserInfo(req) {
    var result;
    if (req.session.state === userStateEnum.login) {
        result = req.session.userName;
        //result.userId=req.session.userId
    }
    //console.log(result)
    return result;
};

/*var quit=function(req){
 req.session.state=2
 req.session.userName=undefined
 req.session.userId=undefined

 }*/

var checkUserState = function checkUserState(req) {
    //需要检测状态,如果不是1或者2,就没有session,后续的代码也就不必执行
    if (userStateEnum.notLogin != req.session.state && userStateEnum.login != req.session.state) {
        return miscError.user.notLogin;
    }
    return rightResult;
};

//直接在page中使用valid函数进行判断
/*var checkUserIdFormat=function(req){
    return input_validate.user._id.type.define.test(req.session.userId) ? rightResult:input_validate.user._id.type.client
}*/

var checkUserLogin = function checkUserLogin(req) {
    return req.session.state === userStateEnum.login ? rightResult : miscError.user.notLogin;
};

//state只要不是undefine就可以
var checkUserStateNormal = function checkUserStateNormal(req) {
    return userStateEnum.login === req.session.state || userStateEnum.notLogin === req.session.state ? rightResult : miscError.user.stateWrong;
};

/*
//新版本,使用新的逻辑
//不管是request post还是get,都要和session中的lastPost/lastGet比较(如果session中有),然后保存
var checkInterval=function(req){
    //console.log('in')
    var curTime=new Date().getTime();//毫秒数

    var durationSinceLastPost;//当前时间和上次POST的间隔
    var durationSinceLastGet;//当前时间和上次GET的间隔
    var reqType;
    //获得必要的参数
    if (true===req.route.methods.get){
        reqType="GET"
    }
    if (true===req.route.methods.post){
        reqType="POST"
    }
    if(undefined===reqType){
        return runtimeNodeError.general.unknownRequestType;
    }


    if( undefined !=req.session.lastPost){
        durationSinceLastPost=curTime-req.session.lastPost
    }
    if( undefined !=req.session.lastGet){
        durationSinceLastGet=curTime-req.session.lastGet
    }
    //检查
    if("POST"===reqType){
        if(undefined!==durationSinceLastPost){
            if(durationSinceLastPost<general.sameRequestInterval) {
                return runtimeNodeError.general.intervalPostPostWrong
            }
            if( durationSinceLastPost<general.differentRequestInterval){

                return  runtimeNodeError.general.intervalPostGetWrong
            }
        }
        req.session.lastPost=curTime
        return rightResult
    }
    if("GET"===reqType){
        if(undefined!==durationSinceLastGet){
            if(durationSinceLastGet<general.sameRequestInterval) {

                return runtimeNodeError.general.intervalGetGetWrong
            }
            if( durationSinceLastGet<general.differentRequestInterval){
                return  runtimeNodeError.general.intervalGetPostWrong
            }
        }
        req.session.lastGet=curTime
        return rightResult
    }
}
*/

// 检查
// 1. 用户是否通过get获得页面(req.session.state=1 or 2)
// 2. 根据user是否已经登陆，决定是否检查用户session中的用户id是否正确
// 3. 检查interval
// forceCheckUserLogin:true：强制检查用户已经登录； false：不检查用户是否已经登录
var preCheck = function preCheck(req, forceCheckUserLogin) {
    var result = checkUserStateNormal(req);
    if (result.rc > 0) {
        return result;
    }

    if (true === forceCheckUserLogin) {
        if (userStateEnum.login !== req.session.state) {
            return miscError.user.notLogin;
        }
    }

    if (1 === req.session.state) {
        result = regex.objectId.test(req.session.userId);
        if (result.rc > 0) {
            return miscError.user.userIdFormatWrong;
        }
    }
    return checkInterval(req);
};

/*
console.log(generateRandomString(4,randomStringType.basic))
console.log(generateRandomString(4,randomStringType.normal))
console.log(generateRandomString(4,randomStringType.complicated))*/
//根据defaultGlobalSetting的结构，构造空值，以便使用checkInput时，强制对default值进行检测

/*
exports.CRUDGlobalSetting={
    setDefault:setDefault,
    getSingleSetting:getSingleSetting,
    constructNull:constructNull,
    getItemSetting:getItemSetting,//用来获得当个item下所有数据
    getAllSetting:getAllSetting,
    setAllSetting:setAllSetting
};*/

/**
 * Created by wzhan039 on 2016-02-25.
 * 把前端传入的input的检查工作全部放在一个文件进行处理
 * 2部分：input的定义（require,minLength,maxLength,exactLength,format,equalTo），format只在server处理
 * 新增定义：min，max，file，folder：min/max：整数大小；file/folder：文件/文件夹是否存在
 *         对应的函数处理
 */
/*          rulw        */
/*1. 至少定义3个字段：chineseName/type/require
* 2
* */
/*          value
* 1. 如贵value=notSet，那么require=true && default isSet，value=default
* 2. 如果value=notSet，那么require=true && default notSet，返回错误
* 3. 如果value=notSet，那么require=false,返回rc=0
* */
var validate = {
    _private: {
        generateErrorMsg: {
            //itemDefine无用，只是为了格式统一
            require: function require(chineseName, itemDefine, useDefaultValueFlag) {
                if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
                    useDefaultValueFlag = false;
                }
                var defaultMsg = useDefaultValueFlag ? '的默认值' : '';
                return "" + chineseName + defaultMsg + "不能为空";
            },
            maxLength: function maxLength(chineseName, itemDefine, useDefaultValueFlag) {
                if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
                    useDefaultValueFlag = false;
                }
                var defaultMsg = useDefaultValueFlag ? '的默认值' : '';
                return "" + chineseName + defaultMsg + "所包含的字符数不能超过" + itemDefine + "个";
            },
            minLength: function minLength(chineseName, itemDefine, useDefaultValueFlag) {
                if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
                    useDefaultValueFlag = false;
                }
                var defaultMsg = useDefaultValueFlag ? '的默认值' : '';
                return "" + chineseName + defaultMsg + "包含的字符数不能少于" + itemDefine + "个";
            },
            exactLength: function exactLength(chineseName, itemDefine, useDefaultValueFlag) {
                if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
                    useDefaultValueFlag = false;
                }
                var defaultMsg = useDefaultValueFlag ? '的默认值' : '';
                return "" + chineseName + defaultMsg + "包含的字符数不等于" + itemDefine + "个";
            },
            max: function max(chineseName, itemDefine, useDefaultValueFlag, unit) {
                if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
                    useDefaultValueFlag = false;
                }
                var defaultMsg = useDefaultValueFlag ? '的默认值' : '';
                unit = undefined === unit || null === unit ? '' : unit;
                return "" + chineseName + defaultMsg + "的值不能大于" + itemDefine + unit;
            },
            min: function min(chineseName, itemDefine, useDefaultValueFlag, unit) {
                if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
                    useDefaultValueFlag = false;
                }
                var defaultMsg = useDefaultValueFlag ? '的默认值' : '';
                unit = undefined === unit || null === unit ? '' : unit;
                return "" + chineseName + defaultMsg + "的值不能小于" + itemDefine + unit;
            },
            equalTo: function equalTo(chineseName, equalToChineseName) {
                return chineseName + "和" + equalToChineseName + "不相等";
            },
            format: function format(chineseName, itemDefine, useDefaultValueFlag) {
                if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
                    useDefaultValueFlag = false;
                }
                var defaultMsg = useDefaultValueFlag ? '的默认值' : '';
                switch (itemDefine) {
                    case regex.strictPassword:
                        return "" + chineseName + defaultMsg + "的格式不正确，必须由6至20个字母数字和特殊符号组成";
                    //break;
                    case regex.loosePassword:
                        return "" + chineseName + defaultMsg + "的格式不正确，必须由2至20个字母数字组成";
                    //break;
                    case regex.userName:
                        return "" + chineseName + defaultMsg + "的格式不正确，必须由2至20个字符组成";
                    case regex.mobilePhone:
                        return "" + chineseName + defaultMsg + "的格式不正确，必须由11至13个数字组成";
                    case regex.originalThumbnail:
                        return "" + chineseName + defaultMsg + "的格式不正确，文件名由2到20个字符组成";
                    //hashedThumbnail不用单独列出，是内部检查，使用default错误消息即可
                    default:
                        return "" + chineseName + defaultMsg + "的格式不正确";
                }
            }
        },
        //require,maxLength,minLength,exactLength,min,max,format
        //返回值：true/false/unknownDataType
        checkDataTypeBaseOnTypeDefine: function checkDataTypeBaseOnTypeDefine(value, type) {
            switch (type) {
                case dataType.int:
                    return dataTypeCheck.isInt(value); //返回false或者int
                case dataType.float:
                    return dataTypeCheck.isFloat(value); //返回false或者int
                case dataType.string:
                    return dataTypeCheck.isString(value);
                case dataType.date:
                    return dataTypeCheck.isDate(value);
                case dataType.array:
                    return dataTypeCheck.isArray(value);
                case dataType.object:
                    return true;
                case dataType.file:
                    return ruleTypeCheck.isFileFolderExist(value) && dataTypeCheck.isFile(value);
                case dataType.folder:
                    return ruleTypeCheck.isFileFolderExist(value) && dataTypeCheck.isFolder(value);
                case dataType.number:
                    return dataTypeCheck.isNumber(value);
                default:
                    return validateError.unknownDataType;
            }
        },

        //对rule定义进行检查
        //返回值
        checkRuleBaseOnRuleDefine: function checkRuleBaseOnRuleDefine(inputRules) {
            var rc = {};
            for (var inputRule in inputRules) {
                //1 检查必须的field
                var mandatoryFields = ['chineseName', 'type', 'require'];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = mandatoryFields[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var mandatoryField = _step2.value;

                        //console.log(inputRules[inputRule][mandatoryField])
                        if (false === dataTypeCheck.isSetValue(inputRules[inputRule][mandatoryField])) {
                            rc['rc'] = validateError.mandatoryFiledNotExist.rc;
                            rc['msg'] = inputRule + "的字段" + mandatoryField + validateError.mandatoryFiledNotExist.msg;
                            //console.log(rc)
                            return rc;
                            //return validateError.mandatoryFiledNotExist
                        }
                    }
                    //1.5 检查chineseName是否为字符，是否空，type是否在指定范围内（require由后面的rule check统一处理）
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                if (false === dataTypeCheck.isString(inputRules[inputRule]['chineseName'])) {
                    rc['rc'] = validateError.chineseNameNotString.rc;
                    rc['msg'] = inputRule + "的" + validateError.chineseNameNotString.msg;
                    return rc;
                }
                if (dataTypeCheck.isEmpty(inputRules[inputRule]['chineseName'])) {
                    rc['rc'] = validateError.chineseNameEmpty.rc;
                    rc['msg'] = inputRule + "的" + validateError.chineseNameEmpty.msg;
                    return rc;
                }
                //2 关联字段是否存在
                //console.log(inputRules[inputRule]['type'])
                switch (inputRules[inputRule]['type']) {

                    case dataType.int:

                        if (false === dataTypeCheck.isSetValue(inputRules[inputRule]['min'])) {
                            rc['rc'] = validateError.needMin.rc;
                            rc['msg'] = inputRule + "的" + validateError.needMin.msg;
                            return rc;
                        }
                        if (false === dataTypeCheck.isSetValue(inputRules[inputRule]['max'])) {
                            rc['rc'] = validateError.needMax.rc;
                            rc['msg'] = inputRule + "的" + validateError.needMax.msg;
                            return rc;
                        }
                        break;
                    case dataType.number:
                        //console.log(inputRules[inputRule]['maxLength'])
                        if (false === dataTypeCheck.isSetValue(inputRules[inputRule]['maxLength'])) {
                            rc['rc'] = validateError.needMaxLength.rc;
                            rc['msg'] = inputRule + "的" + validateError.needMaxLength.msg;
                            //console.log(rc)
                            return rc;
                        };
                        break;
                    default:
                        break;
                }
                //3 rule字段的定义是否合格
                /*        let rules=['require','maxLength','minLength','exactLength','min','max','format','equalTo']
                 let rulesLength=rules.length*/
                //不用forEach，因为其参数为function，遇到错误，return，只是退出forEach的function，而不是整个function
                //for (let i=0;i<rulesLength;i++){
                for (var singleRule in ruleType) {
                    //console.log('in')
                    //let singleRule=rules[i]
                    if (true === dataTypeCheck.isSetValue(inputRules[inputRule][singleRule])) {
                        if (false === dataTypeCheck.isSetValue(inputRules[inputRule][singleRule]['define'])) {
                            //console.log(inputRules[inputRule][singleRule])
                            rc['rc'] = validateError.ruleDefineNotDefine.rc;
                            rc['msg'] = inputRule + "的" + singleRule + "的" + validateError.ruleDefineNotDefine.msg;
                            return rc;
                            //return  validateError.ruleDefineNotDefine
                        }
                        if (false === dataTypeCheck.isSetValue(inputRules[inputRule][singleRule]['error'])) {
                            rc['rc'] = validateError.errorFieldNotDefine.rc;
                            rc['msg'] = inputRule + "的" + singleRule + "的" + validateError.errorFieldNotDefine.msg;
                            return rc;
                            //return validateError.errorFieldNotDefine
                        }
                        if (false === dataTypeCheck.isSetValue(inputRules[inputRule][singleRule]['error']['rc'])) {
                            rc['rc'] = validateError.rcFieldNotDefine.rc;
                            rc['msg'] = inputRule + "的" + singleRule + "的" + validateError.rcFieldNotDefine.msg;
                            return rc;
                            //return validateError.rcFieldNotDefine
                        }
                        if (false === dataTypeCheck.isSetValue(inputRules[inputRule][singleRule]['error']['msg'])) {
                            rc['rc'] = validateError.msgFieldNotDefine.rc;
                            rc['msg'] = inputRule + "的" + singleRule + "的" + validateError.msgFieldNotDefine.msg;
                            return rc;
                            //return validateError.msgFieldNotDefine
                        }

                        var singleRuleDefine = inputRules[inputRule][singleRule]['define'];

                        switch (singleRule) {
                            case 'require':
                                if (false !== singleRuleDefine && true !== singleRuleDefine) {
                                    rc['rc'] = validateError.requireDefineNotBoolean.rc;
                                    rc['msg'] = inputRule + "的" + validateError.requireDefineNotBoolean.msg;
                                    return rc;
                                }
                                break;
                            case 'minLength':
                                if (false === dataTypeCheck.isInt(singleRuleDefine)) {
                                    rc['rc'] = validateError.minLengthDefineNotInt.rc;
                                    rc['msg'] = inputRule + "的" + validateError.minLengthDefineNotInt.msg;
                                    return rc;
                                }
                                break;
                            case 'maxLength':
                                if (false === dataTypeCheck.isInt(singleRuleDefine)) {
                                    rc['rc'] = validateError.maxLengthDefineNotInt.rc;
                                    rc['msg'] = inputRule + "的" + validateError.maxLengthDefineNotInt.msg;
                                    return rc;
                                }
                                break;
                            case 'exactLength':
                                if (false === dataTypeCheck.isInt(singleRuleDefine)) {
                                    rc['rc'] = validateError.exactLengthDefineNotInt.rc;
                                    rc['msg'] = inputRule + "的" + validateError.exactLengthDefineNotInt.msg;
                                    return rc;
                                }
                                break;
                            case 'min':
                                if (false === dataTypeCheck.isInt(singleRuleDefine)) {
                                    rc['rc'] = validateError.minDefineNotInt.rc;
                                    rc['msg'] = inputRule + "的" + validateError.minDefineNotInt.msg;
                                    return rc;
                                }
                                break;
                            case 'max':
                                if (false === dataTypeCheck.isInt(singleRuleDefine)) {
                                    rc['rc'] = validateError.maxDefineNotInt.rc;
                                    rc['msg'] = inputRule + "的" + validateError.maxDefineNotInt.msg;
                                    return rc;
                                }
                                break;
                            case 'format':
                                break;
                            case 'equalTo':
                                break;
                            default:
                                break;
                        }

                        //                检测error['rc']是否定义
                        /*                        if(undefined===inputRules[inputRule][singleRule]['error'] || null===undefined===inputRules[inputRule][singleRule]['error'] ){
                                                    return validateError.errorFieldNotDefine
                                                }
                                                if(undefined===inputRules[inputRule][singleRule]['error']['rc'] || null===undefined===inputRules[inputRule][singleRule]['error']['rc'] ){
                                                    return validateError.rcFieldNotDefine
                                                }*/
                        /*                if(false===defineOkFlag){
                           }*/
                    }
                }
            }

            return rightResult;
        },

        //必须在checkRuleBaseOnRuleDefine通过之后执行
        //对rule的define转换成正确的类型，便于后续操作(无需执行类型转换)
        sanityRule: function sanityRule(rules) {
            for (var singleRule in rules) {
                for (var singleFiled in rules[singleRule]) {
                    //let singleRuleField
                    switch (singleFiled) {
                        case 'chineseName':
                            //无需sanity
                            break;
                        case 'default':
                            //根据type进行sanity
                            rules[singleRule][singleFiled] = validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled], rules[singleRule]['type']);
                            break;
                        case 'type':
                            //无需sanity
                            break;
                        case 'require':
                            //无需sanity，checkRuleBaseOnRuleDefine已经判断过
                            break;
                        case 'minLength':
                            //console.log(rules[singleRule][singleFiled])
                            rules[singleRule][singleFiled]['define'] = validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled]['define'], dataType.int);
                            break;
                        case 'maxLength':
                            rules[singleRule][singleFiled]['define'] = validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled]['define'], dataType.int);
                            break;
                        case 'exactLength':
                            rules[singleRule][singleFiled]['define'] = validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled]['define'], dataType.int);
                            break;
                        case 'min':
                            rules[singleRule][singleFiled]['define'] = validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled]['define'], dataType.int);
                            break;
                        case 'max':
                            rules[singleRule][singleFiled]['define'] = validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled]['define'], dataType.int);
                            break;
                        case 'format':
                            //无需sanity
                            break;
                        case 'equalTo':
                            //无需sanity
                            break;
                    }
                }
            }
        }
    },
    /*********************************************/
    /*         主函数，检测input并返回结果        */
    /*********************************************/
    //inputValue:{username:{value:xxx},password:{value:yyy}}
    //inputItemDefine： adminLogin。每个页面有不同的定义
    checkInput: function checkInput(inputValue, inputItemDefine) {
        var rc = {};
        var tmpResult = void 0;
        //检查参数的更是，必需是Object，且含有key
        if (false === dataTypeCheck.isSetValue(inputValue)) {
            /*            rc['rc']=validateError.valueNotDefine.rc
                        rc['msg']=`${inputV}validateError`*/
            return validateError.valueNotDefine;
        }
        if (dataTypeCheck.isEmpty(inputValue)) {
            return validateError.valueEmpty;
        }
        //检查rule是否合格
        tmpResult = validate._private.checkRuleBaseOnRuleDefine(inputItemDefine);
        if (0 < tmpResult.rc) {
            return tmpResult;
        }
        //将rule中的define转换成合适的类型（之后进行判断的时候就不用再次转换）
        validate._private.sanityRule(inputItemDefine);
        //console.log(inputItemDefine)

        for (var itemName in inputValue) {
            rc[itemName] = {};
            rc[itemName]['rc'] = 0;
            //无法确定inputValue[itemName]['value']是否undefined，如果是，会报错。所以不适用变量赋值，而在之后的函数中直接传入
            //var currentItemValue=inputValue[itemName]['value']
            //0 当前待检测的value，有没有对应的检测rule定义
            if (false === dataTypeCheck.isSetValue(inputItemDefine[itemName])) {
                rc[itemName]['rc'] = validateError.valueRelatedRuleNotDefine.rc;
                rc[itemName]['msg'] = "" + itemName + validateError.valueRelatedRuleNotDefine.msg;
                return rc;
                //return validateError.noRelatedItemDefine
            }
            var currentItemRule = inputItemDefine[itemName];

            var currentChineseName = inputItemDefine[itemName]['chineseName'];
            //先行判断输入值是否empty，然后赋值给变量；而不是多次使用isEmpty函数。如此，可以加快代码执行速度
            //let emptyFlag=(false=== dataTypeCheck.isSetValue(inputValue[itemName]) &&  false===dataTypeCheck.isSetValue(inputValue[itemName]['value']))
            var emptyFlag = false;
            if (false === dataTypeCheck.isSetValue(inputValue[itemName])) {
                emptyFlag = true;
            } else {
                if (false === dataTypeCheck.isSetValue(inputValue[itemName]['value'])) {
                    emptyFlag = true;
                }
            }

            //let currentItemValue=dataTypeCheck.isEmpty(inputValue[itemName]['value']) ? undefined:inputValue[itemName]['value']
            var currentItemValue = void 0;
            //1. 是否用default代替空的inputValue
            //1 如果是require，但是value为空，那么检查是否有default设置，有的话，inputValue设成default
            var useDefaultValueFlag = false;

            /*            console.log(inputValue[itemName])
                        console.log(dataTypeCheck.isSetValue(inputValue[itemName]))
                        console.log( dataTypeCheck.isSetValue(inputValue[itemName]['value']))*/
            /*            console.log(inputValue[itemName]['value'])
                        console.log(emptyFlag)*/
            /*          value
             * 1. 如贵value=notSet，且require=true && default isSet，value=default
             * 2. 如果value=notSet，且require=true && default notSet，返回错误
             * 3. 如果value=notSet，且require=false,返回rc=0
             * 4. 如果value=set,require=false,继续检测
             * */
            //如果必须有值，但是只没有设；如果default存在，用default的值设置变量currentItemValue；否则用原始的inputValue设置（也就是undefined或者null）
            //if(currentItemRule['require'] && true===currentItemRule['require']['define']){
            if (true === emptyFlag) {
                //console.log(currentItemRule)
                if (true === currentItemRule['require']['define']) {
                    //console.log('require defined')
                    if (currentItemRule['default'] && false === dataTypeCheck.isEmpty(currentItemRule['default'])) {
                        //console.log('default  defined')
                        useDefaultValueFlag = true;
                        currentItemValue = currentItemRule['default'];

                        //重新计算emptyFlag
                        emptyFlag = dataTypeCheck.isEmpty(currentItemValue);
                    } else {
                        //console.log('default not defined')
                        rc[itemName]['rc'] = validateError.valueNotDefineWithRequireTrue.rc;
                        rc[itemName]['msg'] = "" + itemName + validateError.valueNotDefineWithRequireTrue.msg;
                        //return validateError.valueNotDefineWithRequireTrue
                        continue;
                    }
                } else {
                    continue;
                }
            } else {
                //value不为空，付给变量，以便后续操作
                currentItemValue = inputValue[itemName]['value'];
            }

            //console.log(currentItemValue)
            //如果currentItemValue为空，说明没有获得default，或者require为false
            //2. 如果有maxLength属性，首先检查（防止输入的参数过于巨大）
            if (currentItemRule['maxLength'] && currentItemRule['maxLength']['define']) {
                var maxLengthDefine = currentItemRule['maxLength']['define'];
                if (false === emptyFlag && true === ruleTypeCheck.exceedMaxLength(currentItemValue, maxLengthDefine)) {
                    rc[itemName]['rc'] = currentItemRule['maxLength']['error']['rc'];
                    rc[itemName]['msg'] = validate._private.generateErrorMsg.maxLength(currentChineseName, maxLengthDefine, useDefaultValueFlag);
                    continue;
                    //return rc
                }
            }

            /*        if(rc[itemName] && rc[itemName]['rc']>0){
             break
             return rc
             }*/

            //3. 检查value的类型是否符合type中的定义
            /*console.log(currentItemValue)
            console.log(currentItemRule['type'])*/
            var result = validate._private.checkDataTypeBaseOnTypeDefine(currentItemValue, currentItemRule['type']);
            //console.log(result)
            if (result.rc && 0 < result.rc) {
                rc[itemName]['rc'] = result.rc;
                rc[itemName]['msg'] = "" + itemName + result.msg;
                continue;
            }
            if (false === result) {
                rc[itemName]['rc'] = validateError.typeWrong.rc;
                rc[itemName]['msg'] = "" + itemName + validateError.typeWrong.msg;
                continue;
            }

            //    4. 检查出了maxLength之外的每个rule进行检测
            for (var singleItemRuleName in currentItemRule) {
                if ('chineseName' !== singleItemRuleName && 'default' !== singleItemRuleName && 'type' !== singleItemRuleName && 'unit' !== singleItemRuleName) {
                    var ruleDefine = currentItemRule[singleItemRuleName]['define'];
                    switch (singleItemRuleName) {
                        case "require":
                            if (ruleDefine) {
                                if (true === emptyFlag) {
                                    rc[itemName]['rc'] = inputItemDefine[itemName][singleItemRuleName]['error']['rc'];
                                    rc[itemName]['msg'] = validate._private.generateErrorMsg.require(currentChineseName, ruleDefine, useDefaultValueFlag); //参数ruleDefine无用，只是为了函数格式统一
                                }
                            }
                            break;
                        case "minLength":
                            if (false === emptyFlag) {
                                /*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                                 return validateError.minLengthDefineNotInt
                                 }*/
                                if (true === ruleTypeCheck.exceedMinLength(currentItemValue, ruleDefine)) {
                                    rc[itemName]['rc'] = inputItemDefine[itemName][singleItemRuleName]['error']['rc'];
                                    rc[itemName]['msg'] = validate._private.generateErrorMsg.minLength(currentChineseName, ruleDefine, useDefaultValueFlag);
                                }
                            }
                            break;
                        case "maxLength":
                            if (false === emptyFlag) {
                                /*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                                 return validateError.maxLengthDefineNotInt
                                 }*/
                                if (true === ruleTypeCheck.exceedMaxLength(currentItemValue, ruleDefine)) {
                                    rc[itemName]['rc'] = inputItemDefine[itemName][singleItemRuleName]['error']['rc'];
                                    rc[itemName]['msg'] = validate._private.generateErrorMsg.maxLength(currentChineseName, ruleDefine, useDefaultValueFlag);
                                }
                            }
                            break;
                        case "exactLength":
                            if (false === emptyFlag) {
                                /*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                                 return validateError.exactLengthDefineNotInt
                                 }*/
                                if (false === ruleTypeCheck.exactLength(currentItemValue, ruleDefine)) {
                                    rc[itemName]['rc'] = inputItemDefine[itemName][singleItemRuleName]['error']['rc'];
                                    rc[itemName]['msg'] = validate._private.generateErrorMsg.exactLength(currentChineseName, ruleDefine, useDefaultValueFlag);
                                }
                            }
                            break;
                        case 'max':
                            if (false === emptyFlag) {
                                /*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                                 return validateError.maxDefineNotInt
                                 }*/

                                if (true === ruleTypeCheck.exceedMax(currentItemValue, ruleDefine)) {
                                    rc[itemName]['rc'] = inputItemDefine[itemName][singleItemRuleName]['error']['rc'];
                                    rc[itemName]['msg'] = validate._private.generateErrorMsg.max(currentChineseName, ruleDefine, useDefaultValueFlag, inputItemDefine[itemName]['unit']);
                                    /*                                if('expireTimeOfRejectTimes'===itemName){
                                     console.log(rc)
                                     console.log(inputItemDefine[itemName]['unit'])
                                     }*/
                                }
                            }
                            break;
                        case 'min':
                            if (false === emptyFlag) {
                                /*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                                 return validateError.minDefineNotInt
                                 }*/
                                //if(true===ruleTypeCheck.exceedMin(currentItemValue,ruleDefine,inputItemDefine[itemName]['unit'])){
                                if (true === ruleTypeCheck.exceedMin(currentItemValue, ruleDefine)) {
                                    rc[itemName]['rc'] = inputItemDefine[itemName][singleItemRuleName]['error']['rc'];
                                    rc[itemName]['msg'] = validate._private.generateErrorMsg.min(currentChineseName, ruleDefine, useDefaultValueFlag, inputItemDefine[itemName]['unit']);
                                }
                            }
                            break;
                        case "format":
                            if (false === emptyFlag && false === ruleTypeCheck.format(currentItemValue, ruleDefine)) {
                                rc[itemName]['rc'] = inputItemDefine[itemName][singleItemRuleName]['error']['rc'];
                                rc[itemName]['msg'] = validate._private.generateErrorMsg.format(currentChineseName, ruleDefine, useDefaultValueFlag);
                            }
                            break;
                        case "equalTo":
                            //1
                            var equalToFiledName = inputItemDefine[itemName][singleItemRuleName]['define'];
                            //if(false===emptyFlag){
                            //    rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                            //    rc[itemName]['msg']=generateErrorMsg.format(currentChineseName,ruleDefine,useDefaultValueFlag)
                            //}
                            if (true === emptyFlag || true === dataTypeCheck.isEmpty(inputValue[equalToFiledName]['value']) || inputValue[itemName]['value'] !== inputValue[equalToFiledName]['value']) {
                                rc[itemName]['rc'] = inputItemDefine[itemName][singleItemRuleName]['error']['rc'];
                                rc[itemName]['msg'] = validate._private.generateErrorMsg.equalTo(currentChineseName, inputItemDefine[equalToFiledName]['chineseName']);
                            }
                            break;
                        default:

                    }
                }
                //检查出错误后，不在继续检测当前item的其它rule，而是直接检测下一个item
                if (0 !== rc[itemName].rc) {
                    //console.log('skip')
                    break;
                }
            }
            //没有检测出错误，对inpputValue的value进行sanity操作
            var tmpType = inputItemDefine[itemName]['type'];
            /*            console.log(tmpType)
                        console.log(currentItemValue)*/
            if (tmpType === dataType.int || tmpType === dataType.float || tmpType === dataType.date) {
                //对默认值或者inputValue进行sanity
                inputValue[itemName]['value'] = validate._private.checkDataTypeBaseOnTypeDefine(currentItemValue, tmpType);
                //console.log(inputValue)
            }

            //console.log(rc)
        }

        return rc;
        //    注意，返回的结果是对象，结构和inputValue类型，不是{rc;xxx,msg:xxx}的格式
    }
};

/*根据server端rule define，生成客户端input的属性，以便angularjs对input进行检查
 * obj:server端item的rule define( /server/define/validateRule/inputRule)
 * level：深度（2）
 * resultObj: 因为采用递归调用，所以结果参数，而不是直接return结果
 */
var generateClientDefine = function generateClientDefine(obj, level, resultObj) {
    // let resultObj={}
    if ('object' === (typeof obj === "undefined" ? "undefined" : _typeof(obj))) {
        for (var key in obj) {
            resultObj[key] = {};
            //深度为1，到达最底层
            if (1 === level) {
                var tmpChineseName = obj[key]['chineseName'];
                var temInputDataType = void 0;
                switch (obj[key]['type']) {
                    case dataType.number:
                        temInputDataType = 'number';
                        break;
                    case dataType.float:
                        temInputDataType = 'number';
                        break;
                    case dataType.int:
                        temInputDataType = 'number';
                        break;
                    case dataType.password:
                        temInputDataType = 'password';
                        break;
                    case dataType.date:
                        temInputDataType = 'date';
                        break;
                    default:
                        temInputDataType = 'text';
                }
                resultObj[key] = { value: '', originalValue: '', blur: false, focus: true, inputDataType: temInputDataType, inputIcon: "", chineseName: tmpChineseName, errorMsg: "", validated: 'undefined' };
                //obj[key]['chineseName']=tmpChineseName
            } else {
                //如果值是对象，递归调用
                if ('object' === _typeof(obj[key])) {
                    var currentLvl = level - 1;
                    //console.log(currentLvl)
                    generateClientDefine(obj[key], currentLvl, resultObj[key]);
                }
                /*                else{
                 obj[key]={}
                 //func()
                 }*/
            }
        }
    }
    // return resultObj
};

/*根据server端rule define，生成客户端rule define
* obj:server端item的rule define( /server/define/validateRule/inputRule)
* level：深度（2）
* resultObj: 因为采用递归调用，所以结果参数，而不是直接return结果
*/
var generateClientRule = function generateClientRule(obj, level, resultObj) {
    // let resultObj={}
    if ('object' === (typeof obj === "undefined" ? "undefined" : _typeof(obj))) {
        for (var key in obj) {
            resultObj[key] = {};
            //深度为1,达到subItem
            if (1 === level) {
                for (var field in clientRuleType) {
                    //rule有定义
                    if (undefined !== obj[key][field] && null !== obj[key][field]) {
                        //读取rule定义
                        if (undefined !== obj[key][field]['define'] && null !== obj[key][field]['define']) {
                            resultObj[key][field] = {};
                            resultObj[key][field]['define'] = obj[key][field]['define'];
                            //产生错误信息，以便angularjs检查input错误时使用
                            resultObj[key][field]['msg'] = validate._private.generateErrorMsg[field](obj[key]['chineseName'], obj[key][field]['define'], obj[key]['default']);
                        }
                    }
                }
                /*                let tmpChineseName=obj[key]['chineseName']
                 obj[key]={}
                 obj[key]['chineseName']=tmpChineseName*/
            } else {
                //如果值是对象，递归调用
                if ('object' === _typeof(obj[key])) {
                    var currentLvl = level - 1;
                    generateClientRule(obj[key], currentLvl, resultObj[key]);
                }
            }
        }
    }
    // return resultObj
};

//根据skipList提供的key，在origObj删除对应key
//专门使用：使用generateClientRule或者generateClientDefine，是从mongodb structure中直接转换，但是其中有些字段，例如cDate，是后台自动创建，无需前台检测，所以需要删除
//origObj: generateClientRule或者generateClientDefine产生的结果
//skipList:需要删除的字段
//处理完成返回true
var deleteNonNeededObject = function deleteNonNeededObject(origObj, skipList) {
    if (false === dataTypeCheck.isObject(origObj)) {
        return miscError.deleteNonNeededObject.origObjTypeWrong;
    }
    if (false === dataTypeCheck.isObject(skipList)) {
        return miscError.deleteNonNeededObject.skipListTypeWrong;
    }
    for (var coll in origObj) {
        //对应的collection没有需要删除的字段
        if (undefined === skipList[coll]) {
            continue;
        } else {
            //对应的coll有对应的删除字段，查找出对应的字段，并删除
            for (var field in origObj[coll]) {
                if (-1 !== skipList[coll].indexOf(field)) {
                    delete origObj[coll][field];
                }
            }
        }
    }
    return rightResult;
};

//collection的某些字段是ObjectId，需要对应到具体的字段（例如department.parentDepartment在client实际显示的department name，而不是objectID）
//origObj: generateClientRule或者generateClientDefine产生的结果
//matchList：指定对应的filed连接到的coll.field(db中字段是objectID，但是用作外键，实际代表字符等，所以需要修改checkRule和inputAttr的chineseName)
var objectIdToRealField = function objectIdToRealField(origObj, matchList) {
    if (false === dataTypeCheck.isObject(origObj)) {
        return miscError.objectIdToRealField.origObjTypeWrong;
    }
    if (false === dataTypeCheck.isObject(matchList)) {
        return miscError.objectIdToRealField.skipListTypeWrong;
    }
    var tmp = void 0,
        tmpColl = void 0,
        tmpField = void 0;
    //let tmpValue
    for (var coll in matchList) {
        if (undefined === matchList[coll]) {
            continue;
        }
        for (var field in matchList[coll]) {

            tmp = matchList[coll][field].split('.');
            tmpColl = tmp[0];
            tmpField = tmp[1];
            /*            console.log(tmpColl)
                        console.log(tmpField)*/
            //如果是attr（通过判断是否有chineseName），保存原始的chineseName，但是inputDataType换成相关字段的类型
            if (origObj[coll][field]['chineseName']) {
                origObj[coll][field]['inputDataType'] = origObj[tmpColl][tmpField]['inputDataType'];
                /*                tmpValue=origObj[coll][field]['chineseName']
                                console.log(tmpValue)
                                origObj[coll][field]=origObj[tmpColl][tmpField]
                
                                origObj[coll][field]['chineseName']=tmpValue
                                console.log(origObj[coll][field])*/
            } else {
                //否则就是ruleDefine
                //遍历关联字段的rule
                /*                console.log(coll)
                                 console.log(field)
                                console.log(origObj[tmpColl][tmpField])*/
                for (var rule in origObj[tmpColl][tmpField]) {
                    //console.log(rule)
                    //require还是使用原始的定义
                    if ('require' === rule) {
                        continue;
                    }
                    //console.log(tmpField+" "+rule)
                    //其他rule的定义和msg采用关联字段的定义和msg（在客户端使用，没有rc）
                    //如果关联字段中 有某个rule，但是原始字段中 没有，那么在原始字段设置一个空rule
                    if (undefined === origObj[coll][field][rule]) {
                        origObj[coll][field][rule] = {};
                    }
                    //console.log(origObj[tmpColl][tmpField][rule]['define'])
                    origObj[coll][field][rule]['define'] = origObj[tmpColl][tmpField][rule]['define'];
                    origObj[coll][field][rule]['msg'] = origObj[tmpColl][tmpField][rule]['msg'];
                }
            }
        }
    }

    return rightResult;
};

var encodeHtml = function encodeHtml(s) {
    if (undefined === s) {
        return "";
    }
    if ('string' != typeof s) {
        s = s.toString();
    };
    if (0 === s.length) {
        return "";
    };
    var returnHtml = '';

    return s.replace(regex.encodeHtmlChar, function (char) {
        var c = char.charCodeAt(0),
            r = '&#';
        c = 32 === c ? 160 : c;
        return r + c + ';';
    });
    /*    s = (s != undefined) ? s : s.toString();
     return (typeof(s) != "string") ? s :
     s.replace(this.REGX_HTML_ENCODE,
     function($0){
     var c = $0.charCodeAt(0), r = ["&#"];
     c = (c == 0x20) ? 0xA0 : c;
     r.push(c); r.push(";");
     return r.join("");
     });*/
};

exports.func = {
    dataTypeCheck: dataTypeCheck,
    ruleTypeCheck: ruleTypeCheck,
    CRUDGlobalSetting: CRUDGlobalSetting,
    generateRandomString: generateRandomString,
    leftMSInDay: leftMSInDay,
    leftSecondInDay: leftSecondInDay,

    parseGmFileSize: parseGmFileSize,
    convertImageFileSizeToByte: convertImageFileSizeToByte,
    convertURLSearchString: convertURLSearchString,
    getUserInfo: getUserInfo,
    //generateSimpleRandomString:generateSimpleRandomString,
    checkUserState: checkUserState,
    //checkUserIdFormat:checkUserIdFormat,
    checkInterval: checkInterval, // use Lua instead of session(although sesssion use redis too)
    preCheck: preCheck,
    getPemFile: getPemFile,
    //objectIndexOf:objectIndexOf,
    //extractKey:extractKey,
    validate: validate,
    generateClientDefine: generateClientDefine,
    generateClientRule: generateClientRule,
    deleteNonNeededObject: deleteNonNeededObject,
    objectIdToRealField: objectIdToRealField,

    encodeHtml: encodeHtml
};

// CRUDGlobalSetting.setDefault()
/*CRUDGlobalSetting.getSingleSetting('search','maxKeyNum1',function(err,result){
    console.log(err)
    console.log(result)
})*/

//console.log(test())
//test()

//# sourceMappingURL=misc-compiled.js.map