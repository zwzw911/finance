/**
 * Created by Ada on 2017/1/23.
 * 对输入到server端的数据格式进行检查（而不检查其中的值）
 * 1. validateCUDInputFormat：总体检查createUpdateDelete输入参数（是否为对象，是否包含recorderInfo/currentPage的key，且为对象或者整数）
 * 2. validateRecorderInfoFormat： 检查recorderInfo（记录的输入值）是否符合inputRule的规定
 * 3. validateSearchInputFormat： 总体检查search（read）的输入参数，是否包含searchParams和currentPage
 * 4. validateSearchParamsFormat: 对search操作中的searchParams进行检查
 * 5. validateSingleSearchParamsFormat： 对searchParams中的单个字段的比较符值进行检测
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var dataTypeCheck=require('./validateHelper').dataTypeCheck
var searchSetting=require('../../config/global/globalSettingRule').searchSetting
var validateFormatError=require('../../define/error/node/validateError').validateError.validateFormat
var compOp=require('../../define/enum/node').node.compOp
var dataType=require('../../define/enum/validEnum').enum.dataType
var rightResult={rc:0}



/*  如果操作是create或update，检查其格式
  *     0. 必须是对象（可以为空）
  *     1. 必须包含recorderInfo，且其值为对象
  *     2. 必须包含currentPage，且其值为整数
  *
  * */
function validateCUDInputFormat(values){
    //0 values必须是对像
    if(false===dataTypeCheck.isObject(values)){
        return validateFormatError.CUDValuesTypeWrong
    }
    //1 必须包含recorderInfo，且为对象
    if(false==='recorderInfo' in values){
        return validateFormatError.CUDValuesFormatMissRecorderInfo
    }
    if(false===dataTypeCheck.isObject(values['recorderInfo'])){
        return validateFormatError.CUDValuesRecorderInfoMustBeObject
    }
    //2 必须包含currentPage，且为整数
    if(false==='currentPage' in values){
        return validateFormatError.CUDValuesFormatMisCurrentPage
    }
    if(false===dataTypeCheck.isInt(values['currentPage'])){
        return validateFormatError.CUDValuesCurrentPageMustBeInt
    }
    return rightResult
}
/*
 * validateRecorderInfoFormat:当为create/update/delete的时候，检测client输入的记录格式是否正确》例如 {parentBillType:{value:'val1'}}
 * eColl: 当前使用的coll
 * values: 传入的数据，所有rules（考虑到外键的情况）
 * rules：数据对应的rule define，以coll为基本单位
 * fkConfig: 外键的配置，以coll为单位
 * maxFieldNum：传入数据中，最大包含的字段数量（防止用户输入过大数据）
 * ******************  1/2 在validateCUDInputFormat已经做过     ***************************
 * 1.
 * 2. 必须是Object(隐含不能为undefined/null)
 * *************************************************************************************************
 * 3. 必须有值，不能为''/[]/{}
 * 4. 检查key数量是否合适（不能超过最大定义）
 * 5. 每个key的value必须是object，且有key为value的key-value对
 * 6. 是否包含rule中未定义字段（防止用户随便输入字段名）.。如果是外键，要查找外键对应的rule是否存在,
 * 7. 某些即使放在inputRule中，但也不能作为输入字段（比如，cDate复用作为查询 创建日期）
 * 7. 检测是否有重复的key（虽然客户端可能会将重复key中的最后一个传到server）
 * */
function validateRecorderInfoFormat(recorderInfo,rule,maxFieldNum){
    console.log(`recorderInfo is ${JSON.stringify(recorderInfo)}`)
/*    //1. 必须设值，不能为undefined/null
    if(false===dataTypeCheck.isSetValue(recorderInfo)){
        return validateFormatError.valueNotDefine
    }*/
/*    //2 是否为object(JSON的格式为Object)
    if(false=== dataTypeCheck.isObject(recorderInfo)){
        return validateFormatError.inputrecorderInfoTypeWrong
    }*/
    //3. 必须有值，不能为{}
    if(dataTypeCheck.isEmpty(recorderInfo)){
        return validateFormatError.recorderInfoCantEmpty
    }
    //4. 检查key数量是否合适（不能超过最大定义）
    let keys=Object.keys(recorderInfo)
console.log(`recorderInfo leys is ${JSON.stringify(keys)},length is ${keys.length},max field is ${maxFieldNum}`)
    if(keys.length>maxFieldNum){
        return validateFormatError.recorderInfoFieldNumExceed
    }
    //5. 每个key的value必须是object，且有key为value的key-value对,且value不能为null/undefined
    for(let singleField in recorderInfo){
        if(undefined===recorderInfo[singleField]['value']){
            return validateFormatError.recorderInfoFormatWrong
        }
        //null值表示update的时候，要删除这个field，所以是valid的值
        /*        if(null===recorderInfo[singleField]['value']){
         return validateFormatError.valueNotDefineWithRequireTrue
         }*/
    }

    //console.log(`fkconfig is ${JSON.stringify(fkConfig)}`)
    //6 inputValue中所有field，是否为rule中定义的（阻止传入额外字段）
    //7. 即使在inputRule中，但是也不能作为输入字段
    for(let singleFieldName in recorderInfo){
        //let
        //必须忽略id或者_id，因为没有定义在rule中（在创建doc时，这是自动生成的，所以创建上传的value，无需对此检测；如果rule中定义了，就要检测，并fail）
        if(singleFieldName!=='_id' && singleFieldName !=='id'){
            /*            let [newColl,newFieldName]=[eColl,singleFieldName]
             if(true=== singleFieldName in fkConfig){
             newColl=fkConfig[singleFieldName]['relatedColl']
             newFieldName=fkConfig[singleFieldName]['forSetValue'][0]
             console.log(`newCOll is ${newColl},newFieldName is ${newFieldName}`)
             }
             console.log(`newCOll is ${newColl},newFieldName is ${newFieldName}`)*/
            if(undefined===rule[singleFieldName]){
                //console.log(`single field name is ${singleFieldName}`)
                //console.log(`coll rule  is ${JSON.stringify(collRules)}`)
                //rc[singleFieldName]=validateFormatError.valueRelatedRuleNotDefine
                return validateFormatError.recorderInfoFiledRuleNotDefine
            }
            //skipField没有必要，因为没有定义在inputRule中field，会因为recorderInfoFiledRuleNotDefine而报错
/*            if(skipFiled.indexOf(singleFieldName)>-1){
                return validateFormatError.recorderInfoIncludeSkipFiled
            }*/
        }

    }



    //8. 检测是否有重复的key（虽然客户端可能会将重复key中的最后一个传到server）
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

    return rightResult
}


/*  如果操作是search（read），检查其格式
 *     0. 必须是对象（可以为空）
 *     1. 必须包含searchParams，且其值为对象
 *     2. 必须包含currentPage，且其值为整数
 *
 * */
function validateSearchInputFormat(values){
    //0 values必须是对像
    if(false===dataTypeCheck.isObject(values)){
        return validateFormatError.SValuesTypeWrong
    }
    //1 必须包含recorderInfo，且为对象
    if(false==='searchParams' in values){
        return validateFormatError.SValuesFormatMissSearchParams
    }
    if(false===dataTypeCheck.isObject(values['searchParams'])){
        return validateFormatError.SValuesSearchParamsMustBeObject
    }
    //2 必须包含currentPage，且为整数
    if(false==='currentPage' in values){
        return validateFormatError.SValuesFormatMisCurrentPage
    }
    if(false===dataTypeCheck.isInt(values['currentPage'])){
        return validateFormatError.SValuesCurrentPageMustBeInt
    }

    return rightResult
}

/* 对POST输入的 查询参数 的格式检查，只检查
****************        步骤1/2/3在validateSearchInputFormat已经检查过      ********************
 1.inputSearch是否为object，
 2，inputSearch是否为空
 3 inputSearch中是否有currentPage和searchParams2个key
 *********************************************************************************************
 4. 如果searchParams不为空，每个key（字段）是否有对应的db字段，如果是外键，还要检查对应值是否为对象，且其中的冗余字段是否有定义
 5. 字段值不为空
 6. 调用subValidateInputSearchFormat进行值的检测
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
// console.log(`start format check`)
/*    //1. 检查searchParams数据类型是否为obj
    if (false === dataTypeCheck.isObject(searchParams)) {
        return validateFormatError.searchParamsNotObject
    }*/
    //2  检查searchParams是否为空obj
// console.log(`input search empty check result is ${emptyObjCheckResult}`)
/*    if (true === dataTypeCheck.isEmpty(searchParams)) {
        return validateFormatError.searchParamsCanNotEmpty
    }
    //3 检查其中的currentPage是否存在，且为整数
    if(false==='currentPage' in searchParams){
        return validateFormatError.searchParamsNotContainCurrentPage
    }
    if(false===dataTypeCheck.isInt(searchParams['currentPage'])){
        return validateFormatError.searchParamsCurrentPageMustBeInt
    }
    //3 检查其中的searchParams是否存在，且为对象（可以为空）
    if(false==='searchParams' in searchParams){
        return  validateFormatError.searchParamsNotContainSearchParams
    }
    if(false===dataTypeCheck.isObject(searchParams['searchParams'])){
        return validateFormatError.searchParamsSearchParamsMustBeObject
    }*/
    //4. searchParams.searchParam中不空，则检查每个key（字段）是否有对应的db字段，如果是外键，还要检查对应的冗余字段是否有定义
    if(false===dataTypeCheck.isEmpty(searchParams)){
        //let searchParams=searchParams['searchParams']
        for (let singleFieldName in searchParams) {
            //3  是否有对应的rule（说明字段在数据库中有定义，而不是notExist的字段）
            if(false===singleFieldName in inputRules[collName]){
                return validateFormatError.searchParamsFieldNoRelatedRule
            }
            //4.1 普通字段，检测是否字段值为空
            if(!fkAdditionalFieldsConfig[singleFieldName]){
                if(true===dataTypeCheck.isEmpty(searchParams[singleFieldName])){
                    return validateFormatError.searchParamsFiledValueCantEmpty
                }
                //5 调用validateSingleSearchParamsFormat检查冗余字段的值的格式
//console.log(`input value is ${JSON.stringify(searchParams[singleFieldName])}`)
                //console.log(`input value rule is ${JSON.stringify(searchParams[singleFieldName])}`)
                let singleFiledValueCheckResult=validateSingleSearchParamsFormat(searchParams[singleFieldName],inputRules[collName][singleFieldName])
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
        if(Object.keys(singleElement).length>2){
            return validateFormatError.singleSearchParamsElementKeysLengthExceed
        }
        //6. 数组中的每个元素必须有value这个key
        if(false === 'value' in singleElement){
            return validateFormatError.singleSearchParamsElementMissKeyValue
        }
        //7 如果字段是非字符的类型
        if(dataType.number===fieldRule.type || dataType.date===fieldRule.type){
            //7.1 检查是否有compOp
            if(false==='compOp' in singleElement){
                return validateFormatError.singleSearchParamsElementMissKeyCompOp
            }
            //7.2 compOp的值是否为预定义之一
            if(false===singleElement['compOp'] in compOp){
                return validateFormatError.singleSearchParamsElementCompOpWrong
            }
        }
    }
    return rightResult
}

module.exports={
    validateCUDInputFormat,
    validateRecorderInfoFormat,
    validateSearchInputFormat,
    validateSearchParamsFormat,
    validateSingleSearchParamsFormat,
}