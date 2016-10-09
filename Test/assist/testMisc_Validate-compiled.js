/**
 * Created by wzhan039 on 2016-07-07.
 */
'use strict';

require("babel-polyfill");
require("babel-core/register");
var testModule = require('../../server/assist/misc').func;
var miscError = require('../../server/define/error/nodeError').nodeError.assistError;
var validateError = miscError.misc.validate;
/*          for generateRandomString test       */
var regex = require('../../server/define/regex/regex').regex;
var dataType = require('../../server/define/enum/validEnum').enum.dataType;
//var randomStringTypeEnum=require('../../server/define/enum/node').node.randomStringType


//var func=testModule.validate

/***************************************************************************/
/***************     checkDataTypeBaseOnTypeDefine      *******************/
/***************************************************************************/
var checkDataTypeBaseOnTypeDefine = function checkDataTypeBaseOnTypeDefine(test) {
    var func = testModule.validate._private.checkDataTypeBaseOnTypeDefine;
    var value = void 0,
        tmpDataType = void 0,
        result = void 0,
        tmp = void 0;

    test.expect(9);

    value = 'randomString';
    tmpDataType = 'noEnumDataType';
    result = func(value, tmpDataType);
    test.equal(result.rc, validateError.unknownDataType.rc, 'unknown data type check failed');

    value = '0';
    tmpDataType = dataType.int;
    result = func(value, tmpDataType);
    test.equal(result, 0, 'data type int check failed');

    value = '1.1';
    tmpDataType = dataType.float;
    result = func(value, tmpDataType);
    test.equal(result, 1.1, 'data type float check failed');

    value = 'randomString';
    tmpDataType = dataType.string;
    result = func(value, tmpDataType);
    test.equal(result, true, 'data type string check failed');

    value = new Date('2016').getTime();
    tmpDataType = dataType.date;
    result = func(value, tmpDataType);
    test.equal(result.toLocaleString(), new Date(value).toLocaleString(), 'data type date check failed');

    value = [];
    tmpDataType = dataType.array;
    result = func(value, tmpDataType);
    test.equal(result, true, 'data type array check failed');

    value = {};
    tmpDataType = dataType.object;
    result = func(value, tmpDataType);
    test.equal(result, true, 'data type object check failed');

    value = 'C:/Windows/System32/drivers/etc/hosts';
    tmpDataType = dataType.file;
    result = func(value, tmpDataType);
    test.equal(result, true, 'data type file check failed');

    value = 'C:/Program Files';
    tmpDataType = dataType.folder;
    result = func(value, tmpDataType);
    test.equal(result, true, 'data type folder check failed');

    test.done();
};

/***************************************************************************/
/***************     checkRuleTypeBaseOnTypeDefine      *******************/
/***************************************************************************/
var checkAllMandatoryFieldsExist = function checkAllMandatoryFieldsExist(test) {
    //let a=testModule.validate._private.checkRuleBaseOnRuleDefine
    var func = testModule.validate._private.checkRuleBaseOnRuleDefine;
    var value = {
        userName: {}
    };
    var result = void 0,
        tmp = void 0;
    test.expect(6);
    /*    commentPageSize: {
                default:5,
                type:dataType.int,
                chineseName:'每页最多显示评论数',
                require:{define:true,error:{rc:60040}},
            min:{define:1,error:{rc:60041}},
            max:{define:5,error:{rc:60042}},
        },//每页显示评论的数量*/
    /*          */
    result = func(value);
    test.equal(result.rc, validateError.mandatoryFiledNotExist.rc, 'chineseName undefined check failed');

    value.userName.chineseName = '用户名';
    result = func(value);
    test.equal(result.rc, validateError.mandatoryFiledNotExist.rc, 'type undefined check failed');

    value.userName.type = dataType.array;
    //console.log(dataType.array)
    result = func(value);
    test.equal(result.rc, validateError.mandatoryFiledNotExist.rc, 'require undefined check failed');

    value.userName.require = { define: false, error: { rc: 1234, msg: '1234' } };
    //value.userName.require=
    result = func(value);
    test.equal(result.rc, 0, 'all mandatory field defined check failed');

    value.userName.chineseName = [];
    result = func(value);
    test.equal(result.rc, validateError.chineseNameNotString.rc, 'chineseName type check failed');

    value.userName.chineseName = '';
    result = func(value);
    test.equal(result.rc, validateError.chineseNameEmpty.rc, 'chineseName empty check failed');

    /*    value.userName.require.define=false
        result=func(value)
        test.equal(result.rc,validateError.errorFieldNotDefine.rc,'all Mandatory fields exists check failed');
    
        value.userName.require.error={rc:1234,msg:'1234'}
        result=func(value)
        test.equal(result.rc,0,'all Mandatory fields exists 1 check failed');*/
    /*    value.userName.type='invalid Type'
        result=func(value)
        test.equal(result.rc,validateError.unknownDataType.rc,'no type check failed');*/

    test.done();
};

var checkRelatedField = function checkRelatedField(test) {
    var func = testModule.validate._private.checkRuleBaseOnRuleDefine;
    var result = void 0;
    var value = {
        userName: {
            chineseName: '用户名',
            require: { define: false, error: { rc: 1234, msg: '1234' } }
        }
    };
    test.expect(5);

    value.userName.type = dataType.int;
    result = func(value);
    test.equal(result.rc, validateError.needMin.rc, 'related field min check failed');

    value.userName.min = {};
    result = func(value);
    test.equal(result.rc, validateError.needMax.rc, 'related field max check failed');

    value.userName.max = {};
    value.userName.min = undefined;
    result = func(value);
    test.equal(result.rc, validateError.needMin.rc, 'related field min1 check failed');

    value.userName.type = dataType.number;
    //console.log(value)
    result = func(value);
    test.equal(result.rc, validateError.needMaxLength.rc, 'related field maxLength check failed');

    value.userName.maxLength = {};
    value.userName.require = { define: false, error: { rc: 1234, msg: 'asdf' } };
    value.userName.min = undefined;
    value.userName.max = undefined;
    result = func(value);
    test.equal(result.rc, validateError.ruleDefineNotDefine.rc, 'related field maxLength 1 check failed');

    test.done();
};

var checkRuleDefine = function checkRuleDefine(test) {
    test.expect(16);
    var result = void 0;
    var value = {
        userName: {
            chineseName: '用户名',
            type: dataType.string,
            require: { define: false, error: { rc: 1234, msg: '' } }
        }
    };
    var func = testModule.validate._private.checkRuleBaseOnRuleDefine;

    var error = { rc: 1234, msg: '1111' };

    /*      check related fields    */
    //string,只检查maxLength
    value.userName.maxLength = { define: {}, error: error };
    result = func(value);
    test.equal(result.rc, validateError.maxLengthDefineNotInt.rc, 'maxLength define type check failed');
    value.userName.maxLength = { define: '1', error: error };
    result = func(value);
    test.equal(result.rc, 0, 'maxLength define type 1 check failed');

    value.userName.max = {};
    /*          check all fileds(define/error/rc/msg) in rule are exist*/
    value.userName.max.error = { rc: 1234, msg: '' };
    result = func(value);
    test.equal(result.rc, validateError.ruleDefineNotDefine.rc, 'max define check failed');

    value.userName.max.define = 1;
    value.userName.max.error = undefined;
    //console.log(value)
    result = func(value);
    //console.log(result)
    test.equal(result.rc, validateError.errorFieldNotDefine.rc, 'max error check failed');

    value.userName.max.error = { rc: 1234 };
    result = func(value);
    test.equal(result.rc, 0, 'max error msg check failed');

    value.userName.max.error = { msg: 1234 };
    result = func(value);
    test.equal(result.rc, validateError.rcFieldNotDefine.rc, 'max error rc check failed');

    value.userName.max = undefined;

    /*      check all rule type is right*/
    value.userName.require = { define: 1, error: error };
    result = func(value);
    test.equal(result.rc, validateError.requireDefineNotBoolean.rc, 'require define type check failed');
    value.userName.require = { define: false, error: error };
    result = func(value);
    test.equal(result.rc, 0, 'require define type 1 check failed');

    value.userName.maxLength = { define: 100, error: error };
    value.userName.minLength = { define: false, error: error };
    result = func(value);
    test.equal(result.rc, validateError.minLengthDefineNotInt.rc, 'minLength define type check failed');
    value.userName.minLength = { define: 1, error: error };
    result = func(value);
    test.equal(result.rc, 0, 'minLength define type 1 check failed');

    value.userName.exactLength = { define: 1.1, error: error };
    result = func(value);
    test.equal(result.rc, validateError.exactLengthDefineNotInt.rc, 'exactLength define type check failed');
    value.userName.exactLength = { define: '1', error: error };
    result = func(value);
    test.equal(result.rc, 0, 'exactLength define type 1 check failed');

    value.userName.min = { define: false, error: error };
    result = func(value);
    test.equal(result.rc, validateError.minDefineNotInt.rc, 'min define type check failed');
    value.userName.min = { define: 1, error: error };
    result = func(value);
    test.equal(result.rc, 0, 'min define type 1 check failed');

    value.userName.max = { define: new Date(), error: error };
    result = func(value);
    test.equal(result.rc, validateError.maxDefineNotInt.rc, 'max define type check failed');
    value.userName.max = { define: '1', error: error };
    result = func(value);
    test.equal(result.rc, 0, 'max define type 1 check failed');

    test.done();
};

var sanityRules = function sanityRules(test) {
    var func = testModule.validate._private.sanityRule;
    var preFunc = testModule.validate._private.checkRuleBaseOnRuleDefine;
    var value = void 0,
        tmpDataType = void 0,
        result = void 0,
        tmp = void 0;
    var error = { rc: 1234, msg: '' };

    value = {
        userName: {
            chineseName: '用户名',
            type: dataType.int,
            default: '1',
            require: { define: false, error: error },
            minLength: { define: '2', error: error },
            maxLength: { define: '2', error: error },
            exactLength: { define: '2', error: error },
            min: { define: '2', error: error },
            max: { define: '2', error: error }
        }
    };
    test.expect(7);

    result = preFunc(value);
    test.equal(result.rc, 0, 'rule check fail');

    func(value);
    console.log(value);
    test.equal(value.userName.default, 1, 'default value convert to int failed');
    test.equal(value.userName.minLength.define, 2, 'minLength value convert to int failed');
    test.equal(value.userName.maxLength.define, 2, 'maxLength value convert to int failed');
    test.equal(value.userName.exactLength.define, 2, 'exactLength value convert to int failed');
    test.equal(value.userName.min.define, 2, 'min value convert to int failed');
    test.equal(value.userName.max.define, 2, 'max value convert to int failed');

    test.done();
};
/***************************************************************************/
/***************               checkInput                *******************/
/***************************************************************************/
var checkInput = function checkInput(test) {
    var func = testModule.validate.checkInput;
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    var rule = void 0,
        value = void 0,
        tmpDataType = void 0,
        result = void 0,
        tmp = void 0;
    var error = { rc: 1234, msg: '' };

    test.expect(11);

    rule = {
        userName: {
            chineseName: '用户名',
            type: dataType.int,
            default: 10,
            require: { define: true, error: error },
            minLength: { define: 2, error: error },
            maxLength: { define: 4, error: error },
            exactLength: { define: 2, error: error },
            min: { define: 10, error: error },
            max: { define: 9999, error: error }
        }
    };

    value = {
        userName1: {}
    };
    result = func(value, rule);
    test.equal(result.userName1.rc, validateError.valueRelatedRuleNotDefine.rc, 'value related rule not defined fail');

    value = {
        userName: {
            value: null
        }
    };
    result = func(value, rule);
    test.equal(result.userName.rc, 0, 'value not set and return default fail');
    // console.log(result)
    test.equal(value.userName.value, 10, 'value not set and return default 1 fail');

    //console.log( rule.userName)
    value = {
        userName: {
            value: null
        }
    };
    delete rule.userName.default;
    result = func(value, rule);
    //console.log( result.userName)
    test.equal(result.userName.rc, validateError.valueNotDefineWithRequireTrue.rc, 'value not set && require is true && default not set check fail');

    rule.userName.require.define = false;
    rule.userName.default = undefined;
    result = func(value, rule);
    //console.log(result.userName.rc)
    test.equal(result.userName.rc, 0, 'value not set && require is false  check fail');

    rule.userName.require.define = true;
    rule.userName.default = '10';
    value = {
        userName: {
            value: [1]
        }
    };
    result = func(value, rule);
    /*    console.log(result)
        console.log(value)*/
    test.equal(result.userName.rc, validateError.typeWrong.rc, 'value type check fail');

    //check reset rule expect require
    value.userName = {
        value: 1
    };
    result = func(value, rule);
    test.equal(result.userName.rc, rule.userName.minLength.error.rc, 'minLength check fail');

    value.userName = {
        value: 10000
    };
    result = func(value, rule);
    test.equal(result.userName.rc, rule.userName.maxLength.error.rc, 'maxLength check fail');

    value.userName = {
        value: 988
    };
    result = func(value, rule);
    test.equal(result.userName.rc, rule.userName.exactLength.error.rc, 'exactLength check fail');

    rule = {
        user: {
            chineseName: '用户',
            type: dataType.string,
            default: '男',
            require: { define: true, error: error },
            'enum': { define: ['男', '女'], error: { rc: 1000, msg: '错误' } }
        }
    };

    value = { user: { value: '男' } };
    result = func(value, rule);
    //console.log(result)
    test.equal(result.user.rc, 0, 'value in enum check fail');

    value = { user: { value: '人妖' } };
    result = func(value, rule);
    test.equal(result.user.rc, rule.user.enum.error.rc, 'value not in enum check fail');

    test.done();
};

//检查_id（rule中未定义）和外键id（rule中定义）
//测试在checkInput中添加了新的代码
var checkInputAdditional = function checkInputAdditional(test) {
    test.expect(8);

    var func = testModule.validate.checkInput;
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    var rule = void 0,
        value = void 0,
        tmpDataType = void 0,
        result = void 0,
        tmp = void 0;
    var error = { rc: 1234, msg: '' };

    rule = {};
    value = {
        _id: { value: '57f8dc65a795ace017f36be7' }
    };
    result = func(value, rule);
    //console.log(result)
    test.equal(result._id.rc, 0, 'correct _id check fail');

    value = {
        id: { value: '57f8dc65a795ace017f36be7' }
    };
    result = func(value, rule);
    //console.log(result)
    test.equal(result.id.rc, 0, 'correct id check fail');

    value = {
        _id: { value: '57f8dc65a795ace017f36' }
    };
    result = func(value, rule);
    //console.log(result)
    test.equal(result._id.rc, validateError.idWrong.rc, 'wrong _id check fail');
    value = {
        id: { value: '57f8dc65a795ace017f36' }
    };
    result = func(value, rule);
    //console.log(result)
    test.equal(result.id.rc, validateError.idWrong.rc, 'wrong id check fail');

    rule = {
        fk: {
            chineseName: '外键',
            type: dataType.objectId,
            // default:'10',
            require: { define: true, error: error }
        }
    };

    value = {};
    result = func(value, rule, false); //false:base on inputRule(check all rule)
    console.log(result);
    test.equal(result.fk.rc, error.rc, 'undefined fk check fail');

    value = {
        fk: { value: '57f8dc65a795ace017f36be7' }
    };
    result = func(value, rule);
    test.equal(result.fk.rc, 0, 'correct fk check fail');

    value = {
        fk: { value: '57f8dc65a795ace017f36b' }
    };
    result = func(value, rule);
    test.equal(result.fk.rc, validateError.objectIdWrong.rc, 'wrong fk check fail');

    rule = {
        fk: {
            chineseName: '外键',
            type: dataType.objectId,
            // default:'10',
            require: { define: false, error: error }
        }
    };
    value = {
        fk: { value: '57f8dc65a795ace017f36b' }
    };
    result = func(value, rule);
    test.equal(result.fk.rc, 0, 'wrong fk but require false check fail');

    test.done();
};

//独立的函数
var checkSearchValue = function checkSearchValue(test) {

    test.expect(2);

    var func = testModule.validate.checkSearchValue;
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    var rule = void 0,
        value = void 0,
        tmpDataType = void 0,
        result = void 0,
        tmp = void 0;
    var requireError = { rc: 1234, msg: '' };
    var maxLengthError = { rc: 1235, msg: '' };

    rule = { name: {
            chineseName: '名称',
            type: dataType.string,
            require: { define: false, error: requireError },
            maxLength: { define: 10, error: maxLengthError }
        } };

    value = {
        name: {
            value: '123456789'
        }
    };
    result = func(value, rule);
    console.log(result);
    test.equal(result.name.rc, 0, 'correct name length check fail');

    value = {
        name: {
            value: '12345678901'
        }
    };
    result = func(value, rule);
    test.equal(result.name.rc, rule.name.maxLength.error.rc, 'wrong name length check fail');

    test.done();
};

exports.validate = {
    _private: {
        checkDataTypeBaseOnTypeDefine: checkDataTypeBaseOnTypeDefine,
        checkRuleTypeBaseOnTypeDefine: {
            checkAllMandatoryFieldsExist: checkAllMandatoryFieldsExist,
            checkRelatedField: checkRelatedField,
            checkRuleDefine: checkRuleDefine
        },
        sanityRules: sanityRules
    },
    checkInput: checkInput,
    checkInputAdditional: checkInputAdditional,
    checkSearchValue: checkSearchValue
};

//# sourceMappingURL=testMisc_Validate-compiled.js.map