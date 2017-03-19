/**
 * Created by wzhan039 on 2016-08-16.
 */
/*
*   为了测试mongo相关函数，需要
*   1. 运行mongod
*
* */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")
var dbModel=require('../../../../server/model/mongo/common/structure')
//检测错误结果
var inputRule=require('../../../../server/define/validateRule/inputRule').inputRule

var testAsyncMongoValidate=async function(test){
    test.expect(7);

    let func,result,departmentDoc,billDoc,employeeDoc

    func=require('../../../../server/assist/wrapAsync/db/mongo/mongoValidate').asyncMongoValidate

    departmentDoc=new dbModel.departmentModel()
    //required

    result=await func(departmentDoc)
    test.equal(result.rc,inputRule.department.name.require.mongoError.rc,'required name check fail')

    //minlength
    departmentDoc.name='a'
    result=await func(departmentDoc)
    test.equal(result.rc,inputRule.department.name.minLength.mongoError.rc,'minlength name check fail')

    //maxlength
    departmentDoc.name='012345678901234'
    result=await func(departmentDoc)
    test.equal(result.rc,inputRule.department.name.maxLength.mongoError.rc,'maxlength name check fail')

    //objectId
    departmentDoc.name='0123456789'
    departmentDoc.parentDepartment='0123456789'
    result=await func(departmentDoc)
    test.equal(result.rc,inputRule.department.parentDepartment.format.mongoError.rc,'format parentDepartment check fail')

    //min
    billDoc=new dbModel.billModel({amount:-1})
    result=await func(billDoc)
    test.equal(result.rc,inputRule.bill.amount.min.mongoError.rc,'min bill amount check fail')

    //max
    billDoc=new dbModel.billModel({amount:100000000})
    result=await func(billDoc)
    test.equal(result.rc,inputRule.bill.amount.max.mongoError.rc,'max bill amount check fail')

    //match
    employeeDoc=new dbModel.employeeModel({name:'a',department:'123456789012345678901234'})
    result=await func(employeeDoc)
    test.equal(result.rc,inputRule.employee.name.format.mongoError.rc,'match employee format check fail')

    test.done();
}

module.exports={
    testAsyncMongoValidate,
}