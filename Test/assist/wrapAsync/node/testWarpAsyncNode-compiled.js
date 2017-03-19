/**
 * Created by wzhan039 on 2016-08-09.
 */
'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

//require("babel-polyfill");
//require("babel-core/register");

var testModule = require('../../../../server/assist/wrapAsync/node/wrapAsyncNode').asyncFunc;
var asyncError = require('../../../../server/define/error/asyncNodeError').asyncNodeError;
/*          for generateRandomString test       */
/*var regex=require('../../server/define/regex/regex').regex
var randomStringTypeEnum=require('../../server/define/enum/node').node.randomStringType*/

/*
* 由于nodeunit中没有引入require bable，所以测试的时候只能使用nodeunit xxx-complied.js
* */
var testAsyncFs = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(test) {
        var func, errorSet, result, errorResult;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        test.expect(3);
                        func = testModule.asyncFs.asyncFileFolderExist;
                        errorSet = asyncError.fs;
                        result = void 0;
                        errorResult = void 0;
                        _context.next = 7;
                        return func('C:/asdf');

                    case 7:
                        result = _context.sent;

                        errorResult = errorSet.fileNotExist('C:/asdf');
                        test.equal(result.rc, errorResult.rc, 'async check not exist folder failed');

                        _context.next = 12;
                        return func('C:/Windows');

                    case 12:
                        result = _context.sent;

                        errorResult = errorSet.fileNotExist('C:/Windows');
                        test.equal(result.rc, 0, 'async check exist folder failed');

                        _context.next = 17;
                        return func('C:/Windows/System32/drivers/etc/hosts');

                    case 17:
                        result = _context.sent;

                        errorResult = errorSet.fileNotExist('C:/Windows/System32/drivers/etc/hosts');
                        test.equal(result.rc, 0, 'async check exist file failed');

                        test.done();

                    case 21:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function testAsyncFs(_x) {
        return _ref.apply(this, arguments);
    };
}();

module.exports = {
    testAsyncFs: testAsyncFs
};

//# sourceMappingURL=testWarpAsyncNode-compiled.js.map