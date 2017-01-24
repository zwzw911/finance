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
var compOp=require('../define/enum/node').node.compOp

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
        //return obj && typeof obj === 'object' && Array == obj.constructor;
        return typeof obj === 'object'  && obj!==null && Array == obj.constructor;
    },

    isObject(obj){
        //return obj && typeof obj === 'object' && Object == obj.constructor;
        //如果添加obj的话，和bool值&&后，变成obj，而不是bool了
        // ‘’ && false 等于 ''       false  && ''   等于 false
        //null && false 等于 null         false  && null   等于 false
        //undefined && false 等于 undefined           false  && undefined   等于 false
        //null也是object，所以需要排除
        return typeof obj === 'object' && obj!==null && Object == obj.constructor;
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





/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */



/*      delete的参数包含在URL中
*   此函数只是验证express是否get到了这个参数，其余的验证，通过将其放入{field:{value:'delValue'}}后，复用validateInputVale实现
*   多次一举，为了防止在mainRouterController中require nodeError.js这个文件
*
* */
function validateDeleteInput(values){
/*    console.log(`values isj ${values}`)
    console.log(`type is ${typeof values}`)
    console.log(`isSetValue ${dataTypeCheck.isSetValue(values)}`)
    console.log(`isEmpty ${dataTypeCheck.isEmpty(values)}`)*/
    //null和undefine无法通过软件模拟：null被当成字符传入，undefine无法找到对应的route
    if(false===dataTypeCheck.isSetValue(values) || true===dataTypeCheck.isEmpty(values)){
        return validateInputFormatError.deleteFormatWrong
    }
    return rightResult
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
 *           4 inputRules
 *           整个inputRule，因为外键可能对应在其他coll
* */
var genNativeSearchCondition=function(clientSearchParams,collName,fkAdditionalFieldsConfig,rules){
    //所有的查询条件都是 或
    let fieldsType={} //{name:dataType.string,age:dataType.int}  普通字段，只有一个key，外键：可能有一个以上的key
    let result={}

    //有search参数传入，则进行转换
    if(false===dataTypeCheck.isEmpty(clientSearchParams)){
        result={'$or':[]}
        for(let singleField in clientSearchParams){

            //普通字段
            if(false===singleField in fkAdditionalFieldsConfig){
                //普通的外键的变量分开（外键的必须在冗余字段的for中定义，否则会重复使用）
                let fieldValue,fieldRule,fieldValueType,fieldCondition,fieldResult={}
                fieldValue=clientSearchParams[singleField]
                fieldRule=rules[collName][singleField]
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
                    fieldRule=rules[fkConfig['relatedColl']][fkRedundantField]
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
    if(dataType.string===fieldDataType){
        let inArray=[]
        for(let singleElement of fieldValue){

            inArray.push(new RegExp(singleElement['value'],'i'))
        }
        conditionResult['$in']=inArray
    }
    //如果是数值，需要3个数组gt/lt/eq进行判别
    if(dataType.date===fieldDataType || dataType.number===fieldDataType || dataType.float===fieldDataType || dataType.int===fieldDataType){
        //存储所有数值
        let gtArray=[],ltArray=[],eqArray=[]
        for(let singleElement of fieldValue){
            let valueToBePush=singleElement['value']
            if(dataType.date===fieldDataType){
                console.log(`date  orig is ${valueToBePush}`)
                valueToBePush=new Date(valueToBePush*1000)
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


//对update传入的参数进行检测，如果设置为null，就认为是控制端，无需传入db
var constructCreateCriteria=function(formattedValues){
    for(let key in formattedValues){
        //如果不是null，而是""或者"   "等，会在checkInput被检测到并拒绝
        if(formattedValues[key]===null){
            delete formattedValues[key]
        }
    }

}

//对update传入的参数进行检测，如果设置为null，就认为对应的field是要删除的，放入$unset中（如果此field是外键，还要把对应的冗余字段$unset掉）
//formattedValues: 经过convertClientValueToServerFormat处理的输入条件
var constructUpdateCriteria=function(formattedValues,singleCollFKConfig){
    //console.log(`fkconfig is ${JSON.stringify(singleCollFKConfig)}`)
    for(let key in formattedValues){
        if(formattedValues[key]===null){
            //当前键设为$undefine
            if(undefined===formattedValues['$unset']){
                formattedValues['$unset']={}
            }
            //formattedValues['$unset'][key]=formattedValues[key]
            //$unset的话，字段后的值就无所谓了
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
    validateInputSearchFormat,//对通过post上传的查询参数的 格式 进行验证，对于每个field，调用subValidateInputSearchFormat进行验证
    subValidateInputSearchFormat,

    validateInputSearchValue,//对POST的参数进行检查
    checkSingleSearchValue,//被validateInputSearchValue调用，对单个value进行检测

    genNativeSearchCondition,//根据输入的searchValue，产生mongodb的查询参数（方便调试）

    validateDeleteInput,//判断express是否在URL中获得了objectID参数；如果错误，直接返回错误，防止mainRouteController require nodeError这个文件
    // encodeHtml,
    constructCreateCriteria,
    constructUpdateCriteria,
    // populateSingleDoc,
    convertClientValueToServerFormat,
    //convertClientSearchValueToServerFormat,
    // formatRc,
}

// CRUDGlobalSetting.setDefault()
/*CRUDGlobalSetting.getSingleSetting('search','maxKeyNum1',function(err,result){
    console.log(err)
    console.log(result)
})*/


//console.log(test())
//test()