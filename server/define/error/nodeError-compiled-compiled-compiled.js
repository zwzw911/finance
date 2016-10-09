/**
 * Created by zw on 2016/7/3.
 */
'use strict';

var assistError = {
    awesomeCaptcha: {
        /*        readDir:{rc:68000,msg:{client:'无法读取captcha目录'}},
                removeFile:{rc:68002,msg:{client:'无法删除过期的captcha文件'}},*/
        /*        notExist:{rc:68004,msg:{client:'验证码不存在',server:'验证码不存在'}},
                notEqual:{rc:68006,msg:{client:'验证码不正确',server:'验证码不正确'}},*/
        genCaptchaDataUrlFail: { rc: 68008, msg: { client: '验证码生成失败', server: '验证码无法转换成DataURL' } }
    },
    gmImage: {
        cantParseGmFileSize: { rc: 69900, msg: { client: '无法读取图片文件的大小', server: '无法解析GM处理的图片文件的数值和单位' } },
        cantParseGmFileSizeNum: { rc: 69902, msg: { client: '无法读取图片文件的大小', server: '无法解析GM处理的图片文件的数值' } },
        exceedMaxSize: { rc: 69904, msg: { client: '图片文件过大', server: '图片文件的大小超出预定义的范围' } },
        invalidSizeUnit: { rc: 69906, msg: { client: '图片文件大小的单位不正确', server: '图片文件大小的单位必须是Ki/Mi/Gi' } },
        fileSizeEmpty: { rc: 69908, msg: { client: '图片的大小为空', server: '图片的大小为空' } },
        invalidFileSizeInByte: { rc: 69909, msg: { client: '无法读取图片文件的大小', server: '图片文件的大小转换成byte后，不正确' } }
    },
    crypt: {
        genSaltFail: { rc: 69500, msg: { client: '生成随机数失败', server: '调用crpt.randomBytes命令失败' } }
    },
    misc: {
        validate: {
            //以下是检查rule，所以错误只需在server端现实，因此只要msg:'error'的格式，而不要client/server
            unknownDataType: { rc: 69800, msg: '数据类型未定义' },

            mandatoryFiledNotExist: { rc: 69802, msg: '字段必需存在' },
            chineseNameNotString: { rc: 68804, msg: 'chineseName字段必须是字符串' },
            chineseNameEmpty: { rc: 68806, msg: 'chineseName字段不能为空' },

            typeWrong: { rc: 69808, msg: '类型不正确' },

            needMin: { rc: 69810, msg: 'type为int时，必需包含Min属性' },
            needMax: { rc: 69812, msg: 'type为int时，必需包含Max属性' },
            needMaxLength: { rc: 69814, msg: 'type为number时，必需包含maxLength属性' },

            ruleDefineNotRight: { rc: 69816, msg: 'rule的定义不正确' },
            maxLengthDefineNotInt: { rc: 69818, msg: 'maxLength的定义不是整数' },
            minLengthDefineNotInt: { rc: 69820, msg: 'minLength的定义不是整数' },
            exactLengthDefineNotInt: { rc: 69822, msg: 'min的定义不是整数' },
            maxDefineNotInt: { rc: 69824, msg: 'max的定义不是整数' },
            minDefineNotInt: { rc: 69826, msg: 'min的定义不是整数' },
            requireDefineNotBoolean: { rc: 69828, msg: 'require的定义不是布尔值' },
            enumDefineNotArray: { rc: 69829, msg: 'enum的定义不是数组' },

            ruleDefineNotDefine: { rc: 69830, msg: 'define字段没有定义' },
            errorFieldNotDefine: { rc: 69832, msg: 'error字段不存在' },
            rcFieldNotDefine: { rc: 698234, msg: 'rc字段不存在' },
            msgFieldNotDefine: { rc: 69836, msg: 'msg字段不存在' },

            //以下只需返回给server，因此只要msg:'error'的格式，而不要client/server
            /*              sanity rule             */
            ruleDefineWrong: function ruleDefineWrong(coll, field, rule) {
                return { rc: 69840, msg: coll + '的字段' + field + '中的rule ' + rule + '的define值不正确' };
            },

            //以下只需返回给client，因此只要msg:'error'的格式，而不要client/server
            /*              checkInput              */
            valueNotDefine: { rc: 69860, msg: '待检测的输入值未定义' },
            valueNotDefineWithRequireTrue: { rc: 699862, msg: '待检测的输入值未定义，而rule中require为ture' },
            valueEmpty: { rc: 69864, msg: '待检测的输入值不能为空' },
            valueRelatedRuleNotDefine: { rc: 68868, msg: '带检测的输入值没有对应的检测规则' }
        },
        checkInterval: {
            sessionIdWrong: { rc: 69900, msg: { client: '请求格式不正确', server: 'session格式不正确' } },
            IPWrong: { rc: 69902, msg: { client: '请求格式不正确', server: 'IP格式不正确' } },
            unknownRequestIdentify: { rc: 69924, msg: { client: '无法识别请求id', server: '请求既无IP也无sessionId' } },
            forbiddenReq: { rc: 69916, msg: { client: '请求被禁止', server: '请求被禁止' } },
            between2ReqCheckFail: { rc: 69918, msg: { client: '请求过于频繁，请稍候再尝试', server: '两次请求间隔小于预订值' } },
            exceedMaxTimesInDuration: { rc: 69920, msg: { client: '请求过于频繁，请稍候再尝试', server: '定义的时间段内，请求次数超出最大值' } },
            tooMuchReq: { rc: 69922, msg: { client: '请求过于频繁，请稍候再尝试', server: 'request过于频繁' } }

        },
        user: {
            stateWrong: { rc: 69910, msg: { client: '您的状态不正确', server: '用户状态不正确' } },
            notLogin: { rc: 69912, msg: { client: '您尚未登录', server: '用户尚未登录' } },
            userIdFormatWrong: { rc: 69914, msg: { client: '你的登录信息不正确', server: '用户session中的Id格式不正确' } }
        },
        captcha: {
            /*        readDir:{rc:68000,msg:{client:'无法读取captcha目录'}},
             removeFile:{rc:68002,msg:{client:'无法删除过期的captcha文件'}},*/
            notExist: { rc: 68004, msg: { client: '验证码不存在', server: '验证码不存在' } },
            notEqual: { rc: 68006, msg: { client: '验证码不正确', server: '验证码不正确' } }
        },
        deleteNonNeededObject: {
            origObjTypeWrong: { rc: 69000, msg: { client: '无法删除对象中的内容', server: '函数deleteNonNeeded中的参数origObj不是对象' } },
            skipListTypeWrong: { rc: 69002, msg: { client: '无法删除对象中的内容', server: '函数deleteNonNeeded中的参数skipList不是对象' } }
        },
        objectIdToRealField: {
            origObjTypeWrong: { rc: 69004, msg: { client: '无法匹配对象中的内容', server: '函数objectIdToRealField中的参数origObj不是对象' } },
            matchListTypeWrong: { rc: 69006, msg: { client: '无法匹配对象中的内容', server: '函数objectIdToRealField中的参数matchList不是对象' } }
        }
    }
};

exports.nodeError = {
    //miscError:misc,
    assistError: assistError
};

//# sourceMappingURL=nodeError-compiled.js.map

//# sourceMappingURL=nodeError-compiled-compiled.js.map

//# sourceMappingURL=nodeError-compiled-compiled-compiled.js.map