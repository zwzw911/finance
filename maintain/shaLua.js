/**
 * Created by wzhan039 on 2016-09-23.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")
// var func=require('../server/assist/component/shaLua-compiled').shaSingleFile
var funcDir=require('../server/assist/component/shaLua-compiled').shaLuaFileOrDir
// var file='./Lua_check_interval.lua'
var dir='../server/model/redis/Lua'
// console.log(typeof func)

/*func(file).then((v)=>console.log(v),e=>console.log(e))*/
funcDir(dir).then((v)=>console.log(v),e=>console.log(e))