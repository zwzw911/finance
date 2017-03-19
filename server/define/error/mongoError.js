/**
 * Created by wzhan039 on 2016-10-04.
 *
 * 定义mogoose操作错误
 */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")
    //用来或侧chineseName，以便返回错误给client
var inputRule=require('../validateRule/inputRule').inputRule
var mongooseOpEnum=require('../enum/node').node.mongooseOp

/*
* mongoose操作错误（不包含validator的错误？？）
* err:mongo返回的错误
* fieldName：如果是validto人返回的错误，需要fieldName来获得err中的errormsg
* */
var mongooseErrorHandler=function(mongooseOp,err={}){
    //对特殊的操作做pre操作，如果有具体的error code，返回对应的error
    switch (mongooseOp){
        case mongooseOpEnum.insertMany:
            if(err.code && 11000===err.code){
                return errorDefine.common.duplicate(err.errmsg)
            }
            break;
        default:
            if(err.code ){
                return errorDefine.common.unknownErrorType(err)
            }
    }
    //mongo validator错误。将错误 "错误代码20046:父类别不能为空" 转换成{rc:20046,msg:‘父类别不能为空’}
    if(err.errors){
        for(let single in err.errors){
            if(err.errors[single]['message']){
                let rc={}
                let tmp=err.errors[single]['message'].split(':')
                let regResultTmp=tmp[0].match(/.+(\d{5})/)
                let returnCode=regResultTmp[1]
                rc['rc']=returnCode
                rc['msg']=tmp[1]
                return rc
            }
        }
        //return err['errors'][fieldName]['message']
    }

    //具体操作祥光的error
    console.log(`common err is ${JSON.stringify(mongooseOp)}`)
    return errorDefine['common'][mongooseOp](err)
}

//常见错误
var errorDefine={
    common:{
        unknownErrorType:function(err){
            return {rc:30000,msg:{client:`未知数据操作错误`,server:`${JSON.stringify(err)}`}}
        },
        duplicate:function(errmsg){
            //'E11000 duplicate key error index: finance.billtypes.$name_1 dup key: { : \"aa\" }'=======>finance  billType   name
            //3.2.9   E11000 duplicate key error collection: finance.billtypes index: name_1 dup key: { : "aa" }
            console.log(`mongoError->errorDefine: ${errmsg}`)
            let regex=/E11000 duplicate key error index:(.*)\sdup\skey:\s{\s:\s\"(.*)\"\s\}/
            let match=errmsg.match(regex)
            let matchResult=match[1]
            let tmp=matchResult.split('.')
            let [db,coll,field]=tmp
            field=field.split("_")[0].replace("$","") //$name_1===>$name
            let dupValue=matchResult[2]

/*            let regex=/.*collection:\s(.*)\sindex:\s(.*)\sdup\skey:\s{\s:\s\"(.*)\"\s\}/
            let matchResult=errmsg.match(regex)
            let [db,coll]=matchResult[1].split(".")
            let field=matchResult[2].split("_")[0]
            let dupValue=matchResult[3]*/
            // console.log(`db is ${db},coll is ${coll}, field is ${field}, dup is ${dupValue}`)
            //mongoose自动将coll的名称加上s，为了和inputRule匹配，删除s
            //let trueCollName
            if('s'===coll[coll.length-1]){
                coll=coll.substring(0,coll.length-1)
            }

/*            let fieldRegex=/\$(\w+)_.*!/
            tmp=field.match(fieldRegex)
            field=tmp[1]*/

            //mongoose 自动将coll的名称改成全小写
            let chineseName
            for(let singleColl in inputRule){
                // console.log(`for coll is ${singleColl}`)
                if(singleColl.toLowerCase()===coll){
                    // console.log(`match coll is ${singleColl}`)

                    chineseName=inputRule[singleColl][field]['chineseName']
                }
            }
            console.log(`ready to return mongooseErrorHandler`)
            return {rc:30002,msg:{client:`${chineseName}的值已经存在`,server:`集合${coll}的字段${field}的值${dupValue}重复`}}
        },
        findById:function(err){
            return {rc:30004,msg:{client:`数据库错误，请联系管理员`,server:`findById err is ${JSON.stringify(err)}`}}
        },
        findByIdAndUpdate:function(err){
            return {rc:30006,msg:{client:`数据库错误，请联系管理员`,server:`findByIdAndUpdate err is ${JSON.stringify(err)}`}}
        },
        remove:function(err){
            return {rc:30008,msg:{client:`数据库错误，请联系管理员`,server:`remove err is ${JSON.stringify(err)}`}}
        },
        readAll:function(err){
            return {rc:30010,msg:{client:`数据库错误，请联系管理员`,server:`read all err is ${JSON.stringify(err)}`}}
        },
        readName:function(err){
            return {rc:30012,msg:{client:`数据库错误，请联系管理员`,server:`read name err is ${JSON.stringify(err)}`}}
        },
        search:function(err){
            return {rc:30014,msg:{client:`数据库错误，请联系管理员`,server:`search err is ${JSON.stringify(err)}`}}
        },
    }
}

module.exports={
    mongooseErrorHandler,
    errorDefine
}