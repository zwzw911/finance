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
//var fkAdditionalFields=require('../../model/mongo/not_used_fkAdditionalFieldsModel')

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
var populatedFields={
    department:['parentDepartment'],
    billType:['parentBillType'],
    employee:['leader','department'],
    bill:['reimburser','billType',''],
}
var populateOpt={
    department: {
        path: 'parentDepartment',//需要populate的字段
        select: 'name',//populate后，需要显示的字段
        match: {},//populate后，过滤字段(不符合这显示null)。一般不用
        options: {},//{sort:{name:-1}}
    },
    billType:{
        path:'parentBillType',//需要populate的字段
        select:'name',//populate后，需要显示的字段
        match:{},//populate后，过滤字段(不符合这显示null)。一般不用
        options:{},//{sort:{name:-1}}
    },
    employee:{
        path:'leader department',//需要populate的字段
        select:'name',//populate后，需要显示的字段
        match:{},//populate后，过滤字段(不符合这显示null)。一般不用
        options:{},//{sort:{name:-1}}
    },
    bill:{
        path:'billType  reimburser',//需要populate的字段
        select:'name',//populate后，需要显示的字段
        match:{},//populate后，过滤字段(不符合这显示null)。一般不用
        options:{},//{sort:{name:-1}}
    },
}

//每个外键需要的冗余字段
var fkAdditionalFieldsConfig={
    billType:{
        //冗余字段（nested）的名称：具体冗余那几个字段
        //parentBillType:此字段为外键，需要冗余字段
        //relatedColl：外键对应的coll
        //nestedPrefix： 冗余字段一般放在nested结构中
        //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
        parentBillType:{relatedColl:coll.billType,nestedPrefix:'parentBillTypeFields',forSelect:'name',forSetValue:['name']}
    }
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
     //console.log(`input value type is ${typeof originalInputValue}`)
    //console.log(`input value is ${JSON.stringify( originalInputValue)}`)
    //1. 检查post/put上来的数据是否为Object，返回{rc:0,msg:{values}}
    let dataValidateResult=await miscFunc.validateInputValue.checkInputDataValidate(originalInputValue)
    // console.log(`validate result is ${JSON.stringify(dataValidateResult)}`)
    if(dataValidateResult.rc>0){
        //return res.json(returnResult(convertedInput))
            return dataValidateResult
    }
    //2  检查是否为{field:{value:'xxxx'},field2:{value:'yyyy'}}）
    let dataFormatResult=await miscFunc.validateInputValue.checkInputDataFormat(originalInputValue)
    // console.log(`format result is ${JSON.stringify(dataFormatResult)}`)
    if(dataFormatResult.rc>0){
        return dataFormatResult
    }
    //3 检查字段数量
    let valueKeyResult=miscFunc.validateInputValue.checkInputValueKey(originalInputValue,maxFieldNum)
    // console.log(`key num result is ${JSON.stringify(valueKeyResult)}`)
    if(valueKeyResult.rc>0){
        return valueKeyResult
    }
    //4 检查是否有重复字段
    let duplicateResult=miscFunc.validateInputValue.checkInputValueDuplicateKey(originalInputValue)
    // console.log(`dup check result is ${duplicateResult}`)
    if(duplicateResult.rc>0){
        return duplicateResult
    }
    //5 检查输入值的内容是否正确
    let checkResult=await miscFunc.validateInputValue.checkInput(originalInputValue,inputRule,basedOnInputValue)
    //check result 为每个field返回一个{rc,msg}
/*    if(checkResult.rc>0){
        return checkResult
    }*/
     // console.log(`check input  result is ${JSON.stringify(checkResult)}`)
    for(let singleField in checkResult){
        if(checkResult[singleField].rc>0){
/*            returnResult(checkResult[singleField])
            return res.json(checkResult[singleField])*/
            //return checkResult[singleField]
            return {rc:99999,msg:checkResult}//返回全部检查结果，为了统一格式，设置一个非0的rc
        }
    }


    return {rc:0}
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
    //console.log(`findByID result is ${JSON.stringify(result)}`)
    if(null===result.msg){
        return pageError[currentColl][currentFkName+'NotExist']
    }else{
        return {rc:0}
    }
}

//从coll中，根据id查找到记录，然后返回其中的fields
//和checkIdExist使用同样的函数，目的是为了能让代码更加清晰
/*
* fkFieldName：需要获得冗余字段的外键名，主要为了产生 错误信息
* fkid：ObjectId
* fkColl：fk对应的coll
* fkAdditionalFields：需要哪些fk的冗余字段
* */
async function getAdditionalFields(fkFieldName,fkId,fkColl,fkAdditionalFields){
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
    let result=await dbOperation['findById'](fkId,fkAdditionalFields)
    //console.log(`findByID result is ${JSON.stringify(result)}`)
    if(null===result.msg){
        return pageError[fkColl][fkFieldName+'NotExist']
    }else{
        return {rc:0,msg:result.msg}
    }
}

//
//
/*
* 说明：根据外键，设置对应的冗余字段
* 输入参数：
* 1.singleDoc：当前要操作的doc（create或者update，从client输入的数据）
* 2. fkFieldsName：要添加冗余字段的外键名。数组（可能有多个fk）
* 3. fkColl：外键所在的coll（外键链接到的coll）
* 4. fkAdditionalConfig: 外键冗余字段的设置（已coll为单位进行设置，可能有多个fk），包括relatedColl(当前fk对应的coll)，nestedPrefix（外键冗余字段一般放在一个nested结构中，此结构的名称），forSelect：需要返回并设置的冗余字段（用在mongoose的查询中），forSetValue（在arrayResult中设置的字段名）
*
* 无返回值
* */
async function getFkAdditionalFields(doc,fkAdditionalConfig){

        for(let fkFieldName in fkAdditionalConfig){
            // console.log(`configed fk field name is ${fkFieldName}`)
            //如果文档中外键存在（例如，objectId存在）
            if(doc[fkFieldName]){
                //console.log(`configed fk  is ${doc[fkFieldName]}`)
                //console.log(`fk related coll is ${fkAdditionalConfig[fkFieldName]['relatedColl']}`)
                let nestedPrefix=fkAdditionalConfig[fkFieldName].nestedPrefix
                let fkAdditionalFields=await getAdditionalFields(fkFieldName,doc[fkFieldName],fkAdditionalConfig[fkFieldName]['relatedColl'],fkAdditionalConfig[fkFieldName].forSelect)
                 console.log(`get fk doc ${JSON.stringify(fkAdditionalFields)}`)
                if(fkAdditionalFields.rc>0){
                    return fkAdditionalFields
                }
                // console.log(`add result is ${JSON.stringify(fkAdditionalFields)}`)
                doc[nestedPrefix]={}
                //将读取到的额外字段赋值给
                for(let field of fkAdditionalConfig[fkFieldName].forSetValue){
                    // console.log(`add field is ${field}`)
                    //需要转换成parentBillTypeFields.name的格式，因为是nested
                    // let tmpField='parentBillTypeFields.'+field
                    doc[nestedPrefix][field]=fkAdditionalFields['msg'][field]
                }
            }
        }
return {rc:0}
        // console.log(`added result is ${JSON.stringify(doc)}`)

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
    //  console.log(`before san ${JSON.stringify(req.body.values)}`)
    //1. 对输入进行检查，确保是合格的输入
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.department,false,maxFieldNum.department)
    // console.log(`1st san ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        // returnResult(sanitizedInputValue)
        return res.json(returnResult(sanitizedInputValue))
    }
    //2. 数据加入数组采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)
    //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)
    arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values))

    //3 检查外键是否存在
    for(let doc of arrayResult){
        if(doc.parentDepartment){
            let result=await checkIdExist(coll.department,coll.department,'parentDepartment',doc.parentDepartment)
            // console.log(`fk result is ${JSON.stringify(result)}`)
            if(0<result.rc){
                // console.log('department fail')
                return res.json(returnResult(result))
            }
        }
    }
    //4 删除null的字段（null说明字段为空，所以无需传入db
    for(let doc of arrayResult){
        miscFunc.constructCreateCriteria(doc)
    }
    //5. 对db执行操作
    let result=await departmentDbOperation.create(arrayResult)
    if(result.rc>0){
            return res.json(result)
    }
    //6. 检查是否需要populate
    let populateResult=await miscFunc.populateSingleDoc(result.msg[0],populateOpt.department,populatedFields.department)

    return res.json(returnResult(populateResult))
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
    let convertedResult=miscFunc.convertClientValueToServerFormat(req.body.values)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    //console.log(`id is ${id}`)
    let result=await departmentDbOperation.remove(id)
    //console.log(`db op result is ${result}`)

    return res.json(returnResult(result))
}


department['update']=async function (req,res,next){
    //1 检查输入的参数，并作转换（如果是字符串）
    // console.log(`before sanity values is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.department,true,maxFieldNum.department)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式()
    // console.log(`before convert ${JSON.stringify(req.body.values)}`)
    let convertedResult=miscFunc.convertClientValueToServerFormat(req.body.values)
    // console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id
    //4 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
    miscFunc.constructUpdateCriteria(convertedResult)
    // console.log(`construct update is ${JSON.stringify(convertedResult)}`)
    //5 上级不能设成自己
    if(id===convertedResult.parentDepartment){
        return res.json(returnResult(pageError.department.parentCantBeSelf))
    }
    //6 如果inputValue中外键设置，检查是否在db中存在
    //检查外键是否存在

    if(null!==convertedResult.parentDepartment && undefined!==convertedResult.parentDepartment){
        let result=await checkIdExist(coll.department,coll.department,'parentDepartment',convertedResult.parentDepartment)
        // console.log(`fk result is ${JSON.stringify(result)}`)
        if(0<result.rc){
            // console.log('department fail')
            return res.json(returnResult(result))
        }
    }

    //7 执行update操作
    let result=await departmentDbOperation.update(id,convertedResult)
    if(result.rc>0){
        return res.json(returnResult(result))
    }
    //null说明没有执行任何更新
    if(null===result.msg){
        return res.json(returnResult(pageError.department.departmentNotExists))
    }
    //8 执行可能的populate操作
    let populateResult=await miscFunc.populateSingleDoc(result.msg,populateOpt.department,populatedFields.department)
    return res.json(returnResult(populateResult))
}

department['readAll']=async function (req,res,next){
    let result=await departmentDbOperation.readAll(populateOpt.department)
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
/*    try{    }catch(e){
        console.log(`check input error is ${e}`)
    }*/
    // console.log(`before san ${JSON.stringify(req.body.values)}`)
    //1. 对输入进行检查，确保是合格的输入
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.employee,false,maxFieldNum.employee)
     // console.log(`1st san ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 数据加入数组，采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)
    //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)
    arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values))
    //3 检查外键是否存在
    for(let doc of arrayResult){
        if(doc.department){

            let result=await checkIdExist(coll.department,coll.employee,'department',doc.department)
            // console.log(`fk result is ${JSON.stringify(result)}`)
            if(0<result.rc){
                // console.log('department fail')
                return res.json(returnResult(result))
            }
        }
        if(doc.leader){
            //checkIdExist()
            let result=await checkIdExist(coll.employee,coll.employee,'leader',doc.leader)
            // console.log(`fk result is ${JSON.stringify(result)}`)
            if(0<result.rc){
                // console.log('department fail')
                return res.json(returnResult(result))
            }
        }
    }
    //4 删除null的字段（null说明字段为空，所以无需传入db
    for(let doc of arrayResult){
        miscFunc.constructCreateCriteria(doc)
    }
    //5. 对db执行操作
    let result=await employeeDbOperation.create(arrayResult)
    if(result.rc>0){
        return res.json(result)
    }

    //6. 检查是否需要populate
    let populateResult=await miscFunc.populateSingleDoc(result.msg[0],populateOpt.employee,populatedFields.employee)

    return res.json(returnResult(populateResult))
}

employee['remove']=async function (req,res,next){
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.employee,true,maxFieldNum.employee)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(req.body.values)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    // console.log(`id is ${id}`)
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
    let convertedResult=miscFunc.convertClientValueToServerFormat(req.body.values)
    //3 提取数据
    let id=convertedResult._id
    delete convertedResult._id
    //4 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
    miscFunc.constructUpdateCriteria(convertedResult)
    //5 上级不能设成自己
    if(id===convertedResult.leader){
        return res.json(returnResult(pageError.employee.leaderCantBeSelf))
    }
    //6. 如果有外键，需要检测外键
    if(null!==convertedResult.department && undefined!==convertedResult.department ){
        let result=await checkIdExist(coll.department,coll.employee,'department',convertedResult.department)
        if(result.rc>0){
            return res.json(returnResult(result))
        }
    }
    if(null!==convertedResult.leader && undefined!==convertedResult.leader){
        //checkIdExist()
        let result=await checkIdExist(coll.employee,coll.employee,'leader',convertedResult.leader)
        // console.log(`fk result is ${JSON.stringify(result)}`)
        if(0<result.rc){
            // console.log('department fail')
            return res.json(returnResult(result))
        }
    }


    //7 执行db操作
    let result=await employeeDbOperation.update(id,convertedResult)
    // console.log(`update result is ${JSON.stringify(result)}`)
    if(result.rc>0){
        return res.json(returnResult(result))
    }
    //null说明没有执行任何更新
    if(null===result.msg){
        return res.json(returnResult(pageError.employee.employeeNotExists))
    }

// console.log(`employee update in`)
    //8 执行可能的populate操作
    let populateResult=await miscFunc.populateSingleDoc(result.msg,populateOpt.employee,populatedFields.employee)
    return res.json(returnResult(populateResult))
}

employee['readAll']=async function (req,res,next){
    let result=await employeeDbOperation.readAll(populateOpt.employee)
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

billType['create']=async function(req,res,next){
    //1. 对输入进行检查，确保是合格的输入
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.billType,false,maxFieldNum.billType)
    //console.log(`1st san ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }
    //2. 数据加入数组，采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
/*    console.log(`before sant ${sanitizedInputValue.msg}`)
    console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)*/
    arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values))
    //3 检查外键是否存在
    for(let doc of arrayResult){
        if(doc.parentBillType){
            let result=await checkIdExist(coll.billType,coll.billType,'parentBillType',doc.parentBillType)
            // console.log(`fk result is ${JSON.stringify(result)}`)
            if(0<result.rc){
                // console.log('department fail')
                return res.json(returnResult(result))
            }
        }
    }
    //4 删除null的字段（null说明字段为空，所以无需传入db
    for(let doc of arrayResult){
        miscFunc.constructCreateCriteria(doc)
    }

// console.log(`arr`)
    //4.5 如果外键存在，获得外键的额外字段
    // console.log(`config is ${JSON.stringify(fkAdditionalFieldsConfig.billType)}`)
    for(let idx in arrayResult) {
        // console.log(`idx is ${idx}`)
        let doc = arrayResult[idx]
        let getFkResult=await getFkAdditionalFields(doc,fkAdditionalFieldsConfig.billType)
        if(getFkResult.rc>0){
            return res.json(getFkResult)
        }
    }

    // console.log(`converted result is ${JSON.stringify(arrayResult)}`)

    //5. 对db执行操作
    let result=await billTypeDbOperation.create(arrayResult)
    if(result.rc>0){
        return res.json(result)
    }

    //6. 检查是否需要populate
    let populateResult=await miscFunc.populateSingleDoc(result.msg[0],populateOpt.billType,populatedFields.billType)

    return res.json(returnResult(populateResult))
}

billType['update']=async function(req,res,next){
    //1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await sanityInput(req.body.values,inputRule.billType,true,maxFieldNum.billType)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(req.body.values)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id
    //4 上级不能设成自己
    if(id===convertedResult.parentBillType){
        return res.json(returnResult(pageError.billType.parentCantBeSelf))
    }
    //console.log(`convertedResult is  ${JSON.stringify(convertedResult)}`)
    //console.log(`before get ${JSON.stringify(convertedResult)}`)
    //4.5 如果外键存在，获得外键的额外字段
    // console.log(`config is ${JSON.stringify(fkAdditionalFieldsConfig.billType)}`)
    let getFkResult=await getFkAdditionalFields(convertedResult,fkAdditionalFieldsConfig.billType)
    if(getFkResult.rc>0){
        return res.json(getFkResult)
    }
    //console.log(`after get ${JSON.stringify(convertedResult)}`)

    //5 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
    miscFunc.constructUpdateCriteria(convertedResult)
    // console.log(`after check null field ${JSON.stringify(convertedResult)}`)
    //6 检查外键是否存在
    if(null!==convertedResult.parentBillType && undefined!==convertedResult.parentBillType){
        let result=await checkIdExist(coll.billType,coll.billType,'parentBillType',convertedResult.parentBillType)
        // console.log(`fk result is ${JSON.stringify(result)}`)
        if(0<result.rc){
            // console.log('department fail')
            return res.json(returnResult(result))
        }
    }
    //7 执行db操作
    let result=await billTypeDbOperation.update(id,convertedResult)
    if(result.rc>0){
        return res.json(returnResult(result))
    }
    //null说明没有执行任何更新
    console.log(`billtype update is ${JSON.stringify(result)}`)
    if(null===result.msg){
        return res.json(returnResult(pageError.billType.billTypeNotExists))
    }
    //8 执行可能的populate操作
    // console.log(`db update result is ${JSON.stringify(result)}`)
    let populateResult=await miscFunc.populateSingleDoc(result.msg,populateOpt.billType,populatedFields.billType)
    return res.json(returnResult(populateResult))

    // return res.json(returnResult(result))
}


billType['remove']=async function(req,res,next){
    //对于delete，需要将参数转换成{field:{value:'val'}}
    let inputResult={}
    inputResult['_id']={value:req.params.id}
    //1 检查输入的参数，并作转换（如果是字符串）
    let sanitizedInputValue=await sanityInput(inputResult,inputRule.billType,true,maxFieldNum.billType)
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){

        return res.json(returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=miscFunc.convertClientValueToServerFormat(inputResult)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3 提取数据
    let id=convertedResult._id
    delete convertedResult._id
    // console.log(`id is ${id}`)
    let result=await billTypeDbOperation.remove(id)
    //console.log(`db op result is ${result}`)

    return res.json(returnResult(result))
}


billType['readAll']=async function(req,res,next){
    let result=await billTypeDbOperation.readAll(populateOpt.billType)
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
    //2 采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)
    //  console.log(`after sant ${miscFunc.convertClientValueToServerFormat(req.body.values)}`)
    arrayResult.push(miscFunc.convertClientValueToServerFormat(req.body.values))
    //3 检查外键是否存在
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

    //4 删除null的字段（null说明字段为空，所以无需传入db
    for(let doc of arrayResult){
        miscFunc.constructCreateCriteria(doc)
    }
    //5. 对db执行操作
    let result=await billDbOperation.create(arrayResult)
    if(result.rc>0){
        return res.json(result)
    }

    //6. 检查是否需要populate
    let populateResult=await miscFunc.populateSingleDoc(result.msg[0],populateOpt.bill,populatedFields.bill)

    return res.json(returnResult(populateResult))
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
    let convertedResult=miscFunc.convertClientValueToServerFormat(req.body.values)
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
    let convertedResult=miscFunc.convertClientValueToServerFormat(req.body.values)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id
    //4 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
    miscFunc.constructUpdateCriteria(convertedResult)
    //5. 检查可能的外键（billType/reimburser）
    if(convertedResult.billType){
        let fkBillTypeResult=await checkIdExist(coll.billType,coll.bill,'billType',convertedResult.billType)
        if(fkBillTypeResult.rc>0){
            return res.json(returnResult(fkBillTypeResult))
        }
    }
    if(null!==convertedResult.reimburser && undefined!==convertedResult.reimburser){
        // console.log(`san result is ${JSON.stringify(sanitizedInputValue)}`)
        let fkReimburserResult=await checkIdExist(coll.employee,coll.bill,'reimburser',convertedResult.reimburser)
        // console.log(`check result is ${JSON.stringify(fkReimburserResult)}`)
        if(fkReimburserResult.rc>0){
            return res.json(returnResult(fkReimburserResult))
        }
    }


    // console.log(`convert result is ${JSON.stringify(convertedResult)}`)


//6 执行db操作
    let result=await billDbOperation.update(id,convertedResult)
    if(result.rc>0){
        return res.json(returnResult(result))
    }
    //null说明没有执行任何更新
    if(null===result.msg){
        return res.json(returnResult(pageError.bill.billNotExist))
    }
    //7 执行可能的populate操作
    let populateResult=await miscFunc.populateSingleDoc(result.msg,populateOpt.bill,populatedFields.bill)
    return res.json(returnResult(populateResult))

    // return res.json(returnResult(result))
}

bill['readAll']=async function (req,res,next){
    let result=await billDbOperation.readAll(populateOpt.bill)
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