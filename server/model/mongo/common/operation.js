/**
 * Created by ada on 2016/9/20.
 */

var allExport=require('./structure')
let departmentModel=allExport.departmentModel,billTypeModel=allExport.billTypeModel,billModel=allExport.billModel, employeeModel=allExport.employeeModel
let collNames=allExport.collections

//根据coll的名称，得到具体使用的model/name字段
let collNameMatchProperty={
    'department':{model:departmentModel,field:'name'},
    'employee':{model:employeeModel,field:'name'},
    'billType':{model:billTypeModel,field:'name'},
    'bill':{model:billModel,field:'title'},
}

//支持AC，通过模糊查找获得name/title
function getNameFiled(collName,partValue,maxLimitNum=10){
    //通过regex进行模糊查找
    let fuzzyReg=new RegExp(partValue,'i')
    let currentModel=collNameMatchProperty[collName]['model'], currentField=collNameMatchProperty[collName]['field']
    return currentModel.find({currentField:{$regex:fuzzyReg}}).select(currentField).limit(maxLimitNum).exec()
}

//recorder是对象
//返回promise
function insert(collName, recorder){
    let currentModel=collNameMatchProperty[collName]['model'], currentField=collNameMatchProperty[collName]['field']
/*    console.log(currentModel)
    console.log(currentField)*/
    return currentModel.create(recorder)
}

//插入多个记录。recorders为数组，元素为对象
function insertMulti(collName, recorders){
    let currentModel=collNameMatchProperty[collName]['model'], currentField=collNameMatchProperty[collName]['field']
    return currentModel.insertMany(recorders)
}
/*departmentModel.create({name:'MIT',cDate:new Date()},function(err,doc){
    if(err){console.log(err)}
    else {console.log(doc)}
})*/
/*
insertMulti('department',[{name:'SI55',cDate:new Date()},{name:'FI11',cDate:new Date()}]).then(
    function(data){
        console.log('OOOOOOOOOOOOOOOOOOOOOOOOOOOOO')
        console.log(data)
    },
    function(err){
        console.log('MMMMMMMMMMMMMMMMMMMMMM')
        console.log(err)
    }
)*/
