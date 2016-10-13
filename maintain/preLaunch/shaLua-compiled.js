/**
 * Created by wzhan039 on 2016-09-23.
 * 在正式运行整个程序之前，需要预先做的操作
 * 1. sha Lua脚本
 * 2. 检查并格式化rule（比如将1.0转换成1等）
 */
'use strict';

require("babel-polyfill");
require("babel-core/register");
// var func=require('../server/assist/component/shaLua-compiled').shaSingleFile
var shaFunc = require('../../server/assist/component/shaLua-compiled');
//var execLua=shaFunc.execLua
// var file='./Lua_check_interval.lua'
var dir = '../../server/model/redis/Lua';
var validateSingleFieldRule = require('../../server/assist/misc-compiled').func.validateInputRule.checkSingleFieldRuleDefine;
var inputRule = require("../../server/define/validateRule/inputRule").inputRule;

for (var singleColl in inputRule) {
    for (var singleField in inputRule[singleColl]) {
        var result = validateSingleFieldRule(singleColl, singleField, inputRule[singleColl][singleField]);
        if (result.rc > 0) {
            console.log(JSON.stringify(result));
        }
    }
}

shaFunc.shaLuaFileOrDir(dir).then(function (v) {
    return console.log(v);
}).catch(function (e) {
    return console.log(e);
});

//# sourceMappingURL=shaLua-compiled.js.map