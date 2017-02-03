/**
 * Created by Ada on 2016/11/9.
 * 非validate相关的函数
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var miscError=require('../define/error/nodeError').nodeError.assistError.misc
var gmError=require('../define/error/nodeError').nodeError.assistError.gmImage
var regex=require('../define/regex/regex').regex
var randomStringType=require('../define/enum/node').node.randomStringType
var userStateEnum=require('../define/enum/node').node.userState
var LuaSHA=require('../define/Lua/LuaSHA').LuaSHA
var redisError=require('../define/error/redisError').redisError
var ioredisClient=require('../model/redis/connection/redis_connection').ioredisClient
var intervalCheck=require('../config/global/defaultGlobalSetting').intervalCheck

var mongooseErrorHandler=require('../define/error/mongoError').mongooseErrorHandler
var execSHALua=require("./component/shaLua").execSHALua

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

}

//len:产生字符串的长度
//type: basic(0-9A-Z)；normal(0-9A-Za-z); complicated(normal+特殊字符)
function generateRandomString(len=4,type=randomStringType.normal){
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

//计算当天剩下的毫秒数
var restMSInDay=function(){
    let day=new Date().toLocaleDateString()
    let endTime='23:59:59'
    //毫秒
    //let ttlTime=parseInt(new Date(`${day} ${endTime}`).getTime())-parseInt(new Date().getTime())
    let ttlTime=new Date(`${day} ${endTime}`).getTime()-new Date().getTime()
    //console.log(ttlTime)
    return ttlTime
}

var restSecondInDay=function(){
    //console.log(leftMSInDay)
    return Math.round(parseInt(restMSInDay())/1000)
}



    //解析GM返回的文件大小，返回数值和单位（GM返回Ki，Mi，Gi.没有单位，是Byte。除了Byte，其他都只保留1位小数，并且四舍五入。例如：1.75Ki=1.8Ki）
//1.8Ki，返回1.8和“ki”；900，返回900
//解析失败，或者单位是Gi，返回对应的错误
//{ rc: 0, msg: { sizeNum: '200', sizeUnit: 'Ki' } }
    function parseGmFileSize(fileSize){
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
    function convertImageFileSizeToByte(fileSizeNum,fileSizeUnit){
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

    function getPemFile(pemPath){
        for(var i= 0,n=pemPath.length;i<n;i++){
            if(true===fileExist(pemPath[i])){
                //console.log(pemPath[i])
                return pemPath[i]

                //break
            }
        }
        return
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
            //populate无需使用promise方式返回
            singleDoc.populate(populateOpt,function(populateErr,populateResult){
            //    singleDoc.populate(null,function(populateErr,populateResult){
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

//如果字符中有正则中用到的特殊字符，跳脱（防止此字符被用在正则中时，其中的特殊字符被reg处理）
function escapeRegSpecialChar(str){
    var reg=regex.regSpecialChar
    //设置\\，实际打印为\，使用时会自动转义
    return str.replace(reg,'\\$1')
}

module.exports={
    checkInterval,
    generateRandomString,
    restMSInDay,
    restSecondInDay,

    parseGmFileSize,
    convertImageFileSizeToByte,
    getPemFile,

    getUserInfo,
    checkUserState,
    preCheck,

    encodeHtml,

    populateSingleDoc,
    // formatRc,

    convertURLSearchString,
    escapeRegSpecialChar,

}
