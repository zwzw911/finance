/**
 * Created by ada on 2015/7/31.
 * classed by db
 */
    'use strict'
//mongo的validate error和input value共享一个定义
var mongoError=require('../define/validateRule/inputRule').inputRule;
var dbModel=require('../model/mongo/common/structure').departmentModel

var collections=require('../model/mongo/common/structure').collections
var fieldDefine=require('../model/mongo/common/structure').fieldDefine
//为了返回{rc:xxx,msg:'xxxxx'}格式的结果，只能requireinputRule（structure中的error msg是rc+msg的字符串格式，不太符合常用格式）
var inputRule=require('../define/validateRule/inputRule').inputRule
/*
*  validate。使用同一的函数处理
* */


let mongo2Input={
    required:'require',
    min:'min',
    max:'max',
    minlength:'minLength',
    maxlength:'maxLenght',
    match:'format',
}

var de=new dbModel()

/*
* 根据validate的error信息直接找到inputValue中对应的rule的mongoError
* 1. 遍历所有collection，检查err.message是否包含collection名称，以此判断
* 2.
* */
var mongoValidate=function(doc,cb){
    doc.validate(function(err){
        for(let collectionName of collections){
            if(-1!==err.message.indexOf(collectionName)){//判断当前错误是哪个collection产生的
                for(let singleFieldName in fieldDefine[collectionName]){//遍历collection中的每个字段，是否在err中有对应的
                    if(err.errors[singleFieldName]){//某个字段有error
                        let kind=err.errors[singleFieldName]['kind']    //此field错误的类型
                        if(inputRule[collectionName][singleFieldName][mongo2Input[kind]]){  //在inputValue中，对应的rule存在
                            console.log(inputRule[collectionName][singleFieldName][mongo2Input[kind]]['mongoError'])
                            cb(inputRule[collectionName][singleFieldName][mongo2Input[kind]]['mongoError'])
                        }
                    }
                }
            }
        }
    })
}

mongoValidate(de,function(){})
/*var validateUser=function(user,category,subCategory,callback){
    user.validate(function(err){
        var return_result;
        if(err){
            //console.log(err)
            if(err.errors.name){
                return_result=input_validate.user.name.validateError.server;
            }
            if(err.errors.password){
                return_result=input_validate.user.password.validateError.server;
            }
            if(err.errors.mobilePhone){
                return_result=input_validate.user.mobilePhone.validateError.server;
            }
            if(err.errors.thumbnail){
                return_result=input_validate.user.thumbnail.validateError.server;
            }

            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateArticle=function(article,category,subCategory,callback){
    article.validate(function(err){
        var return_result;
        if(err){
            //console.log(err)
/!*            if(err.errors._id){
                return_result=input_validate.article._id.validateError.server;
            }*!/
            if(err.errors.hashId){
                return_result=input_validate.article.hashId.validateError.server;
            }
            if(err.errors.title){
                return_result=input_validate.article.title.validateError.server;
            }
            if(err.errors.author){
                return_result=input_validate.article.author.validateError.server;
            }
            if(err.errors.keys){
                return_result=input_validate.article.keys.validateError.server;
            }
            if(err.errors.innerImage){
                return_result=input_validate.article.innerImage.validateError.server;
            }
            if(err.errors.attachment){
                return_result=input_validate.article.attachment.validateError.server;
            }
            if(err.errors.pureContent){
                return_result=input_validate.article.pureContent.validateError.server;
            }
            if(err.errors.htmlContent){
                return_result=input_validate.article.htmlContent.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateAttachment=function(attachment,category,subCategory,callback){
    attachment.validate(function(err){
        var return_result;
//console.log(err)
        if(err){
            if(err.errors._id){
                return_result=input_validate.attachment._id.validateError.server;
            }
            if(err.errors.name){
                return_result=input_validate.attachment.name.validateError.server;
            }
            if(err.errors.storePath){
                return_result=input_validate.attachment.storePath.validateError.server;
            }
            if(err.errors.size){
                return_result=input_validate.attachment.size.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateComment=function(comment,category,subCategory,callback){
    comment.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.articleId){
                return_result=input_validate.comment.articleId.validateError.server;
            }
            if(err.errors.user){
                return_result=input_validate.comment.user.validateError.server;
            }
            if(err.errors.content){
                return_result=input_validate.comment.content.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateKey=function(key,category,subCategory,callback){
    key.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.key){
                return_result=input_validate.key.key.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateInnerImage=function(innerImage,category,subCategory,callback){
//console.log(innerImage)
    innerImage.validate(function(err){
        var return_result;
//console.log(err)
        if(err){
            if(err.errors.hashName){
                return_result=input_validate.innerImage.hashName.validateError.server;
            }
            if(err.errors.name){
                return_result=input_validate.innerImage.name.validateError.server;
            }
            if(err.errors.storePath){
                return_result=input_validate.innerImage.storePath.validateError.server;
            }
            if(err.errors.size){
                return_result=input_validate.innerImage.size.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateFolder=function(folder,category,subCategory,callback){
    folder.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.folderName){
                return_result=input_validate.folder.folderName.validateError.server;
            }
            if(err.errors.owner){
                return_result=input_validate.folder.owner.validateError.server;
            }
            if(err.errors.parentId){
                return_result=input_validate.folder.parentId.validateError.server;
            }
            if(err.errors.level){
                return_result=input_validate.folder.level.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateFolder=function(folder,category,subCategory,callback){
    folder.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.folderName){
                return_result=input_validate.folder.folderName.validateError.server;
            }
            if(err.errors.owner){
                return_result=input_validate.folder.owner.validateError.server;
            }
            if(err.errors.parentId){
                return_result=input_validate.folder.parentId.validateError.server;
            }
            if(err.errors.level){
                return_result=input_validate.folder.level.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

/!********************************************************************************************************************!/
/!*                                                      relation table                                              *!/
/!********************************************************************************************************************!/
var validateKeyArticle=function(keyArticle,category,subCategory,callback){
    keyArticle.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.keyId){
                return_result=input_validate.keyArticle.keyId.validateError.server;
            }
            if(err.errors.articleId){
                return_result=input_validate.keyArticle.articleId.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}

var validateArticleFolder=function(articleFolder,category,subCategory,callback){
    articleFolder.validate(function(err){
        var return_result;
        if(err){
            if(err.errors.folderId){
                return_result=input_validate.articleFolder.folderId.validateError.server;
            }
            if(err.errors.articleId){
                return_result=input_validate.articleFolder.articleId.validateError.server;
            }
            errorRecorder(return_result,category,subCategory)
            return callback(err,return_result)
        }else{
            return callback(null,{rc:0,msg:null})
        }
    })
}
//exports.mongooseError=mongooseError;
//exports.mongooseValidateError=mongooseValidateError;
exports.validateDb={
    user:validateUser,
    article:validateArticle,
    attachment:validateAttachment,
    comment:validateComment,
    key:validateKey,
    innerImage:validateInnerImage,
    folder:validateFolder,
    articleFolder:validateArticleFolder
}*/
