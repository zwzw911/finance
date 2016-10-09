/**
 * Created by wzhan039 on 2015-09-07.
 * 可以和generalFunction合并
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var fs=require('fs')

var miscError=require('../define/error/nodeError').nodeError.assistError.misc
var gmError=require('../define/error/nodeError').nodeError.assistError.gmImage
//var input_validate=require('../error_define/input_validate').input_validate

var randomStringType=require('../define/enum/node').node.randomStringType
var userStateEnum=require('../define/enum/node').node.userState
var regex=require('../define/regex/regex').regex

/*var ioredis=require('ioredis')
var ioredisClient=new ioredis()*/
var LuaSHA=require('../define/Lua/LuaSHA').LuaSHA
var redisError=require('../define/error/redisError').redisError

/*      for CRUDGlobalSetting       */
var defaultSetting=require('../config/global/globalSettingRule').defaultSetting
//use redis to save get golbalSetting
var ioredisClient=require('../model/redis/connection/redis_connection').ioredisClient
/*var dataTypeCheck=require('../../../assist/misc').func.dataTypeCheck
var redisError=require('../../../define/error/redisError').redisError*/
//var inputValid=require('./valid').inputValid

/*              for input valid         */
//var regex=require('../define/regex/regex').regex.regex
var validateError=require('../define/error/nodeError').nodeError.assistError.misc.validate

/*var dataTypeCheck=require('../assist/misc').func.dataTypeCheck
var ruleTypeCheck=require('../assist/misc').func.ruleTypeCheck*/

//var fs=require('fs')
var dataType=require('../define/enum/validEnum').enum.dataType
var ruleType=require('../define/enum/validEnum').enum.ruleType
var clientRuleType=require('../define/enum/validEnum').enum.clientRuleType
var intervalCheck=require('../config/global/defaultGlobalSetting').intervalCheck
var otherFiledNameEnum=require('../define/enum/validEnum').enum.otherFiledName
//var rightResult={rc:0}
//var CRUDGlobalSetting=require('../model/redis/common/CRUDGlobalSetting').CRUDGlobalSetting
//var async=require('async')
var redisWrapAsync=require('./wrapAsync/db/redis/wrapAsyncRedis.js')

var execSHALua=require("./component/shaLua").execSHALua

var rightResult={rc:0,msg:null}

/*var checkInterval=function(req,cb){
    let identify
    if(req.session && req.session.id){
        identify=req.session.id
    }
    //req.ip和req.ips，只有在设置了trust proxy之后才能生效，否则一直是undefined
    if(req.ips && req.ips[0]){
        identify= req.ips[0]
    }
    if(undefined===identify){
        return cb(null,miscError.checkInterval.unknownRequestIdentify)
    }

    ioredisClient.evalsha(LuaSHA.Lua_check_interval,1,identify,new Date().getTime(),function(err,checkResult){
        //ioredisClient.eval('../model/redis/lua_script/Lua_check_interval.lua',1,ip,new Date().getTime(),function(err,checkResult){
        //ioredisClient.script('load','../model/redis/lua_script/Lua_check_interval.lua',function(err,sha){
        //    ioredisClient.evalsha(sha,1,ip,new Date().getTime(),function(err,checkResult) {
        if (err) {
            //console.log(err)
            return cb(null, redisError.general.luaFail)
        }
        //let result=checkResult.split(':')
        //if(result[0]==checkResult){
        //console.log(checkResult)
        switch (checkResult[0]) {
            case 0:
                return cb(null, {rc: 0})
            case 10:
                let rc = {}
                rc['rc'] = miscError.checkInterval.tooMuchReq.rc
                rc['msg'] = `${miscError.checkInterval.forbiddenReq.msg.client}，请在${checkResult[1]}秒后重试`
                //console.log(rc)
                return cb(null, rc)
            case 11:
                //console.log(intervalCheckBaseIPNodeError.between2ReqCheckFail)
                return cb(null, miscError.checkInterval.between2ReqCheckFail)
                break;
            case 12:
                //console.log(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
                return cb(null, miscError.checkInterval.exceedMaxTimesInDuration)
                break;
            default:
        }
        //})
    })
}*/

async function checkInterval(req){
    //return new Promise(function(resolve,reject){
    var appSetting=require('../config/global/appSetting')
    let identify


    if(req.session && req.session.id){
        if(!regex.sessionId.test(req.session.id)){
            return miscError.checkInterval.sessionIdWrong
        }
        identify=req.session.id
    }else{
        if(true===appSetting['trust proxy']){
            //req.ip和req.ips，只有在设置了trust proxy之后才能生效，否则一直是undefined
            if(req.ips && req.ips[0]){
                identify= req.ips[0]
            }
        }else{
            identify=req.connection.remoteAddress
        }

        if (identify && identify.substr(0, 7) == "::ffff:") {
            identify = identify.substr(7)
            if(!regex.ip.test(identify)){
                return miscError.checkInterval.IPWrong
            }
        }

    }


    if(undefined===identify){
        return miscError.checkInterval.unknownRequestIdentify
        //return cb(null,)
    }


    //console.log(`trust proxy false ${identify}`)


    let params={}
    params.setting=intervalCheck
    params.currentTime=new Date().getTime()
    params.id=identify

    let result=await execSHALua(LuaSHA.Lua_check_interval,params)
    //console.log(result.rc)
    //result=JSON.parse(result)
    switch (result['rc']) {
        case 0:
            return result
        case 10:
            let rc = {}
            rc['rc'] = miscError.checkInterval.tooMuchReq.rc
            rc['msg'] = `${miscError.checkInterval.forbiddenReq.msg.client}，请在${result['msg']}秒后重试`
            //console.log(rc)
            return  rc
        case 11:
            //console.log(intervalCheckBaseIPNodeError.between2ReqCheckFail)
            return  miscError.checkInterval.between2ReqCheckFail
            break;
        case 12:
            //console.log(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
            return miscError.checkInterval.exceedMaxTimesInDuration
            break;
        default:
    }
    //})
}
/*//本来先作为路由句柄，但是此功能无法在router上使用（而只能在app上使用）
//可以作为中间件使用，但是不够灵活（get的时候出错，希望返回页面，post/put/delete的时候返回错误，希望在当前页面跳出对话框提示）。中间件只能对所有方式单一处理。
var checkIntervalMid=function(req,res,next){
    let identify
    if(req.session && req.session.id){
        identify=req.session.id
    }else if(req.ips && req.ips[0]){
        identify= req.ips[0]
    }
    if(undefined===identify){
        //return {rc:}
    }
    ioredisClient.evalsha(LuaSHA.Lua_check_interval,1,identify,new Date().getTime(),function(err,checkResult){
        //ioredisClient.eval('../model/redis/lua_script/Lua_check_interval.lua',1,ip,new Date().getTime(),function(err,checkResult){
        //ioredisClient.script('load','../model/redis/lua_script/Lua_check_interval.lua',function(err,sha){
        //    ioredisClient.evalsha(sha,1,ip,new Date().getTime(),function(err,checkResult) {
        if (err) {
            console.log(err)
            return res.json(null, redisError.general.luaFail)
        }
        //let result=checkResult.split(':')
        /!*console.log(checkResult)
         //if(result[0]==checkResult){
         switch (checkResult[0]) {
         case 0:
         //console.log('next')
         next()
         break;
         //return cb(null, {rc: 0})
         case 10:
         let rc = {}
         rc['rc'] = intervalCheckBaseIPNodeError.tooMuchReq.rc
         rc['msg'] = `${intervalCheckBaseIPNodeError.forbiddenReq.msg}，请在${checkResult[1]}秒后重试`
         //console.log(rc)
         return res.json(rc)
         case 11:
         //console.log(intervalCheckBaseIPNodeError.between2ReqCheckFail)
         return res.json( intervalCheckBaseIPNodeError.between2ReqCheckFail)
         break;
         case 12:
         //console.log(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
         return res.json(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
         break;
         default:
         }*!/

        //})
    })
}*/

function sleep(numberMillis) {
    var now = new Date();
    var exitTime = now.getTime() + numberMillis;
    while (true) {
        now = new Date();
        if (now.getTime() > exitTime)
            return;
    }
}

/*
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
        return obj && typeof obj === 'object' &&
            Array == obj.constructor;
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


//无法确保带检测的值的类型（在rule定义的文件中，type可以是字符或者数值，甚至是array），所以需要函数对输入进行检测，排除不支持的类型
var ruleTypeCheck= {
    exceedMaxLength(value, maxLength) {
        //length属性只能在数字/字符/数组上执行
        if(false===dataTypeCheck.isArray(value) && false===dataTypeCheck.isInt(value) && false===dataTypeCheck.isFloat(value) && dataTypeCheck.isString(value)){
            return false
        }
        //数字需要转换成字符才能执行length
        if(false!==dataTypeCheck.isFloat(value) || false!==dataTypeCheck.isInt(value)){
            return value.toString().length > maxLength
        }
        return value.length > maxLength
    },

    exceedMinLength(value, minLength) {
        if(false===dataTypeCheck.isArray(value) && false===dataTypeCheck.isInt(value) && false===dataTypeCheck.isFloat(value) && dataTypeCheck.isString(value)){
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

var CRUDGlobalSetting={

/*    _constructNull(){
        let result={}
        for(let item in defaultSetting){
            result[item]={}
            for (let subItem in defaultSetting[item]){
                result[item][subItem]={}
                result[item][subItem]['value']=null
            }
        }
        return result
    },*/

    setDefault(){
        //let emptyValue=this._constructNull()
        //预先构建结构
        let result={}
        for(let item in defaultSetting){
            result[item]={}
            for (let subItem in defaultSetting[item]){
                result[item][subItem]={}
                result[item][subItem]['value']=null
            }
        }

        for (let item in defaultSetting){
            //for(let subItem in defaultSetting[item]){
            let checkResult=validate.checkInput(result[item],defaultSetting[item])

            for (let subItem in checkResult){
                if(checkResult[subItem]['rc']>0){
                    // console.log(checkResult)
                    return checkResult
                }
            }

            //}
        }

        for(let item in defaultSetting){
//console.log(item)
            for (let subItem in defaultSetting[item]){
//console.log(subItem)
                //Is object but not an array, then change value to string
                //for array, change to string automatically
                let val=defaultSetting[item][subItem]['default']
//console.log(`val:${val}`)
                if(typeof val =='object' && !dataTypeCheck.isArray(val)){
                    val=JSON.stringify(val)
                    //console.log(val.toString())
                }
                //redisClient.select(1,function(err){
                ioredisClient.hset([item,subItem,val])
                //})
            }
        }
        //})

    },



//直接返回subItem的值
/*    getSingleSetting(item,subItem,cb){
        //redisClient.on('ready',function(){
        ioredisClient.hexists(item,subItem,function(err,exist){
//console.log(exist)
            if(1===exist){
                ioredisClient.hget(item,subItem,function(err,result){
                    if(err){return cb(null,redisError.general.getError)}
                    //redis value are string, check if object(JSON)

                    if(0===result.indexOf('{') && result[ result.length-1]=='}'){

                        result=JSON.parse(result)
                        //console.log(result)
                    }
                    //array
                    else if(-1!==result.indexOf(',')){
                        result=Array.from(result.split(','))
                    }

                    return cb(null,{rc:0,msg:result})
                })
            }else{
                return cb(null,redisError.general.keyNotExist)
            }
        })
        //})
    },*/
    async getSingleSetting(key,subKey){
        //redisClient.on('ready',function(){
        // return await redisWrapAsync.asyncHget('search','maxKeyNum')
        let exist=await redisWrapAsync.asyncHexists(key,subKey)
        if(exist.rc>0){
            return exist
        }
        if(1===exist.msg){
            let result=await redisWrapAsync.asyncHget(key,subKey)
            let value=result.msg
            
            if(0===value.indexOf('{') && value[ value.length-1]=='}'){

                value=JSON.parse(value)
                //console.log(result)
            }
            //array
            else if(-1!==value.indexOf(',')){
                value=Array.from(value.split(','))
                // console.log(value)
            }
            rightResult.msg=value

            return rightResult
        }else{
            return redisError.other.notExist(key,subKey)
        }
        /*ioredisClient.hexists(key,subKey,function(err,exist){
//console.log(exist)
            if(1===exist){
                ioredisClient.hget(key,subKey,function(err,result){
                    if(err){return cb(null,redisError.general.getError)}
                    //redis value are string, check if object(JSON)

                    if(0===result.indexOf('{') && result[ result.length-1]=='}'){

                        result=JSON.parse(result)
                        //console.log(result)
                    }
                    //array
                    else if(-1!==result.indexOf(',')){
                        result=Array.from(result.split(','))
                    }

                    return cb(null,{rc:0,msg:result})
                })
            }else{
                return cb(null,redisError.general.keyNotExist)
            }
        })*/
        //})
    },
//获得数据项下所有子项的数据,并构成{item:{subItem1:value1,subItem2;value2}}的格式
    async getItemSetting(item){
        var wholeResult={};
        wholeResult[item]={}
        //计算item总数，以便确定合适可以返回全部（因为每读一次，都是异步）
/*        var totalSubItemNum=0;
        //获得数据项下所有子项的数量
        if(undefined!==defaultSetting[item]){
            wholeResult[item]={}
            totalSubItemNum+=Object.keys(defaultSetting[item]).length
            /!*        for (let subItem in  defaultSetting[item]){
             totalSubItemNum++
             }*!/
        }else{
            return cb(null,{rc:0,msg:wholeResult})
        }*/
//console.log(new Date().getTime())
        //redisClient.on('ready',function(){
//console.log(new Date().getTime())
        for (let subItem in  defaultSetting[item]){
            let result=await this.getSingleSetting(item,subItem)
            if(result.rc && result.rc>0){
                return result
            }
            // console.log(result)
            wholeResult[item][subItem]=result.msg
/*            this.getSingleSetting(item,subItem,function(err,result){
//console.log(result)
                if(result.rc && result.rc>0){
                    return cb(null,result)
                }
                wholeResult[item][subItem]=result.msg
                totalSubItemNum--
                if(0===totalSubItemNum){
                    cb(null,{rc:0,msg:wholeResult})
                }
                //console.log(wholeResult)
            })*/
        }
        rightResult.msg=wholeResult
        return rightResult
        //})
    },
/*    getAllSetting(cb){
        var wholeResult={};
        //计算item总数，以便确定合适可以返回全部（因为每读一次，都是异步）
        var totalSubItemNum=0;
        for(let item in defaultSetting){
            totalSubItemNum+=Object.keys(defaultSetting[item]).length
        }
        for(let item of Object.keys(defaultSetting)){
            if(undefined===wholeResult[item]){
                wholeResult[item]={}
            }
            for (let subItem of  Object.keys(defaultSetting[item])){
                this.getSingleSetting(item,subItem,function(err,result){
                    if(result.rc && result.rc>0){
                        return cb(null,result)
                    }
                    wholeResult[item][subItem]=result.msg
                    totalSubItemNum--
                    if(0===totalSubItemNum){
                        cb(null,{rc:0,msg:wholeResult})
                    }
                    //console.log(wholeResult)
                })
            }
        }
    },*/
    async getAllSetting(){
        var wholeResult={};
        //计算item总数，以便确定合适可以返回全部（因为每读一次，都是异步）
        // var totalSubItemNum=0;
/*        for(let item in defaultSetting){
            totalSubItemNum+=Object.keys(defaultSetting[item]).length
        }*/
        for(let item in defaultSetting){
            if(undefined===wholeResult[item]){
                wholeResult[item]={}
            }
            for (let subItem of  Object.keys(defaultSetting[item])){
                console.log(`${item} ${subItem}`)
                let result=await this.getSingleSetting(item,subItem)

                // console.log(result)
                // this.getSingleSetting(item,subItem,function(err,result){
                if(result.rc && result.rc>0){
                    // return cb(null,result)
                    return result
                }
                wholeResult[item][subItem]=result.msg
                    // totalSubItemNum--
                    // if(0===totalSubItemNum){
                    //     cb(null,{rc:0,msg:wholeResult})
                    // }
                    //console.log(wholeResult)
                // })
            }
        }
        // console.log(wholeResult)
        return wholeResult
    },

    setSingleSetting(item,subItem,newValue){
        //redisClient.on('ready',function(){
        if(typeof newValue =='object' && !dataTypeCheck.isArray(newValue)){
            newValue=JSON.stringify(newValue)
        }
        //console.log(item+subItem+newValue)
        ioredisClient.hset([item,subItem,newValue])
        //})
    },
//setAllSetting不能代替setDefault，因为setAllSetting读取的是{item1:{subItem1:{value:val1}}（和普通的input结构一致）,而setDefault读取的是{item1:{subItem1:{default:val1,type:'int',max:'',client:{}}}}
    setAllSetting(newValueObj){

        //读取固定键
        //console.log(newValueObj)
        for (let item in newValueObj) {
            for (let subItem in  newValueObj[item]) {
                let newValue=newValueObj[item][subItem];
                /*                if (!newValueObj[item][subItem]) {
                 newValue = newValueObj[item][subItem]
                 }*/
                //判断是否对象
                if (typeof newValue == 'object' && !dataTypeCheck.isArray(newValue)) {
                    newValue = JSON.stringify(newValue)
                }
                this.setSingleSetting(item, subItem, newValue)
            }
        }
        //})
    }
}


//len:产生字符串的长度
//type: basic(0-9A-Z)；normal(0-9A-Za-z); complicated(normal+特殊字符)
var generateRandomString=function(len=4,type=randomStringType.normal){
/*    if(undefined===len || false===dataTypeCheck.isInt(len)){
        len=4
    }*/
/*    strict= strict ? true:false
    let validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result=''
    if(true===strict){validString+=`${validString}!@#$%^&*()+={}[]|\?/><`}*/
    let validString
    let basicString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    switch (type){
        case randomStringType.basic:
            validString=basicString
            break;
        case randomStringType.normal:
            validString=`${basicString}abcdefghijklmnopqrstuvwxyz`
            break;
        case randomStringType.complicated:
            validString=basicString+'abcdefghijklmnopqrstuvwxyz'+"`"+`!@#%&)(_=}{:"><,;'[]\^$*+|?.-`
            break;
    }
    //console.log(validString)
    let validStringLen=validString.length
    let result='';
    for(let i=0;i<len;i++){
        result+=validString.substr(parseInt(Math.random()*validStringLen,10),1);
    }

    return result
}

/*var generateSimpleRandomString=function(num){
    var validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var len=validString.length
    var randomIdx,result='';
    for(var i=0;i<num;i++){
        randomIdx=Math.round(Math.random()*(len-1));
        result+=validString[randomIdx]
    }
    return result
}*/

//计算当天剩下的毫秒数
var leftMSInDay=function(){
    let day=new Date().toLocaleDateString()
    let endTime='23:59:59'
    //毫秒
    //let ttlTime=parseInt(new Date(`${day} ${endTime}`).getTime())-parseInt(new Date().getTime())
    let ttlTime=new Date(`${day} ${endTime}`).getTime()-new Date().getTime()
    //console.log(ttlTime)
    return ttlTime
}

var leftSecondInDay=function(){
    //console.log(leftMSInDay)
    return Math.round(parseInt(leftMSInDay())/1000)
}

/**
 * Created by wzhan039 on 2015-11-18.
 */

//解析GM返回的文件大小，返回数值和单位（GM返回Ki，Mi，Gi.没有单位，是Byte。除了Byte，其他都只保留1位小数，并且四舍五入。例如：1.75Ki=1.8Ki）
//1.8Ki，返回1.8和“ki”；900，返回900
//解析失败，或者单位是Gi，返回对应的错误
//{ rc: 0, msg: { sizeNum: '200', sizeUnit: 'Ki' } }
var parseGmFileSize=function(fileSize){
    var p=/(\d{1,}(\.\d{1,})?)([KkMmGg]i)?/ //1.8Ki
    var parseResult=fileSize.match(p)
    if(null===parseResult){
        return gmError.cantParseGmFileSize
    }
    if(parseResult[0]!==fileSize ){
        return gmError.cantParseGmFileSize
    }
    var fileSizeNum=parseFloat(parseResult[1])
    if(isNaN(fileSizeNum)){
        return  gmError.cantParseGmFileSizeNum
    }
    //单位是Gi，直接返回大小超限
    if('Gi'===parseResult[3]){ //正则中的第二个子表达式只是用来把小数及之后的数字 放在一起做判断，而无需取出使用
        return gmError.exceedMaxSize
    }
    return {rc:0,msg:{sizeNum:parseResult[1],sizeUnit:parseResult[3]}}
}

//把GM返回的fileSize转换成Byte，以便比较
//{ rc: 0, msg: 204800 }
var convertImageFileSizeToByte=function(fileSizeNum,fileSizeUnit){
    var imageFileSizeInByte,imageFileSizeNum //最终以byte为单位的大小； GM得到的size的数值部分
    if(undefined===fileSizeUnit ){
        imageFileSizeInByte=parseInt(fileSizeNum)
        if(isNaN(imageFileSizeInByte)){
            return gmError.cantParseGmFileSizeNum
        }
        if(imageFileSizeInByte>1024 || imageFileSizeInByte<0){
            return gmError.invalidFileSizeInByte
        }
        return isNaN(imageFileSizeInByte) ?  gmError.fileSizeEmpty:{rc:0,msg:imageFileSizeInByte}
    }
    if('Ki'===fileSizeUnit){
//console.log('k')
        imageFileSizeNum =parseFloat(fileSizeNum)
        return isNaN(imageFileSizeNum) ? gmError.cantParseGmFileSizeNum:{rc:0,msg:parseInt(fileSizeNum*1024)}
    }
    if('Mi'===fileSizeUnit){
        imageFileSizeNum=parseFloat(fileSizeNum)
        return isNaN(imageFileSizeNum) ? gmError.cantParseGmFileSizeNum:{rc:0,msg:parseInt(fileSizeNum*1024*1024)}
    }
    if('Gi'===fileSizeUnit){
        imageFileSizeNum=parseFloat(fileSizeNum)
        return isNaN(imageFileSizeNum) ? gmError.cantParseGmFileSizeNum:{rc:0,msg:parseInt(fileSizeNum*1024*1024*1024)}
    }

    return gmError.invalidSizeUnit
}

var getPemFile=function(pemPath){
    for(var i= 0,n=pemPath.length;i<n;i++){
        if(true===fileExist(pemPath[i])){
            //console.log(pemPath[i])
            return pemPath[i]

            //break
        }
    }
    return
}



//1. 搜索字符串中的+转换成空格
//2. 截取规定的字符数量
var convertURLSearchString=function(searchString,cb){
    var tmpStr=searchString.split('+');
    //console.log(tmpStr)
    CRUDGlobalSetting.getSingleSetting('search','totalKeyLen',function(err,totalLen){
        if(0<totalLen.rc){
            return cb(null,totalLen)
        }
        var strNum=tmpStr.length
        var curStrLen=0;//计算当前处理的字符长度
        var curStr='';//转换后的搜索字符串（使用空格分隔）
        for(var i=0;i<strNum;i++){
            //第一个key就超长，直接截取20个字符
            if(0===i && tmpStr[0].length>totalLen){
                curStr=tmpStr[0].substring(0,totalLen)
                return cb(null,{rc:0,msg:curStr.trim()})
            }
            //如果当前已经处理的字符串+下一个要处理的字符串的长度超出，返回当前已经处理的字符串，舍弃之后的字符串
            //-i:忽略空格的长度
            if(curStr.length+tmpStr[i].length-i>totalLen){
                return cb(null,{rc:0,msg:curStr.trim()})
            }
            curStr+=tmpStr[i]
            curStr+=' ';

        }
        return cb(null,{rc:0,msg:curStr.trim()})
    })
}

//获得当前用户的信息，以便在toolbar上显示对应的信息
var getUserInfo=function(req){
    return req.session.userName
/*    var result
    if(req.session.state===userStateEnum.login){
        result=req.session.userName
        //result.userId=req.session.userId
    }
    //console.log(result)
    return result*/
}

/*var quit=function(req){
 req.session.state=2
 req.session.userName=undefined
 req.session.userId=undefined

 }*/
 


//返回enum 状态（noSess/notLogin/Login）
var checkUserState=function(req){
    //如果是非GET的req，返回noSess说明是黑客攻击
    if(undefined===req.session){
        return userStateEnum.noSess
    }
    //已经在get方法中获得sess
    if(undefined===req.session.userName){
        return userStateEnum.notLogin
    }

    return userStateEnum.login
    //需要检测状态,如果不是1或者2,就没有session,后续的代码也就不必执行
/*    if(userStateEnum.notLogin!=req.session.state && userStateEnum.login!=req.session.state){
        return miscError.user.notLogin
    }
    return rightResult*/
}

//直接在page中使用valid函数进行判断
/*var checkUserIdFormat=function(req){
    return input_validate.user._id.type.define.test(req.session.userId) ? rightResult:input_validate.user._id.type.client
}*/

/*var checkUserLogin=function(req){
    return req.session.state===userStateEnum.login ? rightResult:miscError.user.notLogin
}*/

//state只要不是undefine就可以
/*var checkUserStateNormal=function(req){
    return (userStateEnum.login===req.session.state || userStateEnum.notLogin===req.session.state) ? rightResult:miscError.user.stateWrong
}*/

/*
//新版本,使用新的逻辑
//不管是request post还是get,都要和session中的lastPost/lastGet比较(如果session中有),然后保存
var checkInterval=function(req){
    //console.log('in')
    var curTime=new Date().getTime();//毫秒数

    var durationSinceLastPost;//当前时间和上次POST的间隔
    var durationSinceLastGet;//当前时间和上次GET的间隔
    var reqType;
    //获得必要的参数
    if (true===req.route.methods.get){
        reqType="GET"
    }
    if (true===req.route.methods.post){
        reqType="POST"
    }
    if(undefined===reqType){
        return runtimeNodeError.general.unknownRequestType;
    }


    if( undefined !=req.session.lastPost){
        durationSinceLastPost=curTime-req.session.lastPost
    }
    if( undefined !=req.session.lastGet){
        durationSinceLastGet=curTime-req.session.lastGet
    }
    //检查
    if("POST"===reqType){
        if(undefined!==durationSinceLastPost){
            if(durationSinceLastPost<general.sameRequestInterval) {
                return runtimeNodeError.general.intervalPostPostWrong
            }
            if( durationSinceLastPost<general.differentRequestInterval){

                return  runtimeNodeError.general.intervalPostGetWrong
            }
        }
        req.session.lastPost=curTime
        return rightResult
    }
    if("GET"===reqType){
        if(undefined!==durationSinceLastGet){
            if(durationSinceLastGet<general.sameRequestInterval) {

                return runtimeNodeError.general.intervalGetGetWrong
            }
            if( durationSinceLastGet<general.differentRequestInterval){
                return  runtimeNodeError.general.intervalGetPostWrong
            }
        }
        req.session.lastGet=curTime
        return rightResult
    }
}
*/

// 检查
// 1. 用户是否通过get获得页面(req.session.state=1 or 2)
// 2. 根据user是否已经登陆，决定是否检查用户session中的用户id是否正确
// 3. 检查interval
// forceCheckUserLogin:true：强制检查用户已经登录； false：不检查用户是否已经登录
var preCheck=function(req, forceCheckUserLogin){
    var result=checkUserStateNormal(req)
    if(result.rc>0){
        return result
    }

    if(true===forceCheckUserLogin){
        if(userStateEnum.login!==req.session.state){
            return miscError.user.notLogin
        }
    }

    if(1===req.session.state){
        result=regex.objectId.test(req.session.userId)
        if(result.rc>0){
            return miscError.user.userIdFormatWrong
        }
    }
    return checkInterval(req)
}

/*
console.log(generateRandomString(4,randomStringType.basic))
console.log(generateRandomString(4,randomStringType.normal))
console.log(generateRandomString(4,randomStringType.complicated))*/
//根据defaultGlobalSetting的结构，构造空值，以便使用checkInput时，强制对default值进行检测

/*
exports.CRUDGlobalSetting={
    setDefault:setDefault,
    getSingleSetting:getSingleSetting,
    constructNull:constructNull,
    getItemSetting:getItemSetting,//用来获得当个item下所有数据
    getAllSetting:getAllSetting,
    setAllSetting:setAllSetting
};*/




/**
 * Created by wzhan039 on 2016-02-25.
 * 把前端传入的input的检查工作全部放在一个文件进行处理
 * 2部分：input的定义（require,minLength,maxLength,exactLength,format,equalTo），format只在server处理
 * 新增定义：min，max，file，folder：min/max：整数大小；file/folder：文件/文件夹是否存在
 *         对应的函数处理
 */
/*          rulw        */
/*1. 至少定义3个字段：chineseName/type/require
* 2
* */
/*          value
* 1. 如贵value=notSet，那么require=true && default isSet，value=default
* 2. 如果value=notSet，那么require=true && default notSet，返回错误
* 3. 如果value=notSet，那么require=false,返回rc=0
* */
var validate={
    _private:{
        generateErrorMsg:{
            //itemDefine无用，只是为了格式统一
            require(chineseName,itemDefine,useDefaultValueFlag){
                if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
                    useDefaultValueFlag=false
                }
                let defaultMsg= useDefaultValueFlag ? '的默认值':'';
                return `${chineseName}${defaultMsg}不能为空`
            },
            maxLength(chineseName,itemDefine,useDefaultValueFlag){
                if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
                    useDefaultValueFlag=false
                }
                let defaultMsg= useDefaultValueFlag ? '的默认值':'';
                return  `${chineseName}${defaultMsg}所包含的字符数不能超过${itemDefine}个`
            },
            minLength(chineseName,itemDefine,useDefaultValueFlag){
                if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
                    useDefaultValueFlag=false
                }
                let defaultMsg= useDefaultValueFlag ? '的默认值':'';
                return  `${chineseName}${defaultMsg}包含的字符数不能少于${itemDefine}个`
            },
            exactLength(chineseName,itemDefine,useDefaultValueFlag){
                if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
                    useDefaultValueFlag=false
                }
                let defaultMsg= useDefaultValueFlag ? '的默认值':'';
                return  `${chineseName}${defaultMsg}包含的字符数不等于${itemDefine}个`
            },
            max(chineseName,itemDefine,useDefaultValueFlag,unit){
                if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
                    useDefaultValueFlag=false
                }
                let defaultMsg= useDefaultValueFlag ? '的默认值':'';
                unit= (undefined===unit || null===unit) ? '':unit
                return  `${chineseName}${defaultMsg}的值不能大于${itemDefine}${unit}`
            },
            min(chineseName,itemDefine,useDefaultValueFlag,unit){
                if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
                    useDefaultValueFlag=false
                }
                let defaultMsg= useDefaultValueFlag ? '的默认值':'';
                unit= (undefined===unit || null===unit) ? '':unit
                return  `${chineseName}${defaultMsg}的值不能小于${itemDefine}${unit}`
            },
            equalTo(chineseName,equalToChineseName){
                return `${chineseName}和${equalToChineseName}不相等`
            },
            format(chineseName,itemDefine,useDefaultValueFlag){
                if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
                    useDefaultValueFlag=false
                }
                let defaultMsg= useDefaultValueFlag ? '的默认值':'';
                switch(itemDefine){
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
            enum(chineseName,itemDefine,useDefaultValueFlag){
                if(undefined===useDefaultValueFlag || null===useDefaultValueFlag){
                    useDefaultValueFlag=false
                }
                let defaultMsg= useDefaultValueFlag ? '的默认值':'';
                return  `${chineseName}${defaultMsg}不正确`
            }
        },
        //检测数据类型
        //require,maxLength,minLength,exactLength,min,max,format,format
        //返回值：true/false/unknownDataType
        checkDataTypeBaseOnTypeDefine(value,type){
            switch (type){
                case dataType.int:
                    return dataTypeCheck.isInt(value)   //返回false或者int
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
                    return (ruleTypeCheck.isFileFolderExist(value) && dataTypeCheck.isFile(value));
                case dataType.folder:
                    return (ruleTypeCheck.isFileFolderExist(value) && dataTypeCheck.isFolder(value))
                case dataType.number:
                    return dataTypeCheck.isNumber(value)
                default:
                    return validateError.unknownDataType
            }
        },
        //对rule定义进行检查
        //返回值
        checkRuleBaseOnRuleDefine(inputRules){
            let rc={}
            for(let inputRule in inputRules){
                //1 检查必须的field
                let mandatoryFields=['chineseName','type','require']
                for(let mandatoryField of mandatoryFields){
                    //console.log(inputRules[inputRule][mandatoryField])
                    if(false===dataTypeCheck.isSetValue(inputRules[inputRule][mandatoryField])){
                        //console.log()
                        rc['rc']=validateError.mandatoryFiledNotExist.rc
                        rc['msg']=`${inputRule}的字段${mandatoryField}${validateError.mandatoryFiledNotExist.msg}`
                        return rc
                    }
                }
                //1.5 检查chineseName是否为字符，是否空，type是否在指定范围内（require由后面的rule check统一处理）
                if(false===dataTypeCheck.isString(inputRules[inputRule]['chineseName'])){
                    rc['rc']=validateError.chineseNameNotString.rc
                    rc['msg']=`${inputRule}的${validateError.chineseNameNotString.msg}`
                    return rc
                }
                if(dataTypeCheck.isEmpty(inputRules[inputRule]['chineseName'])){
                    rc['rc']=validateError.chineseNameEmpty.rc
                    rc['msg']=`${inputRule}的${validateError.chineseNameEmpty.msg}`
                    return rc
                }
                //2 某些类型必须有关联rule
                //console.log(inputRules[inputRule]['type'])
                switch (inputRules[inputRule]['type']){

                    case dataType.int:

                        if(false===dataTypeCheck.isSetValue(inputRules[inputRule]['min'])){
                                rc['rc']=validateError.needMin.rc
                                rc['msg']=`${inputRule}的${validateError.needMin.msg}`
                                return rc

                        }
                        if( false===dataTypeCheck.isSetValue(inputRules[inputRule]['max'])){
                            rc['rc']=validateError.needMax.rc
                            rc['msg']=`${inputRule}的${validateError.needMax.msg}`
                            return rc
                        }
                        break;
                    case dataType.number:
                        //console.log(inputRules[inputRule]['maxLength'])
                        if(false===dataTypeCheck.isSetValue(inputRules[inputRule]['maxLength'])){
                            rc['rc']=validateError.needMaxLength.rc
                            rc['msg']=`${inputRule}的${validateError.needMaxLength.msg}`
                            //console.log(rc)
                            return rc
                        };
                        break
                    case dataType.string:
                        if(false===dataTypeCheck.isSetValue(inputRules[inputRule]['maxLength'])){
                            rc['rc']=validateError.needMaxLength.rc
                            rc['msg']=`${inputRule}的${validateError.needMaxLength.msg}`
                            //console.log(rc)
                            return rc
                        };
                        break
                    default:
                        break;
                }
                //3 rule字段的定义是否合格
                /*        let rules=['require','maxLength','minLength','exactLength','min','max','format','equalTo']
                 let rulesLength=rules.length*/
                //不用forEach，因为其参数为function，遇到错误，return，只是退出forEach的function，而不是整个function
                //for (let i=0;i<rulesLength;i++){
                for (let singleRule in ruleType){
                    //检查rule中必须的字段是否存在（rule定义是否正确）
                    if(true===dataTypeCheck.isSetValue(inputRules[inputRule][singleRule])){
                        if(false===dataTypeCheck.isSetValue(inputRules[inputRule][singleRule]['define'])){
                            rc['rc']=validateError.ruleDefineNotDefine.rc
                            rc['msg']=`${inputRule}的${singleRule}的${validateError.ruleDefineNotDefine.msg}`
                            return rc
                        }
                        if(false===dataTypeCheck.isSetValue(inputRules[inputRule][singleRule]['error'])){
                            rc['rc']=validateError.errorFieldNotDefine.rc
                            rc['msg']=`${inputRule}的${singleRule}的${validateError.errorFieldNotDefine.msg}`
                            return rc
                        }
                        if(false===dataTypeCheck.isSetValue(inputRules[inputRule][singleRule]['error']['rc'])){
                            rc['rc']=validateError.rcFieldNotDefine.rc
                            rc['msg']=`${inputRule}的${singleRule}的${validateError.rcFieldNotDefine.msg}`
                            return rc
                        }
                        //rule的error['msg']由函数generateErrorMsg实时产生，所以无需检测
/*                        if(false===dataTypeCheck.isSetValue(inputRules[inputRule][singleRule]['error']['msg'])){
                            rc['rc']=validateError.msgFieldNotDefine.rc
                            rc['msg']=`${inputRule}的${singleRule}的${validateError.msgFieldNotDefine.msg}`
                            return rc
                        }*/

                        //检测rule define是否正确
                        let singleRuleDefine=inputRules[inputRule][singleRule]['define']
                        switch (singleRule){
                            case 'require':
                                if(false!==singleRuleDefine && true!==singleRuleDefine){
                                    rc['rc']=validateError.requireDefineNotBoolean.rc
                                    rc['msg']=`${inputRule}的${validateError.requireDefineNotBoolean.msg}`
                                    return rc
                                }
                                break;
                            case 'minLength':
                                if(false===dataTypeCheck.isInt(singleRuleDefine)){
                                    rc['rc']=validateError.minLengthDefineNotInt.rc
                                    rc['msg']=`${inputRule}的${validateError.minLengthDefineNotInt.msg}`
                                    return rc
                                }
                                break;
                            case 'maxLength':
                                if(false===dataTypeCheck.isInt(singleRuleDefine)){
                                    rc['rc']=validateError.maxLengthDefineNotInt.rc
                                    rc['msg']=`${inputRule}的${validateError.maxLengthDefineNotInt.msg}`
                                    return rc
                                }
                                break;
                            case 'exactLength':
                                if(false===dataTypeCheck.isInt(singleRuleDefine)){
                                    rc['rc']=validateError.exactLengthDefineNotInt.rc
                                    rc['msg']=`${inputRule}的${validateError.exactLengthDefineNotInt.msg}`
                                    return rc
                                }
                                break;
                            case 'min':
                                if(false===dataTypeCheck.isInt(singleRuleDefine)){
                                    rc['rc']=validateError.minDefineNotInt.rc
                                    rc['msg']=`${inputRule}的${validateError.minDefineNotInt.msg}`
                                    return rc
                                }
                                break;
                            case 'max':
                                if(false===dataTypeCheck.isInt(singleRuleDefine)){
                                    rc['rc']=validateError.maxDefineNotInt.rc
                                    rc['msg']=`${inputRule}的${validateError.maxDefineNotInt.msg}`
                                    return rc
                                }
                                break;
                            case 'format':
                                break;
                            case 'equalTo':
                                break;
                            case 'enum':
                                if(false===dataTypeCheck.isArray(singleRuleDefine)){
                                    rc['rc']=validateError.maxDefineNotInt.rc
                                    rc['msg']=`${inputRule}的${validateError.enumDefineNotArray.msg}`
                                    return rc
                                }
                                break;
                            default:
                                break;
                        }
                    }
                }
            }

            return rightResult

        },
        //必须在checkRuleBaseOnRuleDefine通过之后执行（保证不会返回false，而是返回sanity的值）
        //对rule的define转换成正确的类型，便于后续操作(无需执行类型转换)
        //在maintain中运行，作为rule check的一部分，而不是在每次check input的时候进行，不然太耗cpu
        //对每个rule的define进行检查，是否合格（例如，1.1x可能会被转换成1.1使用，要找出这样的错误）
        sanityRule(allRules){
            let mandatoryFields=['default','minLength','maxLength','exactLength','min','max']
            for(let singleCollName in allRules){
                for(let singleFiledName in allRules[singleCollName]){
                    for(let singleRuleName in allRules[singleCollName][singleFiledName]){
                        // console.log(`${singleCollName} ${singleFiledName} ${singleRuleName}`)
                        if(-1!==mandatoryFields.indexOf(singleRuleName)){

                            let singleRule=allRules[singleCollName][singleFiledName][singleRuleName]
                            if('default'===singleRuleName){
                                if(dataType.string===allRules[singleCollName][singleFiledName]['type'] ){
                                    if(false===validate._private.checkDataTypeBaseOnTypeDefine(singleRule,allRules[singleCollName][singleFiledName]['type'])){
/*                                        console.log(singleRule)
                                        console.log(allRules[singleCollName][singleFiledName]['type'])
                                        console.log(validate._private.checkDataTypeBaseOnTypeDefine(singleRule['define'],allRules[singleCollName][singleFiledName]['type']))*/
                                        return validateError.ruleDefineWrong(singleCollName,singleFiledName,singleRuleName)
                                    }
                                }
                                //对于数值，如果是字符形式，也算通过
                                if(dataType.int===allRules[singleCollName][singleFiledName]['type'] || dataType.float===allRules[singleCollName][singleFiledName]['type']  || dataType.number===allRules[singleCollName][singleFiledName]['type'] ){
                                    if(singleRule!==allRules[singleCollName][singleFiledName]['type'] ){
                                        if(false===validate._private.checkDataTypeBaseOnTypeDefine(singleRule,allRules[singleCollName][singleFiledName]['type'])){
/*                                            console.log(singleRule)
                                            console.log(allRules[singleCollName][singleFiledName]['type'])
                                            console.log(validate._private.checkDataTypeBaseOnTypeDefine(singleRule['define'],allRules[singleCollName][singleFiledName]['type']))*/
                                            return validateError.ruleDefineWrong(singleCollName,singleFiledName,singleRuleName)
                                        }
                                    }
                                }
                            }
                            if('minLength'===singleRuleName || 'maxLength'===singleRuleName || 'exactLength'===singleRuleName || 'min'===singleRuleName || 'max'===singleRuleName){
                                if(singleRule['define']!==validate._private.checkDataTypeBaseOnTypeDefine(singleRule['define'],dataType.int)){

                                    return validateError.ruleDefineWrong(singleCollName,singleFiledName,singleRuleName)
                                }
                            }

                        }

 /*                       switch (singleFiled){
                            case 'chineseName': //无需sanity
                                break
                            case 'default': //根据type进行sanity
                                rules[singleRule][singleFiled]=validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled],rules[singleRule]['type'])
                                break;
                            case 'type':  //无需sanity
                                break;
                            case 'require':  //无需sanity，checkRuleBaseOnRuleDefine已经判断过
                                break
                            case 'minLength':
                                //console.log(rules[singleRule][singleFiled])
                                rules[singleRule][singleFiled]['define']=validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled]['define'],dataType.int)
                                break;
                            case 'maxLength':
                                rules[singleRule][singleFiled]['define']=validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled]['define'],dataType.int)
                                break;
                            case 'exactLength':
                                rules[singleRule][singleFiled]['define']=validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled]['define'],dataType.int)
                                break;
                            case 'min':
                                rules[singleRule][singleFiled]['define']=validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled]['define'],dataType.int)
                                break;
                            case 'max':
                                rules[singleRule][singleFiled]['define']=validate._private.checkDataTypeBaseOnTypeDefine(rules[singleRule][singleFiled]['define'],dataType.int)
                                break;
                            case 'format':  //无需sanity
                                break;
                            case 'equalTo': //无需sanity
                                break;
                        }*/
                    }
                }                
            }
            return rightResult
        }
    },
    /*********************************************/
    /*         主函数，检测input并返回结果        */
    /*********************************************/
    /*
    * inputValue:{username:{value:xxx},password:{value:yyy}}
    * inputItemDefine： ruleDefine(以coll为单位)adminLogin。每个页面有不同的定义
    * basedOnInputValue: 对输入进行检查是，是根据inputValue的字段分别检查（true），还是根据inputRule的字段定义进行检查。
    *                   一般当create时，false，根据inputRule的字段定义进行检查（所有字段都检查）
    *                   当update是，true，只对输入的字段进行检查
    * */
    checkInput(inputValue,inputItemDefine,basedOnInputValue=true){

        let rc={}
        let tmpResult
        //检查参数的更是，必需是Object，且含有key
        // console.log(`input para is ${JSON.stringify(inputValue)}`)
        if(false===dataTypeCheck.isSetValue(inputValue)){
/*            rc['rc']=validateError.valueNotDefine.rc
            rc['msg']=`${inputV}validateError`*/
            //console.log('start check1')
            return validateError.valueNotDefine
        }
        if(dataTypeCheck.isEmpty(inputValue)){
            //console.log('start check2')
            return validateError.valueEmpty
        }
        //检查rule是否合格（不用每次都执行，而是预先做好一次即可）
/*        tmpResult=validate._private.checkRuleBaseOnRuleDefine(inputItemDefine)
        if(0<tmpResult.rc){
            return tmpResult
        }*/
        //将rule中的define转换成合适的类型（之后进行判断的时候就不用再次转换）
        //直接在maintain中完成，省得每次checkInput都调用，浪费CPU
        // validate._private.sanityRule(inputItemDefine)
//console.log(inputItemDefine)

        let base
        if(basedOnInputValue){
            base=inputValue
        }else{
            base=inputItemDefine
        }
        //console.log(`base is ${JSON.stringify(base)}`)
        for (let itemName in base ){
// console.log(`check item is ${itemName}`)
//             console.log(`rc  is ${JSON.stringify(rc)}`)
            rc[itemName]={}
            rc[itemName]['rc']=0
            //无法确定inputValue[itemName]['value']是否undefined，如果是，会报错。所以不适用变量赋值，而在之后的函数中直接传入
            //var currentItemValue=inputValue[itemName]['value']

            //-2 如果传入的是_id，那么通过regex直接判断（因为_id不定义在rule中）
            if('id'===itemName || '_id'===itemName){
                if(true===regex.objectId.test(inputValue[itemName]['value'])) {
                    //console.log(`id check  ture`)
                    //return rightResult
                    //continue
                }else{
                    //console.log(`id check  false`)
                    rc[itemName]['rc']=miscError.validate.idWrong.rc
                    rc[itemName]['msg']=miscError.validate.idWrong.msg
                    //return rc
                    //console.log(`id check resul is ${JSON.stringify(rc)}`)
                    //return miscError.idWrong
                }

                continue
            }


            //0 当前待检测的value，有没有对应的检测rule定义
            if(false===dataTypeCheck.isSetValue(inputItemDefine[itemName])){
                //console.log(itemName)
                rc[itemName]['rc']=validateError.valueRelatedRuleNotDefine.rc
                rc[itemName]['msg']=`${itemName}${validateError.valueRelatedRuleNotDefine.msg}`
                //没有对应的rule定义，直接退出
                return rc
                //return validateError.noRelatedItemDefine
            }




            //rule的赋值
            let currentItemRule=inputItemDefine[itemName]
            let currentChineseName=inputItemDefine[itemName]['chineseName']
// console.log(`current item rule is ${JSON.stringify(currentItemRule)}`)
            //如果类型是objectId，并且require=true，直接判断（而无需后续的检测，以便加快速度）
            if(dataType.objectId===currentItemRule['type'] ){
                // define+ require true ==>check
                // define+ require false==>check
                //  not define+ require true===>fail
                //  not define+ require false==>skip


                if(true===dataTypeCheck.isSetValue(inputValue[itemName]) && true===dataTypeCheck.isSetValue(inputValue[itemName]['value'])){
                    if(false===regex.objectId.test(inputValue[itemName]['value'])){
                        rc[itemName]['rc']=validateError.objectIdWrong.rc
                        rc[itemName]['msg']=`${currentChineseName}：${validateError.objectIdWrong.msg}`
                    }
                    // continue
                }else{
                    if(true===currentItemRule['require']['define']){
                        rc[itemName]['rc']=inputItemDefine[itemName]['require']['error']['rc']
                        rc[itemName]['msg']=validate._private.generateErrorMsg.require(currentChineseName,inputItemDefine[itemName]['require']['error']['define'],false)
                        // continue
                    }
                }
// console.log(`enter format`)
                continue
            }


            //先行判断输入值是否empty，然后赋值给变量；而不是多次使用isEmpty函数。如此，可以加快代码执行速度
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

/*            console.log(inputValue[itemName])
            console.log(dataTypeCheck.isSetValue(inputValue[itemName]))
            console.log( dataTypeCheck.isSetValue(inputValue[itemName]['value']))*/
/*            console.log(inputValue[itemName]['value'])
            console.log(emptyFlag)*/
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
                        rc[itemName]['rc']=validateError.valueNotDefineWithRequireTrue.rc
                        rc[itemName]['msg']=`${itemName}${validateError.valueNotDefineWithRequireTrue.msg}`
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
// console.log(`empty check is ${JSON.stringify(rc[itemName])}`)
//console.log(currentItemValue)
            //如果currentItemValue为空，说明没有获得default，或者require为false
            //2. 如果有maxLength属性，首先检查（防止输入的参数过于巨大）
            if(currentItemRule['maxLength'] && currentItemRule['maxLength']['define']){
                let maxLengthDefine=currentItemRule['maxLength']['define']
                if(false===emptyFlag && true===ruleTypeCheck.exceedMaxLength(currentItemValue,maxLengthDefine)){
                    rc[itemName]['rc']=currentItemRule['maxLength']['error']['rc']
                    rc[itemName]['msg']=validate._private.generateErrorMsg.maxLength(currentChineseName,maxLengthDefine,useDefaultValueFlag)
                    continue
                    //return rc
                }
            }

            /*        if(rc[itemName] && rc[itemName]['rc']>0){
             break
             return rc
             }*/

            //3. 检查value的类型是否符合type中的定义
/*console.log(currentItemValue)
console.log(currentItemRule['type'])*/
            let result = validate._private.checkDataTypeBaseOnTypeDefine(currentItemValue,currentItemRule['type'])
// console.log(result)
            if(result.rc && 0<result.rc){
                rc[itemName]['rc']=result.rc
                rc[itemName]['msg']=`${itemName}${result.msg}`
                continue
            }
            if(false===result){
                rc[itemName]['rc']=validateError.typeWrong.rc
                rc[itemName]['msg']=`${itemName}${validateError.typeWrong.msg}`
                continue
            }

            //    4. 检查出了maxLength之外的每个rule进行检测
            for(let singleItemRuleName in currentItemRule){
                if('chineseName'!==singleItemRuleName && 'default'!==singleItemRuleName && 'type'!==singleItemRuleName && 'unit'!== singleItemRuleName){
                    let ruleDefine=currentItemRule[singleItemRuleName]['define']
                    switch (singleItemRuleName){
                        case "require":
                            if(ruleDefine){
                                if(true===emptyFlag){
                                    rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validate._private.generateErrorMsg.require(currentChineseName,ruleDefine,useDefaultValueFlag) //参数ruleDefine无用，只是为了函数格式统一
                                }
                            }
                            break;
                        case "minLength":
                            if(false===emptyFlag ){
                                /*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                                 return validateError.minLengthDefineNotInt
                                 }*/
                                if(true===ruleTypeCheck.exceedMinLength(currentItemValue,ruleDefine)){
                                    rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validate._private.generateErrorMsg.minLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                                }
                            }
                            break;
                        case "maxLength":
                            if(false===emptyFlag){
                                /*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                                 return validateError.maxLengthDefineNotInt
                                 }*/
                                if(true===ruleTypeCheck.exceedMaxLength(currentItemValue,ruleDefine)){
                                    rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validate._private.generateErrorMsg.maxLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                                }
                            }
                            break;
                        case "exactLength":
                            if(false===emptyFlag){
                                if(false===ruleTypeCheck.exactLength(currentItemValue,ruleDefine)){
                                    rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validate._private.generateErrorMsg.exactLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                                }
                            }
                            break;
                        case 'max':
                            if(false===emptyFlag){
                                if(true===ruleTypeCheck.exceedMax(currentItemValue,ruleDefine)){
                                    rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validate._private.generateErrorMsg.max(currentChineseName,ruleDefine,useDefaultValueFlag,inputItemDefine[itemName]['unit'])
                                }
                            }
                            break;
                        case 'min':
                            if(false===emptyFlag){
                                if(true===ruleTypeCheck.exceedMin(currentItemValue,ruleDefine)){
                                    rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validate._private.generateErrorMsg.min(currentChineseName,ruleDefine,useDefaultValueFlag,inputItemDefine[itemName]['unit'])
                                }
                            }
                            break;
                        case "format":
                            // console.log(`enter format`)
                            if(false===emptyFlag && false===ruleTypeCheck.format(currentItemValue,ruleDefine)){
                                // console.log(` format wrong`)
                                rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=validate._private.generateErrorMsg.format(currentChineseName,ruleDefine,useDefaultValueFlag)
                            }
                            break;
                        case "equalTo":
                            let equalToFiledName=inputItemDefine[itemName][singleItemRuleName]['define']

                            if(true===emptyFlag || true===dataTypeCheck.isEmpty(inputValue[equalToFiledName]['value']) || inputValue[itemName]['value']!==inputValue[equalToFiledName]['value']){
                                rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=validate._private.generateErrorMsg.equalTo(currentChineseName,inputItemDefine[equalToFiledName]['chineseName'])
                            }
                            break;
                        case 'enum':
                            if(false===ruleTypeCheck.enum(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=inputItemDefine[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=validate._private.generateErrorMsg.format(currentChineseName,ruleDefine,useDefaultValueFlag)
                            }
                            break;
                        default:
                    }
                }

                //检查出错误后，不在继续检测当前item的其它rule，而是直接检测下一个item
                if(0!==rc[itemName].rc){
                    break
                }
            }

            //没有检测出错误，对inpputValue的value进行sanity操作
            let tmpType=inputItemDefine[itemName]['type']
            if(tmpType===dataType.int || tmpType===dataType.float || tmpType===dataType.date){
                //对默认值或者inputValue进行sanity
                inputValue[itemName]['value']=validate._private.checkDataTypeBaseOnTypeDefine(currentItemValue,tmpType)
            }

            // console.log(`${itemName} check result is ${JSON.stringify(rc)}`)
        }

// console.log(`check result is ${JSON.stringify(rc)}`)
        return rc
//    注意，返回的结果是对象，结构和inputValue类型，不是{rc;xxx,msg:xxx}的格式
    },

    /*      对输入的搜索值进行检测     */
    //value的格式仿照checkInput，即：{field:{value:'val1'}}
    //只对字符进行搜索，那么检测是否 超出maxlength（是否为空在Model中确定）
    //value：包含了fiele名字和filedvalue；inputRule：coll对应的inpuitRule
    checkSearchValue(value,inputRule){
        let rc={}
        //其实只有一个value，但是为了取key方便，使用for
        for(let fieldName in value){

            //转换成字符，才能比较长度
            let fieldValue=value[fieldName]['value'].toString()
            if(!inputRule[fieldName]){
                rc[fieldName]= miscError.validate.valueRelatedRuleNotDefine
            }
            //检测是否有maxLength定义（可以去掉，在checkRuleBaseOnRuleDefine已经检查过了）
            if(dataType.string===inputRule[fieldName]['type'] || dataType.number===inputRule[fieldName]['type']){
                if(!inputRule[fieldName]['maxLength']){
                    rc[fieldName]= miscError.validate.needMaxLength
                }
            }

            let currentRule=inputRule[fieldName]
            let chineseName=currentRule['chineseName']
            let maxLengthDefine=currentRule['maxLength']['define']
            rc[fieldName]={}
            rc[fieldName]['rc']=0
            //判断长度是否超出maxlength
            if(true===ruleTypeCheck.exceedMaxLength(fieldValue,maxLengthDefine)){
                rc[fieldName]['rc']=currentRule['maxLength']['error']['rc']
                rc[fieldName]['msg']=validate._private.generateErrorMsg.maxLength(chineseName,maxLengthDefine,false)
            }
        }
        return rc
    }
}


/*根据server端rule define，生成客户端input的属性，以便angularjs对input进行检查
 * obj:server端item的rule define( /server/define/validateRule/inputRule)
 * level：深度（2）
 * resultObj: 因为采用递归调用，所以结果参数，而不是直接return结果
 */
var generateClientInputAttr=function(obj,level,resultObj){
    // let resultObj={}
    if('object'===typeof obj){
        for(let key in obj){
            resultObj[key]={}
            //深度为1，到达最底层
            if(1===level){
                let tmpChineseName=obj[key]['chineseName']
                let temInputDataType
                switch (obj[key]['type']){
                    case dataType.number:
                        temInputDataType='number';
                        break;
                    case dataType.float:
                        temInputDataType='number';
                        break;
                    case dataType.int:
                        temInputDataType='number';
                        break;                    
                    case dataType.password:
                        temInputDataType='password';
                        break;
                    case dataType.date:
                        temInputDataType='date';
                        break;
                    default:
                        temInputDataType='text'
                }

                //isQueryAutoComplete:字段作为查询时，值是否通过AC获得
                //isCRUDAutoComplete：在CRUD时，字段值是否可以通过AC获得
                //isSelect:input是否为select
                resultObj[key]={value:'',originalValue:'',isSelect:false,selectOption:[],isQueryAutoComplete:false,isCRUDAutoComplete:false,autoCompleteCollField:'',suggestList:{},blur:false,focus:true,inputDataType:temInputDataType,inputIcon:"",chineseName:tmpChineseName,errorMsg:"",validated:'undefined'}
            }else{
                //如果值是对象，递归调用
                if('object'===typeof obj[key]){
                    let currentLvl=level-1
                    //console.log(currentLvl)
                    generateClientInputAttr(obj[key],currentLvl,resultObj[key])
                }
                /*                else{
                 obj[key]={}
                 //func()
                 }*/
            }
        }
    }
    // return resultObj
}

/*根据server端rule define，生成客户端rule define
* obj:server端item的rule define( /server/define/validateRule/inputRule)
* level：深度（2）
* resultObj: 因为采用递归调用，所以结果参数，而不是直接return结果
*/
var generateClientRule=function(obj,level,resultObj){
    // let resultObj={}
    if('object'===typeof obj){
        for(let key in obj){
            resultObj[key]={}
            //深度为1,达到subItem
            if(1===level){
                for(let field in clientRuleType){
                    //rule有定义
                    if(undefined!==obj[key][field] && null!==obj[key][field]){
                        //读取rule定义
                        if(undefined!==obj[key][field]['define'] && null!==obj[key][field]['define']){
                            resultObj[key][field]={}
                            resultObj[key][field]['define']=obj[key][field]['define']
                            //产生错误信息，以便angularjs检查input错误时使用
                            resultObj[key][field]['msg']=validate._private.generateErrorMsg[field](obj[key]['chineseName'],obj[key][field]['define'],obj[key]['default'])
                        }
                    }
                }
            }else{
                //如果值是对象，递归调用
                if('object'===typeof obj[key]){
                    let currentLvl=level-1
                    generateClientRule(obj[key],currentLvl,resultObj[key])
                }

            }
        }
    }
    // return resultObj
}

//根据skipList提供的key，在origObj删除对应key
//专门使用：使用generateClientRule或者generateClientInputAttr，是从mongodb structure中直接转换，但是其中有些字段，例如cDate，是后台自动创建，无需前台检测，所以需要删除
//origObj: generateClientRule或者generateClientInputAttr产生的结果
//skipList:需要删除的字段
//处理完成返回true
var deleteNonNeededObject=function(origObj,skipList){
    if(false===dataTypeCheck.isObject(origObj)) {
        return miscError.deleteNonNeededObject.origObjTypeWrong
    }
    if(false===dataTypeCheck.isObject(skipList)){
        return miscError.deleteNonNeededObject.skipListTypeWrong
    }
    for(let coll in origObj){
        //对应的collection没有需要删除的字段
        if(undefined===skipList[coll]){
            continue
        }else{
            //对应的coll有对应的删除字段，查找出对应的字段，并删除
            for(let field in origObj[coll]){
                if(-1!==skipList[coll].indexOf(field)){
                    delete origObj[coll][field]
                }
            }
        }
    }
    return rightResult
}

//collection的某些字段是ObjectId，需要对应到具体的字段（例如department.parentDepartment在client实际显示的department name，而不是objectID）
//origObj: generateClientRule或者generateClientInputAttr产生的结果
//matchList：指定对应的filed连接到的coll.field(db中字段是objectID，但是用作外键，实际代表字符等，所以需要修改checkRule和inputAttr的chineseName)
var objectIdToRealField=function(origObj,matchList){
    if(false===dataTypeCheck.isObject(origObj)) {
        return miscError.objectIdToRealField.origObjTypeWrong
    }
    if(false===dataTypeCheck.isObject(matchList)){
        return miscError.objectIdToRealField.skipListTypeWrong
    }
    let tmp,tmpColl,tmpField
    //let tmpValue
    for(let coll in matchList){
        if(undefined===matchList[coll]){
            continue
        }
        for (let field in matchList[coll]){

            tmp=matchList[coll][field].split('.')
            tmpColl=tmp[0]
            tmpField=tmp[1]

            //如果是attr（通过判断是否有chineseName），保存原始的chineseName，但是inputDataType换成相关字段的类型
            if(origObj[coll][field]['chineseName']){
                origObj[coll][field]['inputDataType']=origObj[tmpColl][tmpField]['inputDataType']
/*                tmpValue=origObj[coll][field]['chineseName']
                console.log(tmpValue)
                origObj[coll][field]=origObj[tmpColl][tmpField]

                origObj[coll][field]['chineseName']=tmpValue
                console.log(origObj[coll][field])*/
            }else{//否则就是ruleDefine
                //遍历关联字段的rule
/*                console.log(coll)
                 console.log(field)
                console.log(origObj[tmpColl][tmpField])*/
                for(let rule in origObj[tmpColl][tmpField]){
                    //console.log(rule)
                    //require还是使用原始的定义
                    if('require'===rule){
                        continue
                    }
                    //console.log(tmpField+" "+rule)
                    //其他rule的定义和msg采用关联字段的定义和msg（在客户端使用，没有rc）
                    //如果关联字段中 有某个rule，但是原始字段中 没有，那么在原始字段设置一个空rule
                    if(undefined===origObj[coll][field][rule]){
                        origObj[coll][field][rule]={}
                    }
                    //console.log(origObj[tmpColl][tmpField][rule]['define'])
                    origObj[coll][field][rule]['define']=origObj[tmpColl][tmpField][rule]['define']
                    origObj[coll][field][rule]['msg']=origObj[tmpColl][tmpField][rule]['msg']
                }
            }
        }
    }

    return rightResult
}

//var objectIdValidate=function(_id){
//
//}

var encodeHtml = function(s){
    if(undefined===s){return "";}
    if('string'!=typeof(s)){s= s.toString();};
    if(0=== s.length){return "";};
    var returnHtml='';

    return s.replace(regex.encodeHtmlChar,function(char){
        var c=char.charCodeAt(0),r='&#';
        c=(32===c) ? 160 : c;
        return r+c+';';
    })
    /*    s = (s != undefined) ? s : s.toString();
     return (typeof(s) != "string") ? s :
     s.replace(this.REGX_HTML_ENCODE,
     function($0){
     var c = $0.charCodeAt(0), r = ["&#"];
     c = (c == 0x20) ? 0xA0 : c;
     r.push(c); r.push(";");
     return r.join("");
     });*/
};


//前端传入的数据是{filed:{value:'xxx'}}的格式，需要转换成mongoose能辨认的格式{filed:'xxx'}
var convertClientValueToServerFormat=function(values){
    let result={}
    for(let key in values){
        if(values[key]['value']){
            result[key]=values[key]['value']
        }
    }
    return result
}


//将server返回的rc格式化成client能接受的格式
//server可能是{rc:xxxx,msg:{client:'yyy',server:'zzz'}======>client  {rc:xxx,msg:yyy}
var  formatRc=function(rc,clientFlag=true){
    if(rc.msg && (rc.msg.client || rc.msg.server)){
        if(clientFlag){
            rc.msg=rc.msg.client
        }else{
            rc.msg=rc.msg.server
        }
    }
}
exports.func={
    dataTypeCheck,
    ruleTypeCheck,
    CRUDGlobalSetting,
    generateRandomString,
    leftMSInDay,
    leftSecondInDay,

    parseGmFileSize,
    convertImageFileSizeToByte,
    convertURLSearchString,

    getUserInfo,
    checkUserState,
    //checkUserIdFormat:checkUserIdFormat,
    checkInterval,// use Lua instead of session(although sesssion use redis too)
    preCheck,
    getPemFile,
    //objectIndexOf:objectIndexOf,
    //extractKey:extractKey,
    validate,
    generateClientInputAttr,
    generateClientRule,
    deleteNonNeededObject,
    objectIdToRealField,
    //objectIdValidate,


    encodeHtml,
    convertClientValueToServerFormat,
    formatRc,
}

// CRUDGlobalSetting.setDefault()
/*CRUDGlobalSetting.getSingleSetting('search','maxKeyNum1',function(err,result){
    console.log(err)
    console.log(result)
})*/


//console.log(test())
//test()