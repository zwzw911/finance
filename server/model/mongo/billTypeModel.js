/**
 * Created by Ada on 2016/9/28.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var billTypeModel=require('./common/structure-compiled').billTypeModel
var mongooseErrorHandler=require('../../define/error/mongoError').mongooseErrorHandler

var pageSetting=require('../../config/global/globalSettingRule').pageSetting

//populate的选项
//read/update/read使用
// var populateOpt=
var updateOptions={
    'new':true,//是否返回更新后的doc。默认false，返回原始doc
    'select':'', //返回哪些字段
    'upsert':false,//如果doc不存在，是否创建新的doc，默认false
    runValidators:false,//更新时是否执行validator。因为默写cavert，默认false
    setDefaultsOnInsert:false,//当upsert为true && 设为true，则插入文档时，使用default。
    'sort':'_id',//如果找到多个文档（应该不太可能），按照什么顺序选择第一个文档进行update。
}

function create(values){
    //不能直接返回promise，而是通过callback捕获可能错误，并转换成可读格式
    //return billTypeModel.insertMany(values)
    return new Promise(function(resolve,reject){
        //console.log(`inserted values ${values}`)

        billTypeModel.insertMany(values,function(err,result){
            if(err){
                //console.log(JSON.stringify(err))
                //能返回自定义错误，所以用resolve而不是reject
                resolve( mongooseErrorHandler(err))
            }else{
                resolve({rc:0,msg:result})
            }
        })
    })
}
function update(id,values){
    values['uDate']=Date.now()
     console.log(`id is ${id}, values is ${JSON.stringify(values)}`)
    return new Promise(function(resolve,reject){
        billTypeModel.findByIdAndUpdate(id,values,updateOptions,function(err,result){
            if(err){
                // console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }

            //update成功，返回的是原始记录，需要转换成可辨认格式
            // resolve({rc:0})
            // console.log(`db result is ${JSON.stringify(result)}`)
            resolve({rc:0,msg:result})
        })
    })
}

//根据Id删除文档
function remove(id){
    return new Promise(function(resolve,reject){
/*        billTypeModel.findByIdAndRemove(id,function(err,result){
            if(err){
                // console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            // console.log(`success result is ${result}`)
            //remove成功，返回的是原始记录，需要转换成可辨认格式
            resolve({rc:0})
        })*/
        let values={}
        values['dDate']=Date.now()
        billTypeModel.findByIdAndUpdate(id,values,updateOptions,function(err,result){
            if(err){
                // console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }else{
                // console.log(`department insert result is ${JSON.stringify(result)}`)
                //resolve({rc:0,msg:result})
                //只需返回是否执行成功，而无需返回update后的doc
                resolve({rc:0})
            }

        })
    })
}

//只做测试用
function removeAll(){
    return new Promise(function(resolve,reject){
        billTypeModel.remove({},function(err,result){
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

function readAll(populateOpt){
    return new Promise(function(resolve,reject){
        let condition={dDate:{$exists:false}}
        let selectField=null
        let option={}
        option.limit=pageSetting.billType.limit
        billTypeModel.find(condition,selectField,option).populate(populateOpt).exec(function (err,result) {
            if(err){
                // console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            resolve({rc:0,msg:result})
        })
    })
}

function readName(nameToBeSearched){
    return new Promise(function(resolve,reject){
        let condition={dDate:{$exists:false}}
        if(undefined!==nameToBeSearched && ''!== nameToBeSearched.toString()){
            condition['name']=new RegExp(nameToBeSearched)
        }
        let selectField='name'
        let option={}
        option.limit=pageSetting.billType.limit
        billTypeModel.find(condition,selectField,option,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`success result is ${result}`)
            resolve({rc:0,msg:result})
        })
    })
}

//作为外键时，是否存在
//selectedFields:'-cDate -uDate -dDate'
function findById(id,selectedFields='-cDate -uDate -dDate'){
    return new Promise(function(resolve,reject){
        billTypeModel.findById(id,selectedFields,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`billType find by id result is ${JSON.stringify(result)}`)
            resolve({rc:0,msg:result})
        })
    })
}


module.exports={
    create,
    update,
    remove,
    removeAll,
    readAll,
    readName,
    findById,

}