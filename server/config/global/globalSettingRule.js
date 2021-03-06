/**
 * Created by wzhan039 on 2016-02-09.
 * 改成和input一样的格式，以便处理
 * 因为本质上这些都是input（可以从页面上进行设置）
 *
 * 设置不再写入redis（因为设置一般不会更改，并且require之后就放入内存，读取速度快）
 *
 */

//var dataType=require('./../../assist/enum_define/inputValidEnumDefine').enum.dataType
/*
* 不能把object的value当成另外一个object的key（ruleType.require:value是不允许的）
* */
//var ruleType=require('../../define/enum/validEnum').enum.ruleType
var dataType=require('../../define/enum/validEnum').dataType
var regex=require('../../define/regex/regex').regex

//maxAge:ms;  负数（-1）：临时cookie，关闭网页就删除cookie；0：立刻删除；正整数：多少毫秒后失效
 // secure:false, cookie是否只能在https上传输。false，可在http上传
 //path: URL必须符合才能使用cookie。例如，如果设置path为/test/,则URL必须为/test才能使用。设为/，所有URL均可使用。
 //domain：域名，必须以.作为开头（或者直接就是IP？？），则所有以此设置为结尾的URL都可使用cookie。domian_path限定了访问cookie的路径

var generalCookieSetting={
    path:'/', //域名下所有URL都可以使用session
    domain:'127.0.0.1', //可以使用session的域名（可以是IP)
    //maxAge:900000, // 整数，ms。默认15分钟
    secure:false, //只用https
    httpOnly:true, //通过http传递cookie
}


/*
* session相关设置，包含cookie和session2部分
* 直接读取文件，而不用存入redis
* */
var session={
    cookie:Object.assign({maxAge:900000},generalCookieSetting),//ms, 900second
    session:{
        secret:'suibian', //进行加密的字符
        resave:false, //即使session内容没有更改，都强制保存session内容到server。设为true，可能会导致竞争（用户开了2个窗口的话）
        rolling:false,//每次请求，都重置session的cookie选项（主要是expiration重设为maxAge）
        saveUninitialized:false //强制保存新生成，但是尚未做过修改（即没有任何内容）的session保存到session store。设为false，可以减少对session store的占用。
    },
    storeOptions:{
        redis:{
            ttl:900,// second,和cookie时间一致
            db:0,//redis的db index
            prefix:'sess',//默认记录前缀，默认是'sess'
            
        },
    }
}

var mongoSetting={
    schemaOptions:{
        //true，使用mongoose内定的validate方法；false，使用自定义的validate方法。true: 自动验证并保存；false:可以采用自定义验证，并且可以保存不合格数据（即需要自己做数据验证来决定是否可以保存；不做自定义验证的话，任何数据都可以保存了）
        //默认使用false，永远通过代码调用validate方法来验证
        validateBeforeSaveFlag:false,
        //是否根据validateRule设置mongo 内建的validitor（如果false，既没有设置validator，如此保存是就不会进行验证了）
        validateFlag:true,
    },

}

var searchSetting={
    maxKeyNum:5, //对某个字段，最大选取5个字段，作为select的条件
}
//内部设定，无法更改
var internalSetting={
    /*      cookie-session      login refer（refer是本server地址，则跳转到refer）*/
    reqProtocol:'http',
    reqHostname:'127.0.0.1',
    reqPort:3002,//默认是80
    /*                         文档状态                         */
    state:['正在编辑','编辑完成'],
    /*                          默认文件夹                          */
    defaultRootFolderName:['我的文件夹','垃圾箱'],
/*   /!*                      interval                            *!/
    sameRequestInterval:1000,//两次get/post之间的间隔ms
    differentRequestInterval:500,//get/post之间的间隔ms*/
    /*                      pagination                          */
    validPaginationString:['last','first'],//可用的页码字符（一般是数字，但有时可以是字符）

    pemPath:['g:/ss_express/ss-express/other/key/key.pem','h:/ss_express/ss-express/other/key/key.pem'],

    /*          global setting 保存位置*/
    globalSettingBackupPath:'h:/ss_express/ss-express/setting.txt',
    globalSettingBackupSize:10*1024,//byte

}
var searchMaxPage={
    readName:10,
}
/*//设置每次读取的记录数量===》用paginationSetting的pageSize代替
var pageSetting={
    department:{
        limit:10,//每次最多读取10条记录
    },
    employee:{
        limit:10,//每次最多读取10条记录
    },
    billType:{
        limit:10,//每次最多读取10条记录
    },
    bill:{
        limit:10,//每次最多读取10条记录
    },
}*/

var paginationSetting={
    user:{
        pageSize:6,//每页最多读取的记录数
        pageLength:10, //pagination最大显示的页码数量
    },
    department:{
        pageSize:6,//每页最多读取的记录数
        pageLength:10, //pagination最大显示的页码数量
    },
    employee:{
        pageSize:6,//每页最多读取的记录数
        pageLength:10, //pagination最大显示的页码数量
    },
    billType:{
        pageSize:6,//每页最多读取的记录数
        pageLength:10, //pagination最大显示的页码数量
    },
    bill:{
        pageSize:6,//每页最多读取的记录数
        pageLength:10, //pagination最大显示的页码数量
    },
}

//当使用suggest功能为用户提供可选项时，最大提供多少
var suggestLimit={
    department:{
        maxOptionNum:5,//每次最多提供可选项数目
    },
    employee:{
        maxOptionNum:20,//每次最多提供可选项数目
    },
    billType:{
        maxOptionNum:10,//每次最多提供可选项数目
    },
    bill:{
        maxOptionNum:5,//每次最多提供可选项数目
    },
}
//可以更改的设定
//type:int 如果有max属性，说明可以修改（只要小于max）;否则不能修改
// path:folder;
// file
//和普通的input略有不同，必需加上default作为初始设置，其它一致，以便重复使用inputCheck函数
var defaultSetting= {
    //defaultRedirectURL:'http://127.0.0.1:3000/',
    inner_image: {
        //ueditor上传文件的路径。可以是目录或者软连接，但是必须放在project目录下，以便node读取
        uploadPath: {
            default: 'h:/ss_express/ss-express/',
            chineseName:'图片上传目录',
            type: dataType.folder,
            require:{define:true,error:{rc:60000}},
            maxLength: {define:1024,error:{rc:60002}},
        },
        maxWidth: {
            default:750,
            chineseName:"上传图片最大宽度",
            type:dataType.int,
            unit:'px',
            require:{define:true,error:{rc:60004}},
            max:{define:750,error:{rc:60006}},
            min:{define:50,error:{rc:60007}}
        },//px。从tmall获得，使用Gm转换成对应的格式
        maxHeight:{
            default: 600,
            chineseName:"上传图片最大高度",
            type:dataType.int,
            require:{define:true,error:{rc:60008}},
            max:{define:600,error:{rc:60010}},
            min:{define:80,error:{rc:60011}}
        },//px。无所谓
        maxSize: {
            default: 900,
            chineseName:"上传图片最大尺寸",
            type:dataType.int,
            require:{define:true,error:{rc:60012}},
            min:{define:600,error:{rc:60013}},
            max:{define:900,error:{rc:60014}}, //Ki(如果大于1M，gm返回的是1.1Mi）
            //client: {rc: 60001, msg: '图片大小不能超过900KB'}
        },
        maxNum: {
            default: 5,
            chineseName:"最多上传图片数量",
            type:dataType.int,
            require:{define:true,error:{rc:60016}},
            max:{define:5,error:{rc:60018}},
            min:{define:1,error:{rc:60019}},
            //client: {rc: 60002, msg: '最多插入5张图片'}
        }//最多插入图片数量
    },
    userIcon: {
        fileName: {
            default:'H:/gj/resource/defaultUserIcon/b10e366431927231a487f08d9d1aae67f1ec18b4.png',
            chineseName:'头像文件名',
            type:dataType.file,
            require:{define:true,error:{rc:60020}},
            //maxLength:{define:45,error:{rc:60022}},
            format:{define:regex.hashImageName,error:{rc:60022}},
        },
        uploadDir:{
            default: 'H:/ss_express/ss-express/user_icon/',
            chineseName:'头像保存绝对目录',
            type:dataType.folder,
            require:{define:true,error:{rc:60024}},
            maxLength:{define:1024,error:{rc:60026}},

        },
/*        uploadDir: {
            default:  'user_icon/',
            chineseName:'头像保存目录',
            type:dataType.folder,
            require:{define:true,error:{rc:60024}},
            maxLength:{define:1024,error:{rc:60026}},
            //client: {
            //    type:{rc: 60010, msg: '头像上传失败，请联系管理员'},
            //    maxLength:{rc: 60010, msg:'头像存储路径最多包含1024个字符'}
            //}
        },*/
        //只需要顶一个GM读取文件的大小，MultiParty的大小从这个值转换（通过generalFunction.parseGmFileSize和generalFunction.convertImageFileSizeToByte
        userIconMaxSizeGm: {
            default: 200,//Ki
            chineseName: '头像文件最大尺寸',
            type: dataType.int,
            require:{define:true,error:{rc:60028}},
            min: {define: 100, error: {rc: 60029}},
            max: {define: 200, error: {rc: 60030}},
        },
            //client: {rc: 60011, msg: '上传文件超过限制，无法保存'}},//无单位（byte）/Ki/Mi（最多一位小数，因为gm读取的size就是如此）
        userIconWidth: {
            default: 95,
            type:dataType.int,
            chineseName:'头像文件最大宽度',
            require:{define:true,error:{rc:60031}},
            max:{define:104,error:{rc:60032}},
            min:{define:80,error:{rc:60033}},
        },//px
        userIconHeight: {
            default: 95,
            type:dataType.int,
            chineseName:'头像文件最大高度',
            require:{define:true,error:{rc:60033}},
            max:{define:104,error:{rc:60034}},
            min:{define:80,error:{rc:60035}},
        }//px
    },
    article: {
        articleAuthorNum: {
            default: 20,
            type: dataType.int,
            chineseName: '最多保存打开文档数',
            require:{define:true,error:{rc:60035}},
            max: {define: 20, error: {rc: 60036}},
            min: {define: 5, error: {rc: 60037}},
        },//在session中记录用户打开的文档:作者 size，最大20.因为用户打开文档可以记录，但是关闭文档无法得知，所以如果打开太多文档，只能删除最长不使用文档
        maxKeyNum: {
            default: 5,
            type: dataType.int,
            chineseName:'文档最多关键字数量',
            require:{define:true,error:{rc:60037}},
            min:{define:1,error:{rc:60038}},
            max:{define:5,error:{rc:60040}},
            //client: {rc: 60020, msg: '最多加入5个关键字'}},//每篇文档最大关键字数量
        },
        commentPageSize: {
            default:5,
            type:dataType.int,
            chineseName:'每页最多显示评论数',
            require:{define:true,error:{rc:60040}},
            min:{define:1,error:{rc:60041}},
            max:{define:5,error:{rc:60042}},
        },//每页显示评论的数量
        commentPageLength: {
            default:10,
            type:dataType.int,
            chineseName:'每页最多显示评论数',
            require:{define:true,error:{rc:60042}},
            min:{define:2,error:{rc:60043}},
            max:{define:10,error:{rc:60044}},
        }//最多显示页数量
        //
    },
    articleFolder: {
        pageSize: {
            default:3,
            type:dataType.int,
            chineseName:'每页最多显示文档数',
            require:{define:true,error:{rc:60044}},
            min:{define:2,error:{rc:60045}},
            max:{define:10,error:{rc:60046}},
        },//在personalArticle中，每页显示的文档数
        pageLength: {
            default:5,
            type:dataType.int,
            chineseName:'分页最多显示页数',
            require:{define:true,error:{rc:60046}},
            min:{define:2,error:{rc:60047}},
            max:{define:10,error:{rc:60048}},
        }//在personalArticle中，总共显示的页数
    },
    search: {
        /*                      search                              */
        maxKeyNum: {
            default: 5,
            type:dataType.int,
            chineseName:'搜索能处理的最大关键字数',
            require:{define:true,error:{rc:60049}},
            min:{define:1,error:{rc:60050}},
            max:{define:5,error:{rc:60051}},
            //client: {rc: 60040, msg: '最多加入5个搜索关键字'}
        },       //搜索的时候，最多处理5个关键字
        totalKeyLen: {
            default: 20,
            type:dataType.int,
            chineseName:'搜索字符串最大长度',
            require:{define:true,error:{rc:60049}},
            min:{define:1,error:{rc:60050}},
            max:{define:20,error:{rc:60051}},
            //client: {rc: 60041, msg: '搜索关键字长度最多20个字符'}
        },   //搜索的时候，所有key长度不能超过20
        maxSearchResultNum: {
            default: 100,
            type:dataType.int,
            chineseName:'最多显示搜索结果数',
            require:{define:true,error:{rc:60052}},
            min:{define:50,error:{rc:60053}},
            max:{define:100,error:{rc:60054}},
            //client: {rc: 60042, msg: '最多显示100条搜索记录'}
        },//最多检索多少记录
        searchResultPageSize: {
            default:1,
            type:dataType.int,
            chineseName:'每页最多显示搜索结果数',
            require:{define:true,error:{rc:60056}},
            min:{define:1,error:{rc:60057}},
            max:{define:10,error:{rc:60058}},
        },    //搜索结果页，每页显示10个记录
        searchResultPageLength: {
            default:10,
            type:dataType.int,
            chineseName:'搜索结果显示的最大页数',
            require:{define:true,error:{rc:60060}},
            min:{define:1,error:{rc:60061}},
            max:{define:10,error:{rc:60062}},
        },  //每次搜索，最多显示10页
        showContentLength: {
            default: 100,
            type:dataType.int,
            chineseName:'搜索出的文档最多显示的字数',
            require:{define:true,error:{rc:60065}},
            min:{define:50,error:{rc:60066}},
            max:{define:100,error:{rc:60067}},
            //client: {rc: 60043, msg: '摘要超度最多100个字符'}
        }       //在搜索结果中，文档内容最多显示多少个字符
    },
    main: {
        latestArticleNum: {
            default:5,
            type:dataType.int,
            chineseName:'首页显示最大文档数',
            require:{define:true,error:{rc:60070}},
            min:{define:2,error:{rc:60071}},
            max:{define:10,error:{rc:60072}},
            //client: {rc: 60050, msg: '首页最多显示5篇文档'}
        },//主页上显示的文档数量
        truncatePureContent: {
            default:200,
            type:dataType.int,
            chineseName:'首页文档最大字符数',
            require:{define:true,error:{rc:60075}},
            min:{define:150,error:{rc:60076}},
            max:{define:250,error:{rc:60077}},
            //client: {rc: 60052, msg: '首页文档最多显示200个字符'}
        }//在主页上显示的文档内容长度
    },
    miscellaneous: {
        captchaExpire: {
            default:60,
            type:dataType.int,
            chineseName:'captcha最大保存时间',
            unit:'秒',
            require:{define:true,error:{rc:60080}},
            min:{define:30,error:{rc:60081}},
            max:{define:60,error:{rc:60082}},
        }//captcha超时删除(redis ttl 秒）

    },
    //ueUploadPath:'d:/',//ueditor上传文件的路径
    //captchaImg_path:['g:/ss_express/ss-express/captcha_Img','h:/ss_express/ss-express/captcha_Img'],

    attachment: {
        maxSize: {
            default: 5 * 1024 * 1024,
            type:dataType.int,
            chineseName:'最大附件数',
            require:{define:true,error:{rc:60090}},
            min:{define:0,error:{rc:60091}},
            max:{define:5 * 1024 * 1024,error:{rc:60092}},
            //client: {rc: 60070, msg: '文件最大为5M'}
        },
        validSuffix: {
            default: {
                octer:{so:1, dll:1, bin:1, exe:1},
                ps: {psd:1},
                pdf: {pdf:1},
                text: {csv:1, txt:1, log:1, xml:1, html:1, css:1, js:1, json:1},
                msdoc: {doc:1, docx:1},
                msexcel: {xls:1, xlsx:1},
                msppt: {ppt:1, pptx:1},
                msoutlook: {msg:1},
                compress: {tar:1, tgz:1, gz:1, zip:1, rar:1, '7z':1},
                image: {jpg:1, jpeg:1, png:1, gif:1, bmp:1},
                video: {avi:1, rm:1, wav:1, swf:1, mpeg:1, moive:1, mp4:1, rmvb:1}
            },
            type:dataType.object,
            chineseName:'附件类型',
            require:{define:true,error:{rc:60100}},
            //client: {rc: 60071, msg: '文件类型不支持'}
        },
        validImageSuffix: {
            default: {'jpg':1, 'jpeg':1, 'png':1, 'gif':1, 'bmp':1},
            type:dataType.object,
            chineseName:'上传图片类型',
            require:{define:true,error:{rc:60110}},
            //client: {rc: 60072, msg: '只支持jpg/jpeg/gif/png格式的图片'}
        },
        maxAvaliableSpace: {
            default: 50 * 1024 * 1024,
            type:dataType.int,
            chineseName:'最多上传附件容量',
            unit:'Byte',
            require:{define:true,error:{rc:60120}},
            min:{define:0,error:{rc:60121}},
            max:{define:50* 1024 * 1024,error:{rc:60122}},
            //client: {rc: 60073, msg: '最多上传50M附件'}
        },//this is server side only
        maxUploadNum: {
            default: 5,
            type:dataType.int,
            chineseName:'最多上传附件数量',
            require:{define:true,error:{rc:60130}},
            min:{define:1,error:{rc:60132}},
            max:{define:5,error:{rc:60134}},
            //client: {rc: 60074, msg: "每次最多上传5个文件"}
        },
        maxTotalNum: {
            default: 5,
            type:dataType.int,
            chineseName:'最每篇文档最多上传附件数量',
            require:{define:true,error:{rc:60140}},
            min:{define:1,error:{rc:60142}},
            max:{define:5,error:{rc:60144}},
            //client: {rc: 60075, msg: "每个文档最多带有5个附件"}
        },
        //saveIntoDbFail:{define:'',client:{rc:419,client:'数据验证失败，无法保存到数据库'}},
        saveDir: {
            default: 'D:/',
            type:dataType.folder,
            chineseName:'保存附件的文件夹',
            require:{define:true,error:{rc:60150}},
            maxLength:{define:1024,error:{rc:60152}},
            //client: {
            //    type:{rc: 60076, msg: '文件夹不存在，无法保存上传文件'},
            //    maxLength:{rc: 60076, msg: '文件夹最多包含1024个字符'}
            //}
        },//disk path where to save file
/*        saveDirLength: {
            define: 1024,
            type:'path',
            maxLength:1024,
            //client: {rc: 60078, msg: '绝对路径的长度不能超过1024个字符'}
        },//disk path where to save file*/
        fileNameLength: {
            default: 100,
            type:dataType.int,
            chineseName:'附件名的长度',
            require:{define:true,error:{rc:60160}},
            min:{define:5,error:{rc:60161}},// x.png
            max:{define:1024,error:{rc:60162}},
/*            type:'file',
            maxLength:100,
            client: {rc: 60079, msg: "文件名最多包含100个字符"}*/
        }//考虑兼容windows的长度限制（路径+文件名<255），以便下载文件
    },

    adminLogin:{
        maxFailTimes:{
            default:5,
            type:dataType.int,
            chineseName:'每天最大尝试登录次数',
            require:{define:true,error:{rc:60170}},
            min:{define:3,error:{rc:60171}},
            max:{define:10,error:{rc:60172}},
            //client:{rc:60080,msg:`每天最多尝试${this.max}次`}
        },
        existTTL:{
            default:300,
            type:dataType.int,
            chineseName:'管理员登录保持最长时间',
            unit:'秒',
            require:{define:true,error:{rc:60180}},
            min:{define:120,error:{rc:60181}},
            max:{define:600,error:{rc:60182}},
            //client:{rc:60082,msg:'最长登录时间保持10分钟'}
        },
        namePasswordTTL:{
            default:300,
            type:dataType.int,
            chineseName:'管理员用户名密码最大保存时间',
            unit:'秒',
            require:{define:true,error:{rc:60190}},
            min:{define:120,error:{rc:60191}},
            max:{define:600,error:{rc:60192}},
            //client:{rc:60084,msg:'用户名密码最长保持10分钟'}
        },
    },
    //检查用户请求频率和间隔()
    intervalCheck:{
        expireTimeBetween2Req:{
            default:500,//ms
            chineseName:'两次请求间隔时间',
            type:dataType.int,
            unit:'毫秒',
            require:{define:true,error:{rc:60200}},
            min:{define:200,error:{rc:60201}},
            max:{define:1000,error:{rc:60202}},
        },
//        不在需要，防止设置不正确，小于duration。直接在脚本中设成duration的整数倍3
/*        expireTimeOfReqList:{
            default:600,//second
            chineseName:'所有请求列表',
            type:dataType.int,
            unit:'秒',
            require:{define:true,error:{rc:60305}},
            min:{define:300,error:{rc:60306}},
            max:{d可以efine:600,error:{rc:63207}},
        },*/
        expireTimeOfRejectTimes:{
            default:600,//second//必需大于等于rejectFlag的最大时间（Lua {30,60,120,240,600}
            chineseName:'拒绝次数最长保存请求时间',
            type:dataType.int,
            unit:'秒',
            require:{define:true,error:{rc:60305}},
            min:{define:600,error:{rc:60306}},
            max:{define:3600,error:{rc:63207}},
        },
        timesInDuration:{
            default:5,
            chineseName:'时间段内最大请求次数',
            type:dataType.int,
            //unit:'ms',
            require:{define:true,error:{rc:60205}},
            min:{define:5,error:{rc:60206}},
            max:{define:30,error:{rc:60207}},
        },
        //检查最大请求次数的时间段
        duration:{
            default:60,//second
            chineseName:'时间段',
            type:dataType.int,
            unit:'秒',
            require:{define:true,error:{rc:60300}},
            min:{define:20,error:{rc:60301}},
            max:{define:60,error:{rc:60302}},
        },
        rejectTimesThreshold:{
            default:5,
            chineseName:'拒绝次数门限值',
            type:dataType.int,
            unit:'次',
            require:{define:true,error:{rc:60300}},
            min:{define:5,error:{rc:60301}},
            max:{define:30,error:{rc:60302}},
        }

    },
    Lua:{
        scriptPath:{
            default:'H:/gj/server/model/redis/Lua/',
            chineseName:'Lua目录',
            type:dataType.folder,
            require:{define:true,error:{rc:60400}},
        }
    }
}

module.exports={
	defaultSetting,
	mongoSetting,
    searchSetting,
	internalSetting,
	session,
    // pageSetting,
    paginationSetting,
    suggestLimit,
    searchMaxPage,//search时，最大的页码
}

