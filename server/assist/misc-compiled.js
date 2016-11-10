/**
 * Created by Ada on 2016/11/9.
 * 非validate相关的函数
 */
'use strict';

var checkInterval = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req) {
        var appSetting, identify, params, result, rc;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        //return new Promise(function(resolve,reject){
                        appSetting = require('../config/global/appSetting');
                        identify = void 0;

                        if (!(req.session && req.session.id)) {
                            _context.next = 8;
                            break;
                        }

                        if (regex.sessionId.test(req.session.id)) {
                            _context.next = 5;
                            break;
                        }

                        return _context.abrupt("return", miscError.checkInterval.sessionIdWrong);

                    case 5:
                        identify = req.session.id;
                        _context.next = 13;
                        break;

                    case 8:
                        if (true === appSetting['trust proxy']) {
                            //req.ip和req.ips，只有在设置了trust proxy之后才能生效，否则一直是undefined
                            if (req.ips && req.ips[0]) {
                                identify = req.ips[0];
                            }
                        } else {
                            identify = req.connection.remoteAddress;
                        }

                        if (!(identify && identify.substr(0, 7) == "::ffff:")) {
                            _context.next = 13;
                            break;
                        }

                        identify = identify.substr(7);

                        if (regex.ip.test(identify)) {
                            _context.next = 13;
                            break;
                        }

                        return _context.abrupt("return", miscError.checkInterval.IPWrong);

                    case 13:
                        if (!(undefined === identify)) {
                            _context.next = 15;
                            break;
                        }

                        return _context.abrupt("return", miscError.checkInterval.unknownRequestIdentify);

                    case 15:

                        //console.log(`trust proxy false ${identify}`)


                        params = {};

                        params.setting = intervalCheck;
                        params.currentTime = new Date().getTime();
                        params.id = identify;

                        _context.next = 21;
                        return execSHALua(LuaSHA.Lua_check_interval, params);

                    case 21:
                        result = _context.sent;
                        _context.t0 = result['rc'];
                        _context.next = _context.t0 === 0 ? 25 : _context.t0 === 10 ? 26 : _context.t0 === 11 ? 30 : _context.t0 === 12 ? 32 : 34;
                        break;

                    case 25:
                        return _context.abrupt("return", result);

                    case 26:
                        rc = {};

                        rc['rc'] = miscError.checkInterval.tooMuchReq.rc;
                        rc['msg'] = miscError.checkInterval.forbiddenReq.msg.client + "，请在" + result['msg'] + "秒后重试";
                        //console.log(rc)
                        return _context.abrupt("return", rc);

                    case 30:
                        return _context.abrupt("return", miscError.checkInterval.between2ReqCheckFail);

                    case 32:
                        return _context.abrupt("return", miscError.checkInterval.exceedMaxTimesInDuration);

                    case 34:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function checkInterval(_x) {
        return _ref.apply(this, arguments);
    };
}();

//len:产生字符串的长度
//type: basic(0-9A-Z)；normal(0-9A-Za-z); complicated(normal+特殊字符)


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

require("babel-polyfill");
require("babel-core/register");

var miscError = require('../define/error/nodeError').nodeError.assistError.misc;
var gmError = require('../define/error/nodeError').nodeError.assistError.gmImage;
var regex = require('../define/regex/regex').regex;
var randomStringType = require('../define/enum/node').node.randomStringType;
var userStateEnum = require('../define/enum/node').node.userState;
var LuaSHA = require('../define/Lua/LuaSHA').LuaSHA;
var redisError = require('../define/error/redisError').redisError;
var ioredisClient = require('../model/redis/connection/redis_connection').ioredisClient;
var intervalCheck = require('../config/global/defaultGlobalSetting').intervalCheck;

var mongooseErrorHandler = require('../define/error/mongoError').mongooseErrorHandler;
var execSHALua = require("./component/shaLua").execSHALua;

function generateRandomString() {
    var len = arguments.length <= 0 || arguments[0] === undefined ? 4 : arguments[0];
    var type = arguments.length <= 1 || arguments[1] === undefined ? randomStringType.normal : arguments[1];

    /*    if(undefined===len || false===dataTypeCheck.isInt(len)){
     len=4
     }*/
    /*    strict= strict ? true:false
     let validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
     let result=''
     if(true===strict){validString+=`${validString}!@#$%^&*()+={}[]|\?/><`}*/
    var validString = void 0;
    var basicString = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    switch (type) {
        case randomStringType.basic:
            validString = basicString;
            break;
        case randomStringType.normal:
            validString = basicString + "abcdefghijklmnopqrstuvwxyz";
            break;
        case randomStringType.complicated:
            validString = basicString + 'abcdefghijklmnopqrstuvwxyz' + "`" + "!@#%&)(_=}{:\"><,;'[]^$*+|?.-";
            break;
    }
    //console.log(validString)
    var validStringLen = validString.length;
    var result = '';
    for (var i = 0; i < len; i++) {
        result += validString.substr(parseInt(Math.random() * validStringLen, 10), 1);
    }

    return result;
}

//计算当天剩下的毫秒数
var restMSInDay = function restMSInDay() {
    var day = new Date().toLocaleDateString();
    var endTime = '23:59:59';
    //毫秒
    //let ttlTime=parseInt(new Date(`${day} ${endTime}`).getTime())-parseInt(new Date().getTime())
    var ttlTime = new Date(day + " " + endTime).getTime() - new Date().getTime();
    //console.log(ttlTime)
    return ttlTime;
};

var restSecondInDay = function restSecondInDay() {
    //console.log(leftMSInDay)
    return Math.round(parseInt(restMSInDay()) / 1000);
};

//解析GM返回的文件大小，返回数值和单位（GM返回Ki，Mi，Gi.没有单位，是Byte。除了Byte，其他都只保留1位小数，并且四舍五入。例如：1.75Ki=1.8Ki）
//1.8Ki，返回1.8和“ki”；900，返回900
//解析失败，或者单位是Gi，返回对应的错误
//{ rc: 0, msg: { sizeNum: '200', sizeUnit: 'Ki' } }
function parseGmFileSize(fileSize) {
    var p = /(\d{1,}(\.\d{1,})?)([KkMmGg]i)?/; //1.8Ki
    var parseResult = fileSize.match(p);
    if (null === parseResult) {
        return gmError.cantParseGmFileSize;
    }
    if (parseResult[0] !== fileSize) {
        return gmError.cantParseGmFileSize;
    }
    var fileSizeNum = parseFloat(parseResult[1]);
    if (isNaN(fileSizeNum)) {
        return gmError.cantParseGmFileSizeNum;
    }
    //单位是Gi，直接返回大小超限
    if ('Gi' === parseResult[3]) {
        //正则中的第二个子表达式只是用来把小数及之后的数字 放在一起做判断，而无需取出使用
        return gmError.exceedMaxSize;
    }
    return { rc: 0, msg: { sizeNum: parseResult[1], sizeUnit: parseResult[3] } };
}

//把GM返回的fileSize转换成Byte，以便比较
//{ rc: 0, msg: 204800 }
function convertImageFileSizeToByte(fileSizeNum, fileSizeUnit) {
    var imageFileSizeInByte, imageFileSizeNum; //最终以byte为单位的大小； GM得到的size的数值部分
    if (undefined === fileSizeUnit) {
        imageFileSizeInByte = parseInt(fileSizeNum);
        if (isNaN(imageFileSizeInByte)) {
            return gmError.cantParseGmFileSizeNum;
        }
        if (imageFileSizeInByte > 1024 || imageFileSizeInByte < 0) {
            return gmError.invalidFileSizeInByte;
        }
        return isNaN(imageFileSizeInByte) ? gmError.fileSizeEmpty : { rc: 0, msg: imageFileSizeInByte };
    }
    if ('Ki' === fileSizeUnit) {
        //console.log('k')
        imageFileSizeNum = parseFloat(fileSizeNum);
        return isNaN(imageFileSizeNum) ? gmError.cantParseGmFileSizeNum : { rc: 0, msg: parseInt(fileSizeNum * 1024) };
    }
    if ('Mi' === fileSizeUnit) {
        imageFileSizeNum = parseFloat(fileSizeNum);
        return isNaN(imageFileSizeNum) ? gmError.cantParseGmFileSizeNum : { rc: 0, msg: parseInt(fileSizeNum * 1024 * 1024) };
    }
    if ('Gi' === fileSizeUnit) {
        imageFileSizeNum = parseFloat(fileSizeNum);
        return isNaN(imageFileSizeNum) ? gmError.cantParseGmFileSizeNum : { rc: 0, msg: parseInt(fileSizeNum * 1024 * 1024 * 1024) };
    }

    return gmError.invalidSizeUnit;
}

function getPemFile(pemPath) {
    for (var i = 0, n = pemPath.length; i < n; i++) {
        if (true === fileExist(pemPath[i])) {
            //console.log(pemPath[i])
            return pemPath[i];

            //break
        }
    }
    return;
}

//获得当前用户的信息，以便在toolbar上显示对应的信息
var getUserInfo = function getUserInfo(req) {
    return req.session.userName;
    /*    var result
     if(req.session.state===userStateEnum.login){
     result=req.session.userName
     //result.userId=req.session.userId
     }
     //console.log(result)
     return result*/
};

//返回enum 状态（noSess/notLogin/Login）
var checkUserState = function checkUserState(req) {
    //如果是非GET的req，返回noSess说明是黑客攻击
    if (undefined === req.session) {
        return userStateEnum.noSess;
    }
    //已经在get方法中获得sess
    if (undefined === req.session.userName) {
        return userStateEnum.notLogin;
    }

    return userStateEnum.login;
    //需要检测状态,如果不是1或者2,就没有session,后续的代码也就不必执行
    /*    if(userStateEnum.notLogin!=req.session.state && userStateEnum.login!=req.session.state){
     return miscError.user.notLogin
     }
     return rightResult*/
};

// 检查
// 1. 用户是否通过get获得页面(req.session.state=1 or 2)
// 2. 根据user是否已经登陆，决定是否检查用户session中的用户id是否正确
// 3. 检查interval
// forceCheckUserLogin:true：强制检查用户已经登录； false：不检查用户是否已经登录
var preCheck = function preCheck(req, forceCheckUserLogin) {
    var result = checkUserStateNormal(req);
    if (result.rc > 0) {
        return result;
    }

    if (true === forceCheckUserLogin) {
        if (userStateEnum.login !== req.session.state) {
            return miscError.user.notLogin;
        }
    }

    if (1 === req.session.state) {
        result = regex.objectId.test(req.session.userId);
        if (result.rc > 0) {
            return miscError.user.userIdFormatWrong;
        }
    }
    return checkInterval(req);
};

var encodeHtml = function encodeHtml(s) {
    if (undefined === s) {
        return "";
    }
    if ('string' != typeof s) {
        s = s.toString();
    };
    if (0 === s.length) {
        return "";
    };
    var returnHtml = '';

    return s.replace(regex.encodeHtmlChar, function (char) {
        var c = char.charCodeAt(0),
            r = '&#';
        c = 32 === c ? 160 : c;
        return r + c + ';';
    });
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

var populateSingleDoc = function populateSingleDoc(singleDoc, populateOpt, populatedFields) {
    return new Promise(function (resolve, reject) {
        var populateFlag = false;
        // let createdResult=singleDoc
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = populatedFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var singlePopulatedField = _step.value;

                if (singleDoc[singlePopulatedField]) {
                    populateFlag = true;
                    break;
                }
            }
            // console.log(`department insert result is ${JSON.stringify(result)}`)
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        if (populateFlag) {
            singleDoc.populate(populateOpt, function (populateErr, populateResult) {
                //console.log('create populate')
                if (populateErr) {
                    //console.log(`department create fail: ${JSON.stringify(populateErr)}`)
                    resolve(mongooseErrorHandler(populateErr));
                }
                resolve({ rc: 0, msg: populateResult });
            });
        } else {
            resolve({ rc: 0, msg: singleDoc });
        }
    });
};

//将server返回的rc格式化成client能接受的格式
//server可能是{rc:xxxx,msg:{client:'yyy',server:'zzz'}======>client  {rc:xxx,msg:yyy}
var formatRc = function formatRc(rc) {
    var clientFlag = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    // console.log(`original rc is ${JSON.stringify(rc)}`)
    if (rc.msg && (rc.msg.client || rc.msg.server)) {
        var result = {};
        result['rc'] = rc['rc'];
        if (clientFlag) {
            result['msg'] = rc.msg.client;
        } else {
            result['msg'] = rc.msg.server;
        }
        return result;
    }
    //其他格式的rc（正确结果，或者已经是{rc:xxx,msg:'yyy'}），直接返回
    return rc;
    /*    //已经是{rc:xxx,msg:'yyy'}的格式，直接返回输入值
     if(rc.msg && undefined===rc.msg.client &&  undefined===rc.msg.server){
     return rc
     }
       return miscError.validate.rcFormatWrong*/
};

//1. 搜索字符串中的+转换成空格
//2. 截取规定的字符数量
var convertURLSearchString = function convertURLSearchString(searchString, cb) {
    var tmpStr = searchString.split('+');
    //console.log(tmpStr)
    CRUDGlobalSetting.getSingleSetting('search', 'totalKeyLen', function (err, totalLen) {
        if (0 < totalLen.rc) {
            return cb(null, totalLen);
        }
        var strNum = tmpStr.length;
        var curStrLen = 0; //计算当前处理的字符长度
        var curStr = ''; //转换后的搜索字符串（使用空格分隔）
        for (var i = 0; i < strNum; i++) {
            //第一个key就超长，直接截取20个字符
            if (0 === i && tmpStr[0].length > totalLen) {
                curStr = tmpStr[0].substring(0, totalLen);
                return cb(null, { rc: 0, msg: curStr.trim() });
            }
            //如果当前已经处理的字符串+下一个要处理的字符串的长度超出，返回当前已经处理的字符串，舍弃之后的字符串
            //-i:忽略空格的长度
            if (curStr.length + tmpStr[i].length - i > totalLen) {
                return cb(null, { rc: 0, msg: curStr.trim() });
            }
            curStr += tmpStr[i];
            curStr += ' ';
        }
        return cb(null, { rc: 0, msg: curStr.trim() });
    });
};
module.exports = {
    checkInterval: checkInterval,
    generateRandomString: generateRandomString,
    restMSInDay: restMSInDay,
    restSecondInDay: restSecondInDay,

    parseGmFileSize: parseGmFileSize,
    convertImageFileSizeToByte: convertImageFileSizeToByte,
    getPemFile: getPemFile,

    getUserInfo: getUserInfo,
    checkUserState: checkUserState,
    preCheck: preCheck,

    encodeHtml: encodeHtml,

    populateSingleDoc: populateSingleDoc,
    formatRc: formatRc,

    convertURLSearchString: convertURLSearchString
};

//# sourceMappingURL=misc-compiled.js.map