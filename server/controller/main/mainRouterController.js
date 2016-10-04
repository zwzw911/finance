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


var billTypeDbOperation=require('../../model/mongo/billTypeModel')
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
async function sanityInput(originalInputValue,basedOnInputValue){
    //1. 将post/put上来的数据（可能是字符或者其他格式）转换成Object，返回{rc:0,msg:{values}}
    let convertedInput=await inputDataFormatValidate(originalInputValue)
    if(convertedInput.rc>0){
        //return res.json(miscFunc.formatRc(convertedInput))
        return convertedInput
    }
    //2. 检查转换后的输入是否正确，结果是每个字段都有一个返回值。{name:{rc:0},parent:{rc:0}}
    let checkResult=await validate.checkInput(convertedInput.msg,inputRule.billType,basedOnInputValue)

    for(let singleField in checkResult){
        if(checkResult[singleField].rc>0){
/*            miscFunc.formatRc(checkResult[singleField])
            return res.json(checkResult[singleField])*/
            return checkResult[singleField]
        }
    }
    return convertedInput
}
/*********************  billType  *******************************/
let billType={}

billType['create']=async function create(req,res,next){
    let sanitizedInputValue=await sanityInput(req.body.values,false)
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


module.exports={
    common,
    billType,
}