/**
 * Created by wzhan039 on 2016-08-16.
 */
/*
*   为了测试mongo相关函数，需要
*   1. 运行mongod
*
* */
'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

require("babel-polyfill");
require("babel-core/register");
var dbModel = require('../../../../server/model/mongo/common/structure');
//检测错误结果
var inputRule = require('../../../../server/define/validateRule/inputRule').inputRule;

var testAsyncMongoValidate = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(test) {
        var func, result, departmentDoc, billDoc, employeeDoc;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        test.expect(7);

                        func = void 0, result = void 0, departmentDoc = void 0, billDoc = void 0, employeeDoc = void 0;


                        func = require('../../../../server/assist/wrapAsync/db/mongo/mongoValidate').asyncMongoValidate;

                        departmentDoc = new dbModel.departmentModel();
                        //required

                        _context.next = 6;
                        return func(departmentDoc);

                    case 6:
                        result = _context.sent;

                        test.equal(result.rc, inputRule.department.name.require.mongoError.rc, 'required name check fail');

                        //minlength
                        departmentDoc.name = 'a';
                        _context.next = 11;
                        return func(departmentDoc);

                    case 11:
                        result = _context.sent;

                        test.equal(result.rc, inputRule.department.name.minLength.mongoError.rc, 'minlength name check fail');

                        //maxlength
                        departmentDoc.name = '012345678901234';
                        _context.next = 16;
                        return func(departmentDoc);

                    case 16:
                        result = _context.sent;

                        test.equal(result.rc, inputRule.department.name.maxLength.mongoError.rc, 'maxlength name check fail');

                        //objectId
                        departmentDoc.name = '0123456789';
                        departmentDoc.parentDepartment = '0123456789';
                        _context.next = 22;
                        return func(departmentDoc);

                    case 22:
                        result = _context.sent;

                        test.equal(result.rc, inputRule.department.parentDepartment.format.mongoError.rc, 'format parentDepartment check fail');

                        //min
                        billDoc = new dbModel.billModel({ amount: -1 });
                        _context.next = 27;
                        return func(billDoc);

                    case 27:
                        result = _context.sent;

                        test.equal(result.rc, inputRule.bill.amount.min.mongoError.rc, 'min bill amount check fail');

                        //max
                        billDoc = new dbModel.billModel({ amount: 100000000 });
                        _context.next = 32;
                        return func(billDoc);

                    case 32:
                        result = _context.sent;

                        test.equal(result.rc, inputRule.bill.amount.max.mongoError.rc, 'max bill amount check fail');

                        //match
                        employeeDoc = new dbModel.employeeModel({ name: 'a', department: '123456789012345678901234' });
                        _context.next = 37;
                        return func(employeeDoc);

                    case 37:
                        result = _context.sent;

                        test.equal(result.rc, inputRule.employee.name.format.mongoError.rc, 'match employee format check fail');

                        test.done();

                    case 40:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function testAsyncMongoValidate(_x) {
        return _ref.apply(this, arguments);
    };
}();

module.exports = {
    testAsyncMongoValidate: testAsyncMongoValidate
};

//# sourceMappingURL=asyncTest-compiled.js.map