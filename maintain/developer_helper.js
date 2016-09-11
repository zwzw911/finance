/**
 * Created by wzhan039 on 2016-09-08.
 * dbstructure==>inputRule==>clientInputRule/clientInputAttr==>deleteNonNeededObject==>objectIdToRealField==>最终结果
 */
    'use strict'
var miscFunc=require("../server/assist/misc-compiled").func
var ruleDefine=require("../server/define/validateRule/inputRule").inputRule
var fs=require('fs')

var inputAttr={}
var clientInputRule={}
/*generateClientDefine(ruleDefine,2,inputAttr)
 console.log(inputAttr)*/


var regex=require('../server/define/regex/regex').regex

var skipList={
    department:['cDate','uDate','dDate'],
    employee:['cDate','uDate','dDate'],
    billType:['cDate','uDate','dDate'],
    bill:['cDate','uDate','dDate'],
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

miscFunc.generateClientDefine(ruleDefine,2,inputAttr)
miscFunc.deleteNonNeededObject(inputAttr,skipList)
miscFunc.objectIdToRealField(inputAttr,matchList)
fs.writeFile('inputAttr.txt',JSON.stringify(inputAttr))

miscFunc.generateClientRule(ruleDefine,2,clientInputRule)
miscFunc.deleteNonNeededObject(clientInputRule,skipList)
miscFunc.objectIdToRealField(clientInputRule,matchList)
fs.writeFile('clientInputRule.txt',JSON.stringify(clientInputRule))
console.log('done')