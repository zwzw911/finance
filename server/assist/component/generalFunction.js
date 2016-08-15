/**
 * Created by wzhan039 on 2015-11-18.
 */
var fs=require('fs')
var crypto=require('crypto')
 
var general=require('../define_config/global_config').define.general

var runtimeNodeError=require('../define_config/runtime_node_error').runtime_node_error
var input_validate=require('../define_config/input_validate').input_validate

var rightResult={rc:0,msg:null}


//直接在defaultGlobalSetting中设定
/*var getPemFile=function(pemPath){
    for(var i= 0,n=pemPath.length;i<n;i++){
        if(true===fileExist(pemPath[i])){
            //console.log(pemPath[i])
            return pemPath[i]

            //break
        }
    }
    return
}*/

/*//使用包装过的fileExist，因为以后可能会有新的函数
var fileExist=function(file){
    return fs.existsSync(file)
}*/

//1. 搜索字符串中的+转换成空格
//2. 截取规定的字符数量
var convertURLSearchString=function(searchString){
    var tmpStr=searchString.split('+');
    //console.log(tmpStr)
    var totalLen=general.searchTotalKeyLen
    var strNum=tmpStr.length
    var curStrLen=0;//计算当前处理的字符长度
    var curStr='';//转换后的搜索字符串（使用空格分隔）
    for(var i=0;i<strNum;i++){
        //第一个key就超长，直接截取20个字符
        if(0===i && tmpStr[0].length>totalLen){
            curStr=tmpStr[0].substring(0,totalLen)
            return curStr.trim()
        }
        //如果当前已经处理的字符串+下一个要处理的字符串的长度超出，返回当前已经处理的字符串，舍弃之后的字符串
        //-i:忽略空格的长度
        if(curStr.length+tmpStr[i].length-i>totalLen){
            return curStr.trim()
        }
        curStr+=tmpStr[i]
        curStr+=' ';

    }

    return curStr.trim()
}
//获得当前用户的信息，以便在toolbar上显示对应的信息
var getUserInfo=function(req){
    var result
    if(req.session.state===general.userState.signin){
        result=req.session.userName
        //result.userId=req.session.userId
    }
    //console.log(result)
    return result
}

/*var quit=function(req){
 req.session.state=2
 req.session.userName=undefined
 req.session.userId=undefined

 }*/
/*var generateRandomString=function(num){
    var validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var len=validString.length
    var randomIdx,result='';
    for(var i=0;i<num;i++){
        randomIdx=Math.round(Math.random()*(len-1));
        result+=validString[randomIdx]
    }
    return result
}*/

var checkUserState=function(req){
    //需要检测状态,如果不是1或者2,就没有session,后续的代码也就不必执行
    if(general.userState.notSignin!=req.session.state && general.userState.signin!=req.session.state){
        return runtimeNodeError.general.userNotSignin
    }
    return rightResult
}

var checkUserIdFormat=function(req){
    return input_validate.user._id.type.define.test(req.session.userId) ? rightResult:input_validate.user._id.type.client
}

var checkUserLogin=function(req){
    return req.session.state===general.userState.signin ? rightResult:runtimeNodeError.general.userNotSignin
}

//state只要不是undefine就可以
var checkUserStateNormal=function(req){
    return (general.userState.signin===req.session.state || general.userState.notSignin===req.session.state) ? rightResult:runtimeNodeError.general.userStateWrong
}

//使用redis Lua后，不再使用这个函数
/*//新版本,使用新的逻辑
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
        /!*        console.log(durationSinceLastGet)
         console.log(curTime)
         console.log(req.session.lastGet)*!/
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
}*/
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
        if(general.userState.signin!==req.session.state){
            return runtimeNodeError.general.userNotSignin
        }
    }

    if(1===req.session.state){
        result=checkUserIdFormat(req)
        if(result.rc>0){
            return result
        }
    }
    return checkInterval(req)
}

//对于复杂数组(内容为object)
/*
 *  key:要检测的object中的键;value:要检测的key所对应的value;array:要检测的数组
 * */
var objectIndexOf=function(key,value,array){
    var len=array.length;
    if(0===len){
        return -1
    }

    var result=-1;
    for(var i=0;i<len;i++){
        if(array[i][key]===value){
            result=i
            break
        }
    }
    return result
}

//提取数组对象中某一个key的值到一个数组
var extractKey=function(key,array){
    var tmp=[]
    if(0===array.length){
        return tmp
    }

    for(var i=0;i<array.length;i++){
        tmp.push(array[i][key])
    }

    return tmp
}

/*放在crypt中*/
/*var genSalt=function(callback){
	crypt.randomByte(16,fucntion(err,buf){
		if(err){
			return runtime_node_error.generalFunc.genSalt
		}
		return {rc:0,msg:but.toString('hex')}
	})
}*/

exports.func={
    //parseGmFileSize:parseGmFileSize,
    //convertImageFileSizeToByte:convertImageFileSizeToByte,
    convertURLSearchString:convertURLSearchString,
    getUserInfo:getUserInfo,
    //generateRandomString:generateRandomString,
    checkUserState:checkUserState,
    checkUserIdFormat:checkUserIdFormat,
    //checkInterval:checkInterval,
    preCheck:preCheck,
    //fileExist:fileExist,
    //getPemFile:getPemFile,
    objectIndexOf:objectIndexOf,
    extractKey:extractKey,
	//genSalt:genSalt

}
