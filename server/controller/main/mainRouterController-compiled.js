'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

//1. checkInterval，在main中执行，所以必须定义在非main文件，否则无法编译
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

/*
* 参数：
*       1.  inputSearch:{field:[value1,value2]}
*       2.  fkAdditionalFieldsConfig:外键的一些设置，包括此外键对应到那个coll的哪个field
*       3.  collName
*       4.  inputRules：整个个inputRules，因为可能有字段是外键字段，此时需要检查外键对应的coll/field
*
* */


var sanitySearchInput = function () {
    var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(inputSearch, fkAdditionalFieldsConfig, collName, inputRules) {
        var formatCheckResult, valueCheckResult, singleFieldName;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        _context3.next = 2;
                        return miscFunc.validateInputValue.validateInputSearchFormat(inputSearch, fkAdditionalFieldsConfig, collName, inputRules);

                    case 2:
                        formatCheckResult = _context3.sent;

                        if (!(formatCheckResult.rc > 0)) {
                            _context3.next = 5;
                            break;
                        }

                        return _context3.abrupt('return', formatCheckResult);

                    case 5:
                        _context3.next = 7;
                        return miscFunc.validateInputValue.validateInputSearch(inputSearch, fkAdditionalFieldsConfig, collName, inputRules);

                    case 7:
                        valueCheckResult = _context3.sent;
                        _context3.t0 = regeneratorRuntime.keys(valueCheckResult);

                    case 9:
                        if ((_context3.t1 = _context3.t0()).done) {
                            _context3.next = 15;
                            break;
                        }

                        singleFieldName = _context3.t1.value;

                        if (!(valueCheckResult[singleFieldName]['rc'] > 0)) {
                            _context3.next = 13;
                            break;
                        }

                        return _context3.abrupt('return', { rc: 9999, msg: valueCheckResult });

                    case 13:
                        _context3.next = 9;
                        break;

                    case 15:
                        return _context3.abrupt('return', { rc: 0 });

                    case 16:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function sanitySearchInput(_x8, _x9, _x10, _x11) {
        return _ref3.apply(this, arguments);
    };
}();

//对returnResult做包装，通过env的判断决定res.json输出的格式


//fkColl：选择哪个coll进行id验证
//currentColl+currentFkName：确定使用哪个error
var checkIdExist = function () {
    var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(fkColl, currentColl, currentFkName, id) {
        var dbOperation, result;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        dbOperation = void 0;
                        _context4.t0 = fkColl;
                        _context4.next = _context4.t0 === coll.employee ? 4 : _context4.t0 === coll.department ? 6 : _context4.t0 === coll.billType ? 8 : _context4.t0 === coll.bill ? 10 : 12;
                        break;

                    case 4:
                        dbOperation = employeeDbOperation;
                        return _context4.abrupt('break', 13);

                    case 6:
                        dbOperation = departmentDbOperation;
                        return _context4.abrupt('break', 13);

                    case 8:
                        dbOperation = billTypeDbOperation;
                        return _context4.abrupt('break', 13);

                    case 10:
                        dbOperation = billDbOperation;
                        return _context4.abrupt('break', 13);

                    case 12:
                        return _context4.abrupt('return', pageError.common.unknownColl);

                    case 13:
                        _context4.next = 15;
                        return dbOperation['findById'](id);

                    case 15:
                        result = _context4.sent;

                        if (!(null === result.msg)) {
                            _context4.next = 20;
                            break;
                        }

                        return _context4.abrupt('return', pageError[currentColl][currentFkName + 'NotExist']);

                    case 20:
                        return _context4.abrupt('return', { rc: 0 });

                    case 21:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function checkIdExist(_x12, _x13, _x14, _x15) {
        return _ref4.apply(this, arguments);
    };
}();

//从coll中，根据id查找到记录，然后返回其中的fields
//和checkIdExist使用同样的函数，目的是为了能让代码更加清晰
/*
* fkFieldName：需要获得冗余字段的外键名，主要为了产生 错误信息
* fkid：ObjectId
* fkColl：fk对应的coll
* fkAdditionalFields：需要哪些fk的冗余字段
* */


var getAdditionalFields = function () {
    var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(fkFieldName, fkId, fkColl, fkAdditionalFields) {
        var dbOperation, result;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        dbOperation = void 0;
                        _context5.t0 = fkColl;
                        _context5.next = _context5.t0 === coll.employee ? 4 : _context5.t0 === coll.department ? 6 : _context5.t0 === coll.billType ? 8 : _context5.t0 === coll.bill ? 10 : 12;
                        break;

                    case 4:
                        dbOperation = employeeDbOperation;
                        return _context5.abrupt('break', 13);

                    case 6:
                        dbOperation = departmentDbOperation;
                        return _context5.abrupt('break', 13);

                    case 8:
                        dbOperation = billTypeDbOperation;
                        return _context5.abrupt('break', 13);

                    case 10:
                        dbOperation = billDbOperation;
                        return _context5.abrupt('break', 13);

                    case 12:
                        return _context5.abrupt('return', pageError.common.unknownColl);

                    case 13:
                        _context5.next = 15;
                        return dbOperation['findById'](fkId, fkAdditionalFields);

                    case 15:
                        result = _context5.sent;

                        if (!(null === result.msg)) {
                            _context5.next = 20;
                            break;
                        }

                        return _context5.abrupt('return', pageError[fkColl][fkFieldName + 'NotExist']);

                    case 20:
                        return _context5.abrupt('return', { rc: 0, msg: result.msg });

                    case 21:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function getAdditionalFields(_x16, _x17, _x18, _x19) {
        return _ref5.apply(this, arguments);
    };
}();

//
//
/*
* 说明：根据外键，设置对应的冗余字段
* 输入参数：
* 1.singleDoc：当前要操作的doc（create或者update，从client输入的数据）
* 2. fkFieldsName：要添加冗余字段的外键名。数组（可能有多个fk）
* 3. fkColl：外键所在的coll（外键链接到的coll）
* 4. fkAdditionalConfig: 外键冗余字段的设置（已coll为单位进行设置，可能有多个fk），包括relatedColl(当前fk对应的coll)，nestedPrefix（外键冗余字段一般放在一个nested结构中，此结构的名称），forSelect：需要返回并设置的冗余字段（用在mongoose的查询中），forSetValue（在arrayResult中设置的字段名）
*
* 无返回值
* */


var getFkAdditionalFields = function () {
    var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(doc, fkAdditionalConfig) {
        var fkFieldName, nestedPrefix, fkAdditionalFields, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, field;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        _context6.t0 = regeneratorRuntime.keys(fkAdditionalConfig);

                    case 1:
                        if ((_context6.t1 = _context6.t0()).done) {
                            _context6.next = 33;
                            break;
                        }

                        fkFieldName = _context6.t1.value;

                        if (!doc[fkFieldName]) {
                            _context6.next = 31;
                            break;
                        }

                        //console.log(`configed fk  is ${doc[fkFieldName]}`)
                        //console.log(`fk related coll is ${fkAdditionalConfig[fkFieldName]['relatedColl']}`)
                        nestedPrefix = fkAdditionalConfig[fkFieldName].nestedPrefix;
                        _context6.next = 7;
                        return getAdditionalFields(fkFieldName, doc[fkFieldName], fkAdditionalConfig[fkFieldName]['relatedColl'], fkAdditionalConfig[fkFieldName].forSelect);

                    case 7:
                        fkAdditionalFields = _context6.sent;

                        console.log('get fk doc ' + JSON.stringify(fkAdditionalFields));

                        if (!(fkAdditionalFields.rc > 0)) {
                            _context6.next = 11;
                            break;
                        }

                        return _context6.abrupt('return', fkAdditionalFields);

                    case 11:
                        // console.log(`add result is ${JSON.stringify(fkAdditionalFields)}`)
                        doc[nestedPrefix] = {};
                        //将读取到的额外字段赋值给
                        _iteratorNormalCompletion = true;
                        _didIteratorError = false;
                        _iteratorError = undefined;
                        _context6.prev = 15;
                        for (_iterator = fkAdditionalConfig[fkFieldName].forSetValue[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            field = _step.value;

                            // console.log(`add field is ${field}`)
                            //需要转换成parentBillTypeFields.name的格式，因为是nested
                            // let tmpField='parentBillTypeFields.'+field
                            doc[nestedPrefix][field] = fkAdditionalFields['msg'][field];
                        }
                        _context6.next = 23;
                        break;

                    case 19:
                        _context6.prev = 19;
                        _context6.t2 = _context6['catch'](15);
                        _didIteratorError = true;
                        _iteratorError = _context6.t2;

                    case 23:
                        _context6.prev = 23;
                        _context6.prev = 24;

                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }

                    case 26:
                        _context6.prev = 26;

                        if (!_didIteratorError) {
                            _context6.next = 29;
                            break;
                        }

                        throw _iteratorError;

                    case 29:
                        return _context6.finish(26);

                    case 30:
                        return _context6.finish(23);

                    case 31:
                        _context6.next = 1;
                        break;

                    case 33:
                        return _context6.abrupt('return', { rc: 0 });

                    case 34:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[15, 19, 23, 31], [24,, 26, 30]]);
    }));

    return function getFkAdditionalFields(_x20, _x21) {
        return _ref6.apply(this, arguments);
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
//var fkAdditionalFields=require('../../model/mongo/not_used_fkAdditionalFieldsModel')

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
};

//每个外键需要的冗余字段
var fkAdditionalFieldsConfig = {
    billType: {
        //冗余字段（nested）的名称：具体冗余那几个字段
        //parentBillType:此字段为外键，需要冗余字段
        //relatedColl：外键对应的coll
        //nestedPrefix： 冗余字段一般放在nested结构中
        //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
        parentBillType: { relatedColl: coll.billType, nestedPrefix: 'parentBillTypeFields', forSelect: 'name', forSetValue: ['name'] }
    }
};function returnResult(rc) {
    if (envEnum.production === appSetting.env) {
        return miscFunc.formatRc(rc);
    } else {
        return rc;
    }
}var debug = {};
debug['removeAll'] = function () {
    var _ref7 = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(req, res, next) {
        var billRemoveResult, employeeRemoveResult, billTypeRemoveResult, departmentRemoveResult;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.next = 2;
                        return billDbOperation.removeAll();

                    case 2:
                        billRemoveResult = _context7.sent;

                        if (!(billRemoveResult.rc > 0)) {
                            _context7.next = 5;
                            break;
                        }

                        return _context7.abrupt('return', res.json(returnResult(billRemoveResult)));

                    case 5:
                        _context7.next = 7;
                        return employeeDbOperation.removeAll();

                    case 7:
                        employeeRemoveResult = _context7.sent;

                        if (!(employeeRemoveResult.rc > 0)) {
                            _context7.next = 10;
                            break;
                        }

                        return _context7.abrupt('return', res.json(returnResult(employeeRemoveResult)));

                    case 10:
                        _context7.next = 12;
                        return billTypeDbOperation.removeAll();

                    case 12:
                        billTypeRemoveResult = _context7.sent;

                        if (!(billTypeRemoveResult.rc > 0)) {
                            _context7.next = 15;
                            break;
                        }

                        return _context7.abrupt('return', res.json(returnResult(billTypeRemoveResult)));

                    case 15:
                        _context7.next = 17;
                        return departmentDbOperation.removeAll();

                    case 17:
                        departmentRemoveResult = _context7.sent;

                        if (!(departmentRemoveResult.rc > 0)) {
                            _context7.next = 20;
                            break;
                        }

                        return _context7.abrupt('return', res.json(returnResult(departmentRemoveResult)));

                    case 20:
                        return _context7.abrupt('return', res.json({ rc: 0 }));

                    case 21:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    function removeAll(_x22, _x23, _x24) {
        return _ref7.apply(this, arguments);
    }

    return removeAll;
}();

/*********************  user  ******************************
 * 操作的用户：只有创建和更新（密码）的操作，并且是在程序内部执行，而非client发起req
 * */
var user = {};
user['create'] = function () {
    var _ref8 = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(req, res, next) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    return function (_x25, _x26, _x27) {
        return _ref8.apply(this, arguments);
    };
}();

user['update'] = function () {
    var _ref9 = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(req, res, next) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));

    return function (_x28, _x29, _x30) {
        return _ref9.apply(this, arguments);
    };
}();

/*********************  department  ******************************
 * 部门
 * */
var department = {};
department['create'] = function () {
    var _ref10 = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(req, res, next) {
        var sanitizedInputValue, arrayResult, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, doc, _result, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _doc, result, populateResult;

        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return sanityInput(req.body.values, inputRule.department, false, maxFieldNum.department);

                    case 2:
                        sanitizedInputValue = _context10.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context10.next = 5;
                            break;
                        }

                        return _context10.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:
                        //2. 数据加入数组采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        //     console.log(`before sant ${sanitizedInputValue.msg}`)
                        //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values));

                        //3 检查外键是否存在
                        _iteratorNormalCompletion2 = true;
                        _didIteratorError2 = false;
                        _iteratorError2 = undefined;
                        _context10.prev = 10;
                        _iterator2 = arrayResult[Symbol.iterator]();

                    case 12:
                        if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context10.next = 23;
                            break;
                        }

                        doc = _step2.value;

                        if (!doc.parentDepartment) {
                            _context10.next = 20;
                            break;
                        }

                        _context10.next = 17;
                        return checkIdExist(coll.department, coll.department, 'parentDepartment', doc.parentDepartment);

                    case 17:
                        _result = _context10.sent;

                        if (!(0 < _result.rc)) {
                            _context10.next = 20;
                            break;
                        }

                        return _context10.abrupt('return', res.json(returnResult(_result)));

                    case 20:
                        _iteratorNormalCompletion2 = true;
                        _context10.next = 12;
                        break;

                    case 23:
                        _context10.next = 29;
                        break;

                    case 25:
                        _context10.prev = 25;
                        _context10.t0 = _context10['catch'](10);
                        _didIteratorError2 = true;
                        _iteratorError2 = _context10.t0;

                    case 29:
                        _context10.prev = 29;
                        _context10.prev = 30;

                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }

                    case 32:
                        _context10.prev = 32;

                        if (!_didIteratorError2) {
                            _context10.next = 35;
                            break;
                        }

                        throw _iteratorError2;

                    case 35:
                        return _context10.finish(32);

                    case 36:
                        return _context10.finish(29);

                    case 37:
                        //4 删除null的字段（null说明字段为空，所以无需传入db
                        _iteratorNormalCompletion3 = true;
                        _didIteratorError3 = false;
                        _iteratorError3 = undefined;
                        _context10.prev = 40;
                        for (_iterator3 = arrayResult[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                            _doc = _step3.value;

                            miscFunc.constructCreateCriteria(_doc);
                        }
                        //5. 对db执行操作
                        _context10.next = 48;
                        break;

                    case 44:
                        _context10.prev = 44;
                        _context10.t1 = _context10['catch'](40);
                        _didIteratorError3 = true;
                        _iteratorError3 = _context10.t1;

                    case 48:
                        _context10.prev = 48;
                        _context10.prev = 49;

                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }

                    case 51:
                        _context10.prev = 51;

                        if (!_didIteratorError3) {
                            _context10.next = 54;
                            break;
                        }

                        throw _iteratorError3;

                    case 54:
                        return _context10.finish(51);

                    case 55:
                        return _context10.finish(48);

                    case 56:
                        _context10.next = 58;
                        return departmentDbOperation.create(arrayResult);

                    case 58:
                        result = _context10.sent;

                        if (!(result.rc > 0)) {
                            _context10.next = 61;
                            break;
                        }

                        return _context10.abrupt('return', res.json(result));

                    case 61:
                        _context10.next = 63;
                        return miscFunc.populateSingleDoc(result.msg[0], populateOpt.department, populatedFields.department);

                    case 63:
                        populateResult = _context10.sent;
                        return _context10.abrupt('return', res.json(returnResult(populateResult)));

                    case 65:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this, [[10, 25, 29, 37], [30,, 32, 36], [40, 44, 48, 56], [49,, 51, 55]]);
    }));

    return function (_x31, _x32, _x33) {
        return _ref10.apply(this, arguments);
    };
}();

department['remove'] = function () {
    var _ref11 = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee11$(_context11) {
            while (1) {
                switch (_context11.prev = _context11.next) {
                    case 0:
                        _context11.next = 2;
                        return sanityInput(req.body.values, inputRule.department, true, maxFieldNum.department);

                    case 2:
                        sanitizedInputValue = _context11.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context11.next = 5;
                            break;
                        }

                        return _context11.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;
                        //console.log(`id is ${id}`)

                        _context11.next = 9;
                        return departmentDbOperation.remove(id);

                    case 9:
                        result = _context11.sent;
                        return _context11.abrupt('return', res.json(returnResult(result)));

                    case 11:
                    case 'end':
                        return _context11.stop();
                }
            }
        }, _callee11, this);
    }));

    return function (_x34, _x35, _x36) {
        return _ref11.apply(this, arguments);
    };
}();

department['update'] = function () {
    var _ref12 = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(req, res, next) {
        var sanitizedInputValue, convertedResult, id, _result2, result, populateResult;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
            while (1) {
                switch (_context12.prev = _context12.next) {
                    case 0:
                        _context12.next = 2;
                        return sanityInput(req.body.values, inputRule.department, true, maxFieldNum.department);

                    case 2:
                        sanitizedInputValue = _context12.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context12.next = 5;
                            break;
                        }

                        return _context12.abrupt('return', res.json(returnResult(sanitizedInputValue)));

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
                            _context12.next = 11;
                            break;
                        }

                        return _context12.abrupt('return', res.json(returnResult(pageError.department.parentCantBeSelf)));

                    case 11:
                        if (!(null !== convertedResult.parentDepartment && undefined !== convertedResult.parentDepartment)) {
                            _context12.next = 17;
                            break;
                        }

                        _context12.next = 14;
                        return checkIdExist(coll.department, coll.department, 'parentDepartment', convertedResult.parentDepartment);

                    case 14:
                        _result2 = _context12.sent;

                        if (!(0 < _result2.rc)) {
                            _context12.next = 17;
                            break;
                        }

                        return _context12.abrupt('return', res.json(returnResult(_result2)));

                    case 17:
                        _context12.next = 19;
                        return departmentDbOperation.update(id, convertedResult);

                    case 19:
                        result = _context12.sent;

                        if (!(result.rc > 0)) {
                            _context12.next = 22;
                            break;
                        }

                        return _context12.abrupt('return', res.json(returnResult(result)));

                    case 22:
                        if (!(null === result.msg)) {
                            _context12.next = 24;
                            break;
                        }

                        return _context12.abrupt('return', res.json(returnResult(pageError.department.departmentNotExists)));

                    case 24:
                        _context12.next = 26;
                        return miscFunc.populateSingleDoc(result.msg, populateOpt.department, populatedFields.department);

                    case 26:
                        populateResult = _context12.sent;
                        return _context12.abrupt('return', res.json(returnResult(populateResult)));

                    case 28:
                    case 'end':
                        return _context12.stop();
                }
            }
        }, _callee12, this);
    }));

    return function (_x37, _x38, _x39) {
        return _ref12.apply(this, arguments);
    };
}();

department['readAll'] = function () {
    var _ref13 = _asyncToGenerator(regeneratorRuntime.mark(function _callee13(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee13$(_context13) {
            while (1) {
                switch (_context13.prev = _context13.next) {
                    case 0:
                        _context13.next = 2;
                        return departmentDbOperation.readAll(populateOpt.department);

                    case 2:
                        result = _context13.sent;
                        return _context13.abrupt('return', res.json(returnResult(result)));

                    case 4:
                    case 'end':
                        return _context13.stop();
                }
            }
        }, _callee13, this);
    }));

    return function (_x40, _x41, _x42) {
        return _ref13.apply(this, arguments);
    };
}();

department['readName'] = function () {
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
                        // console.log(`constructedValue is ${JSON.stringify(constructedValue)}`)

                        _context14.next = 5;
                        return miscFunc.validateInputValue.checkSearchValue(constructedValue, inputRule.department);

                    case 5:
                        validateResult = _context14.sent;

                        if (!(validateResult['name']['rc'] > 0)) {
                            _context14.next = 8;
                            break;
                        }

                        return _context14.abrupt('return', res.json(validateResult['name']));

                    case 8:
                        _context14.next = 10;
                        return departmentDbOperation.readName(constructedValue);

                    case 10:
                        recorder = _context14.sent;
                        _context14.next = 16;
                        break;

                    case 13:
                        _context14.next = 15;
                        return departmentDbOperation.readName();

                    case 15:
                        recorder = _context14.sent;

                    case 16:
                        return _context14.abrupt('return', res.json(returnResult(recorder)));

                    case 17:
                    case 'end':
                        return _context14.stop();
                }
            }
        }, _callee14, this);
    }));

    return function (_x43, _x44, _x45) {
        return _ref14.apply(this, arguments);
    };
}();

/*********************  employee  ******************************
 * 员工
 * */
var employee = {};
employee['create'] = function () {
    var _ref15 = _asyncToGenerator(regeneratorRuntime.mark(function _callee15(req, res, next) {
        var sanitizedInputValue, arrayResult, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, doc, _result3, _result4, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _doc2, result, populateResult;

        return regeneratorRuntime.wrap(function _callee15$(_context15) {
            while (1) {
                switch (_context15.prev = _context15.next) {
                    case 0:
                        _context15.next = 2;
                        return sanityInput(req.body.values, inputRule.employee, false, maxFieldNum.employee);

                    case 2:
                        sanitizedInputValue = _context15.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context15.next = 5;
                            break;
                        }

                        return _context15.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 数据加入数组，采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        //     console.log(`before sant ${sanitizedInputValue.msg}`)
                        //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values));
                        //3 检查外键是否存在
                        _iteratorNormalCompletion4 = true;
                        _didIteratorError4 = false;
                        _iteratorError4 = undefined;
                        _context15.prev = 10;
                        _iterator4 = arrayResult[Symbol.iterator]();

                    case 12:
                        if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                            _context15.next = 29;
                            break;
                        }

                        doc = _step4.value;

                        if (!doc.department) {
                            _context15.next = 20;
                            break;
                        }

                        _context15.next = 17;
                        return checkIdExist(coll.department, coll.employee, 'department', doc.department);

                    case 17:
                        _result3 = _context15.sent;

                        if (!(0 < _result3.rc)) {
                            _context15.next = 20;
                            break;
                        }

                        return _context15.abrupt('return', res.json(returnResult(_result3)));

                    case 20:
                        if (!doc.leader) {
                            _context15.next = 26;
                            break;
                        }

                        _context15.next = 23;
                        return checkIdExist(coll.employee, coll.employee, 'leader', doc.leader);

                    case 23:
                        _result4 = _context15.sent;

                        if (!(0 < _result4.rc)) {
                            _context15.next = 26;
                            break;
                        }

                        return _context15.abrupt('return', res.json(returnResult(_result4)));

                    case 26:
                        _iteratorNormalCompletion4 = true;
                        _context15.next = 12;
                        break;

                    case 29:
                        _context15.next = 35;
                        break;

                    case 31:
                        _context15.prev = 31;
                        _context15.t0 = _context15['catch'](10);
                        _didIteratorError4 = true;
                        _iteratorError4 = _context15.t0;

                    case 35:
                        _context15.prev = 35;
                        _context15.prev = 36;

                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }

                    case 38:
                        _context15.prev = 38;

                        if (!_didIteratorError4) {
                            _context15.next = 41;
                            break;
                        }

                        throw _iteratorError4;

                    case 41:
                        return _context15.finish(38);

                    case 42:
                        return _context15.finish(35);

                    case 43:
                        //4 删除null的字段（null说明字段为空，所以无需传入db
                        _iteratorNormalCompletion5 = true;
                        _didIteratorError5 = false;
                        _iteratorError5 = undefined;
                        _context15.prev = 46;
                        for (_iterator5 = arrayResult[Symbol.iterator](); !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                            _doc2 = _step5.value;

                            miscFunc.constructCreateCriteria(_doc2);
                        }
                        //5. 对db执行操作
                        _context15.next = 54;
                        break;

                    case 50:
                        _context15.prev = 50;
                        _context15.t1 = _context15['catch'](46);
                        _didIteratorError5 = true;
                        _iteratorError5 = _context15.t1;

                    case 54:
                        _context15.prev = 54;
                        _context15.prev = 55;

                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }

                    case 57:
                        _context15.prev = 57;

                        if (!_didIteratorError5) {
                            _context15.next = 60;
                            break;
                        }

                        throw _iteratorError5;

                    case 60:
                        return _context15.finish(57);

                    case 61:
                        return _context15.finish(54);

                    case 62:
                        _context15.next = 64;
                        return employeeDbOperation.create(arrayResult);

                    case 64:
                        result = _context15.sent;

                        if (!(result.rc > 0)) {
                            _context15.next = 67;
                            break;
                        }

                        return _context15.abrupt('return', res.json(result));

                    case 67:
                        _context15.next = 69;
                        return miscFunc.populateSingleDoc(result.msg[0], populateOpt.employee, populatedFields.employee);

                    case 69:
                        populateResult = _context15.sent;
                        return _context15.abrupt('return', res.json(returnResult(populateResult)));

                    case 71:
                    case 'end':
                        return _context15.stop();
                }
            }
        }, _callee15, this, [[10, 31, 35, 43], [36,, 38, 42], [46, 50, 54, 62], [55,, 57, 61]]);
    }));

    return function (_x46, _x47, _x48) {
        return _ref15.apply(this, arguments);
    };
}();

employee['remove'] = function () {
    var _ref16 = _asyncToGenerator(regeneratorRuntime.mark(function _callee16(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee16$(_context16) {
            while (1) {
                switch (_context16.prev = _context16.next) {
                    case 0:
                        _context16.next = 2;
                        return sanityInput(req.body.values, inputRule.employee, true, maxFieldNum.employee);

                    case 2:
                        sanitizedInputValue = _context16.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context16.next = 5;
                            break;
                        }

                        return _context16.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;
                        // console.log(`id is ${id}`)

                        _context16.next = 9;
                        return employeeDbOperation.remove(id);

                    case 9:
                        result = _context16.sent;
                        return _context16.abrupt('return', res.json(returnResult(result)));

                    case 11:
                    case 'end':
                        return _context16.stop();
                }
            }
        }, _callee16, this);
    }));

    return function (_x49, _x50, _x51) {
        return _ref16.apply(this, arguments);
    };
}();

employee['update'] = function () {
    var _ref17 = _asyncToGenerator(regeneratorRuntime.mark(function _callee17(req, res, next) {
        var sanitizedInputValue, convertedResult, id, _result5, _result6, result, populateResult;

        return regeneratorRuntime.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        _context17.next = 2;
                        return sanityInput(req.body.values, inputRule.employee, true, maxFieldNum.employee);

                    case 2:
                        sanitizedInputValue = _context17.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context17.next = 5;
                            break;
                        }

                        return _context17.abrupt('return', res.json(returnResult(sanitizedInputValue)));

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
                            _context17.next = 11;
                            break;
                        }

                        return _context17.abrupt('return', res.json(returnResult(pageError.employee.leaderCantBeSelf)));

                    case 11:
                        if (!(null !== convertedResult.department && undefined !== convertedResult.department)) {
                            _context17.next = 17;
                            break;
                        }

                        _context17.next = 14;
                        return checkIdExist(coll.department, coll.employee, 'department', convertedResult.department);

                    case 14:
                        _result5 = _context17.sent;

                        if (!(_result5.rc > 0)) {
                            _context17.next = 17;
                            break;
                        }

                        return _context17.abrupt('return', res.json(returnResult(_result5)));

                    case 17:
                        if (!(null !== convertedResult.leader && undefined !== convertedResult.leader)) {
                            _context17.next = 23;
                            break;
                        }

                        _context17.next = 20;
                        return checkIdExist(coll.employee, coll.employee, 'leader', convertedResult.leader);

                    case 20:
                        _result6 = _context17.sent;

                        if (!(0 < _result6.rc)) {
                            _context17.next = 23;
                            break;
                        }

                        return _context17.abrupt('return', res.json(returnResult(_result6)));

                    case 23:
                        _context17.next = 25;
                        return employeeDbOperation.update(id, convertedResult);

                    case 25:
                        result = _context17.sent;

                        if (!(result.rc > 0)) {
                            _context17.next = 28;
                            break;
                        }

                        return _context17.abrupt('return', res.json(returnResult(result)));

                    case 28:
                        if (!(null === result.msg)) {
                            _context17.next = 30;
                            break;
                        }

                        return _context17.abrupt('return', res.json(returnResult(pageError.employee.employeeNotExists)));

                    case 30:
                        _context17.next = 32;
                        return miscFunc.populateSingleDoc(result.msg, populateOpt.employee, populatedFields.employee);

                    case 32:
                        populateResult = _context17.sent;
                        return _context17.abrupt('return', res.json(returnResult(populateResult)));

                    case 34:
                    case 'end':
                        return _context17.stop();
                }
            }
        }, _callee17, this);
    }));

    return function (_x52, _x53, _x54) {
        return _ref17.apply(this, arguments);
    };
}();

employee['readAll'] = function () {
    var _ref18 = _asyncToGenerator(regeneratorRuntime.mark(function _callee18(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee18$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        _context18.next = 2;
                        return employeeDbOperation.readAll(populateOpt.employee);

                    case 2:
                        result = _context18.sent;
                        return _context18.abrupt('return', res.json(returnResult(result)));

                    case 4:
                    case 'end':
                        return _context18.stop();
                }
            }
        }, _callee18, this);
    }));

    return function (_x55, _x56, _x57) {
        return _ref18.apply(this, arguments);
    };
}();

employee['readName'] = function () {
    var _ref19 = _asyncToGenerator(regeneratorRuntime.mark(function _callee19(req, res, next) {
        var recorder, constructedValue, validateResult;
        return regeneratorRuntime.wrap(function _callee19$(_context19) {
            while (1) {
                switch (_context19.prev = _context19.next) {
                    case 0:
                        recorder = void 0;

                        if (!req.params.name) {
                            _context19.next = 13;
                            break;
                        }

                        // console.log(`name is ${req.params.name}`)
                        constructedValue = { name: { value: req.params.name } };
                        _context19.next = 5;
                        return miscFunc.validateInputValue.checkSearchValue(constructedValue, inputRule.employee);

                    case 5:
                        validateResult = _context19.sent;

                        if (!(validateResult['name']['rc'] > 0)) {
                            _context19.next = 8;
                            break;
                        }

                        return _context19.abrupt('return', res.json(validateResult['name']));

                    case 8:
                        _context19.next = 10;
                        return employeeDbOperation.readName(req.params.name);

                    case 10:
                        recorder = _context19.sent;
                        _context19.next = 16;
                        break;

                    case 13:
                        _context19.next = 15;
                        return employeeDbOperation.readName();

                    case 15:
                        recorder = _context19.sent;

                    case 16:
                        return _context19.abrupt('return', res.json(returnResult(recorder)));

                    case 17:
                    case 'end':
                        return _context19.stop();
                }
            }
        }, _callee19, this);
    }));

    return function (_x58, _x59, _x60) {
        return _ref19.apply(this, arguments);
    };
}();

/*********************  billType  *******************************/
var billType = {};

billType['create'] = function () {
    var _ref20 = _asyncToGenerator(regeneratorRuntime.mark(function _callee20(req, res, next) {
        var sanitizedInputValue, arrayResult, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _doc3, _result7, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, _doc4, idx, doc, getFkResult, result, populateResult;

        return regeneratorRuntime.wrap(function _callee20$(_context20) {
            while (1) {
                switch (_context20.prev = _context20.next) {
                    case 0:
                        _context20.next = 2;
                        return sanityInput(req.body.values, inputRule.billType, false, maxFieldNum.billType);

                    case 2:
                        sanitizedInputValue = _context20.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context20.next = 5;
                            break;
                        }

                        return _context20.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:
                        //2. 数据加入数组，采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        /*    console.log(`before sant ${sanitizedInputValue.msg}`)
                            console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)*/

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values));
                        //3 检查外键是否存在
                        _iteratorNormalCompletion6 = true;
                        _didIteratorError6 = false;
                        _iteratorError6 = undefined;
                        _context20.prev = 10;
                        _iterator6 = arrayResult[Symbol.iterator]();

                    case 12:
                        if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                            _context20.next = 23;
                            break;
                        }

                        _doc3 = _step6.value;

                        if (!_doc3.parentBillType) {
                            _context20.next = 20;
                            break;
                        }

                        _context20.next = 17;
                        return checkIdExist(coll.billType, coll.billType, 'parentBillType', _doc3.parentBillType);

                    case 17:
                        _result7 = _context20.sent;

                        if (!(0 < _result7.rc)) {
                            _context20.next = 20;
                            break;
                        }

                        return _context20.abrupt('return', res.json(returnResult(_result7)));

                    case 20:
                        _iteratorNormalCompletion6 = true;
                        _context20.next = 12;
                        break;

                    case 23:
                        _context20.next = 29;
                        break;

                    case 25:
                        _context20.prev = 25;
                        _context20.t0 = _context20['catch'](10);
                        _didIteratorError6 = true;
                        _iteratorError6 = _context20.t0;

                    case 29:
                        _context20.prev = 29;
                        _context20.prev = 30;

                        if (!_iteratorNormalCompletion6 && _iterator6.return) {
                            _iterator6.return();
                        }

                    case 32:
                        _context20.prev = 32;

                        if (!_didIteratorError6) {
                            _context20.next = 35;
                            break;
                        }

                        throw _iteratorError6;

                    case 35:
                        return _context20.finish(32);

                    case 36:
                        return _context20.finish(29);

                    case 37:
                        //4 删除null的字段（null说明字段为空，所以无需传入db
                        _iteratorNormalCompletion7 = true;
                        _didIteratorError7 = false;
                        _iteratorError7 = undefined;
                        _context20.prev = 40;
                        for (_iterator7 = arrayResult[Symbol.iterator](); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                            _doc4 = _step7.value;

                            miscFunc.constructCreateCriteria(_doc4);
                        }

                        // console.log(`arr`)
                        //4.5 如果外键存在，获得外键的额外字段
                        // console.log(`config is ${JSON.stringify(fkAdditionalFieldsConfig.billType)}`)
                        _context20.next = 48;
                        break;

                    case 44:
                        _context20.prev = 44;
                        _context20.t1 = _context20['catch'](40);
                        _didIteratorError7 = true;
                        _iteratorError7 = _context20.t1;

                    case 48:
                        _context20.prev = 48;
                        _context20.prev = 49;

                        if (!_iteratorNormalCompletion7 && _iterator7.return) {
                            _iterator7.return();
                        }

                    case 51:
                        _context20.prev = 51;

                        if (!_didIteratorError7) {
                            _context20.next = 54;
                            break;
                        }

                        throw _iteratorError7;

                    case 54:
                        return _context20.finish(51);

                    case 55:
                        return _context20.finish(48);

                    case 56:
                        _context20.t2 = regeneratorRuntime.keys(arrayResult);

                    case 57:
                        if ((_context20.t3 = _context20.t2()).done) {
                            _context20.next = 67;
                            break;
                        }

                        idx = _context20.t3.value;

                        // console.log(`idx is ${idx}`)
                        doc = arrayResult[idx];
                        _context20.next = 62;
                        return getFkAdditionalFields(doc, fkAdditionalFieldsConfig.billType);

                    case 62:
                        getFkResult = _context20.sent;

                        if (!(getFkResult.rc > 0)) {
                            _context20.next = 65;
                            break;
                        }

                        return _context20.abrupt('return', res.json(getFkResult));

                    case 65:
                        _context20.next = 57;
                        break;

                    case 67:
                        _context20.next = 69;
                        return billTypeDbOperation.create(arrayResult);

                    case 69:
                        result = _context20.sent;

                        if (!(result.rc > 0)) {
                            _context20.next = 72;
                            break;
                        }

                        return _context20.abrupt('return', res.json(result));

                    case 72:
                        _context20.next = 74;
                        return miscFunc.populateSingleDoc(result.msg[0], populateOpt.billType, populatedFields.billType);

                    case 74:
                        populateResult = _context20.sent;
                        return _context20.abrupt('return', res.json(returnResult(populateResult)));

                    case 76:
                    case 'end':
                        return _context20.stop();
                }
            }
        }, _callee20, this, [[10, 25, 29, 37], [30,, 32, 36], [40, 44, 48, 56], [49,, 51, 55]]);
    }));

    return function (_x61, _x62, _x63) {
        return _ref20.apply(this, arguments);
    };
}();

billType['update'] = function () {
    var _ref21 = _asyncToGenerator(regeneratorRuntime.mark(function _callee21(req, res, next) {
        var sanitizedInputValue, convertedResult, id, getFkResult, _result8, result, populateResult;

        return regeneratorRuntime.wrap(function _callee21$(_context21) {
            while (1) {
                switch (_context21.prev = _context21.next) {
                    case 0:
                        _context21.next = 2;
                        return sanityInput(req.body.values, inputRule.billType, true, maxFieldNum.billType);

                    case 2:
                        sanitizedInputValue = _context21.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context21.next = 5;
                            break;
                        }

                        return _context21.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;

                        delete convertedResult._id;
                        //4 上级不能设成自己

                        if (!(id === convertedResult.parentBillType)) {
                            _context21.next = 10;
                            break;
                        }

                        return _context21.abrupt('return', res.json(returnResult(pageError.billType.parentCantBeSelf)));

                    case 10:
                        _context21.next = 12;
                        return getFkAdditionalFields(convertedResult, fkAdditionalFieldsConfig.billType);

                    case 12:
                        getFkResult = _context21.sent;

                        if (!(getFkResult.rc > 0)) {
                            _context21.next = 15;
                            break;
                        }

                        return _context21.abrupt('return', res.json(getFkResult));

                    case 15:
                        //console.log(`after get ${JSON.stringify(convertedResult)}`)

                        //5 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
                        miscFunc.constructUpdateCriteria(convertedResult);
                        // console.log(`after check null field ${JSON.stringify(convertedResult)}`)
                        //6 检查外键是否存在

                        if (!(null !== convertedResult.parentBillType && undefined !== convertedResult.parentBillType)) {
                            _context21.next = 22;
                            break;
                        }

                        _context21.next = 19;
                        return checkIdExist(coll.billType, coll.billType, 'parentBillType', convertedResult.parentBillType);

                    case 19:
                        _result8 = _context21.sent;

                        if (!(0 < _result8.rc)) {
                            _context21.next = 22;
                            break;
                        }

                        return _context21.abrupt('return', res.json(returnResult(_result8)));

                    case 22:
                        _context21.next = 24;
                        return billTypeDbOperation.update(id, convertedResult);

                    case 24:
                        result = _context21.sent;

                        if (!(result.rc > 0)) {
                            _context21.next = 27;
                            break;
                        }

                        return _context21.abrupt('return', res.json(returnResult(result)));

                    case 27:
                        //null说明没有执行任何更新
                        console.log('billtype update is ' + JSON.stringify(result));

                        if (!(null === result.msg)) {
                            _context21.next = 30;
                            break;
                        }

                        return _context21.abrupt('return', res.json(returnResult(pageError.billType.billTypeNotExists)));

                    case 30:
                        _context21.next = 32;
                        return miscFunc.populateSingleDoc(result.msg, populateOpt.billType, populatedFields.billType);

                    case 32:
                        populateResult = _context21.sent;
                        return _context21.abrupt('return', res.json(returnResult(populateResult)));

                    case 34:
                    case 'end':
                        return _context21.stop();
                }
            }
        }, _callee21, this);
    }));

    return function (_x64, _x65, _x66) {
        return _ref21.apply(this, arguments);
    };
}();

billType['remove'] = function () {
    var _ref22 = _asyncToGenerator(regeneratorRuntime.mark(function _callee22(req, res, next) {
        var inputResult, sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee22$(_context22) {
            while (1) {
                switch (_context22.prev = _context22.next) {
                    case 0:
                        //对于delete，需要将参数转换成{field:{value:'val'}}
                        inputResult = {};

                        inputResult['_id'] = { value: req.params.id };
                        //1 检查输入的参数，并作转换（如果是字符串）
                        _context22.next = 4;
                        return sanityInput(inputResult, inputRule.billType, true, maxFieldNum.billType);

                    case 4:
                        sanitizedInputValue = _context22.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context22.next = 7;
                            break;
                        }

                        return _context22.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 7:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(inputResult);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3 提取数据

                        id = convertedResult._id;

                        delete convertedResult._id;
                        // console.log(`id is ${id}`)
                        _context22.next = 12;
                        return billTypeDbOperation.remove(id);

                    case 12:
                        result = _context22.sent;
                        return _context22.abrupt('return', res.json(returnResult(result)));

                    case 14:
                    case 'end':
                        return _context22.stop();
                }
            }
        }, _callee22, this);
    }));

    return function (_x67, _x68, _x69) {
        return _ref22.apply(this, arguments);
    };
}();

billType['readAll'] = function () {
    var _ref23 = _asyncToGenerator(regeneratorRuntime.mark(function _callee23(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee23$(_context23) {
            while (1) {
                switch (_context23.prev = _context23.next) {
                    case 0:
                        _context23.next = 2;
                        return billTypeDbOperation.readAll(populateOpt.billType);

                    case 2:
                        result = _context23.sent;
                        return _context23.abrupt('return', res.json(returnResult(result)));

                    case 4:
                    case 'end':
                        return _context23.stop();
                }
            }
        }, _callee23, this);
    }));

    return function (_x70, _x71, _x72) {
        return _ref23.apply(this, arguments);
    };
}();

billType['readName'] = function () {
    var _ref24 = _asyncToGenerator(regeneratorRuntime.mark(function _callee24(req, res, next) {
        var recorder, constructedValue, validateResult;
        return regeneratorRuntime.wrap(function _callee24$(_context24) {
            while (1) {
                switch (_context24.prev = _context24.next) {
                    case 0:
                        recorder = void 0;

                        if (!req.params.name) {
                            _context24.next = 13;
                            break;
                        }

                        // console.log(`name is ${req.params.name}`)
                        constructedValue = { name: { value: req.params.name } };
                        _context24.next = 5;
                        return miscFunc.validateInputValue.checkSearchValue(constructedValue, inputRule.billType);

                    case 5:
                        validateResult = _context24.sent;

                        if (!(validateResult['name']['rc'] > 0)) {
                            _context24.next = 8;
                            break;
                        }

                        return _context24.abrupt('return', res.json(validateResult['name']));

                    case 8:
                        _context24.next = 10;
                        return billTypeDbOperation.readName(req.params.name);

                    case 10:
                        recorder = _context24.sent;
                        _context24.next = 16;
                        break;

                    case 13:
                        _context24.next = 15;
                        return billTypeDbOperation.readName();

                    case 15:
                        recorder = _context24.sent;

                    case 16:
                        return _context24.abrupt('return', res.json(returnResult(recorder)));

                    case 17:
                    case 'end':
                        return _context24.stop();
                }
            }
        }, _callee24, this);
    }));

    return function (_x73, _x74, _x75) {
        return _ref24.apply(this, arguments);
    };
}();

billType['search'] = function () {
    var _ref25 = _asyncToGenerator(regeneratorRuntime.mark(function _callee25(req, res, next) {
        var sanitizedInputValue;
        return regeneratorRuntime.wrap(function _callee25$(_context25) {
            while (1) {
                switch (_context25.prev = _context25.next) {
                    case 0:
                        //let recorder
                        console.log('search input is ' + JSON.stringify(req.body.values));
                        _context25.next = 3;
                        return sanitySearchInput(req.body.values, fkAdditionalFieldsConfig.billType, coll.billType, inputRule);

                    case 3:
                        sanitizedInputValue = _context25.sent;

                        console.log('santiy result is ' + sanitizedInputValue);

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context25.next = 7;
                            break;
                        }

                        return _context25.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 7:
                    case 'end':
                        return _context25.stop();
                }
            }
        }, _callee25, this);
    }));

    return function (_x76, _x77, _x78) {
        return _ref25.apply(this, arguments);
    };
}();

/*********************  bill  ******************************
 * 部门
 * */
var bill = {};
bill['create'] = function () {
    var _ref26 = _asyncToGenerator(regeneratorRuntime.mark(function _callee26(req, res, next) {
        var sanitizedInputValue, arrayResult, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, doc, _ref27, _ref28, fkReimburserResult, fkBillTypeResult, _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, _doc5, result, populateResult;

        return regeneratorRuntime.wrap(function _callee26$(_context26) {
            while (1) {
                switch (_context26.prev = _context26.next) {
                    case 0:
                        _context26.next = 2;
                        return sanityInput(req.body.values, inputRule.bill, false, maxFieldNum.bill);

                    case 2:
                        sanitizedInputValue = _context26.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context26.next = 5;
                            break;
                        }

                        return _context26.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:
                        //2 采用insertMany，所有输入必须是数组
                        arrayResult = [];
                        //从{name:{value:'11'}}====>{name:'11'}
                        //     console.log(`before sant ${sanitizedInputValue.msg}`)
                        //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)

                        arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values));
                        //3 检查外键是否存在
                        _iteratorNormalCompletion8 = true;
                        _didIteratorError8 = false;
                        _iteratorError8 = undefined;
                        _context26.prev = 10;
                        _iterator8 = arrayResult[Symbol.iterator]();

                    case 12:
                        if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                            _context26.next = 27;
                            break;
                        }

                        doc = _step8.value;
                        _context26.next = 16;
                        return Promise.all([checkIdExist(coll.employee, coll.bill, 'reimburser', doc.reimburser), checkIdExist(coll.billType, coll.bill, 'billType', doc.billType)]);

                    case 16:
                        _ref27 = _context26.sent;
                        _ref28 = _slicedToArray(_ref27, 2);
                        fkReimburserResult = _ref28[0];
                        fkBillTypeResult = _ref28[1];
                        //console.log(`fkReimburserResult result is ${JSON.stringify(fkReimburserResult)}`)
                        //        console.log(`fkBillTypeResult result is ${JSON.stringify(fkBillTypeResult)}`)

                        if (!(fkReimburserResult.rc > 0)) {
                            _context26.next = 22;
                            break;
                        }

                        return _context26.abrupt('return', res.json(returnResult(fkReimburserResult)));

                    case 22:
                        if (!(fkBillTypeResult.rc > 0)) {
                            _context26.next = 24;
                            break;
                        }

                        return _context26.abrupt('return', res.json(returnResult(fkBillTypeResult)));

                    case 24:
                        _iteratorNormalCompletion8 = true;
                        _context26.next = 12;
                        break;

                    case 27:
                        _context26.next = 33;
                        break;

                    case 29:
                        _context26.prev = 29;
                        _context26.t0 = _context26['catch'](10);
                        _didIteratorError8 = true;
                        _iteratorError8 = _context26.t0;

                    case 33:
                        _context26.prev = 33;
                        _context26.prev = 34;

                        if (!_iteratorNormalCompletion8 && _iterator8.return) {
                            _iterator8.return();
                        }

                    case 36:
                        _context26.prev = 36;

                        if (!_didIteratorError8) {
                            _context26.next = 39;
                            break;
                        }

                        throw _iteratorError8;

                    case 39:
                        return _context26.finish(36);

                    case 40:
                        return _context26.finish(33);

                    case 41:

                        //4 删除null的字段（null说明字段为空，所以无需传入db
                        _iteratorNormalCompletion9 = true;
                        _didIteratorError9 = false;
                        _iteratorError9 = undefined;
                        _context26.prev = 44;
                        for (_iterator9 = arrayResult[Symbol.iterator](); !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            _doc5 = _step9.value;

                            miscFunc.constructCreateCriteria(_doc5);
                        }
                        //5. 对db执行操作
                        _context26.next = 52;
                        break;

                    case 48:
                        _context26.prev = 48;
                        _context26.t1 = _context26['catch'](44);
                        _didIteratorError9 = true;
                        _iteratorError9 = _context26.t1;

                    case 52:
                        _context26.prev = 52;
                        _context26.prev = 53;

                        if (!_iteratorNormalCompletion9 && _iterator9.return) {
                            _iterator9.return();
                        }

                    case 55:
                        _context26.prev = 55;

                        if (!_didIteratorError9) {
                            _context26.next = 58;
                            break;
                        }

                        throw _iteratorError9;

                    case 58:
                        return _context26.finish(55);

                    case 59:
                        return _context26.finish(52);

                    case 60:
                        _context26.next = 62;
                        return billDbOperation.create(arrayResult);

                    case 62:
                        result = _context26.sent;

                        if (!(result.rc > 0)) {
                            _context26.next = 65;
                            break;
                        }

                        return _context26.abrupt('return', res.json(result));

                    case 65:
                        _context26.next = 67;
                        return miscFunc.populateSingleDoc(result.msg[0], populateOpt.bill, populatedFields.bill);

                    case 67:
                        populateResult = _context26.sent;
                        return _context26.abrupt('return', res.json(returnResult(populateResult)));

                    case 69:
                    case 'end':
                        return _context26.stop();
                }
            }
        }, _callee26, this, [[10, 29, 33, 41], [34,, 36, 40], [44, 48, 52, 60], [53,, 55, 59]]);
    }));

    return function (_x79, _x80, _x81) {
        return _ref26.apply(this, arguments);
    };
}();

bill['remove'] = function () {
    var _ref29 = _asyncToGenerator(regeneratorRuntime.mark(function _callee27(req, res, next) {
        var sanitizedInputValue, convertedResult, id, result;
        return regeneratorRuntime.wrap(function _callee27$(_context27) {
            while (1) {
                switch (_context27.prev = _context27.next) {
                    case 0:
                        _context27.next = 2;
                        return sanityInput(req.body.values, inputRule.bill, true, maxFieldNum.bill);

                    case 2:
                        sanitizedInputValue = _context27.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context27.next = 5;
                            break;
                        }

                        return _context27.abrupt('return', res.json(returnResult(sanitizedInputValue)));

                    case 5:

                        //2. 将client输入转换成server端的格式
                        convertedResult = miscFunc.convertClientValueToServerFormat(req.body.values);
                        //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
                        //3， 提取数据并执行操作

                        id = convertedResult._id;
                        //console.log(`id is ${id}`)

                        _context27.next = 9;
                        return billDbOperation.remove(id);

                    case 9:
                        result = _context27.sent;
                        return _context27.abrupt('return', res.json(returnResult(result)));

                    case 11:
                    case 'end':
                        return _context27.stop();
                }
            }
        }, _callee27, this);
    }));

    return function (_x82, _x83, _x84) {
        return _ref29.apply(this, arguments);
    };
}();

bill['update'] = function () {
    var _ref30 = _asyncToGenerator(regeneratorRuntime.mark(function _callee28(req, res, next) {
        var sanitizedInputValue, convertedResult, id, fkBillTypeResult, fkReimburserResult, result, populateResult;
        return regeneratorRuntime.wrap(function _callee28$(_context28) {
            while (1) {
                switch (_context28.prev = _context28.next) {
                    case 0:
                        _context28.next = 2;
                        return sanityInput(req.body.values, inputRule.bill, true, maxFieldNum.bill);

                    case 2:
                        sanitizedInputValue = _context28.sent;

                        if (!(sanitizedInputValue.rc > 0)) {
                            _context28.next = 5;
                            break;
                        }

                        return _context28.abrupt('return', res.json(returnResult(sanitizedInputValue)));

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
                            _context28.next = 15;
                            break;
                        }

                        _context28.next = 12;
                        return checkIdExist(coll.billType, coll.bill, 'billType', convertedResult.billType);

                    case 12:
                        fkBillTypeResult = _context28.sent;

                        if (!(fkBillTypeResult.rc > 0)) {
                            _context28.next = 15;
                            break;
                        }

                        return _context28.abrupt('return', res.json(returnResult(fkBillTypeResult)));

                    case 15:
                        if (!(null !== convertedResult.reimburser && undefined !== convertedResult.reimburser)) {
                            _context28.next = 21;
                            break;
                        }

                        _context28.next = 18;
                        return checkIdExist(coll.employee, coll.bill, 'reimburser', convertedResult.reimburser);

                    case 18:
                        fkReimburserResult = _context28.sent;

                        if (!(fkReimburserResult.rc > 0)) {
                            _context28.next = 21;
                            break;
                        }

                        return _context28.abrupt('return', res.json(returnResult(fkReimburserResult)));

                    case 21:
                        _context28.next = 23;
                        return billDbOperation.update(id, convertedResult);

                    case 23:
                        result = _context28.sent;

                        if (!(result.rc > 0)) {
                            _context28.next = 26;
                            break;
                        }

                        return _context28.abrupt('return', res.json(returnResult(result)));

                    case 26:
                        if (!(null === result.msg)) {
                            _context28.next = 28;
                            break;
                        }

                        return _context28.abrupt('return', res.json(returnResult(pageError.bill.billNotExist)));

                    case 28:
                        _context28.next = 30;
                        return miscFunc.populateSingleDoc(result.msg, populateOpt.bill, populatedFields.bill);

                    case 30:
                        populateResult = _context28.sent;
                        return _context28.abrupt('return', res.json(returnResult(populateResult)));

                    case 32:
                    case 'end':
                        return _context28.stop();
                }
            }
        }, _callee28, this);
    }));

    return function (_x85, _x86, _x87) {
        return _ref30.apply(this, arguments);
    };
}();

bill['readAll'] = function () {
    var _ref31 = _asyncToGenerator(regeneratorRuntime.mark(function _callee29(req, res, next) {
        var result;
        return regeneratorRuntime.wrap(function _callee29$(_context29) {
            while (1) {
                switch (_context29.prev = _context29.next) {
                    case 0:
                        _context29.next = 2;
                        return billDbOperation.readAll(populateOpt.bill);

                    case 2:
                        result = _context29.sent;
                        return _context29.abrupt('return', res.json(returnResult(result)));

                    case 4:
                    case 'end':
                        return _context29.stop();
                }
            }
        }, _callee29, this);
    }));

    return function (_x88, _x89, _x90) {
        return _ref31.apply(this, arguments);
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