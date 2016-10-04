'use strict';

/*********************  common  *******************************/
//1. checkInterval
var common = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return checkInterval(req);

                    case 2:
                        result = _context.sent;
                        return _context.abrupt('return', result);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function common(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();

//判断传入的参数是否正确（只能接受object，字符要看能否转换成object）


//对create/update方法输入的value进行检查和转换（字符串的话）
//create:false     update:true
var sanityInput = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(originalInputValue, basedOnInputValue) {
        var convertedInput, checkResult, singleField;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return inputDataFormatValidate(originalInputValue);

                    case 2:
                        convertedInput = _context2.sent;

                        if (!(convertedInput.rc > 0)) {
                            _context2.next = 5;
                            break;
                        }

                        return _context2.abrupt('return', convertedInput);

                    case 5:
                        _context2.next = 7;
                        return validate.checkInput(convertedInput.msg, inputRule.billType, basedOnInputValue);

                    case 7:
                        checkResult = _context2.sent;
                        _context2.t0 = regeneratorRuntime.keys(checkResult);

                    case 9:
                        if ((_context2.t1 = _context2.t0()).done) {
                            _context2.next = 15;
                            break;
                        }

                        singleField = _context2.t1.value;

                        if (!(checkResult[singleField].rc > 0)) {
                            _context2.next = 13;
                            break;
                        }

                        return _context2.abrupt('return', checkResult[singleField]);

                    case 13:
                        _context2.next = 9;
                        break;

                    case 15:
                        return _context2.abrupt('return', convertedInput);

                    case 16:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function sanityInput(_x4, _x5) {
        return _ref2.apply(this, arguments);
    };
}();
/*********************  billType  *******************************/


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by wzhan039 on 2016-09-30.
 * 因为expressjs的router只能支持callback，所有将所有的router处理都单独通过一个async函数处理，然后直接返回promise给router调用，
 *
 */
var inputRule = require('../../define/validateRule/inputRule').inputRule;
var miscFunc = require('../../assist/misc-compiled').func;
var validate = miscFunc.validate;
var checkInterval = miscFunc.checkInterval;

/*                      error               */
var pageError = require('../../define/error/pageError');

var billTypeDbOperation = require('../../model/mongo/billTypeModel');function inputDataFormatValidate(values) {
    if (false === miscFunc.dataTypeCheck.isObject(values) && false === miscFunc.dataTypeCheck.isString(values)) {
        return pageError.common.inputValuesFormatWrong;
    }
    var result = values;
    if (miscFunc.dataTypeCheck.isString(values)) {
        try {
            result = JSON.parse(values);
        } catch (e) {

            return pageError.common.inputValuesParseFail;
        }
    }
    return { rc: 0, msg: result };
}var billType = {};

billType['create'] = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res, next) {
        var sanitizedInputValue, arrayResult, result;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return sanityInput(req.body.values, false);

                    case 2:
                        sanitizedInputValue = _context3.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context3.next = 6;
                            break;
                        }

                        miscFunc.formatRc(sanitizedInputValue);
                        return _context3.abrupt('return', res.json(sanitizedInputValue));

                    case 6:
                        //采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        /*    console.log(`before sant ${sanitizedInputValue.msg}`)
                            console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)*/

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg));
                        _context3.next = 10;
                        return billTypeDbOperation.create(arrayResult);

                    case 10:
                        result = _context3.sent;

                        miscFunc.formatRc(result);
                        //console.log(` inserted result ${JSON.stringify(result)}`)

                        return _context3.abrupt('return', res.json(result));

                    case 13:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    function create(_x6, _x7, _x8) {
        return _ref3.apply(this, arguments);
    }

    return create;
}();

module.exports = {
    common: common,
    billType: billType
};

//# sourceMappingURL=mainRouterController-compiled.js.map