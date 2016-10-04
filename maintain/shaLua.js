/**
 * Created by wzhan039 on 2016-09-23.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")
// var func=require('../server/assist/component/shaLua-compiled').shaSingleFile
var shaFunc=require('../server/assist/component/shaLua-compiled')
var execLua=shaFunc.execLua
// var file='./Lua_check_interval.lua'
var dir='../server/model/redis/Lua'




/*
* key不能用引号括起来，否则Lua无法解析；value必须用双引号括起，否则无法解析
* */
//execLua(dir,'set_reject_flag.lua',"{id:'192.168.192.10',ttl:9000}").then((v)=>{let a=JSON.parse(v);console.log(`result is ${a.a}`);console.log(typeof(v))},e=>console.log(`error is ${e}`))


/*
 var params= {
 'id':"192.168.1.1",
 currentTime:new Date().getTime(),
 "setting": {
 "expireTimeBetween2Req": 500,
 "expireTimeOfRejectTimes": 600,
 "timesInDuration": 5,
 "duration": 60,
 "rejectTimesThreshold": 5
 }
 }

 execLua(dir,'Lua_check_interval.lua',JSON.stringify(params)).then((v)=>{let a=JSON.parse(v);console.log(`result is ${a.a}`);console.log(typeof(v))},e=>console.log(`error is ${e}`))
 */

//sha并读取所有的lua脚本
shaFunc.shaLuaFileOrDir(dir).then((v)=>console.log(v)).catch((e)=>console.log(e))
