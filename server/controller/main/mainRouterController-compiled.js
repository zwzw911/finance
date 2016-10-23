'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

//对create/update方法输入的value进行检查和转换（字符串的话）
//create:false     update:true


var sanityInput = function () {
    var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(originalInputValue, inputRule, basedOnInputValue, maxFieldNum) {
        var dataValidateResult, dataFormatResult, valueKeyResult, duplicateResult, checkResult, singleField;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return miscFunc.validateInputValue.checkInputDataValidate(originalInputValue);

                    case 2:
                        dataValidateResult = _context2.sent;

                        if (!(dataValidateResult.rc > 0)) {
                            _context2.next = 5;
                            break;
                        }

                        return _context2.abrupt('return', dataValidateResult);

                    case 5:
                        _context2.next = 7;
                        return miscFunc.validateInputValue.checkInputDataFormat(originalInputValue);

                    case 7:
                        dataFormatResult = _context2.sent;

                        if (!(dataFormatResult.rc > 0)) {
                            _context2.next = 10;
                            break;
                        }

                        return _context2.abrupt('return', dataFormatResult);

                    case 10:
                        //3 检查字段数量
                        valueKeyResult = miscFunc.validateInputValue.checkInputValueKey(originalInputValue, maxFieldNum);
                        // console.log(`key num result is ${JSON.stringify(valueKeyResult)}`)

                        if (!(valueKeyResult.rc > 0)) {
                            _context2.next = 13;
                            break;
                        }

                        return _context2.abrupt('return', valueKeyResult);

                    case 13:
                        //4 检查是否有重复字段
                        duplicateResult = miscFunc.validateInputValue.checkInputValueDuplicateKey(originalInputValue);
                        // console.log(`dup check result is ${duplicateResult}`)

                        if (!(duplicateResult.rc > 0)) {
                            _context2.next = 16;
                            break;
                        }

                        return _context2.abrupt('return', duplicateResult);

                    case 16:
                        _context2.next = 18;
                        return miscFunc.validateInputValue.checkInput(originalInputValue, inputRule, basedOnInputValue);

                    case 18:
                        checkResult = _context2.sent;
                        _context2.t0 = regeneratorRuntime.keys(checkResult);

                    case 20:
                        if ((_context2.t1 = _context2.t0()).done) {
                            _context2.next = 26;
                            break;
                        }

                        singleField = _context2.t1.value;

                        if (!(checkResult[singleField].rc > 0)) {
                            _context2.next = 24;
                            break;
                        }

                        return _context2.abrupt('return', { rc: 99999, msg: checkResult });

                    case 24:
                        _context2.next = 20;
                        break;

                    case 26:
                        return _context2.abrupt('return', { rc: 0 });

                    case 27:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function sanityInput(_x4, _x5, _x6, _x7) {
        return _ref2.apply(this, arguments);
    };
}();

//对returnResult做包装，通过env的判断决定res.json输出的格式


//fkColl：选择哪个coll进行id验证
//currentColl+currentFkName：确定使用哪个error
var checkIdExist = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(fkColl, currentColl, currentFkName, id) {
        var dbOperation, result;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        dbOperation = void 0;
                        _context3.t0 = fkColl;
                        _context3.next = _context3.t0 === coll.employee ? 4 : _context3.t0 === coll.department ? 6 : _context3.t0 === coll.billType ? 8 : _context3.t0 === coll.bill ? 10 : 12;
                        break;

                    case 4:
                        dbOperation = employeeDbOperation;
                        return _context3.abrupt('break', 13);

                    case 6:
                        dbOperation = departmentDbOperation;
                        return _context3.abrupt('break', 13);

                    case 8:
                        dbOperation = billTypeDbOperation;
                        return _context3.abrupt('break', 13);

                    case 10:
                        dbOperation = billDbOperation;
                        return _context3.abrupt('break', 13);

                    case 12:
                        return _context3.abrupt('return', pageError.common.unknownColl);

                    case 13:
                        _context3.next = 15;
                        return dbOperation['findById'](id);

                    case 15:
                        result = _context3.sent;

                        console.log('findByID result is ' + JSON.stringify(result));

                        if (!(null === result.msg)) {
                            _context3.next = 21;
                            break;
                        }

                        return _context3.abrupt('return', pageError[currentColl][currentFkName + 'NotExist']);

                    case 21:
                        return _context3.abrupt('return', { rc: 0 });

                    case 22:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function checkIdExist(_x8, _x9, _x10, _x11) {
        return _ref3.apply(this, arguments);
    };
}();
/*                      debug                               */


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Created by wzhan039 on 2016-09-30.
 * 因为expressjs的router只能支持callback，所有将所有的router处理都单独通过一个async函数处理，然后直接返回promise给router调用，
 *
 */
var appSetting = require('../../config/global/appSetting');

var inputRule = require('../../define/validateRule/inputRule').inputRule;
var miscFunc = require('../../assist/misc-compiled').func;
// var validate=miscFunc.validate
var checkInterval = miscFunc.checkInterval;

/*                      error               */
var pageError = require('../../define/error/pageError');

/*                      model               */
var departmentDbOperation = require('../../model/mongo/departmentModel');
var employeeDbOperation = require('../../model/mongo/employeeModel');
var billTypeDbOperation = require('../../model/mongo/billTypeModel');
var billDbOperation = require('../../model/mongo/billModel');

/*                      regex               */
var coll = require('../../define/enum/node').node.coll;
/*                      enum                */
var nodeEnum = require('../../define/enum/node').node;
var envEnum = nodeEnum.env;

/*                      app special param           */
var maxFieldNum = {
    department: 3, //_id/name/parentDepartment
    employee: 7,
    billType: 3,
    bill: 7
};
var populatedFields = {
    department: ['parentDepartment'],
    billType: ['parentBillType'],
    employee: ['leader', 'department'],
    bill: ['reimburser', 'billType', '']
};
var populateOpt = {
    department: {
        path: 'parentDepartment', //需要populate的字段
        select: 'name', //populate后，需要显示的字段
        match: {}, //populate后，过滤字段(不符合这显示null)。一般不用
        options: {} },
    billType: {
        path: 'parentBillType', //需要populate的字段
        select: 'name', //populate后，需要显示的字段
        match: {}, //populate后，过滤字段(不符合这显示null)。一般不用
        options: {} },
    employee: {
        path: 'leader department', //需要populate的字段
        select: 'name', //populate后，需要显示的字段
        match: {}, //populate后，过滤字段(不符合这显示null)。一般不用
        options: {} },
    bill: {
        path: 'billType  reimburser', //需要populate的字段
        select: 'name', //populate后，需要显示的字段
        match: {}, //populate后，过滤字段(不符合这显示null)。一般不用
        options: {} }
};function returnResult(rc) {
    if (envEnum.production === appSetting.env) {
        return miscFunc.formatRc(rc);
    } else {
        return rc;
    }
}var debug = {};
debug['removeAll'] = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res, next) {
        var billRemoveResult, employeeRemoveResult, billTypeRemoveResult, departmentRemoveResult;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return billDbOperation.removeAll();

                    case 2:
                        billRemoveResult = _context4.sent;

                        if (!(billRemoveResult.rc > 0)) {
                            _context4.next = 5;
                            break;
                        }

                        return _context4.abrupt('return', res.json(returnResult(billRemoveResult)));

                    case 5:
                        _context4.next = 7;
                        return employeeDbOperation.removeAll();

                    case 7:
                        employeeRemoveResult = _context4.sent;

                        if (!(employeeRemoveResult.rc > 0)) {
                            _context4.next = 10;
                            break;
                        }

                        return _context4.abrupt('return', res.json(returnResult(employeeRemoveResult)));

                    case 10:
                        _context4.next = 12;
                        return billTypeDbOperation.removeAll();

                    case 12:
                        billTypeRemoveResult = _context4.sent;

                        if (!(billTypeRemoveResult.rc > 0)) {
                            _context4.next = 15;
                            break;
                        }

                        return _context4.abrupt('return', res.json(returnResult(billTypeRemoveResult)));

                    case 15:
                        _context4.next = 17;
                        return departmentDbOperation.removeAll();

                    case 17:
                        departmentRemoveResult = _context4.sent;

                        if (!(departmentRemoveResult.rc > 0)) {
                            _context4.next = 20;
                            break;
                        }

                        return _context4.abrupt('return', res.json(returnResult(departmentRemoveResult)));

                    case 20:
                        return _context4.abrupt('return', res.json({ rc: 0 }));

                    case 21:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    function removeAll(_x12, _x13, _x14) {
        return _ref4.apply(this, arguments);
    }

    return removeAll;
}();

/*********************  user  ******************************
 * 操作的用户：只有创建和更新（密码）的操作，并且是在程序内部执行，而非client发起req
 * */
var user = {};
user['create'] = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res, next) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function (_x15, _x16, _x17) {
        return _ref5.apply(this, arguments);
    };
}();

user['update'] = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(req, res, next) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    return function (_x18, _x19, _x20) {
        return _ref6.apply(this, arguments);
    };
}();

/*********************  department  ******************************
 * 部门
 * */
var department = {};
department['create'] = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(req, res, next) {
        var sanitizedInputValue, arrayResult, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, doc, _result, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _doc, result, populateResult;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.next = 2;
                        return sanityInput(req.body.values, inputRule.department, false, maxFieldNum.department);

                    case 2:
                        sanitizedInputValue = _context7.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context7.next = 5;
                            break;
                        }

                        return _context7.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:
                        //2. 数据加入数组采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        //     console.log(`before sant ${sanitizedInputValue.msg}`)
                        //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values));

                        //3 检查外键是否存在
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context7.prev = 10;
                        _iterator = arrayResult[Symbol.iterator]();

                    case 12:
                        if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                            _context7.next = 23;
                            break;
                        }

                        doc = _step.value;

                        if (!doc.parentDepartment) {
                            _context7.next = 20;
                            break;
                        }

                        _context7.next = 17;
                        return checkIdExist(coll.department, coll.department, 'parentDepartment', doc.parentDepartment);

                    case 17:
                        _result = _context7.sent;

                        if (!(0 < _result.rc)) {
                            _context7.next = 20;
                            break;
                        }

                        return _context7.abrupt('return', res.json(returnResult(_result)));

                    case 20:
                        _iteratorNormalCompletion = true;
                        _context7.next = 12;
                        break;

                    case 23:
                        _context7.next = 29;
                        break;

                    case 25:
                        _context7.prev = 25;
                        _context7.t0 = _context7['catch'](10);
                        _didIteratorError = true;
                        _iteratorError = _context7.t0;

                    case 29:
                        _context7.prev = 29;
                        _context7.prev = 30;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 32:
                        _context7.prev = 32;

                        if (!_didIteratorError) {
                            _context7.next = 35;
                            break;
                        }

                        throw _iteratorError;

                    case 35:
                        return _context7.finish(32);

                    case 36:
                        return _context7.finish(29);

                    case 37:
                        //4 删除null的字段（null说明字段为空，所以无需传入db
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context7.prev = 40;
                        for (_iterator2 = arrayResult[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            _doc = _step2.value;

                            miscFunc.constructCreateCriteria(_doc);
                        }
                        //5. 对db执行操作
                        _context7.next = 48;
                        break;

                    case 44:
                        _context7.prev = 44;
                        _context7.t1 = _context7['catch'](40);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context7.t1;

                    case 48:
                        _context7.prev = 48;
                        _context7.prev = 49;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 51:
                        _context7.prev = 51;

                        if (!_didIteratorError2) {
                            _context7.next = 54;
                            break;
                        }

                        throw _iteratorError2;

                    case 54:
                        return _context7.finish(51);

                    case 55:
                        return _context7.finish(48);

                    case 56:
                        _context7.next = 58;
                        return departmentDbOperation.create(arrayResult);

                    case 58:
                        result = _context7.sent;

                        if (!(result.rc > 0)) {
                            _context7.next = 61;
                            break;
                        }

                        return _context7.abrupt('return', res.json(result));

                    case 61:
                        _context7.next = 63;
                        return miscFunc.populateSingleDoc(result.msg[0], populateOpt.department, populatedFields.department);

                    case 63:
                        populateResult = _context7.sent;
                        return _context7.abrupt('return', res.json(returnResult(populateResult)));

                    case 65:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this, [[10, 25, 29, 37], [30,, 32, 36], [40, 44, 48, 56], [49,, 51, 55]]);
    }));

    return function (_x21, _x22, _x23) {
        return _ref7.apply(this, arguments);
    };
}();

department['remove'] = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        _context8.next = 2;
                        return sanityInput(req.body.values, inputRule.department, true, maxFieldNum.department);

                    case 2:
                        sanitizedInputValue = _context8.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context8.next = 5;
                            break;
                        }

                        return _context8.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;
                        //console.log(`id is ${id}`)

                        _context8.next = 9;
                        return departmentDbOperation.remove(id);

                    case 9:
                        result = _context8.sent;
                        return _context8.abrupt('return', res.json(returnResult(result)));

                    case 11:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    return function (_x24, _x25, _x26) {
        return _ref8.apply(this, arguments);
    };
}();

department['update'] = function () {
    var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(req, res, next) {
        var sanitizedInputValue, convertedResult, id, _result2, result, populateResult;

        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        _context9.next = 2;
                        return sanityInput(req.body.values, inputRule.department, true, maxFieldNum.department);

                    case 2:
                        sanitizedInputValue = _context9.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context9.next = 5;
                            break;
                        }

                        return _context9.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式()
                        // console.log(`before convert ${JSON.stringify(req.body.values)}`)
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        // console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;

                        delete convertedResult._id;
                        //4 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
                        miscFunc.constructUpdateCriteria(convertedResult);
                        // console.log(`construct update is ${JSON.stringify(convertedResult)}`)
                        //5 上级不能设成自己

                        if (!(id === convertedResult.parentDepartment)) {
                            _context9.next = 11;
                            break;
                        }

                        return _context9.abrupt('return', res.json(returnResult(pageError.department.parentCantBeSelf)));

                    case 11:
                        if (!(null !== convertedResult.parentDepartment && undefined !== convertedResult.parentDepartment)) {
                            _context9.next = 17;
                            break;
                        }

                        _context9.next = 14;
                        return checkIdExist(coll.department, coll.department, 'parentDepartment', convertedResult.parentDepartment);

                    case 14:
                        _result2 = _context9.sent;

                        if (!(0 < _result2.rc)) {
                            _context9.next = 17;
                            break;
                        }

                        return _context9.abrupt('return', res.json(returnResult(_result2)));

                    case 17:
                        _context9.next = 19;
                        return departmentDbOperation.update(id, convertedResult);

                    case 19:
                        result = _context9.sent;

                        if (!(result.rc > 0)) {
                            _context9.next = 22;
                            break;
                        }

                        return _context9.abrupt('return', res.json(returnResult(result)));

                    case 22:
                        if (!(null === result.msg)) {
                            _context9.next = 24;
                            break;
                        }

                        return _context9.abrupt('return', res.json(returnResult(pageError.department.departmentNotExists)));

                    case 24:
                        _context9.next = 26;
                        return miscFunc.populateSingleDoc(result.msg, populateOpt.department, populatedFields.department);

                    case 26:
                        populateResult = _context9.sent;
                        return _context9.abrupt('return', res.json(returnResult(populateResult)));

                    case 28:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));

    return function (_x27, _x28, _x29) {
        return _ref9.apply(this, arguments);
    };
}();

department['readAll'] = function () {
    var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return departmentDbOperation.readAll(populateOpt.department);

                    case 2:
                        result = _context10.sent;
                        return _context10.abrupt('return', res.json(returnResult(result)));

                    case 4:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }));

    return function (_x30, _x31, _x32) {
        return _ref10.apply(this, arguments);
    };
}();

department['readName'] = function () {
    var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(req, res, next) {
        var recorder, constructedValue, validateResult;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        recorder = void 0;

                        if (!req.params.name) {
                            _context11.next = 13;
                            break;
                        }

                        // console.log(`name is ${req.params.name}`)
                        constructedValue = { name: { value: req.params.name } };
                        // console.log(`constructedValue is ${JSON.stringify(constructedValue)}`)

                        _context11.next = 5;
                        return miscFunc.validateInputValue.checkSearchValue(constructedValue, inputRule.department);

                    case 5:
                        validateResult = _context11.sent;

                        if (!(validateResult['name']['rc'] > 0)) {
                            _context11.next = 8;
                            break;
                        }

                        return _context11.abrupt('return', res.json(validateResult['name']));

                    case 8:
                        _context11.next = 10;
                        return departmentDbOperation.readName(constructedValue);

                    case 10:
                        recorder = _context11.sent;
                        _context11.next = 16;
                        break;

                    case 13:
                        _context11.next = 15;
                        return departmentDbOperation.readName();

                    case 15:
                        recorder = _context11.sent;

                    case 16:
                        return _context11.abrupt('return', res.json(returnResult(recorder)));

                    case 17:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    }));

    return function (_x33, _x34, _x35) {
        return _ref11.apply(this, arguments);
    };
}();

/*********************  employee  ******************************
 * 员工
 * */
var employee = {};
employee['create'] = function () {
    var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(req, res, next) {
        var sanitizedInputValue, arrayResult, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, doc, _result3, _result4, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _doc2, result, populateResult;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        _context12.next = 2;
                        return sanityInput(req.body.values, inputRule.employee, false, maxFieldNum.employee);

                    case 2:
                        sanitizedInputValue = _context12.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context12.next = 5;
                            break;
                        }

                        return _context12.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 数据加入数组，采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        //     console.log(`before sant ${sanitizedInputValue.msg}`)
                        //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values));
                        //3 检查外键是否存在
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context12.prev = 10;
                        _iterator3 = arrayResult[Symbol.iterator]();

                    case 12:
                        if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                            _context12.next = 29;
                            break;
                        }

                        doc = _step3.value;

                        if (!doc.department) {
                            _context12.next = 20;
                            break;
                        }

                        _context12.next = 17;
                        return checkIdExist(coll.department, coll.employee, 'department', doc.department);

                    case 17:
                        _result3 = _context12.sent;

                        if (!(0 < _result3.rc)) {
                            _context12.next = 20;
                            break;
                        }

                        return _context12.abrupt('return', res.json(returnResult(_result3)));

                    case 20:
                        if (!doc.leader) {
                            _context12.next = 26;
                            break;
                        }

                        _context12.next = 23;
                        return checkIdExist(coll.employee, coll.employee, 'leader', doc.leader);

                    case 23:
                        _result4 = _context12.sent;

                        if (!(0 < _result4.rc)) {
                            _context12.next = 26;
                            break;
                        }

                        return _context12.abrupt('return', res.json(returnResult(_result4)));

                    case 26:
                        _iteratorNormalCompletion3 = true;
                        _context12.next = 12;
                        break;

                    case 29:
                        _context12.next = 35;
                        break;

                    case 31:
                        _context12.prev = 31;
                        _context12.t0 = _context12['catch'](10);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context12.t0;

                    case 35:
                        _context12.prev = 35;
                        _context12.prev = 36;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 38:
                        _context12.prev = 38;

                        if (!_didIteratorError3) {
                            _context12.next = 41;
                            break;
                        }

                        throw _iteratorError3;

                    case 41:
                        return _context12.finish(38);

                    case 42:
                        return _context12.finish(35);

                    case 43:
                        //4 删除null的字段（null说明字段为空，所以无需传入db
                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context12.prev = 46;
                        for (_iterator4 = arrayResult[Symbol.iterator](); !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                            _doc2 = _step4.value;

                            miscFunc.constructCreateCriteria(_doc2);
                        }
                        //5. 对db执行操作
                        _context12.next = 54;
                        break;

                    case 50:
                        _context12.prev = 50;
                        _context12.t1 = _context12['catch'](46);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context12.t1;

                    case 54:
                        _context12.prev = 54;
                        _context12.prev = 55;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }

                    case 57:
                        _context12.prev = 57;

                        if (!_didIteratorError4) {
                            _context12.next = 60;
                            break;
                        }

                        throw _iteratorError4;

                    case 60:
                        return _context12.finish(57);

                    case 61:
                        return _context12.finish(54);

                    case 62:
                        _context12.next = 64;
                        return employeeDbOperation.create(arrayResult);

                    case 64:
                        result = _context12.sent;

                        if (!(result.rc > 0)) {
                            _context12.next = 67;
                            break;
                        }

                        return _context12.abrupt('return', res.json(result));

                    case 67:
                        _context12.next = 69;
                        return miscFunc.populateSingleDoc(result.msg[0], populateOpt.employee, populatedFields.employee);

                    case 69:
                        populateResult = _context12.sent;
                        return _context12.abrupt('return', res.json(returnResult(populateResult)));

                    case 71:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this, [[10, 31, 35, 43], [36,, 38, 42], [46, 50, 54, 62], [55,, 57, 61]]);
    }));

    return function (_x36, _x37, _x38) {
        return _ref12.apply(this, arguments);
    };
}();

employee['remove'] = function () {
    var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        _context13.next = 2;
                        return sanityInput(req.body.values, inputRule.employee, true, maxFieldNum.employee);

                    case 2:
                        sanitizedInputValue = _context13.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context13.next = 5;
                            break;
                        }

                        return _context13.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;
                        // console.log(`id is ${id}`)

                        _context13.next = 9;
                        return employeeDbOperation.remove(id);

                    case 9:
                        result = _context13.sent;
                        return _context13.abrupt('return', res.json(returnResult(result)));

                    case 11:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee13, this);
    }));

    return function (_x39, _x40, _x41) {
        return _ref13.apply(this, arguments);
    };
}();

employee['update'] = function () {
    var _ref14 = _asyncToGenerator(regeneratorRuntime.mark(function _callee14(req, res, next) {
        var sanitizedInputValue, convertedResult, id, _result5, _result6, result, populateResult;

        return regeneratorRuntime.wrap(function _callee14$(_context14) {
            while (1) {
                switch (_context14.prev = _context14.next) {
                    case 0:
                        _context14.next = 2;
                        return sanityInput(req.body.values, inputRule.employee, true, maxFieldNum.employee);

                    case 2:
                        sanitizedInputValue = _context14.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context14.next = 5;
                            break;
                        }

                        return _context14.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //3 提取数据

                        id = convertedResult._id;

                        delete convertedResult._id;
                        //4 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
                        miscFunc.constructUpdateCriteria(convertedResult);
                        //5 上级不能设成自己

                        if (!(id === convertedResult.leader)) {
                            _context14.next = 11;
                            break;
                        }

                        return _context14.abrupt('return', res.json(returnResult(pageError.employee.leaderCantBeSelf)));

                    case 11:
                        if (!(null !== convertedResult.department && undefined !== convertedResult.department)) {
                            _context14.next = 17;
                            break;
                        }

                        _context14.next = 14;
                        return checkIdExist(coll.department, coll.employee, 'department', convertedResult.department);

                    case 14:
                        _result5 = _context14.sent;

                        if (!(_result5.rc > 0)) {
                            _context14.next = 17;
                            break;
                        }

                        return _context14.abrupt('return', res.json(returnResult(_result5)));

                    case 17:
                        if (!(null !== convertedResult.leader && undefined !== convertedResult.leader)) {
                            _context14.next = 23;
                            break;
                        }

                        _context14.next = 20;
                        return checkIdExist(coll.employee, coll.employee, 'leader', convertedResult.leader);

                    case 20:
                        _result6 = _context14.sent;

                        if (!(0 < _result6.rc)) {
                            _context14.next = 23;
                            break;
                        }

                        return _context14.abrupt('return', res.json(returnResult(_result6)));

                    case 23:
                        _context14.next = 25;
                        return employeeDbOperation.update(id, convertedResult);

                    case 25:
                        result = _context14.sent;

                        if (!(result.rc > 0)) {
                            _context14.next = 28;
                            break;
                        }

                        return _context14.abrupt('return', res.json(returnResult(result)));

                    case 28:
                        if (!(null === result.msg)) {
                            _context14.next = 30;
                            break;
                        }

                        return _context14.abrupt('return', res.json(returnResult(pageError.employee.employeeNotExists)));

                    case 30:
                        _context14.next = 32;
                        return miscFunc.populateSingleDoc(result.msg, populateOpt.employee, populatedFields.employee);

                    case 32:
                        populateResult = _context14.sent;
                        return _context14.abrupt('return', res.json(returnResult(populateResult)));

                    case 34:
                    case 'end':
                        return _context14.stop();
                }
            }
        }, _callee14, this);
    }));

    return function (_x42, _x43, _x44) {
        return _ref14.apply(this, arguments);
    };
}();

employee['readAll'] = function () {
    var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        _context15.next = 2;
                        return employeeDbOperation.readAll(populateOpt.employee);

                    case 2:
                        result = _context15.sent;
                        return _context15.abrupt('return', res.json(returnResult(result)));

                    case 4:
                    case 'end':
                        return _context15.stop();
                }
            }
        }, _callee15, this);
    }));

    return function (_x45, _x46, _x47) {
        return _ref15.apply(this, arguments);
    };
}();

employee['readName'] = function () {
    var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16(req, res, next) {
        var recorder, constructedValue, validateResult;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        recorder = void 0;

                        if (!req.params.name) {
                            _context16.next = 13;
                            break;
                        }

                        // console.log(`name is ${req.params.name}`)
                        constructedValue = { name: { value: req.params.name } };
                        _context16.next = 5;
                        return miscFunc.validateInputValue.checkSearchValue(constructedValue, inputRule.employee);

                    case 5:
                        validateResult = _context16.sent;

                        if (!(validateResult['name']['rc'] > 0)) {
                            _context16.next = 8;
                            break;
                        }

                        return _context16.abrupt('return', res.json(validateResult['name']));

                    case 8:
                        _context16.next = 10;
                        return employeeDbOperation.readName(req.params.name);

                    case 10:
                        recorder = _context16.sent;
                        _context16.next = 16;
                        break;

                    case 13:
                        _context16.next = 15;
                        return employeeDbOperation.readName();

                    case 15:
                        recorder = _context16.sent;

                    case 16:
                        return _context16.abrupt('return', res.json(returnResult(recorder)));

                    case 17:
                    case 'end':
                        return _context16.stop();
                }
            }
        }, _callee16, this);
    }));

    return function (_x48, _x49, _x50) {
        return _ref16.apply(this, arguments);
    };
}();

/*********************  billType  *******************************/
var billType = {};

billType['create'] = function () {
    var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17(req, res, next) {
        var sanitizedInputValue, arrayResult, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, doc, _result7, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _doc3, result, populateResult;

        return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        _context17.next = 2;
                        return sanityInput(req.body.values, inputRule.billType, false, maxFieldNum.billType);

                    case 2:
                        sanitizedInputValue = _context17.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context17.next = 5;
                            break;
                        }

                        return _context17.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:
                        //2. 数据加入数组，采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        /*    console.log(`before sant ${sanitizedInputValue.msg}`)
                            console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)*/

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values));
                        //3 检查外键是否存在
                        _iteratorNormalCompletion5 = true;
                        _didIteratorError5 = false;
                        _iteratorError5 = undefined;
                        _context17.prev = 10;
                        _iterator5 = arrayResult[Symbol.iterator]();

                    case 12:
                        if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                            _context17.next = 23;
                            break;
                        }

                        doc = _step5.value;

                        if (!doc.parentBillType) {
                            _context17.next = 20;
                            break;
                        }

                        _context17.next = 17;
                        return checkIdExist(coll.billType, coll.billType, 'parentBillType', doc.parentBillType);

                    case 17:
                        _result7 = _context17.sent;

                        if (!(0 < _result7.rc)) {
                            _context17.next = 20;
                            break;
                        }

                        return _context17.abrupt('return', res.json(returnResult(_result7)));

                    case 20:
                        _iteratorNormalCompletion5 = true;
                        _context17.next = 12;
                        break;

                    case 23:
                        _context17.next = 29;
                        break;

                    case 25:
                        _context17.prev = 25;
                        _context17.t0 = _context17['catch'](10);
                        _didIteratorError5 = true;
                        _iteratorError5 = _context17.t0;

                    case 29:
                        _context17.prev = 29;
                        _context17.prev = 30;

                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }

                    case 32:
                        _context17.prev = 32;

                        if (!_didIteratorError5) {
                            _context17.next = 35;
                            break;
                        }

                        throw _iteratorError5;

                    case 35:
                        return _context17.finish(32);

                    case 36:
                        return _context17.finish(29);

                    case 37:
                        //4 删除null的字段（null说明字段为空，所以无需传入db
                        _iteratorNormalCompletion6 = true;
                        _didIteratorError6 = false;
                        _iteratorError6 = undefined;
                        _context17.prev = 40;
                        for (_iterator6 = arrayResult[Symbol.iterator](); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                            _doc3 = _step6.value;

                            miscFunc.constructCreateCriteria(_doc3);
                        }
                        //5. 对db执行操作
                        _context17.next = 48;
                        break;

                    case 44:
                        _context17.prev = 44;
                        _context17.t1 = _context17['catch'](40);
                        _didIteratorError6 = true;
                        _iteratorError6 = _context17.t1;

                    case 48:
                        _context17.prev = 48;
                        _context17.prev = 49;

                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }

                    case 51:
                        _context17.prev = 51;

                        if (!_didIteratorError6) {
                            _context17.next = 54;
                            break;
                        }

                        throw _iteratorError6;

                    case 54:
                        return _context17.finish(51);

                    case 55:
                        return _context17.finish(48);

                    case 56:
                        _context17.next = 58;
                        return billTypeDbOperation.create(arrayResult);

                    case 58:
                        result = _context17.sent;

                        if (!(result.rc > 0)) {
                            _context17.next = 61;
                            break;
                        }

                        return _context17.abrupt('return', res.json(result));

                    case 61:
                        _context17.next = 63;
                        return miscFunc.populateSingleDoc(result.msg[0], populateOpt.billType, populatedFields.billType);

                    case 63:
                        populateResult = _context17.sent;
                        return _context17.abrupt('return', res.json(returnResult(populateResult)));

                    case 65:
                    case 'end':
                        return _context17.stop();
                }
            }
        }, _callee17, this, [[10, 25, 29, 37], [30,, 32, 36], [40, 44, 48, 56], [49,, 51, 55]]);
    }));

    return function (_x51, _x52, _x53) {
        return _ref17.apply(this, arguments);
    };
}();

billType['update'] = function () {
    var _ref18 = _asyncToGenerator(regeneratorRuntime.mark(function _callee18(req, res, next) {
        var sanitizedInputValue, convertedResult, id, _result8, result, populateResult;

        return regeneratorRuntime.wrap(function _callee18$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        _context18.next = 2;
                        return sanityInput(req.body.values, inputRule.billType, true, maxFieldNum.billType);

                    case 2:
                        sanitizedInputValue = _context18.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context18.next = 5;
                            break;
                        }

                        return _context18.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;

                        delete convertedResult._id;
                        //4 上级不能设成自己

                        if (!(id === convertedResult.parentBillType)) {
                            _context18.next = 10;
                            break;
                        }

                        return _context18.abrupt('return', res.json(returnResult(pageError.billType.parentCantBeSelf)));

                    case 10:
                        //5 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
                        miscFunc.constructUpdateCriteria(convertedResult);
                        // console.log(`after check null field ${JSON.stringify(convertedResult)}`)
                        //6 检查外键是否存在

                        if (!(null !== convertedResult.parentBillType && undefined !== convertedResult.parentBillType)) {
                            _context18.next = 17;
                            break;
                        }

                        _context18.next = 14;
                        return checkIdExist(coll.billType, coll.billType, 'parentBillType', convertedResult.parentBillType);

                    case 14:
                        _result8 = _context18.sent;

                        if (!(0 < _result8.rc)) {
                            _context18.next = 17;
                            break;
                        }

                        return _context18.abrupt('return', res.json(returnResult(_result8)));

                    case 17:
                        _context18.next = 19;
                        return billTypeDbOperation.update(id, convertedResult);

                    case 19:
                        result = _context18.sent;

                        if (!(result.rc > 0)) {
                            _context18.next = 22;
                            break;
                        }

                        return _context18.abrupt('return', res.json(returnResult(result)));

                    case 22:
                        if (!(null === result.msg)) {
                            _context18.next = 24;
                            break;
                        }

                        return _context18.abrupt('return', res.json(returnResult(pageError.billType.billTypeNotExists)));

                    case 24:
                        _context18.next = 26;
                        return miscFunc.populateSingleDoc(result.msg, populateOpt.billType, populatedFields.billType);

                    case 26:
                        populateResult = _context18.sent;
                        return _context18.abrupt('return', res.json(returnResult(populateResult)));

                    case 28:
                    case 'end':
                        return _context18.stop();
                }
            }
        }, _callee18, this);
    }));

    return function (_x54, _x55, _x56) {
        return _ref18.apply(this, arguments);
    };
}();

billType['remove'] = function () {
    var _ref19 = _asyncToGenerator(regeneratorRuntime.mark(function _callee19(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
            while (1) {
                switch (_context19.prev = _context19.next) {
                    case 0:
                        _context19.next = 2;
                        return sanityInput(req.body.values, inputRule.billType, true, maxFieldNum.billType);

                    case 2:
                        sanitizedInputValue = _context19.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context19.next = 5;
                            break;
                        }

                        return _context19.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3 提取数据

                        id = convertedResult._id;

                        delete convertedResult._id;
                        // console.log(`id is ${id}`)
                        _context19.next = 10;
                        return billTypeDbOperation.remove(id);

                    case 10:
                        result = _context19.sent;
                        return _context19.abrupt('return', res.json(returnResult(result)));

                    case 12:
                    case 'end':
                        return _context19.stop();
                }
            }
        }, _callee19, this);
    }));

    return function (_x57, _x58, _x59) {
        return _ref19.apply(this, arguments);
    };
}();

billType['readAll'] = function () {
    var _ref20 = _asyncToGenerator(regeneratorRuntime.mark(function _callee20(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee20$(_context20) {
            while (1) {
                switch (_context20.prev = _context20.next) {
                    case 0:
                        _context20.next = 2;
                        return billTypeDbOperation.readAll(populateOpt.billType);

                    case 2:
                        result = _context20.sent;
                        return _context20.abrupt('return', res.json(returnResult(result)));

                    case 4:
                    case 'end':
                        return _context20.stop();
                }
            }
        }, _callee20, this);
    }));

    return function (_x60, _x61, _x62) {
        return _ref20.apply(this, arguments);
    };
}();

billType['readName'] = function () {
    var _ref21 = _asyncToGenerator(regeneratorRuntime.mark(function _callee21(req, res, next) {
        var recorder, constructedValue, validateResult;
        return regeneratorRuntime.wrap(function _callee21$(_context21) {
            while (1) {
                switch (_context21.prev = _context21.next) {
                    case 0:
                        recorder = void 0;

                        if (!req.params.name) {
                            _context21.next = 13;
                            break;
                        }

                        // console.log(`name is ${req.params.name}`)
                        constructedValue = { name: { value: req.params.name } };
                        _context21.next = 5;
                        return miscFunc.validateInputValue.checkSearchValue(constructedValue, inputRule.billType);

                    case 5:
                        validateResult = _context21.sent;

                        if (!(validateResult['name']['rc'] > 0)) {
                            _context21.next = 8;
                            break;
                        }

                        return _context21.abrupt('return', res.json(validateResult['name']));

                    case 8:
                        _context21.next = 10;
                        return billTypeDbOperation.readName(req.params.name);

                    case 10:
                        recorder = _context21.sent;
                        _context21.next = 16;
                        break;

                    case 13:
                        _context21.next = 15;
                        return billTypeDbOperation.readName();

                    case 15:
                        recorder = _context21.sent;

                    case 16:
                        return _context21.abrupt('return', res.json(returnResult(recorder)));

                    case 17:
                    case 'end':
                        return _context21.stop();
                }
            }
        }, _callee21, this);
    }));

    return function (_x63, _x64, _x65) {
        return _ref21.apply(this, arguments);
    };
}();

/*********************  bill  ******************************
 * 部门
 * */
var bill = {};
bill['create'] = function () {
    var _ref22 = _asyncToGenerator(regeneratorRuntime.mark(function _callee22(req, res, next) {
        var sanitizedInputValue, arrayResult, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, doc, _ref23, _ref24, fkReimburserResult, fkBillTypeResult, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _doc4, result, populateResult;

        return regeneratorRuntime.wrap(function _callee22$(_context22) {
            while (1) {
                switch (_context22.prev = _context22.next) {
                    case 0:
                        _context22.next = 2;
                        return sanityInput(req.body.values, inputRule.bill, false, maxFieldNum.bill);

                    case 2:
                        sanitizedInputValue = _context22.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context22.next = 5;
                            break;
                        }

                        return _context22.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:
                        //2 采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        //     console.log(`before sant ${sanitizedInputValue.msg}`)
                        //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values));
                        //3 检查外键是否存在
                        _iteratorNormalCompletion7 = true;
                        _didIteratorError7 = false;
                        _iteratorError7 = undefined;
                        _context22.prev = 10;
                        _iterator7 = arrayResult[Symbol.iterator]();

                    case 12:
                        if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                            _context22.next = 27;
                            break;
                        }

                        doc = _step7.value;
                        _context22.next = 16;
                        return Promise.all([checkIdExist(coll.employee, coll.bill, 'reimburser', doc.reimburser), checkIdExist(coll.billType, coll.bill, 'billType', doc.billType)]);

                    case 16:
                        _ref23 = _context22.sent;
                        _ref24 = _slicedToArray(_ref23, 2);
                        fkReimburserResult = _ref24[0];
                        fkBillTypeResult = _ref24[1];
                        //console.log(`fkReimburserResult result is ${JSON.stringify(fkReimburserResult)}`)
                        //        console.log(`fkBillTypeResult result is ${JSON.stringify(fkBillTypeResult)}`)

                        if (!(fkReimburserResult.rc > 0)) {
                            _context22.next = 22;
                            break;
                        }

                        return _context22.abrupt('return', res.json(returnResult(fkReimburserResult)));

                    case 22:
                        if (!(fkBillTypeResult.rc > 0)) {
                            _context22.next = 24;
                            break;
                        }

                        return _context22.abrupt('return', res.json(returnResult(fkBillTypeResult)));

                    case 24:
                        _iteratorNormalCompletion7 = true;
                        _context22.next = 12;
                        break;

                    case 27:
                        _context22.next = 33;
                        break;

                    case 29:
                        _context22.prev = 29;
                        _context22.t0 = _context22['catch'](10);
                        _didIteratorError7 = true;
                        _iteratorError7 = _context22.t0;

                    case 33:
                        _context22.prev = 33;
                        _context22.prev = 34;

                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                            _iterator7.return();
                        }

                    case 36:
                        _context22.prev = 36;

                        if (!_didIteratorError7) {
                            _context22.next = 39;
                            break;
                        }

                        throw _iteratorError7;

                    case 39:
                        return _context22.finish(36);

                    case 40:
                        return _context22.finish(33);

                    case 41:

                        //4 删除null的字段（null说明字段为空，所以无需传入db
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _iteratorError8 = undefined;
                        _context22.prev = 44;
                        for (_iterator8 = arrayResult[Symbol.iterator](); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            _doc4 = _step8.value;

                            miscFunc.constructCreateCriteria(_doc4);
                        }
                        //5. 对db执行操作
                        _context22.next = 52;
                        break;

                    case 48:
                        _context22.prev = 48;
                        _context22.t1 = _context22['catch'](44);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context22.t1;

                    case 52:
                        _context22.prev = 52;
                        _context22.prev = 53;

                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }

                    case 55:
                        _context22.prev = 55;

                        if (!_didIteratorError8) {
                            _context22.next = 58;
                            break;
                        }

                        throw _iteratorError8;

                    case 58:
                        return _context22.finish(55);

                    case 59:
                        return _context22.finish(52);

                    case 60:
                        _context22.next = 62;
                        return billDbOperation.create(arrayResult);

                    case 62:
                        result = _context22.sent;

                        if (!(result.rc > 0)) {
                            _context22.next = 65;
                            break;
                        }

                        return _context22.abrupt('return', res.json(result));

                    case 65:
                        _context22.next = 67;
                        return miscFunc.populateSingleDoc(result.msg[0], populateOpt.bill, populatedFields.bill);

                    case 67:
                        populateResult = _context22.sent;
                        return _context22.abrupt('return', res.json(returnResult(populateResult)));

                    case 69:
                    case 'end':
                        return _context22.stop();
                }
            }
        }, _callee22, this, [[10, 29, 33, 41], [34,, 36, 40], [44, 48, 52, 60], [53,, 55, 59]]);
    }));

    return function (_x66, _x67, _x68) {
        return _ref22.apply(this, arguments);
    };
}();

bill['remove'] = function () {
    var _ref25 = _asyncToGenerator(regeneratorRuntime.mark(function _callee23(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
            while (1) {
                switch (_context23.prev = _context23.next) {
                    case 0:
                        _context23.next = 2;
                        return sanityInput(req.body.values, inputRule.bill, true, maxFieldNum.bill);

                    case 2:
                        sanitizedInputValue = _context23.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context23.next = 5;
                            break;
                        }

                        return _context23.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;
                        //console.log(`id is ${id}`)

                        _context23.next = 9;
                        return billDbOperation.remove(id);

                    case 9:
                        result = _context23.sent;
                        return _context23.abrupt('return', res.json(returnResult(result)));

                    case 11:
                    case 'end':
                        return _context23.stop();
                }
            }
        }, _callee23, this);
    }));

    return function (_x69, _x70, _x71) {
        return _ref25.apply(this, arguments);
    };
}();

bill['update'] = function () {
    var _ref26 = _asyncToGenerator(regeneratorRuntime.mark(function _callee24(req, res, next) {
        var sanitizedInputValue, convertedResult, id, fkBillTypeResult, fkReimburserResult, result, populateResult;
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
            while (1) {
                switch (_context24.prev = _context24.next) {
                    case 0:
                        _context24.next = 2;
                        return sanityInput(req.body.values, inputRule.bill, true, maxFieldNum.bill);

                    case 2:
                        sanitizedInputValue = _context24.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context24.next = 5;
                            break;
                        }

                        return _context24.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //3， 提取数据并执行操作

                        id = convertedResult._id;

                        delete convertedResult._id;
                        //4 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
                        miscFunc.constructUpdateCriteria(convertedResult);
                        //5. 检查可能的外键（billType/reimburser）

                        if (!convertedResult.billType) {
                            _context24.next = 15;
                            break;
                        }

                        _context24.next = 12;
                        return checkIdExist(coll.billType, coll.bill, 'billType', convertedResult.billType);

                    case 12:
                        fkBillTypeResult = _context24.sent;

                        if (!(fkBillTypeResult.rc > 0)) {
                            _context24.next = 15;
                            break;
                        }

                        return _context24.abrupt('return', res.json(returnResult(fkBillTypeResult)));

                    case 15:
                        if (!(null !== convertedResult.reimburser && undefined !== convertedResult.reimburser)) {
                            _context24.next = 21;
                            break;
                        }

                        _context24.next = 18;
                        return checkIdExist(coll.employee, coll.bill, 'reimburser', convertedResult.reimburser);

                    case 18:
                        fkReimburserResult = _context24.sent;

                        if (!(fkReimburserResult.rc > 0)) {
                            _context24.next = 21;
                            break;
                        }

                        return _context24.abrupt('return', res.json(returnResult(fkReimburserResult)));

                    case 21:
                        _context24.next = 23;
                        return billDbOperation.update(id, convertedResult);

                    case 23:
                        result = _context24.sent;

                        if (!(result.rc > 0)) {
                            _context24.next = 26;
                            break;
                        }

                        return _context24.abrupt('return', res.json(returnResult(result)));

                    case 26:
                        if (!(null === result.msg)) {
                            _context24.next = 28;
                            break;
                        }

                        return _context24.abrupt('return', res.json(returnResult(pageError.bill.billNotExist)));

                    case 28:
                        _context24.next = 30;
                        return miscFunc.populateSingleDoc(result.msg, populateOpt.bill, populatedFields.bill);

                    case 30:
                        populateResult = _context24.sent;
                        return _context24.abrupt('return', res.json(returnResult(populateResult)));

                    case 32:
                    case 'end':
                        return _context24.stop();
                }
            }
        }, _callee24, this);
    }));

    return function (_x72, _x73, _x74) {
        return _ref26.apply(this, arguments);
    };
}();

bill['readAll'] = function () {
    var _ref27 = _asyncToGenerator(regeneratorRuntime.mark(function _callee25(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
            while (1) {
                switch (_context25.prev = _context25.next) {
                    case 0:
                        _context25.next = 2;
                        return billDbOperation.readAll(populateOpt.bill);

                    case 2:
                        result = _context25.sent;
                        return _context25.abrupt('return', res.json(returnResult(result)));

                    case 4:
                    case 'end':
                        return _context25.stop();
                }
            }
        }, _callee25, this);
    }));

    return function (_x75, _x76, _x77) {
        return _ref27.apply(this, arguments);
    };
}();

//bill无需提供title
/*bill['readName']=async function (req,res,next){
    let recorder
    if(req.params.name){
        console.log(`name is ${req.params.name}`)
        let constructedValue={name:{value:req.params.name}}
        let validateResult=await miscFunc.validate.checkSearchValue(constructedValue,inputRule.billType)
        if(validateResult['name']['rc']>0){
            return res.json(validateResult['name'])
        }
        recorder=await billTypeDbOperation.readName(req.params.name)
    }else{
        recorder=await billTypeDbOperation.readName()
    }

    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(returnResult(recorder))
}*/

module.exports = {
    common: common,
    debug: debug,
    user: user,
    department: department,
    employee: employee,
    billType: billType,
    bill: bill
};

//# sourceMappingURL=mainRouterController-compiled.js.map