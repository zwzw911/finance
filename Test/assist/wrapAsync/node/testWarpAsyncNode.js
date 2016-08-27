/**
 * Created by wzhan039 on 2016-08-09.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var testModule=require('../../../../server/assist/wrapAsync/node/wrapAsyncNode').asyncFunc;
var asyncError=require('../../../../server/define/error/asyncNodeError').asyncNodeError
/*          for generateRandomString test       */
/*var regex=require('../../server/define/regex/regex').regex
var randomStringTypeEnum=require('../../server/define/enum/node').node.randomStringType*/

/*
* 由于nodeunit中没有引入require bable，所以测试的时候只能使用nodeunit xxx-complied.js
* */
var testAsyncFs=async function(test){
    test.expect(3);
    let func=testModule.asyncFs.asyncFileFolderExist
    let errorSet=asyncError.fs


    let result
    let errorResult

    result=await func('C:/asdf')
    errorResult=errorSet.fileNotExist('C:/asdf')
    test.equal(result.rc,errorResult.rc,'async check not exist folder failed')

    result=await func('C:/Windows')
    errorResult=errorSet.fileNotExist('C:/Windows')
    test.equal(result.rc,0,'async check exist folder failed')

    result=await func('C:/Windows/System32/drivers/etc/hosts')
    errorResult=errorSet.fileNotExist('C:/Windows/System32/drivers/etc/hosts')
    test.equal(result.rc,0,'async check exist file failed')

    test.done();
}

module.exports={
    testAsyncFs,
}