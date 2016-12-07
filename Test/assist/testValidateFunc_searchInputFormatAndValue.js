/**
 * Created by wzhan039 on 2016-11-10.
 * 只测试search 的format和value函数
 */
var testModule=require('../../server/assist/validateFunc').func;
var miscError=require('../../server/define/error/nodeError').nodeError.assistError
//var validateInputFormatError=
/*          for generateRandomString test       */
var regex=require('../../server/define/regex/regex').regex
var dataType=require('../../server/define/enum/validEnum').enum.dataType

/*              检查搜索参数              */
/*
    {
    name:[{value:‘name1'},{value:'name2'}]
    age:[{value:18,op:'gt'},{value:20,op:”eq”}]
    parentBillType:
    {
        parentName:[{value:'asdf'},{value:'fda'}],
        parentAmount:[{value:12, compOp:'gt'}, {value:24, compOp:'lt'}]
    }
}*/
var validateInputSearchFormat=function(test) {
    //test.expect(1)
    test.expect(9)

    let func = testModule.validateInputSearchFormat
    let error = miscError.validateFunc.validateInputSearchFormat
    let rules = require('../../server/define/validateRule/inputRule').inputRule
    let coll = require('../../server/define/enum/node').node.coll
    rules.billType.age = {}
    rules.billType.age['type'] = dataType.number
    //console.log(`test rule is ${JSON.stringify(rules.billType.age.type.toString())}`)
    let fkAdditionalFieldsConfig =
    {
        //冗余字段（nested）的名称：具体冗余那几个字段
        //parentBillType:此字段为外键，需要冗余字段
        //relatedColl：外键对应的coll
        //nestedPrefix： 冗余字段一般放在nested结构中
        //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
        parentBillType: {
            relatedColl: coll.billType,
            nestedPrefix: 'parentBillTypeFields',
            forSelect: 'name age',
            forSetValue: ['name', 'age']
        }
    }
    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value, result, tmp

    /*                必须是对象                  */
    value = '1234'
    result = func(value, fkAdditionalFieldsConfig, coll.billType, rules)
    //console.log(result)
    test.equal(result.rc, error.inputSearchNotObject.rc, 'search input is string check fail')

    value = ['1234']
    result = func(value, fkAdditionalFieldsConfig, coll.billType, rules)
    //console.log(result)
    test.equal(result.rc, error.inputSearchNotObject.rc, 'search input is array check fail')


    /*              对象不能为空                  */
    value = {}
    result = func(value, fkAdditionalFieldsConfig, coll.billType, rules)
    //console.log(result)
    test.equal(result.rc, error.inputSearchCanNotEmpty.rc, 'search input is {} check fail')


    /*              对象的key必须在rule中定义           */
    value = {'notExistField': ['a']}
    result = func(value, fkAdditionalFieldsConfig, coll.billType, rules)
    //console.log(result)
    test.equal(result.rc, error.inputSearchNoRelatedRule.rc, 'search input value key not exist check fail')
    /*              字段的值不能为空           */
    value = {'name': null}
    result = func(value, fkAdditionalFieldsConfig, coll.billType, rules)
    //console.log(result)
    test.equal(result.rc, error.inputSearchValueCanNotEmpty.rc, 'search input value filed value empty check fail')

    /*              外键的冗余字段必须是对象           */
    value={'parentBillType':1}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchFKFiledValueNotObject.rc,'search input value FK key not object check fail')
    /*              外键的冗余字段必须在rule中定义           */
    value={'parentBillType':{'notExistFiled':1}}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchFKNoRelatedRule.rc,'search input value FK key not exist check fail')
    /*              外键的冗余字段不能为空           */
    value={'parentBillType':{'notExistFiled':1}}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,error.inputSearchFKNoRelatedRule.rc,'search input value FK key not exist check fail')


    /*          正确的值（当前函数+子函数subvalidateInputSearchFormat）          */
    value={
        name:[{value:'zw'},{value:'zw1'},{value:'zw2'}],
        parentBillType:{
            name:[{value:'zw'}],
            age:[{value:12,compOp:'gt'}]
        }
    }
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,'search input value success check fail')


    test.done()
}

var subValidateInputSearchFormat=function(test){
    test.expect(14)

    let func = testModule.subValidateInputSearchFormat
    let error = miscError.validateFunc.validateInputSearchFormat
    let rules = require('../../server/define/validateRule/inputRule').inputRule
    let coll = require('../../server/define/enum/node').node.coll
    rules.billType.age = {}
    rules.billType.age['type'] = dataType.number
    //console.log(`test rule is ${JSON.stringify(rules.billType.age.type.toString())}`)
    let fkAdditionalFieldsConfig =
    {
        //冗余字段（nested）的名称：具体冗余那几个字段
        //parentBillType:此字段为外键，需要冗余字段
        //relatedColl：外键对应的coll
        //nestedPrefix： 冗余字段一般放在nested结构中
        //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
        parentBillType: {
            relatedColl: coll.billType,
            nestedPrefix: 'parentBillTypeFields',
            forSelect: 'name age',
            forSetValue: ['name', 'age']
        }
    }
    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value, result, tmp




    /*              对象的value必须是数组           */
    value={name:'1234'}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,error.inputSearchValueMustBeArray.rc,'field value is string check fail')
    value={name:null}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,error.inputSearchValueMustBeArray.rc,'field value is null check fail')

    /*              对象的value必须是非空数组           */

    value={name:[]}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,error.inputSearchValueCanNotEmpty.rc,'field value is [] check fail')

    /*              对象的value为数组，且长度不能超过预定值           */
    value={name:[1,2,3,4,5,6]}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,error.inputSearchValueLengthExceed.rc,'search input value is [1,2,3,4,5,6] check fail')

    /*              对象的value的元素为对象           */
    value={name:[1]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,error.inputSearchValueElementMustBeObject.rc,'search input value has non object element check fail')
    value={name:['']}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,error.inputSearchValueElementMustBeObject.rc,'search input value has "" element check fail')
    value={name:[null]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,error.inputSearchValueElementMustBeObject.rc,'search input value has null element check fail')
    /*              对象的value的元素为对象，且key的数量不超过2           */
    value={name:[{key1:1,key2:2,key3:3}]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,error.inputSearchValueElementKeysLengthExceed.rc,'search input value element key num exceed 2 check fail')


    /*              必须包含value这个key                                        */
    value={name:[{'notExistKey':'zw'}]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,error.inputSearchValueElementNeedKeyValue.rc,'search input value element key must contain key value check fail')



    /*              类型为数字或者日期的字段，必须有compOp                      */
    value={age:[{value:12}]}
    console.log(JSON.stringify(rules.billType.age))
    result=func(value.age,rules.billType.age)
    test.equal(result.rc,error.inputSearchValueElementNeedCompOp.rc,'search input value is int not compOp check fail')

    value={age:[{'value':12,'compOp':'notExist'}]}
    result=func(value.age,rules.billType.age)
    test.equal(result.rc,error.inputSearchValueElementCompOpWrong.rc,'search input value is int with wrong compOp check fail')



    //成功的输入
    value={
        name:[{value:'zw'},{value:'zw1'},{value:'zw2'}],
        parentBillType:{
            name:[{value:'zw'}],
            age:[{value:12,compOp:'gt'}]
        }
    }
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,0,'search input value success:name check fail')
    result=func(value.parentBillType.name,rules.billType.name)
    test.equal(result.rc,0,'search input value success:parentBillType.name check fail')
    result=func(value.parentBillType.age,rules.billType.age)
    test.equal(result.rc,0,'search input value success:parentBillType.age check fail')

    test.done()
}

//validateInputSearchValue在validateFunc中分成3个函数处理，但是在test时候，只用一个函数，因为3个函数中的前2个只是对结构进行拆分，第3个才是正式处理
var validateInputSearchValue=function(test){

    let func=testModule.validateInputSearchValue
    let error=miscError.misc.validateInputSearchValue
    let rules=require('../../server/define/validateRule/inputRule').inputRule
    let coll=require('../../server/define/enum/node').node.coll
    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value,result,tmp
    rules.billType.age={}
    rules.billType.age['type']=dataType.int
    rules.billType.age['max']={define:100,error:{rc:10002},mongoError:{rc:20002,msg:'年龄不能超过100'}}
    rules.billType.age['min']={define:18,error:{rc:10004},mongoError:{rc:20004,msg:'年龄不能小于100'}}
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

    test.expect(6)


    value={'name':[{value:'a'}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
     //console.log(result)
    //字符串最小长度不检查
    test.equal(result.name.rc,0,'search input value name a check fail')

    value={'name':[{value:'a1234567890a1234567890a1234567890a1234567890a1234567890a1234567890'}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.name.rc,rules.billType.name.maxLength.error.rc,'search input value name long check fail')

    //console.log(`rules is ${JSON.stringify(rules['billType'])}`)
    value={'parentBillType':{
        name:[{value:'a'}]
    }}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.name.rc,0,'search input value parentBillType a check fail')

    value={'parentBillType':{
        name:[{value:'a1234567890a1234567890a1234567890a1234567890a1234567890a1234567890'}]
    }}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.parentBillType.name.rc,rules.billType.name.maxLength.error.rc,'search input value parentBillType long check fail')


    value={'parentBillType':{
        name:[{value:'a'}],
        age:[{value:101,compOp:'gt'}]
    }}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.age.rc,rules.billType.age.max.error.rc,'search input value parentBillType age 101 check fail')
    value={'parentBillType':{
        name:[{value:'a'}],
        age:[{value:1,compOp:'gt'}]
    }}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.age.rc,rules.billType.age.min.error.rc,'search input value parentBillType age 1 check fail')
    test.done()
}

function genNativeSearchCondition(test){
    let func=testModule.genNativeSearchCondition
    let error=miscError.misc.validateInputSearchValue
    let rules=require('../../server/define/validateRule/inputRule').inputRule
    let coll=require('../../server/define/enum/node').node.coll
    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value,result,tmp
    rules.billType.age={}
    rules.billType.age['type']=dataType.int
    rules.billType.age['max']={define:100,error:{rc:10002},mongoError:{rc:20002,msg:'年龄不能超过100'}}
    rules.billType.age['min']={define:18,error:{rc:10004},mongoError:{rc:20004,msg:'年龄不能小于100'}}
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
    
    test.expect(1)

    //console.log(`${JSON.stringify(rules['billType'])}`)
    value={
        name:[{value:'name1'},{value:'name2'}],
        age:[{value:18,'compOp':'gt'},{value:20,'compOp':'eq'}],
        parentBillType:
        {
            name:[{value:'asdf'},{value:'fda'}],
            age:[{value:12, 'compOp':'gt'}, {value:24, 'compOp':'lt'}]
        }
    }
    result=func(value,coll.billType,fkAdditionalFieldsConfig,rules)
    console.log(`${JSON.stringify(result)}`)

    test.equal(result,0,'gen native condition check fail')
    
    test.done()
}

module.exports={
    ///*           格式检查             */
    ////主函数
    //validateInputSearchFormat,
    ////子函数
    //subValidateInputSearchFormat,
    //
    ///*           值检查            */
    ////虽有3函数，但是2个是格式拆封，最后一个才进行检查
    // validateInputSearchValue,
    //
    /*          根据输入生成mongodb native查询值   */
    genNativeSearchCondition,
}