/**
 * Created by wzhan039 on 2016-12-09.
 * 因为几个coll的code有很多重复，所以合并放到一个文件
 */
/**
 * Created by Ada on 2016/9/28.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")


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
function create({dbModel,values}){
    //不能直接返回promise，而是通过callback捕获可能错误，并转换成可读格式
    //return billTypeModel.insertMany(values)
    return new Promise(function(resolve,reject){
        console.log(`inserted values ${JSON.stringify(values)}`)

        dbModel.insertMany(values,function(err,result){
            if(err){
                //console.log(JSON.stringify(err))
                //能返回自定义错误，所以用resolve而不是reject
                resolve( mongooseErrorHandler(err))
            }else{
                console.log(`create result is ${JSON.stringify(result)}`)
                resolve({rc:0,msg:result})
            }
        })
    })
}
function update({dbModel,updateOptions,id,values}){
    values['uDate']=Date.now()
    console.log(`id is ${id}, values is ${JSON.stringify(values)}`)
    return new Promise(function(resolve,reject){
        dbModel.findByIdAndUpdate(id,values,updateOptions,function(err,result){
            if(err){
                 console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }

            //update成功，返回的是原始记录，需要转换成可辨认格式
            // resolve({rc:0})
             console.log(`db result is ${JSON.stringify(result)}`)
            resolve({rc:0,msg:result})
        })
    })
}

//根据Id删除文档（其实只是设置dData）
function remove({dbModel,updateOptions,id}){
    return new Promise(function(resolve,reject){
        let values={}
        values['dDate']=Date.now()
        dbModel.findByIdAndUpdate(id,values,updateOptions,function(err,result){
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
function removeAll({dbModel}){
    console.log(`remove all in `)
    return new Promise(function(resolve,reject){
        dbModel.remove({},function(err,result){
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

function readAll({dbModel,populateOpt,recorderLimit}){
    return new Promise(function(resolve,reject){
        let condition={dDate:{$exists:false}}
        let selectField=null
        let option={}
        option.limit=recorderLimit
        dbModel.find(condition,selectField,option).populate(populateOpt).exec(function (err,result) {
            if(err){
                // console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            resolve({rc:0,msg:result})
        })
    })
}

function readName({dbModel,nameToBeSearched,recorderLimit,readNameField}){
    return new Promise(function(resolve,reject){
        //过滤标记为删除的记录
        let condition={dDate:{$exists:false}}
        if(undefined!==nameToBeSearched && ''!== nameToBeSearched.toString()){
            condition[readNameField]=new RegExp(nameToBeSearched,'i')
        }
        console.log(`read name condition is ${JSON.stringify(condition)}`)
        //let selectField='name'?
        let option={}
        //option.limit=pageSetting.billType.limit
        option.limit=recorderLimit
        dbModel.find(condition,readNameField,option,function(err,result){
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
function findById({dbModel,id,selectedFields='-cDate -uDate -dDate'}){
    return new Promise(function(resolve,reject){
        dbModel.findById(id,selectedFields,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            console.log(`find by id result is ${JSON.stringify(result)}`)
            resolve({rc:0,msg:result})
        })
    })
}

function search ({dbModel,searchParams}) {
    return new Promise(function(resolve,reject){
        console.log(`billType search in with params ${searchParams}`)
        dbModel.find(searchParams,function(err,result){
            if(err){
                console.log(`db err is ${JSON.stringify(err)}`)
                resolve( mongooseErrorHandler(err))
            }
            console.log(`find result is ${JSON.stringify(result)}`)
            resolve({rc:0,msg:result})
        })
    })
}

module.exports= {
    create,
    update,
    remove,
    removeAll,//测试用
    readAll,
    readName,
    findById,
    search,
}