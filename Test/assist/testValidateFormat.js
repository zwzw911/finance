/**
 * Created by wzhan039 on 2016-11-10.
 * 检测validateFunc中对input的format和value函数进行测试
 */
'use strict'
/*require("babel-polyfill");
 require("babel-core/register")*/
var testModule=require('../../server/assist/validateInput/validateFormat');
var validateFormatError=require('../../server/define/error/node/validateError').validateError.validateFormat
/*          for generateRandomString test       */
var regex=require('../../server/define/regex/regex').regex
var dataType=require('../../server/define/enum/validEnum').dataType
var validatePart=require('../../server/define/enum/validEnum').validatePart
/***************************************************************************/
/***************   validatePartFormat   *******************/
/***************************************************************************/
var validatePartFormat=function(test){
    let func=testModule.validatePartFormat
    let inputValue,result,exceptPart
    test.expect(12)

    //1. inputValue is not object
    inputValue=[]
    exceptPart=[]
    result=func(inputValue,exceptPart)
    test.equal(result.rc,validateFormatError.inputValuePartFormatWrong.rc,'inputValue must be object')
    inputValue=null
    exceptPart=[]
    result=func(inputValue,exceptPart)
    test.equal(result.rc,validateFormatError.inputValuePartFormatWrong.rc,'inputValue must be object')

    //3 inputValue part exceed ecxeptPart
    inputValue={'unkonwnPart1':{},'unkonwnPart2':{}}
    exceptPart=[exceptPart.currentPage]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartNumNotExcepted.rc,'part number exceed exceptPart')

    //4 undefined part
    inputValue={'unkonwnPart':{}}
    exceptPart=['unkonwnPart']
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartNotExcepted.rc,'unknown part')

    //5. inputValue has part not define in exceptPart
    inputValue={'currentColl':"test"}
    exceptPart=[validatePart.currentPage]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartMiss.rc,'miss part define in exceptPart')


    //6. currentColl必须是string
    inputValue={'currentColl':1}
    exceptPart=[validatePart.currentColl]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartCurrentCollValueFormatWrong.rc,'currentColl part value is not string')
    //7. currentPage必须是整数
    inputValue={'currentPage':1.1}
    exceptPart=[validatePart.currentPage]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartCurrentPageValueFormatWrong.rc,'currentPage part value is not int')
    //8. recorderId必须是字符
    inputValue={'recorderId':1.1}
    exceptPart=[validatePart.recorderId]
    result=func(inputValue,exceptPart)
    console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartRecorderIdValueFormatWrong.rc,'recorderId part value is not string')
    //9. recorderId必须是字符
    inputValue={'recorderId':'asdf'}
    exceptPart=[validatePart.recorderId]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,'recorderId part value is not string')

    //10. recorderInfo必须是object
    inputValue={'recorderInfo':1.1}
    exceptPart=[validatePart.recorderInfo]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartRecorderInfoValueFormatWrong.rc,'recorderInfo part value is not object')
    //11. searchParams必须是object
    inputValue={'searchParams':1}
    exceptPart=[validatePart.searchParams]
    result=func(inputValue,exceptPart)
    // console.log(`result searchParams is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartSearchParamsValueFormatWrong.rc,'searchParams part value is not object')


    //12. all part correct
    inputValue={'currentColl':'coll',currentPage:1,'recorderInfo':{},'searchParams':{}}
    exceptPart=[validatePart.currentColl,validatePart.currentPage,validatePart.recorderInfo,validatePart.searchParams]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,'all 4 part check fail')


    test.done()
}

/*/!***************************************************************************!/
/!***************   validateCreateUpdateInputFormat   *******************!/
/!***************************************************************************!/
var validateCreateUpdateInputFormat=function(test){
    let func=testModule.validateCUDInputFormat
    let values,result
    test.expect(7)

    values=null
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartFormatWrong.rc,'values must be object')
    values=[]
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartFormatWrong.rc,'values must be object')

    values={currentPage:1,currentColl:'test'}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartMiss.rc,'values must contain recorderInfo')

    values={'recorderInfo':null,currentPage:1}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartRecorderInfoValueFormatWrong.rc,' recorderInfo must be object')

    values={'recorderInfo':{},currentColl:'tret'}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartMiss.rc,'values must contain currentPage')

    values={'recorderInfo':{},'currentPage':'test'}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartCurrentPageValueFormatWrong.rc,'currentPage must be int')

    values={'recorderInfo':{},'currentPage':1}
    result=func(values)
    test.equal(result.rc,0)

    test.done()
}*/
/***************************************************************************/
/***************  validateRecorderInfoFormat   *******************/
/***************************************************************************/
var validateRecorderInfoFormat=function(test){
    let func=testModule.validateCURecorderInfoFormat
    let value,rules,result

    //标号5，实际5（dup key无法测试）
    test.expect(8)

    rules={field1:{}}//只是为了检测是否有对应的rule存在

    //1. create/update的时候，输入值没有任何字段
     value={}
     result=func(value,rules)
     // console.log(`resul is ${JSON.stringify(result)}`)
     test.equal(result.rc,validateFormatError.recorderInfoCantEmpty.rc,'create/update recorder, inputValue fields in empty')

    //2 value的field数量超过rule定义的field数量
    rules={name:{}}
    value={name:{value:'a'},age:{value:10}}
    result=func(value,rules)
    test.equal(result.rc,validateFormatError.recorderInfoFieldNumExceed.rc,"value fields number exceed rule fields number")

    //3. 重复key无法测试
    //3. value中字段没有在rule中定义
    rules={name:{}}
    value={age:{value:10}}
    result=func(value,rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.recorderInfoFiledRuleNotDefine.rc,"value field not defined in  rule")


    //4. 键值不是对象
    rules={field1:{}}
    value={field1:1}
    result=func(value,rules)
    test.equal(result.rc,validateFormatError.recorderInfoFormatWrong.rc,'recorder field value should be object')
    //5. 键值为空对象
    rules={field1:{}}
    value={field1:{}}
    result=func(value,rules)
    test.equal(result.rc,validateFormatError.recorderInfoFieldValueFiledNumNot1.rc,'recorder field value should be object, and only contain 1 key')

    //6. 键值包含多余field
    rules={field1:{}}
    value={field1:{value:1,'anyKey':2}}
    result=func(value,rules)
    test.equal(result.rc,validateFormatError.recorderInfoFieldValueFiledNumNot1.rc,'recorder field value should be object, and only contain 1 key')

    //7. 键值的field不是value
    rules={field1:{}}
    value={field1:{'anyKey':2}}
    result=func(value,rules)
    test.equal(result.rc,validateFormatError.recorderInfoFieldValueFiledWrong.rc,'recorder field value should be object, and only contain value')


    //8. corrent case
    rules={field1:{}}
    value={'field1':{value:''}}
    result=func(value,rules)
    test.equal(result.rc,0,'correct value check fail')

    test.done()
}

/*                  filterFieldValue    {field1:keyword} or {billType:{name:keyword}}              */
//
var validateFilterFieldValueFormat=function (test){
    let func=testModule.validateFilterFieldValueFormat
    let value,rules,fkConfig,result
    rules={
            name:{},
            age:{}
    }
    fkConfig={
            name:{forSetValue:['fkName']}
    }

    test.expect(12)

    //1 value必须是object
    value=[]
    result=func(value,fkConfig,rules)
    test.equal(result.rc,validateFormatError.filterFieldValueNotObject.rc,"filter field value must be object")

    //2 value的field数量不为1
     value={name:{value:'a'},age:{value:10}}
     result=func(value,fkConfig,rules)
     test.equal(result.rc,validateFormatError.filterFieldValueFieldNumNot1.rc,"filter field value fields number not 1")

    //3 value的field数量不为1
    value={}
    result=func(value)
    test.equal(result.rc,validateFormatError.filterFieldValueFieldNumNot1.rc,"filter field value fields number not 1")

     //4 key未在rule中定义
     value={id:{value:10}}
     result=func(value,fkConfig,rules)
     // console.log(`error0 is ${JSON.stringify(result)}`)
     test.equal(result.rc,validateFormatError.filterFieldValueFieldNotInRule.rc,"field defined in rule")

    //5  value必须是字符数字，对象
    value={name:[]}
    result=func(value,fkConfig,rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.filterFieldValueTypeWrong.rc," field  value should be number/string/object")
    //6  value必须是字符数字，对象
    value={name:null}
    result=func(value,fkConfig,rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.filterFieldValueTypeWrong.rc," field  value should be number/string/object")
    //7  value必须是字符数字，对象
    value={name:1}
    result=func(value,fkConfig,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0," field  value should be number/string/object")

    //8 fk field未在forSetValue中
    value={name:{'any':1}}
    result=func(value,fkConfig,rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.filterFieldValueFKFieldNoRelateField.rc," field fk field not in forSetValue")

    //9 value是object，但其中key未在fkConfig中定义
    value={age:{'any':1}}
    result=func(value,fkConfig,rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.filterFieldValueFKFieldNotFK.rc," non fk field with value object")

    //10 fk的value是object，只能包含一个key
    value={name:{fkName:1,fkName2:2}}
    result=func(value,fkConfig,rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.filterFieldValueFKFieldNumNot1.rc," fk value only contain 1 field")

    //11 id或者_id的值只能包含一个key，且名称为value
    value={name:{fkName:{}}}
    result=func(value,fkConfig,rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.filterFieldValueTypeWrong.rc," fk field value must be number/string")

    //12 正确格式
    value={name:{fkName:1}}
    result=func(value,fkConfig,rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,0," correct format")


    test.done()
}

/*/!***************************************************************************!/
/!***************   validateSearchInputFormat
 * 当search的是或，验证输入的整体格式（是否包含seachParams/currentpage等）*******************!/
/!***************************************************************************!/
var validateSearchInputFormat=function(test){
    let func=testModule.validateSearchInputFormat
    let values,result
    test.expect(8)

    //1. 输入必须是object
    values=null
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartFormatWrong.rc,'values must be object')
    //2. 输入必须是object
    values=[]
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartFormatWrong.rc,'values must be object')

    //3.输入必须的object的key数量必须和exceptParts一致（2个：searchparams和currentpage）
    values={}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartNumNotExcepted.rc,'values must contain 2 keys')

    //4.输入必须的object的key数量必须和exceptParts一致（2个：searchparams和currentpage）
    values={'any1':null,'any2':"null",'any3':null}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartNumNotExcepted.rc,'values must contain 2 keys')

    //5 未定义字段
    values={'searchParams':{},'any':null}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartMiss.rc,' any not expect part')

    //6. searchPamrs必须为object
    values={'searchParams':null,'currentPage':1}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartSearchParamsValueFormatWrong.rc,' SearchParams must be object')

    //7. currentPage必须是整数
    values={'searchParams':{},'currentPage':'test'}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartCurrentPageValueFormatWrong.rc,'currentPage must be int')

    //8 整体格式正常
    values={'searchParams':{},'currentPage':1}
    result=func(values)
    test.equal(result.rc,0)

    test.done()
}*/

/***************************************************************************/
/***************  part: earchParamsFormat   *******************/
/***************************************************************************/
var validateSearchParamsFormat=function(test){
    test.expect(9)

    let func = testModule.validateSearchParamsFormat
    //let error = miscError.validateFunc.validateInputSearchFormat
    let rules = require('../../server/define/validateRule/inputRule').inputRule
    let coll = require('../../server/define/enum/node').coll
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

    /*    /!*                必须是对象  通过validateSearchInputFormat检测                *!/
     value = '1234'
     result = func(value, fkAdditionalFieldsConfig, coll.billType, rules)
     //console.log(result)
     test.equal(result.rc, validateFormatError.inputSearchNotObject.rc, 'search input is string check fail')

     value = ['1234']
     result = func(value, fkAdditionalFieldsConfig, coll.billType, rules)
     //console.log(result)
     test.equal(result.rc, validateFormatError.inputSearchNotObject.rc, 'search input is array check fail')


     /!*              对象不能为空   可以为空，选择所有记录               *!/
     value = {}
     result = func(value, fkAdditionalFieldsConfig, coll.billType, rules)
     //console.log(result)
     test.equal(result.rc, validateFormatError.inputSearchCanNotEmpty.rc, 'search input is {} check fail')*/

    //1, no any search fields
    value={}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,'search input field zero')

    //2, search field is not defined in rule
    value={'field1':[{value:1}],'field2':[{value:1}],'field3':[{value:1}],'field4':[{value:1}],'field5':[{value:1}],'field6':[{value:1}],'field7':[{value:1}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.searchParamsFieldsExceed.rc,'search input fields exceed')

    //3, search field is not defined in rule
    value={'undefined':[{value:1}]}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.searchParamsFieldNoRelatedRule.rc,'search input fields undefined')

    /*              对象的key必须在rule中定义           */
    value = {'notExistField': ['a']}
    result = func(value, fkAdditionalFieldsConfig, coll.billType, rules)
    //console.log(result)
    test.equal(result.rc, validateFormatError.searchParamsFieldNoRelatedRule.rc, 'search input value key not exist check fail')
    /*              字段的值不能为空           */
    value = {'name': null}
    result = func(value, fkAdditionalFieldsConfig, coll.billType, rules)
    //console.log(result)
    test.equal(result.rc, validateFormatError.searchParamsFiledValueCantEmpty.rc, 'search input value filed value empty check fail')

    /*              外键的冗余字段必须是对象           */
    value={'parentBillType':1}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,validateFormatError.searchParamsFKFiledValueNotObject.rc,'search input value FK key not object check fail')
    /*              外键的冗余字段必须在rule中定义           */
    value={'parentBillType':{'notExistFiled':1}}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,validateFormatError.searchParamsFKNoRelatedRule.rc,'search input value FK key not exist check fail')
    /*              外键的冗余字段不能为空           */
    value={'parentBillType':{'name':null}}
    result=func(value,fkAdditionalFieldsConfig,coll.billType,rules)
    //console.log(result)
    test.equal(result.rc,validateFormatError.searchParamsFKFiledValueCantEmpty.rc,'search input value FK key not exist check fail')


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

/***************************************************************************/
/***************   singleSearchParams   *******************/
/***************************************************************************/
var validateSingleSearchParamsFormat=function(test){
    test.expect(14)

    let func = testModule.validateSingleSearchParamsFormat
    //let error = miscError.validateFunc.validateInputSearchFormat
    let rules = require('../../server/define/validateRule/inputRule').inputRule
    let coll = require('../../server/define/enum/node').coll
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
    test.equal(result.rc,validateFormatError.singleSearchParamsValueMustBeArray.rc,'field value is string check fail')
    value={name:null}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,validateFormatError.singleSearchParamsValueMustBeArray.rc,'field value is null check fail')

    /*              对象的value必须是非空数组           */

    value={name:[]}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,validateFormatError.singleSearchParamsValueCantEmpty.rc,'field value is [] check fail')

    /*              对象的value为数组，且长度不能超过预定值           */
    value={name:[1,2,3,4,5,6]}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,validateFormatError.singleSearchParamsValueLengthExceed.rc,'search input value is [1,2,3,4,5,6] check fail')

    /*              对象的value的元素为对象           */
    value={name:[1]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementMustBeObject.rc,'search input value has non object element check fail')
    value={name:['']}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementMustBeObject.rc,'search input value has "" element check fail')
    value={name:[null]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementMustBeObject.rc,'search input value has null element check fail')
    /*              对象的value的元素为对象，且key的数量不超过2           */
    value={name:[{key1:1,key2:2,key3:3}]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementKeysLengthExceed.rc,'search input value element key num exceed 2 check fail')


    /*              必须包含value这个key                                        */
    value={name:[{'notExistKey':'zw'}]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementMissKeyValue.rc,'search input value element key must contain key value check fail')



    /*              类型为数字或者日期的字段，必须有compOp                      */
    value={age:[{value:12}]}
    console.log(JSON.stringify(rules.billType.age))
    result=func(value.age,rules.billType.age)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementMissKeyCompOp.rc,'search input value is int not compOp check fail')

    value={age:[{'value':12,'compOp':'notExist'}]}
    result=func(value.age,rules.billType.age)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementCompOpWrong.rc,'search input value is int with wrong compOp check fail')



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











var validateInputValue=function(test){
    let func=testModule.validateInputValue
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let rule,value,tmpDataType,result,tmp
    let error={rc:1234,msg:''}

    test.expect(17)

    //以下移动到checkInputDataValidate函数中
    /*    //1 检测inputValue是否为空
     rule={}
     value=null
     result=func(value,rule)
     test.equal(result.rc,validateFormatError.valueNotDefine.rc,'value null check fail')
     value=undefined
     result=func(value,rule)
     test.equal(result.rc,validateFormatError.valueNotDefine.rc,'value undefined check fail')*/

/*    //移动到validateInputFormat中
    //2 检查inputValue是否有未定义的字段
    rule={name:{}}
    value={'notExistField':{value:'a'}}
    result=func(value,rule)
    test.equal(result.notExistField.rc,validateFormatError.valueRelatedRuleNotDefine.rc,'not exist field check fail')*/


    //3.1 如果有id，检测id
    rule={name:{}}
    value={'_id':{value:null}}
    result=func(value,rule)
    test.equal(result._id.rc,validateFormatError.objectIdEmpty.rc,'field _id null check fail')
    value={'_id':{value:undefined}}
    result=func(value,rule)
    test.equal(result._id.rc,validateFormatError.objectIdEmpty.rc,'field _id undefined check fail')

    value={'_id':{value:{}}}
    result=func(value,rule)
    test.equal(result._id.rc,validateFormatError.objectIdWrong.rc,'field _id {} check fail')


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
    test.equal(result.name.rc,validateFormatError.valueNotDefineWithRequireTrue.rc,'require true, default empty and input empty, check fail')

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
    test.equal(result.name.rc,validateFormatError.typeWrong.rc,'wrong type, check fail')

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

    let func=testModule.validateInputValue
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
    test.equal(result._id.rc,validateFormatError.objectIdWrong.rc,'wrong _id check fail')
    value={
        id:{value:'57f8dc65a795ace017f36'},
    }
    result=func(value,rule)
    //console.log(result)
    test.equal(result.id.rc,validateFormatError.objectIdWrong.rc,'wrong id check fail')

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

exports.validate={
    validatePartFormat,
    validateRecorderInfoFormat, //create/update的时候的recorderInfo
    validateFilterFieldValueFormat,  //part：filterFieldValue，
    validateSingleSearchParamsFormat,
    validateSearchParamsFormat,

}