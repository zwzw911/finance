/**
 * Created by wzhan039 on 2016-09-30.
 * 因为expressjs的router只能支持callback，所有将所有的router处理都单独通过一个async函数处理，然后直接返回promise给router调用，
 *
 * 拆分辅助函数，合并路由函数（几个coll的路由过程都是类似的）
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var appSetting=require('../../config/global/appSetting')

var inputRule=require('../../define/validateRule/inputRule').inputRule
var validateFunc=require('../../assist/validateFunc').func
// var miscFunc=require('../../assist/misc')
// var validate=validateFunc.validate
var checkInterval=require('../../assist/misc-compiled').checkInterval

/*                      error               */
var pageError=require('../../define/error/pageError')
var unifiedModel=require('../../model/mongo/unifiedModel')
/*                      model               */
/*var departmentdbModel=require('../../model/mongo/departmentModel')
var employeedbModel=require('../../model/mongo/employeeModel')
var billTypedbModel=require('../../model/mongo/billTypeModel')
var billdbModel=require('../../model/mongo/billModel')*/
//var fkAdditionalFields=require('../../model/mongo/not_used_fkAdditionalFieldsModel')

/*                      func                   */
var populateSingleDoc=require('../../assist/misc-compiled').populateSingleDoc
/*                      regex               */
var coll=require('../../define/enum/node').node.coll
/*                      enum                */
var nodeEnum=require('../../define/enum/node').node
var envEnum=nodeEnum.env



//1. checkInterval，在main中执行，所以必须定义在非main文件，否则无法编译
async function common(req,res,next){
    let result=await checkInterval(req)
    return result
}

//对create/update方法输入的value进行检查和转换（字符串的话）
//create:false     update:true
function sanityInput(originalInputValue,inputRule,basedOnInputValue,maxFieldNum){
     //console.log(`input value type is ${typeof originalInputValue}`)
    //console.log(`input value is ${JSON.stringify( originalInputValue)}`)
    //1. 检查格式
    let checkFormatResult=validateFunc.validateInputFormat(originalInputValue,inputRule,maxFieldNum)
    //console.log(`check format is ${JSON.stringify(checkFormatResult)}`)
    if(checkFormatResult.rc>0){
        return checkFormatResult
    }

    //2 检查输入值的内容是否正确
    let checkResult=validateFunc.validateInputValue(originalInputValue,inputRule,basedOnInputValue)
     // console.log(`check input  result is ${JSON.stringify(checkResult)}`)
    for(let singleField in checkResult){
        if(checkResult[singleField].rc>0){
/*            returnResult(checkResult[singleField])
            return res.json(checkResult[singleField])*/
            //return checkResult[singleField]
            return {rc:99999,msg:checkResult}//返回全部检查结果，为了统一格式，设置一个非0的rc
        }
    }

    return {rc:0}
}

/*
* 参数：
*       1.  inputSearch:{field:[value1,value2]}
*       2.  fkAdditionalFieldsConfig:外键的一些设置，包括此外键对应到那个coll的哪个field
*       3.  collName
*       4.  inputRules：整个个inputRules，因为可能有字段是外键字段，此时需要检查外键对应的coll/field
*
* */
function sanitySearchInput(inputSearch,fkAdditionalFieldsConfig,collName,inputRules){
    // console.log(   `sanitySearchInput in`)
    //1 检查输入格式
    let formatCheckResult=validateFunc.validateInputSearchFormat(inputSearch,fkAdditionalFieldsConfig,collName,inputRules)
    // console.log(   `format resuot is ${formatCheckResult}`)
    if(formatCheckResult.rc>0){
        return formatCheckResult
    }
    //2 检查搜索值是否正确
    let valueCheckResult=validateFunc.validateInputSearchValue(inputSearch,fkAdditionalFieldsConfig,collName,inputRules)
    // console.log(   `value resuot is ${valueCheckResult}`)
    for(let singleFieldName in valueCheckResult){
        if(valueCheckResult[singleFieldName]['rc']>0){
            return {rc:9999,msg:valueCheckResult}
        }
    }
    return {rc:0}
}

//对returnResult做包装，通过env的判断决定res.json输出的格式
function returnResult(rc){
    if(envEnum.production===appSetting.env){
        return validateFunc.formatRc(rc)
    }else{
        return rc
    }
}

//fkColl：选择哪个coll进行id验证
//currentColl+currentFkName：确定使用哪个error
/*async function checkIdExist(fkColl,currentColl,currentFkName,id){
    let dbModel
    switch (fkColl){
        case coll.employee:
            dbModel=employeedbModel;
            break;
        case coll.department:
            dbModel=departmentdbModel;
            break;
        case coll.billType:
            dbModel=billTypedbModel;
            break;
        case coll.bill:
            dbModel=billdbModel
            break;
        default:
            return pageError.common.unknownColl
    }
//console.log(`dbModel is ${dbModel['findById'].toString()}`)
//    console.log(`id is ${id}`)
    let result=await dbModel['findById'](id)
    //console.log(`findByID result is ${JSON.stringify(result)}`)
    if(null===result.msg){
        return pageError[currentColl][currentFkName+'NotExist']
    }else{
        return {rc:0}
    }
}*/

/*async function checkIdExist({dbModel,eCurrentColl,fkFieldName,id}){
    let result=await dbModel[eCurrentColl]['findById'](id)
    //console.log(`findByID result is ${JSON.stringify(result)}`)
    if(null===result.msg){
        return pageError[eCurrentColl][fkFieldName+'NotExist']
    }else{
        return {rc:0}
    }
}*/
/*//从coll中，根据id查找到记录，然后返回其中的fields
//和checkIdExist使用同样的函数，目的是为了能让代码更加清晰
/!*
* fkFieldName：需要获得冗余字段的外键名，主要为了产生 错误信息
* fkid：ObjectId
* fkColl：fk对应的coll
* fkAdditionalFields：需要哪些fk的冗余字段
* *!/
async function getAdditionalFields(fkFieldName,fkId,fkColl,fkAdditionalFields){
    let dbModel
    switch (fkColl){
        case coll.employee:
            dbModel=employeedbModel;
            break;
        case coll.department:
            dbModel=departmentdbModel;
            break;
        case coll.billType:
            dbModel=billTypedbModel;
            break;
        case coll.bill:
            dbModel=billdbModel
            break;
        default:
            return pageError.common.unknownColl
    }
//console.log(`dbModel is ${dbModel['findById'].toString()}`)
//    console.log(`id is ${id}`)
    let result=await dbModel['findById'](fkId,fkAdditionalFields)
    //console.log(`findByID result is ${JSON.stringify(result)}`)
    if(null===result.msg){
        return pageError[fkColl][fkFieldName+'NotExist']
    }else{
        return {rc:0,msg:result.msg}
    }
}*/

//
//
/*
* 说明：根据外键，查找到对应的记录，并把记录中的字段保存到冗余字段中
* 输入参数：
* 1.singleDoc：当前要操作的doc（create或者update，从client输入的数据）
* 2. fkAdditionalConfig: 外键冗余字段的设置（已coll为单位进行设置，可能有多个fk），包括relatedColl(当前fk对应的coll)，nestedPrefix（外键冗余字段一般放在一个nested结构中，此结构的名称），forSelect：需要返回并设置的冗余字段（用在mongoose的查询中），forSetValue（在arrayResult中设置的字段名）
* 3. model；所有的model，以便选择对应的model进行操作
* 无返回值
* */
async function getFkAdditionalFields(doc,fkAdditionalConfig,dbModel){

        for(let fkFieldName in fkAdditionalConfig){
            // console.log(`configed fk field name is ${fkFieldName}`)
            //如果文档中外键存在（例如，objectId存在）
            if(doc[fkFieldName]){
                //console.log(`configed fk  is ${doc[fkFieldName]}`)
                //console.log(`fk related coll is ${fkAdditionalConfig[fkFieldName]['relatedColl']}`)
                let nestedPrefix=fkAdditionalConfig[fkFieldName].nestedPrefix //外键冗余字段要存入那个字段中（这个字段是nested结构，下面是具体的冗余字段名称）
                let fkId=doc[fkFieldName]   //外键的id（通过Id在对应的coll中进行查找）
                let fkRelatedCollName=fkAdditionalConfig[fkFieldName]['relatedColl'] //外键对应在那个coll中
                let fkAdditionalFields=fkAdditionalConfig[fkFieldName].forSelect    //外键对应的coll中，需要获得哪些field的值，使用mongodb的操作
                let fkAdditionalFieldsArray=fkAdditionalConfig[fkFieldName].forSetValue //同上，只是格式是array，以便for操作

                // let fkAdditionalFieldsResult=await dbModel[fkRelatedCollName]['findById'](fkId,fkAdditionalFields)
                //console.log(`findByID result is ${JSON.stringify(result)}`)
                let fkAdditionalFieldsResult=await unifiedModel.findById({'dbModel':dbModel[fkRelatedCollName],'id':fkId})
                if(null===fkAdditionalFieldsResult.msg){
                    return pageError[fkRelatedCollName][fkFieldName+'NotExist']
                }

                //let fkAdditionalFields=await getAdditionalFields(fkFieldName,doc[fkFieldName],fkAdditionalConfig[fkFieldName]['relatedColl'],fkAdditionalConfig[fkFieldName].forSelect)
                // console.log(`get fk doc ${JSON.stringify(fkAdditionalFieldsResult)}`)
/*                if(fkAdditionalFields.rc>0){
                    return fkAdditionalFields
                }*/
                // console.log(`add result is ${JSON.stringify(fkAdditionalFields)}`)
                doc[nestedPrefix]={}
                //将读取到的额外字段赋值给
                for(let field of fkAdditionalFieldsArray){
                    // console.log(`add field is ${field}`)
                    //需要转换成parentBillTypeFields.name的格式，因为是nested
                    // let tmpField='parentBillTypeFields.'+field
                    doc[nestedPrefix][field]=fkAdditionalFieldsResult['msg'][field]
                }
            }
        }
        return {rc:0}
        // console.log(`added result is ${JSON.stringify(doc)}`)

}








module.exports= {
    common,//每个请求进来是，都要进行的操作（时间间隔检查等）
    sanityInput,//create/update/remove等请求，传入参数的检查。{field1:{value:'xxx'},field2:{value:'yyy'}}
    sanitySearchInput,//当客户端传入的搜索参数的检查，格式见 doc 文档
    returnResult,//是否需要将结果转换成客户端能够处理的格式
    // checkIdExist,//检查外键对应的记录是否存在
    //getAdditionalFields,
    getFkAdditionalFields,//create/update的时候，将外键的id转换成对应的冗余字段，以便存储db

}

/*
module.exports={
    common,//每个请求进来是，都要进行的操作（时间间隔检查等）
    sanityInput,//create/update/remove等请求，传入参数的检查。{field1:{value:'xxx'},field2:{value:'yyy'}}
    sanitySearchInput,//当客户端传入的搜索参数的检查，格式见 doc 文档
    returnResult,//是否需要将结果转换成客户端能够处理的格式
    checkIdExist,//检查外键对应的记录是否存在
    //getAdditionalFields,
    getFkAdditionalFields,//create/update的时候，将外键的id转换成对应的冗余字段，以便存储db
    debug,

}*/
