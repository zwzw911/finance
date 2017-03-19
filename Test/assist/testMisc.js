/**
 * Created by ada on 2015/7/5.
 */
 'use strict'
//require("babel-polyfill");
//require("babel-core/register")

var testModule=require('../../server/assist/misc');
var miscError=require('../../server/define/error/nodeError').nodeError.assistError.misc
var gmError=require('../../server/define/error/nodeError').nodeError.assistError.gmImage
/*          for generateRandomString test       */
var regex=require('../../server/define/regex/regex').regex
var randomStringTypeEnum=require('../../server/define/enum/node').node.randomStringType



// console.log(moment().format('YYYY-MM-DD h:mm:ss'))




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

var formatRc=function(test){
    test.expect(2)
    let func=testModule
    let result

    let rc={rc:1000,msg:{client:'client',server:'server'}}
    result=func.formatRc(rc)
    test.equal(result.msg,'client','format client msg failed')

    rc={rc:1000,msg:{client:'client',server:'server'}}
    result=func.formatRc(rc,false)
    test.equal(result.msg,'server','format server msg failed')

/*    console.log(rc)*/
    test.done()
}

function escapeRegSpecialChar(test){
    test.expect(1)
    let func=testModule.escapeRegSpecialChar
    let value,result

    value='\\!'
    result=func(value)
    console.log(result)
    test.equal(result,'\\a\\!','escape special char failed')

    value='\\as`"()[]<>?+=*^$'
    console.log(value)
    result=func(value)
    //显示'\\'，console.log打印为\
    test.equal(result,'\\\\as\\`\\"\\(\\)\\[\\]\\<\\>\\?\\+\\=\\*\\^\\$','escape special char failed')
    test.done()
}
exports.all={
     //generateRandomString:generateRandomString,
     //parseGmFileSize:parseGmFileSize,
     //convertImageFileSizeToByte:convertImageFileSizeToByte,
     //encodeHtml,
     //formatRc,
    escapeRegSpecialChar,
}

//console.log(testModule.generateRandomString(10,randomStringTypeEnum.complicated))