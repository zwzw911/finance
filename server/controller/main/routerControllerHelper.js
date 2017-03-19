/**
 * Created by wzhan039 on 2016-09-30.
 * 因为expressjs的router只能支持callback，所有将所有的router处理都单独通过一个async函数处理，然后直接返回promise给router调用，
 *
 * 拆分辅助函数，合并路由函数（几个coll的路由过程都是类似的）
 */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")

var appSetting=require('../../config/global/appSetting')

// var inputRule=require('../../define/validateRule/inputRule').inputRule
//var validateFunc=require('../../assist/not_used_validateFunc').func
var validateHelper=require('../../assist/validateInput/validateHelper')
var validateFormat=require('../../assist/validateInput/validateFormat')
var validateValue=require('../../assist/validateInput/validateValue')

// var miscFunc=require('../../assist/misc')
// var validate=validateFunc.validate
var checkInterval=require('../../assist/misc').checkInterval

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
var populateSingleDoc=require('../../assist/misc').populateSingleDoc
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
function sanityCUInput(originalInputValue,inputRule,basedOnInputValue,maxFieldNum){
     //console.log(`input value type is ${typeof originalInputValue}`)
    //console.log(`input value is ${JSON.stringify( originalInputValue)}`)
    //1. 检查总体格式
    let checkWholeFormatResult=validateFormat.validateCUDInputFormat(originalInputValue)
    // console.log(`check whole format is ${JSON.stringify(checkWholeFormatResult)}`)
    if(checkWholeFormatResult.rc>0){
        return checkWholeFormatResult
    }
    //2 检查recorderInfo格式
    let checkRecorderInfoResult=validateFormat.validateRecorderInfoFormat(originalInputValue['recorderInfo'],inputRule,maxFieldNum)
    // console.log(`check recorderInfo format is ${JSON.stringify(checkRecorderInfoResult)}`)
    if(checkRecorderInfoResult.rc>0){
        return checkRecorderInfoResult
    }

    //3 检查输入值的内容是否正确
    let checkValueResult=validateValue.validateRecorderInfoValue(originalInputValue['recorderInfo'],inputRule,basedOnInputValue)
     // console.log(`check input  result is ${JSON.stringify(checkValueResult)}`)
    for(let singleField in checkValueResult){
        if(checkValueResult[singleField].rc>0){
/*            returnResult(checkResult[singleField])
            return res.json(checkResult[singleField])*/
            //return checkResult[singleField]
            return {rc:99999,msg:checkValueResult}//返回全部检查结果，为了统一格式，设置一个非0的rc
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
    //1 检查总体格式
    let checkWholeFormatResult=validateFormat.validateSearchInputFormat(inputSearch)
    //console.log(   `whole format check result is  ${JSON.stringify(checkWholeFormatResult)}`)
    if(checkWholeFormatResult.rc>0){
        return checkWholeFormatResult
    }
    //2 检查搜索参数格式
    let checkSearchParamsFormatResult=validateFormat.validateSearchParamsFormat(inputSearch['searchParams'],fkAdditionalFieldsConfig,collName,inputRules)
     //console.log(   `format resuot is ${checkSearchParamsFormatResult}`)
    if(checkSearchParamsFormatResult.rc>0){
        return checkSearchParamsFormatResult
    }
    //2 检查搜索值是否正确
    let validateValueResult=validateValue.validateSearchParamsValue(inputSearch['searchParams'],fkAdditionalFieldsConfig,collName,inputRules)
     //console.log(   `value result is ${validateValueResult}`)
    for(let singleFieldName in validateValueResult){
        if(validateValueResult[singleFieldName]['rc']>0){
            return {rc:9999,msg:validateValueResult}
        }
    }
    return {rc:0}
}

/* 和sanitySearchInput类似，只是多一部，要求检查objectID
 * 参数：
 *       1.  inputSearch:{field:[value1,value2]}
 *       2.  fkAdditionalFieldsConfig:外键的一些设置，包括此外键对应到那个coll的哪个field
 *       3.  collName
 *       4.  inputRules：整个个inputRules，因为可能有字段是外键字段，此时需要检查外键对应的coll/field
 *
 * */
function sanityDeleteValue(inputSearch,fkAdditionalFieldsConfig,collName,inputRules,objectId){
    //1 检查URL中objectId是否正确
    let objectIdResult=validateValue.validateDeleteObjectId(objectId)
    if(objectIdResult.rc>0){
        return objectIdResult
    }

    //2. 其他body中的参数和searchParams一样
    let searchParamsResult=sanitySearchInput(inputSearch,fkAdditionalFieldsConfig,collName,inputRules)
    if(searchParamsResult.rc>0){
        return searchParamsResult
    }
    return {rc:0}
}


/*
* 对传入的字段，返回所有匹配的值，完成autoComplete的功能
* 参数
*   1. inputValue：{field:{value:'xxxx'}}。每次只能上传一个field的值
*   2. fkConfig: coll的fkConfig
*   3. collName
*   4. inputRules：所有rule
*
* */
/*function sanityAutoCompleteInput(inputSearch,fkAdditionalFieldsConfig,collName,inputRules){

}*/



//将server返回的rc格式化成client能接受的格式
//server可能是{rc:xxxx,msg:{client:'yyy',server:'zzz'}======>client  {rc:xxx,msg:yyy}
function returnResult(rc,clientFlag=true){
    //如果是实际上线，且同时有client和server2中msg，那么根据clientFlag选择返回那种msg
    if(envEnum.production===appSetting.env){
        if(rc.msg && (rc.msg.client || rc.msg.server)){
            let result={}
            result['rc']=rc['rc']
            if(clientFlag){
                result['msg']=rc.msg.client
            }else{
                result['msg']=rc.msg.server
            }
            return result
        }
    }
    return rc

}


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
// console.log(`getFkAdditionalFields:fkAdditionalFieldsArray is ${JSON.stringify(fkAdditionalFieldsArray)}`)
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
                 //console.log(`add result is ${JSON.stringify(fkAdditionalFieldsResult)}`)
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


/*       对统计信息传入的日期进行检测（格式和值类型）        */
function sanityStaticQueryDate(values,rules){
    // let
    //1 检查总体格式
    let checkWholeFormatResult=validateFormat.validateStaticInputFormat(values)
    // console.log(   `whole format check result is  ${JSON.stringify(checkWholeFormatResult)}`)
    if(checkWholeFormatResult.rc>0){
        return checkWholeFormatResult
    }
    //2 检查搜索参数格式
    let checkSearchParamsFormatResult=validateFormat.validateStaticSearchParamsFormat(values['searchParams'],rules)
    // console.log(   `format resuot is ${JSON.stringify(checkSearchParamsFormatResult)}`)
    if(checkSearchParamsFormatResult.rc>0){
        return checkSearchParamsFormatResult
    }

    //3 检查搜索值是否正确
    let validateValueResult=validateValue.validateStaticSearchParamsValue(values['searchParams'],rules)
    // console.log(   `value result is ${JSON.stringify(validateValueResult)}`)
    for(let singleFieldName in validateValueResult){
        if(validateValueResult[singleFieldName]['rc']>0){
            return {rc:9999,msg:validateValueResult}
        }
    }

    return {rc:0}
}

/*
* 根据billType的结构，产生对应的数据
* billTypeStructure：getStaticBillType获得的billType的数据结构
* 返回一个数组，元素是一个数组,代表top billType，其中默认填充0         [[parent1ChildType1,parent1ChildType2],[parent2ChildType1,parent2ChildType2]]
* */
function genDataStructureBaseOnBillType(billTypeStructure){
    let data=[]
    for(let topBillType of billTypeStructure){
        //console.log(`genDataStructureBaseOnBillType child is ${JSON.stringify(topBillType)}`)
        let childData=Array(topBillType.child.length).fill(0)
        data.push(childData)
    }
    return data
}

/*
* 将分组数据(无日期分组)加入到genDataStructureBaseOnBillType产生的模板数组中
* */
function matchCurrentCaptialIntoTemplateArray(billTypeStructure, templateArray,groupData){
    for(let singleData of groupData){
        //console.log(`singleData is ${JSON.stringify(singleData)}`)
        //定位数据的index（top和child），以便直接写入template数组
        for(let topBillTypeIdx in billTypeStructure){
            //console.log(   `topBillTypeIdx is ${topBillTypeIdx}`)
            for(let childIdx in billTypeStructure[topBillTypeIdx]['child']){
                //console.log(   `childIdx is ${childIdx}`)
                //console.log(`bt id is ${billTypeStructure[topBillTypeIdx]['child'][childIdx]['_id'].toString()},type is ${typeof billTypeStructure[topBillTypeIdx]['child'][childIdx]['_id']}`)
                //console.log(`singleData id is ${singleData._id.billType.toString()},type is ${typeof singleData._id.billType}`)

                if(singleData._id.billType.toString()===billTypeStructure[topBillTypeIdx]['child'][childIdx]['_id'].toString()){
                    // console.log(`equal:topBillTypeIdx is {topBillTypeIdx},childIdx is {childIdx}`)
                    templateArray[topBillTypeIdx][childIdx]=singleData.total
                }
            }
        }
    }
// console.log(`final exec matchDataIntoTemplateArray ${JSON.stringify(templateArray)}`)
}


/*
 * 将分组数据(日期分组)加入到genDataStructureBaseOnBillType产生的模板数组中
 * */
function matchGroupDataIntoTemplateArray(billTypeStructure,groupData){
    let finalResult={} //采用对象，如此可以快速的判断日期是否存在(因为groupData获得时已经按照时间排序，所以无需担心时间不排序的问题)
    for(let singleData of groupData){
        //如果有日期，说明数据来自getGroupCapital，此时，每个元素变成{
        // "2017-02":[[123,345,678],[12345,567,134]]]
        // }
        if(singleData._id.year && singleData._id.month){
            //生成年-月
            let dateKey=singleData._id.year.toString()+'-'+singleData._id.month.toString()
            //如果年-月 不存在，设置一个新的array,并用模板填充
            if(false===dateKey in finalResult){
                //因为templateArray是数组，且其中的元素为引用模式（数组），所以不能复用，只能每次重新生成
                let templateArray=genDataStructureBaseOnBillType(billTypeStructure)

                finalResult[dateKey]=[].concat(templateArray)
                // console.log(`init data array is ${JSON.stringify(finalResult)}`)
            }

            //模板存在，遍历billType结构，决定数据存储的位置
            for(let topBillTypeIdx in billTypeStructure){
                //console.log(   `topBillTypeIdx is ${topBillTypeIdx}`)
                for(let childIdx in billTypeStructure[topBillTypeIdx]['child']){
                    //console.log(   `childIdx is ${childIdx}`)
                    //console.log(`bt id is ${billTypeStructure[topBillTypeIdx]['child'][childIdx]['_id'].toString()},type is ${typeof billTypeStructure[topBillTypeIdx]['child'][childIdx]['_id']}`)
                    //console.log(`singleData id is ${singleData._id.billType.toString()},type is ${typeof singleData._id.billType}`)

                    if(singleData._id.billType.toString()===billTypeStructure[topBillTypeIdx]['child'][childIdx]['_id'].toString()){
                        //console.log(`equal:topBillTypeIdx is {topBillTypeIdx},childIdx is {childIdx}`)
                        finalResult[dateKey][topBillTypeIdx][childIdx]=singleData.total
                    }
                }
            }
        }
    }
return {rc:0,msg:finalResult}
}

module.exports= {
    common,//每个请求进来是，都要进行的操作（时间间隔检查等）
    sanityCUInput,//create/update/remove等请求，传入参数的检查。{field1:{value:'xxx'},field2:{value:'yyy'}}
    sanitySearchInput,//当客户端传入的搜索参数的检查，格式见 doc 文档
    sanityDeleteValue,//和sanitySearchInput一样，除了额外添加一个URL中objectId的检查
    //sanityAutoCompleteInput, //format采用inputValue的函数，值验证采用inputSearch的方式
    returnResult,//是否需要将结果转换成客户端能够处理的格式
    // checkIdExist,//检查外键对应的记录是否存在
    //getAdditionalFields,
    getFkAdditionalFields,//create/update的时候，将外键的id转换成对应的冗余字段，以便存储db
    sanityStaticQueryDate,
    //根据billType的结构产生一个全为0的数组
    genDataStructureBaseOnBillType,
    matchCurrentCaptialIntoTemplateArray,
    matchGroupDataIntoTemplateArray,
}

/*
module.exports={
    common,//每个请求进来是，都要进行的操作（时间间隔检查等）
    sanityCreateUpdateInput,//create/update/remove等请求，传入参数的检查。{field1:{value:'xxx'},field2:{value:'yyy'}}
    sanitySearchInput,//当客户端传入的搜索参数的检查，格式见 doc 文档
    returnResult,//是否需要将结果转换成客户端能够处理的格式
    checkIdExist,//检查外键对应的记录是否存在
    //getAdditionalFields,
    getFkAdditionalFields,//create/update的时候，将外键的id转换成对应的冗余字段，以便存储db
    debug,

}*/
