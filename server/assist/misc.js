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

var mongooseErrorHandler=require('../define/error/mongoError').mongooseErrorHandler

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
var validateInputRuleError=require('../define/error/nodeError').nodeError.assistError.misc.validateInputRule

var validateInputValueError=require('../define/error/nodeError').nodeError.assistError.misc.validateInputValue

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
 * 对Rule定义进行检测，确保定义是正确
 */
/*          rule        */
/*1. 至少定义3个字段：chineseName/type/require
 * 2
 * */
var validateInputRule={

        /*
        * 对单个字段的所有rule定义进行检查
        * coll/singleFieldName:如果字段错误，为返回值提供错误coll/field的名称（其他错误，可以使用chineseName）；singleFieldInputRules：field的rule定义
        * 返回：{rc:0}或者{rc:xxxx,msg:'field的rule定义错误'}
        * */
        checkSingleFieldRuleDefine(coll,singleFieldName,singleFieldInputRules){
            let rc={}
            // for(let inputRule in inputRules){
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
                            return validateInputRuleError.ruleDefineWrong(coll, singleFieldName, 'default')
                        }
                        break;
                    case dataType.int:
                        checkResult = dataTypeCheck.isStrictInt(singleFieldInputRules['default'])
                        if (false === checkResult) {
                            return validateInputRuleError.ruleDefineWrong(coll, singleFieldName, 'default')
                        }

                        break
                    case dataType.float:
                        checkResult = dataTypeCheck.isStrictFloat(singleFieldInputRules['default'])
                        if (false === checkResult) {
                            return validateInputRuleError.ruleDefineWrong(coll, singleFieldName, 'default')
                        } else {
                            singleFieldInputRules['default'] = checkResult
                        }
                        break
                    case dataType.number:
                        checkResult = dataTypeCheck.isNumber(singleFieldInputRules['default'])
                        if (false === checkResult) {
                            return validateInputRuleError.ruleDefineWrong(coll, singleFieldName, 'default')
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
var validateInputValue={
    _private: {
        generateErrorMsg: {
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
        },
        //无法确保带检测的值的类型（在rule定义的文件中，type可以是字符或者数值，甚至是array），所以需要函数对输入进行检测，排除不支持的类型
        ruleTypeCheck:{
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
        },
        //检测数据类型
        //require,maxLength,minLength,exactLength,min,max,format,format
        //返回值：true/false/unknownDataType
        checkDataTypeBaseOnTypeDefine(value, type){
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
                    return (validateInputValue._private.ruleTypeCheck.isFileFolderExist(value) && dataTypeCheck.isFile(value));
                case dataType.folder:
                    return (validateInputValue._private.ruleTypeCheck.isFileFolderExist(value) && dataTypeCheck.isFolder(value))
                case dataType.number:
                    return dataTypeCheck.isNumber(value)
                default:
                    return validateInputValueError.unknownDataType
            }
        },
    },
    //判断传入的参数是否正确，能否转换成JSON
    checkInputDataValidate(values){
        //1 检查参数的格式，必需是Object，且含有key
        //general error，直接返回{rc:xxxx,msg:yyy}格式的错误
        // console.log(`in 1`)
        if(false===dataTypeCheck.isSetValue(values)){
            return validateInputValueError.valueNotDefine
        }
        // console.log(`in 2`)
        if(dataTypeCheck.isEmpty(values)){
            return validateInputValueError.valueEmpty
        }
        //2 是否为object(JSON的格式为Object)
        //let result=values
        // console.log(`in 3`)
        if(false=== dataTypeCheck.isObject(values)){
            return validateInputValueError.inputValuesTypeWrong
        }
        // console.log(`in 4`)
/*        else{
            try{
                console.log(`before parse ${JSON.stringify(values)}`)
                result=JSON.parse(values)
                console.log(`after parse ${JSON.stringify(result)}`)
            }
            catch(e){
                console.log(`parse error ${e}`)
                // console.log(validateInputValueError.inputValuesParseFail)
                return validateInputValueError.inputValuesParseFail
            }
        }*/

        //return {rc:0,msg:result}
        return rightResult
    },
    //检查是否为{field:{value:'xxxx'},field2:{value:'yyyy'}}）的格式
    checkInputDataFormat(values){
        for(let singleField in values){
            if(undefined===values[singleField]['value']){
                return validateInputValueError.inputValuesFormatWrong
            }
        }
        return rightResult
    },
    //检查key数量是否合适（不能超过最大定义）
    checkInputValueKey(values,maxFieldNum){
        let keys=Object.keys(values)
/*        console.log(`obj length is ${keys.length}`)
        console.log(`maxFieldNum is ${maxFieldNum}`)*/
        if(keys.length>maxFieldNum){
            return validateInputValueError.inputValueFieldNumExceed
        }
/*        let tmp=new Set(keys)
        // console.log(`set size is ${tmp.size}`)
        if(tmp.size!==keys.length){
            return validateInputValueError.inputValueHasDuplicateField
        }*/
        return rightResult
    },
    //检查key是否有重复(无需检测，如果有重复，JSON.parse会用后面的覆盖前面的field)
    checkInputValueDuplicateKey(value){
        //console.log('dup check in')
        let tmpValue={}
        for(let key in value){
            // console.log(`current key is ${key}`)
            tmpValue[key]=1 //随便设个值，因为只需统计最终key数
        }
        // console.log(`converted dup is ${JSON.stringify(tmpValue)}`)
        let tmpKeys=Object.keys(tmpValue)
        let inputKeys=Object.keys(value)
        // console.log(`tmp key is ${JSON.stringify(tmpValue)}`)
        // console.log(`input key is ${JSON.stringify(value)}`)
        if(tmpKeys.length!==inputKeys.length){
            return validateInputValueError.inputValueHasDuplicateField
        }
        return rightResult
    },
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
    checkInput(inputValue,collRules,basedOnInputValue=true){

        let rc={}
        let tmpResult

/*        console.log(`input value  is ${inputValue}`)
        console.log(`input value  type is ${typeof inputValue}`)*/
        //2 inputValue中所有field，是否为rule中定义的（阻止传入额外字段）
        for(let singleFieldName in inputValue){
            //必须忽略id或者_id，因为没有定义在rule中（在创建doc时，这是自动生成的，所以创建上传的value，无需对此检测；如果rule中定义了，就要检测，并fail）
            if(singleFieldName!=='_id' && singleFieldName !=='id'){
                if(undefined===collRules[singleFieldName ]){
                    console.log(`single field name is ${singleFieldName}`)
                    console.log(`coll rule  is ${JSON.stringify(collRules)}`)
                    rc[singleFieldName]=validateInputValueError.valueRelatedRuleNotDefine
                    return rc
                }
            }

        }

        //3 确定检查的基准（要验证的field：按照input进行，还是按照rule进行）
        let base
        if(basedOnInputValue){
            base=inputValue
        }else{
            base=collRules
        }

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
                    rc[itemName]['rc']=validateInputValueError.objectIdEmpty.rc
                    rc[itemName]['msg']=validateInputValueError.objectIdEmpty.msg
                    continue
                }
                if(false===regex.objectId.test(inputValue[itemName]['value'])) {
                    rc[itemName]['rc']=validateInputValueError.objectIdWrong.rc
                    rc[itemName]['msg']=validateInputValueError.objectIdWrong.msg
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
                        rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.format(currentChineseName,collRules[itemName]['format']['define'],false)
                    }
                    // continue
                }else{
                    // console.log(`field ${itemName} not define in value`)
                    if(true===currentItemRule['require']['define']){
                        // console.log(`rule field ${itemName} define`)
                        rc[itemName]['rc']=collRules[itemName]['require']['error']['rc']
                        rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.require(currentChineseName,collRules[itemName]['require']['define'],false)
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
                        rc[itemName]['rc']=validateInputValueError.valueNotDefineWithRequireTrue.rc
                        rc[itemName]['msg']=`${currentItemRule['chineseName']}:${validateInputValueError.valueNotDefineWithRequireTrue.msg}`
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
                    if(false===validateInputValue._private.ruleTypeCheck.format(currentItemValue,formatDefine)){
                        rc[itemName]['rc']=currentItemRule['format']['error']['rc']
                        rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.format(currentChineseName,formatDefine,useDefaultValueFlag)
                    }
/*                    if(false===formatDefine.test(currentItemValue)){
                        rc[itemName]['rc']=currentItemRule['format']['error']['rc']
                        rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.format(currentChineseName,formatDefine,useDefaultValueFlag)
                    }*/
                }
                continue
            }

            //3.5 如果有maxLength属性，首先检查（防止输入的参数过于巨大）
            if(currentItemRule['maxLength'] && currentItemRule['maxLength']['define']){
                let maxLengthDefine=currentItemRule['maxLength']['define']
                // console.log(`maxLength: define ${maxLengthDefine}, value ${currentItemValue}`)
                if(false===emptyFlag && true===validateInputValue._private.ruleTypeCheck.exceedMaxLength(currentItemValue,maxLengthDefine)){
                    rc[itemName]['rc']=currentItemRule['maxLength']['error']['rc']
                    rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.maxLength(currentChineseName,maxLengthDefine,useDefaultValueFlag)
                    continue
                }
                //继续往下检查其他rule
            }

            //3.6 检查enum(需要自定义代码而不是调用ruleTypeCheck中的函数)
            if(currentItemRule['enum'] && currentItemRule['enum']['define']){
                let enumDefine=currentItemRule['enum']['define']
                if(false===emptyFlag){
                    // if(-1===enumDefine.indexOf(currentItemValue)){
                    if(false===validateInputValue._private.ruleTypeCheck.enum(currentItemValue,enumDefine)){

                        rc[itemName]['rc']=currentItemRule['enum']['error']['rc']
                        rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.enum(currentChineseName,enumDefine,useDefaultValueFlag)
                    }
                }
                continue
            }



            //3.7 检查value的类型是否符合type中的定义
/*console.log(currentItemValue)
console.log(currentItemRule['type'])*/
            let result = validateInputValue._private.checkDataTypeBaseOnTypeDefine(currentItemValue,currentItemRule['type'])
//console.log(result)
            if(result.rc && 0<result.rc){
                rc[itemName]['rc']=result.rc
                rc[itemName]['msg']=`${itemName}${result.msg}`
                continue
            }
            if(false===result){
                rc[itemName]['rc']=validateInputValueError.typeWrong.rc
                rc[itemName]['msg']=`${itemName}${validateInputValueError.typeWrong.msg}`
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
                                    rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.require(currentChineseName,ruleDefine,useDefaultValueFlag) //参数ruleDefine无用，只是为了函数格式统一
                                }
                            }
                            break;
                        case "minLength":
                            if(false===emptyFlag ){
                                /*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                                 return validateError.minLengthDefineNotInt
                                 }*/
                                if(true===validateInputValue._private.ruleTypeCheck.exceedMinLength(currentItemValue,ruleDefine)){
                                    rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.minLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                                }
                            }
                            break;
/*                        case "maxLength":
                            if(false===emptyFlag){
                                /!*                            if(false===dataTypeCheck.isInt(ruleDefine)){
                                 return validateError.maxLengthDefineNotInt
                                 }*!/
                                if(true===validateInputValue._private.ruleTypeCheck.exceedMaxLength(currentItemValue,ruleDefine)){
                                    rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.maxLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                                }
                            }
                            break;*/
                        case "exactLength":
                            if(false===emptyFlag){
                                if(false===validateInputValue._private.ruleTypeCheck.exactLength(currentItemValue,ruleDefine)){
                                    rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.exactLength(currentChineseName,ruleDefine,useDefaultValueFlag)
                                }
                            }
                            break;
                        case 'max':
                            if(false===emptyFlag){
                                if(true===validateInputValue._private.ruleTypeCheck.exceedMax(currentItemValue,ruleDefine)){
                                    rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.max(currentChineseName,ruleDefine,useDefaultValueFlag,collRules[itemName]['unit'])
                                }
                            }
                            break;
                        case 'min':
                            if(false===emptyFlag){
                                if(true===validateInputValue._private.ruleTypeCheck.exceedMin(currentItemValue,ruleDefine)){
                                    rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                    rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.min(currentChineseName,ruleDefine,useDefaultValueFlag,collRules[itemName]['unit'])
                                }
                            }
                            break;
/*                        case "format":
                            if(false===emptyFlag && false===validateInputValue._private.ruleTypeCheck.format(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.format(currentChineseName,ruleDefine,useDefaultValueFlag)
                            }
                            break;*/
                        case "equalTo":
                            let equalToFiledName=collRules[itemName][singleItemRuleName]['define']

                            if(true===emptyFlag || true===dataTypeCheck.isEmpty(inputValue[equalToFiledName]['value']) || inputValue[itemName]['value']!==inputValue[equalToFiledName]['value']){
                                rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.equalTo(currentChineseName,collRules[equalToFiledName]['chineseName'])
                            }
                            break;
/*                        case 'enum':
                            if(false===validateInputValue._private.ruleTypeCheck.enum(currentItemValue,ruleDefine)){
                                rc[itemName]['rc']=collRules[itemName][singleItemRuleName]['error']['rc']
                                rc[itemName]['msg']=validateInputValue._private.generateErrorMsg.format(currentChineseName,ruleDefine,useDefaultValueFlag)
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
                inputValue[itemName]['value']=validateInputValue._private.checkDataTypeBaseOnTypeDefine(currentItemValue,tmpType)
            }
        }

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
            if(true===validateInputValue._private.ruleTypeCheck.exceedMaxLength(fieldValue,maxLengthDefine)){
                rc[fieldName]['rc']=currentRule['maxLength']['error']['rc']
                rc[fieldName]['msg']=validateInputValue._private.generateErrorMsg.maxLength(chineseName,maxLengthDefine,false)
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
                            resultObj[key][field]['msg']=validateInputValue._private.generateErrorMsg[field](obj[key]['chineseName'],obj[key][field]['define'],obj[key]['default'])
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

//对update传入的参数进行检测，如果设置为null，就认为是控制端，无需传入db
var constructCreateCriteria=function(formattedValues){
    for(let key in formattedValues){
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

var populateSingleDoc=function(singleDoc,populateOpt,populatedFields){
    return new Promise(function(resolve,reject){
        let populateFlag=false
        // let createdResult=singleDoc
        for(let singlePopulatedField of populatedFields){
            if(singleDoc[singlePopulatedField]){
                populateFlag=true
                break;
            }
        }
        // console.log(`department insert result is ${JSON.stringify(result)}`)
        if(populateFlag){
            singleDoc.populate(populateOpt,function(populateErr,populateResult){
                //console.log('create populate')
                if(populateErr){
                    //console.log(`department create fail: ${JSON.stringify(populateErr)}`)
                    resolve( mongooseErrorHandler(populateErr))
                }
                resolve({rc:0,msg:populateResult})
            })
        }else{
            resolve({rc:0,msg:singleDoc})
        }
    })

}

//将server返回的rc格式化成client能接受的格式
//server可能是{rc:xxxx,msg:{client:'yyy',server:'zzz'}======>client  {rc:xxx,msg:yyy}
var  formatRc=function(rc,clientFlag=true){
// console.log(`original rc is ${JSON.stringify(rc)}`)
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
    //其他格式的rc（正确结果，或者已经是{rc:xxx,msg:'yyy'}），直接返回
    return rc
/*    //已经是{rc:xxx,msg:'yyy'}的格式，直接返回输入值
    if(rc.msg && undefined===rc.msg.client &&  undefined===rc.msg.server){
        return rc
    }

    return miscError.validate.rcFormatWrong*/

}

exports.func={
    dataTypeCheck,
    // ruleTypeCheck, //移动到validateInputRule中
    // CRUDGlobalSetting, //全局设置直接通过require方式（反正都是存储在内存中）
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
    validateInputRule,
    validateInputValue,
    generateClientInputAttr,
    generateClientRule,
    deleteNonNeededObject,
    objectIdToRealField,
    //objectIdValidate,


    encodeHtml,
    constructCreateCriteria,
    constructUpdateCriteria,
    populateSingleDoc,
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