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
        genCaptchaDataUrlFail:{rc:69000,msg:{client:'验证码生成失败',server:'验证码无法转换成DataURL'}},
    },
    crypt:{
        genSaltFail:{rc:69100,msg:{client:'生成随机数失败',server:'调用crpt.randomBytes命令失败'}}
    },
    gmImage:{
        cantParseGmFileSize:{rc:69600,msg:{client:'无法读取图片文件的大小',server:'无法解析GM处理的图片文件的数值和单位'}},
        cantParseGmFileSizeNum:{rc:69602,msg:{client:'无法读取图片文件的大小',server:'无法解析GM处理的图片文件的数值'}},
        exceedMaxSize:{rc:69604,msg:{client:'图片文件过大',server:'图片文件的大小超出预定义的范围'}},
        invalidSizeUnit:{rc:69606,msg:{client:'图片文件大小的单位不正确',server:'图片文件大小的单位必须是Ki/Mi/Gi'}},
        fileSizeEmpty:{rc:69608,msg:{client:'图片的大小为空',server:'图片的大小为空'}},
        invalidFileSizeInByte:{rc:69609,msg:{client:'无法读取图片文件的大小',server:'图片文件的大小转换成byte后，不正确'}}
    },

    misc:{
        checkInterval:{
            sessionIdWrong:{rc:69900,msg:{client:'请求格式不正确',server:'session格式不正确'}},
            IPWrong:{rc:69902,msg:{client:'请求格式不正确',server:'IP格式不正确'}},
            unknownRequestIdentify:{rc:69924,msg:{client:'无法识别请求id',server:'请求既无IP也无sessionId'}},
            forbiddenReq:{rc:69916,msg:{client:'请求被禁止',server:'请求被禁止'}},
            between2ReqCheckFail:{rc:69918,msg:{client:'请求过于频繁，请稍候再尝试',server:'两次请求间隔小于预订值'}},
            exceedMaxTimesInDuration:{rc:69920,msg:{client:'请求过于频繁，请稍候再尝试',server:'定义的时间段内，请求次数超出最大值'}},
            tooMuchReq:{rc:69922,msg:{client:'请求过于频繁，请稍候再尝试',server:'request过于频繁'}},

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
    },

}

exports.nodeError={
    //miscError:misc,
    assistError
}
