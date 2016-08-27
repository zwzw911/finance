/**
 * Created by ada on 2015/7/5.
 */
 'use strict'
require("babel-polyfill");
require("babel-core/register")

var testModule=require('../../server/assist/misc').func;
var miscError=require('../../server/define/error/nodeError').nodeError.assistError.misc
var gmError=require('../../server/define/error/nodeError').nodeError.assistError.gmImage
/*          for generateRandomString test       */
var regex=require('../../server/define/regex/regex').regex
var randomStringTypeEnum=require('../../server/define/enum/node').node.randomStringType

var dataTypeCheck=function(test){
	test.expect(46);
	
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

    //string
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
    //isArray
    value={}
    result=func.isArray(value)
    test.equal(result,false,'isArray: check not array failed')
    value=[]
    result=func.isArray(value)
    test.equal(result,true,'isArray: check array failed')
    //isObject
    value={}
    result=func.isObject(value)
    test.equal(result,true,'isObject: check object failed')
    value=[]    //array和object严格区分（js中，array是object）
    result=func.isObject(value)
    test.equal(result,false,'isObject: check object(array) failed')
    //isDate
    value='2016'        //转换成2016-01-01
    result=func.isDate(value)
    test.equal(result.toLocaleString(),'2016-01-01 08:00:00','isDate: check year only date failed')
    value='2016-02-30'              //toLocaleString会自动转换成合适的日期（2016-03-01 08:00:00，8点是CST）
    result=func.isDate(value)
    test.equal(result.toLocaleString(),'2016-03-01 08:00:00','isDate: check invalid date failed')
    value='2016-02-02 25:30'
    result=func.isDate(value)
    test.equal(result,false,'isDate: check invalid time failed')
    value='2016-02-02 23:30'
    result=func.isDate(value)
    test.equal(result.toLocaleString(),'2016-02-02 23:30:00','isDate: check valid time - failed')
    value='2016/02/02'
    result=func.isDate(value)
    test.equal(result.toLocaleString(),'2016-02-02 00:00:00','isDate: check valid date / failed')
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

var ruleTypeCheck=function(test){
    let func=testModule.ruleTypeCheck
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


var generateRandomString=function(test){
    let func=testModule
    let value,result,tmp
    test.expect(4)

    value=func.generateRandomString()
    result=regex.randomString.normal.test(value)
    test.equal(result,true,'default parameter random string generate failed')

    value=func.generateRandomString(4,randomStringTypeEnum.basic)
    result=regex.randomString.basic.test(value)
    test.equal(result,true,'basic random string generate failed')

    value=func.generateRandomString(4,randomStringTypeEnum.normal)
    result=regex.randomString.normal.test(value)
    test.equal(result,true,'normal random string generate failed')

    value=func.generateRandomString(4,randomStringTypeEnum.complicated)
    result=regex.randomString.complicated.test(value)
    test.equal(result,true,'complicated random string generate failed')

/*    value=func.generateRandomString(4,randomStringTypeEnum.normal)
    result=regex.randomString.test(value)
    test.equal(result,true,'complicated random string generate failed')*/

    test.done()
}


var parseGmFileSize=function(test){
    let func=testModule
    let value,result,tmp
    test.expect(8)

    value='999'
    result=func.parseGmFileSize(value)
    test.equal(result.msg.sizeNum,value,'byte check failed')

    value='1.8Ki'
    result=func.parseGmFileSize(value)
    test.equal(result.msg.sizeNum,'1.8','Ki float size number check failed')
    test.equal(result.msg.sizeUnit,'Ki','Ki size unit check failed')

    value='8Ki'
    result=func.parseGmFileSize(value)
    test.equal(result.msg.sizeNum,'8','Ki int size number check failed')
    test.equal(result.msg.sizeUnit,'Ki','Ki size unit check failed')

    value='1.8Gi'
    result=func.parseGmFileSize(value)
    test.equal(result.rc,gmError.exceedMaxSize.rc,'exceed Max Size check failed')

    value='999Si'
    result=func.parseGmFileSize(value)
    test.equal(result.rc,gmError.cantParseGmFileSize.rc,'parse gm size failed')

    value='aKi'
    result=func.parseGmFileSize(value)
    test.equal(result.rc,gmError.cantParseGmFileSize.rc,'parse gm size failed')

    test.done()
}


var convertImageFileSizeToByte=function (test){
    let func=testModule
    let value,result,tmp
    test.expect(6)

    result=func.convertImageFileSizeToByte(999)
    test.equal(result.msg,999,'convert byte failed')

    result=func.convertImageFileSizeToByte(1980)
    test.equal(result.rc,gmError.invalidFileSizeInByte.rc,'convert byte exceed byte failed')

    result=func.convertImageFileSizeToByte(999,'Si')
    test.equal(result.rc,gmError.invalidSizeUnit.rc,'check invalid size unit failed')

    result=func.convertImageFileSizeToByte(1.1,'Ki')
    test.equal(result.msg,1126,'convert Ki failed')

    result=func.convertImageFileSizeToByte(1.1,'Mi')
    test.equal(result.msg,1153433,'convert Mi failed')

    result=func.convertImageFileSizeToByte(1.1,'Gi')
    test.equal(result.msg,1181116006,'convert Mi failed')

    test.done()
}

var encodeHtml=function(test){
    let func=testModule
    let value,result,tmp
    test.expect(7)

    result=func.encodeHtml(' ')
    //console.log(result)
    test.equal(result,'&#160;','convert space to html code failed')

    result=func.encodeHtml('&')
    test.equal(result,'&#38;','convert & to html code failed')

    result=func.encodeHtml('"')
    test.equal(result,'&#34;','convert " to html code failed')

    result=func.encodeHtml("'")
    test.equal(result,'&#39;',"convert ' to html code failed")

    result=func.encodeHtml("<")
    test.equal(result,'&#60;',"convert < to html code failed")

    result=func.encodeHtml(">")
    test.equal(result,'&#62;',"convert > to html code failed")

    result=func.encodeHtml("<script>")
    test.equal(result,'&#60;script&#62;',"convert > to html code failed")

    test.done()
    //\s"&'<>
}

exports.all={
    dataTypeCheck:dataTypeCheck,
    ruleTypeCheck:ruleTypeCheck,
    generateRandomString:generateRandomString,
    parseGmFileSize:parseGmFileSize,
    convertImageFileSizeToByte:convertImageFileSizeToByte,
    encodeHtml,
}

//console.log(testModule.generateRandomString(10,randomStringTypeEnum.complicated))