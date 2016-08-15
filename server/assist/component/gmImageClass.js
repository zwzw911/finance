/**
 * Created by zw on 2015/11/7.
 * basic function to manipulate image
 * 从对象改成类
 * 对象的优点：1次require，载入内存，速度快；缺点：更改了文件，需要重启app
 * 类：使用redis作为db，虽然每次实例化都要读取db（可能速度慢，redis是内存db，其实速度挺快），但是可以随时获得最新更改，而无需重启app
 */
var gm=require('gm')
var CRUDGlobalSetting=require('../misc').func.CRUDGlobalSetting
// var imageDefine=require('../assist/define_config/global_config').imageDefine
var imageDefine
/*CRUDGlobalSetting.getItemSetting('imageDefine').then(
    v=>{imageDefine=v.msg}
).catch(
    
)*/
var validateImage=['PNG','JPEG','IPG','GIF']
/*              错误定义            */
var imageErrorDefine={
    size:{rc:69600,msg:'读取图片长宽大小失败'},
    orientation:{rc:69602,msg:'读取图片方向失败'},
    format:{rc:69604,msg:'读取图片格式失败'},
    invalidateFormat:{rc:69605,msg:'图片格式不支持'},
    depth:{rc:69606,msg:'读取图片颜色深度失败'},
    color:{rc:69608,msg:'读取图片颜色数量失败'},
    res:{rc:69610,msg:'读取图片解析度失败'},
    fileSize:{rc:69612,msg:'读取图片大小失败'},
    identify:{rc:69614,msg:'读取图片信息失败'},
    /*                   方法                           */
    resize:{rc:69620,msg:"更改图片大小失败"}
}

class GmImage{
    static setting
/*    static async getSetting(){
        setting=await CRUDGlobalSetting.getItemSetting('imageDefine')
    }*/
/*    static async getSetting(){
        let result=CRUDGlobalSetting.getItemSetting('inner_image')
        return result
    }*/
    /*
    * 不确定是不是只需要执行一次即可
    * */
    static getSetting(){
        if(undefined===GmImage.setting){
            console.log('init setting')
            return CRUDGlobalSetting.getItemSetting('inner_image').then(v=>{GmImage.setting=v})
        }

    }
    static getterFunc(filePath,method){
        return new Promise(function(resolve,reject){
            gm(filePath)[method](function(err,result){
                if(err){
                    //console.log(err)
                    reject(imageErrorDefine[method])
                }else{
/*                    console.log('success')
                    console.log(result)*/
                    if("format"==method){
                        if(undefined===result || validateImage.indexOf(result)===-1){
                            reject(imageErrorDefine.invalidateFormat)
                        }
                    }

                    resolve({rc:0,msg:result})
                }

            })
        })
    }

    static getter={
         size(filePath){
            GmImage.getterFunc(filePath,'size')
        },
        orientationn(filePath){
            GmImage.getterFunc(filePath,'orientation')
        },
        format(filePath){
            GmImage.getterFunc(filePath,'format')
        },
        depth(filePath){
            GmImage.getterFunc(filePath,'depth')
        },
        color(filePath){
            GmImage.getterFunc(filePath,'color')
        },
        res(filePath){
            return GmImage.getterFunc(filePath,'res')
        },

//gm读取的fileSize，只保留一位小数，并且四舍五入（base 1024）。 1.75k=1.8Ki；1.44M=1.4Mi
//{ rc: 0, msg: '246.4Ki' }
        fileSize(filePath){
            GmImage.getterFunc(filePath,'filesize')
        },
        identify(filePath){
            GmImage.getterFunc(filePath,'identify')
        }
    }
    static command={
        resizeWidthOnly(inputFilePath,outputFilePath){
            //只对宽度做处理，并且如果宽度小于maxWidth，则不处理
            var maxWidth=imageDefine.normalImage.width;
            return new Promise(function(reslove,reject){
                gm(inputFilePath).resizeExact(maxWidth,'>').interlace('line').write(outputFilePath,function(err,result){
                    if(err){
                        reject(imageErrorDefine.resize)
                    }else{
                        resolve({rc:0})
                    }

                })
            })

        },
//处理普通图片，生成缩略图，固定width/height
//!，强制转换成指定的size
        resizeToThumbnail(inputFilePath,outputFilePath){
            //只对宽度做处理，并且如果宽度小于maxWidth，则不处理
            var exactWidth=imageDefine.thumbnail.width;
            var exactHeight=imageDefine.thumbnail.Height
            return new Promise(function(reslove,reject){
                gm(inputFilePath).resize(exactWidth,exactHeight,'!').interlace('line').write(outputFilePath,function(err,result){
                    if(err){
                        reject(imageErrorDefine.resize)
                    }else{
                        reslove({rc:0})
                    }
                    //return callback(null,)
                })
            })

        },
//处理头像，resize成正方形
        resizeUserIcon(inputFilePath,outputFilePath){
            //只对宽度做处理，并且如果宽度小于general.innerImageMaxWidth，则不处理
            var exactWidth=imageDefine.userIcon.width;
            var exactHeight=imageDefine.userIcon.Height
            return new Promise(function(reslove,reject){
                gm(inputFilePath).resize(exactWidth,exactHeight,'!').write(outputFilePath,function(err,result){
                    if(err){
                        reject(imageErrorDefine.resize)
                    }else{
                        reslove({rc:0})
                    }

                })
            })

        }
    }

    //其他的一些辅助函数
    static _helper={
        //解析GM返回的文件大小，返回数值和单位（GM返回Ki，Mi，Gi.没有单位，是Byte。除了Byte，其他都只保留1位小数，并且四舍五入。例如：1.75Ki=1.8Ki）
        //1.8Ki，返回1.8和“ki”；900，返回900
        //解析失败，或者单位是Gi，返回对应的错误
        //{ rc: 0, msg: { sizeNum: '200', sizeUnit: 'Ki' } }
         parseGmFileSize(fileSize){
            var p=/(\d{1,}\.?\d{1,})([KkMmGg]i)?/ //1.8Ki
            var parseResult=fileSize.match(p)
            if(parseResult[0]!==fileSize ){
                return runtimeNodeError.image.cantParseFileSize
            }
            var fileSizeNum=parseFloat(parseResult[1])
            if(isNaN(fileSizeNum)){
                return runtimeNodeError.image.cantParseFileSizeNum
            }
            //单位是Gi，直接返回大小超限
            if('Gi'===parseResult[2]){
                return runtimeNodeError.image.exceedMaxFileSize
            }
            return {rc:0,msg:{sizeNum:parseResult[1],sizeUnit:parseResult[2]}}
        },

        //把GM返回的fileSize转换成Byte，以便比较
        //{ rc: 0, msg: 204800 }
        convertImageFileSizeToByte(fileSizeNum,fileSizeUnit){
            var imageFileSizeInByte,imageFileSizeNum //最终以byte为单位的大小； GM得到的size的数值部分
            if(undefined===fileSizeUnit){
                imageFileSizeInByte=parseInt(fileSizeNum)
                return isNaN(imageFileSizeInByte) ? runtimeNodeError.image.cantParseFileSizeNum:{rc:0,msg:imageFileSizeInByte}
            }
            if('Ki'===fileSizeUnit){
//console.log('k')
                imageFileSizeNum =parseFloat(fileSizeNum)
                return isNaN(imageFileSizeNum) ? runtimeNodeError.image.cantParseFileSizeNum:{rc:0,msg:parseInt(fileSizeNum*1024)}
            }
            if('Mi'===fileSizeUnit){
                imageFileSizeNum=parseFloat(fileSizeNum)
                return isNaN(imageFileSizeNum) ? runtimeNodeError.image.cantParseFileSizeNum:{rc:0,msg:parseInt(fileSizeNum*1024*1024)}
            }
        }
    }
}
/*var test=async function(){
    await GmImage.getSetting()
    console.log(GmImage.setting)
    await GmImage.getSetting()
}

var test1=async function(){
    await GmImage.getSetting()
    let a= await GmImage.getter.res('H:/gj/resource/defaultUserIcon/b10e366431927231a487f08d9d1aae67f1ec18b4.png')
/!*    a.then((v)=>{console.log(v)})
    console.log(a)*!/
    //console.log(a)
    return a
}

var test2=async function(){
    return await test1()
    //return a
}*/
exports.image={
    GmImage,
/*    test,
    test1,
    test2,*/
}
/*var getterFunc=function(filePath,method,callback){
    gm(filePath)[method](function(err,result){
        if(err){
            return callback(err,imageErrorDefine[method])
        }
        return callback(null,{rc:0,msg:result})
    })
}
var size=function(filePath,callback){
    getterFunc(filePath,'size',function(err,result){
        //将getterFunc的结果原样传出
        return callback(err,result) //{ rc: 0, msg: { width: 104, height: 104 } }
    })
}
var orientation=function(filePath,callback){
    getterFunc(filePath,'orientation',function(err,result){
        return callback(err,result)
    })
}
var format=function(filePath,callback){
    getterFunc(filePath,'format',function(err,result){
        if(err){
            return callback(err,result)
        }
        if(undefined===result.msg || validateImage.indexOf(result.msg)===-1){
            return callback(null,imageErrorDefine.invalidateFormat)
        }
        //返回文件类型
        return callback(null,result)
    })
}
var depth=function(filePath,callback){
    getterFunc(filePath,'depth',function(err,result){
        return callback(err,result)
    })
}
var color=function(filePath,callback){
    getterFunc(filePath,'color',function(err,result){
        return callback(err,result)
    })
}
var res=function(filePath,callback){
    getterFunc(filePath,'res',function(err,result){
        return callback(err,result)
    })
}

//gm读取的fileSize，只保留一位小数，并且四舍五入（base 1024）。 1.75k=1.8Ki；1.44M=1.4Mi
//{ rc: 0, msg: '246.4Ki' }
var fileSize=function(filePath,callback){
    getterFunc(filePath,'filesize',function(err,result){
        return callback(err,result)
    })
}
var identify=function(filePath,callback){
    getterFunc(filePath,'identify',function(err,result){
        return callback(err,result)
    })
}

/!*              处理图片方法                  *!/
//处理普通图片，只关心width
var resizeWidthOnly=function(inputFilePath,outputFilePath,callback){
    //只对宽度做处理，并且如果宽度小于maxWidth，则不处理
    var maxWidth=imageDefine.normalImage.width;
    gm(inputFilePath).resizeExact(maxWidth,'>').interlace('line').write(outputFilePath,function(err,result){
        if(err){
            return callback(err,imageErrorDefine.resize)
        }
        return callback(null,{rc:0})
    })
}
//处理普通图片，生成缩略图，固定width/height
//!，强制转换成指定的size
var resizeToThumbnail=function(inputFilePath,outputFilePath,callback){
    //只对宽度做处理，并且如果宽度小于maxWidth，则不处理
    var exactWidth=imageDefine.thumbnail.width;
    var exactHeight=imageDefine.thumbnail.Height
    gm(inputFilePath).resize(exactWidth,exactHeight,'!').interlace('line').write(outputFilePath,function(err,result){
        if(err){
            return callback(err,imageErrorDefine.resize)
        }
        return callback(null,{rc:0})
    })
}
//处理头像，resize成正方形
var resizeUserIcon=function(inputFilePath,outputFilePath,callback){
    //只对宽度做处理，并且如果宽度小于general.innerImageMaxWidth，则不处理
    var exactWidth=imageDefine.userIcon.width;
    var exactHeight=imageDefine.userIcon.Height
    gm(inputFilePath).resize(exactWidth,exactHeight,'!').write(outputFilePath,function(err,result){
        if(err){
            return callback(err,imageErrorDefine.resize)
        }
        return callback(null,{rc:0})
    })
}*/
/*
* inputFilePath,outputFilePath:输入和输出文件路径（包含文件名）
* width,height: 设定的最大宽度和高度。数值。px
* exactSize：输出图形的width、height和定义的一致。 true：一致，false：只要关心width（大于width，缩小，否则不变）
* interlace：输出图形是否采用交错（GIF/PNG）或渐进（JPG）。true：交错或渐进，false：普通
* */
/*var generalResizeImage=function(inputFilePath,outputFilePath,width,height,exactSize,interlace,callback){
    var signal//signal:! or >.  !:忽略图片原始比例   >: 只关心width，如果没有超出，不做处理

    if(true===exactSize){
        signal='!'
        if(true===interlace){

        }else{

        }
    }else{
        signal='>'
        if(true===interlace){

        }else{

        }
    }


}*/
/*
exports.image={
    getter:{
        size:size,//width,height
        orientation:orientation,//TopLeft
        format:format,//PNG,JPEG,GIF,undefined
        depth:depth,//8 or 16,一般都是8
        color:color,
        res:res,//72x72 pixels/inch    37.79x37.79 pixels/centimeter
        fileSize:fileSize,//Ki,Mi,Gi
        identify:identify
    },
    command:{
        resizeWidthOnly:resizeWidthOnly,
        resizeToThumbnail:resizeToThumbnail,
        resizeUserIcon:resizeUserIcon
    },
    GmImage,
}*/
