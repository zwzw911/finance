/**
 * Created by wzhan039 on 2016-09-30.
 * 因为expressjs的router只能支持callback，所有将所有的router处理都单独通过一个async函数处理，然后直接返回promise给router调用，
 *
 */
var inputRule=require('../../define/validateRule/inputRule').inputRule
var miscFunc=require('../../assist/misc-compiled').func
var validate=miscFunc.validate
var checkInterval=miscFunc.checkInterval

/*                      error               */
var pageError=require('../../define/error/pageError')

var departmentDbOperation=require('../../model/mongo/departmentModel')
var employeeDbOperation=require('../../model/mongo/employeeModel')
var billTypeDbOperation=require('../../model/mongo/billTypeModel')
var billDbOperation=require('../../model/mongo/billModel')
/*********************  common  *******************************/
//1. checkInterval
async function common(req,res,next){
    let result=await checkInterval(req)
    return result
    //console.log(`mainController common result is ${result}`)
}

//判断传入的参数是否正确（只能接受object，字符要看能否转换成object）
function inputDataFormatValidate(values){
    if(false===miscFunc.dataTypeCheck.isObject(values) && false=== miscFunc.dataTypeCheck.isString(values)){
        return pageError.common.inputValuesFormatWrong
    }
    let result=values
    if(miscFunc.dataTypeCheck.isString(values)){
        try{
            result=JSON.parse(values)
        }
        catch(e){

            return pageError.common.inputValuesParseFail
        }
    }
    return {rc:0,msg:result}
}

//对create/update方法输入的value进行检查和转换（字符串的话）
//create:false     update:true
async function sanityInput(originalInputValue,inputRule,basedOnInputValue){
    //1. 将post/put上来的数据（可能是字符或者其他格式）转换成Object，返回{rc:0,msg:{values}}
    let convertedInput=await inputDataFormatValidate(originalInputValue)
// console.log(`fomat result is ${JSON.stringify(convertedInput)}`)
    if(convertedInput.rc>0){
        //return res.json(miscFunc.formatRc(convertedInput))
        return convertedInput
    }
    //2. 检查转换后的输入是否正确，结果是每个字段都有一个返回值。{name:{rc:0},parent:{rc:0}}
    // console.log(`inputRule is ${JSON.stringify(inputRule)}`)
    let checkResult=await validate.checkInput(convertedInput.msg,inputRule,basedOnInputValue)
    // console.log(`check input  result is ${JSON.stringify(checkResult)}`)
    for(let singleField in checkResult){
        if(checkResult[singleField].rc>0){
/*            miscFunc.formatRc(checkResult[singleField])
            return res.json(checkResult[singleField])*/
            return checkResult[singleField]
        }
    }
    return convertedInput
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
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.department,false)
    // console.log(`1st san ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        miscFunc.formatRc(sanitizedInputValue)
        return res.json(sanitizedInputValue)
    }
    //采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)
    //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)
    arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg))
    let result=await departmentDbOperation.create(arrayResult)
    miscFunc.formatRc(result)
    //console.log(` inserted result ${JSON.stringify(result)}`)

    return res.json(result)
}

department['remove']=async function (req,res,next){
    //1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.department,true)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        miscFunc.formatRc(sanitizedInputValue)
        return res.json(sanitizedInputValue)
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    //console.log(`id is ${id}`)
    let result=await departmentDbOperation.remove(id)
    //console.log(`db op result is ${result}`)
    miscFunc.formatRc(result)
    return res.json(result)
}


department['update']=async function (req,res,next){
//1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.department,true)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        miscFunc.formatRc(sanitizedInputValue)
        return res.json(sanitizedInputValue)
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id


    let result=await departmentDbOperation.update(id,convertedResult)
    //console.log(`db op result is ${result}`)
    miscFunc.formatRc(result)
    return res.json(result)
}

department['readAll']=async function (req,res,next){
    let result=await departmentDbOperation.readAll()
    //console.log(`db op result is ${JSON.stringify(result)}`)
    miscFunc.formatRc(result)
    return res.json(result)
}

department['readName']=async function (req,res,next){
    let recorder
    if(req.params.name){
        // console.log(`name is ${req.params.name}`)
        let constructedValue={name:{value:req.params.name}}
        let validateResult=await miscFunc.validate.checkSearchValue(constructedValue,inputRule.department)
        if(validateResult['name']['rc']>0){
            return res.json(validateResult['name'])
        }
        recorder=await departmentDbOperation.readName(req.params.name)
    }else{
        recorder=await departmentDbOperation.readName()
    }

    //console.log(`db op result is ${JSON.stringify(result)}`)
    miscFunc.formatRc(recorder)
    return res.json(recorder)
    //return JSON.stringify(result)
}


/*********************  employee  ******************************
 * 员工
 * */
let employee={}
employee['create']=async function (req,res,next){
    // console.log(`before san ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.employee,false)
    // console.log(`1st san ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        miscFunc.formatRc(sanitizedInputValue)
        return res.json(sanitizedInputValue)
    }
    //采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)
    //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)
    arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg))
    //检查外键是否存在
    for(let doc of arrayResult){
        let fkResult=await departmentDbOperation.findById(doc.department)
        console.log(`fk result is ${JSON.stringify(fkResult)}`)
        if(null===fkResult.msg){
            console.log(pageError.employee.departmentNotExist)
            miscFunc.formatRc(pageError.employee.departmentNotExist)
            console.log(pageError.employee.departmentNotExist)
            // return res.json(miscFunc.formatRc(pageError.employee.departmentNotExist))
            return res.json(pageError.employee.departmentNotExist)
        }

        if(fkResult.msg && fkResult.msg._id){
            if(fkResult.msg._id !==doc.department){
                return res.json(miscFunc.formatRc(pageError.employee.departmentNotExist))
            }
        }
    }
    let result=await employeeDbOperation.create(arrayResult)
    miscFunc.formatRc(result)
    //console.log(` inserted result ${JSON.stringify(result)}`)

    return res.json(result)
}

employee['remove']=async function (req,res,next){
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.employee,true)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        miscFunc.formatRc(sanitizedInputValue)
        return res.json(sanitizedInputValue)
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    //console.log(`id is ${id}`)
    let result=await employeeDbOperation.remove(id)
    //console.log(`db op result is ${result}`)
    miscFunc.formatRc(result)
    return res.json(result)
}

employee['update']=async function (req,res,next){
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.employee,true)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        miscFunc.formatRc(sanitizedInputValue)
        return res.json(sanitizedInputValue)
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id


    let result=await employeeDbOperation.update(id,convertedResult)
    //console.log(`db op result is ${result}`)
    miscFunc.formatRc(result)
    return res.json(result)
}

employee['readAll']=async function (req,res,next){
    let result=await employeeDbOperation.readAll()
    //console.log(`db op result is ${JSON.stringify(result)}`)
    miscFunc.formatRc(result)
    return res.json(result)
}

employee['readName']=async function (req,res,next){
    let recorder
    if(req.params.name){
        // console.log(`name is ${req.params.name}`)
        let constructedValue={name:{value:req.params.name}}
        let validateResult=await miscFunc.validate.checkSearchValue(constructedValue,inputRule.employee)
        if(validateResult['name']['rc']>0){
            return res.json(validateResult['name'])
        }
        recorder=await employeeDbOperation.readName(req.params.name)
    }else{
        recorder=await employeeDbOperation.readName()
    }

    //console.log(`db op result is ${JSON.stringify(result)}`)
    miscFunc.formatRc(recorder)
    return res.json(recorder)
    //return JSON.stringify(result)
}


/*********************  billType  *******************************/
let billType={}

billType['create']=async function create(req,res,next){
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.billType,false)
    //console.log(`1st san ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        miscFunc.formatRc(sanitizedInputValue)
        return res.json(sanitizedInputValue)
    }
    //采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
/*    console.log(`before sant ${sanitizedInputValue.msg}`)
    console.log(`after sant ${miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)}`)*/
    arrayResult.push(miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg))
    let result=await billTypeDbOperation.create(arrayResult)
    miscFunc.formatRc(result)
    //console.log(` inserted result ${JSON.stringify(result)}`)

    return res.json(result)
}

billType['update']=async function update(req,res,next){
    //1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.billType,true)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        miscFunc.formatRc(sanitizedInputValue)
        return res.json(sanitizedInputValue)
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id


    let result=await billTypeDbOperation.update(id,convertedResult)
    //console.log(`db op result is ${result}`)
    miscFunc.formatRc(result)
    return res.json(result)
}


billType['remove']=async function(req,res,next){
    //1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.department,true)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        miscFunc.formatRc(sanitizedInputValue)
        return res.json(sanitizedInputValue)
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(sanitizedInputValue.msg)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    //console.log(`id is ${id}`)
    let result=await billTypeDbOperation.remove(id)
    //console.log(`db op result is ${result}`)
    miscFunc.formatRc(result)
    return res.json(result)
}


billType['readAll']=async function(req,res,next){
    let result=await billTypeDbOperation.readAll()
    //console.log(`db op result is ${JSON.stringify(result)}`)
    miscFunc.formatRc(result)
    return res.json(result)
    //return JSON.stringify(result)
}

billType['readName']=async function(req,res,next){
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
    miscFunc.formatRc(recorder)
    return res.json(recorder)
    //return JSON.stringify(result)
}



/*********************  bill  ******************************
 * 部门
 * */
let bill={}
bill['create']=async function (req,res,next){

}

bill['remove']=async function (req,res,next){

}

bill['update']=async function (req,res,next){

}

bill['readAll']=async function (req,res,next){

}

bill['readName']=async function (req,res,next){

}



module.exports={
    common,
    user,
    department,
    employee,
    billType,
    bill,
}