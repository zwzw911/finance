/**
 * Created by wzhan039 on 2016-09-23.
 */
'use strict';

require("babel-polyfill");
require("babel-core/register");
var func = require('../server/assist/component/shaLua-compiled').shaSingleFile;
var funcDir = require('../server/assist/component/shaLua-compiled').shaLuaFileOrDir;
var file = './Lua_check_interval.lua';
var dir = './Lua';
// console.log(typeof func)

/*func(file).then((v)=>console.log(v),e=>console.log(e))*/
funcDir(dir).then(function (v) {
  return console.log(v);
}, function (e) {
  return console.log(e);
});

//# sourceMappingURL=Lua_test-compiled.js.map