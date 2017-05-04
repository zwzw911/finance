/**
 * Created by wzhan039 on 2017-01-25.
 * 在server端执行各种数据的转换处理
 * 1. subGenNativeSearchCondition/genNativeSearchCondition： 根据传入的searchParams，产生对应mongodb的搜索参数
 * 2. convertCreateUpdateValueToServerFormat: 将client端传入的数据field:{value:'xxx'}===> field:'xxx'，以便mongodb使用
 * 2. constructCreateCriteria:对传入的create的参数，删除其中value为null的字段
 * 3. constructUpdateCriteria：对传入的update的参数，将其中value为null的字段，转换成mongodb中unset
 */

var dataTypeCheck=require('./validateInput/validateHelper').dataTypeCheck
var dataType=require('../define/enum/validEnum').dataType
var compOp=require('../define/enum/node').compOp
var inputRules=require('../define/validateRule/inputRule').inputRule //genNativeSearchCondition
/*将前端传入的search value转换成mongodb对应的select condition（如此方便在mongodb中直接使用，来进行调试）。
 *  返回一个object {field；{condition}}
 * 分成2个函数，好处是层次清楚：
 *       主函数负责把输入拆解成field:[{value:xx,compOp:'gt'},{value:yyy,compOp:'lt'}]的格式，
 *       子函数负责处理元素中所有的值，并转换成对应的condition
 * 输入参数：
 *           1.inputSearch
 *           name:[{value:'name1'},{value:'name2'}],
 age:[{value:18,compOp:'gt'},{value:20,compOp:'eq'}],
 parentBillType:
 {
 name:[{value:'asdf'},{value:'fda'}],
 age:[{value:12, compOp:'gt'}, {value:24, compOp:'lt'}]
 }
 }
 *           client传入的搜索参数，以coll为单位。因为使用独立的函数进行处理，所以可以和validateInput的输入参数不一致.如此可以简化对格式的检查步骤
 *           2. fkAdditionalFieldsConfig：：{parentBillType:{relatedColl:billtye, forSetValue:['name']}}
 *           搜索参数，如果有外键，从中获得外键对应的coll.field，查询得知对应inputRule。以coll为单位
 *           3. collName
 *           当前对哪一个coll进行搜索
 * */
var genNativeSearchCondition=function(clientSearchParams,collName,fkAdditionalFieldsConfig){
    //所有的查询条件都是 或
    let fieldsType={} //{name:dataType.string,age:dataType.int}  普通字段，只有一个key，外键：可能有一个以上的key
    let result={}
console.log(`dataTypeCheck.isEmpty(clientSearchParams) is ${JSON.stringify(dataTypeCheck.isEmpty(clientSearchParams))}`)
    //有search参数传入，则进行转换
    if(false===dataTypeCheck.isEmpty(clientSearchParams)){
        result={'$or':[]}
        for(let singleField in clientSearchParams){

            //普通字段
            if(false===singleField in fkAdditionalFieldsConfig){
                //普通的外键的变量分开（外键的必须在冗余字段的for中定义，否则会重复使用）
                let fieldValue,fieldRule,fieldValueType,fieldCondition,fieldResult={}
                fieldValue=clientSearchParams[singleField]
                fieldRule=inputRules[collName][singleField]
                /*            fieldValueType=fieldRule['type']
                 if(dataType.string===fieldValueType){
                 fieldValue=new RegExp(fieldValue,'i')
                 }*/
                fieldCondition=subGenNativeSearchCondition(fieldValue,fieldRule)
                fieldResult[singleField]=fieldCondition
                result['$or'].push(fieldResult)
            }
            //外键字段
            if(fkAdditionalFieldsConfig[singleField]){
                let fkConfig=fkAdditionalFieldsConfig[singleField]
                for(let fkRedundantField in clientSearchParams[singleField]){
                    //每个外键字段的变量要重新定义，否则fieldResult会重复push
                    let fieldValue,fieldRule,fieldValueType,fieldCondition,fieldResult={}
                    fieldValue=clientSearchParams[singleField][fkRedundantField]
                    fieldRule=inputRules[fkConfig['relatedColl']][fkRedundantField]
                    // console.log(`rules is ${JSON.stringify(rules)}`)
                    // console.log(`field rule is ${JSON.stringify(fieldRule)}`)
                    /*                console.log(`field value is ${JSON.stringify(fieldValue)}`)
                     fieldValueType=fieldRule['type']
                     console.log(fieldValueType)
                     // console.log(`field type is ${fieldRule['type']}`)
                     if(dataType.string===fieldValueType){
                     fieldValue=new RegExp(fieldValue,'i')
                     }
                     console.log(fieldValue)*/
                    fieldCondition=subGenNativeSearchCondition(fieldValue,fieldRule)
                    //外键对应的冗余父字段.子字段
                    fieldResult[`${fkConfig['nestedPrefix']}.${fkRedundantField}`]=fieldCondition
                    //使用冗余字段进行查找
                    result['$or'].push(fieldResult)
                }
            }
        }
    }

    return result
}

//放回field对应的condition（不包含fieldname，需要在主函数中自己组装）
//fieldValue是数组，其中每个元素是object：   name:[{value:‘name1’},{value:’name2’}]
function subGenNativeSearchCondition(fieldValue,fieldRule){
    let fieldDataType=fieldRule.type
    //保存最终的查询条件
    let conditionResult={}
    //如果是字符，那么把所有的值都放到$in中
    // console.log(`fieldValue is ${JSON.stringify(fieldValue)}`)
    if(dataType.string===fieldDataType){
        let inArray=[]
        for(let singleElement of fieldValue){
            // console.log(`singleElement value is ${JSON.stringify(singleElement['value'])}`)
            let value
            //是字符，且是枚举值，则查询值为整个匹配查找；否则是包含查找
            if(true==='enum' in fieldRule){
                value=singleElement['value']
            }else{
                value=new RegExp(singleElement['value'],'i')
            }

            // console.log(`value is ${JSON.stringify(value)}`)
            inArray.push(value)
        }
        // console.log(`inArray is ${JSON.stringify(inArray)}`)
        conditionResult['$in']=inArray
        // console.log(`conditionResult is ${JSON.stringify(conditionResult)}`)
    }
    //如果是数值，需要3个数组gt/lt/eq进行判别
    if(dataType.date===fieldDataType || dataType.number===fieldDataType || dataType.float===fieldDataType || dataType.int===fieldDataType){
        //存储所有数值
        let gtArray=[],ltArray=[],eqArray=[]
        for(let singleElement of fieldValue){
            let valueToBePush=singleElement['value']
            if(dataType.date===fieldDataType){
                console.log(`date  orig is ${valueToBePush}`)
                valueToBePush=new Date(valueToBePush)
                console.log(`date  converted is ${valueToBePush}`)
            }
            // console.log(`singleElement is ${JSON.stringify(singleElement)}`)
            switch (singleElement['compOp']){
                case compOp.gt:
                    gtArray.push(valueToBePush)
                    break
                case compOp.lt:
                    ltArray.push(valueToBePush)
                    break
                case compOp.eq:
                    ltArray.push(valueToBePush)
                    break
            }
        }
        /*        console.log(gtArray)
         console.log(ltArray)
         console.log(eqArray)*/
        //如果是gt/lt，只取出最小/最大值
        if(false===dataTypeCheck.isEmpty(gtArray)){
            conditionResult['$gt']=Math.min.apply(null,gtArray)
        }
        if(false===dataTypeCheck.isEmpty(ltArray)){
            conditionResult['$lt']=Math.min.apply(null,ltArray)
        }
        //如果eq，则放在$in中
        if(false===dataTypeCheck.isEmpty(eqArray)){
            conditionResult['$in']=eqArray
        }
    }
    return conditionResult
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//前端传入的数据是{filed:{value:'xxx'}}的格式，需要转换成普通的key:value mongoose能辨认的格式{filed:'xxx'}
var convertCreateUpdateValueToServerFormat=function(values){
    let result={}
    for(let key in values){
        if(values[key]['value'] || null===values[key]['value'] ){
            result[key]=values[key]['value']
        }
    }
    return result
}

//对create传入的参数进行检测，如果设置为null或者空值（空对象，空数组，空字符串），就认为无需传入db而直接删除
var constructCreateCriteria=function(formattedValues){
    for(let key in formattedValues){
        if(formattedValues[key]===null || dataTypeCheck.isEmpty(formattedValues[key])){
            delete formattedValues[key]
            continue
        }


    }

}

//对update传入的参数进行检测，如果设置为null或者空对象/数字/字符，就认为对应的field是要删除的，放入$unset中（如果此field是外键，还要把对应的冗余字段$unset掉）
//formattedValues: 经过convertClientValueToServerFormat处理的输入条件
var constructUpdateCriteria=function(formattedValues,singleCollFKConfig){
    // console.log(`fkconfig is ${JSON.stringify(singleCollFKConfig)}`)
    for(let key in formattedValues){
        if(formattedValues[key]===null || dataTypeCheck.isEmpty(formattedValues[key])){
            //{field1:null,field2:xxx}======>{'$unset':{field1;any},field2:xxx}
            //如果没有$unset字段，则新建一个
            if(undefined===formattedValues['$unset']){
                formattedValues['$unset']={}
            }
            //把null值字段放入$unset字段
            formattedValues['$unset'][key]=1
            delete formattedValues[key]
            //检查当前键是否有对应的外键设置，有的话删除对应的冗余字段
            if(true=== key in singleCollFKConfig){
                let redundancyField=singleCollFKConfig[key]['nestedPrefix']
                formattedValues['$unset'][redundancyField]=1
            }
        }
    }
    //console.log(`constructUpdateCriteria result is ${JSON.stringify(formattedValues)}`)

}

//将mongosse的document转换成object，并删除不需要在client显示的字段
var convertToClient=function(document,skipFields){
    let clientDoc=document.toObject()
    for(let fieldName of skipFields){
        delete  clientDoc[fieldName]
    }
    return clientDoc
}

module.exports={
    genNativeSearchCondition,
    convertCreateUpdateValueToServerFormat,
    constructCreateCriteria,
    constructUpdateCriteria,
    convertToClient,
}