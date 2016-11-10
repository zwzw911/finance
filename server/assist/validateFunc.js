/**
 * Created by wzhan039 on 2016-02-25.
 * 把前端传入的input的检查工作全部放在一个文件进行处理
 * 前端传入分成2种格式：
 *          1. 普通的输入（一般为create或者update delete），格式为{field1:{value:'val1'}}
 *          2. 查询：因为update可能涉及到对外键的更新，而外键一般为objectId，显然不能在client端显示给用户objectId（客户也不可能看懂）
 *                          所以需要用一个或者多个额外的字段代表外键,同时，每个额外字段可能有多个值
 *                          格式为{normalField1:['val1'], fkField1:[{fkRelatedField1:'val1',fkRelatedField2:'val2'}, {fkRelatedField1:'val3'}]}
 *
 * 每个validate由2部分组成：input的定义和根据定义对输入进行检测
 *                  input定义包括：require,minLength,maxLength,exactLength,format,equalTo（format只在server处理）
 *                                  新增定义：min，max，file，folder：min/max：整数大小；file/folder：文件/文件夹是否存在
 *
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var fs=require('fs')


//var input_validate=require('../error_define/input_validate').input_validate




var regex=require('../define/regex/regex').regex

/*var ioredis=require('ioredis')
var ioredisClient=new ioredis()*/


/*      for CRUDGlobalSetting       */
var defaultSetting=require('../config/global/globalSettingRule').defaultSetting
var searchSetting=require('../config/global/globalSettingRule').searchSetting
//use redis to save get golbalSetting

/*var dataTypeCheck=require('../../../assist/misc').func.dataTypeCheck
var redisError=require('../../../define/error/redisError').redisError*/
//var inputValid=require('./valid').inputValid

/*              for input valid         */
//var regex=require('../define/regex/regex').regex.regex
var validateInputRuleError=require('../define/error/nodeError').nodeError.assistError.validateFunc.validateInputRuleFormat
var validateInputFormatError=require('../define/error/nodeError').nodeError.assistError.validateFunc.validateInputFormat
var validateInputSearchFormatError=require('../define/error/nodeError').nodeError.assistError.validateFunc.validateInputSearchFormat

/*var dataTypeCheck=require('../assist/misc').func.dataTypeCheck
var valueMatchRuleDefineCheck=require('../assist/misc').func.valueMatchRuleDefineCheck*/

//var fs=require('fs')
var dataType=require('../define/enum/validEnum').enum.dataType
var ruleType=require('../define/enum/validEnum').enum.ruleType


//var otherFiledNameEnum=require('../define/enum/validEnum').enum.otherFiledName

//var rightResult={rc:0}
//var CRUDGlobalSetting=require('../model/redis/common/CRUDGlobalSetting').CRUDGlobalSetting
//var async=require('async')

//var redisWrapAsync=require('./wrapAsync/db/redis/wrapAsyncRedis.js')





var rightResult={rc:0,msg:null}







/*
* 除了checkInputValue使用，其他地方也可能使用，所以单独作为一个函数
* 数值123.0复制后，实际变成123，影响程序处理方式
* */
var dataTypeCheck= {
    //是否已经赋值
    isSetValue(variant){
        return (undefined !== variant && null !== variant)
    },
    //已经赋值，赋的值是不是为空（string:空字符串；object:{},array:[]）
    isEmpty(value) {
        if (undefined === value || null === value) {
            return true
        }
        switch (typeof value) {
            case "string":
                return ( "" === value || 0 === value.length || "" === value.trim());
                break;
            case "object":
                if (true === this.isArray(value)) {
                    return 0 === value.length
                } else {
                    return 0 === Object.keys(value).length
                }
                break;
        }
        return false
    },

    isArray(obj) {
        return obj && typeof obj === 'object' && Array == obj.constructor;
    },

    isObject(obj){
        return obj && typeof obj === 'object' && Object == obj.constructor;
    },
    isString(value){
        return typeof value === 'string'
    },
//检查是否有效日期; 返回false或者转换后的日期
    isDate(date) {
        let parsedDate=new Date(date)
        if(parsedDate.toLocaleString() ===  'Invalid Date'){
            return false
        }
        return parsedDate;
        //}
    },
    isInt(value) {
        //首先检查类型，只对number或者string进行处理（否则parseInt对array也起作用）
        let tmpType=typeof value
        if(tmpType!='number' && tmpType!='string'){
            return false
        }
        let parsedInt=parseInt(value)
        if(true===isNaN(parsedInt)){
            return false
        }
        //对于字符来说，如果小数点之后是全0，认为不是整数（即'1.0'不等于'1'）
        if (typeof value == 'string') {
            /*console.log(`${value} is string`)
             console.log(parseInt(value).toString()===value)*/
            if(parsedInt.toString() !== value){
                return false
            }
        }
        if (typeof value == 'number') {
            //对于数值来说，如果小数点之后是全0，认为是整数（即1.0等于1）
            if( parsedInt !== value){
                return false
            }
        }
        return parsedInt
        //return false
    },
    //严格模式，数值
    isStrictInt(value){
        if('number'!==typeof value){
            return false
        }
        if(value!==parseInt(value)){
            return false
        }
        return true
    },
    isStrictFloat(value){
        if('number'!==typeof value){
            return false
        }
        if(value!==parseFloat(value)){
            return false
        }
        return true
    },
    //整数，但是超出int所能表示的范围（无法处理，大数会变成科学计数法，从而无法用regex判断）。所以只能处理string类型
    isNumber(value) {
        if('string' !== typeof value){
            //value=value.toString()
            return false //无法处理数字，因为大数字在赋值时被转换成科学计数法，从而无法用regex判断
        }
        return regex.number.test(value)
    },

    //对于大的数字，parseFloat会转换成科学计数法(1.23e+56)
    isFloat(value){
        //首先检查类型，只对number或者string进行处理（否则parseInt对array也起作用）
        let tmpType=typeof value
        if(tmpType!='number' && tmpType!='string'){
            return false
        }
        let parsedValue=parseFloat(value)
        if(true===isNaN(parsedValue)){
            return false
        }
        if('string' === typeof value){
            //==，string隐式转换成数字进行比较
            if( parsedValue!=value){
                return false
            }
        }

        if (typeof value == 'number') {
            if(parsedValue !== value){
                return false
            }
        }

        return parsedValue
    },


    isPositive(value) {

        let parsedValue = parseFloat(value)
/*        if(isNaN(parsedValue)){
            return false
        }*/
        return parsedValue > 0
    },
    isFolder(path) {
        return fs.statSync(path).isDirectory()
    },

    isFile(file) {
        return fs.statSync(file).isFile()
    },
}

//对dataTypeCheck进行封装
function valueTypeCheck(value, type){
    switch (type) {
        case dataType.int:
            return dataTypeCheck.isInt(value)   //返回false或者int(使用宽松模式，因为输入的都是字符)
        case dataType.float:
            return dataTypeCheck.isFloat(value)   //返回false或者int
        case dataType.string:
            return dataTypeCheck.isString(value)
        case dataType.date:
            return dataTypeCheck.isDate(value)
        case dataType.array:
            return dataTypeCheck.isArray(value)
        case dataType.object:
            return true
        case dataType.objectId:
            return true
        case dataType.file:
            return (valueMatchRuleDefineCheck.isFileFolderExist(value) && dataTypeCheck.isFile(value));
        case dataType.folder:
            return (valueMatchRuleDefineCheck.isFileFolderExist(value) && dataTypeCheck.isFolder(value))
        case dataType.number:
            return dataTypeCheck.isNumber(value)
        default:
            return validateInputFormatError.unknownDataType
    }
}


/**
 * 对Rule定义进行检测，确保定义是正确
 */
/*          rule        */
/*1. 至少定义3个字段：chineseName/type/require
 * 2
 * */
/*
* 对单个字段的所有rule定义进行检查
* coll/singleFieldName:如果字段错误，为返回值提供错误coll/field的名称（其他错误，可以使用chineseName）；singleFieldInputRules：field的rule定义
* 返回：{rc:0}或者{rc:xxxx,msg:'field的rule定义错误'}
* */
function ruleFormatCheck(collName,singleFieldName,singleFieldInputRules){
    let rc={}
    //0 检测rle必须是object
    if(false==dataTypeCheck.isObject(singleFieldInputRules)){
        return validateInputRuleError.ruleMustBeObject
    }

    //1 检查必须的field
    let mandatoryFields=['chineseName','type','require']
    for(let mandatoryField of mandatoryFields){
        //console.log(inputRules[inputRule][mandatoryField])
        if(false===dataTypeCheck.isSetValue(singleFieldInputRules[mandatoryField])){
            //console.log()
            rc['rc']=validateInputRuleError.mandatoryFiledNotExist.rc
            rc['msg']=`${singleFieldName}的规则${mandatoryField}${validateInputRuleError.mandatoryFiledNotExist.msg}`
            return rc
        }
    }
    //2 检查chineseName是否为字符，是否空，type是否在指定范围内（require由后面的rule check统一处理）
    if(false===dataTypeCheck.isString(singleFieldInputRules['chineseName'])){
        rc['rc']=validateInputRuleError.chineseNameNotString.rc
        rc['msg']=`${singleFieldName}的${validateInputRuleError.chineseNameNotString.msg}`
        return rc
    }
    if(dataTypeCheck.isEmpty(singleFieldInputRules['chineseName'])){
        rc['rc']=validateInputRuleError.chineseNameEmpty.rc
        rc['msg']=`${singleFieldName}的${validateInputRuleError.chineseNameEmpty.msg}`
        return rc
    }

    //3 检查dataTpe是否validate
    let unknownDataType=true
    for(let key in dataType){
        if(dataType[key]===singleFieldInputRules['type']){
            unknownDataType=false
            break
        }
        continue
    }
    if(true===unknownDataType){
        rc['rc']=validateInputRuleError.unknownDataType.rc
        rc['msg']=`${singleFieldName}的type的${validateInputRuleError.unknownDataType.msg}`
        return rc
    }

        //singleFieldName可以用chineseName代替，如此，更容易查看错误
    let chineseName=singleFieldInputRules['chineseName']
    //4 某些类型必须有关联rule
    //console.log(inputRules[inputRule]['type'])
    switch (singleFieldInputRules['type']){

        case dataType.int:
            if(false===dataTypeCheck.isSetValue(singleFieldInputRules['min'])){
                rc['rc']=validateInputRuleError.needMin.rc
                rc['msg']=`${chineseName}的${validateInputRuleError.needMin.msg}`
                return rc

            }
            if( false===dataTypeCheck.isSetValue(singleFieldInputRules['max'])){
                rc['rc']=validateInputRuleError.needMax.rc
                rc['msg']=`${chineseName}的${validateInputRuleError.needMax.msg}`
                return rc
            }
            break;
        //和int处理方式一样
        case dataType.float:
            if(false===dataTypeCheck.isSetValue(singleFieldInputRules['min'])){
                rc['rc']=validateInputRuleError.needMin.rc
                rc['msg']=`${chineseName}的${validateInputRuleError.needMin.msg}`
                return rc

            }
            if( false===dataTypeCheck.isSetValue(singleFieldInputRules['max'])){
                rc['rc']=validateInputRuleError.needMax.rc
                rc['msg']=`${chineseName}的${validateInputRuleError.needMax.msg}`
                return rc
            }
            break;
        case dataType.number:
            //console.log(inputRules[inputRule]['maxLength'])
            if(false===dataTypeCheck.isSetValue(singleFieldInputRules['maxLength'])){
                rc['rc']=validateInputRuleError.needMaxLength.rc
                rc['msg']=`${chineseName}的${validateInputRuleError.needMaxLength.msg}`
                //console.log(rc)
                return rc
            };
            break
        case dataType.string:
            //string: 如果即没有format，也没有enum，则必须有maxLenght
            if(false===dataTypeCheck.isSetValue(singleFieldInputRules['format']) && false===dataTypeCheck.isSetValue(singleFieldInputRules['enum'])){
                if(false===dataTypeCheck.isSetValue(singleFieldInputRules['maxLength'])){
                    rc['rc']=validateInputRuleError.needMaxLength.rc
                    rc['msg']=`${chineseName}的${validateInputRuleError.needMaxLength.msg}`
                    return rc
                };
            };

            break
        //ObjectId必须有format，用来出错时返回错误
        case dataType.objectId:
            if(false===dataTypeCheck.isSetValue(singleFieldInputRules['format'])){
                rc['rc']=validateInputRuleError.needFormat.rc
                rc['msg']=`${chineseName}的${validateInputRuleError.needFormat.msg}`
                //console.log(rc)
                return rc
            };
            break
        default:
            break;
    }

    //5 检测单个rule的格式是否正确，是否有define，是否有error，且格式为error:{rc:xxx,msg:'yyy'}
    //需要排除chineseName/type/default
    for (let singleRule in singleFieldInputRules) {
        let excludeRuleName=['chineseName','type','default']
        if(-1<excludeRuleName.indexOf(singleRule)){
            continue
        }
        //检查rule中必须的字段是否存在（rule定义是否正确）
        if (true === dataTypeCheck.isSetValue(singleFieldInputRules[singleRule])) {
            if (false === dataTypeCheck.isSetValue(singleFieldInputRules[singleRule]['define'])) {
                rc['rc'] = validateInputRuleError.ruleDefineNotDefine.rc
                rc['msg'] = `${chineseName}的${singleRule}的${validateInputRuleError.ruleDefineNotDefine.msg}`
                return rc
            }
            if (false === dataTypeCheck.isSetValue(singleFieldInputRules[singleRule]['error'])) {
                rc['rc'] = validateInputRuleError.errorFieldNotDefine.rc
                rc['msg'] = `${chineseName}的${singleRule}的${validateInputRuleError.errorFieldNotDefine.msg}`
                return rc
            }
            if (false === dataTypeCheck.isSetValue(singleFieldInputRules[singleRule]['error']['rc'])) {
                rc['rc'] = validateInputRuleError.rcFieldNotDefine.rc
                rc['msg'] = `${chineseName}的${singleRule}的${validateInputRuleError.rcFieldNotDefine.msg}`
                return rc
            }
        }
    }


    //6 检测rule define是否正确(采用严格模式，mix/max/minLength/maxLength/exactLenght为数字，format为regex，enum为数组？，date为data)
    for (let singleRule in singleFieldInputRules){
        // let currentRule=singleFieldInputRules[singleRule]
        //字段chineseName/default/type是没有define的，所以singleRuleDefine为undefined，需要skip，防止js报错:undefined

        if('chineseName'===singleRule || 'type'===singleRule || 'default'===singleRule){
            continue
        }

        let singleRuleDefine=singleFieldInputRules[singleRule]['define']
        if(ruleType.require===singleRule){
            if(false!==singleRuleDefine && true!==singleRuleDefine){
                rc['rc']=validateInputRuleError.requireDefineNotBoolean.rc
                rc['msg']=`${chineseName}的${validateInputRuleError.requireDefineNotBoolean.msg}`
                return rc
            }else{
                continue
            }

        }

        //对数字进行检查，必须是数字而不是字符
        if(ruleType.minLength===singleRule || ruleType.maxLength===singleRule || ruleType.exactLength===singleRule || ruleType.min===singleRule || ruleType.max===singleRule ){
            //首先检查是不是为int
            let result=dataTypeCheck.isStrictInt(singleRuleDefine)
            if(false===result){
                rc['rc']=validateInputRuleError.lengthDefineNotInt.rc
                rc['msg']=`${chineseName}的${validateInputRuleError.lengthDefineNotInt.msg}`
                return rc
            }
            //如果是min/max/exactLength，还要检查值是否小于0
            if(ruleType.minLength===singleRule || ruleType.maxLength===singleRule || ruleType.exactLength===singleRule){
                if(singleRuleDefine<=0){
                    rc['rc']=validateInputRuleError.lengthDefineMustLargeThanZero.rc
                    rc['msg']=`${chineseName}的规则${singleRule}的${validateInputRuleError.lengthDefineMustLargeThanZero.msg}`
                    return rc
                }
            }
            // currentRule['define']=result
            continue
            //}

        }

        if(ruleType.format===singleRule){

            continue
        }

        if(ruleType.equalTo===singleRule){

            continue
        }

        if(ruleType.enum===singleRule){
            if(false===dataTypeCheck.isArray(singleRuleDefine)){
                rc['rc']=validateInputRuleError.enumDefineNotArray.rc
                rc['msg']=`${chineseName}的${validateInputRuleError.enumDefineNotArray.msg}`
                return rc
            }
            //数组lenght是否大于1
            if(singleRuleDefine.length<1){
                rc['rc']=validateInputRuleError.enumDefineLengthMustLargerThanZero.rc
                rc['msg']=`${chineseName}的${validateInputRuleError.enumDefineLengthMustLargerThanZero.msg}`
                return rc
            }
            continue

        }

    }

    //7 default单独处理（只检查类型是否正确，而不检查是否在范围内，范围检查由checkInputValue执行）
    //7.1 不为空，检查dataType
    if(dataTypeCheck.isSetValue(singleFieldInputRules['default'])){
        let singleFiledDataType = singleFieldInputRules['type']
        let checkResult
        /*            console.log(`default value is ${singleFieldInputRules['default']}`)
         console.log(`is set value is ${dataTypeCheck.isSetValue(singleFieldInputRules['default'])}`)*/
        switch (singleFiledDataType) {
            case dataType.string:
                if (false === dataTypeCheck.isString(singleFieldInputRules['default'])) {
                    return validateInputRuleError.ruleDefineWrong(collName, singleFieldName, 'default')
                }
                break;
            case dataType.int:
                checkResult = dataTypeCheck.isStrictInt(singleFieldInputRules['default'])
                if (false === checkResult) {
                    return validateInputRuleError.ruleDefineWrong(collName, singleFieldName, 'default')
                }

                break
            case dataType.float:
                checkResult = dataTypeCheck.isStrictFloat(singleFieldInputRules['default'])
                if (false === checkResult) {
                    return validateInputRuleError.ruleDefineWrong(collName, singleFieldName, 'default')
                } else {
                    singleFieldInputRules['default'] = checkResult
                }
                break
            case dataType.number:
                checkResult = dataTypeCheck.isNumber(singleFieldInputRules['default'])
                if (false === checkResult) {
                    return validateInputRuleError.ruleDefineWrong(collName, singleFieldName, 'default')
                } else {
                    singleFieldInputRules['default'] = checkResult
                }
                break
            //其他默认通过
            default:
                break
        }
    }

    return rightResult

}

/*
*   如果某个rule检查失败，返回对应的 msg（可读性更强点）
 */
var generateErrorMsg={
    //itemDefine无用，只是为了格式统一
    require(chineseName, itemDefine, useDefaultValueFlag){
        if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
            useDefaultValueFlag = false
        }
        let defaultMsg = useDefaultValueFlag ? '的默认值' : '';
        return `${chineseName}${defaultMsg}不能为空`
    },
    maxLength(chineseName, itemDefine, useDefaultValueFlag){
        if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
            useDefaultValueFlag = false
        }
        let defaultMsg = useDefaultValueFlag ? '的默认值' : '';
        return `${chineseName}${defaultMsg}所包含的字符数不能超过${itemDefine}个`
    },
    minLength(chineseName, itemDefine, useDefaultValueFlag){
        if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
            useDefaultValueFlag = false
        }
        let defaultMsg = useDefaultValueFlag ? '的默认值' : '';
        return `${chineseName}${defaultMsg}包含的字符数不能少于${itemDefine}个`
    },
    exactLength(chineseName, itemDefine, useDefaultValueFlag){
        if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
            useDefaultValueFlag = false
        }
        let defaultMsg = useDefaultValueFlag ? '的默认值' : '';
        return `${chineseName}${defaultMsg}包含的字符数不等于${itemDefine}个`
    },
    max(chineseName, itemDefine, useDefaultValueFlag, unit){
        if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
            useDefaultValueFlag = false
        }
        let defaultMsg = useDefaultValueFlag ? '的默认值' : '';
        unit = (undefined === unit || null === unit) ? '' : unit
        return `${chineseName}${defaultMsg}的值不能大于${itemDefine}${unit}`
    },
    min(chineseName, itemDefine, useDefaultValueFlag, unit){
        if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
            useDefaultValueFlag = false
        }
        let defaultMsg = useDefaultValueFlag ? '的默认值' : '';
        unit = (undefined === unit || null === unit) ? '' : unit
        return `${chineseName}${defaultMsg}的值不能小于${itemDefine}${unit}`
    },
    equalTo(chineseName, equalToChineseName){
        return `${chineseName}和${equalToChineseName}不相等`
    },
    format(chineseName, itemDefine, useDefaultValueFlag){
        if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
            useDefaultValueFlag = false
        }
        let defaultMsg = useDefaultValueFlag ? '的默认值' : '';
        switch (itemDefine) {
            case regex.strictPassword:
                return `${chineseName}${defaultMsg}的格式不正确，必须由6至20个字母数字和特殊符号组成`
            //break;
            case regex.loosePassword:
                return `${chineseName}${defaultMsg}的格式不正确，必须由2至20个字母数字组成`
            //break;
            case regex.userName:
                return `${chineseName}${defaultMsg}的格式不正确，必须由2至20个字符组成`
            case regex.mobilePhone:
                return `${chineseName}${defaultMsg}的格式不正确，必须由11至13个数字组成`
            case regex.originalThumbnail:
                return `${chineseName}${defaultMsg}的格式不正确，文件名由2到20个字符组成`
            //hashedThumbnail不用单独列出，是内部检查，使用default错误消息即可
            default:
                return `${chineseName}${defaultMsg}的格式不正确`
        }
    },
    //itemDefine无用，只是为了格式统一
    enum(chineseName, itemDefine, useDefaultValueFlag){
        if (undefined === useDefaultValueFlag || null === useDefaultValueFlag) {
            useDefaultValueFlag = false
        }
        let defaultMsg = useDefaultValueFlag ? '的默认值' : '';
        return `${chineseName}${defaultMsg}不正确`
    }
}

/*
*   值是否满足对应的rule
 */
var valueMatchRuleDefineCheck={
    exceedMaxLength(value, maxLength) {
        // console.log( `exceed enter`)
        //length属性只能在数字/字符/数组上执行
        //其实只有number和string才有maxLength（在rule中定义）
        if(false===dataTypeCheck.isArray(value) && false===dataTypeCheck.isInt(value) && false===dataTypeCheck.isFloat(value) && false===dataTypeCheck.isString(value)){
            // console.log( `exceed:type wrong`)
            return false
        }
        //数字需要转换成字符才能执行length
        //isFloat和isInt返回false或者数字，所以必须使用false!==的格式判断
        if(false!==dataTypeCheck.isFloat(value) || false!==dataTypeCheck.isInt(value)){
            // console.log( `exceed:type number`)
            return value.toString().length > maxLength
        }
        // console.log(`exceed function. value is ${value},define is ${maxLength}`)
        return value.length > maxLength
    },

    exceedMinLength(value, minLength) {
        if(false===dataTypeCheck.isArray(value) && false===dataTypeCheck.isInt(value) && false===dataTypeCheck.isFloat(value) && false===dataTypeCheck.isString(value)){
            return false
        }
        //数字需要转换成字符才能执行length
        if(dataTypeCheck.isFloat(value) || dataTypeCheck.isInt(value)){
            return value.toString().length < minLength
        }
        return value.length < minLength
    },

    exactLength(value, exactLength) {
        if(false===dataTypeCheck.isArray(value) && false===dataTypeCheck.isInt(value) && false===dataTypeCheck.isFloat(value) && dataTypeCheck.isString(value)){
            return false
        }
        //数字需要转换成字符才能执行length
        if(dataTypeCheck.isFloat(value) || dataTypeCheck.isInt(value)){
            return value.toString().length === exactLength
        }
        return value.length === exactLength
    },

    //广义比较，包括null和undefined的比较
    equalTo(value, equalToValue) {
        //return (false===dataTypeCheck.isEmpty(value) && value===equalToValue)
        if(value instanceof Date && equalToValue instanceof Date){
            return value.toLocaleString()===equalToValue.toLocaleString()
        }
        return value === equalToValue
    },

    format(value, format) {
        return format.test(value)
    },

    enum(value,define){
        return -1!==define.indexOf(value)
    },
    //以下函数只能支持数值，必须由调用者确保参数的类型
    exceedMax(value, definedValue) {
        return parseFloat(value) > parseFloat(definedValue)
    },
    exceedMin(value, definedValue) {
        return parseFloat(value) < parseFloat(definedValue)
    },

    isFileFolderExist(value) {
        return fs.existsSync(value)
    },
}
/**
 * Created by wzhan039 on 2016-02-25.
 * 把前端传入的input的检查工作全部放在一个文件进行处理
 * 2部分：input的定义（require,minLength,maxLength,exactLength,format,equalTo），format只在server处理
 * 新增定义：min，max，file，folder：min/max：整数大小；file/folder：文件/文件夹是否存在
 *         对应的函数处理
 */


/*          value
* 1. 如贵value=notSet，那么require=true && default isSet，value=default
* 2. 如果value=notSet，那么require=true && default notSet，返回错误
* 3. 如果value=notSet，那么require=false,返回rc=0
* */

/*
* validateInputFormat:检测client输入的格式是否正确》例如 {parentBillType:{value:'val1'}}
* values: 传入的数据，以coll为基本单位
* rules：数据对应的rule define，以coll为基本单位
* maxFieldNum：传入数据中，最大包含的字段数量（防止用户输入过大数据）
* 1. 必须设值，不能为undefined/null
* 2. 必须是Object
* 3. 必须有值，不能为''/[]/{}
* 4. 检查key数量是否合适（不能超过最大定义）
* 5. 每个key的value必须是object，且有key为value的key-value对
* 6. 是否包含rule中未定义字段（防止用户随便输入字段名）
* 7. 检测是否有重复的key（虽然客户端可能会将重复key中的最后一个传到server）
* */
function validateInputFormat(values,rules,maxFieldNum){
    //1. 必须设值，不能为undefined/null
    if(false===dataTypeCheck.isSetValue(values)){
        return validateInputFormatError.valueNotDefine
    }
    //2 是否为object(JSON的格式为Object)
    if(false=== dataTypeCheck.isObject(values)){
        return validateInputFormatError.inputValuesTypeWrong
    }
    //3. 必须有值，不能为{}
    if(dataTypeCheck.isEmpty(values)){
        return validateInputFormatError.valueEmpty
    }
    //4. 检查key数量是否合适（不能超过最大定义）
    let keys=Object.keys(values)

    if(keys.length>maxFieldNum){
        return validateInputFormatError.inputValueFieldNumExceed
    }
    //5. 每个key的value必须是object，且有key为value的key-value对
    for(let singleField in values){
        if(false===dataTypeCheck.isSetValue(values[singleField]['value'])){
            return validateInputFormatError.inputValuesFormatWrong
        }
    }
    //6 inputValue中所有field，是否为rule中定义的（阻止传入额外字段）
    for(let singleFieldName in values){
        //必须忽略id或者_id，因为没有定义在rule中（在创建doc时，这是自动生成的，所以创建上传的value，无需对此检测；如果rule中定义了，就要检测，并fail）
        if(singleFieldName!=='_id' && singleFieldName !=='id'){
            if(undefined===rules[singleFieldName ]){
                //console.log(`single field name is ${singleFieldName}`)
                //console.log(`coll rule  is ${JSON.stringify(collRules)}`)
                //rc[singleFieldName]=validateInputFormatError.valueRelatedRuleNotDefine
                return validateInputFormatError.valueRelatedRuleNotDefine
            }
        }

    }
    //7. 检测是否有重复的key（虽然客户端可能会将重复key中的最后一个传到server）
    let tmpValue={}
    for(let key in values){
        // console.log(`current key is ${key}`)
        tmpValue[key]=1 //随便设个值，因为只需统计最终key数
    }
    // console.log(`converted dup is ${JSON.stringify(tmpValue)}`)
    let tmpKeys=Object.keys(tmpValue)
    let inputKeys=Object.keys(values)
    // console.log(`tmp key is ${JSON.stringify(tmpValue)}`)
    // console.log(`input key is ${JSON.stringify(value)}`)
    if(tmpKeys.length!==inputKeys.length){
        return validateInputFormatError.inputValueHasDuplicateField
    }

    return rightResult
}


/*********************************************/
/*         主函数，检测input并返回结果        */
/*********************************************/
/*
* inputValue:{username:{value:xxx},password:{value:yyy}} 由调用函数保证输入参数的格式正确
* collRules： ruleDefine(以coll为单位)adminLogin。每个页面有不同的定义
* basedOnInputValue: 对输入进行检查是，是根据inputValue的字段分别检查（true），还是根据inputRule的字段定义进行检查。
*                   一般当create时，false，根据inputRule的字段定义进行检查（所有字段都检查）
*                   当update是，true，只对输入的字段进行检查
* 返回值有2种：一种是common：{rc:xxx,msg:yyy}，另外一种是对全部输入的field都进行检查，返回{field1:{rc:xxx,msg,yyy},field2:{rc:zzz,msg:aaa}}
* */
function validateInputValue(inputValue,collRules,basedOnInputValue=true){

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
                rc[itemName]['rc']=validateInputFormatError.objectIdEmpty.rc
                rc[itemName]['msg']=validateInputFormatError.objectIdEmpty.msg
                continue
            }
            if(false===regex.objectId.test(inputValue[itemName]['value'])) {
                rc[itemName]['rc']=validateInputFormatError.objectIdWrong.rc
                rc[itemName]['msg']=validateInputFormatError.objectIdWrong.msg
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
                    rc[itemName]['rc']=validateInputFormatError.valueNotDefineWithRequireTrue.rc
                    rc[itemName]['msg']=`${currentItemRule['chineseName']}:${validateInputFormatError.valueNotDefineWithRequireTrue.msg}`
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
            rc[itemName]['rc']=validateInputFormatError.typeWrong.rc
            rc[itemName]['msg']=`${itemName}${validateInputFormatError.typeWrong.msg}`
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

/*      对GET的输入的搜索值进行检测（readName/readAll）     */
//value的格式仿照checkInput，即：{field:{value:'val1'}}
//只对字符进行搜索，那么检测是否 超出maxlength（是否为空在Model中确定）
//value：包含了fiele名字和filedvalue；inputRule：coll对应的inpuitRule
function checkSearchValue(value,inputRule){
    let rc={}
    //其实只有一个value，但是为了取key方便，使用for
    for(let fieldName in value){

        //转换成字符，才能比较长度
        let fieldValue=value[fieldName]['value'].toString()
        if(!inputRule[fieldName]){
            rc[fieldName]= validateInputFormatError.valueRelatedRuleNotDefine
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
}



/* 对POST输入的 查询参数 的格式检查(复杂搜索：多个字段，每个字段多个搜索值)
*           1.inputSearch:{field:[value1,value2]}
*           client传入的搜索参数，以coll为单位。因为使用独立的函数进行处理，所以可以和validateInput的输入参数不一致.如此可以简化对格式的检查步骤
*           2. fkAdditionalFieldsConfig
*           基于coll
*           返回{rc:0,msg:'xxxx}
* */
function validateInputSearchFormat(inputSearch,fkAdditionalFieldsConfig,collName,inputRules) {
// console.log(`start format check`)
    //1. 检查inputSearch数据类型是否为obj
    let typeResult = dataTypeCheck.isObject(inputSearch)
    if (false === typeResult) {
        return validateInputSearchFormatError.inputSearchNotObject
    }
    //2  检查inputSearch是否为空obj
    let emptyObjCheckResult = dataTypeCheck.isEmpty(inputSearch)
// console.log(`input search empty check result is ${emptyObjCheckResult}`)
    if (true === emptyObjCheckResult) {
        return validateInputSearchFormatError.inputSearchCanNotEmpty
    }
    //3. 检查inputSearch的每个key，对应的value是否 3.0 有对应的inputRule（换句话，字段名是正确的） 3.1 为数组  3.2 是否为空 3.3 数组长度是否超过限制 3.4数组元素必须是对象，且不能为空 3.5 数组元素的key必须是在fkAdditionalConfig中有定义的
    for (let singleFieldName in inputSearch) {
// console.log(`current field  is ${singleFieldName}, coll is ${JSON.stringify(collName)}`)
        //3.0  是否有对应的rule
        if(undefined===inputRules[collName][singleFieldName]){
            return validateInputSearchFormatError.inputSearchNoRelatedRule
        }
// console.log(`rule exist`)
        let objValue = inputSearch[singleFieldName]
        let objValueTypeCheck = dataTypeCheck.isArray(objValue)
        //3.1 是否为数组
        if (false === objValueTypeCheck) {
            return validateInputSearchFormatError.inputSearchValueMustBeArray
        }
// console.log(`is array`)
        //3.2 数组是否为空
        let objValueEmptyCheck = dataTypeCheck.isEmpty(objValue)
        if (true === objValueEmptyCheck) {
            return validateInputSearchFormatError.inputSearchValueCanNotEmpty
        }
        //3.3 数组长度是否超过限制
        if (objValue.length > searchSetting.maxKeyNum) {
            return validateInputSearchFormatError.inputSearchValueLengthExceed
        }

        //3.4 如果是外键，数组中的每个元素必须是对象，且不能为空;  如果不是外键，则值为字符，数字，日期
        //    且每个对象的key，必须在fkAdditional中有定义

        for(let singleSearchElement of objValue){
            if(fkAdditionalFieldsConfig[singleFieldName]){
                if(false===dataTypeCheck.isObject(singleSearchElement)){
                    return validateInputSearchFormatError.inputSearchValueElementMustBeObject
                }
                if(dataTypeCheck.isEmpty(singleSearchElement)){
                    return validateInputSearchFormatError.inputSearchValueElementCanNotEmpty
                }
                for(let singleSearchElementKey in singleSearchElement ){
                    if(-1===fkAdditionalFieldsConfig[singleFieldName]['forSetValue'].indexOf(singleSearchElementKey)){
                        return validateInputSearchFormatError.inputSearchValueElementKeyNotDefined
                    }
                }
            }else{
// console.log(`non fk field value is ${singleSearchElement}`)

                if(false===dataTypeCheck.isString(singleSearchElement) && false===dataTypeCheck.isDate(singleSearchElement) && false===dataTypeCheck.isNumber(singleSearchElement)){
                    return validateInputSearchFormatError.inputSearchValueElementMustBeStringNumberDate
                }
            }
        }


    }
    return rightResult
}
/*
* 对输入的查询 参数进行 检验，不对输入进行任何修改(复杂搜索：多个字段，每个字段多个搜索值)
* 输入参数：
*           1.inputSearch:{normalField:[val1,val2],fkField:[{relatedField1:value1,relatedField2:value2},{relatedField1:value3}]}
*           client传入的搜索参数，以coll为单位。因为使用独立的函数进行处理，所以可以和validateInput的输入参数不一致.如此可以简化对格式的检查步骤
*           2. fkAdditionalFieldsConfig：：{parentBillType:{relatedColl:billtye, forSetValue:['name']}}
*           搜索参数，如果有外键，从中获得外键对应的coll.field，查询得知对应inputRule。以coll为单位
*           3. collName
*           当前对哪一个coll进行搜索
*           4 inputRules
*           整个inputRule，因为外键可能对应在其他coll
* 返回: {field1:{rc:0},field2:{rc:9123.msg:'值不正确'}}
* */
function validateInputSearch(inputSearch,fkAdditionalFieldsConfig,collName,inputRules){
    let result={}
    //1. 对数组中的每个值： 1.1 是否为undefined/null/''， 1.2 是否符合regex限定
    //inputSearch：{name:['juanw'],parentBillType:[{name:'wzhan039',title:'asb'},{name:'xubol'}]}
    for(let singleFieldName in inputSearch){

        result[singleFieldName]={rc:0}

        let objValue=inputSearch[singleFieldName]

// console.log(`siangle field rule is ${JSON.stringify(singleFieldRule)}`)
        //objValue是数组，singleSearchValueKey是数组的key（正常字段，为数字；外键）
        //objValue： ['juanw']  && [{name:'wzhan039',title:'asb'},{name:'xubol'}]
        for(let singleSearchValue of objValue) {
            let chineseName,singleSearchString, singleFieldRule, tmpSingleCheckResult

            //chineseName总是当前字段的中文名（无论是否fk）
            chineseName=inputRules[collName][singleFieldName]['chineseName']
// console.log(`chinese name is ${chineseName}`)
//            console.log(`fk define is ${JSON.stringify(fkAdditionalFieldsConfig[singleFieldName])} `)
            //如果是普通字段
            if (undefined === fkAdditionalFieldsConfig[singleFieldName]) {
                singleFieldRule = inputRules[collName][singleFieldName]

                singleSearchString = singleSearchValue
                //console.log(   `to be check value is ${singleSearchString},rule is ${JSON.stringify(singleFieldRule)}`)
                tmpSingleCheckResult=checkSingleSearchValue(chineseName,singleSearchString,singleFieldRule)
// console.log(`normal field ${singleFieldName} rule check result is ${JSON.stringify(tmpSingleCheckResult)}`)
                if(tmpSingleCheckResult.rc>0){
                    result[singleFieldName]['rc']=tmpSingleCheckResult.rc
                    result[singleFieldName]['msg']=tmpSingleCheckResult.msg
                    break
                }
            } else if (fkAdditionalFieldsConfig[singleFieldName]) {
                let fkColl = fkAdditionalFieldsConfig[singleFieldName]['relatedColl']
                //singleFkRelatedField: name   title
                for(let singleFkRelatedField in singleSearchValue){
                    singleFieldRule = inputRules[fkColl][singleFkRelatedField]
                    singleSearchString=singleSearchValue[singleFkRelatedField]
                    tmpSingleCheckResult=checkSingleSearchValue(chineseName,singleSearchString,singleFieldRule)
                    if(tmpSingleCheckResult.rc>0){
                        result[singleFieldName]['rc']=tmpSingleCheckResult.rc
                        result[singleFieldName]['msg']=tmpSingleCheckResult.msg
                        break
                    }
                }
/*                    //如果是外键，找到外键所在coll的对应字段的定义
                let fkColl = fkAdditionalFieldsConfig[singleFieldName]['relatedColl']
                let fkField = fkAdditionalFieldsConfig[singleFieldName]['forSetValue'][0]
                singleFieldRule = inputRules[fkColl][fkField]*/
            }


        }

    }
    return result
}

//需要单独定义成一个函数，因为在validateInputSearch中，需要在根据是否为外键，在不同的地方调用
//singleSearchString: 要检查的值（非数组或者对象）
//singleFieldRule： 对应的rule定义
function checkSingleSearchValue(chineseName,singleSearchString,singleFieldRule){
    // console.log(`function checkSingleSearchValue called`)
    let result={rc:0}
    //console.log(`called func rule is ${JSON.stringify(singleFieldRule)}`)
    if(singleFieldRule['format']){
// console.log(`format defined`)
        let currentRule=singleFieldRule['format']
        let currentRuleDefine=currentRule['define']
        // console.log(`format defined as ${currentRuleDefine.toString()}`)
        if(false===valueMatchRuleDefineCheck.format(singleSearchString,currentRuleDefine)){
            result['rc']=currentRule['error']['rc']
            result['msg']=generateErrorMsg.format(chineseName,currentRuleDefine,false)
            // console.log(    `format check failed result is ${JSON.stringify(result)}`)
            return result
/*                result[singleFieldName]['rc']=currentRule['error']['rc']
            result[singleFieldName]['msg']=generateErrorMsg.format(currentRule['chineseName'],currentRuleDefine,false)*/
            // break
        }
    }

    //1.2 检查value的类型是否符合type中的定义
    // console.log(currentItemValue)
    //  console.log(`data type is ${singleFieldRule['type']}`)

    let typeCheckResult = valueTypeCheck(singleSearchString,singleFieldRule['type'])
// console.log(`data type check result is ${JSON.stringify(typeCheckResult)}`)
    if(typeCheckResult.rc && 0<typeCheckResult.rc){
        //当前字段值的类型未知
        result['rc']=typeCheckResult.rc
        result['msg']=`${chineseName}${typeCheckResult.msg}`
        return result

    }
    if(false===typeCheckResult){
        result['rc']=validateInputFormatError.typeWrong.rc
        result['msg']=`${chineseName}${validateInputFormatError.typeWrong.msg}`
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
            case 'minLength':
                if(true===valueMatchRuleDefineCheck.exceedMinLength(singleSearchString,currentRuleDefine)){
                    result['rc']=currentRule['error']['rc']
                    result['msg']=generateErrorMsg.minLength(chineseName,currentRuleDefine,false)
                    return result
                    // result[singleFieldName]['rc']=currentRule['error']['rc']
                    // result[singleFieldName]['msg']=generateErrorMsg.minLength(currentRule['chineseName'],currentRuleDefine,false)
                }
                break;
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






//前端传入的数据是{filed:{value:'xxx'}}的格式，需要转换成普通的key:value mongoose能辨认的格式{filed:'xxx'}
var convertClientValueToServerFormat=function(values){
    let result={}
    for(let key in values){
        if(values[key]['value'] || null===values[key]['value'] ){
            result[key]=values[key]['value']
        }
    }
    return result
}

//前端传入的搜索数据是{filed1:[{name:'val1',age:15},{name:"val2"}],field2:[{title:'val3",author:"zw"}]}的格式，因为一个外键可以能有多个冗余字段
// 需要转换成{$or:[field1.name:{$in:['val1','val2']},field1.age:{$in:[15]},field2:{$in:['val2']}]}
var convertClientSearchValueToServerFormat=function(values){
    let result={'$or':[]}
    for(let key in values){
        let tmp={}
        tmp[key]={'$in':[]}
        // console.log(`field init result is ${JSON.stringify(tmp)}`)
        for(let singleSearchString of values[key]){
            tmp[key]['$in'].push(singleSearchString)
        }
        result['$or'].push(tmp)
    }
    return result
}

//对update传入的参数进行检测，如果设置为null，就认为是控制端，无需传入db
var constructCreateCriteria=function(formattedValues){
    for(let key in formattedValues){
        //如果不是null，而是""或者"   "等，会在checkInput被检测到并拒绝
        if(formattedValues[key]===null){
            delete formattedValues[key]
        }
    }

}

//对update传入的参数进行检测，如果设置为null，就认为对应的field是要删除的，放入$unset中
//formattedValues: 经过convertClientValueToServerFormat处理的输入条件
var constructUpdateCriteria=function(formattedValues){
    for(let key in formattedValues){
        if(formattedValues[key]===null){
            if(undefined===formattedValues['$unset']){
                formattedValues['$unset']={}
            }
            formattedValues['$unset'][key]=formattedValues[key]
            delete formattedValues[key]
        }
    }

}



exports.func={
    dataTypeCheck,//对象
    valueTypeCheck,//对datatTypeCheck进行进一步封装。函数

    ruleFormatCheck,//对rule定义进行检查，格式是否正确。函数

    generateErrorMsg,//对不同的ru类型可读性更强的msg。对象

    valueMatchRuleDefineCheck,//value是否满足某个特定rule的定义。对象
    // valueMatchRuleDefineCheck, //移动到validateInputRule中
    // CRUDGlobalSetting, //全局设置直接通过require方式（反正都是存储在内存中）
    // generateRandomString,
    // leftMSInDay,
    // leftSecondInDay,
    //validateInputRule,

    validateInputFormat,//检测普通inputValue的格式是否正确
    validateInputValue,


    checkSearchValue,//检查搜索字符串，因为是URL的一部分，所以默认是字符，直接通过rule进行验证
    // parseGmFileSize,
    // convertImageFileSizeToByte,
    // convertURLSearchString,
    validateInputSearchFormat,//对通过post上传的查询参数的 格式 进行验证
    validateInputSearch,//对POST的参数进行检查
    checkSingleSearchValue,//被validateInputSearch调用。
    // getUserInfo,
    // checkUserState,
    //checkUserIdFormat:checkUserIdFormat,
    //checkInterval,// use Lua instead of session(although sesssion use redis too)
    // preCheck,
    // getPemFile,
    //objectIndexOf:objectIndexOf,
    //extractKey:extractKey,
    // validateInputSearchFormat,

    //generateClientInputAttr,
    //generateClientRule,
    //deleteNonNeededObject,
    //objectIdToRealField,
    //objectIdValidate,


    // encodeHtml,
    constructCreateCriteria,
    constructUpdateCriteria,
    // populateSingleDoc,
    convertClientValueToServerFormat,
    convertClientSearchValueToServerFormat,
    // formatRc,
}

// CRUDGlobalSetting.setDefault()
/*CRUDGlobalSetting.getSingleSetting('search','maxKeyNum1',function(err,result){
    console.log(err)
    console.log(result)
})*/


//console.log(test())
//test()