/**
 * Created by Ada on 2016/9/28.
 */
'use strict'
var userModel=require('./common/structure').userModel
var mongooseErrorHandler=require('../../define/error/mongoError').mongooseErrorHandler

var paginationSetting=require('../../config/global/globalSettingRule').paginationSetting

function create(values){
    //不能直接返回promise，而是通过callback捕获可能错误，并转换成可读格式
    //return userModel.insertMany(values)
    return new Promise(function(resolve,reject){
        //console.log(`inserted values ${values}`)

        userModel.insertMany(values,function(err,result){
            if(err){
                //console.log(JSON.stringify(err))
                //能返回自定义错误，所以用resolve而不是reject
                resolve( mongooseErrorHandler(err))
            }
            resolve(result)
        })
    })
}
function update(id,values){
    var updateOptions={
        'new':false,//是否返回更新后的doc。默认false，返回原始doc
        'select':'', //返回哪些字段
        'upsert':false,//如果doc不存在，是否创建新的doc，默认false
        runValidators:false,//更新时是否执行validator。因为默写cavert，默认false
        setDefaultsOnInsert:false,//当upsert为true && 设为true，则插入文档时，使用default。
        'sort':'_id',//如果找到多个文档（应该不太可能），按照什么顺序选择第一个文档进行update。
    }
    values['uDate']=Date.now()
    return new Promise(function(resolve,reject){
        userModel.findByIdAndUpdate(id,values,updateOptions,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }

            //update成功，返回的是原始记录，需要转换成可辨认格式
            resolve({rc:0})
        })
    })
}

//根据Id删除文档
function remove(id){
    return new Promise(function(resolve,reject){
        userModel.findByIdAndRemove(id,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`success result is ${result}`)
            //remove成功，返回的是原始记录，需要转换成可辨认格式
            resolve({rc:0})
        })
    })
}

function readAll(){
    return new Promise(function(resolve,reject){
        let condition={}
        let selectField=null
        let option={}
        option.limit=paginationSetting.user.limit
        userModel.find(condition,selectField,option,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`success result is ${result}`)
            resolve({rc:0,msg:result})
        })
    })
}

function readName(nameToBeSearched){
    return new Promise(function(resolve,reject){
        let condition={}
        if(undefined!==nameToBeSearched && ''!== nameToBeSearched.toString()){
            condition['name']=new RegExp(nameToBeSearched)
        }
        let selectField='name'
        let option={}
        option.limit=paginationSetting.user.limit
        userModel.find(condition,selectField,option,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`success result is ${result}`)
            resolve({rc:0,msg:result})
        })
    })
}

module.exports={
    create,
    update,
    remove,
    readAll,
    readName,
}