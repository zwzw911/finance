/**
 * Created by Ada on 2017/1/24.
 */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")
var testModule=require('../../server/assist/validateInput/validateValue');
//var miscError=require('../../server/define/error/nodeError').nodeError.assistError
var validateValueError=require('../../server/define/error/node/validateError').validateError.validateValue
var validateHelperError=require('../../server/define/error/node/validateError').validateError.validateHelper
/*          for generateRandomString test       */
var regex=require('../../server/define/regex/regex').regex
// var regex=require('../define/regex/regex').regex
var dataType=require('../../server/define/enum/validEnum').dataType
var ruleType=require('../../server/define/enum/validEnum').ruleType
var inputRule=require('../../server/define/validateRule/inputRule').inputRule

/*                  create是update超集             */
var validateCreateRecorderValue=function(test){
    let funcCreate=testModule.validateCreateRecorderValue
    test.expect(2)


    //3, create时，rule中为require的字段，value中没有
    let rule={name:{'require':{define:true,error:{rc:10000}}},age:{'require':{define:false,error:{rc:10000}}}}
    let value={age:{value:10}}
    let result=funcCreate(value,rule)
    // console.log(`error1 is ${JSON.stringify(result)}`)
    test.equal(result.name.rc,validateValueError.mandatoryFieldMiss('name').rc,"required field not set in value")

    //4, create时，rule中为require的字段，value为null
    value={name:{value:null}}
    result=funcCreate(value,rule)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.name.rc,rule.name.require.error.rc,"required field is null in value")
    
    test.done()
}


/*                  recorder id            */
var validateRecorderId=function(test){
    let funcDelete=testModule.validateRecorderId
    test.expect(6)



    //1, objectId格式不正确（null）
    let value=null
    let result=funcDelete(value)
    test.equal(result.rc,validateValueError.CUDObjectIdEmpty.rc,"Recorder Id is null" )
    //2. objectId格式不正确（undefined）
    value=undefined
    result=funcDelete(value)
    test.equal(result.rc,validateValueError.CUDObjectIdEmpty.rc,"objectId is undefined")

    //3, objectId格式不正确（整数）
    value=10
    result=funcDelete(value)
    test.equal(result.rc,validateValueError.CUDObjectIdWrong.rc,"objectId format wrong")
    //4, objectId格式不正确（数组）
    value=[10]
    result=funcDelete(value)
    test.equal(result.rc,validateValueError.CUDObjectIdWrong.rc,"objectId format wrong")
    //5, objectId格式不正确（对象）
    value={}
    result=funcDelete(value)
    test.equal(result.rc,validateValueError.CUDObjectIdEmpty.rc,'objectId format wrong')

    //6. 正常id
    value='58c0c32486e5a6d02657303f'
    result=funcDelete(value)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,"required field is null in value")

    test.done()
}



/*              目的是测试validateSingleRecorderFieldValue，但是必须通过validateCreateRecorderValue调用       */
var validateSingleRecorderFieldValue=function(test){

    let funcCreate=testModule.validateCreateRecorderValue
    let funcUpdate=testModule.validateUpdateRecorderValue
    // let funcUpdate=testModule.validateUpdateRecorderValue
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let rule,value,tmpDataType,result,tmp
    // let error={rc:1234,msg:''}

    test.expect(15)

    rule={
        mandatoryField1:{
            chineseName:'必填字段1',
            'require': {define: true, error: {rc: 10020},mongoError:{rc:20020,msg:'必填字段1不能为空'}},
            type:dataType.string,
            'minLength':{define:2,error:{rc:10021},mongoError:{rc:20021,msg:'必填字段1名至少2个字符'}},
            'maxLength':{define:10,error:{rc:10022},mongoError:{rc:20022,msg:'必填字段1名最多20个字符'}},
        },
        optionalField1:{
            chineseName:'可选字段1',
            'require': {define: false, error: {rc: 10025},mongoError:{rc:20025,msg:'可选字段1不能为空'}},
            type:dataType.int,
            'min':{define:1,error:{rc:10026},mongoError:{rc:20026,msg:'可选字段1名至少2个字符'}},
            'max':{define:100,error:{rc:10027},mongoError:{rc:20027,msg:'可选字段1名最多20个字符'}},
            format:{define:regex.pageNum,error:{rc:10028},mongoError:{rc:20028,msg:'页数必须由1-4个数字组成'}}
        },
        typeUnknownField:{
            chineseName:'类型未知字段1',
            'require': {define: false, error: {rc: 10030},mongoError:{rc:20030,msg:'可选字段1不能为空'}},
            type:'unknown',
        },
        typeObjectId:{
            chineseName:'字段objectId',
            'require': {define: false, error: {rc: 10040},mongoError:{rc:20040,msg:'可选字段1不能为空'}},
            type:dataType.objectId,
            'format':{define:regex.objectId,error:{rc:10041},mongoError:{rc:20041,msg:'所属部门的id格式不正确'}},
        },
        enumField:{
            chineseName:'枚举字段',
            'require': {define: false, error: {rc: 10050},mongoError:{rc:20050,msg:'可选字段1不能为空'}},
            type:dataType.string,
            'enum':{define:['male','female'],error:{rc:10051},mongoError:{rc:20051,msg:'性别不正确'}},
        },
    }


    //2. create: require=true的字段输入为null
    value={mandatoryField1:{value:null}}
    result=funcCreate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.mandatoryField1.rc,rule.mandatoryField1.require.error.rc,'when create new recorder, the required field value is not set')

    //3. update: require=true的字段输入为null，报require的错（既然填写了字段，就要符合rule的定义）
    value={mandatoryField1:{value:null}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.mandatoryField1.rc,rule.mandatoryField1.require.error.rc,'when update recorder, the required true field value is not set')

    //4.  update: require=false的字段输入为null，不报错
    value={optionalField1:{value:null}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,0,'when update recorder, the required false field value is not set')

    //5. 不存在的类型
    value={typeUnknownField:{value:1}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.typeUnknownField.rc,validateHelperError.unknownDataType.rc,'when update recorder, the field rule type is unknown')
    //6. 检查类型
    value={mandatoryField1:{value:1}}
    result=funcCreate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.mandatoryField1.rc,validateValueError.CUDTypeWrong.rc,'when create recorder, the field value wrong')
    //7  另一个错误类型
    value={optionalField1:{value:[1]}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,validateValueError.CUDTypeWrong.rc,'when update recorder, the field value wrong')

    //8  type=objectId
    value={typeObjectId:{value:[1]}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.typeObjectId.rc,rule.typeObjectId.format.error.rc,'when update recorder, the field value is not objectId')


    //9. format check:not match
    value={optionalField1:{value:111111}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,rule.optionalField1.format.error.rc,'when update recorder, the field value is not match format')
    //10. format check:for int, match format, not match min
    value={optionalField1:{value:0}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,rule.optionalField1.min.error.rc,'when update recorder, the field value is not match min')
    //11. format check:for int, match format, not match max
    value={optionalField1:{value:9999}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,rule.optionalField1.max.error.rc,'when update recorder, the field value is not match max')
    //12. format check: match format/min.max
    value={optionalField1:{value:99}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,0,'when update recorder, the field value  match format/min/max')

    //13. create: 检查maxLength属性
    value={mandatoryField1:{value:'12345678901'}}
    result=funcCreate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.mandatoryField1.rc,rule.mandatoryField1.maxLength.error.rc,'when create new recorder, the field value length exceed maxLength')
    //14. create: 检查minLength属性
    value={mandatoryField1:{value:'1'}}
    result=funcCreate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.mandatoryField1.rc,rule.mandatoryField1.minLength.error.rc,'when create new recorder, the field value length exceed minLength')

    //15. update: not enum
    value={enumField:{value:'any'}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.enumField.rc,rule.enumField.enum.error.rc,'when update new recorder, the field value is not enum')
    //16. update: is enum
    value={enumField:{value:'male'}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.enumField.rc,0,'when update new recorder, the field value is enum')

    test.done()
}



/*                  searchParams check              */
var validateSearchParamsValue=function(test){

    let func=testModule.validateSearchParamsValue
    //let error=miscError.misc.validateInputSearchValue
    let rules=require('../../server/define/validateRule/inputRule').inputRule
    let coll=require('../../server/define/enum/node').coll
    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value,result,tmp
    rules.billType.age={}
    rules.billType.age['type']=dataType.int
    rules.billType.age['max']={define:100,error:{rc:10002},mongoError:{rc:20002,msg:'年龄不能超过100'}}
    rules.billType.age['min']={define:18,error:{rc:10004},mongoError:{rc:20004,msg:'年龄不能小于100'}}

    rules.billType.test={}
    rules.billType.test['type']='test'

    rules.billType.formatField={
        chineseName:'可选字段1',
        'require': {define: false, error: {rc: 10025},mongoError:{rc:20025,msg:'可选字段1不能为空'}},
        type:dataType.int,
        'min':{define:1,error:{rc:10026},mongoError:{rc:20026,msg:'可选字段1名至少2个字符'}},
        'max':{define:100,error:{rc:10027},mongoError:{rc:20027,msg:'可选字段1名最多20个字符'}},
        format:{define:regex.pageNum,error:{rc:10028},mongoError:{rc:20028,msg:'页数必须由1-4个数字组成'}}
    }
    //console.log(`test rule is ${JSON.stringify(rules.billType.age.type.toString())}`)
    let fkAdditionalFieldsConfig=
    {
        //冗余字段（nested）的名称：具体冗余那几个字段
        //parentBillType:此字段为外键，需要冗余字段
        //relatedColl：外键对应的coll
        //nestedPrefix： 冗余字段一般放在nested结构中
        //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
        parentBillType:{relatedColl:coll.billType,nestedPrefix:'parentBillTypeFields',forSelect:'name age',forSetValue:['name','age']}
    }

    test.expect(11)





    //4, search value is empty, delete, and return rc:0
    value={'age':[{value:null}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`value is ${JSON.stringify(value)}`)
    // console.log(`result  is ${JSON.stringify(result)}`)
    test.equal(result.age.rc,0,'search input value is empty, directly delete')

    //5, fk search value is empty, delete, and return rc:0
    value={'parentBillType':{name:[{value:null}]}}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`value is ${JSON.stringify(value)}`)
    // console.log(`result  is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.name.rc,0,'fk search input value is empty, directly delete')

    //6, search value exceed maxLength, delete, and return rc:0
    value={'name':[{value:'012345678901234567890012'}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`value is ${JSON.stringify(value)}`)
    // console.log(`result  is ${JSON.stringify(result)}`)
    test.equal(result.name.rc,0,'search input value exceed maxLength, directly delete')

    //7, fk search value exceed maxLength, delete, and return rc:0
    value={'parentBillType':{name:[{value:'012345678901234567890012'}]}}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`value is ${JSON.stringify(value)}`)
    // console.log(`result  is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.name.rc,0,'fk search input value exceed maxLength, directly delete')

    //8. unkonwn dataType
    value={'test':[{value:'a'}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.test.rc,validateHelperError.unknownDataType.rc,'search input unknown type  check fail')

    //9. dataType wrong
    value={'age':[{value:'a'}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.age.rc,validateValueError.STypeWrong.rc,'search input value type check fail')

    //10. format check wrong
    value={'formatField':[{value:12345}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.formatField.rc,rules.billType.formatField.format.error.rc,'search input value format check fail')

    //11. enum check
    value={'inOut':[{value:'notEnum'}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.inOut.rc,rules.billType.inOut.enum.error.rc,'search input value enum check fail')

  //12. minLength不检查
    value={'parentBillType':{
        name:[{value:'a'}]
    }}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.name.rc,0,'search input value parentBillType minLength check fail')



    //13. min不再检查
    value={'parentBillType':{
        name:[{value:'a'}],
        age:[{value:101,compOp:'gt'}]
    }}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.age.rc,0,'search input value parentBillType age 101 check fail')
    //14. max不再检查
    value={'parentBillType':{
        name:[{value:'a'}],
        age:[{value:1,compOp:'gt'}]
    }}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.age.rc,0,'search input value parentBillType age 1 check fail')

    test.done()
}

function validateFilterFieldValue(test){
    let func=testModule.validateFilterFieldValue
    let rules=require('../../server/define/validateRule/inputRule').inputRule
    let fkConfig=
        {bill:{
        billType:{relatedColl:'billType',nestedPrefix:'billTypeFields',forSelect:'name inOut',forSetValue:['name','inOut']},
        reimburser:{relatedColl:'employee',nestedPrefix:'reimburserFields',forSelect:'name',forSetValue:['name']},

    }}

    let value,result,collName='billType'
    test.expect(4)
    //1 普通字段，字符，超出maxLength
    value={name:'123456789012345687901234567890123456879012345678901234568790'}
    result=func(value,fkConfig.bill,collName,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateValueError.filterFieldValueOutRange.rc,'filter field value exceed maxLength check fail')

    //2 普通字段type不对(因为和searchParams复用一个函数检测，所以返回值是STypeWrong)
    value={name:1}
    result=func(value,fkConfig.bill,collName,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateValueError.STypeWrong.rc,'filter field value exceed maxLength check fail')

//3 外键字段，字符，超出maxLength
    value={billType:{name:'123456789012345687901234567890123456879012345678901234568790'}}
    result=func(value,fkConfig.bill,collName,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateValueError.filterFieldValueOutRange.rc,'filter field value exceed maxLength check fail')

        //4 外键字段type不对(因为和searchParams复用一个函数检测，所以返回值是STypeWrong)
     value={billType:{name:1}}
     result=func(value,fkConfig.bill,collName,rules)
     // console.log(`result is ${JSON.stringify(result)}`)
     test.equal(result.rc,validateValueError.STypeWrong.rc,'filter field value exceed maxLength check fail')

    test.done()
}
module.exports={
    // validateCreateRecorderValue, //完成公共部分，单个value的验证交给validateSingleRecorderFieldValue
    // validateRecorderId, //因为结构简单，所有公共部分和实际单个value的验证一起完成
    // validateSingleRecorderFieldValue,   // 单个value的验证，但是必须通过validateCreateRecorderValue调用
    // validateSearchParamsValue,  //检测所有的searchParams，validateStaticSearchParamsValue+validateCurrentCollValue+validateCurrentPageValue
    validateFilterFieldValue,//part: filterFieldValue检测
}