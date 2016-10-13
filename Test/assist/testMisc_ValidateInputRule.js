/**
 * Created by wzhan039 on 2016-07-07.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")
var testModule=require('../../server/assist/misc').func;
var miscError=require('../../server/define/error/nodeError').nodeError.assistError
var validateInputRuleError=miscError.misc.validateInputRule
/*          for generateRandomString test       */
var regex=require('../../server/define/regex/regex').regex
var dataType=require('../../server/define/enum/validEnum').enum.dataType

/***************************************************************************/
/***************     checkRuleTypeBaseOnTypeDefine      *******************/
/***************************************************************************/

//1. 检查必须字段是否存在
var checkAllMandatoryFieldsExist=function(test){
    //let a=testModule.validate._private.checkRuleBaseOnRuleDefine
    let func=testModule.validateInputRule.checkSingleFieldRuleDefine
    let [coll,field,rule]=['testColl','testField',{}]
    let result
    test.expect(4);

    /*          */
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.mandatoryFiledNotExist.rc,'chineseName undefined check failed');

    rule={'chineseName':'用户名'}
    //rule.userName.chineseName=
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.mandatoryFiledNotExist.rc,'type undefined check failed');

    rule={'chineseName':'用户名','type':dataType.array}
    //rule.userName.
    //console.log(dataType.array)
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.mandatoryFiledNotExist.rc,'require undefined check failed');

    rule={'chineseName':'用户名','type':dataType.array,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    //rule.userName.require=
    //rule.userName.require=
    result=func(coll,field,rule)
    test.equal(result.rc,0,'all mandatory field defined check failed');

    test.done()
}


//2 检查chineseName是否为字符
var checkChineseNameRule=function(test){
    let func=testModule.validateInputRule.checkSingleFieldRuleDefine
    let [coll,field,rule]=['testColl','testField',{}]
    let result
    test.expect(2);

    rule={'chineseName':[],'type':dataType.array,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.chineseNameNotString.rc,'chineseName type should be string check failed');

    rule={'chineseName':'','type':dataType.array,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.chineseNameEmpty.rc,'chineseName empty check failed');

    test.done()
}


//3 检查某种type对应的关联rule是否存在
var checkRelatedField=function(test){
    let func=testModule.validateInputRule.checkSingleFieldRuleDefine
    let [coll,field,rule]=['testColl','testField',{}]
    let result

    test.expect(6);

    rule={'chineseName':'用户名','type':dataType.int,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.needMin.rc,'type int related field min check failed');

    rule.min={}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.needMax.rc,'type int related field max check failed');

    rule.max={}
    rule.min=null
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.needMin.rc,'type int related field min1 null check failed');



/*    rule={'chineseName':'用户名','type':dataType.int,'require':{define:false,error:{rc:1234,msg:'1234'}},min:{},max:{}}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.needMaxLength.rc,'type int related field maxLength check failed');*/



    rule={'chineseName':'用户名','type':dataType.string,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.needMaxLength.rc,'type string related field maxLength check failed');

    rule.format={define:/a/,error:{rc:1000,msg:'test'}}
    result=func(coll,field,rule)
    test.equal(result.rc,0,'type string related field format exists, maxLength check failed');


    rule={'chineseName':'用户名','type':dataType.objectId,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.needFormat.rc,'type objectId related field format check failed');



    test.done()
}

//4 检测rule的格式是否正确（define/error/error.rc）
var checkRuleFormat=function(test){
    let func=testModule.validateInputRule.checkSingleFieldRuleDefine
    let [coll,field,rule]=['testColl','testField',{}]
    let result

    test.expect(4);
    let error={rc:1234,msg:'1111'}

    rule={'chineseName':'用户名','type':dataType.string,'require':{define:false,error:error}}
    //string,只检查maxLength
    rule.maxLength={define:null,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.ruleDefineNotDefine.rc,'maxLength define null check failed');
    rule.maxLength={define:undefined,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.ruleDefineNotDefine.rc,'maxLength define undefined check failed');
    rule.maxLength={define:{}}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.errorFieldNotDefine.rc,'maxLength error not define check failed');
    rule.maxLength={define:{},error:{}}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.rcFieldNotDefine.rc,'maxLength error.rc not define check failed');

    test.done()
}



//5 检测rule的define
var checkRuleDefine=function(test){
    let func=testModule.validateInputRule.checkSingleFieldRuleDefine
    let [coll,field,rule]=['testColl','testField',{}]
    let result
    test.expect(10);
    let error={rc:1234,msg:'1111'}

    /*      check (max)Length fields    */
    rule={'chineseName':'用户名','type':dataType.string,'require':{define:false,error:error}}

    //string(或者number),以maxLength为例检查
    rule.maxLength={define:{},error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.lengthDefineNotInt.rc,'maxLength define {} check failed');
    rule.maxLength={define:'',error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.lengthDefineNotInt.rc,'maxLength define \'\' check failed');
    rule.maxLength={define:'1',error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.lengthDefineNotInt.rc,'maxLength define \'1\' check failed');
    rule.maxLength={define:0.2,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.lengthDefineNotInt.rc,'maxLength define 0.2 check failed');

    rule.maxLength={define:-1,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.lengthDefineMustLargeThanZero.rc,'maxLength define -1 check failed');
    rule.maxLength={define:0,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.lengthDefineMustLargeThanZero.rc,'maxLength define 0 check failed');


    //检查rule:enum
    rule={'chineseName':'性别','type':dataType.string,'require':{define:false,error:error},maxLength:{define:10,error:error}}

    rule['enum']={define:1,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.enumDefineNotArray.rc,'enum define 1 check failed');
    rule['enum']={define:{},error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.enumDefineNotArray.rc,'enum define {} check failed');
/*    rule['enum']={define:null,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.enumDefineNotArray.rc,'enum define null check failed');*/
    rule['enum']={define:[],error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.enumDefineLengthMustLargerThanZero.rc,'enum define null check failed');

    rule['enum']={define:['难','一'],error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,0,'enum define [\'难\',\'一\'] check failed');

    test.done()
}

//6 check default
var checkDefaultType=function(test) {
    let func = testModule.validateInputRule.checkSingleFieldRuleDefine
    let [coll,field,rule]=['testColl', 'testField', {}]
    let result
    test.expect(10);
    let error = {rc: 1234, msg: '1111'}

    /*      check (max)Length fields    */
    rule = {'chineseName': '用户名', 'type': dataType.string, 'require': {define: false, error: error},maxLength:{define:2,error:error}}

    rule['default']=1
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.ruleDefineWrong().rc,'type string, default 1 check failed');
    rule['default']=''
    result=func(coll,field,rule)
    test.equal(result.rc,0,'type string, default \'\' check failed');


/*    rule = {'chineseName': '用户名', 'type': dataType.string, 'require': {define: false, error: error},maxLength:{define:2,error:error}}

    rule['default']=1
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.ruleDefineWrong().rc,'type string, default 1 check failed');
    rule['default']=''
    result=func(coll,field,rule)
    test.equal(result.rc,0,'type string, default \'\' check failed');*/


    rule = {'chineseName': '用户名', 'type': dataType.int, 'require': {define: false, error: error},min:{define:2,error:error},max:{define:4,error:error}}
    //default未设置，则不检查
    rule['default']=null
    result=func(coll,field,rule)
    test.equal(result.rc,0,'type int, default null check failed');
    rule['default']=undefined
    result=func(coll,field,rule)
    test.equal(result.rc,0,'type int, default undefined check failed');

    rule['default']=[]
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.ruleDefineWrong().rc,'type int, default [] check failed');
    rule['default']={}
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.ruleDefineWrong().rc,'type int, default {} check failed');
    rule['default']=''
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.ruleDefineWrong().rc,'type int, default \'\' check failed');
    rule['default']=0.1
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.ruleDefineWrong().rc,'type int, default 0.1 check failed');
    rule['default']='1'
    result=func(coll,field,rule)
    test.equal(result.rc,validateInputRuleError.ruleDefineWrong().rc,'type int, default \'1\' check failed');
    rule['default']=1
    result=func(coll,field,rule)
    test.equal(result.rc,0,'type int, default 1 check failed');

    //number(偷懒，不测)
    test.done()
}



exports.validate={
    checkAllMandatoryFieldsExist,
    checkChineseNameRule,
    checkRelatedField,
    checkRuleFormat,
     checkRuleDefine,
     checkDefaultType,

}