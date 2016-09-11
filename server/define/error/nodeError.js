/**
 * Created by zw on 2016/7/3.
 */
    'use strict'
var assistError={
    awesomeCaptcha:{
/*        readDir:{rc:68000,msg:{client:'无法读取captcha目录'}},
        removeFile:{rc:68002,msg:{client:'无法删除过期的captcha文件'}},*/
/*        notExist:{rc:68004,msg:{client:'验证码不存在',server:'验证码不存在'}},
        notEqual:{rc:68006,msg:{client:'验证码不正确',server:'验证码不正确'}},*/
        genCaptchaDataUrlFail:{rc:68008,msg:{client:'验证码生成失败',server:'验证码无法转换成DataURL'}},
    },
    gmImage:{
        cantParseGmFileSize:{rc:69900,msg:{client:'无法读取图片文件的大小',server:'无法解析GM处理的图片文件的数值和单位'}},
        cantParseGmFileSizeNum:{rc:69902,msg:{client:'无法读取图片文件的大小',server:'无法解析GM处理的图片文件的数值'}},
        exceedMaxSize:{rc:69904,msg:{client:'图片文件过大',server:'图片文件的大小超出预定义的范围'}},
        invalidSizeUnit:{rc:69906,msg:{client:'图片文件大小的单位不正确',server:'图片文件大小的单位必须是Ki/Mi/Gi'}},
        fileSizeEmpty:{rc:69908,msg:{client:'图片的大小为空',server:'图片的大小为空'}},
        invalidFileSizeInByte:{rc:69909,msg:{client:'无法读取图片文件的大小',server:'图片文件的大小转换成byte后，不正确'}}
    },
    crypt:{
        genSaltFail:{rc:69500,msg:{client:'生成随机数失败',server:'调用crupt.randomBytes命令失败'}}
    },
    misc:{
        validate:{

            unknownDataType:{rc:69800,msg:{client:'数据类型未定义',server:''}},

            mandatoryFiledNotExist:{rc:69802,msg:{client:'字段必需存在',server:''}},
            chineseNameNotString:{rc:68804,msg:{client:'chineseName字段必须是字符串',server:''}},
            chineseNameEmpty:{rc:68806,msg:{client:'chineseName字段不能为空',server:''}},

            /*        noRelatedItemDefine:{rc:69802,msg:{client:'关联检测项不存在或者没有定义"},
             relatedItemDefineNotDefine:{rc:69803,msg:{client:'检测项的define没有定义"},*/
            /*        noType:{rc:69804,msg:{client:'没有定义输入数据的类型'}},
             noChineseName:{rc:69805,msg:{client:'没有中文名'}},
             noRule:{rc:69807,msg:{client:'没有任何检测Rule'}},*/

            typeWrong:{rc:69808,msg:{client:'类型不正确',server:''}},

            needMin:{rc:69810,msg:{client:'type为int时，必需包含Min属性',server:''}},
            needMax:{rc:69812,msg:{client:'type为int时，必需包含Max属性',server:''}},
            needMaxLength:{rc:69814,msg:{client:'type为number时，必需包含maxLength属性',server:''}},

            ruleDefineNotRight:{rc:69816,msg:{client:'rule的定义不正确',server:''}},
            maxLengthDefineNotInt:{rc:69818,msg:{client:'maxLength的定义不是整数',server:''}},
            minLengthDefineNotInt:{rc:69820,msg:{client:'minLength的定义不是整数',server:''}},
            exactLengthDefineNotInt:{rc:69822,msg:{client:'min的定义不是整数',server:''}},
            maxDefineNotInt:{rc:69824,msg:{client:'max的定义不是整数',server:''}},
            minDefineNotInt:{rc:69826,msg:{client:'min的定义不是整数',server:''}},
            requireDefineNotBoolean:{rc:69828,msg:{client:'require的定义不是布尔值',server:''}},

            ruleDefineNotDefine:{rc:69830,msg:{client:'define字段没有定义',server:''}},
            errorFieldNotDefine:{rc:69832,msg:{client:'error字段不存在',server:''}},
            rcFieldNotDefine:{rc:698234,msg:{client:'rc字段不存在',server:''}},
            msgFieldNotDefine:{rc:69836,msg:{client:'msg字段不存在',server:''}},

            /*              checkInput              */
            valueNotDefine:{rc:69838,msg:{client:'待检测的输入值未定义',server:''}},
            valueNotDefineWithRequireTrue:{rc:699839,msg:{client:'待检测的输入值未定义，而rule中require为ture',server:''}},
            valueEmpty:{rc:69840,msg:{client:'待检测的输入值不能为空',server:''}},
            valueRelatedRuleNotDefine:{rc:68842,msg:{client:'带检测的输入值没有对应的检测规则',server:''}},
            //rule chekc fail
            //rule的error（rc，msg）和具体rule定义有关（即定义在rule中，保证对于相同的rule（7个总共）每个input的check都有唯一的rc和msg）
            /*        maxLengthCheckFail:{rc:68844,msg:{client:'输入值长度超出最大定义的长度'}},
             minLengthCheckFail:{rc:68846,msg:{client:'输入值长度小于最小定义的长度'}},
             exactLengthCheckFail:{rc:68848,msg:{client:'输入值的长度不等于定义的长度'}},
             minCheckFail:{rc:68850,msg:{client:'输入值小于定义的最小值'}},
             maxCheckFail:{rc:68852,msg:{client:'输入值大于定义的最小值'}},
             formatCheckFail:{rc:68854,msg:{client:'输入值的格式不正确'}},
             equalToCheckFail:{rc:68856,msg:{client:'两个输入值不相等'}},*/
        },
        checkInterval:{
            forbiddenReq:{rc:69916,msg:{client:'请求被禁止',server:'请求被禁止'}},
            between2ReqCheckFail:{rc:69918,msg:{client:'请求过于频繁，请稍候再尝试',server:'两次请求间隔小于预订值'}},
            exceedMaxTimesInDuration:{rc:69920,msg:{client:'请求过于频繁，请稍候再尝试',server:'定义的时间段内，请求次数超出最大值'}},
            tooMuchReq:{rc:69922,msg:{client:'请求过于频繁，请稍候再尝试',server:'request过于频繁'}},
            unknownRequestIdentify:{rc:69924,msg:{client:'无法识别请求源头',server:'请求既无IP也无sessionId'}},
        },
        user:{
            stateWrong:{rc:69910,msg:{client:'您的状态不正确',server:'用户状态不正确'}},
            notLogin:{rc:69912,msg:{client:'您尚未登录',server:'用户尚未登录'}},
            userIdFormatWrong:{rc:69914,msg:{client:'你的登录信息不正确',server:'用户session中的Id格式不正确'}}
        },
        captcha:{
            /*        readDir:{rc:68000,msg:{client:'无法读取captcha目录'}},
             removeFile:{rc:68002,msg:{client:'无法删除过期的captcha文件'}},*/
            notExist:{rc:68004,msg:{client:'验证码不存在',server:'验证码不存在'}},
            notEqual:{rc:68006,msg:{client:'验证码不正确',server:'验证码不正确'}},
            //genCaptchaDataUrlFail:{rc:68008,msg:{client:'验证码生成失败',server:'验证码无法转换成DataURL'}},
        },
        deleteNonNeededObject:{
            origObjTypeWrong:{rc:69000,msg:{client:'无法删除对象中的内容',server:'函数deleteNonNeeded中的参数origObj不是对象'}},
            skipListTypeWrong:{rc:69002,msg:{client:'无法删除对象中的内容',server:'函数deleteNonNeeded中的参数skipList不是对象'}},
        },
        objectIdToRealField:{
            origObjTypeWrong:{rc:69004,msg:{client:'无法匹配对象中的内容',server:'函数objectIdToRealField中的参数origObj不是对象'}},
            matchListTypeWrong:{rc:69006,msg:{client:'无法匹配对象中的内容',server:'函数objectIdToRealField中的参数matchList不是对象'}},
        }
    }
}

exports.nodeError={
    //miscError:misc,
    assistError
}
