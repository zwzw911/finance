/**
 * Created by wzhan039 on 2016-09-08.
 * dbstructure==>inputRule==>clientInputRule/clientInputAttr==>deleteNonNeededObject==>objectIdToRealField==>最终结果
 */
    'use strict'
require("babel-polyfill");
require("babel-core/register")
var miscFunc=require("../server/assist/misc-compiled").func
var ruleDefine=require("../server/define/validateRule/inputRule").inputRule
var fs=require('fs')

var inputAttr={}
var clientInputRule={}
/*generateClientDefine(ruleDefine,2,inputAttr)
 console.log(inputAttr)*/


var regex=require('../server/define/regex/regex').regex

//根据inputRule产生，不需要在客户端使用的字段
var skipListForRule={
    user:['salt','encryptedPassword','cDate','uDate','dDate'],
    department:['cDate','uDate','dDate'],
    employee:['cDate','uDate','dDate'],
    billType:['cDate','uDate','dDate'],
    bill:['cDate','uDate','dDate'],
}

//attr只负责显示，不负责check input
var skipListForAttr={
    user:['salt','encryptedPassword','dDate'],
    department:['dDate'],
    employee:['dDate'],
    billType:['dDate'],
    bill:['dDate'],
}

var matchList={
    department:{
        parentDepartment:'department.name'
    },
    employee:{
        leader:'employee.name',
        //department:'department.name'
    },
    billType:{
        parentBillType:'billType.name'
    },
    bill:{
        billType:'billType.name',
        reimburser:'employee.name'
    }
}

miscFunc.generateClientInputAttr(ruleDefine,2,inputAttr)
console.log(inputAttr['department'])
miscFunc.deleteNonNeededObject(inputAttr,skipListForAttr)
console.log(inputAttr['department'])
miscFunc.objectIdToRealField(inputAttr,matchList)
fs.writeFile('inputAttr.txt',JSON.stringify(inputAttr))

miscFunc.generateClientRule(ruleDefine,2,clientInputRule)
miscFunc.deleteNonNeededObject(clientInputRule,skipListForRule)
miscFunc.objectIdToRealField(clientInputRule,matchList)
fs.writeFile('clientInputRule.txt',JSON.stringify(clientInputRule))

//从inputAttr提取出用于ng-select(ng-select接受格式为数组，每个元素包含key,value，key为显示在页面上)
var extractSelectKeyValueFromInputAttr=function(inputAttr){
    let result={}
    for(let coll in inputAttr){
        result[coll]=[]
        for(let field in inputAttr[coll]){
            let tmpResult={}
            tmpResult['value']=inputAttr[coll][field]['chineseName']
            tmpResult['key']=field
            result[coll].push(tmpResult)
        }
    }
    return result
}
var result=extractSelectKeyValueFromInputAttr(inputAttr)
// console.log(result)
fs.writeFile('queryField.txt',JSON.stringify(result))

console.log('done')