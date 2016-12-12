/**
 * Created by wzhan039 on 2016-09-30.
 * 因为expressjs的router只能支持callback，所有将所有的router处理都单独通过一个async函数处理，然后直接返回promise给router调用，
 *
 * 拆分辅助函数，合并路由函数（几个coll的路由过程都是类似的）
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var appSetting=require('../../config/global/appSetting')
var pageSetting=require('../../config/global/globalSettingRule').pageSetting

var inputRule=require('../../define/validateRule/inputRule').inputRule
var validateFunc=require('../../assist/validateFunc').func
//var miscFunc=require('../../assist/misc')
// var validate=validateFunc.validate
var checkInterval=require('../../assist/misc-compiled').checkInterval

/*                      error               */
var pageError=require('../../define/error/pageError')

/*                      model               */
/*var departmentdbModel=require('../../model/mongo/departmentModel')
var employeedbModel=require('../../model/mongo/employeeModel')
var billTypedbModel=require('../../model/mongo/billTypeModel')
var billdbModel=require('../../model/mongo/billModel')*/

var structure=require('../../model/mongo/common/structure-compiled')
var unifiedModel=require('../../model/mongo/unifiedModel')
// import * as unifiedModel from '../../model/mongo/unifiedModel'
//var fkAdditionalFields=require('../../model/mongo/not_used_fkAdditionalFieldsModel')

/*                      func                   */
var populateSingleDoc=require('../../assist/misc-compiled').populateSingleDoc
// import * as  unifiedHelper from './unifiedRouterControllerHelper'
var unifiedHelper=require('./unifiedRouterControllerHelper')
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

var updateOpt={
    department:{
        'new':true,//是否返回更新后的doc。默认false，返回原始doc。设为true，返回更新后的数据（给client）
        'select':'name parentDepartment cDate uDate', //返回哪些字段
        'upsert':false,//如果doc不存在，是否创建新的doc，默认false
        runValidators:false,//更新时是否执行validator。因为默写cavert，默认false
        setDefaultsOnInsert:false,//当upsert为true && 设为true，则插入文档时，使用default。
        'sort':'_id',//如果找到多个文档（应该不太可能），按照什么顺序选择第一个文档进行update。
    },
    billType:{
        'new':true,//是否返回更新后的doc。默认false，返回原始doc
        'select':'', //返回哪些字段
        'upsert':false,//如果doc不存在，是否创建新的doc，默认false
        runValidators:false,//更新时是否执行validator。因为默写cavert，默认false
        setDefaultsOnInsert:false,//当upsert为true && 设为true，则插入文档时，使用default。
        'sort':'_id',//如果找到多个文档（应该不太可能），按照什么顺序选择第一个文档进行update。
    },
    employee:{
        'new':true,//是否返回更新后的doc。默认false，返回原始doc。需要返回更新后的doc，所以设置为true
        'select':'', //返回哪些字段
        'upsert':false,//如果doc不存在，是否创建新的doc，默认false
        runValidators:false,//更新时是否执行validator。因为默写cavert，默认false
        setDefaultsOnInsert:false,//当upsert为true && 设为true，则插入文档时，使用default。
        'sort':'_id',//如果找到多个文档（应该不太可能），按照什么顺序选择第一个文档进行update。
    },
    bill:{
        'new':true,//是否返回更新后的doc。默认false，返回原始doc。设为true，返回更新后的数据（给client）
        'select':'', //返回哪些字段
        'upsert':false,//如果doc不存在，是否创建新的doc，默认false
        runValidators:false,//更新时是否执行validator。因为默写cavert，默认false
        setDefaultsOnInsert:false,//当upsert为true && 设为true，则插入文档时，使用default。
        'sort':'_id',//如果找到多个文档（应该不太可能），按照什么顺序选择第一个文档进行update。
        }
}

var dbModel={
    department:structure.departmentModel,
    billType:structure.billTypeModel,
    employee:structure.employeeModel,
    bill:structure.billModel,
}
//每个外键需要的冗余字段
var fkAdditionalFieldsConfig={
    department:{
        parentDepartment:{relatedColl:coll.department,nestedPrefix:'parentDepartmentFields',forSelect:'name',forSetValue:['name']}
    },
    employee:{
        leader:{relatedColl:coll.employee,nestedPrefix:'leaderFields',forSelect:'name',forSetValue:['name']},
        department:{relatedColl:coll.department,nestedPrefix:'departmentFields',forSelect:'name',forSetValue:['name']}
    },
    billType:{
        //冗余字段（nested）的名称：具体冗余那几个字段
        //parentBillType:此字段为外键，需要冗余字段
        //relatedColl：外键对应的coll
        //nestedPrefix： 冗余字段一般放在nested结构中
        //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
        parentBillType:{relatedColl:coll.billType,nestedPrefix:'parentBillTypeFields',forSelect:'name',forSetValue:['name']}
    },
    bill:{
        billType:{relatedColl:coll.billType,nestedPrefix:'billTypeFields',forSelect:'name',forSetValue:['name']},
        reimburser:{relatedColl:coll.employee,nestedPrefix:'reimburserFields',forSelect:'name',forSetValue:['name']},

    },
}

//执行readName的时候，返回哪个字段作为_id的补充
var readNameField={
    bill:'title',
    billType:'name',
    department:'name',
    employee:'name',
}
/*********************  user  ******************************
 * 操作的用户：只有创建和更新（密码）的操作，并且是在程序内部执行，而非client发起req
 * */
let user={}
user['create']=async function (req,res,next){

}

user['update']=async function (req,res,next){

}

/*********************   unified function  ******************************/
//coll: enum
var create=async function ({eCurrentColl,req,res}){
    // console.log(`chinese is 中文`)
    //  console.log(`before san ${JSON.stringify(req.body.values)}`)
    //1. 对输入进行检查，确保是合格的输入
    let sanitizedInputValue=await unifiedHelper.sanityInput(req.body.values,inputRule[eCurrentColl],false,maxFieldNum[eCurrentColl])
    // console.log(`1st san ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        // returnResult(sanitizedInputValue)
        return res.json(unifiedHelper.returnResult(sanitizedInputValue))
    }
    //2. 数据加入数组采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)
    //  console.log(`after sant ${validateFunc.convertClientValueToServerFormat(req.body.values)}`)
    arrayResult.push(validateFunc.convertClientValueToServerFormat(req.body.values))

    //3 检查外键是否存在
    //遍历所有记录
    for(let doc of arrayResult){
        //遍历所有的外键配置
        for(let singleFKFiled in fkAdditionalFieldsConfig[eCurrentColl]){
            //当前doc中，对应的外键有值，则需要获得此外键对应的额外冗余字段
            if(true===singleFKFiled in doc){
                let fkColl=fkAdditionalFieldsConfig[eCurrentColl][singleFKFiled].relatedColl
                let fkId=doc[singleFKFiled]
/*                let params={'dbModel':dbModel[fkColl],eCurrentColl:fkColl,fkFieldName:singleFKFiled,id:fkId}
                //dbModel,eCurrentColl,fkFieldName,id
                let result=await unifiedHelper.checkIdExist(params)*/

                let idExistResult=await unifiedModel.findById({'dbModel':dbModel[fkColl],'id':fkId})
                console.log(`id exist result is ${JSON.stringify(idExistResult)}`)
                if(null===idExistResult.msg) {
                    return pageError[eCurrentColl][singleFKFiled + 'NotExist']
                }
                // console.log(`fk result is ${JSON.stringify(result)}`)
/*                if(0<result.rc){
                    // console.log('department fail')
                    return res.json(unifiedHelper.returnResult(result))
                }*/
            }
        }
    }
    //4 删除null的字段（null说明字段为空，所以无需传入db
    for(let doc of arrayResult){
        validateFunc.constructCreateCriteria(doc)
    }
    //4.5 如果外键存在，获得外键的额外字段
    console.log(`before get additional is ${JSON.stringify(arrayResult)}`)
    for(let idx in arrayResult) {
        // console.log(`idx is ${idx}`)
        let doc = arrayResult[idx]
        let getFkResult=await unifiedHelper.getFkAdditionalFields(doc,fkAdditionalFieldsConfig[eCurrentColl],dbModel)
        if(getFkResult.rc>0){
            return res.json(unifiedHelper.returnResult(getFkResult))
            //return res.json(getFkResult)
        }
    }
    console.log(`after get additional is ${JSON.stringify(arrayResult)}`)
    //5. 对db执行操作
    let result=await unifiedModel.create({'dbModel':dbModel[eCurrentColl],values:arrayResult})
    if(result.rc>0){
        return res.json(unifiedHelper.returnResult(result))
        //return res.json(result)
    }
    //6. 检查是否需要populate
    let populateResult=await populateSingleDoc(result.msg[0],populateOpt[eCurrentColl],populatedFields[eCurrentColl])

    return res.json(unifiedHelper.returnResult(populateResult))
}


var update=async function ({eCurrentColl,req,res}){
    //1 检查输入的参数，并作转换（如果是字符串）
    // console.log(`before sanity values is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await unifiedHelper.sanityInput(req.body.values,inputRule[eCurrentColl],true,maxFieldNum[eCurrentColl])
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        return res.json(unifiedHelper.returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式()
    // console.log(`before convert ${JSON.stringify(req.body.values)}`)
    let convertedResult=validateFunc.convertClientValueToServerFormat(req.body.values)
    // console.log(`convert result is ${JSON.stringify(convertedResult)}`)

    //3， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id
    //3.5 检查是否出了id之外，就没有其他的字段了；如果是，不做操作，直接退出
    if(0===Object.keys(convertedResult).length){
        return res.json(unifiedHelper.returnResult(pageError.common.noFieldToBeUpdate))
    }

    //console.log(`after deleter id ${JSON.stringify(convertedResult)}`)
    //4 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
    validateFunc.constructUpdateCriteria(convertedResult)
    console.log(`construct update is ${JSON.stringify(convertedResult)}`)

    let fkConfig=fkAdditionalFieldsConfig[eCurrentColl]
    console.log(`fkconfig is ${JSON.stringify(fkConfig)}`)
    //5 上级不能设成自己，且在对应的coll中必须有记录存在
    //遍历当前coll的外键
    for(let singleFK in fkConfig){
        //如果外键对应的coll还是当前coll，那么此外键的值不能等于当前记录的ObjectId（如果是自联接，那么外键的值不能等于自己的objectId）
        if(eCurrentColl===fkConfig[singleFK].relatedColl){
            if(id===convertedResult[singleFK]){
                console.log(`fial filed is ${singleFK}CantBeSelf}`)
                return res.json(unifiedHelper.returnResult(pageError[eCurrentColl][`${singleFK}CantBeSelf`]))
            }
        }

        //外键的值有没有对应的记录
        if(null!==convertedResult[singleFK] && undefined!==convertedResult[singleFK]){
/*            let params={dbModel,eCurrentColl:fkConfig[singleFK].relatedColl,fkFieldName:singleFK,id:convertedResult[singleFK]}
            let result=await unifiedHelper.checkIdExist(params)*/
            let fkColl=fkAdditionalFieldsConfig[eCurrentColl][singleFK].relatedColl
            let fkId=convertedResult[singleFK]
            let idExistResult=await unifiedModel.findById({'dbModel':dbModel[fkColl],'id':fkId})
            if(null===idExistResult.msg) {
                return pageError[eCurrentColl][singleFK + 'NotExist']
            }
            // console.log(`fk result is ${JSON.stringify(result)}`)
/*            if(0<result.rc){
                // console.log('department fail')
                return res.json(unifiedHelper.returnResult(result))
            }*/
        }
    }

    //7 如果外键存在，获得外键的额外字段
    // console.log(`config is ${JSON.stringify(fkAdditionalFieldsConfig.department)}`)
    let getFkResult=await unifiedHelper.getFkAdditionalFields(convertedResult,fkConfig,dbModel)
    if(getFkResult.rc>0){
        return res.json(getFkResult)
    }

    //7 执行update操作
    let result=await unifiedModel.update({'dbModel':dbModel[eCurrentColl],updateOptions:updateOpt[eCurrentColl],'id':id,values:convertedResult})
    if(result.rc>0){
        return res.json(unifiedHelper.returnResult(result))
    }
    //null说明没有执行任何更新
    if(null===result.msg){
        return res.json(unifiedHelper.returnResult(pageError[eCurrentColl][`${eCurrentColl}NotExists`]))
    }
    //8 执行可能的populate操作
    let populateResult=await populateSingleDoc(result.msg,populateOpt[eCurrentColl],populatedFields[eCurrentColl])
    return res.json(unifiedHelper.returnResult(populateResult))
}

var remove=async function  ({eCurrentColl,req,res}){
    //delete传参数的方式和get类似，只能放在URL中，为了复用sanityValue函数，需要将参数转换成{field:{value:'val'}}
    let inputResult={}
    //console.log(`delete params is ${JSON.stringify(req.params.id)}`)
    let checkResult=validateFunc.validateDeleteInput(req.params.id)
    console.log(`delete check result is ${JSON.stringify(checkResult)}`)
    if(checkResult.rc>0){
        return res.json(unifiedHelper.returnResult(checkResult))
    }
    inputResult['_id']={value:req.params.id}
    //1 检查输入的参数，并作转换（如果是字符串）
    //console.log(`sanity result is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await unifiedHelper.sanityInput(inputResult,inputRule[eCurrentColl],true,maxFieldNum[eCurrentColl])
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        return res.json( unifiedHelper.returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式
    let convertedResult=validateFunc.convertClientValueToServerFormat(inputResult)
    //console.log(`convert result is ${JSON.stringify(convertedResult)}`)
    //3， 提取数据并执行操作
    let id=convertedResult._id
    //console.log(`id is ${id}`)
    let result=await unifiedModel.remove({'dbModel':dbModel[eCurrentColl],updateOptions:updateOpt[eCurrentColl],'id':id})
    //console.log(`db op result is ${result}`)

    return res.json(unifiedHelper.returnResult(result))
}

var readAll=async function ({eCurrentColl,req,res}){
    let result=await unifiedModel.readAll({'dbModel':dbModel[eCurrentColl],populateOpt:populateOpt[eCurrentColl],recorderLimit:pageSetting[eCurrentColl]['limit']})
    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(unifiedHelper.returnResult(result))
}

var readName=async function  ({eCurrentColl,req,res}){
    let recorder
    //执行readName是，对哪个字段进行查找（一般是name，但是bill使用title）
    let nameField=readNameField[eCurrentColl]
    if(req.params[nameField]){
        // console.log(`name is ${req.params.name}`)
        let constructedValue={}
        constructedValue[nameField]={value:req.params[nameField]}


        // console.log(`constructedValue is ${JSON.stringify(constructedValue)}`)
        let validateResult=await validateFunc.checkSearchValue(constructedValue,inputRule[eCurrentColl])
        // console.log(`validateResult value is ${validateResult}`)
        if(validateResult[nameField]['rc']>0){
            return res.json(validateResult[nameField])
        }
        console.log(`read name converted search value is ${JSON.stringify(constructedValue)}`)
        recorder=await unifiedModel.readName({'dbModel':dbModel[eCurrentColl],nameToBeSearched:constructedValue[nameField].value,recorderLimit:pageSetting[eCurrentColl]['limit'],'readNameField':nameField})
    }else{
        recorder=await unifiedModel.readName({'dbModel':dbModel[eCurrentColl],recorderLimit:pageSetting[eCurrentColl]['limit'],'readNameField':nameField})
    }

    //console.log(`db op result is ${JSON.stringify(result)}`)

    return res.json(unifiedHelper.returnResult(recorder))
    //return JSON.stringify(result)
}

var search=async function ({eCurrentColl,req,res}){
    let fkConfig=fkAdditionalFieldsConfig[eCurrentColl]
    let sanitizedInputValue=await unifiedHelper.sanitySearchInput(req.body.values,fkConfig,eCurrentColl,inputRule)
    // console.log(`santiy result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        return res.json(unifiedHelper.returnResult(sanitizedInputValue))
    }

    let searchParams=validateFunc.genNativeSearchCondition(req.body.values,eCurrentColl,fkConfig,inputRule)
    console.log(`convert search params id ${JSON.stringify(searchParams)}`)
    let recorder=await unifiedModel.search({'dbModel':dbModel[eCurrentColl],'searchParams':searchParams})

    return res.json(unifiedHelper.returnResult(recorder))
}

//alldbModel:传入所有的dbModel，以便删除所有coll中的数据
var removeAll=async function ({req,res}){
    console.log(`in`)
    console.log(`req is ${req}`)
// console.log(`req is ${JSON.stringify(req)}`)
    try{
        for(let singleDbModel in dbModel){
            console.log(`singleDbModel is ${JSON.stringify(singleDbModel)}`)
            let result=await unifiedModel.removeAll({'dbModel':dbModel[singleDbModel]})
            console.log(`result is ${JSON.stringify(result)}`)
            if(result.rc>0){
                return res.json(unifiedHelper.returnResult(result))
            }
        }
        return res.json({rc:0})
    }catch(e){
        console.log(e)
    }

}

module.exports= {
    create,
    update,
    remove,
    readAll,
    readName,
    search,
    removeAll,
}