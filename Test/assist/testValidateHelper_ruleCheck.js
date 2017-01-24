/**
 * Created by wzhan039 on 2016-07-07.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")
var testModule=require('../../server/assist/validateInput/validateHelper');
//var miscError=require('../../server/define/error/nodeError').nodeError.assistError
var ruleFormatCheckFormatError=require('../../server/define/error/node/validateError').validateError.validateHelper
/*          for generateRandomString test       */
var regex=require('../../server/define/regex/regex').regex
var dataType=require('../../server/define/enum/validEnum').enum.dataType

/***************************************************************************/
/***************     checkRuleTypeBaseOnTypeDefine      *******************/
/***************************************************************************/

//0  rule必须是对象        1 检查必要字段
var checkAllMandatoryFieldsExist=function(test){
    //let a=testModule.validate._private.checkRuleBaseOnRuleDefine
    let func=testModule.ruleFormatCheck
    test.expect(5);

    let rule=''
    let [coll,field]=['testColl','testField']
    let result

    //1 rule必须是对象
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.ruleMustBeObject.rc,'rule is string check failed');

    //2 检查必要字段
    rule={}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.mandatoryFiledNotExist.rc,'chineseName undefined check failed');

    rule={'chineseName':'用户名'}
    //rule.userName.chineseName=
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.mandatoryFiledNotExist.rc,'type undefined check failed');

    rule={'chineseName':'用户名','type':dataType.array}
    //rule.userName.
    //console.log(dataType.array)
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.mandatoryFiledNotExist.rc,'require undefined check failed');

    rule={'chineseName':'用户名','type':dataType.array,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    //rule.userName.require=
    //rule.userName.require=
    result=func(coll,field,rule)
    //console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,'all mandatory field defined check failed');

    test.done()
}


//2 检查chineseName是否为字符
var checkChineseNameRule=function(test){
    let func=testModule.ruleFormatCheck
    let [coll,field,rule]=['testColl','testField',{}]
    let result
    test.expect(2);

    rule={'chineseName':[],'type':dataType.array,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.chineseNameNotString.rc,'chineseName type should be string check failed');

    rule={'chineseName':'','type':dataType.array,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.chineseNameEmpty.rc,'chineseName empty check failed');

    test.done()
}

//3 检查type是否合法（预定义的几种type之一）
var checkTypeValidate=function(test){
    let func=testModule.ruleFormatCheck
    let [coll,field,rule]=['testColl','testField',{}]
    let result

    test.expect(1);

    rule={'chineseName':'测试','type':'unknownDataType','require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.unknownDataType.rc,'unknown data type check failed');



    test.done()
}


//4 检查某种type对应的关联rule是否存在
var checkRelatedField=function(test){
    let func=testModule.ruleFormatCheck
    let [coll,field,rule]=['testColl','testField',{}]
    let result

    test.expect(7);

    rule={'chineseName':'用户名','type':dataType.int,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.needMin.rc,'type int related field min check failed');

    rule.min={}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.needMax.rc,'type int related field max check failed');

    rule.max={}
    rule.min=null
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.needMin.rc,'type int related field min1 null check failed');



/*    rule={'chineseName':'用户名','type':dataType.int,'require':{define:false,error:{rc:1234,msg:'1234'}},min:{},max:{}}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.needMaxLength.rc,'type int related field maxLength check failed');*/



    rule={'chineseName':'用户名','type':dataType.string,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.needMaxLength.rc,'type string related field maxLength check failed');

    rule.format={define:/a/,error:{rc:1000,msg:'test'}}
    result=func(coll,field,rule)
    test.equal(result.rc,0,'type string related field format exists, maxLength check failed');

    delete rule.format
    rule.enum={define:['a'],error:{rc:1000,msg:'test'}}
    result=func(coll,field,rule)
    test.equal(result.rc,0,'type string related field enum exists, maxLength check failed');

    rule={'chineseName':'用户名','type':dataType.objectId,'require':{define:false,error:{rc:1234,msg:'1234'}}}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.needFormat.rc,'type objectId related field format check failed');



    test.done()
}

//5 检测rule的格式是否正确（define/error/error.rc）
var checkRuleFormat=function(test){
    let func=testModule.ruleFormatCheck
    let [coll,field,rule]=['testColl','testField',{}]
    let result

    test.expect(4);
    let error={rc:1234,msg:'1111'}

    rule={'chineseName':'用户名','type':dataType.string,'require':{define:false,error:error}}
    //string,只检查maxLength
    rule.maxLength={define:null,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.ruleDefineNotDefine.rc,'maxLength define null check failed');
    rule.maxLength={define:undefined,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.ruleDefineNotDefine.rc,'maxLength define undefined check failed');
    rule.maxLength={define:{}}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.errorFieldNotDefine.rc,'maxLength error not define check failed');
    rule.maxLength={define:{},error:{}}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.rcFieldNotDefine.rc,'maxLength error.rc not define check failed');

    test.done()
}



//6 检测rule的define
var checkRuleDefine=function(test){
    let func=testModule.ruleFormatCheck
    let [coll,field,rule]=['testColl','testField',{}]
    let result
    test.expect(10);
    let error={rc:1234,msg:'1111'}

    /*      check (max)Length fields    */
    rule={'chineseName':'用户名','type':dataType.string,'require':{define:false,error:error}}

    //string(或者number),以maxLength为例检查
    rule.maxLength={define:{},error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.lengthDefineNotInt.rc,'maxLength define {} check failed');
    rule.maxLength={define:'',error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.lengthDefineNotInt.rc,'maxLength define \'\' check failed');
    rule.maxLength={define:'1',error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.lengthDefineNotInt.rc,'maxLength define \'1\' check failed');
    rule.maxLength={define:0.2,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.lengthDefineNotInt.rc,'maxLength define 0.2 check failed');

    rule.maxLength={define:-1,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.lengthDefineMustLargeThanZero.rc,'maxLength define -1 check failed');
    rule.maxLength={define:0,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.lengthDefineMustLargeThanZero.rc,'maxLength define 0 check failed');


    //检查rule:enum
    rule={'chineseName':'性别','type':dataType.string,'require':{define:false,error:error},maxLength:{define:10,error:error}}

    rule['enum']={define:1,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.enumDefineNotArray.rc,'enum define 1 check failed');
    rule['enum']={define:{},error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.enumDefineNotArray.rc,'enum define {} check failed');
/*    rule['enum']={define:null,error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.enumDefineNotArray.rc,'enum define null check failed');*/
    rule['enum']={define:[],error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.enumDefineLengthMustLargerThanZero.rc,'enum define null check failed');

    rule['enum']={define:['难','一'],error:error}
    result=func(coll,field,rule)
    test.equal(result.rc,0,'enum define [\'难\',\'一\'] check failed');

    test.done()
}

//7 check default
var checkDefaultType=function(test) {
    let func = testModule.ruleFormatCheck
    let [coll,field,rule]=['testColl', 'testField', {}]
    let result
    test.expect(10);
    let error = {rc: 1234, msg: '1111'}

    /*      check (max)Length fields    */
    rule = {'chineseName': '用户名', 'type': dataType.string, 'require': {define: false, error: error},maxLength:{define:2,error:error}}

    rule['default']=1
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.ruleDefineWrong().rc,'type string, default 1 check failed');
    rule['default']=''
    result=func(coll,field,rule)
    test.equal(result.rc,0,'type string, default \'\' check failed');


/*    rule = {'chineseName': '用户名', 'type': dataType.string, 'require': {define: false, error: error},maxLength:{define:2,error:error}}

    rule['default']=1
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.ruleDefineWrong().rc,'type string, default 1 check failed');
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
    test.equal(result.rc,ruleFormatCheckFormatError.ruleDefineWrong().rc,'type int, default [] check failed');
    rule['default']={}
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.ruleDefineWrong().rc,'type int, default {} check failed');
    rule['default']=''
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.ruleDefineWrong().rc,'type int, default \'\' check failed');
    rule['default']=0.1
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.ruleDefineWrong().rc,'type int, default 0.1 check failed');
    rule['default']='1'
    result=func(coll,field,rule)
    test.equal(result.rc,ruleFormatCheckFormatError.ruleDefineWrong().rc,'type int, default \'1\' check failed');
    rule['default']=1
    result=func(coll,field,rule)
    test.equal(result.rc,0,'type int, default 1 check failed');

    //number(偷懒，不测)
    test.done()
}


exports.validate={
    checkAllMandatoryFieldsExist,
    checkChineseNameRule,
    checkTypeValidate,
    checkRelatedField,
    checkRuleFormat,
     checkRuleDefine,
     checkDefaultType,

}