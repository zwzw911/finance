/**
 * Created by zw on 2016/2/10.
 * checkAllSetting:check if all value valid
 * setAllSetting: save to redis if all value are valid
 * 已经移动到misc中，所以不再需要
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var defaultSetting = require('../../../config/global/globalSettingRule').defaultSetting;
//use redis to save get golbalSetting
var redisClient = require('../connection/redis_connection').ioredisClient;
var dataTypeCheck = require('../../../assist/validateFunc').func.dataTypeCheck;
var redisError = require('../../../define/error/redisError').redisError;
var inputValid = require('../../../assist/validateFunc').func.
/*require('./redis_connections').redisClient1(function(err,result){
    redisClient=result
})*/
//console.log(typeof dataTypeCheck)
redisClient.select(1);
//redisClient.db=1
//console.log(redisClient)

//var redisClient = require("redis").createClient()
//var async=require('async')
//var settingError=require('../../error_define/runtime_node_error').runtime_node_error.setting

var rightResult = { rc: 0 };

/*redisClient.on('ready',function(){
    console.log(2)
            redisClient.multi().set("test1",202).expire('test1',90)
     .exec(function(err,replies){
         console.log(replies)

     })

})*/

//根据defaultGlobalSetting的结构，构造空值，以便使用checkInput时，强制对default值进行检测
var constructNull = function constructNull() {
    var result = {};
    for (var item in defaultSetting) {
        result[item] = {};
        for (var subItem in defaultSetting[item]) {
            result[item][subItem] = {};
            result[item][subItem]['value'] = null;
        }
    }
    return result;
};

var setDefault = function setDefault() {
    var emptyValue = constructNull();
    for (var item in defaultSetting) {
        //for(let subItem in defaultSetting[item]){
        var checkResult = inputValid.checkInput(emptyValue[item], defaultSetting[item]);

        for (var subItem in checkResult) {
            if (checkResult[subItem]['rc'] > 0) {
                console.log(checkResult);
                return checkResult;
            }
        }

        //}
    }

    for (var _item in defaultSetting) {
        //console.log(item)
        for (var _subItem in defaultSetting[_item]) {
            //console.log(subItem)
            //Is object but not an array, then change value to string
            //for array, change to string automatically
            var val = defaultSetting[_item][_subItem]['default'];
            //console.log(`val:${val}`)
            if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) == 'object' && !dataTypeCheck.isArray(val)) {
                val = JSON.stringify(val);
                //console.log(val.toString())
            }
            //redisClient.select(1,function(err){
            redisClient.hset([_item, _subItem, val]);
            //})
        }
    }
    //})
};

//直接返回subItem的值
var getSingleSetting = function getSingleSetting(item, subItem, cb) {
    //redisClient.on('ready',function(){
    redisClient.hexists(item, subItem, function (err, exist) {
        //console.log(exist)
        if (1 === exist) {
            redisClient.hget(item, subItem, function (err, result) {
                if (err) {
                    return cb(null, redisError.general.getError);
                }
                //redis value are string, check if object(JSON)

                if (0 === result.indexOf('{') && result[result.length - 1] == '}') {

                    result = JSON.parse(result);
                    //console.log(result)
                }
                //array
                else if (-1 !== result.indexOf(',')) {
                        result = Array.from(result.split(','));
                    }

                return cb(null, { rc: 0, msg: result });
            });
        } else {
            return cb(null, redisError.general.keyNotExist);
        }
    });

    //})
};

//获得数据项下所有子项的数据,并构成{item:{subItem1:value1,subItem2;value2}}的格式
var getItemSetting = function getItemSetting(item, cb) {
    var wholeResult = {};
    //计算item总数，以便确定合适可以返回全部（因为每读一次，都是异步）
    var totalSubItemNum = 0;
    //获得数据项下所有子项的数量
    if (undefined !== defaultSetting[item]) {
        wholeResult[item] = {};
        totalSubItemNum += Object.keys(defaultSetting[item]).length;
        /*        for (let subItem in  defaultSetting[item]){
                    totalSubItemNum++
                }*/
    } else {
        return cb(null, { rc: 0, msg: wholeResult });
    }
    //console.log(new Date().getTime())
    //redisClient.on('ready',function(){
    //console.log(new Date().getTime())

    var _loop = function _loop(subItem) {
        getSingleSetting(item, subItem, function (err, result) {
            //console.log(result)
            if (result.rc && result.rc > 0) {
                return cb(null, result);
            }
            wholeResult[item][subItem] = result.msg;
            totalSubItemNum--;
            if (0 === totalSubItemNum) {
                cb(null, { rc: 0, msg: wholeResult });
            }
            //console.log(wholeResult)
        });
    };

    for (var subItem in defaultSetting[item]) {
        _loop(subItem);
    }
    //})
};
var getAllSetting = function getAllSetting(cb) {
    var wholeResult = {};
    //计算item总数，以便确定合适可以返回全部（因为每读一次，都是异步）
    var totalSubItemNum = 0;
    for (var item in defaultSetting) {
        totalSubItemNum += Object.keys(defaultSetting[item]).length;
        /*        for (let subItem in  defaultSetting[item]){
                    totalSubItemNum++
                }*/
    }
    //console.log(totalSubItemNum)
    //redisClient.on('ready',function(){
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        var _loop2 = function _loop2() {
            var item = _step.value;

            if (undefined === wholeResult[item]) {
                wholeResult[item] = {};
            }
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                var _loop3 = function _loop3() {
                    var subItem = _step2.value;

                    getSingleSetting(item, subItem, function (err, result) {
                        if (result.rc && result.rc > 0) {
                            return cb(null, result);
                        }
                        wholeResult[item][subItem] = result.msg;
                        totalSubItemNum--;
                        if (0 === totalSubItemNum) {
                            cb(null, { rc: 0, msg: wholeResult });
                        }
                        //console.log(wholeResult)
                    });
                };

                for (var _iterator2 = Object.keys(defaultSetting[item])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    _loop3();
                }
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
        };

        for (var _iterator = Object.keys(defaultSetting)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            _loop2();
        }

        //})
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }
};

//使用通用函数处理
/*var checkSingleSetting=function(item,subItem,newValue){
    if(!newValue){
        return settingError.emptyGlobalSettingValue
    }
    if(!defaultSetting[item][subItem]){
        return settingError.invalidSettingParam
    }
    //根据类型进行检测，没有type定义，直接pass
    if(defaultSetting[item][subItem][type]){
        switch (defaultSetting[item][subItem][type]){
            case 'int':
                if(false===miscFunc.isInt(newValue)){
                    return settingError.settingValueNotInt
                }
                if(defaultSetting[item][subItem][max]){
                    let newValueInt=parseInt(newValue)
                    if(newValueInt>defaultSetting[item][subItem][max]){
                        return settingError.settingValueExceedMaxInt
                    }
                    //最小值检查包含在最大值检查中
                    // 最小值没有定义，默认是0
                    let definedMinValue=0
                    if(defaultSetting[item][subItem][min]){
                        definedMinValue=parseInt(defaultSetting[item][subItem][min])
                    }
                    if(newValueInt<definedMinValue){
                        return settingError.settingValueExceedMinInt
                    }
                }
                break;
            case 'path':
                if(false===miscFunc.isFolder(newValue)){
                    return settingError.settingValuePathNotExist
                }
                if(defaultSetting[item][subItem][maxLength]){
                    let definedMaxLength=defaultSetting[item][subItem][maxLength]
                    if(newValue.length>definedMaxLength){
                        return defaultSetting[item][subItem][client][maxLength]
                    }
                    //check min
                    let definedMinLength=0
                    if(defaultSetting[item][subItem][minLength]){
                        definedMinLength=defaultSetting[item][subItem][minLength]
                    }
                    if(newValue.length<definedMinLength){
                        return defaultSetting[item][subItem][client][minLength]
                    }
                }
                break;
            case 'file':
                if(false===miscFunc.isFile(newValue)){
                    return settingError.settingValueFileNotExist
                }
                if(defaultSetting[item][subItem][maxLength]){
                    let definedMaxLength=defaultSetting[item][subItem][maxLength]
                    if(newValue.length>definedMaxLength){
                        return defaultSetting[item][subItem][client][maxLength]
                    }
                    //check min
                    let definedMinLength=0
                    if(defaultSetting[item][subItem][minLength]){
                        definedMinLength=defaultSetting[item][subItem][minLength]
                    }
                    if(newValue.length<definedMinLength){
                        return defaultSetting[item][subItem][client][minLength]
                    }
                }
                break;
        }
    }
    return rightResult
}
var checkAllSetting=function(valueObj){
    for(let item of Object.keys(defaultSetting)) {
        for (let subItem of  Object.keys(defaultSetting[item])) {
            let checkResult=checkSingleSetting(item,subItem,valueObj[item][subItem])
            if(checkResult.rc!==0){
                return checkResult
            }
        }
    }
    return rightResult
}*/

var setSingleSetting = function setSingleSetting(item, subItem, newValue) {
    //redisClient.on('ready',function(){
    if ((typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) == 'object' && !dataTypeCheck.isArray(newValue)) {
        newValue = JSON.stringify(newValue);
    }
    //console.log(item+subItem+newValue)
    redisClient.hset([item, subItem, newValue]);
    //})
};
//setAllSetting不能代替setDefault，因为setAllSetting读取的是{item1:{subItem1:{value:val1}}（和普通的input结构一致）,而setDefault读取的是{item1:{subItem1:{default:val1,type:'int',max:'',client:{}}}}
var setAllSetting = function setAllSetting(newValueObj) {
    //redisClient.on('ready',function() {
    /*        let checkResult=inputValid.checkInput(newValueObj,defaultSetting)
            if(checkResult.rc>0){
                return checkResult
            }*/
    //读取固定键
    //console.log(newValueObj)
    for (var item in newValueObj) {
        for (var _subItem2 in newValueObj[item]) {
            var newValue = newValueObj[item][_subItem2];
            /*                if (!newValueObj[item][subItem]) {
                                newValue = newValueObj[item][subItem]
                            }*/
            //判断是否对象
            if ((typeof newValue === 'undefined' ? 'undefined' : _typeof(newValue)) == 'object' && !dataTypeCheck.isArray(newValue)) {
                newValue = JSON.stringify(newValue);
            }
            setSingleSetting(item, _subItem2, newValue);
        }
    }
    //})
};
//redisClient.on('ready',function(){
//    setDefault(defaultSetting)
//    getAllSetting(function(err,result){
//        console.log(result['attachment']['validSuffix'])
//    })
//})

//set

exports.CRUDGlobalSetting = {
    setDefault: setDefault,
    getSingleSetting: getSingleSetting,
    constructNull: constructNull,
    getItemSetting: getItemSetting, //用来获得当个item下所有数据
    getAllSetting: getAllSetting,
    setAllSetting: setAllSetting
};

//constructNull()
//setDefault()
//getSingleSetting()
/*
var fs=require('fs')
getAllSetting(function(err,result){
    console.log(result.msg)
    fs.w
})*/

//# sourceMappingURL=CRUDGlobalSetting-compiled.js.map