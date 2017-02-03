/**
 * Created by wzhan039 on 2016-04-22.
 * 使用multiparty获得返回的文件信息
 */
'use strict'
var multiparty = require('multiparty');
var misc=require('../not_used_validateFunc').func;

let error={
    parameterNotDefine:function(parameter){
        return {rc:69700,msg:`参数${parameter}没有定义`}
    },
    fileNameCantEmpty:function(parameter){
        return {rc:69701,msg:`参数${parameter}不能为空`}
    },
    uploadFolderNotExist:function(uploadFolder){
        return {rc:69702,msg:`上传目录${uploadFolder}不存在`}
    },
    maxSizeNotInt:function(maxSize){
        return {rc:69704,msg:`文件最大尺寸${maxSize}不是整数`}
    },
    maxSizeNotPositive:function(maxSize){
        return {rc:69706,msg:`文件最大尺寸${maxSize}不是正数`}
    },
    maxFileNumNotInt:function(maxFileNum){
        return {rc:69708,msg:`最大上传文件数量${maxFileNum}不是整数`}
    },
    maxFileNumNotPositive:function(maxFileNum){
        return {rc:69710,msg:`最大上传文件数量${maxFileNum}不是正数`}
    },
    exceedMaxFileSize:function(){
        return {rc:69712,msg:`上传文件尺寸超过最大定义`}
    },
    uploadedFileUndefined:function(){
        return {rc:69713,msg:`上传文件数量为空`}
    },
    uploadedFileNumIsZero:function(){
        return {rc:69714,msg:`上传文件数量为0`}
    },

}

function formParse(req,form,option){
    return new Promise(function(resolve,reject){
        form.parse(req, function (err, fields, files) {
            var filesTmp = JSON.stringify(files, null, 2);
            var fieldsTemp = JSON.stringify(fields, null, 2);

// console.log(err)
            if (err) {
                switch (err.status) {
                    case 413:
                        reject(error.exceedMaxFileSize())
                        //cb(null, )
                        break
                }
            }

            if(undefined===files[option['name']] || null===files[option['name']]){
                reject(error.uploadedFileUndefined())
                //cb(null, )
            }
//console.log(files);
            //importSetting: input的name
            /*        { file:
             [ { fieldName: 'file',
             originalFilename: 'blob',
             path: 'C:\\Users\\zw\\AppData\\Local\\Temp\\-EsVDp0EheQ-XCA7ZWDs7n5z',
             headers: [Object],
             size: 9250 } ] }*/
            if (0 === files[option['name']].length) {
                reject(error.uploadedFileNumIsZero())
                //cb(null, upload.)
            }

//console.log(files[upload.option['name']])
            //返回文件数组
            resolve({rc:0,msg:files[option['name']]})
            //return cb(null,)
//                cb(null,{rc:0,msg:files})
//console.log('end')
        })
    })
}


var Upload=class Upload{

    constructor(req,option){
        if(misc.dataTypeCheck.isSetValue(option)){
            //name,path,maxSize,maxFileNum(上传文件数组名，上传路径，文件最大size，最大上传文件个数)
            let needParamName=['name','uploadFolder','maxSize','maxFileNum']
            //    1. 必须参数是否传入
            for(let p of needParamName){
                console.log(p)
                if(true===misc.dataTypeCheck.isEmpty(option[p])){

                    return error.parameterNotDefine(option[p])
                    //throw new Error(error.parameterNotDefine(option[p]))
                    //throw new Error('wrong')
                }
            }
            //    2 检测上传目录是否存在
            let value=option['uploadFolder'];
            if(false===misc.dataTypeCheck.isFolder(value)){
                return error.uploadFolderNotExist(value)
            };
            //    3 检查maxSize是否为整数
            value=option['maxSize']
            if ( false===misc.dataTypeCheck.isInt(value) ) {
                return error.maxSizeNotInt(value)
            }
            //    4 maxSize是否为正数
            if(false===misc.dataTypeCheck.isPositive(value)){
                return error.maxSizeNotPositive(value)
            }
            //    5 maxFileNum是否为整数
            value=option['maxFileNum']
            if(false===misc.dataTypeCheck.isInt(value)){
                return error.maxFileNumNotInt(value)
            }
            //    6 maxFileNum是否为正数
            if(false===misc.dataTypeCheck.isPositive(value)){
                return error.maxFileNumNotPositive(value)
            }
            this.option=option
        }
    }
    /*
    *   不设置setter，因为只能抛出错误，而不能返回错误（因为是赋值操作）。所以属性的赋值都通过构造函数
    * */
/*    set name(value){
        if(false===misc.dataTypeCheck.isSetValue(value) || true===misc.dataTypeCheck.isEmpty(value)){
            return error.fileNameCantEmpty('name')
        }
        this.option.name=value
    }*/
    get name(){
        return this.option.name
    }
    get uploadFolder(){
        return this.option.uploadFolder
    }
    get maxSize(){
        return this.option.maxSize
    }
    get maxFileNum(){
        return this.option.maxFileNum
    }

    async upload(req,cb){
//console.log(upload.option)
        let mpOption={
            uploadDir:this.option['uploadFolder'] ,
            maxFilesSize:this.option['maxSize']
        }
        //console.log(mpOption)
        let form = new multiparty.Form(mpOption);
        await formParse(req,form)
    }

/*        test(){
            console.log('test')
        }*/

}
exports.Upload=Upload;