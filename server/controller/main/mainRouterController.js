/**
 * Created by wzhan039 on 2016-09-30.
 * 因为expressjs的router只能支持callback，所有将所有的router处理都单独通过一个async函数处理，然后直接返回promise给router调用，
 *
 */
var appSetting=require('../../config/global/appSetting')

var inputRule=require('../../define/validateRule/inputRule').inputRule
var miscFunc=require('../../assist/misc-compiled').func
// var validate=miscFunc.validate
var checkInterval=miscFunc.checkInterval

/*                      error               */
var pageError=require('../../define/error/pageError')

/*                      model               */
var departmentDbOperation=require('../../model/mongo/departmentModel')
var employeeDbOperation=require('../../model/mongo/employeeModel')
var billTypeDbOperation=require('../../model/mongo/billTypeModel')
var billDbOperation=require('../../model/mongo/billModel')

/*                      regex               */
var coll=require('../../define/enum/node').node.coll
/*                      enum                */
var nodeEnum=require('../../define/enum/node').node
var envEnum=nodeEnum.env

/*                      app special param           */
var maxFieldNum={
    department:3,//_id/name/parentDepartment
    employee:7,
    billType:3,
    bill:7,
}
/*********************  common  *******************************/
//1. checkInterval
async function common(req,res,next){
    let result=await checkInterval(req)
    return result
    //console.log(`mainController common result is ${result}`)
}

//对create/update方法输入的value进行检查和转换（字符串的话）
//create:false     update:true
async function sanityInput(originalInputValue,inputRule,basedOnInputValue,maxFieldNum){
    // console.log(`input value type is ${typeof originalInputValue}`)
    //1. 检查post/put上来的数据是否为Object，返回{rc:0,msg:{values}}
    let convertedInput=await miscFunc.validateInputValue.checkInputDataValidate(originalInputValue)
// console.log(`fomat result is ${JSON.stringify(convertedInput)}`)
    if(convertedInput.rc>0){
        //return res.json(returnResult(convertedInput))
            return convertedInput
    }
    //2  检查是否为{field:{value:'xxxx'},field2:{value:'yyyy'}}）
    let checkConvertedInput=await miscFunc.validateInputValue.checkInputDataFormat(convertedInput.msg)
    if(checkConvertedInput.rc>0){
        return checkConvertedInput
    }
    //3 检查字段数量，已经重复字段
    let checkField=miscFunc.validateInputValue.checkInputValueKey(convertedInput.msg,maxFieldNum)
    if(checkField.rc>0){
        return checkField
    }
    //4. 检查转换后的输入是否正确，结果是每个字段都有一个返回值。{name:{rc:0},parent:{rc:0}}
/*    console.log(`inputValue is ${JSON.stringify(convertedInput.msg)}`)

    console.log(`inputRule is ${JSON.stringify(inputRule)}`)*/
    let checkResult=await miscFunc.validateInputValue.checkInput(convertedInput.msg,inputRule,basedOnInputValue)
    //check result 为每个field返回一个{rc,msg}
/*    if(checkResult.rc>0){
        return checkResult
    }*/
     // console.log(`check input  result is ${JSON.stringify(checkResult)}`)
    for(let singleField in checkResult){
        if(checkResult[singleField].rc>0){
/*            returnResult(checkResult[singleField])
            return res.json(checkResult[singleField])*/
            return checkResult[singleField]
        }
    }
    return convertedInput
}

//对returnResult做包装，通过env的判断决定res.json输出的格式
function returnResult(rc){
    if(envEnum.production===appSetting.env){
        return miscFunc.formatRc(rc)
    }else{
        return rc
    }
}

//fkColl：选择哪个coll进行id验证
//currentColl+currentFkName：确定使用哪个error
async function checkIdExist(fkColl,currentColl,currentFkName,id){
    let dbOperation
    switch (fkColl){
        case coll.employee:
            dbOperation=employeeDbOperation;
            break;
        case coll.department:
            dbOperation=departmentDbOperation;
            break;
        case coll.billType:
            dbOperation=billTypeDbOperation;
            break;
        case coll.bill:
            dbOperation=billDbOperation
            break;
        default:
            return pageError.common.unknownColl
    }
//console.log(`dboperation is ${dbOperation['findById'].toString()}`)
//    console.log(`id is ${id}`)
    let result=await dbOperation['findById'](id)
    //console.log(`result after db is ${JSON.stringify(result)}`)
    if(null===result.msg){
        return pageError[currentColl][currentFkName+'NotExist']
    }else{
        return {rc:0}
    }
}
/*                      debug                               */
let debug={}
debug['removeAll']=async function removeAll(req,res,next){
    let billRemoveResult=await billDbOperation.removeAll()
    if(billRemoveResult.rc>0){
        return res.json(returnResult(billRemoveResult))
    }

    let employeeRemoveResult=await employeeDbOperation.removeAll()
    if(employeeRemoveResult.rc>0){
        return res.json(returnResult(employeeRemoveResult))
    }

    let billTypeRemoveResult=await billTypeDbOperation.removeAll()
    if(billTypeRemoveResult.rc>0){
        return res.json(returnResult(billTypeRemoveResult))
    }

    let departmentRemoveResult=await departmentDbOperation.removeAll()
    if(departmentRemoveResult.rc>0){
        return res.json(returnResult(departmentRemoveResult))
    }
//console.log('all delete done')
    return res.json({rc:0})
}




/*********************  user  ******************************
 * 操作的用户：只有创建和更新（密码）的操作，并且是在程序内部执行，而非client发起req
 * */
let user={}
user['create']=async function (req,res,next){

}

user['update']=async function (req,res,next){

}

/*********************  department  ******************************
 * 部门
 * */
let department={}
department['create']=async function (req,res,next){
    // console.log(`chinese is 中文`)
    // console.log(`before san ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.department,false,maxFieldNum.department)
    // console.log(`1st san ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        // returnResult(sanitizedInputValue)
        return res.json(returnResult(sanitizedInputValue))
    }
    //采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)
    //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)
    arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg))
    let result=await departmentDbOperation.create(arrayResult)

    //console.log(` inserted result ${JSON.stringify(result)}`)

    return res.json(returnResult(result))
}

department['remove']=async function (req,res,next){
    //1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.department,true,maxFieldNum.department)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){

        return res.json( returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id.value
    //console.log(`id is ${id}`)
    let result=await departmentDbOperation.remove(id)
    //console.log(`db op result is ${result}`)

    return res.json(returnResult(result))
}


department['update']=async function (req,res,next){
//1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.department,true,maxFieldNum.department)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式()
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id

    let result=await departmentDbOperation.update(id,convertedResult)
    //console.log(`db op result is ${result}`)

    return res.json(returnResult(result))
}

department['readAll']=async function (req,res,next){
    let result=await departmentDbOperation.readAll()
    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(returnResult(result))
}

department['readName']=async function (req,res,next){
    let recorder
    if(req.params.name){
        // console.log(`name is ${req.params.name}`)
        let constructedValue={name:{value:req.params.name}}
        // console.log(`constructedValue is ${JSON.stringify(constructedValue)}`)
        let validateResult=await miscFunc.validateInputValue.checkSearchValue(constructedValue,inputRule.department)
        // console.log(`validateResult value is ${validateResult}`)
        if(validateResult['name']['rc']>0){
            return res.json(validateResult['name'])
        }
        // console.log(`converted search value is ${constructedValue}`)
        recorder=await departmentDbOperation.readName(constructedValue)
    }else{
        recorder=await departmentDbOperation.readName()
    }

    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(returnResult(recorder))
    //return JSON.stringify(result)
}


/*********************  employee  ******************************
 * 员工
 * */
let employee={}
employee['create']=async function (req,res,next){
    // console.log(`before san ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.employee,false,maxFieldNum.employee)
     // console.log(`1st san ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        return res.json(returnResult(sanitizedInputValue))
    }
    //采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)
    //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)
    arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg))
    //检查外键是否存在
    for(let doc of arrayResult){
/*        let fkResult=await departmentDbOperation.findById(doc.department)

        if(null===fkResult.msg){
            //console.log(pageError.employee.departmentNotExist)

            //console.log(pageError.employee.departmentNotExist)
            // return res.json(returnResult(pageError.employee.departmentNotExist))
            return res.json(returnResult(pageError.employee.departmentNotExist))
        }

        if(fkResult.msg && fkResult.msg._id){
            // console.log(`doc   is ${JSON.stringify(doc)}`)
            // console.log(`fkResult is ${JSON.stringify(fkResult)}`)
            // console.log(`doc id  is ${doc.department}`)
            // console.log(`fkR id  is ${fkResult.msg._id}`)
            // console.log(typeof doc.department)
            // console.log(typeof fkResult.msg._id)
            // console.log((fkResult.msg._id !== doc.department))
            if(fkResult.msg._id.toString() !== doc.department.toString()){
                // return res.json(returnResult(pageError.employee.departmentNotExist))
                return res.json(pageError.employee.departmentNotExist)
            }
        }*/
// console.log(`doc is ${JSON.stringify(doc)}`)
        if(doc.department){

            let result=await checkIdExist(coll.department,coll.employee,'department',doc.department)
            // console.log(`fk result is ${JSON.stringify(result)}`)
            if(0<result.rc){
                // console.log('department fail')
                return res.json(returnResult(result))
            }
        }
    }
    let result=await employeeDbOperation.create(arrayResult)

    //console.log(` inserted result ${JSON.stringify(result)}`)
    return res.json(returnResult(result))
}

employee['remove']=async function (req,res,next){
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.employee,true,maxFieldNum.employee)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    //console.log(`id is ${id}`)
    let result=await employeeDbOperation.remove(id)
    //console.log(`db op result is ${result}`)

    return res.json(returnResult(result))
}

employee['update']=async function (req,res,next){
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.employee,true,maxFieldNum.employee)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3. 如果有外键，需要检测外键
    if(convertedResult.department){
        let result=await checkIdExist(coll.department,coll.employee,'department',convertedResult.department)
        if(result.rc>0){
            return res.json(returnResult(result))
        }
    }
    //4， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id


    let result=await employeeDbOperation.update(id,convertedResult)
    //console.log(`db op result is ${result}`)

    return res.json(returnResult(result))
}

employee['readAll']=async function (req,res,next){
    let result=await employeeDbOperation.readAll()
    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(returnResult(result))
}

employee['readName']=async function (req,res,next){
    let recorder
    if(req.params.name){
        // console.log(`name is ${req.params.name}`)
        let constructedValue={name:{value:req.params.name}}
        let validateResult=await miscFunc.validateInputValue.checkSearchValue(constructedValue,inputRule.employee)
        if(validateResult['name']['rc']>0){
            return res.json(validateResult['name'])
        }
        recorder=await employeeDbOperation.readName(req.params.name)
    }else{
        recorder=await employeeDbOperation.readName()
    }

    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(returnResult(recorder))
    //return JSON.stringify(result)
}


/*********************  billType  *******************************/
let billType={}

billType['create']=async function create(req,res,next){
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.billType,false,maxFieldNum.billType)
    //console.log(`1st san ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }
    //采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
/*    console.log(`before sant ${sanitizedInputValue.msg}`)
    console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)*/
    arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg))
    let result=await billTypeDbOperation.create(arrayResult)

    //console.log(` inserted result ${JSON.stringify(result)}`)

    return res.json(returnResult(result))
}

billType['update']=async function update(req,res,next){
    //1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.billType,true,maxFieldNum.billType)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id


    let result=await billTypeDbOperation.update(id,convertedResult)
    //console.log(`db op result is ${result}`)

    return res.json(returnResult(result))
}


billType['remove']=async function(req,res,next){
    //1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.billType,true,maxFieldNum.billType)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    //console.log(`id is ${id}`)
    let result=await billTypeDbOperation.remove(id)
    //console.log(`db op result is ${result}`)

    return res.json(returnResult(result))
}


billType['readAll']=async function(req,res,next){
    let result=await billTypeDbOperation.readAll()
    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(returnResult(result))
    //return JSON.stringify(result)
}

billType['readName']=async function(req,res,next){
    let recorder
    if(req.params.name){
        // console.log(`name is ${req.params.name}`)
        let constructedValue={name:{value:req.params.name}}
        let validateResult=await miscFunc.validateInputValue.checkSearchValue(constructedValue,inputRule.billType)
        if(validateResult['name']['rc']>0){
            return res.json(validateResult['name'])
        }
        recorder=await billTypeDbOperation.readName(req.params.name)
    }else{
        recorder=await billTypeDbOperation.readName()
    }

    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(returnResult(recorder))
    //return JSON.stringify(result)
}



/*********************  bill  ******************************
 * 部门
 * */
let bill={}
bill['create']=async function (req,res,next){
     //console.log(`before san ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.bill,false,maxFieldNum.bill)
    //console.log(`1st san ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }
    //采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)
    //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)
    arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg))
    //检查外键是否存在
    for(let doc of arrayResult){
        /*        let fkReimburserResult=await employeeDbOperation.findById(doc.reimburser)
         let fkBillTypeResult=await billTypeDbOperation.findById(doc.billType)*/
        //同时执行，尽快得到结果
        let [fkReimburserResult,fkBillTypeResult]=await Promise.all([checkIdExist(coll.employee,coll.bill,'reimburser',doc.reimburser),checkIdExist(coll.billType,coll.bill,'billType',doc.billType)])
//console.log(`fkReimburserResult result is ${JSON.stringify(fkReimburserResult)}`)
//        console.log(`fkBillTypeResult result is ${JSON.stringify(fkBillTypeResult)}`)
        if(fkReimburserResult.rc>0){
            return res.json(returnResult(fkReimburserResult))
        }
        if(fkBillTypeResult.rc>0){
            return res.json(returnResult(fkBillTypeResult))
        }

    }
/*    for(let doc of arrayResult){
/!*        let fkReimburserResult=await employeeDbOperation.findById(doc.reimburser)
        let fkBillTypeResult=await billTypeDbOperation.findById(doc.billType)*!/
        //同时执行，尽快得到结果
        let [fkReimburserResult,fkBillTypeResult]=await Promise.all([employeeDbOperation.findById(doc.reimburser),billTypeDbOperation.findById(doc.billType)])
        //对结果的检查还是顺序的
        if(null===fkReimburserResult.msg){
            return res.json(returnResult(pageError.bill.reimburserNotExist))
        }
        if(null===fkBillTypeResult.msg){
            return res.json(returnResult(pageError.bill.billTypeNotExist))
        }

        if(fkReimburserResult.msg && fkReimburserResult.msg._id){
            if(fkReimburserResult.msg._id.toString() !== doc.reimburser.toString()){
                // return res.json(returnResult(pageError.employee.departmentNotExist))
                return res.json(pageError.bill.reimburserNotExist)
            }
        }

        if(fkBillTypeResult.msg && fkBillTypeResult.msg._id){
            if(fkBillTypeResult.msg._id.toString() !== doc.billType.toString()){
                // return res.json(returnResult(pageError.employee.departmentNotExist))
                return res.json(pageError.bill.billTypeNotExist)
            }
        }
    }*/


    let result=await billDbOperation.create(arrayResult)

    //console.log(` inserted result ${JSON.stringify(result)}`)
    return res.json(returnResult(result))
}

bill['remove']=async function (req,res,next){
    //1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.bill,true,maxFieldNum.bill)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    //console.log(`id is ${id}`)
    let result=await billDbOperation.remove(id)
    //console.log(`db op result is ${result}`)

    return res.json(returnResult(result))
}

bill['update']=async function (req,res,next){
    //1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.bill,true,maxFieldNum.bill)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    // console.log(`update sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)

    //3. 检查可能的外键（billType/reimburser）
    if(convertedResult.billType){
        let fkBillTypeResult=await checkIdExist(coll.billType,coll.bill,'billType',convertedResult.billType)
        if(fkBillTypeResult.rc>0){
            return res.json(returnResult(fkBillTypeResult))
        }
    }
    if(convertedResult.reimburser){
        // console.log(`san result is ${JSON.stringify(sanitizedInputValue)}`)
        let fkReimburserResult=await checkIdExist(coll.employee,coll.bill,'reimburser',convertedResult.reimburser)
        // console.log(`check result is ${JSON.stringify(fkReimburserResult)}`)
        if(fkReimburserResult.rc>0){
            return res.json(returnResult(fkReimburserResult))
        }
    }


    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //4， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id


    let result=await billDbOperation.update(id,convertedResult)
    //console.log(`db op result is ${result}`)

    return res.json(returnResult(result))
}

bill['readAll']=async function (req,res,next){
    let result=await billDbOperation.readAll()
    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(returnResult(result))
    //return JSON.stringify(result)
}

//bill无需提供title
/*bill['readName']=async function (req,res,next){
    let recorder
    if(req.params.name){
        console.log(`name is ${req.params.name}`)
        let constructedValue={name:{value:req.params.name}}
        let validateResult=await miscFunc.validate.checkSearchValue(constructedValue,inputRule.billType)
        if(validateResult['name']['rc']>0){
            return res.json(validateResult['name'])
        }
        recorder=await billTypeDbOperation.readName(req.params.name)
    }else{
        recorder=await billTypeDbOperation.readName()
    }

    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(returnResult(recorder))
}*/



module.exports={
    common,
    debug,
    user,
    department,
    employee,
    billType,
    bill,
}