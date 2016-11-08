/**
 * Created by wzhan039 on 2016-07-07.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")
var testModule=require('../../server/assist/misc').func;
var miscError=require('../../server/define/error/nodeError').nodeError.assistError
var validateInputValueError=miscError.misc.validateInputValue
/*          for generateRandomString test       */
var regex=require('../../server/define/regex/regex').regex
var dataType=require('../../server/define/enum/validEnum').enum.dataType
//var randomStringTypeEnum=require('../../server/define/enum/node').node.randomStringType



/***************************************************************************/
/*******     辅助函数，根据预定义dataType，检测value是否合格      **********/
/***************************************************************************/
var checkDataTypeBaseOnTypeDefine=function(test){
    let func=testModule.validateInputValue._private.checkDataTypeBaseOnTypeDefine
    let value,tmpDataType,result,tmp

    test.expect(9)

    value='randomString'
    tmpDataType='noEnumDataType'
    result=func(value,tmpDataType)
    test.equal(result.rc,validateInputValueError.unknownDataType.rc,'unknown data type check failed');

    value='0'
    tmpDataType=dataType.int
    result=func(value,tmpDataType)
    test.equal(result,0,'data type int check failed');

    value='1.1'
    tmpDataType=dataType.float
    result=func(value,tmpDataType)
    test.equal(result,1.1,'data type float check failed');

    value='randomString'
    tmpDataType=dataType.string
    result=func(value,tmpDataType)
    test.equal(result,true,'data type string check failed');



    value=new Date('2016').getTime()
    tmpDataType=dataType.date
    result=func(value,tmpDataType)
    test.equal(result.toLocaleString(),new Date(value).toLocaleString(),'data type date check failed');

    value=[]
    tmpDataType=dataType.array
    result=func(value,tmpDataType)
    test.equal(result,true,'data type array check failed');

    value={}
    tmpDataType=dataType.object
    result=func(value,tmpDataType)
    test.equal(result,true,'data type object check failed');

    value='C:/Windows/System32/drivers/etc/hosts'
    tmpDataType=dataType.file
    result=func(value,tmpDataType)
    test.equal(result,true,'data type file check failed');

    value='C:/Program Files'
    tmpDataType=dataType.folder
    result=func(value,tmpDataType)
    test.equal(result,true,'data type folder check failed');

    test.done()

}



/***************************************************************************/
/***************               checkInput                *******************/
/***************************************************************************/
var checkInput=function(test){
    let func=testModule.validateInputValue.checkInput
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let rule,value,tmpDataType,result,tmp
    let error={rc:1234,msg:''}

    test.expect(18)

    //以下移动到checkInputDataValidate函数中
/*    //1 检测inputValue是否为空
    rule={}
    value=null
    result=func(value,rule)
    test.equal(result.rc,validateInputValueError.valueNotDefine.rc,'value null check fail')
    value=undefined
    result=func(value,rule)
    test.equal(result.rc,validateInputValueError.valueNotDefine.rc,'value undefined check fail')*/

    //2 检查inputValue是否有未定义的字段
    rule={name:{}}
    value={'notExistField':{value:'a'}}
    result=func(value,rule)
    test.equal(result.notExistField.rc,validateInputValueError.valueRelatedRuleNotDefine.rc,'not exist field check fail')


    //3.1 如果有id，检测id
    rule={name:{}}
    value={'_id':{value:null}}
     result=func(value,rule)
     test.equal(result._id.rc,validateInputValueError.objectIdEmpty.rc,'field _id null check fail')
    value={'_id':{value:undefined}}
    result=func(value,rule)
    test.equal(result._id.rc,validateInputValueError.objectIdEmpty.rc,'field _id undefined check fail')

    value={'_id':{value:{}}}
    result=func(value,rule)
    test.equal(result._id.rc,validateInputValueError.objectIdWrong.rc,'field _id {} check fail')


    //3.2 如果是objectId（外键），提前检测
    rule={'fk':{chineseName:'外键1',type:dataType.objectId,require:{define:true,error:error},format:{define:regex.objectId,error:error}}}
    value={'fk':{value:"asdf"}}
    result=func(value,rule)
    test.equal(result.fk.rc,error.rc,'field fk require true, wrong objectId, check fail')
    rule.fk.require.define=false
    result=func(value,rule)
    test.equal(result.fk.rc,error.rc,'field fk require false, wrong objectId, check fail')

    //fk  require, but inputValue no fk
    rule={}
    rule.fk={chineseName:'外键1',type:dataType.objectId,require:{define:true,error:error},format:{define:regex.objectId,error:error}}
    rule.name={chineseName:'名字',type:dataType.string,require:{define:false,error:error},maxLength:{define:20,error:error}}
    value={'name':{value:'a'}}
    result=func(value,rule,false)
    // console.log(result)
    test.equal(result.fk.rc,error.rc,'field fk require true, no objectId, check fail')

    // 3.3 default set+require true+input value empty
    rule={}
    rule.name={chineseName:'名字',type:dataType.string,require:{define:true,error:error},maxLength:{define:20,error:error}}
    value={name:{value:null}}
    result=func(value,rule)
    test.equal(result.name.rc,validateInputValueError.valueNotDefineWithRequireTrue.rc,'require true, default empty and input empty, check fail')

    //3.4 format check
    rule={salt:{
        chineseName: '盐',
        type:dataType.string,
        //require=false：client无需此字段，server通过函数（必须有salt来sha密码）保证由此字段
        require: {define: false, error: {rc: 10000},mongoError:{rc:20000,msg:'盐不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        minLength:{define:2,error:{rc:10002},mongoError:{rc:20002,msg:'盐至少2个字符'}},
        maxLength:{define:8,error:{rc:10004},mongoError:{rc:20004,msg:'盐的长度不能超过8个字符'}},
        format:{define:regex.salt,error:{rc:10005},mongoError:{rc:20005,msg:'盐必须由10个字符组成'}} //server端使用
    }},
        value={salt:{value:'1'}}
    result=func(value,rule)
    // console.log(result)
    test.equal(result.salt.rc,10005,'format check,ignore minLength, check fail')
    value={salt:{value:'123456789'}}
    result=func(value,rule)
    test.equal(result.salt.rc,10005,'format check,ignore maxLength, check fail')
    value={salt:{value:'1234567890'}}
    result=func(value,rule)
    test.equal(result.salt.rc,0,'format check,ignore min/maxLength, check fail')


    //3.5 maxLength
    rule.name={chineseName:'名字',type:dataType.string,require:{define:false,error:error},maxLength:{define:5,error:error}}
    value={name:{value:'123456'}}
    result=func(value,rule)
    test.equal(result.name.rc,error.rc,'maxLength, check fail')

    //3.6 enum
    rule={}
    rule.gender={chineseName:'性别',type:dataType.string,require:{define:false,error:error},'enum':{define:['female','male'],error:{rc:4567,msg:'value is not enum'}}}
    value={gender:{value:'123456'}}
    result=func(value,rule)
    test.equal(result.gender.rc,4567,'enum gender, check fail')


    // 3.7 type check
    rule={}
    rule.name={chineseName:'名字',type:dataType.string,require:{define:false,error:error},maxLength:{define:5,error:{rc:7654,msg:'名字不是数字'}}}
    value={name:{value:1234}}
    result=func(value,rule)
    test.equal(result.name.rc,validateInputValueError.typeWrong.rc,'wrong type, check fail')

    //3.8 all except enum/maxLength/format
    rule={
        age:{
            chineseName:'年龄',
            type:dataType.int,
            default:10,
            require:{define:true,error:{rc:1,msg:'age必须'}},
            min:{define:10,error:{rc:5,msg:'age最小10'}},
            max:{define:9999,error:{rc:6,msg:'age最大9999'}},
        }
    }

    value={age:{value:1}}
    result=func(value,rule)
    test.equal(result.age.rc,5,'min check fail')
    value={age:{value:10000}}
    result=func(value,rule)
    test.equal(result.age.rc,6,'max check fail')

    rule={
        name:{
            chineseName:'名字',
            type:dataType.string,
            default:'',
            require:{define:true,error:{rc:1,msg:'名字必须'}},
            minLength:{define:2,error:{rc:2,msg:'名字长度最小2'}},
            maxLength:{define:4,error:{rc:3,msg:'名字长度最大4'}},
            // exactLength:{define:3,error:{rc:4,msg:"名字长度2"}},
        }
    }
    //maxLength先检
    value={name:{value:'asdfv'}}
    result=func(value,rule)
    test.equal(result.name.rc,3,'maxLength check fail')
    value={name:{value:'a'}}
    result=func(value,rule)
    test.equal(result.name.rc,2,'minLength check fail')

    test.done()
}

//检查_id（rule中未定义）和外键id（rule中定义）
//测试在checkInput中添加了新的代码
var checkInputAdditional=function(test){
    test.expect(7)

    let func=testModule.validateInputValue.checkInput
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let rule,value,tmpDataType,result,tmp
    let error={rc:1234,msg:''}

    rule={}
    value={
        _id:{value:'57f8dc65a795ace017f36be7'},
    }
    result=func(value,rule)
    //console.log(result)
    test.equal(result._id.rc,0,'correct _id check fail')

    value={
        id:{value:'57f8dc65a795ace017f36be7'},
    }
    result=func(value,rule)
    //console.log(result)
    test.equal(result.id.rc,0,'correct id check fail')

    value={
        _id:{value:'57f8dc65a795ace017f36'},
    }
    result=func(value,rule)
    //console.log(result)
    test.equal(result._id.rc,validateInputValueError.objectIdWrong.rc,'wrong _id check fail')
    value={
        id:{value:'57f8dc65a795ace017f36'},
    }
    result=func(value,rule)
    //console.log(result)
    test.equal(result.id.rc,validateInputValueError.objectIdWrong.rc,'wrong id check fail')

    rule={
        fk:{
            chineseName:'外键',
            type:dataType.objectId,
            // default:'10',
            require:{define:true,error:error},
            format:{define:regex.objectId,error:error}
        },
    }

    value={
        fk:{value:'57f8dc65a795ace017f36be7'}
    }
    result=func(value,rule)
    test.equal(result.fk.rc,0,'correct fk check fail')

    value={
        fk:{value:'57f8dc65'}
    }
    result=func(value,rule)
    //有对应rule，则rcquwrule中的定义
    test.equal(result.fk.rc,rule.fk.format.error.rc,'wrong fk check fail')

    rule={
        fk:{
            chineseName:'外键',
            type:dataType.objectId,
            // default:'10',
            require:{define:false,error:error},
            format:{define:regex.objectId,error:error}
        },
    }
    value={
        fk:{value:'57f8dc65a795ace017f36b'}
    }
    result=func(value,rule)
    //console.log(`wrong but not require ${JSON.stringify(result)}`)
    test.equal(result.fk.rc,rule.fk.format.error.rc,'wrong fk but require false check fail')


    test.done()
}

/*              检查搜索参数              */

var validateInputSearchFormat=function(test){

    test.expect(19)

    let func=testModule.validateInputValue.validateInputSearchFormat
    let error=miscError.misc.validateInputSearch
    let rules=require('../../server/define/validateRule/inputRule').inputRule
    let coll=require('../../server/define/enum/node').node.coll
    let fkAdditionalFieldsConfig=
    {
        //冗余字段（nested）的名称：具体冗余那几个字段
        //parentBillType:此字段为外键，需要冗余字段
        //relatedColl：外键对应的coll
        //nestedPrefix： 冗余字段一般放在nested结构中
        //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
        parentBillType:{relatedColl:coll.billType,nestedPrefix:'parentBillTypeFields',forSelect:'name',forSetValue:['name']}
    }
    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value,result,tmp

    /*                必须是对象                  */
    value='1234'
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchNotObject.rc,'search input is string check fail')

    value=['1234']
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchNotObject.rc,'search input is array check fail')


    /*              对象不能为空                  */
    value={}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchCanNotEmpty.rc,'search input is {} check fail')


    /*              对象的key必须在rule中定义           */
    value={'notExistField':['a']}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchNoRelatedRule.rc,'search input value key not exist check fail')
    /*              对象的value必须是数组           */
    value={parentBillType:'1234'}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchValueMustBeArray.rc,'search input value is string check fail')

    /*              对象的value必须是对象，非空数组           */
    value={parentBillType:null}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchValueCanNotEmpty.rc,'search input is null check fail')
    value={parentBillType:[]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchValueCanNotEmpty.rc,'search input value is [] check fail')

    /*              对象的value为数组，且长度不能超过预定值           */
    value={parentBillType:[1,2,3,4,5,6]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchValueLengthExceed.rc,'search input value is [1,2,3,4,5,6] check fail')

    /*              对象的value为数组，且为对象，无undefined/null/''的元素           */
    value={parentBillType:[1]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.rc,error.inputSearchValueElementMustBeObject.rc,'search input value has non object element check fail')
    value={parentBillType:[{}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.rc,error.inputSearchValueElementCanNotEmpty.rc,'search input value has {} element check fail')
    value={parentBillType:['']}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.rc,error.inputSearchValueElementCanNotEmpty.rc,'search input value has "" element check fail')
    value={parentBillType:[null]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.rc,error.inputSearchValueElementCanNotEmpty.rc,'search input value has null element check fail')

    /*              非外键的键值，必须是字符数字日期                            */
    value={name:[{}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.rc,error.inputSearchValueElementMustBeStringNumberDate.rc,'search input value not fk element {} check fail')
    value={name:[[]]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.rc,error.inputSearchValueElementMustBeStringNumberDate.rc,'search input value not fk element [] check fail')
    value={name:[1]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.rc,0,'search input value not fk element 1 check fail')
    value={name:['1']}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.rc,0,'search input value not fk element string 1 check fail')
    value={name:[Date.now()]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.rc,0,'search input value not fk element date check fail')

    /*              每个对象的key必须在fkAdditional中有定义                     */
    value={parentBillType:[{name:'val'},{notExist:"val2"}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.rc,error.inputSearchValueElementKeyNotDefined.rc,'search input value has non exist key check fail')
    //成功的输入
    value={name:[1,2,3,4],parentBillType:[{name:1},{name:2}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,0,'search input value is [1,2,3,4,5,6] check fail')


    test.done()
}

var validateInputSearch=function(test){

    let func=testModule.validateInputValue.validateInputSearch
    let error=miscError.misc.validateInputSearch
    let rules=require('../../server/define/validateRule/inputRule').inputRule
    let coll=require('../../server/define/enum/node').node.coll
    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value,result,tmp
    let fkAdditionalFieldsConfig=
        {
            //冗余字段（nested）的名称：具体冗余那几个字段
            //parentBillType:此字段为外键，需要冗余字段
            //relatedColl：外键对应的coll
            //nestedPrefix： 冗余字段一般放在nested结构中
            //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
            parentBillType:{relatedColl:coll.billType,nestedPrefix:'parentBillTypeFields',forSelect:'name',forSetValue:['name']}
        }

    test.expect(4)


    value={'name':['a']}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(result)
    test.equal(result.name.rc,rules.billType.name.minLength.error.rc,'search input value name a check fail')

    value={'name':['a1234567890a1234567890a1234567890a1234567890a1234567890a1234567890']}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.name.rc,rules.billType.name.maxLength.error.rc,'search input value name long check fail')

    value={'parentBillType':['a']}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.rc,rules.billType.name.minLength.error.rc,'search input value parentBillType a check fail')

    value={'parentBillType':['a1234567890a1234567890a1234567890a1234567890a1234567890a1234567890']}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.parentBillType.rc,rules.billType.name.maxLength.error.rc,'search input value parentBillType long check fail')

    test.done()
}
exports.validate={
/*    _private:{
        checkDataTypeBaseOnTypeDefine,
    },
    checkInput,
    checkInputAdditional,*/
     validateInputSearchFormat,
    //validateInputSearch,
}