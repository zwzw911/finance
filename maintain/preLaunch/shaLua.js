/**
 * Created by wzhan039 on 2016-09-23.
 * 在正式运行整个程序之前，需要预先做的操作
 * 1. sha Lua脚本
 * 2. 检查并格式化rule（比如将1.0转换成1等）
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")
// var func=require('../server/assist/component/shaLua-compiled').shaSingleFile
var shaFunc=require('../../server/assist/component/shaLua')
//var execLua=shaFunc.execLua
// var file='./Lua_check_interval.lua'
var dir='../../server/model/redis/Lua'
var validateSingleFieldRule=require('../../server/assist/misc').func.validateInputRule.checkSingleFieldRuleDefine
var inputRule=require("../../server/define/validateRule/inputRule").inputRule

for(let singleColl in inputRule){
    for(let singleField in inputRule[singleColl]){
        let result=validateSingleFieldRule(singleColl,singleField,inputRule[singleColl][singleField])
        if(result.rc>0){
            console.log(JSON.stringify(result))
        }
    }
}

shaFunc.shaLuaFileOrDir(dir).then((v)=>console.log(v)).catch((e)=>console.log(e))
