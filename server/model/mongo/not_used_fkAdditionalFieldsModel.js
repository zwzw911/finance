/**
 * Created by wzhan039 on 2016-11-01.
 * 从coll中获得外键对应记录的冗余字段，以便简化诸如 查询 等操作
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var billTypeModel=require('./common/structure-compiled').billTypeModel
var billModel=require('./common/structure-compiled').billModel
var employeeModel=require('./common/structure-compiled').employeeModel

var mongooseErrorHandler=require('../../define/error/mongoError').mongooseErrorHandler

//根据外键id获得一些外键记录的信息，这些冗余信息可以简化诸如 查询 等操作的处理
/* 输入：fkid: objectId
   返回:{name:'asdf'}
 */
function getBillTypeAdditionalFields(fkid){
    return new Promise(function(resolve,reject){
        //返回记录的哪些字段
        let selectedField={name}
        billTypeModel.findById(fkid,selectedField,function(err,result){
            if(err){
                resolve(mongooseErrorHandler(err))
            }else{
                resolve({rc:0,msg:result})
            }
        })
    })
}

module .exports={
    getBillTypeAdditionalFields
}