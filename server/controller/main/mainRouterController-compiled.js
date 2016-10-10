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
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(originalInputValue, inputRule, basedOnInputValue) {
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
                        return validate.checkInput(convertedInput.msg, inputRule, basedOnInputValue);

                    case 7:
                        checkResult = _context2.sent;

                        console.log('check input  result is ' + JSON.stringify(checkResult));
                        _context2.t0 = regeneratorRuntime.keys(checkResult);

                    case 10:
                        if ((_context2.t1 = _context2.t0()).done) {
                            _context2.next = 16;
                            break;
                        }

                        singleField = _context2.t1.value;

                        if (!(checkResult[singleField].rc > 0)) {
                            _context2.next = 14;
                            break;
                        }

                        return _context2.abrupt('return', checkResult[singleField]);

                    case 14:
                        _context2.next = 10;
                        break;

                    case 16:
                        return _context2.abrupt('return', convertedInput);

                    case 17:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function sanityInput(_x4, _x5, _x6) {
        return _ref2.apply(this, arguments);
    };
}();

/*********************  user  ******************************
 * 操作的用户：只有创建和更新（密码）的操作，并且是在程序内部执行，而非client发起req
 * */


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

var departmentDbOperation = require('../../model/mongo/departmentModel');
var employeeDbOperation = require('../../model/mongo/employeeModel');
var billTypeDbOperation = require('../../model/mongo/billTypeModel');
var billDbOperation = require('../../model/mongo/billModel');function inputDataFormatValidate(values) {
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
}var user = {};
user['create'] = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res, next) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function (_x7, _x8, _x9) {
        return _ref3.apply(this, arguments);
    };
}();

user['update'] = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res, next) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function (_x10, _x11, _x12) {
        return _ref4.apply(this, arguments);
    };
}();

/*********************  department  ******************************
 * 部门
 * */
var department = {};
department['create'] = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res, next) {
        var sanitizedInputValue, arrayResult, result;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _context5.next = 2;
                        return sanityInput(req.body.values, inputRule.department, false);

                    case 2:
                        sanitizedInputValue = _context5.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context5.next = 6;
                            break;
                        }

                        miscFunc.formatRc(sanitizedInputValue);
                        return _context5.abrupt('return', res.json(sanitizedInputValue));

                    case 6:
                        //采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        //     console.log(`before sant ${sanitizedInputValue.msg}`)
                        //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg));
                        _context5.next = 10;
                        return departmentDbOperation.create(arrayResult);

                    case 10:
                        result = _context5.sent;
                        return _context5.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 12:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function (_x13, _x14, _x15) {
        return _ref5.apply(this, arguments);
    };
}();

department['remove'] = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.next = 2;
                        return sanityInput(req.body.values, inputRule.department, true);

                    case 2:
                        sanitizedInputValue = _context6.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context6.next = 5;
                            break;
                        }

                        return _context6.abrupt('return', res.json(miscFunc.formatRc(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;
                        //console.log(`id is ${id}`)

                        _context6.next = 9;
                        return departmentDbOperation.remove(id);

                    case 9:
                        result = _context6.sent;
                        return _context6.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 11:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function (_x16, _x17, _x18) {
        return _ref6.apply(this, arguments);
    };
}();

department['update'] = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.next = 2;
                        return sanityInput(req.body.values, inputRule.department, true);

                    case 2:
                        sanitizedInputValue = _context7.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context7.next = 5;
                            break;
                        }

                        return _context7.abrupt('return', res.json(miscFunc.formatRc(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;

                        delete convertedResult._id;

                        _context7.next = 10;
                        return departmentDbOperation.update(id, convertedResult);

                    case 10:
                        result = _context7.sent;
                        return _context7.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 12:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    return function (_x19, _x20, _x21) {
        return _ref7.apply(this, arguments);
    };
}();

department['readAll'] = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        _context8.next = 2;
                        return departmentDbOperation.readAll();

                    case 2:
                        result = _context8.sent;
                        return _context8.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 4:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    return function (_x22, _x23, _x24) {
        return _ref8.apply(this, arguments);
    };
}();

department['readName'] = function () {
    var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(req, res, next) {
        var recorder, constructedValue, validateResult;
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        recorder = void 0;

                        if (!req.params.name) {
                            _context9.next = 13;
                            break;
                        }

                        // console.log(`name is ${req.params.name}`)
                        constructedValue = { name: { value: req.params.name } };
                        _context9.next = 5;
                        return miscFunc.validate.checkSearchValue(constructedValue, inputRule.department);

                    case 5:
                        validateResult = _context9.sent;

                        if (!(validateResult['name']['rc'] > 0)) {
                            _context9.next = 8;
                            break;
                        }

                        return _context9.abrupt('return', res.json(validateResult['name']));

                    case 8:
                        _context9.next = 10;
                        return departmentDbOperation.readName(req.params.name);

                    case 10:
                        recorder = _context9.sent;
                        _context9.next = 16;
                        break;

                    case 13:
                        _context9.next = 15;
                        return departmentDbOperation.readName();

                    case 15:
                        recorder = _context9.sent;

                    case 16:
                        return _context9.abrupt('return', res.json(miscFunc.formatRc(recorder)));

                    case 17:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));

    return function (_x25, _x26, _x27) {
        return _ref9.apply(this, arguments);
    };
}();

/*********************  employee  ******************************
 * 员工
 * */
var employee = {};
employee['create'] = function () {
    var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(req, res, next) {
        var sanitizedInputValue, arrayResult, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, doc, fkResult, result;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return sanityInput(req.body.values, inputRule.employee, false);

                    case 2:
                        sanitizedInputValue = _context10.sent;

                        console.log('1st san ' + JSON.stringify(sanitizedInputValue));

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context10.next = 6;
                            break;
                        }

                        return _context10.abrupt('return', res.json(miscFunc.formatRc(sanitizedInputValue)));

                    case 6:
                        //采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        //     console.log(`before sant ${sanitizedInputValue.msg}`)
                        //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg));
                        //检查外键是否存在
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context10.prev = 11;
                        _iterator = arrayResult[Symbol.iterator]();

                    case 13:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context10.next = 26;
                            break;
                        }

                        doc = _step.value;
                        _context10.next = 17;
                        return departmentDbOperation.findById(doc.department);

                    case 17:
                        fkResult = _context10.sent;

                        if (!(null === fkResult.msg)) {
                            _context10.next = 20;
                            break;
                        }

                        return _context10.abrupt('return', res.json(miscFunc.formatRc(pageError.employee.departmentNotExist)));

                    case 20:
                        if (!(fkResult.msg && fkResult.msg._id)) {
                            _context10.next = 23;
                            break;
                        }

                        if (!(fkResult.msg._id.toString() !== doc.department.toString())) {
                            _context10.next = 23;
                            break;
                        }

                        return _context10.abrupt('return', res.json(pageError.employee.departmentNotExist));

                    case 23:
                        _iteratorNormalCompletion = true;
                        _context10.next = 13;
                        break;

                    case 26:
                        _context10.next = 32;
                        break;

                    case 28:
                        _context10.prev = 28;
                        _context10.t0 = _context10['catch'](11);
                        _didIteratorError = true;
                        _iteratorError = _context10.t0;

                    case 32:
                        _context10.prev = 32;
                        _context10.prev = 33;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 35:
                        _context10.prev = 35;

                        if (!_didIteratorError) {
                            _context10.next = 38;
                            break;
                        }

                        throw _iteratorError;

                    case 38:
                        return _context10.finish(35);

                    case 39:
                        return _context10.finish(32);

                    case 40:
                        _context10.next = 42;
                        return employeeDbOperation.create(arrayResult);

                    case 42:
                        result = _context10.sent;
                        return _context10.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 44:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this, [[11, 28, 32, 40], [33,, 35, 39]]);
    }));

    return function (_x28, _x29, _x30) {
        return _ref10.apply(this, arguments);
    };
}();

employee['remove'] = function () {
    var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        _context11.next = 2;
                        return sanityInput(req.body.values, inputRule.employee, true);

                    case 2:
                        sanitizedInputValue = _context11.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context11.next = 5;
                            break;
                        }

                        return _context11.abrupt('return', res.json(miscFunc.formatRc(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;
                        //console.log(`id is ${id}`)

                        _context11.next = 9;
                        return employeeDbOperation.remove(id);

                    case 9:
                        result = _context11.sent;
                        return _context11.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 11:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    }));

    return function (_x31, _x32, _x33) {
        return _ref11.apply(this, arguments);
    };
}();

employee['update'] = function () {
    var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        _context12.next = 2;
                        return sanityInput(req.body.values, inputRule.employee, true);

                    case 2:
                        sanitizedInputValue = _context12.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context12.next = 5;
                            break;
                        }

                        return _context12.abrupt('return', res.json(miscFunc.formatRc(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;

                        delete convertedResult._id;

                        _context12.next = 10;
                        return employeeDbOperation.update(id, convertedResult);

                    case 10:
                        result = _context12.sent;
                        return _context12.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 12:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this);
    }));

    return function (_x34, _x35, _x36) {
        return _ref12.apply(this, arguments);
    };
}();

employee['readAll'] = function () {
    var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        _context13.next = 2;
                        return employeeDbOperation.readAll();

                    case 2:
                        result = _context13.sent;
                        return _context13.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 4:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee13, this);
    }));

    return function (_x37, _x38, _x39) {
        return _ref13.apply(this, arguments);
    };
}();

employee['readName'] = function () {
    var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14(req, res, next) {
        var recorder, constructedValue, validateResult;
        return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        recorder = void 0;

                        if (!req.params.name) {
                            _context14.next = 13;
                            break;
                        }

                        // console.log(`name is ${req.params.name}`)
                        constructedValue = { name: { value: req.params.name } };
                        _context14.next = 5;
                        return miscFunc.validate.checkSearchValue(constructedValue, inputRule.employee);

                    case 5:
                        validateResult = _context14.sent;

                        if (!(validateResult['name']['rc'] > 0)) {
                            _context14.next = 8;
                            break;
                        }

                        return _context14.abrupt('return', res.json(validateResult['name']));

                    case 8:
                        _context14.next = 10;
                        return employeeDbOperation.readName(req.params.name);

                    case 10:
                        recorder = _context14.sent;
                        _context14.next = 16;
                        break;

                    case 13:
                        _context14.next = 15;
                        return employeeDbOperation.readName();

                    case 15:
                        recorder = _context14.sent;

                    case 16:
                        return _context14.abrupt('return', res.json(miscFunc.formatRc(recorder)));

                    case 17:
                    case 'end':
                        return _context14.stop();
                }
            }
        }, _callee14, this);
    }));

    return function (_x40, _x41, _x42) {
        return _ref14.apply(this, arguments);
    };
}();

/*********************  billType  *******************************/
var billType = {};

billType['create'] = function () {
    var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(req, res, next) {
        var sanitizedInputValue, arrayResult, result;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        _context15.next = 2;
                        return sanityInput(req.body.values, inputRule.billType, false);

                    case 2:
                        sanitizedInputValue = _context15.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context15.next = 5;
                            break;
                        }

                        return _context15.abrupt('return', res.json(miscFunc.formatRc(sanitizedInputValue)));

                    case 5:
                        //采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        /*    console.log(`before sant ${sanitizedInputValue.msg}`)
                            console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)*/

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg));
                        _context15.next = 9;
                        return billTypeDbOperation.create(arrayResult);

                    case 9:
                        result = _context15.sent;
                        return _context15.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 11:
                    case 'end':
                        return _context15.stop();
                }
            }
        }, _callee15, this);
    }));

    function create(_x43, _x44, _x45) {
        return _ref15.apply(this, arguments);
    }

    return create;
}();

billType['update'] = function () {
    var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        _context16.next = 2;
                        return sanityInput(req.body.values, inputRule.billType, true);

                    case 2:
                        sanitizedInputValue = _context16.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context16.next = 5;
                            break;
                        }

                        return _context16.abrupt('return', res.json(miscFunc.formatRc(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;

                        delete convertedResult._id;

                        _context16.next = 10;
                        return billTypeDbOperation.update(id, convertedResult);

                    case 10:
                        result = _context16.sent;
                        return _context16.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 12:
                    case 'end':
                        return _context16.stop();
                }
            }
        }, _callee16, this);
    }));

    function update(_x46, _x47, _x48) {
        return _ref16.apply(this, arguments);
    }

    return update;
}();

billType['remove'] = function () {
    var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        _context17.next = 2;
                        return sanityInput(req.body.values, inputRule.department, true);

                    case 2:
                        sanitizedInputValue = _context17.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context17.next = 5;
                            break;
                        }

                        return _context17.abrupt('return', res.json(miscFunc.formatRc(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;
                        //console.log(`id is ${id}`)

                        _context17.next = 9;
                        return billTypeDbOperation.remove(id);

                    case 9:
                        result = _context17.sent;
                        return _context17.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 11:
                    case 'end':
                        return _context17.stop();
                }
            }
        }, _callee17, this);
    }));

    return function (_x49, _x50, _x51) {
        return _ref17.apply(this, arguments);
    };
}();

billType['readAll'] = function () {
    var _ref18 = _asyncToGenerator(regeneratorRuntime.mark(function _callee18(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        _context18.next = 2;
                        return billTypeDbOperation.readAll();

                    case 2:
                        result = _context18.sent;
                        return _context18.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 4:
                    case 'end':
                        return _context18.stop();
                }
            }
        }, _callee18, this);
    }));

    return function (_x52, _x53, _x54) {
        return _ref18.apply(this, arguments);
    };
}();

billType['readName'] = function () {
    var _ref19 = _asyncToGenerator(regeneratorRuntime.mark(function _callee19(req, res, next) {
        var recorder, constructedValue, validateResult;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
            while (1) {
                switch (_context19.prev = _context19.next) {
                    case 0:
                        recorder = void 0;

                        if (!req.params.name) {
                            _context19.next = 14;
                            break;
                        }

                        console.log('name is ' + req.params.name);
                        constructedValue = { name: { value: req.params.name } };
                        _context19.next = 6;
                        return miscFunc.validate.checkSearchValue(constructedValue, inputRule.billType);

                    case 6:
                        validateResult = _context19.sent;

                        if (!(validateResult['name']['rc'] > 0)) {
                            _context19.next = 9;
                            break;
                        }

                        return _context19.abrupt('return', res.json(validateResult['name']));

                    case 9:
                        _context19.next = 11;
                        return billTypeDbOperation.readName(req.params.name);

                    case 11:
                        recorder = _context19.sent;
                        _context19.next = 17;
                        break;

                    case 14:
                        _context19.next = 16;
                        return billTypeDbOperation.readName();

                    case 16:
                        recorder = _context19.sent;

                    case 17:
                        return _context19.abrupt('return', res.json(miscFunc.formatRc(recorder)));

                    case 18:
                    case 'end':
                        return _context19.stop();
                }
            }
        }, _callee19, this);
    }));

    return function (_x55, _x56, _x57) {
        return _ref19.apply(this, arguments);
    };
}();

/*********************  bill  ******************************
 * 部门
 * */
var bill = {};
bill['create'] = function () {
    var _ref20 = _asyncToGenerator(regeneratorRuntime.mark(function _callee20(req, res, next) {
        var sanitizedInputValue, arrayResult, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, doc, fkResult, result;

        return regeneratorRuntime.wrap(function _callee20$(_context20) {
            while (1) {
                switch (_context20.prev = _context20.next) {
                    case 0:
                        _context20.next = 2;
                        return sanityInput(req.body.values, inputRule.bill, false);

                    case 2:
                        sanitizedInputValue = _context20.sent;

                        console.log('1st san ' + JSON.stringify(sanitizedInputValue));

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context20.next = 6;
                            break;
                        }

                        return _context20.abrupt('return', res.json(miscFunc.formatRc(sanitizedInputValue)));

                    case 6:
                        //采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        //     console.log(`before sant ${sanitizedInputValue.msg}`)
                        //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg));
                        //检查外键是否存在
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context20.prev = 11;
                        _iterator2 = arrayResult[Symbol.iterator]();

                    case 13:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context20.next = 26;
                            break;
                        }

                        doc = _step2.value;
                        _context20.next = 17;
                        return departmentDbOperation.findById(doc.department);

                    case 17:
                        fkResult = _context20.sent;

                        if (!(null === fkResult.msg)) {
                            _context20.next = 20;
                            break;
                        }

                        return _context20.abrupt('return', res.json(miscFunc.formatRc(pageError.employee.departmentNotExist)));

                    case 20:
                        if (!(fkResult.msg && fkResult.msg._id)) {
                            _context20.next = 23;
                            break;
                        }

                        if (!(fkResult.msg._id.toString() !== doc.department.toString())) {
                            _context20.next = 23;
                            break;
                        }

                        return _context20.abrupt('return', res.json(pageError.employee.departmentNotExist));

                    case 23:
                        _iteratorNormalCompletion2 = true;
                        _context20.next = 13;
                        break;

                    case 26:
                        _context20.next = 32;
                        break;

                    case 28:
                        _context20.prev = 28;
                        _context20.t0 = _context20['catch'](11);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context20.t0;

                    case 32:
                        _context20.prev = 32;
                        _context20.prev = 33;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 35:
                        _context20.prev = 35;

                        if (!_didIteratorError2) {
                            _context20.next = 38;
                            break;
                        }

                        throw _iteratorError2;

                    case 38:
                        return _context20.finish(35);

                    case 39:
                        return _context20.finish(32);

                    case 40:
                        _context20.next = 42;
                        return employeeDbOperation.create(arrayResult);

                    case 42:
                        result = _context20.sent;
                        return _context20.abrupt('return', res.json(miscFunc.formatRc(result)));

                    case 44:
                    case 'end':
                        return _context20.stop();
                }
            }
        }, _callee20, this, [[11, 28, 32, 40], [33,, 35, 39]]);
    }));

    return function (_x58, _x59, _x60) {
        return _ref20.apply(this, arguments);
    };
}();

bill['remove'] = function () {
    var _ref21 = _asyncToGenerator(regeneratorRuntime.mark(function _callee21(req, res, next) {
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
            while (1) {
                switch (_context21.prev = _context21.next) {
                    case 0:
                    case 'end':
                        return _context21.stop();
                }
            }
        }, _callee21, this);
    }));

    return function (_x61, _x62, _x63) {
        return _ref21.apply(this, arguments);
    };
}();

bill['update'] = function () {
    var _ref22 = _asyncToGenerator(regeneratorRuntime.mark(function _callee22(req, res, next) {
        return regeneratorRuntime.wrap(function _callee22$(_context22) {
            while (1) {
                switch (_context22.prev = _context22.next) {
                    case 0:
                    case 'end':
                        return _context22.stop();
                }
            }
        }, _callee22, this);
    }));

    return function (_x64, _x65, _x66) {
        return _ref22.apply(this, arguments);
    };
}();

bill['readAll'] = function () {
    var _ref23 = _asyncToGenerator(regeneratorRuntime.mark(function _callee23(req, res, next) {
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
            while (1) {
                switch (_context23.prev = _context23.next) {
                    case 0:
                    case 'end':
                        return _context23.stop();
                }
            }
        }, _callee23, this);
    }));

    return function (_x67, _x68, _x69) {
        return _ref23.apply(this, arguments);
    };
}();

bill['readName'] = function () {
    var _ref24 = _asyncToGenerator(regeneratorRuntime.mark(function _callee24(req, res, next) {
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
            while (1) {
                switch (_context24.prev = _context24.next) {
                    case 0:
                    case 'end':
                        return _context24.stop();
                }
            }
        }, _callee24, this);
    }));

    return function (_x70, _x71, _x72) {
        return _ref24.apply(this, arguments);
    };
}();

module.exports = {
    common: common,
    user: user,
    department: department,
    employee: employee,
    billType: billType,
    bill: bill
};

//# sourceMappingURL=mainRouterController-compiled.js.map