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

var validateInputSearchFormat=function(test){

    test.expect(19)

    let func=testModule.validateInputSearchFormat
    let error=miscError.validateFunc.validateInputSearchFormat
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

    let func=testModule.validateInputSearch
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

    value={'parentBillType':[{name:'a'}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.rc,rules.billType.name.minLength.error.rc,'search input value parentBillType a check fail')

    value={'parentBillType':[{name:'a1234567890a1234567890a1234567890a1234567890a1234567890a1234567890'}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    test.equal(result.parentBillType.rc,rules.billType.name.maxLength.error.rc,'search input value parentBillType long check fail')

    test.done()
}

module.exports={
    validateInputSearchFormat,
    validateInputSearch,
}