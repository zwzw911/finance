/**
 * Created by wzhan039 on 2016-09-08.
 * dbstructure==>inputRule==>clientInputRule/clientInputAttr==>deleteNonNeededObject==>objectIdToRealField==>最终结果
 */
    'use strict'
require("babel-polyfill");
require("babel-core/register")
var genClientFunc=require("../server/assist/genClientConfigFunc")
var ruleDefine=require("../server/define/validateRule/inputRule").inputRule
var fieldDefine=require("../server/model/mongo/common/structure").fieldDefine

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

inputAttr=genClientFunc.generateClientInputAttr(ruleDefine,fieldDefine)
// console.log(inputAttr['department'])
genClientFunc.deleteNonNeededObject(inputAttr,skipListForAttr)
// console.log(inputAttr['department'])
genClientFunc.objectIdToRealField(inputAttr,matchList)
// console.log(inputAttr['department'])
fs.writeFile('inputAttr.txt',JSON.stringify(inputAttr))

clientInputRule=genClientFunc.generateClientRule()
genClientFunc.deleteNonNeededObject(clientInputRule,skipListForRule)
genClientFunc.objectIdToRealField(clientInputRule,matchList)
fs.writeFile('clientInputRule.txt',JSON.stringify(clientInputRule))


/*              不直接使用inputAttr/inputRule，而是新建一个对象进行queryFiled的设置
*       因为inputRule用来检测create/update，inputAttr用来存储create/update对应的值
*       而queryField可能包含比inputRule/Attr更多的字段
* */
//从inputAttr提取出用于选择queryField的键值对（用于ng-select，ng-select接受格式为数组，每个元素包含key,value，key为显示在页面上，value用于存储选择的字段名称)
//key
//value
//type
var extractQueryFieldFromInputAttr=function(inputAttr,inputRule){
    let result={}
    for(let coll in inputAttr){
        result[coll]=[]
        for(let field in inputAttr[coll]){
            let tmpResult={}
            tmpResult['value']=inputAttr[coll][field]['chineseName']
            tmpResult['key']=field
            tmpResult['type']=inputRule[coll][field]['type']
            result[coll].push(tmpResult)
        }
    }
    return result
}
var result=extractQueryFieldFromInputAttr(inputAttr,ruleDefine)
// console.log(result)
fs.writeFile('queryField.txt',JSON.stringify(result))


//根据queryField的内容，产生Cdate:'报销日期'  格式的内容，以便页面可以快速的获得查询字段的中文名（原本是使用inputAttr，但是某些复用的查询字段，不在inputAttr中，所以只能产生额外的内容）
// {
//     "value": "部门名称",
//     "key": "name",
//     "type": "string"
// }
//=====> name:不能名称
var extractQueryFieldChineseName=function(queryField){
    let result={}
    for(let coll in queryField){
        // console.log(`coll is ${coll}`)
        result[coll]={}
        for(let singleQueryField of queryField[coll]){ //queryField[coll]是数组
            // console.log(`single quer =y field is ${JSON.stringify(singleQueryField)}`)
            result[coll][singleQueryField['key']]=singleQueryField['value']
        }
    }
    return result
}
var queryFieldChineseName=extractQueryFieldChineseName(result)
fs.writeFile('queryFieldChineseName.txt',JSON.stringify(queryFieldChineseName))

console.log('done')