/**
 * Created by wzhan039 on 2016-07-07.
 */
'use strict'
/*require("babel-polyfill");
require("babel-core/register")*/
var testModule=require('../../server/assist/validateFunc').func;
var miscError=require('../../server/define/error/nodeError').nodeError.assistError
var validateInputFormatError=miscError.validateFunc.validateInputFormat
/*          for generateRandomString test       */
var regex=require('../../server/define/regex/regex').regex
var dataType=require('../../server/define/enum/validEnum').enum.dataType
//var randomStringTypeEnum=require('../../server/define/enum/node').node.randomStringType
var moment=require('moment')
/*          数据类型的检测         */
var dataTypeCheck=function(test){
    test.expect(55);

    let func=testModule.dataTypeCheck
    let result,value,tmp
    /*          isSetValue             */
    //undefined variant
    result=func.isSetValue(value)
    test.equal(result,false,'isSetValue: check undefined variant failed')
    //null variant
    value=null
    result=func.isSetValue(value)
    test.equal(result,false,'isSetValue: check null variant failed')
    /*          isEmpty             */
    /*    //not exist variant
     result=func.isEmpty(a)
     test.equal(result,true,'isEmpty: check not exist variant failed')*/

    //isEmpty
    value=''
    result=func.isEmpty(value)
    test.equal(result,true,'isEmpty: check empty string failed')
    value='     '
    result=func.isEmpty(value)
    test.equal(result,true,'isEmpty: check whitespace string failed')
    value=[]
    result=func.isEmpty(value)
    test.equal(result,true,'isEmpty: check empty array failed')
    value={}
    result=func.isEmpty(value)
    test.equal(result,true,'isEmpty: check empty object failed')
    value=[1]
    result=func.isEmpty(value)
    test.equal(result,false,'isEmpty: check not empty array failed')
    value={a:1}
    result=func.isEmpty(value)
    test.equal(result,false,'isEmpty: check not empty object failed')

    //isString
    value=''
    result=func.isString(value)
    test.equal(result,true,'isString: check blank string failed')
    value='   '
    result=func.isString(value)
    test.equal(result,true,'isString: check whitespace string failed')
    value=123
    result=func.isString(value)
    test.equal(result,false,'isString: check number failed')
    value=[]
    result=func.isString(value)
    test.equal(result,false,'isString: check array failed')
    value={}
    result=func.isString(value)
    test.equal(result,false,'isString: check object failed')
    value=null
    result=func.isString(value)
    test.equal(result,false,'isString: check null failed')
    value=undefined
    result=func.isString(value)
    test.equal(result,false,'isString: check undefined failed')
    //isArray
    value={}
    result=func.isArray(value)
    test.equal(result,false,'isArray: check not array failed')
    value=[]
    result=func.isArray(value)
    test.equal(result,true,'isArray: check array failed')
    value=[null]
    result=func.isArray(value)
    test.equal(result,true,'isArray: check [null] failed')
    value=[undefined]
    result=func.isArray(value)
    test.equal(result,true,'isArray: check [undefined] failed')
    value=null
    result=func.isArray(value)
    test.equal(result,false,'isArray: check null failed')
    value=undefined
    result=func.isArray(value)
    test.equal(result,false,'isArray: check undefined failed')

    //isObject
    value={}
    result=func.isObject(value)
    test.equal(result,true,'isObject: check object failed')
    value=[]    //array和object严格区分（js中，array是object）
    result=func.isObject(value)
    test.equal(result,false,'isObject: check object(array) failed')
    value=1
    result=func.isObject(value)
    test.equal(result,false,'isObject: check int 1 failed')
    value=null
    result=func.isObject(value)
    test.equal(result,false,'isObject: check null failed')
    value=undefined
    result=func.isObject(value)
    test.equal(result,false,'isObject: check undefined failed')


    //isDate
    value='2016'        //转换成2016-01-01
    result=func.isDate(value)
    test.equal(moment(result).format('YYYY-MM-DD HH:mm:ss'),'2016-01-01 08:00:00','isDate: check year only date failed')
    value='2016-02-30'              //toLocaleString会自动转换成合适的日期（2016-03-01 08:00:00，8点是CST）
    result=func.isDate(value)
    test.equal(moment(result).format('YYYY-MM-DD HH:mm:ss'),'2016-03-01 08:00:00','isDate: check invalid date failed')
    value='2016-02-02 25:30'
    result=func.isDate(value)
    test.equal(result,false,'isDate: check invalid time failed')
    value='2016-02-02 23:30'
    result=func.isDate(value)
    test.equal(moment(result).format('YYYY-MM-DD HH:mm:ss'),'2016-02-02 23:30:00','isDate: check valid time - failed')
    value='2016/02/02'
    result=func.isDate(value)
    test.equal(moment(result).format('YYYY-MM-DD HH:mm:ss'),'2016-02-02 00:00:00','isDate: check valid date / failed')
    //isInt
    value=123456789.0
    result=func.isInt(value)
    test.equal(result,123456789,'isInt: check int failed,number float with fraction 0 is int')
    value=123456789.1
    result=func.isInt(value)
    test.equal(result,false,'isInt: check int failed,number float with fraction not 0 is not int')
    value='123456789.0'
    result=func.isInt(value)
    test.equal(result,false,'isInt: check int failed,string float with fraction 0 not int')
    value='123456789.1'
    result=func.isInt(value)
    test.equal(result,false,'isInt: check int failed,string float  with fraction not 0 not int')
    value=123456789123456789123456789123456789123456789123456789
    result=func.isInt(value)
    test.equal(result,false,'isInt: check int failed,exceed maxim int')
    value=-123
    result=func.isInt(value)
    test.equal(result,-123,'isInt: check valid int failed')
    value='123.0'
    result=func.isInt(value)
    test.equal(result,false,'isInt: check int failed, value string is float')
    value='123a'
    result=func.isInt(value)
    test.equal(result,false,'isInt: check int failed, value contain not number char')
    value=[1]
    result=func.isInt(value)
    test.equal(result,false,'isInt: check int failed, value is arry')
    //isNumber
    value=123456789.0
    result=func.isNumber(value)
    test.equal(result,false,'isNumber: check number failed,float not number')
    value='123456789.0'
    result=func.isNumber(value)
    test.equal(result,false,'isNumber: check number failed,string is float')
    value=-123456789123456789123456789123456789123456789123456789
    result=func.isNumber(value)
    test.equal(result,false,'isNumber: check non string negative number failed')
    value='123456789123456789123456789123456789123456789123456789'
    result=func.isNumber(value)
    test.equal(result,true,'isNumber: check string positive number failed')
    value='-123456789123456789123456789123456789123456789123456789'
    result=func.isNumber(value)
    test.equal(result,true,'isNumber: check string negative number failed')
    //isFolat
    value=123456789.0
    result=func.isFloat(value)
    test.equal(result,123456789,'isFloat: check float failed')
    value='123456789.0'
    result=func.isFloat(value)
    test.equal(result,123456789,'isFloat: check string float failed')
    value='-0.123456789'
    result=func.isFloat(value)
    test.equal(result,-0.123456789,'isFloat: check negative string float failed')
    value='0.1.0'
    result=func.isFloat(value)
    test.equal(result,false,'isFloat: check invalid float failed')
    value=123456789123456789123456789123456789123456789123456789
    result=func.isFloat(value)
    test.equal(result,123456789123456789123456789123456789123456789123456789,'isFloat: check large number failed')
    value=-123456789123456789123456789123456789123456789123456789
    result=func.isFloat(value)
    test.equal(result,-123456789123456789123456789123456789123456789123456789,'isFloat: check large negative number failed')
    value=[1]
    result=func.isFloat(value)
    test.equal(result,false,'isFloat: check array failed')
    //isPositive
    value=-123456789123456789123456789123456789123456789123456789
    result=func.isPositive(value)
    test.equal(result,false,'isPositive: check large negative number failed')
    value='-0.1'
    result=func.isPositive(value)
    //console.log(result)
    test.equal(result,false,'isPositive: check invalid float failed')
    value='0.1'
    result=func.isPositive(value)
    test.equal(result,true,'isPositive: check valid float failed')

    test.done()
}

var valueMatchRuleDefineCheck=function(test){
    let func=testModule.valueMatchRuleDefineCheck
    test.expect(40)

    let value,result,tmp


    /*          exceedMaxLength         */
    value=123.0
    result=func.exceedMaxLength(value,2)
    test.equal(result,true,'exceedMaxLength: float(number) length exceed failed')
    value=123.0
    result=func.exceedMaxLength(value,5)
    test.equal(result,false,'exceedMaxLength: float(number) length failed')
    value=123
    result=func.exceedMaxLength(value,2)
    test.equal(result,true,'exceedMaxLength: int(number) length exceed failed')
    value=123
    result=func.exceedMaxLength(value,3)
    test.equal(result,false,'exceedMaxLength: int(number) length failed')
    value='123.0'
    result=func.exceedMaxLength(value,4)
    test.equal(result,true,'exceedMaxLength: float(string) length exceed failed')
    value='123.0'
    result=func.exceedMaxLength(value,5)
    test.equal(result,false,'exceedMaxLength: float(string) length failed')
    value=[1]
    result=func.exceedMaxLength(value,0)
    test.equal(result,true,'exceedMaxLength: array length exceed failed')
    value=[1]
    result=func.exceedMaxLength(value,1)
    test.equal(result,false,'exceedMaxLength: array length exceed failed')
    value={}
    result=func.exceedMaxLength(value,0)
    test.equal(result,false,'exceedMaxLength: object length failed')

    /*          exceedMinLength         */
    value=123.0
    result=func.exceedMinLength(value,4)
    test.equal(result,true,'exceedMinLength: float(number) length exceed failed')
    value=123.0
    result=func.exceedMinLength(value,2)
    test.equal(result,false,'exceedMinLength: float(number) length failed')
    value=123
    result=func.exceedMinLength(value,4)
    test.equal(result,true,'exceedMinLength: int(number) length exceed failed')
    value=123
    result=func.exceedMinLength(value,3)
    test.equal(result,false,'exceedMinLength: int(number) length failed')
    value='123.0'
    result=func.exceedMinLength(value,6)
    test.equal(result,true,'exceedMinLength: float(string) length exceed failed')
    value='123.0'
    result=func.exceedMinLength(value,5)
    test.equal(result,false,'exceedMinLength: float(string) length failed')
    value=[1]
    result=func.exceedMinLength(value,2)
    test.equal(result,true,'exceedMinLength: array length exceed failed')
    value=[1]
    result=func.exceedMinLength(value,1)
    test.equal(result,false,'exceedMinLength: array length exceed failed')
    value={}
    result=func.exceedMinLength(value,0)
    test.equal(result,false,'exceedMinLength: object length failed')

    /*          exactLength         */
    value=123.0
    result=func.exactLength(value,3)    //js自动去掉小数点为0的位数（123.0实际为123）
    test.equal(result,true,'exactLength: float(number) length exact failed')
    value=123.0
    result=func.exactLength(value,6)
    test.equal(result,false,'exactLength: float(number) length failed')
    value=123
    result=func.exactLength(value,3)
    test.equal(result,true,'exactLength: int(number) length exact failed')
    value=123
    result=func.exactLength(value,4)
    test.equal(result,false,'exactLength: int(number) length failed')
    value='123.0'
    result=func.exactLength(value,5)
    test.equal(result,true,'exactLength: float(string) length exact failed')
    value='123.0'
    result=func.exactLength(value,4)
    test.equal(result,false,'exactLength: float(string) length failed')
    value=[1]
    result=func.exactLength(value,1)
    test.equal(result,true,'exactLength: array length exact failed')
    value=[1]
    result=func.exactLength(value,0)
    test.equal(result,false,'exactLength: array length exact failed')
    value={}
    result=func.exactLength(value,0)
    test.equal(result,false,'exactLength: object length failed')

    /*          equalTo         */
    value=null
    result=func.equalTo(value,null)
    test.equal(result,true,'equalTo: null equal failed')
    value=undefined
    result=func.equalTo(value,undefined)
    test.equal(result,true,'equalTo: undefined equal failed')
    value={a:1}
    result=func.equalTo(value,{a:1})
    test.equal(result,false,'equalTo: object equal failed')
    value={a:1}
    tmp=value
    result=func.equalTo(value,tmp)
    test.equal(result,true,'equalTo: object reference equal failed')
    value=new Date('2016-02-02')
    tmp=new Date('2016-02-02')
    result=func.equalTo(value,tmp)
    test.equal(result,true,'equalTo: date equal failed')

    /*          exceedMax           */
    value=1234.0
    result=func.exceedMax(value,1235)
    test.equal(result,false,'exceedMax: exceedMax failed')
    value=1236.0
    result=func.exceedMax(value,1235)
    test.equal(result,true,'exceedMax: exceedMax failed')

    /*          exceedMin           */
    value=1234.0
    result=func.exceedMin(value,1235)
    test.equal(result,true,'exceedMin: exceedMin failed')
    value=1236.0
    result=func.exceedMin(value,1235)
    test.equal(result,false,'exceedMin: exceedMin failed')

    /*          ifFileFolderExist           */
    value='C:/Program Files'
    result=func.isFileFolderExist(value)
    test.equal(result,true,'isFileFolderExist: existed folder check failed')
    value='C:/Program Filessssss'
    result=func.isFileFolderExist(value)
    test.equal(result,false,'isFileFolderExist: not existed folder check failed')
    value='C:/Windows/System32/drivers/etc/hosts'
    result=func.isFileFolderExist(value)
    test.equal(result,true,'isFileFolderExist: existed file check failed')
    value='C:/Windows/System32/drivers/etc/hostssssss'
    result=func.isFileFolderExist(value)
    test.equal(result,false,'isFileFolderExist: not existed file check failed')

    test.done()
}
/***************************************************************************/
/*******     辅助函数，根据预定义dataType，检测value是否合格      **********/
/***************************************************************************/
var valueTypeCheck=function(test){
    let func=testModule.valueTypeCheck
    let value,tmpDataType,result,tmp

    test.expect(9)

    value='randomString'
    tmpDataType='noEnumDataType'
    result=func(value,tmpDataType)
    test.equal(result.rc,validateInputFormatError.unknownDataType.rc,'unknown data type check failed');

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

var convertClientSearchValueToServerFormat=function(test){
    test.expect(2)
    let func=testModule.convertClientSearchValueToServerFormat
    var fkAdditionalFieldsConfig={

            //冗余字段（nested）的名称：具体冗余那几个字段
            //parentBillType:此字段为外键，需要冗余字段
            //relatedColl：外键对应的coll
            //nestedPrefix： 冗余字段一般放在nested结构中
            //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
            parentBillType:{relatedColl:"billType",nestedPrefix:'parentBillTypeFields',forSelect:'name title',forSetValue:['name title']}

    }
    let value={name:['val1','val2'],parentBillType:[{name:'val3'},{name:'val4'}]}
    let result=func(value,fkAdditionalFieldsConfig)
    // console.log(JSON.stringify(result))
    test.equal(JSON.stringify(result),'{"$or":[{"name":{"$in":["val1","val2"]}},{"parentBillType.name":{"$in":["val3","val4"]}}]}','format server msg failed')

    value={name:['val1','val2'],parentBillType:[{name:'val3',title:'MIT'},{name:'val4'}]}
    result=func(value,fkAdditionalFieldsConfig)
    // console.log(JSON.stringify(result))
    test.equal(JSON.stringify(result),'{"$or":[{"name":{"$in":["val1","val2"]}},{"parentBillType.name":{"$in":["val3","val4"]}},{"parentBillType.title":{"$in":["MIT"]}}]}','format server msg failed')

    test.done()
}




exports.validate={
     dataTypeCheck,//数据类型检测
    // valueMatchRuleDefineCheck,
    // valueTypeCheck,
    //convertClientSearchValueToServerFormat//只是用来查看结果
/*    _private:{
        valueTypeCheck,
    },
    checkInput,
    checkInputAdditional,*/
     //validateInputSearchFormat,
    //validateInputSearch,
}