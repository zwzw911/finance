/**
 * Created by Ada on 2017/1/23.
 * 对输入到server端的数据格式进行检查（而不检查其中的值）
 * 1. validateCUInputFormat：总体检查createUpdateDelete输入参数（是否为对象，是否包含recorderInfo/currentPage的key，且为对象或者整数）
 * 2. validateCURecorderInfoFormat： 检查recorderInfo（记录的输入值）是否符合inputRule的规定
 * 3. validateSearchInputFormat： 总体检查search（read）的输入参数，是否包含searchParams和currentPage
 * 4. validateSearchParamsFormat: 对search操作中的searchParams进行检查
 * 5. validateSingleSearchParamsFormat： 对searchParams中的单个字段的比较符值进行检测
 */
'use strict'
// require("babel-polyfill");
// require("babel-core/register")

var dataTypeCheck=require('./validateHelper').dataTypeCheck
var searchSetting=require('../../config/global/globalSettingRule').searchSetting
var validateFormatError=require('../../define/error/node/validateError').validateError.validateFormat
var compOp=require('../../define/enum/node').compOp
var dataType=require('../../define/enum/validEnum').dataType
var rightResult={rc:0}
var e_validatePart=require('../../define/enum/validEnum').validatePart


//检测req.body.values是否存在
var validateReqBody=function(reqBody){
    if(false==='values' in reqBody){
        return validateFormatError.valuesNotExist
    }

    return rightResult
}
// import {validatePart} from '../../define/enum/validEnum'
/* 检测输入的部分是否存在，且只有这几部分
 * params:
 * 1. inputValue:（post）传入的对象，post的输入的参数
 * 2. exceptedParts: 数组 期望参数里包含哪些部分
 *
 * step
 * 0. inputValue：必须是object
 * 1. 遍历exceptedParts，确定其中定义是否为预定义（在validatePart中）
 * 2. inputValuekey的数量是否等于exceptedParts的key的数量；
 * 3. 遍历inputValue，key是否都在exceptedParts中， 且inputValue中每个part对应的值的类型：
 *      searchParams:object
 *      recorderInfo:object
 *      currentColl: string
 *      currentPage; int
 *      recoderId:string(objectId)
 */
function  validatePartFormat (inputValue,exceptedParts){
    //0 如果需要检查inputValue，则inputValue必须为object
    if(false===dataTypeCheck.isObject(inputValue)){
        return validateFormatError.inputValuePartFormatWrong
    }
    //1  inputValue的数量是否等于exceptedParts的数量
    let inputValueKeyNum=Object.keys(inputValue).length
    let exceptedPartsNum=exceptedParts.length
    // console.log(`inputValueKeyNum is ${inputValueKeyNum}`)
    // console.log(`exceptedPartsNum is ${exceptedPartsNum}`)
    if(inputValueKeyNum!==exceptedPartsNum){
        return validateFormatError.inputValuePartNumNotExcepted
    }
    //2. 遍历exceptedParts，确保所有item都在validatePart中定义
    for(let part of exceptedParts){
        if(false=== part in e_validatePart){
            return validateFormatError.inputValuePartNotExcepted
        }
    }

    //3  遍历inputValue，
    for(let partKey in inputValue){
        // 3.1 key是否都在exceptedParts中
        if(-1===exceptedParts.indexOf(partKey)){
            console.log(`exceptedParts part ${JSON.stringify(exceptedParts)}`)
            console.log(`unknon part ${partKey}`)
            return validateFormatError.inputValuePartMiss
        }
        //3.2 每个part的value的类型
        switch (partKey){
            case e_validatePart.currentColl:
                if(false===dataTypeCheck.isString(inputValue[partKey])){
                    return validateFormatError.inputValuePartCurrentCollValueFormatWrong
                }
                break
            case e_validatePart.currentPage:
                //先要转换成int
                inputValue[partKey]=dataTypeCheck.isInt(inputValue[partKey])
                if(false===inputValue[partKey]){
                    return validateFormatError.inputValuePartCurrentPageValueFormatWrong
                }
                break
            case e_validatePart.recorderId:
                if(false===dataTypeCheck.isString(inputValue[partKey])){
                    return validateFormatError.inputValuePartRecorderIdValueFormatWrong
                }
                break
            case e_validatePart.recorderInfo:
                if(false===dataTypeCheck.isObject(inputValue[partKey])){
                    return validateFormatError.inputValuePartRecorderInfoValueFormatWrong
                }
                break;
            case e_validatePart.searchParams:
                if(false===dataTypeCheck.isObject(inputValue[partKey])){
                    // console.log(`searchparam errir in`)
                    return validateFormatError.inputValuePartSearchParamsValueFormatWrong
                }
                break;
            default:

                return validateFormatError.inputValuePartUndefinedPart
        }
    }
    return rightResult
}




/*
 * validateCURecorderInfoFormat:当为create/update/delete的时候，检测client输入的记录格式是否正确》例如 {parentBillType:{value:'val1'}}
 * eColl: 当前使用的coll
 * values: 传入的数据，所有rules（考虑到外键的情况）
 * rules：数据对应的rule define，以coll为基本单位
 * fkConfig: 外键的配置，以coll为单位
 * ******************  1/2 在validateCUInputFormat已经做过     ***************************
 * 1.
 * 2. 必须是Object(隐含不能为undefined/null)
 * *************************************************************************************************
 * 1. 必须有值，不能为''/[]/{}
 * 2. 检查key数量是否合适（不能超过rule中field的数量）
 * 3. 检测是否有重复的key（虽然客户端可能会将重复key中的最后一个传到server）
 * 4. 是否包含rule中未定义字段（防止用户随便输入字段名）.。xxxx如果是外键，要查找外键对应的rule是否存在,xxxxxx(create/update只有objectId)
 * 5.  每个key的value必须是object，且有key为value的key-value对
 *
 * xxxxxx5. 某些即使放在inputRule中，但也不能作为输入字段（比如，cDate复用作为查询 创建日期）xxxxxxx
 *
 * */
function validateCURecorderInfoFormat(recorderInfo,rule){

    let inputValueFields=Object.keys(recorderInfo)
    let collRulesFields=Object.keys(rule)

    //1. create/update的字段空（全局错误）
    if(0===inputValueFields.length){
        return validateFormatError.recorderInfoCantEmpty
    }
    //2. 判断输入的值的字段数是否超过对应rule中的字段数
    if(inputValueFields.length>collRulesFields.length){
        return validateFormatError.recorderInfoFieldNumExceed

    }
    //3. 检测是否有重复的key（虽然客户端可能会将重复key中的最后一个传到server）
    let tmpValue={}
    for(let key in recorderInfo){
        // console.log(`current key is ${key}`)
        tmpValue[key]=1 //随便设个值，因为只需统计最终key数
    }
    // console.log(`converted dup is ${JSON.stringify(tmpValue)}`)
    let tmpKeys=Object.keys(tmpValue)
    let inputKeys=Object.keys(recorderInfo)
    // console.log(`tmp key is ${JSON.stringify(tmpValue)}`)
    // console.log(`input key is ${JSON.stringify(value)}`)
    if(tmpKeys.length!==inputKeys.length){
        return validateFormatError.recorderInfoHasDuplicateField
    }
    //4. 判断输入值中的字段是否在inputRule中有定义
    for(let singleFieldName in recorderInfo){
        //必须忽略id或者_id，因为没有定义在rule中（在创建doc时，这是自动生成的，所以创建上传的value，无需对此检测；如果rule中定义了，就要检测，并fail）
        if(singleFieldName!=='_id' && singleFieldName !=='id'){
            if(undefined===rule[singleFieldName]){
                return validateFormatError.recorderInfoFiledRuleNotDefine
            }

        }

    }

    //5. 每个key的value必须是object，且有key为value的key-value对,且value不能为undefined(可以为null，说明update的时候要清空字段)
    for(let singleField in recorderInfo){
        //5.1 field是否为对象
        if(false===dataTypeCheck.isObject(recorderInfo[singleField])){
            return validateFormatError.recorderInfoFormatWrong
        }
        //5.2 此object是否只有一个key
        if(Object.keys(recorderInfo[singleField]).length!==1){
            return validateFormatError.recorderInfoFieldValueFiledNumNot1
        }
        //5.3. 且此key为value
        if(false==='value' in recorderInfo[singleField]){
            return validateFormatError.recorderInfoFieldValueFiledWrong
        }
        //null值表示update的时候，要删除这个field，所以是valid的值
        /*        if(null===recorderInfo[singleField]['value']){
         return validateFormatError.valueNotDefineWithRequireTrue
         }*/
    }

    return rightResult
}

/*          delete操作时，对recorderInfo part的格式检查
* delete格式必须是:{id:{value:}}或者{_id:{value:}}，因为id不在rule中定义，所以要单独抽出检测
*
* step：
*
* 1. key只能1个
* 2. key名必须是 id/_id
* 3. key的值必须是object，
* 4. key的值（object）只有一个key
* 5. id值（object）的key为value
* */
/*function validateDelRecorderInfoFormat(recorderInfo){

    //1 只能有一个key
    if(Object.keys(recorderInfo).length!==1){
        return validateFormatError.delRecorderInfoFieldNumNot1
    }
    //2 key的名称为id/_id
    if(false==='id' in recorderInfo && false==='_id' in recorderInfo){
        return validateFormatError.delRecorderInfoFieldNameWrong
    }

    //获取key name，可能是id或者_id
    for(let idKeyName in recorderInfo){
        //3 id/_id的值必须是object
        if(false===dataTypeCheck.isObject(recorderInfo[idKeyName])){
            return  validateFormatError.delRecorderInfoFormatWrong
        }
        //4 id/_id的值（object），只有一个key
        if(1!==Object.keys(recorderInfo[idKeyName]).length){
            return validateFormatError.delRecorderInfoFieldValueFiledNumNot1
        }
        //5 且key name必须是value
        if(false==='value' in recorderInfo[idKeyName]){
            return validateFormatError.delRecorderInfoFieldValueFiledWrong
        }
    }
return rightResult
}*/


/* 对POST输入的 查询参数 的格式检查，只检查
****************        步骤1/2/3在validateSearchInputFormat已经检查过      ********************
 1.inputSearch是否为object，
 2，inputSearch是否为空
 3 inputSearch中是否有currentPage和searchParams2个key
 *********************************************************************************************
 1. 如果searchParams空，返回rc：0

 2. searchParams中字段数小于rule的字段数每个key（字段）是否有对应的db字段，如果是外键，还要检查对应值是否为对象，且其中的冗余字段是否有定义
 2. 字段值不为空
 3. 调用subValidateInputSearchFormat进行值的检测
 *           1.inputSearch
 *           {
 currentPage:1,
 searchaParams:{
 name:[{value:'name1'},{value:'name2'}],
 age:[{value:18,compOp:'gt'},{value:20,compOp:'eq'}],
 parentBillType:
 {
 name:[{value:'asdf'},{value:'fda'}],
 age:[{value:12, compOp:'gt'}, {value:24, compOp:'lt'}]
 }
 }
 }
 *           client传入的搜索参数，以coll为单位。因为使用独立的函数进行处理，所以可以和validateInput的输入参数不一致.如此可以简化对格式的检查步骤
 *           父函数validateinputSearchFormat只检查字段是否有值，至于值的格式，由subValidateInputSearchFormat检测（因为普通字段和外键字段格式类似，可以调用同一个函数来简化操作）
 *           2. fkAdditionalFieldsConfig
 *           基于coll
 *           返回{rc:0,msg:'xxxx}
 * */
function validateSearchParamsFormat(searchParams,fkAdditionalFieldsConfig,collName,inputRules) {
    let inputValueFields=Object.keys(searchParams)
    let collRulesFields=Object.keys(inputRules[collName])
// console.log(`inputValueFields is ${JSON.stringify(inputValueFields)}`)
    //0. searchParams的字段空（无任何查询条件，直接返回rc：0）
    if(0===inputValueFields.length){
        console.log(`empty search params`)
        return rightResult
    }
    //1. 判断输入的值的字段数是否超过对应rule中的字段数
    if(inputValueFields.length>collRulesFields.length){
        return validateFormatError.searchParamsFieldsExceed
        // return result
    }
/*    //2. 判断输入值中的字段是否在inputRule中有定义
    for(let fieldName in searchParams){
        if(undefined===inputRules[collName][fieldName]){
            result=validateValueError.unexceptSearchField(fieldName)
            return result
        }
    }*/
    //searchParams.searchParam中不空，则检查每个key（字段）是否有对应的db字段，如果是外键，还要检查对应的冗余字段是否有定义
    if(false===dataTypeCheck.isEmpty(searchParams)){
        for (let singleFieldName in searchParams) {
            //1  是否有对应的rule（说明字段在数据库中有定义，而不是notExist的字段）
            if(false===singleFieldName in inputRules[collName]){
                return validateFormatError.searchParamsFieldNoRelatedRule
            }
            //2 普通字段，检测是否字段值为空(空的话根本就无需字段了嘛)
            if(!fkAdditionalFieldsConfig[singleFieldName]){
                if(true===dataTypeCheck.isEmpty(searchParams[singleFieldName])){
                    return validateFormatError.searchParamsFiledValueCantEmpty
                }
                //5 调用validateSingleSearchParamsFormat检查冗余字段的值的格式
console.log(`single search params field is ${JSON.stringify(searchParams[singleFieldName])}`)
                //console.log(`input value rule is ${JSON.stringify(searchParams[singleFieldName])}`)
                let singleFiledValueCheckResult=validateSingleSearchParamsFormat(searchParams[singleFieldName],inputRules[collName][singleFieldName])
console.log(`single search params field result is ${JSON.stringify(singleFiledValueCheckResult)}`)
                if(singleFiledValueCheckResult.rc>0){
                    return singleFiledValueCheckResult
                }
            }
            //4.2 是外键，检查是否为对象，且冗余字段是否定义
            if(fkAdditionalFieldsConfig[singleFieldName]){
                if(false===dataTypeCheck.isObject(searchParams[singleFieldName])){
                    return validateFormatError.searchParamsFKFiledValueNotObject
                }
                let fkConfig=fkAdditionalFieldsConfig[singleFieldName]
                for(let fkRedundantFieldName in searchParams[singleFieldName]){
                    //4.2.1 外键中的冗余字段是否在inputRule中有对应的rule存在
                    if(false===fkRedundantFieldName in inputRules[fkConfig['relatedColl']]){
                        return validateFormatError.searchParamsFKNoRelatedRule
                    }
                    //4.2.1 外键中的冗余字段的值是否为空
                    if(true===dataTypeCheck.isEmpty(searchParams[singleFieldName][fkRedundantFieldName])){
                        return validateFormatError.searchParamsFKFiledValueCantEmpty
                    }
                    //5 调用validateSingleSearchParamsFormat检查冗余字段的值的格式
                    let singleFiledValueCheckResult=validateSingleSearchParamsFormat(searchParams[singleFieldName][fkRedundantFieldName],inputRules[fkConfig['relatedColl']][fkRedundantFieldName])
                    if(singleFiledValueCheckResult.rc>0){
                        return singleFiledValueCheckResult
                    }
                }
            }
        }
    }

    return rightResult
}


/*
 * fieldValue:前提，不为空。必须是
 * 1.数组，2. 不能为空（没有元素），3 长度不能超过限制
 * 4.每个元素必须是对象 5 每个元素的key不能超过2个 6 每个元素必须有value这个key，
 * 7.如果是非字符，那么还必须有compOp这个key   7.2  compOp必须在指定范围内
 *
 * 输入参数：
 * 1 fieldValue：单个字段的输入值（普通字段或者外键的冗余字段）数组
 * 2 fieldRule：fieldValue对应的rule
 * */
function validateSingleSearchParamsFormat(fieldValue,fieldRule){
    let expectKey=["value","compOp"]
    //1 是否为数组
    if (false === dataTypeCheck.isArray(fieldValue)) {
        return validateFormatError.singleSearchParamsValueMustBeArray
    }
// console.log(`is array`)
    //2 数组是否为空
    if (true === dataTypeCheck.isEmpty(fieldValue)) {
        return validateFormatError.singleSearchParamsValueCantEmpty
    }
    //3 数组长度是否超过限制
    if (fieldValue.length > searchSetting.maxKeyNum) {
        return validateFormatError.singleSearchParamsValueLengthExceed
    }
//console.log(`fieldValue is ${fieldValue}`)
    for(let singleElement of fieldValue){
        /*        console.log(`singleElement is ${singleElement}`)
         console.log(`isobject result is ${dataTypeCheck.isObject(singleElement)}`)*/
        //4. 数组中的每个元素必须是对象
        if(false===dataTypeCheck.isObject(singleElement)){
            //console.log(`not object is ${singleElement}`)
            return validateFormatError.singleSearchParamsElementMustBeObject
        }
        //5. 数组中的每个元素的key数量不能超过2个（value和compOp）
        if(Object.keys(singleElement).length>expectKey.length){
            return validateFormatError.singleSearchParamsElementKeysLengthExceed
        }
        //6 元素中的key必须是value或者compOp
        for(let eleKey in singleElement){
            if(-1===expectKey.indexOf(eleKey)){
                return validateFormatError.singleSearchParamsElementContainUnexpectKey
            }
        }

        //7. 数组中的每个元素必须有value这个key
        if(false === 'value' in singleElement){
            return validateFormatError.singleSearchParamsElementMissKeyValue
        }
        //8 如果字段是非字符的类型，要有compOp；否则，不能有compOP
// console.log(`fieldRule.type is ${JSON.stringify(fieldRule)}`)
        if(dataType.number===fieldRule.type || dataType.int===fieldRule.type || dataType.float===fieldRule.type|| dataType.date===fieldRule.type){
            //7.1 检查是否有compOp
            if(false==='compOp' in singleElement){
                return validateFormatError.singleSearchParamsElementMissKeyCompOp
            }
            //7.2 compOp的值是否为预定义之一
            if(false===singleElement['compOp'] in compOp){
                return validateFormatError.singleSearchParamsElementCompOpWrong
            }
        }else{
            //7.1 检查不能有compOp
            if(true==='compOp' in singleElement){
                return validateFormatError.singleSearchParamsElementCantContainCompOp
            }
        }
    }
    return rightResult
}

/*      对filterFieldValue（为单个字段提供autoComplete的功能） {field1:keyword} or {billType:{name:keyword}}     */
/*
* 1. 必须是object
* 2. 必须只有一个key
* 3. key必须位于rule中
* 4. value必须是字符/数字，或者object
* 5. 如果这个key的value是object（外键），
* 5.1 只能有一个key
* 5.2 key是否在fkConfig中有定义（只有外键，查询值才能为object）
* 5.3 那么这个object的key必须fkConfig中的定义一致。
*       {parentBillType:{name:{value:keyword}}}
*       fkConfig:{parentBillType:{relatedColl:collEnum.billType,nestedPrefix:'parentBillTypeFields',forSelect:'name',forSetValue:['name']}}
*       name必须在fkConfig的forSetValue中
* 5.4 值必须是字符/数字
* */
function validateFilterFieldValueFormat(filterFieldValue,collFKConfig,collRule){
    //1. 必须是object
    if(false===dataTypeCheck.isObject(filterFieldValue)){
        return validateFormatError.filterFieldValueNotObject
    }
    //2. 必须只有一个key
    if(1!==Object.keys(filterFieldValue).length){
        return validateFormatError.filterFieldValueFieldNumNot1
    }
    //只有一个key，所以可以直接取出
    let fieldName=Object.keys(filterFieldValue)[0]

    //3. key必须位于rule中
    if(false===fieldName in collRule){
        return validateFormatError.filterFieldValueFieldNotInRule
    }

    //4 value必须是数字/字符/对象
    if(false===dataTypeCheck.isInt(filterFieldValue[fieldName]) && false===dataTypeCheck.isFloat(filterFieldValue[fieldName]) && false===dataTypeCheck.isString(filterFieldValue[fieldName]) && false===dataTypeCheck.isObject(filterFieldValue[fieldName])){
        return validateFormatError.filterFieldValueTypeWrong
    }

    //5 如果是对象
    if(true===dataTypeCheck.isObject(filterFieldValue[fieldName])){
        //5.1 只能有一个key
        if(1!==Object.keys(filterFieldValue[fieldName]).length){
            return validateFormatError.filterFieldValueFKFieldNumNot1
        }

        let fkFieldName=Object.keys(filterFieldValue[fieldName])[0]
        // console.log(`fkFieldName is ${fkFieldName}`)
        // console.log(`fieldName is ${fieldName}`)
        // console.log(`collFKConfig is ${JSON.stringify(collFKConfig)}`)

        //5.2 此key必须在fkConfig有定义（授权的外键）
        if(false===fieldName in collFKConfig){
            // console.log(`result is ${fieldName in collFKConfig}`)
            return validateFormatError.filterFieldValueFKFieldNotFK
        }
        //5.3 key必须位于fkConfig的forSetValue中
        if(-1===collFKConfig[fieldName]['forSetValue'].indexOf(fkFieldName)){
            return validateFormatError.filterFieldValueFKFieldNoRelateField
        }
        //5.4 value必须是数字/字符
        if(false===dataTypeCheck.isNumber(filterFieldValue[fieldName][fkFieldName]) && false===dataTypeCheck.isInt(filterFieldValue[fieldName][fkFieldName]) && false===dataTypeCheck.isString(filterFieldValue[fieldName][fkFieldName])){
            return validateFormatError.filterFieldValueTypeWrong
        }
    }

    return rightResult

}
/*       对static输入的查询参数检查           */
function validateStaticInputFormat(values){
    //0 values必须是对像
    if(false===dataTypeCheck.isObject(values)){
        return validateFormatError.staticValuesTypeWrong
    }
    //1 必须包含searchParams，且为对象
    if(false==='searchParams' in values){
        return validateFormatError.staticValuesFormatMissSearchParams
    }
    if(false===dataTypeCheck.isObject(values['searchParams'])){
        return validateFormatError.staticValuesSearchParamsMustBeObject
    }

    //2 必须包含currentPage，且为整数
    if(false==='currentPage' in values){
        return validateFormatError.staticFormatMisCurrentPage
    }
    if(false===dataTypeCheck.isInt(values['currentPage'])){
        return validateFormatError.staticCurrentPageMustBeInt
    }
    return rightResult
}

/*          对static的searchParams的结构进行检查        */
function validateStaticSearchParamsFormat(searchParams,inputRules){
    if(false===dataTypeCheck.isEmpty(searchParams)){
        //let searchParams=searchParams['searchParams']
        for (let singleFieldName in searchParams) {
            //3  是否有对应的rule（说明字段在数据库中有定义，而不是notExist的字段）
            if(false===singleFieldName in inputRules){
                return validateFormatError.staticSearchParamsFieldNoRelatedRule
            }
            //4 对应字段的搜索值不能为空
            if(true===dataTypeCheck.isEmpty(searchParams[singleFieldName])){
                return validateFormatError.staticSearchParamsFiledValueCantEmpty
            }

        }
    }
    return rightResult
}


module.exports={
    validateReqBody,//检查req.body.values是否存在

    validatePartFormat, //检测整个输入是否为object，此输入中的part的value格式是否正确

    // validateCUInputFormat,//调用validatePartFormat，检测create/update 输入值的格式
    
    validateCURecorderInfoFormat,//对create/update操作的recorderInfo进行检查（需要rule配合）
    //validateDelRecorderInfoFormat,//对cdelete操作的recorderInfo进行检查（只含id，所以无需rule配合） //暂时不需要了，通过单独的part：recorderId来提供id/_id


    // validateSearchInputFormat, //检查总体格式，调用validatePartFormat
    validateSearchParamsFormat,
    validateSingleSearchParamsFormat,

    validateFilterFieldValueFormat, //对ilterFieldValue（为单个字段提供autoComplete的功能） {field1:{value:keyword}} or {billType:{name:{value:keyword}}}

    validateStaticInputFormat,
    validateStaticSearchParamsFormat,
}