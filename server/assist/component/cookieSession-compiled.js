'use strict';

/**
 * Created by ada on 2015/5/15.
 */
/*
set cookie and express-session main
for session, reuse mongodb connection
*/
var mongooseConnect = require('../model/dbConnection').mongoose;
var expressSession = require('express-session');
var sessionStore = require('connect-redis')(expressSession);
var sessionConfig = require('../../config/global/defaultGlobalSetting').session;

/*//maxAge:ms;  负数（-1）：临时cookie，关闭网页就删除cookie；0：立刻删除；正整数：多少毫秒后失效
// secure:false, cookie是否只能在https上传输。false，可在http上传
//path: URL必须符合才能使用cookie。例如，如果设置path为/test/,则URL必须为/test才能使用。设为/，所有URL均可使用。
//domain：域名，必须以.作为开头（或者直接就是IP？？），则所有以此设置为结尾的URL都可使用cookie。domian_path限定了访问cookie的路径
/!*为了简单起见，所有cookie的配置都放在文件中（require命令会把内容存入内存）*!/
var cookieOptions={path:'/',domain:sessionConfig.domain,maxAge:sessionConfig.maxAge,secure:false,httpOnly:true};
//secret:digest session id
// resave/rolling: when false, only when sesssion expire or session content changed, will save session to store/send cookie to cilent
//saveUninitialized: when false, if session id created but no any content, will not save session to store
var sessionOptions={secret:'suibian',resave:false,rolling:false,saveUninitialized:false};
var sessionStoreInst=new sessionStore({mongooseConnection:mongooseConnect.connection});*/

var sessionOptions = sessionConfig.session; //session中除了cookie和store的其他option
var store = new sessionStore(sessionConfig.storeOptions.redis); //单独赋值，以便可以export。因为store可以在server侧做些操作
sessionOptions.cookie = sessionConfig.cookie; //设置session中cookie相关属性（主要对client起作用）
sessionOptions.store = store; //设置session中store的相关属性（主要是server端）
/*var store=
sessionOptions.cookie=cookieOptions;
sessionOptions.store=sessionStoreInst;*/

/*var cookieSetDefault=function(){
    cookieOptions={path:'/',domain:'localhost',maxAge:900000,secure:false,httpOnly:true}
}

var setCookieMaxAge=function(duration){
    cookieOptions.maxAge=duration*1000;
}*/

exports.session = expressSession(sessionOptions); //app.js中用作中间件
exports.store = store; //提供接口，以便执行store.touch等操作
// exports.cookieOptions=cookieOptions;
//exports.setCookie={cookieSetDefault:cookieSetDefault,setCookieMaxAge:setCookieMaxAge}

//# sourceMappingURL=cookieSession-compiled.js.map