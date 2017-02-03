/**
 * Created by wzhan039 on 2016-11-10.
 * 只测试search 的format和value函数
 */
var testModule=require('../../server/assist/not_used_validateFunc').func;
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

}



//validateInputSearchValue在validateFunc中分成3个函数处理，但是在test时候，只用一个函数，因为3个函数中的前2个只是对结构进行拆分，第3个才是正式处理


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