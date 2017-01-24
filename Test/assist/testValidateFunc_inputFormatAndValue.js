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
var dataType=require('../../server/define/enum/validEnum').enum.dataType


/***************************************************************************/
/***************               validateInput                *******************/
/***************************************************************************/
var validateInputFormat=function(test){
    let func=testModule.validateInputFormat
    let value,rules,result
    let maxFieldNum=5
    test.expect(9)
    rules={field1:{}}//只是为了检测是否有对应的rule存在

    //1 输入的参数没有定义
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,validateFormatError.valueNotDefine.rc,'value undefined check fail')
    value=null
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,validateFormatError.valueNotDefine.rc,'value null check fail')

    //2 必须为object
    value=[]
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,validateFormatError.inputValuesTypeWrong.rc,'value [] check fail')

    //3 不能为空对象
    value={}
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,validateFormatError.valueEmpty.rc,'value {} check fail')

    //4. 键值对数量不能超出预订数量
    value={a:1,b:2,c:3,d:4,e:5,f:6}
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,validateFormatError.inputValueFieldNumExceed.rc,'value key num check fail')

    //5. 键值对的格式为key:{value:'val1'}
    value={a:1}
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,validateFormatError.inputValuesFormatWrong.rc,'value miss value check fail')
    value={a:{value:undefined}}
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,validateFormatError.inputValuesFormatWrong.rc,'value key value is undefined check fail')
    //null值表示update的时候，要删除这个field
/*    value={a:{value:null}}
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,validateFormatError.valueNotDefineWithRequireTrue.rc,'value key value is undefined check fail')*/

    //6. 键必须在rule中定义
    value={'notDefinedInRule':{value:''}}
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,validateFormatError.valueRelatedRuleNotDefine.rc,'field not define in rule check fail')

/*    //7. 重复key（无法测试，因为重复key会报错）
    value={'field1':{value:''},'field1':{value:''}}
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,validateFormatError.inputValueHasDuplicateField.rc,'duplicated key check fail')*/


    value={'field1':{value:''}}
    result=func(value,rules,maxFieldNum)
    test.equal(result.rc,0,'correct value check fail')

    test.done()
}






exports.validate={

    validateInputFormat,
    validateInputValue,
    checkInputAdditional,
}