/**
 * Created by Ada on 2016/9/28.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var departmentModel=require('./common/structure-compiled').departmentModel
var mongooseErrorHandler=require('../../define/error/mongoError').mongooseErrorHandler

var pageSetting=require('../../config/global/globalSettingRule').pageSetting

//var miscModel=require('../../assist/not_used_miscModel')

//当前coll中，需要被populated的字段，如果此字段有内容，那么执行populate，否则不执行（节省populate的操作）

//populate的选项
//read/update/read使用
// var populateOpt={
//
// }

//update和remove都要使用update方法
var updateOptions={
    'new':true,//是否返回更新后的doc。默认false，返回原始doc。设为true，返回更新后的数据（给client）
    'select':'name parentDepartment cDate uDate', //返回哪些字段
    'upsert':false,//如果doc不存在，是否创建新的doc，默认false
    runValidators:false,//更新时是否执行validator。因为默写cavert，默认false
    setDefaultsOnInsert:false,//当upsert为true && 设为true，则插入文档时，使用default。
    'sort':'_id',//如果找到多个文档（应该不太可能），按照什么顺序选择第一个文档进行update。
}


function create(values){
    //不能直接返回promise，而是通过callback捕获可能错误，并转换成可读格式
    //return departmentModel.insertMany(values)
    return new Promise(function(resolve,reject){
        departmentModel.insertMany(values,function(err,result){
            if(err){
                // console.log(JSON.stringify(err))
                //能返回自定义错误，所以用resolve而不是reject
                resolve( mongooseErrorHandler(err))
            }else{
                resolve({rc:0,msg:result})
            }


        })
    })
}

async function update(id,values){
    values['uDate']=Date.now()
    return new Promise(function(resolve,reject){
         console.log(`update input is ${id}, ${JSON.stringify(values)}`)
        departmentModel.findByIdAndUpdate(id,values,updateOptions,function(err,result){
            if(err){
                // console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }else{
                resolve({rc:0,msg:result})
            }
        })
    })
}

//根据Id删除文档
function remove(id){
    return new Promise(function(resolve,reject){
/*        departmentModel.findByIdAndRemove(id,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`success result is ${result}`)
            //remove成功，返回的是原始记录，需要转换成可辨认格式
            resolve({rc:0})
        })*/
        let values={}
        values['dDate']=Date.now()
        departmentModel.findByIdAndUpdate(id,values,updateOptions,function(err,result){
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
        departmentModel.remove({},function(err,result){
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
        option.limit=pageSetting.department.limit
        departmentModel.find(condition,selectField,option).populate(populateOpt).exec(function (err,result) {
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
        option.limit=pageSetting.department.limit
        departmentModel.find(condition,selectField,option,function(err,result){
            if(err){
                console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            console.log(`success result is ${result}`)
            resolve({rc:0,msg:result})
        })
    })
}

//作为外键时，是否存在
function findById(id,selectedFields='-cDate -uDate -dDate'){
    return new Promise(function(resolve,reject){
        departmentModel.findById(id,selectedFields,function(err,result){
            if(err){
                console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            // console.log(`department find by Id ${result}`)
            // console.log(`original type is  ${typeof result}`)
            // let convert=result.toJSON()
            // console.log(`after toJSON type is  ${typeof convert}`)
            // delete result['_id']
            // console.log(`after delete is ${convert['_id']}`)
            // console.log(`after delete type is ${typeof result['_id']}`)
            // result['_id']=convert
            // console.log(`type of   ${typeof result['_id']}`)
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