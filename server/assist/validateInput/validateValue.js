/**
 * Created by wzhan039 on 2017-01-24.
 * 对输入到server端的数据value进行检查（基于inputRule）
 * ×××1. checkSearchValue：对GET方法，通过URL传递search参数进行检测×××
 * 2. validateRecorderInfoValue: 对recorderInfo(可能包含在create/update中)的输入值进行检测（没有拆分，就是一个函数）
 * 3. validateSearchParamsValue：遍历传入的searchParams，然后以字段为单位，调用validateSingleSearchFieldValue进行检测
 * 4. validateSingleSearchFieldValue：以字段为单位检测searchParams输入
 */
var validateHelper=require('./validateHelper')
var dataTypeCheck=validateHelper.dataTypeCheck
var generateErrorMsg=validateHelper.generateErrorMsg
var valueMatchRuleDefineCheck=validateHelper.valueMatchRuleDefineCheck
var valueTypeCheck=validateHelper.valueTypeCheck

var validateValueError=require('../../define/error/node/validateError').validateError.validateValue
var validateFormatError=require('../../define/error/node/validateError').validateError.validateFormat
// var validateFormatError=require('../../define/error/node/validateError').validateError.validateFormat
var regex=require('../../define/regex/regex').regex
var dataType=require('../../define/enum/validEnum').enum.dataType

// var rightResult={rc:0}
/*/!*      对GET的输入的搜索值进行检测（readName/readAll）     *!/
//value的格式仿照checkInput，即：{field:{value:'val1'}}
//只对字符进行搜索，那么检测是否 超出maxlength（是否为空在Model中确定）
//value：包含了fiele名字和filedvalue；inputRule：coll对应的inpuitRule
function checkSearchValue(value,inputRule){
    let rc={}
    //其实只有一个value，但是为了取key方便，使用for
    console.log(`input search is ${JSON.stringify(value)}`)
    for(let fieldName in value){

        //转换成字符，才能比较长度
        let fieldValue=value[fieldName]['value'].toString()
        console.log(`field is ${JSON.stringify(fieldName)}`)
        console.log(`value is ${JSON.stringify(fieldValue)}`)
        if(!inputRule[fieldName]){
            rc[fieldName]= validateFormatError.valueRelatedRuleNotDefine
        }
        //检测是否有maxLength定义（可以去掉，在checkRuleBaseOnRuleDefine已经检查过了）
        if(dataType.string===inputRule[fieldName]['type'] || dataType.number===inputRule[fieldName]['type']){
            if(!inputRule[fieldName]['maxLength']){
                rc[fieldName]= validateInputFormatError.needMaxLength
            }
        }

        let currentRule=inputRule[fieldName]
        let chineseName=currentRule['chineseName']
        let maxLengthDefine=currentRule['maxLength']['define']
        rc[fieldName]={}
        rc[fieldName]['rc']=0
        //判断长度是否超出maxlength
        if(true===valueMatchRuleDefineCheck.exceedMaxLength(fieldValue,maxLengthDefine)){
            rc[fieldName]['rc']=currentRule['maxLength']['error']['rc']
            rc[fieldName]['msg']=generateErrorMsg.maxLength(chineseName,maxLengthDefine,false)
        }
    }
    return rc
}*/


/*********************************************/
/*         检测create/update 输入值并返回结果        */
/*********************************************/
/*
 * inputValue:{username:{value:xxx},password:{value:yyy}} 由调用函数保证输入参数的格式正确
 * collRules： ruleDefine(以coll为单位)adminLogin。每个页面有不同的定义
 * basedOnInputValue: 对输入进行检查是，是根据inputValue的字段分别检查（true），还是根据inputRule的字段定义进行检查。
 *                   一般当create时，false，根据inputRule的字段定义进行检查（所有字段都检查）
 *                   当update是，true，只对输入的字段进行检查
 * 返回值有2种：一种是common：{rc:xxx,msg:yyy}，另外一种是对全部输入的field都进行检查，返回{field1:{rc:xxx,msg,yyy},field2:{rc:zzz,msg:aaa}}
 * */
function validateRecorderInfoValue(inputValue,collRules,basedOnInputValue=true){

    let rc={}
    let tmpResult

    /*        console.log(`input value  is ${inputValue}`)
     console.log(`input value  type is ${typeof inputValue}`)*/


    //3 确定检查的基准（要验证的field：按照input进行，还是按照rule进行）
    let base
    if(basedOnInputValue){
        base=inputValue
    }else{
        base=collRules
    }

    //itemName: 字段名称
    for (let itemName in base ){
        //console.log(`start to check fiekd ${itemName}`)
        rc[itemName]={}
        rc[itemName]['rc']=0
        //无法确定inputValue[itemName]['value']是否undefined，如果是，会报错。所以不适用变量赋值，而在之后的函数中直接传入
        //var currentItemValue=inputValue[itemName]['value']

        //console.log(`item name is ${itemName}`)
        //3.1 如果传入的是_id，那么通过regex直接判断（因为_id不定义在rule中，而是通过server端程序生成的）
        if('id'===itemName || '_id'===itemName){
            if(false===dataTypeCheck.isSetValue(inputValue[itemName]) || false===dataTypeCheck.isSetValue(inputValue[itemName]['value'])){
                rc[itemName]['rc']=validateValueError.CUDObjectIdEmpty.rc
                rc[itemName]['msg']=validateValueError.CUDObjectIdEmpty.msg
                continue
            }
            if(false===regex.objectId.test(inputValue[itemName]['value'])) {
                rc[itemName]['rc']=validateValueError.CUDObjectIdWrong.rc
                rc[itemName]['msg']=validateValueError.CUDObjectIdWrong.msg
            }
            continue
        }

        //rule的赋值
        let currentItemRule=collRules[itemName]
        let currentChineseName=collRules[itemName]['chineseName']

        //3.2 如果类型是objectId(有对应inputRule定义，主要是外键)，并且require=true，直接判断（而无需后续的检测，以便加快速度）
        if(dataType.objectId===currentItemRule['type'] ){
            // define+ require true ==>check
            // define+ require false==>check
            //  not define+ require true===>fail
            //  not define+ require false==>skip
            if(true===dataTypeCheck.isSetValue(inputValue[itemName]) && true===dataTypeCheck.isSetValue(inputValue[itemName]['value'])){
                if(false===currentItemRule['format']['define'].test(inputValue[itemName]['value'])){
                    /*                       rc[itemName]['rc']=validateError.objectIdWrong.rc
                     rc[itemName]['msg']=`${currentChineseName}：${validateError.objectIdWrong.msg}`*/
                    rc[itemName]['rc']=collRules[itemName]['format']['error']['rc']
                    rc[itemName]['msg']=generateErrorMsg.format(currentChineseName,collRules[itemName]['format']['define'],false)
                }
                // continue
            }else{
                // console.log(`field ${itemName} not define in value`)
                if(true===currentItemRule['require']['define']){
                    // console.log(`rule field ${itemName} define`)
                    rc[itemName]['rc']=collRules[itemName]['require']['error']['rc']
                    rc[itemName]['msg']=generateErrorMsg.require(currentChineseName,collRules[itemName]['require']['define'],false)
                    // continue
                }
            }
            continue
        }


        //3.3 先行判断输入值是否empty，然后赋值给变量；而不是多次使用isEmpty函数。如此，可以加快代码执行速度
        //let emptyFlag=(false=== dataTypeCheck.isSetValue(inputValue[itemName]) &&  false===dataTypeCheck.isSetValue(inputValue[itemName]['value']))
        let emptyFlag=false
        /*            console.log(`misc1 ${dataTypeCheck.isSetValue(inputValue[itemName])}`)
         console.log(`misc2 ${dataTypeCheck.isSetValue(inputValue[itemName]['value'])}`)*/
        if(false===dataTypeCheck.isSetValue(inputValue[itemName]) || false===dataTypeCheck.isSetValue(inputValue[itemName]['value'])){
            emptyFlag=true
        }

        //let currentItemValue=dataTypeCheck.isEmpty(inputValue[itemName]['value']) ? undefined:inputValue[itemName]['value']
        let currentItemValue
        //1. 是否用default代替空的inputValue
        //1 如果是require，但是value为空，那么检查是否有default设置，有的话，inputValue设成default
        let useDefaultValueFlag=false

        /*          value
         * 1. 如贵value=notSet，且require=true && default isSet，value=default
         * 2. 如果value=notSet，且require=true && default notSet，返回错误
         * 3. 如果value=notSet，且require=false,返回rc=0
         * 4. 如果value=set,require=false,继续检测
         * */
        //如果必须有值，但是只没有设；如果default存在，用default的值设置变量currentItemValue；否则用原始的inputValue设置（也就是undefined或者null）
        //if(currentItemRule['require'] && true===currentItemRule['require']['define']){
        if(true===emptyFlag){
            //console.log(currentItemRule)
            if(true===currentItemRule['require']['define']){
//console.log('require defined')
                if(currentItemRule['default'] && false===dataTypeCheck.isEmpty(currentItemRule['default'])){
//console.log('default  defined')
                    useDefaultValueFlag=true;
                    currentItemValue=currentItemRule['default']

                    //重新计算emptyFlag
                    emptyFlag=dataTypeCheck.isEmpty(currentItemValue)
                }else{
//console.log('default not defined')
                    rc[itemName]['rc']=validateValueError.CUDValueNotDefineWithRequireTrue.rc
                    rc[itemName]['msg']=`${currentItemRule['chineseName']}:${validateValueError.CUDValueNotDefineWithRequireTrue.msg}`
                    //return validateError.valueNotDefineWithRequireTrue
                    continue
                }
            }else{
                continue
            }

        }else{
            //value不为空，付给变量，以便后续操作
            currentItemValue=inputValue[itemName]['value']
        }

        //如果currentItemValue为空，说明没有获得default，或者require为false
        //3.4 如果有format，直接使用format(其后的各种rule不用继续检查)
        // console.log(`current rule is ${JSON.stringify(currentItemRule)}`)
        if(currentItemRule['format'] && currentItemRule['format']['define']){
            let formatDefine=currentItemRule['format']['define']
            // console.log( `format define is ${formatDefine}`)

            if(false===emptyFlag){
                if(false===valueMatchRuleDefineCheck.format(currentItemValue,formatDefine)){
                    rc[itemName]['rc']=currentItemRule['format']['error']['rc']
                    rc[itemName]['msg']=generateErrorMsg.format(currentChineseName,formatDefine,useDefaultValueFlag)
                }
                /*                    if(false===formatDefine.test(currentItemValue)){
                 rc[itemName]['rc']=currentItemRule['format']['error']['rc']
                 rc[itemName]['msg']=generateErrorMsg.format(currentChineseName,formatDefine,useDefaultValueFlag)
                 }*/
            }
            continue
        }

        //3.5 如果有maxLength属性，首先检查（防止输入的参数过于巨大）
        if(currentItemRule['maxLength'] && currentItemRule['maxLength']['define']){
            let maxLengthDefine=currentItemRule['maxLength']['define']
            // console.log(`maxLength: define ${maxLengthDefine}, value ${currentItemValue}`)
            if(false===emptyFlag && true===valueMatchRuleDefineCheck.exceedMaxLength(currentItemValue,maxLengthDefine)){
                rc[itemName]['rc']=currentItemRule['maxLength']['error']['rc']
                rc[itemName]['msg']=generateErrorMsg.maxLength(currentChineseName,maxLengthDefine,useDefaultValueFlag)
                continue
            }
            //继续往下检查其他rule
        }

        //3.6 检查enum(需要自定义代码而不是调用valueMatchRuleDefineCheck中的函数)
        if(currentItemRule['enum'] && currentItemRule['enum']['define']){
            let enumDefine=currentItemRule['enum']['define']
            if(false===emptyFlag){
                // if(-1===enumDefine.indexOf(currentItemValue)){
                if(false===valueMatchRuleDefineCheck.enum(currentItemValue,enumDefine)){

                    rc[itemName]['rc']=currentItemRule['enum']['error']['rc']
                    rc[itemName]['msg']=generateErrorMsg.enum(currentChineseName,enumDefine,useDefaultValueFlag)
                }
            }
            continue
        }



        //3.7 检查value的类型是否符合type中的定义
        /*console.log(currentItemValue)
         console.log(currentItemRule['type'])*/
        let result = valueTypeCheck(currentItemValue,currentItemRule['type'])
//console.log(result)
        if(result.rc && 0<result.rc){
            rc[itemName]['rc']=result.rc
            rc[itemName]['msg']=`${itemName}${result.msg}`
            continue
        }
        if(false===result){
            rc[itemName]['rc']=validateValueError.CUDTypeWrong.rc
            rc[itemName]['msg']=`${itemName}${validateValueError.CUDTypeWrong.msg}`
            continue
        }

        //3.8 检查出了maxLength/enum/format之外的每个rule进行检测
        for(let singleItemRuleName in currentItemRule){
            if('chineseName'!==singleItemRuleName && 'default'!==singleItemRuleName && 'type'!==singleItemRuleName && 'unit'!== singleItemRuleName){
                let ruleDefine=currentItemRule[singleItemRuleName]['define']
                switch (singleItemRuleName){
                    case "require":
                        if(ruleDefine){
                            if(true===emptyFlag){
                                rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.require(currentChineseName,ruleDefine,useDefaultValueFlag) //参数ruleDefine无用，只是为了函数格式统一
                            }
                        }
                        break;
                    case "minLength":
                        if(false===emptyFlag ){
                            /*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                             return validateError.minLengthDefineNotInt
                             }*/
                            if(true===valueMatchRuleDefineCheck.exceedMinLength(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.minLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                            }
                        }
                        break;
                    /*                        case "maxLength":
                     if(false===emptyFlag){
                     /!*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                     return validateError.maxLengthDefineNotInt
                     }*!/
                     if(true===valueMatchRuleDefineCheck.exceedMaxLength(currentItemValue,ruleDefine)){
                     rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                     rc[itemName]['msg']=generateErrorMsg.maxLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                     }
                     }
                     break;*/
                    case "exactLength":
                        if(false===emptyFlag){
                            if(false===valueMatchRuleDefineCheck.exactLength(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.exactLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                            }
                        }
                        break;
                    case 'max':
                        if(false===emptyFlag){
                            if(true===valueMatchRuleDefineCheck.exceedMax(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.max(currentChineseName,ruleDefine,useDefaultValueFlag,collRules[itemName]['unit'])
                            }
                        }
                        break;
                    case 'min':
                        if(false===emptyFlag){
                            if(true===valueMatchRuleDefineCheck.exceedMin(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=generateErrorMsg.min(currentChineseName,ruleDefine,useDefaultValueFlag,collRules[itemName]['unit'])
                            }
                        }
                        break;
                    /*                        case "format":
                     if(false===emptyFlag && false===valueMatchRuleDefineCheck.format(currentItemValue,ruleDefine)){
                     rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                     rc[itemName]['msg']=generateErrorMsg.format(currentChineseName,ruleDefine,useDefaultValueFlag)
                     }
                     break;*/
                    case "equalTo":
                        let equalToFiledName=collRules[itemName][singleItemRuleName]['define']

                        if(true===emptyFlag || true===dataTypeCheck.isEmpty(inputValue[equalToFiledName]['value']) || inputValue[itemName]['value']!==inputValue[equalToFiledName]['value']){
                            rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                            rc[itemName]['msg']=generateErrorMsg.equalTo(currentChineseName,collRules[equalToFiledName]['chineseName'])
                        }
                        break;
                    /*                        case 'enum':
                     if(false===valueMatchRuleDefineCheck.enum(currentItemValue,ruleDefine)){
                     rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                     rc[itemName]['msg']=generateErrorMsg.format(currentChineseName,ruleDefine,useDefaultValueFlag)
                     }
                     break;*/
                    default:
                }
            }
            //检查出错误后，不在继续检测当前item的其它rule，而是直接检测下一个item
            if(0!==rc[itemName].rc){
                break
            }
        }
        //console.log(`rc is ${rc}`)
        //没有检测出错误，对inpputValue的value进行sanity操作
        let tmpType=collRules[itemName]['type']
        if(tmpType===dataType.int || tmpType===dataType.float || tmpType===dataType.date){
            //对默认值或者inputValue进行sanity
            inputValue[itemName]['value']=valueTypeCheck(currentItemValue,tmpType)
        }
    }

    return rc
//    注意，返回的结果是对象，结构和inputValue类似，不是{rc;xxx,msg:xxx}的格式
}






/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */





/*
 * 对输入的查询 参数进行 检验，不对输入进行任何修改（即，如果参数的值不符合要求，直接报错，而不是试着更正。如此可以防止恶意输入）
 * 分成3个函数，好处是层次清楚：
 *       主函数负责把输入拆解成field:[{value:xx,compOp:'gt'},{value:yyy,compOp:'lt'}]的格式，
 *       中间函数负责遍历value中的每个元素（value是数组，其中每个元素是object）。
 *       每个元素的值最终通过checkSingleSearchValue进行判别
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
 *           4 inputRules
 *           整个inputRule，因为外键可能对应在其他coll
 * 返回: {field1:{rc:0},field2:{rc:9123.msg:'值不正确'}}
 * */
function validateSearchParamsValue(inputSearch,fkAdditionalFieldsConfig,collName,inputRules){
    let result={}
    for(let singleFieldName in inputSearch){
        //如果是普通字段
        if (undefined === fkAdditionalFieldsConfig[singleFieldName]) {
            result[singleFieldName]=validateSingleSearchFieldValue(inputSearch[singleFieldName],inputRules[collName][singleFieldName])
        }
        //如果是外键字段
        if (fkAdditionalFieldsConfig[singleFieldName]) {
            let fkConfig=fkAdditionalFieldsConfig[singleFieldName]
            for(let fkRedundantFieldName in inputSearch[singleFieldName]){
                result[singleFieldName]={}
                result[singleFieldName][fkRedundantFieldName]=validateSingleSearchFieldValue(inputSearch[singleFieldName][fkRedundantFieldName],inputRules[fkConfig['relatedColl']][fkRedundantFieldName])
            }
        }
    }
    //检查完所有的field后，才返回
    return result
}

//对单个字段（普通和外键的冗余字段）进行遍历，为其中的每个元素进行检查
//fieldValue：每个字段对应的值，为数组(数组中的每个元素是一个对象，对应此字段一个搜索条件)
//singleFieldRule：此字段的rule
//对单个字段（普通和外键的冗余字段）进行遍历，为其中的每个元素调用checkSingleSearchValue
function validateSingleSearchFieldValue(fieldValue,fieldRule){
    let chineseName=fieldRule['chineseName']
    for(let singleSearchElement of fieldValue){
        let value=singleSearchElement['value']
        let result=validateSingleElementValue(chineseName,value,fieldRule)
        if(result.rc>0){
            return result
        }
    }
    return {rc:0}
}

//需要单独定义成一个函数，在提供autoCoplete的时候，需要对单个搜索值（字符串）进行判断，就是用此函数
//singleSearchString: 要检查的值（非数组或者对象）
//singleFieldRule： 对应的rule定义
function validateSingleElementValue(chineseName,singleSearchString,singleFieldRule){
    // console.log(`function checkSingleSearchValue called`)

    let result={rc:0}
    /*    if(true===dataTypeCheck.isEmpty(singleSearchString)){
     return
     }*/
    //console.log(`called func rule is ${JSON.stringify(singleFieldRule)}`)

    /*                  不能使用format，因为不能使用minLength（只输入一个字符，也算有效的搜索值）    */
    /*if(singleFieldRule['format']){
     // console.log(`format defined`)
     let currentRule=singleFieldRule['format']
     let currentRuleDefine=currentRule['define']
     // console.log(`format defined as ${currentRuleDefine.toString()}`)
     if(false===valueMatchRuleDefineCheck.format(singleSearchString,currentRuleDefine)){
     result['rc']=currentRule['error']['rc']
     result['msg']=generateErrorMsg.format(chineseName,currentRuleDefine,false)
     // console.log(    `format check failed result is ${JSON.stringify(result)}`)
     return result
     /!*                result[singleFieldName]['rc']=currentRule['error']['rc']
     result[singleFieldName]['msg']=generateErrorMsg.format(currentRule['chineseName'],currentRuleDefine,false)*!/
     // break
     }
     }*/

    //1.2 检查value的类型是否符合type中的定义
    //  console.log(`data is ${singleSearchString}`)
    //   console.log(`data type is ${singleFieldRule['type'].toString()}`)

    let typeCheckResult = valueTypeCheck(singleSearchString,singleFieldRule['type'])
    //console.log(`data type check result is ${JSON.stringify(typeCheckResult)}`)
    if(typeCheckResult.rc && 0<typeCheckResult.rc){
        //当前字段值的类型未知
        result['rc']=typeCheckResult.rc
        result['msg']=`${chineseName}${typeCheckResult.msg}`
        return result

    }
    if(false===typeCheckResult){
        result['rc']=validateValueError.STypeWrong.rc
        result['msg']=`${chineseName}${validateValueError.STypeWrong.msg}`
        return result
    }
    //1.3 对field的每个rule检测
    for(let singleRule in singleFieldRule){
        let currentRule=singleFieldRule[singleRule]
        let currentRuleDefine=currentRule['define']
// console.log(`currentRule is ${JSON.stringify(currentRule)},currentRuleDefine is ${currentRuleDefine}`)
        switch (singleRule){
            case 'min':
                if(true===valueMatchRuleDefineCheck.exceedMin(singleSearchString,currentRuleDefine)){
                    result['rc']=currentRule['error']['rc']
                    result['msg']=generateErrorMsg.min(chineseName,currentRuleDefine,false,currentRule['unit'])
                    return result
                    /*                        result[singleFieldName]['rc']=currentRule['error']['rc']
                     result[singleFieldName]['msg']=generateErrorMsg.min(currentRule['chineseName'],currentRuleDefine,false,currentRule['unit'])*/
                }
                break;
            case 'max':
                if(true===valueMatchRuleDefineCheck.exceedMax(singleSearchString,currentRuleDefine)){
                    result['rc']=currentRule['error']['rc']
                    result['msg']=generateErrorMsg.max(chineseName,currentRuleDefine,false,currentRule['unit'])
                    return result
                    // result[singleFieldName]['rc']=currentRule['error']['rc']
                    // result[singleFieldName]['msg']=generateErrorMsg.max(currentRule['chineseName'],currentRuleDefine,false,currentRule['unit'])
                }
                break;
            //输入的参数不能为空，但是没有最小限制
            /*            case 'minLength':
             if(true===valueMatchRuleDefineCheck.exceedMinLength(singleSearchString,currentRuleDefine)){
             result['rc']=currentRule['error']['rc']
             result['msg']=generateErrorMsg.minLength(chineseName,currentRuleDefine,false)
             return result
             // result[singleFieldName]['rc']=currentRule['error']['rc']
             // result[singleFieldName]['msg']=generateErrorMsg.minLength(currentRule['chineseName'],currentRuleDefine,false)
             }
             break;*/
            case 'maxLength':
                // console.log(`max`)
                // console.log(`value is ${singleSearchString},define is ${currentRuleDefine}`)
                if(true===valueMatchRuleDefineCheck.exceedMaxLength(singleSearchString,currentRuleDefine)){
                    result['rc']=currentRule['error']['rc']
                    result['msg']=generateErrorMsg.maxLength(chineseName,currentRuleDefine,false)
                    return result
                    // result[singleFieldName]['rc']=currentRule['error']['rc']
                    // result[singleFieldName]['msg']=generateErrorMsg.maxLength(currentRule['chineseName'],currentRuleDefine,false)
                }
                break;
        }
        /*            //一个rule出错，ield的其他rule就无需检测
         if(result[singleFieldName]['rc']>0){
         break
         }*/
    }
    return result
}
/*function validateSingleSearchFieldValue(fieldValue,singleFieldRule){
    let chineseName=singleFieldRule['chineseName']
    let result={rc:0}
    //对字段的每个搜索值进行检测
    for(let singleSearchElement of fieldValue){
        let singleSearchString=singleSearchElement['value']
        // let result=checkSingleSearchValue(chineseName,singleSearchString,singleFieldRule)




        /!*    if(true===dataTypeCheck.isEmpty(singleSearchString)){
         return
         }*!/
        //console.log(`called func rule is ${JSON.stringify(singleFieldRule)}`)

        /!*                  不能使用format，因为不能使用minLength（只输入一个字符，也算有效的搜索值）    *!/
        /!*if(singleFieldRule['format']){
         // console.log(`format defined`)
         let currentRule=singleFieldRule['format']
         let currentRuleDefine=currentRule['define']
         // console.log(`format defined as ${currentRuleDefine.toString()}`)
         if(false===valueMatchRuleDefineCheck.format(singleSearchString,currentRuleDefine)){
         result['rc']=currentRule['error']['rc']
         result['msg']=generateErrorMsg.format(chineseName,currentRuleDefine,false)
         // console.log(    `format check failed result is ${JSON.stringify(result)}`)
         return result
         /!*                result[singleFieldName]['rc']=currentRule['error']['rc']
         result[singleFieldName]['msg']=generateErrorMsg.format(currentRule['chineseName'],currentRuleDefine,false)*!/
         // break
         }
         }*!/

        //1.2 检查value的类型是否符合type中的定义
        //  console.log(`data is ${singleSearchString}`)
        //   console.log(`data type is ${singleFieldRule['type'].toString()}`)

        let typeCheckResult = valueTypeCheck(singleSearchString,singleFieldRule['type'])
        //console.log(`data type check result is ${JSON.stringify(typeCheckResult)}`)
        if(typeCheckResult.rc && 0<typeCheckResult.rc){
            //当前字段值的类型未知
            result['rc']=typeCheckResult.rc
            result['msg']=`${chineseName}${typeCheckResult.msg}`
            return result

        }
        if(false===typeCheckResult){
            result['rc']=validateValueError.STypeWrong.rc
            result['msg']=`${chineseName}${validateValueError.STypeWrong.msg}`
            return result
        }
        //1.3 对field的每个rule检测
        for(let singleRule in singleFieldRule){
            let currentRule=singleFieldRule[singleRule]
            let currentRuleDefine=currentRule['define']
// console.log(`currentRule is ${JSON.stringify(currentRule)},currentRuleDefine is ${currentRuleDefine}`)
            switch (singleRule){
                case 'min':
                    if(true===valueMatchRuleDefineCheck.exceedMin(singleSearchString,currentRuleDefine)){
                        result['rc']=currentRule['error']['rc']
                        result['msg']=generateErrorMsg.min(chineseName,currentRuleDefine,false,currentRule['unit'])
                        return result
                        /!*                        result[singleFieldName]['rc']=currentRule['error']['rc']
                         result[singleFieldName]['msg']=generateErrorMsg.min(currentRule['chineseName'],currentRuleDefine,false,currentRule['unit'])*!/
                    }
                    break;
                case 'max':
                    if(true===valueMatchRuleDefineCheck.exceedMax(singleSearchString,currentRuleDefine)){
                        result['rc']=currentRule['error']['rc']
                        result['msg']=generateErrorMsg.max(chineseName,currentRuleDefine,false,currentRule['unit'])
                        return result
                        // result[singleFieldName]['rc']=currentRule['error']['rc']
                        // result[singleFieldName]['msg']=generateErrorMsg.max(currentRule['chineseName'],currentRuleDefine,false,currentRule['unit'])
                    }
                    break;
                //输入的参数不能为空，但是没有最小限制
                /!*            case 'minLength':
                 if(true===valueMatchRuleDefineCheck.exceedMinLength(singleSearchString,currentRuleDefine)){
                 result['rc']=currentRule['error']['rc']
                 result['msg']=generateErrorMsg.minLength(chineseName,currentRuleDefine,false)
                 return result
                 // result[singleFieldName]['rc']=currentRule['error']['rc']
                 // result[singleFieldName]['msg']=generateErrorMsg.minLength(currentRule['chineseName'],currentRuleDefine,false)
                 }
                 break;*!/
                case 'maxLength':
                    // console.log(`max`)
                    // console.log(`value is ${singleSearchString},define is ${currentRuleDefine}`)
                    if(true===valueMatchRuleDefineCheck.exceedMaxLength(singleSearchString,currentRuleDefine)){
                        result['rc']=currentRule['error']['rc']
                        result['msg']=generateErrorMsg.maxLength(chineseName,currentRuleDefine,false)
                        return result
                        // result[singleFieldName]['rc']=currentRule['error']['rc']
                        // result[singleFieldName]['msg']=generateErrorMsg.maxLength(currentRule['chineseName'],currentRuleDefine,false)
                    }
                    break;
            }
            /!*            //一个rule出错，ield的其他rule就无需检测
             if(result[singleFieldName]['rc']>0){
             break
             }*!/
        }


    }
    return result
}*/


/*      delete的参数objectId包含在URL中，同时POST还需要包含searchParams和currentPage，以便停留在原来的页数上
 *   此函数只是验证express是否get到了这个参数，其余的验证，通过将其放入{field:{value:'delValue'}}后，复用validateInputVale实现
 *   多次一举，为了防止在mainRouterController中require nodeError.js这个文件
 *
 * */
function validateDeleteObjectId(id){
    /*    console.log(`values isj ${values}`)
     console.log(`type is ${typeof values}`)
     console.log(`isSetValue ${dataTypeCheck.isSetValue(values)}`)
     console.log(`isEmpty ${dataTypeCheck.isEmpty(values)}`)*/
    //null和undefine无法通过软件模拟：null被当成字符传入，undefine无法找到对应的route
    //console.log(`id is ${id}`)
    //console.log(`is set value result is  ${dataTypeCheck.isSetValue(id)}`)
    //console.log(`is empty result is  ${dataTypeCheck.isEmpty(id)}`)
    if(false===dataTypeCheck.isSetValue(id) || true===dataTypeCheck.isEmpty(id)){
        return validateValueError.CUDObjectIdEmpty
    }
    if(false===regex.objectId.test(id)){
        return validateValueError.CUDObjectIdWrong
    }
    return {rc:0}
}

/*            检测static的搜索参数的格式          */
//验证是否为日期即可，无需范围
function validateStaticSearchParamsValue(searchParams,rules){
    let rc={}
    if(false===dataTypeCheck.isEmpty(searchParams)){
        for(let fieldName in searchParams){
            rc[fieldName]={}
            rc[fieldName]['rc']=0

            //根据定义的是否需要require，以及传入的值是否为空，进行判断
            let singleFiledRequireFlag=rules[fieldName]['require']
            let fieldValueEmptyFlag=dataTypeCheck.isEmpty(searchParams[fieldName]['value'])
            if(singleFiledRequireFlag && fieldValueEmptyFlag){
                rc[fieldName]['rc']=validateValueError.CUDValueNotDefineWithRequireTrue.rc
                rc[fieldName]['msg']=`${rules[fieldName]['chineseName']}:${validateValueError.CUDValueNotDefineWithRequireTrue.msg}`
                continue
                // return rules[fieldName]['require']['error']
            }
            //值为空，却并非为require，直接删除
            if(false===singleFiledRequireFlag && fieldValueEmptyFlag){
                delete searchParams[fieldName]
            }



            let fieldValue=searchParams[fieldName]['value']
            //判断类型是否符合
            let typeResult=valueTypeCheck(fieldValue,rules[fieldName]['type'])
            if(typeResult.rc && 0<typeResult.rc){
                rc[fieldName]['rc']=typeResult.rc
                rc[fieldName]['msg']=`${fieldName}${typeResult.msg}`
                continue
            }
            if(false===typeResult){
                rc[fieldName]['rc']=validateValueError.staticTypeWrong.rc
                rc[fieldName]['msg']=`${fieldName}${validateValueError.staticTypeWrong.msg}`
                continue
            }
        }
    }
    return rc
}
module.exports={
    // checkSearchValue,
    validateRecorderInfoValue,
    validateSearchParamsValue,
    validateSingleSearchFieldValue,//辅助函数，一般不直接使用
    validateSingleElementValue,//可在1，autoComplete的时候，使用   2. 被validateSingleSearchFieldValue调用
    validateDeleteObjectId,//delete比较特殊，使用POST，URL带objectID指明要删除的记录，同时body中带searchParams和currentPage，以便删除后继续定位对应的页数
    validateStaticSearchParamsValue,
}