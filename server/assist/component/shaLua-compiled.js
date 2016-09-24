/**
 * Created by wzhan039 on 2016-09-23.
 */
/*
*  把redis的Lua脚本sha化，存入内存
*  单独一个文件，容易调试
* */
'use strict';

var shaSingleFile = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(file) {
        var content, sha;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return asyncFs.asyncReadFile(file);

                    case 2:
                        content = _context.sent;
                        _context.next = 5;
                        return shaFileContent(content);

                    case 5:
                        sha = _context.sent;
                        return _context.abrupt("return", sha);

                    case 7:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function shaSingleFile(_x) {
        return _ref.apply(this, arguments);
    };
}();

var shaLuaFileOrDir = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(path) {
        var allShaResult, singleShaResult, isDir, isFile, dirContent, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, singleFileDir, tmpFileDir, dirResult, key;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        allShaResult = {};
                        singleShaResult = '';
                        isDir = void 0, isFile = void 0;
                        _context2.next = 5;
                        return asyncFs.asyncIsDir(path);

                    case 5:
                        isDir = _context2.sent;

                        if (!isDir) {
                            _context2.next = 52;
                            break;
                        }

                        _context2.next = 9;
                        return asyncFs.asyncReadDir(path);

                    case 9:
                        dirContent = _context2.sent;
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context2.prev = 13;
                        _iterator = dirContent[Symbol.iterator]();

                    case 15:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context2.next = 38;
                            break;
                        }

                        singleFileDir = _step.value;

                        //需要提供路径（目录+文件名）
                        tmpFileDir = path + "/" + singleFileDir;
                        _context2.next = 20;
                        return asyncFs.asyncIsFile(tmpFileDir);

                    case 20:
                        isFile = _context2.sent;

                        if (!isFile) {
                            _context2.next = 27;
                            break;
                        }

                        _context2.next = 24;
                        return shaSingleFile(tmpFileDir);

                    case 24:
                        singleShaResult = _context2.sent;

                        allShaResult[tmpFileDir] = singleShaResult;
                        // console.log(tmpFileDir+':'+singleShaResult)
                        return _context2.abrupt("continue", 35);

                    case 27:
                        _context2.next = 29;
                        return asyncFs.asyncIsDir(tmpFileDir);

                    case 29:
                        isDir = _context2.sent;

                        if (!isDir) {
                            _context2.next = 35;
                            break;
                        }

                        _context2.next = 33;
                        return shaLuaFileOrDir(tmpFileDir);

                    case 33:
                        dirResult = _context2.sent;

                        for (key in dirResult) {
                            allShaResult[key] = dirResult[key];
                        }

                    case 35:
                        _iteratorNormalCompletion = true;
                        _context2.next = 15;
                        break;

                    case 38:
                        _context2.next = 44;
                        break;

                    case 40:
                        _context2.prev = 40;
                        _context2.t0 = _context2["catch"](13);
                        _didIteratorError = true;
                        _iteratorError = _context2.t0;

                    case 44:
                        _context2.prev = 44;
                        _context2.prev = 45;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 47:
                        _context2.prev = 47;

                        if (!_didIteratorError) {
                            _context2.next = 50;
                            break;
                        }

                        throw _iteratorError;

                    case 50:
                        return _context2.finish(47);

                    case 51:
                        return _context2.finish(44);

                    case 52:
                        return _context2.abrupt("return", allShaResult);

                    case 53:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[13, 40, 44, 52], [45,, 47, 51]]);
    }));

    return function shaLuaFileOrDir(_x2) {
        return _ref2.apply(this, arguments);
    };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

require("babel-polyfill");
require("babel-core/register");
var asyncFs = require('../wrapAsync/node/wrapAsyncNode').asyncFs;
var ioredisError = require('../../define/error/redisError').redisError.cmdError;
var ioredisClient = require('../../model/redis/connection/redis_connection').ioredisClient;

//将文件的 内容 sha化
function shaFileContent(scriptContent) {
    return new Promise(function (resolve, reject) {
        ioredisClient.script('load', scriptContent, function (err, sha) {
            if (err) {
                reject(ioredisError.shaFail());
            }
            resolve(sha);
        });
    });
}

module.exports = {
    shaSingleFile: shaSingleFile,
    shaLuaFileOrDir: shaLuaFileOrDir
};

//# sourceMappingURL=shaLua-compiled.js.map