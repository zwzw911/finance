/**
 * Created by wzhan039 on 2016-09-30.
 * 因为expressjs的router只能支持callback，所有将所有的router处理都单独通过一个async函数处理，然后直接返回promise给router调用，
 *
 * 拆分辅助函数，合并路由函数（几个coll的路由过程都是类似的）
 */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")
var mongooseErrorHandler=require('../../define/error/mongoError').mongooseErrorHandler
var mongooseOpEnum=require('../../define/enum/node').mongooseOp

var appSetting=require('../../config/global/appSetting')
var paginationSetting=require('../../config/global/globalSettingRule').paginationSetting

var suggestLimit=require('../../config/global/globalSettingRule').suggestLimit

// var inputRule=require('../../define/validateRule/inputRule').inputRule //验证全部在routerControllerHelper中完成
var dataConvert=require('../../assist/dataConvert')
//为了直接调用validateSingleSearchFieldValue
var validateValue=require('../../assist/validateInput/validateValue')
//readname中直接使用
var validateFormat=require('../../assist/validateInput/validateFormat')
// var validateFunc=require('../../assist/not_used_validateFunc').func
//var miscFunc=require('../../assist/misc')
// var validate=validateFunc.validate
var checkInterval=require('../../assist/misc').checkInterval
var consoleDebug=require('../../assist/misc').consoleDebug

/*                      error               */
var pageError=require('../../define/error/pageError')
var validateError=require('../../define/error/node/validateError').validateError
/*                      model               */
/*var departmentdbModel=require('../../model/mongo/departmentModel')
var employeedbModel=require('../../model/mongo/employeeModel')
var billTypedbModel=require('../../model/mongo/billTypeModel')
var billdbModel=require('../../model/mongo/billModel')*/

var structure=require('../../model/mongo/common/structure')
var unifiedModel=require('../../model/mongo/unifiedModel')
// import * as unifiedModel from '../../model/mongo/unifiedModel'
//var fkAdditionalFields=require('../../model/mongo/not_used_fkAdditionalFieldsModel')

/*                      func                   */
var populateSingleDoc=require('../../assist/misc').populateSingleDoc
// import * as  unifiedHelper from './unifiedRouterControllerHelper'
var unifiedHelper=require('./routerControllerHelper')
/*                      regex               */
var collEnum=require('../../define/enum/node').coll
/*                      enum                */
// var nodeEnum=require('../../define/enum/node')
var envEnum=require('../../define/enum/node').env

var e_validatePart=require('../../define/enum/validEnum').validatePart

var businessLogical=require("./businessLogical")
/*                      app special param           */
var maxFieldNum={
    department:3,//_id/name/parentDepartment
    employee:7,
    billType:4,
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

/*var dbModel={
    department:structure.departmentModel,
    billType:structure.billTypeModel,
    employee:structure.employeeModel,
    bill:structure.billModel,
}*/
var dbModel=structure.model
//var dbSchema=structure.schema

//console.log(`init dbmodel is ${JSON.stringify(dbModel.bill)}`)
//每个外键需要的冗余字段
var fkAdditionalFieldsConfig={
    department:{
        parentDepartment:{relatedColl:collEnum.department,nestedPrefix:'parentDepartmentFields',forSelect:'name',forSetValue:['name']}
    },
    employee:{
        leader:{relatedColl:collEnum.employee,nestedPrefix:'leaderFields',forSelect:'name',forSetValue:['name']},
        department:{relatedColl:collEnum.department,nestedPrefix:'departmentFields',forSelect:'name',forSetValue:['name']}
    },
    billType:{
        //冗余字段（nested）的名称：具体冗余那几个字段
        //parentBillType:此字段为外键，需要冗余字段
        //relatedColl：外键对应的coll
        //nestedPrefix： 冗余字段一般放在nested结构中
        //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
        parentBillType:{relatedColl:collEnum.billType,nestedPrefix:'parentBillTypeFields',forSelect:'name',forSetValue:['name']}
    },
    bill:{
        billType:{relatedColl:collEnum.billType,nestedPrefix:'billTypeFields',forSelect:'name inOut',forSetValue:['name','inOut']},
        reimburser:{relatedColl:collEnum.employee,nestedPrefix:'reimburserFields',forSelect:'name',forSetValue:['name']},

    },
}

//执行readName的时候，返回哪个字段作为_id的补充
var readNameField={
    bill:'title',
    billType:'name',
    department:'name',
    employee:'name',
}

//当显示给client时，那些field是需要skip的（一般冗余字段无需显示）
var skipFieldsShowInClient={
    department:["__v","dDate","parentDepartmentFields"],
    employee:["__v","dDate","leaderFields","departmentFields"],
    billType:["__v","dDate","parentBillTypeFields"],
    bill: ["__v","dDate","billTypeFields","reimburserFields"]
}

/*********************  user  ******************************
 * 操作的用户：只有创建和更新（密码）的操作，并且是在程序内部执行，而非client发起req
 * */
let user={}
user['create']=async function (req,res,next){

}

user['update']=async function (req,res,next){

}


/*process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging, throwing an error, or other logic here
});*/

/*********************   unified function  ******************************/
//coll: enum
var create=async function (req){
    // console.log(`chinese is 中文`)
    //  console.log(`before create san ${JSON.stringify(req.body.values)}`)
    //try{
    //1. 对输入进行检查，确保是合格的输入
    let reqBodyResult=validateFormat.validateReqBody(req.body)
    if(reqBodyResult.rc>0){
        return Promise.reject(reqBodyResult)
    }
    let sanitizedInputValue=unifiedHelper.sanityCUInput(req.body.values,true)
// console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        // returnResult(sanitizedInputValue)
        return Promise.reject(unifiedHelper.returnResult(sanitizedInputValue))
    }
    // console.log(`after sant ${sanitizedInputValue}`)
    let recorderInfo=req.body.values[e_validatePart.recorderInfo]
    let currentPage=req.body.values[e_validatePart.currentPage]
    let currentColl=req.body.values[e_validatePart.currentColl]
    //2. 对数据的业务逻辑进行检查(如果出错，直接reject返回main，所以无需获取结果)
    await businessLogical.BlCreateUpdate({recorderInfo:recorderInfo,coll:currentColl,ifCreate:true})
    // let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)

    let doc=dataConvert.convertCreateUpdateValueToServerFormat(req.body.values[e_validatePart.recorderInfo])
    // arrayResult.push(dataConvert.convertCreateUpdateValueToServerFormat(req.body.values[e_validatePart.recorderInfo]))
    // console.log(`after push ${sanitizedInputValue}`)
    //3 删除null或者空的字段（null说明字段为空，所以无需传入db
    // for(let doc of arrayResult){
    dataConvert.constructCreateCriteria(doc)
    // }
// console.log(`after construct is ${JSON.stringify(doc)}`)
    let collFkConfig=fkAdditionalFieldsConfig[currentColl]
    //4 检查外键是否存在，存在的，是否有对应的fkconfig，如果有，配置对应的冗余字段
    //遍历所有记录
    // for(let doc of arrayResult){
        //遍历所有的外键配置
        for(let singleFKFiled in collFkConfig){
            //当前doc中，对应的外键有值，则需要获得此外键对应的额外冗余字段
            if(true===singleFKFiled in doc){
                let fkColl=collFkConfig[singleFKFiled].relatedColl
                let fkId=doc[singleFKFiled]
                let nestedPrefix=collFkConfig[singleFKFiled]['nestedPrefix']
                let fkAdditionalFieldsArray=collFkConfig[singleFKFiled].forSetValue
                /*                let params={'dbModel':dbModel[fkColl],eCurrentColl:fkColl,fkFieldName:singleFKFiled,id:fkId}
                 //dbModel,eCurrentColl,fkFieldName,id
                 let result=await unifiedHelper.checkIdExist(params)*/
// console.log(`fkId is ${JSON.stringify(fkId)}`)
                let idExistResult=await unifiedModel.findById({'dbModel':dbModel[fkColl],'id':fkId})
                //console.log(`id exist result is ${JSON.stringify(idExistResult)}`)
                if(null===idExistResult.msg) {
                    return Promise.reject(pageError[currentColl][singleFKFiled + 'NotExist'])
                }




                doc[nestedPrefix]={}
                //将读取到的额外字段赋值给
                for(let field of fkAdditionalFieldsArray){
                    // console.log(`add field is ${field}`)
                    // console.log(`doc[nestedPrefix] is ${JSON.stringify(doc[nestedPrefix])}`)
                    // console.log(`idExistResult[field] is ${JSON.stringify(idExistResult[field])}`)
                    //需要转换成parentBillTypeFields.name的格式，因为是nested
                    // let tmpField='parentBillTypeFields.'+field
                    doc[nestedPrefix][field]=idExistResult['msg'][field]
                }
            }
        }
    // }
    // console.log(`after chech fk result is ${JSON.stringify(doc)}`)



   /* //4.5 如果外键存在，获得外键的额外字段

    for(let idx in arrayResult) {
        // console.log(`idx is ${idx}`)
        let doc = arrayResult[idx]
        console.log(`before get additional is ${JSON.stringify(doc)}`)
        let getFkResult=await unifiedHelper.getFkAdditionalFields(doc,fkConfig,dbModel)
        console.log(`getFkAdditionalFields rtesult is ${JSON.stringify(getFkResult)}`)
        if(getFkResult.rc>0){
            return Promise.reject(unifiedHelper.returnResult(getFkResult))
            //return res.json(getFkResult)
        }
    }
    console.log(`after get fk`)*/
    // console.log(`after get addational field ${JSON.stringify(arrayResult)}`)
    //console.log(`after get additional is ${JSON.stringify(arrayResult)}`)
    //5. 对db执行操作
    /*          采用insertmany，返回直接是否array        */
    //let tmp=await unifiedModel.create({'dbModel':dbModel[eCurrentColl],values:arrayResult})
    //let createResult=tmp.msg
    /*          采用save，返回是对象，需要push到array中      */
    // let createResult=[]
    let createResult=await unifiedModel.create({'dbModel':dbModel[currentColl],value:doc})
        // .catch(
        //     err=>{
        //         console.log(`err from model is ${JSON.stringify(tmp)}`)
        //     }
        // )
    // console.log(`tmp is ${JSON.stringify(tmp)}`)
    // createResult.push(tmp.msg)

    // console.log(`create result is ${JSON.stringify(createResult)}`)
    if(createResult.rc>0){
        return Promise.reject(unifiedHelper.returnResult(createResult))
    }
    let createDoc=createResult.msg
    //6 计算分页；根据currentPage获得返回的数据（根据currentPage的决定返回 a：currentPage＝1，返回单个添加完成的记录   b;currentPage>1，返回第一页的所有记录）
    //6.1 分页信息
    let calcPaginationResult,recorder=[],paginationInfo,searchParams={},newCurrentPage=1 //无论传入的currentPage是多少，最终计算分页，都要跳到第一页
    calcPaginationResult=await unifiedModel.calcPagination({'dbModel':dbModel[currentColl],'searchParams':searchParams,'pageSize':paginationSetting[currentColl]['pageSize'],'pageLength':paginationSetting[currentColl]['pageLength'],'currentPage':newCurrentPage})
    // console.log(`calc pagination result is ${JSON.stringify(calcPaginationResult)}`)
    if(calcPaginationResult.rc>0){
        return Promise.reject(calcPaginationResult)
    }
    paginationInfo=calcPaginationResult.msg
    // console.log(`paginationInfo is ${JSON.stringify(paginationInfo)}`)
    // console.log(`currentPage is ${JSON.stringify(currentPage)}`)
    //6.2 返回的数据
    //let recorder=result.msg.recorder
    //currentPage is 1，返回添加的记录
    if(1===currentPage){
        // console.log(`page=1, before populateSingleDoc result is ${JSON.stringify(result)}`)
        // console.log(`createResult[0] is ${JSON.stringify(createResult[0])}`)
        // console.log(`populateOpt[currentColl] is ${JSON.stringify(populateOpt[currentColl])}`)
        // console.log(`populatedFields[currentColl] is ${JSON.stringify(populatedFields[currentColl])}`)
        let result=await populateSingleDoc(createDoc,populateOpt[currentColl],populatedFields[currentColl])
        // console.log(`page=1, populateSingleDoc result is ${JSON.stringify(result)}`)
        if(result.rc>0){
            return Promise.reject( unifiedHelper.returnResult(result))
        }
        // console.log(`page=1 result is ${JSON.stringify(result)}`)
        //创建的记录压入数组（虽然只有一条记录，但是也用数组，以便前端统一处理日期格式）
        recorder.push(result.msg)
    }
    // console.log(`page=1 recorder is ${JSON.stringify(recorder)}`)
    //currentPage is 1，返回第一页的记录
    if(1<currentPage){
        //没有任何搜索条件（否则新添加的记录可能被搜索条件排除在外）
        // console.log(`convert search params id ${JSON.stringify(searchParams)}`)
        let result=await unifiedModel.search({'dbModel':dbModel[currentColl],populateOpt:populateOpt[currentColl],'searchParams':searchParams,'paginationInfo':paginationInfo})
        if(result.rc>0){
            return Promise.reject( unifiedHelper.returnResult(result))
        }
        recorder=result.msg
    }
    // console.log(`recorder is ${JSON.stringify(recorder)}`)

    //将recorder转换成object
    let clientRecorder=[]
    for(let  singleRecorder of recorder){
        let singleClientRecorder=dataConvert.convertToClient(singleRecorder,skipFieldsShowInClient[currentColl])
        clientRecorder.push(singleClientRecorder)
    }
    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    return Promise.resolve(unifiedHelper.returnResult({rc:0,msg:{'recorder':clientRecorder,'paginationInfo':paginationInfo}}))

}


var update=async function (req){
    //1 检查输入的参数，并作转换（如果是字符串）
    let reqBodyResult=validateFormat.validateReqBody(req.body)
    // console.log(`reqBodyResult is ${JSON.stringify(reqBodyResult)}`)
    if(reqBodyResult.rc>0){
        return Promise.reject(reqBodyResult)
    }
    let sanitizedInputValue=await unifiedHelper.sanityCUInput(req.body.values,false)
console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        return Promise.reject(unifiedHelper.returnResult(sanitizedInputValue))
    }
    let currentPage=req.body.values[e_validatePart.currentPage]
    let currentColl=req.body.values[e_validatePart.currentColl]
    let id=req.body.values[e_validatePart.recorderId]
    let recorderInfo=req.body.values[e_validatePart.recorderInfo]
    let fkConfig=fkAdditionalFieldsConfig[currentColl]
    //1.5. 对数据的业务逻辑进行检查(如果出错，直接reject返回main，所以无需获取结果)
    await businessLogical.BlCreateUpdate({recorderInfo:recorderInfo,recorderId:id,coll:currentColl,ifCreate:false})

    //2. 将client输入转换成server端的格式()
    // console.log(`before convert ${JSON.stringify(req.body.values)}`)
    let convertedResult=dataConvert.convertCreateUpdateValueToServerFormat(recorderInfo)
// console.log(`convert result is ${JSON.stringify(convertedResult)}`)
//     console.log(`fkConfig result is ${JSON.stringify(fkConfig)}`)
    //3 把null/空对象/数组/字符，放入$unset中，以便mongodb执行删除字段操作（但是现在采用findById然后save处理，而不是findByIdAndUpdate,所以无需转换了）
    //{field1:null,field2:xxx}======>{'$unset':{field1;any},field2:xxx}
    // dataConvert.constructUpdateCriteria(convertedResult,fkConfig)


// console.log(`after constructUpdateCriteria result is ${JSON.stringify(convertedResult)}`)


    // id现在单独放到一个part中，而不是凡在recorderInfo中了
    // delete convertedResult._id
    //3.5 检查是否出了id之外，就没有其他的字段了；如果是，不做操作，直接退出
    //无需检测，在validateFormat中，已经检查是否有字段了
/*    if(0===Object.keys(convertedResult).length){
        return Promise.reject(unifiedHelper.returnResult(pageError.common.noFieldToBeUpdate))
    }*/



    //5 上级不能设成自己，且在对应的coll中必须有记录存在
    //遍历当前coll的外键
    for(let singleFK in fkConfig){
        //如果外键对应的coll还是当前coll，那么此外键的值不能等于当前记录的ObjectId（如果是自联接，那么外键的值不能等于自己的objectId）
        if(currentColl===fkConfig[singleFK].relatedColl){
            if(id===convertedResult[singleFK]){
                //console.log(`fial filed is ${singleFK}CantBeSelf}`)
                return Promise.reject(unifiedHelper.returnResult(pageError[currentColl][`${singleFK}CantBeSelf`]))
            }
        }

        //外键的值有没有对应的记录
        if(null!==convertedResult[singleFK] && undefined!==convertedResult[singleFK]){
/*            let params={dbModel,eCurrentColl:fkConfig[singleFK].relatedColl,fkFieldName:singleFK,id:convertedResult[singleFK]}
            let result=await unifiedHelper.checkIdExist(params)*/
            let fkColl=fkAdditionalFieldsConfig[currentColl][singleFK].relatedColl
            let fkId=convertedResult[singleFK]
            let idExistResult=await unifiedModel.findById({'dbModel':dbModel[fkColl],'id':fkId})
            if(null===idExistResult.msg) {
                return Promise.reject(pageError[currentColl][singleFK + 'NotExist'])
            }
            // console.log(`fk result is ${JSON.stringify(result)}`)
/*            if(0<result.rc){
                // console.log('department fail')
                return res.json(unifiedHelper.returnResult(result))
            }*/
        }
    }
    // console.log(`fk exist check doen`)
    //7 如果外键存在，获得外键的额外字段
    // console.log(`convertedResult is ${JSON.stringify(convertedResult)}`)
    let getFkResult=await unifiedHelper.getFkAdditionalFields(convertedResult,fkConfig,dbModel)
    if(getFkResult.rc>0){
        return Promise.reject(getFkResult)
    }
    // console.log(`pass to update is ${JSON.stringify(convertedResult)}`)
    //7 执行update操作
    let result=await unifiedModel.update({'dbModel':dbModel[currentColl],updateOptions:updateOpt[currentColl],'id':id,values:convertedResult})
    // console.log(`result is ${JSON.stringify(result)}`)
/*    if(result.rc>0){
        return res.json(unifiedHelper.returnResult(result))
    }*/
    //null说明没有执行任何更新
    if(null===result.msg){
        return Promise.reject(unifiedHelper.returnResult(pageError[currentColl][`${currentColl}NotExists`]))
    }
    //8 执行可能的populate操作
    let populateResult=await populateSingleDoc(result.msg,populateOpt[currentColl],populatedFields[currentColl])
// console.log(`populateResult ${JSON.stringify(populateResult)}`)
    //将recorder转换成object
    // let clientRecorder=[]
    // for(let  singleRecorder of recorder){
    populateResult.msg=dataConvert.convertToClient(populateResult.msg,skipFieldsShowInClient[currentColl])
    // console.log(`singleClientRecorder ${JSON.stringify(singleClientRecorder)}`)
    //     clientRecorder.push(singleClientRecorder)
    // }
    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    return Promise.resolve(unifiedHelper.returnResult(populateResult))
}

/*        将readAll的功能合并进来（本质都是读取记录）。读记录的时候要考虑到分页，readAll和search合并成一个函数
 *   req中包含2个参数：currentPage和searchParam
 *           values:{currentPage:1,searchParams:{}}
 * */
var search=async function (req){
    // console.log(`dbmodel is ${JSON.stringify(dbModel[eCurrentColl].modelName)}`)
    //consoleDebug('search params is ',req.body.values)
// console.log(`search params is ${JSON.stringify(req.body.values)}`)
    let reqBodyResult=validateFormat.validateReqBody(req.body)
    // console.log(`reqBodyResultis ${JSON.stringify(reqBodyResult)}`)
    if(reqBodyResult.rc>0){
        return Promise.reject(reqBodyResult)
    }
    //传入全部fkConfig，具体使用哪个，在sanitySearchInput通过读取currentColl获得
    let sanitizedInputValue=unifiedHelper.sanitySearchInput(req.body.values,fkAdditionalFieldsConfig)
    // consoleDebug('santiy result is ',sanitizedInputValue)
    // console.log(`santiy result is ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        return Promise.reject(unifiedHelper.returnResult(sanitizedInputValue))
    }

    let currentPage=req.body.values[e_validatePart.currentPage]
    let currentColl=req.body.values[e_validatePart.currentColl]
    let clientSearchParams=req.body.values[e_validatePart.searchParams]

    let fkConfig=fkAdditionalFieldsConfig[currentColl]
    // console.log(   `before gen search `)
    let searchParams=dataConvert.genNativeSearchCondition(clientSearchParams,currentColl,fkConfig)
    consoleDebug('convert search params',searchParams)
    // console.log(`convert search params id ${JSON.stringify(searchParams)}`)
    //console.log(`current coll is ${JSON.stringify(dbModel[eCurrentColl])}`)
    let paginationInfo,result
    result=await unifiedModel.calcPagination({'dbModel':dbModel[currentColl],'searchParams':searchParams,'pageSize':paginationSetting[currentColl]['pageSize'],'pageLength':paginationSetting[currentColl]['pageLength'],'currentPage':currentPage})
    if(result.rc>0){
        return Promise.reject(result)
    }
    paginationInfo=result.msg
    consoleDebug('pagination is ',result.msg)
// console.log(`pagination is ${JSON.stringify(result.msg)}`)

    result=await unifiedModel.search({'dbModel':dbModel[currentColl],populateOpt:populateOpt[currentColl],'searchParams':searchParams,'paginationInfo':paginationInfo})
    if(result.rc>0){
        return Promise.reject(result)
    }
    let recorder=result.msg
    //let paginationInfo=result.msg.paginationInfo

    //将recorder转换成object
    let clientRecorder=[]
    for(let  singleRecorder of recorder){
        let singleClientRecorder=dataConvert.convertToClient(singleRecorder,skipFieldsShowInClient[currentColl])
        clientRecorder.push(singleClientRecorder)
    }
    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    return Promise.resolve(unifiedHelper.returnResult({rc:0,msg:{'recorder':clientRecorder,'paginationInfo':paginationInfo}}))
}

/*  删除一条记记录（设置dDate）
* 为了在client正确的模拟出删除的效果，需要在删除后重新计算 分页 信息，以便决定如何处理
* a. 如果 旧的当前页===新的当前页
*   a.1 如果总页数>新的当前页，则读取新的当前页的最后一条记录（给用户的感觉就是后一页的第一条记录填补到当前页了）
*   q.2 如果总页数===新的当前页，什么都不做（说明在最后一页上执行删除操作）
* b. 如果 旧的当前页>新的当前页，读取新的当前页的所有信息（删除的记录是最后一页的最后一条记录，删除后，需显示前一页的记录）
* c. 如果 旧的当前页<新的当前页，不可能发生的情况，需报错
* */
var remove=async function (req){
    let reqBodyResult=validateFormat.validateReqBody(req.body)
    if(reqBodyResult.rc>0){
        return Promise.reject(reqBodyResult)
    }
    //总体格式，包括URL中的参数和POST的参数结构
    //delete传参数的方式和get类似，只能放在URL中，为了复用sanityValue函数，需要将参数转换成{field:{value:'val'}}
    let inputResult={}
    // console.log(`delete params is ${JSON.stringify(req.body)}`)
    let checkResult=unifiedHelper.sanityDeleteValue(req.body.values,fkAdditionalFieldsConfig)
    // console.log(`delete check result is ${JSON.stringify(checkResult)}`)
    if(checkResult.rc>0){
        return Promise.reject(unifiedHelper.returnResult(checkResult))
    }

    //传入的参数赋值给变量
    let currentPage=req.body.values[e_validatePart.currentPage]
    let currentColl=req.body.values[e_validatePart.currentColl]
    let clientSearchParams=req.body.values[e_validatePart.searchParams]
    let id=req.body.values[e_validatePart.recorderId]

    let fkConfig=fkAdditionalFieldsConfig[currentColl]
    let searchParams=dataConvert.genNativeSearchCondition(clientSearchParams,currentColl,fkConfig)

/*    //检查POST的body中的参数(searchParams和currentPage)
    let fkConfig=fkAdditionalFieldsConfig[eCurrentColl]
    let sanitizedInputValue=unifiedHelper.sanitySearchInput(req.body.values,fkConfig,eCurrentColl,inputRule)
    // console.log(`santiy result is ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        return Promise.reject(unifiedHelper.returnResult(sanitizedInputValue))
    }*/

    //传入的参数赋值给变量
/*    let id=req.params.id
    let currentPage=req.body.values['currentPage']
    let clientSearchParams=req.body.values['searchParams']
    let searchParams=dataConvert.genNativeSearchCondition(clientSearchParams,eCurrentColl,fkConfig,inputRule)*/

    let result=await unifiedModel.remove({'dbModel':dbModel[currentColl],updateOptions:updateOpt[currentColl],'id':id})
    //console.log(`db op result is ${result}`)
    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    if(result.rc>0){
        return Promise.resolve(unifiedHelper.returnResult(result))
    }

    /*      计算删除后的分页信息，决定如何返回记录给客户端（尽量只返回必须的记录，节省资源）     */
    //重新计算 分页
    let newPagination=await unifiedModel.calcPagination({'dbModel':dbModel[currentColl],'searchParams':searchParams,'pageSize':paginationSetting[currentColl]['pageSize'],'pageLength':paginationSetting[currentColl]['pageLength'],'currentPage':currentPage})
    if(newPagination.rc>0){
        return Promise.reject(newPagination)
    }
    let newPaginationInfo=newPagination.msg
    let newCurrentPage=newPaginationInfo.currentPage

    // console.log(`newCUrrent page is ${newCurrentPage}`)
    // console.log(`oldCUrrent page is ${currentPage}`)
    // console.log(`calc paginationInfo is ${JSON.stringify(newPaginationInfo)}`)
    let finalResult={rc:0,msg:{'recorder':[],'paginationInfo':newPaginationInfo}} //返回的结果
    //* c. 如果 旧的当前页<新的当前页，不可能发生的情况，需报错
    if(currentPage<newCurrentPage) {
        return Promise.reject(pageError.common.newCurrentPageLargeThanOldCurrentPage)
    }
    //* a. 如果 旧的当前页===新的当前页
    if(currentPage===newCurrentPage) {
        //*   a.1 如果总页数>新的当前页，则读取新的当前页的最后一条记录（给用户的感觉就是后一页的第一条记录填补到当前页了）
        if(newPaginationInfo.totalPage>newCurrentPage){
            let skipNum=paginationSetting[currentColl]['pageSize']-1
            // console.log(`skip num is ${skipNum}`)
            let tmpResult=await unifiedModel.search({'dbModel':dbModel[currentColl],populateOpt:populateOpt[currentColl],'searchParams':searchParams,'paginationInfo':newPaginationInfo,readRecorderNum:1,skipRecorderNumInPage:skipNum})
            // console.log(`final result is ${JSON.stringify(finalResult)}`)
            if(tmpResult.rc>0){
                return Promise.reject(tmpResult)
            }
            finalResult.msg.recorder=tmpResult.msg
            //returnRecorder=result.msg
            //let lastRecorder=allRecorderInPage[0]
            //returnRecorder.push(lastRecorder)
        }
        //*   a.2 如果总页数===新的当前页，初始化返回结果（说明在最后一页上执行删除操作）
        if(newPaginationInfo.totalPage===newCurrentPage){
            return Promise.resolve(finalResult)
        }
    }
    //* b. 如果 旧的当前页>新的当前页，读取新的当前页的所有信息（删除的记录是最后一页的最后一条记录，删除后，需显示前一页的记录）
    if(currentPage>newCurrentPage){
        // console.log(`current>new Current in`)
        let tmpResult=await unifiedModel.search({'dbModel':dbModel[currentColl],populateOpt:populateOpt[currentColl],'searchParams':searchParams,'paginationInfo':newPaginationInfo})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
        finalResult.msg.recorder=tmpResult.msg
        //returnRecorder=result.msg
        //let lastRecorder=allRecorderInPage[0]
        //returnRecorder.push(lastRecorder)
    }

    return Promise.resolve(unifiedHelper.returnResult(finalResult))


    //let readAgainResult=await search({eCurrentColl,req,res})
    //return Promise.resolve(unifiedHelper.returnResult(readAgainResult))
}



/*var readName=async function  ({eCurrentColl,req,res}){
    let recorder
    //执行readName是，对哪个字段进行查找（一般是name，但是bill使用title）
    let nameField=readNameField[eCurrentColl]
    if(req.params[nameField]){
        // console.log(`name is ${req.params.name}`)
        let constructedValue={}
        constructedValue[nameField]={value:req.params[nameField]}


        // console.log(`constructedValue is ${JSON.stringify(constructedValue)}`)
        let validateResult= validateFunc.checkSearchValue(constructedValue,inputRule[eCurrentColl])
        // console.log(`validateResult value is ${validateResult}`)
        if(validateResult[nameField]['rc']>0){
            return Promise.reject(validateResult[nameField])
        }
        //console.log(`read name converted search value is ${JSON.stringify(constructedValue)}`)
        recorder=await unifiedModel.readName({'dbModel':dbModel[eCurrentColl],nameToBeSearched:constructedValue[nameField].value,recorderLimit:pageSetting[eCurrentColl]['limit'],'readNameField':nameField})
    }else{
        recorder=await unifiedModel.readName({'dbModel':dbModel[eCurrentColl],recorderLimit:pageSetting[eCurrentColl]['limit'],'readNameField':nameField})
    }

    //console.log(`db op result is ${JSON.stringify(result)}`)
//async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    return Promise.resolve(unifiedHelper.returnResult(recorder))
    //return JSON.stringify(result)
}*/

/*      采用POST的方式完成auto complete的功能         */
//传入参数的格式同inputValue，检查的格式同inputSearch（不用检查最大值）
var readName_old=async function  ({eCurrentColl,req,res}){
    // console.log(`read name req.body is ${JSON.stringify(req.body)}`)
    let fkConfig=fkAdditionalFieldsConfig[eCurrentColl]

    //1 检查格式
    //let formatCheckResult=validateFunc.validateInputFormat(req.body.values,inputRule[eCurrentColl],1)
    let formatCheckResult=validateFormat.validateRecorderInfoFormat(req.body.values,inputRule[eCurrentColl],1)
    // console.log(`format check result is ${JSON.stringify(formatCheckResult)}`)
    if(formatCheckResult.rc>0){
        return  Promise.reject(unifiedHelper.returnResult(formatCheckResult))
    }

    //提取数据。转换成mongodb能接受的格式
    let inputValue=req.body.values
    let coll=eCurrentColl  //根据coll决定使用哪个dbModel
    let inputValueFiledName=Object.keys(inputValue)[0]
    let inputValueFiledValue=inputValue[inputValueFiledName]['value']

    //如果是外键，coll根据外键决定
    if(true===inputValueFiledName in fkConfig){
        coll=fkConfig[inputValueFiledName]['relatedColl']
        inputValueFiledName=fkConfig[inputValueFiledName]['forSetValue'][0] //外键对应的记录的一个字段
    }



/*          检查调用 readName的Coll是否存在              */
    if(false===req.body.caller in collEnum ){
        return pageError.common.callerCollNotExist
    }
// console.log(`ready to read db`)
//     console.log(`db is ${coll}`)
//     console.log(`value is ${inputValueFiledValue}`)
    //console.log(`limit is ${JSON.stringify(pagi[coll]['limit'])}`)
    // console.log(`field is ${JSON.stringify(inputValueFiledName)}`)
    let recorder
    if(null!==inputValueFiledValue && undefined!==inputValueFiledValue && ''!==inputValueFiledValue){
        //  有值的情况下，检查搜索值是否正确（否则checkSingleSearchValue会报错）
        //  在readName中，如果为undefined/null/''，是读取所有记录（即null是valida的值）；而在普通的inputSearch中，undefined/null/''会报错
        let chineseName=inputRule[coll][inputValueFiledName]['chineseName']
        //inputValue原本为单个字符，为了复用validateSingleSearchFieldValue，转换成数组
        let valueCheckResult=validateValue.validateSingleElementValue(chineseName,inputValueFiledValue,inputRule[coll][inputValueFiledName])
        // console.log(   `value resuot is ${JSON.stringify(valueCheckResult)}`)
        //for(let singleFieldName in valueCheckResult){
            if(valueCheckResult['rc']>0){
                return Promise.reject(unifiedHelper.returnResult(valueCheckResult))
            }
        //}
        recorder=await unifiedModel.readName({'dbModel':dbModel[coll],nameToBeSearched:inputValueFiledValue,recorderLimit:suggestLimit[coll]['maxOptionNum'],'readNameField':inputValueFiledName,'callerColl':req.body.caller})
        //constructedValue[inputValueFiledName]=inputValue[inputValueFiledName]['value']
    }else{
        recorder=await unifiedModel.readName({'dbModel':dbModel[coll],recorderLimit:suggestLimit[coll]['maxOptionNum'],'readNameField':inputValueFiledName,'callerColl':req.body.caller})
    }
    // console.log(`read db result is ${JSON.stringify(recorder)}`)
    return Promise.resolve(unifiedHelper.returnResult(recorder))


}

/*      采用POST的方式完成auto complete的功能
*  任意时刻，要么选择全部，要么只根据关键字过滤name，所以虽然从语义上应该使用searchParams（空或者多个搜索值），但是实际上使用recorderInfo（任一时刻，只有空或者一个搜索值）的格式来搜索。
*
* params:
* 1. recorderInfo:{fieldXXX:{value:valYYY}}====>只是借用格式，语义上应该是searchParams
* 2.currentPage:Z       z为不大于10的整数
*
* step
* 1. check params format
* 2. check params value
* 3. check if field is fk, if fk, change coll to related coll
* 4. search
* */
//传入参数的格式同inputValue，检查的格式同inputSearch（不用检查最大值）
var filterFieldValue=async function  (req){
    //1. 检查filterFieldValue的格式（filterFieldValue和currentColl）
    let reqBodyResult=validateFormat.validateReqBody(req.body)
    if(reqBodyResult.rc>0){
        return Promise.reject(reqBodyResult)
    }
    let checkResult=unifiedHelper.sanityDeleteValue(req.body.values,fkAdditionalFieldsConfig)
    //console.log(`delete check result is ${JSON.stringify(checkResult)}`)
    if(checkResult.rc===validateError.validateValue.filterFieldValueOutRange){
        return Promise.resolve(unifiedHelper.returnResult([]))
    }
    if(checkResult.rc>0){
        return Promise.reject(unifiedHelper.returnResult(checkResult))
    }


    //2 获得currentColl以及查询参数
    let inputValue=req.body.values
    let currentColl=inputValue[e_validatePart.currentColl]
    let originalColl=inputValue[e_validatePart.currentColl]
    let filterFieldValue=inputValue[e_validatePart.filterFieldValue]
    let inputValueFiledName=Object.keys(filterFieldValue)[0]
    let inputValueFiledValue=filterFieldValue[inputValueFiledName]['value']
    let collFkConfig=fkAdditionalFieldsConfig[currentColl]


    //如果是外键，根据fkconfig查找到对应的coll和field（而不是在当前coll中查找附加字段后，再分组）
    if(true===inputValueFiledName in collFkConfig){
        currentColl=collFkConfig[inputValueFiledName]['relatedColl']
        inputValueFiledName=collFkConfig[inputValueFiledName]['forSetValue'][0] //外键对应的记录的一个字段
    }



/*    /!*          检查调用 readName的Coll是否存在              *!/
    if(false===req.body.caller in collEnum ){
        return pageError.common.callerCollNotExist
    }*/
// console.log(`ready to read db`)
//     console.log(`db is ${coll}`)
//     console.log(`value is ${inputValueFiledValue}`)
    //console.log(`limit is ${JSON.stringify(pagi[coll]['limit'])}`)
    // console.log(`field is ${JSON.stringify(inputValueFiledName)}`)
    let recorder
    if(null!==inputValueFiledValue && undefined!==inputValueFiledValue && ''!==inputValueFiledValue){
        //  有值的情况下，检查搜索值是否正确（否则checkSingleSearchValue会报错）
        //  在readName中，如果为undefined/null/''，是读取所有记录（即null是valida的值）；而在普通的inputSearch中，undefined/null/''会报错
/*        let chineseName=inputRule[coll][inputValueFiledName]['chineseName']
        //inputValue原本为单个字符，为了复用validateSingleSearchFieldValue，转换成数组
        let valueCheckResult=validateValue.validateSingleElementValue(chineseName,inputValueFiledValue,inputRule[coll][inputValueFiledName])
        // console.log(   `value resuot is ${JSON.stringify(valueCheckResult)}`)
        //for(let singleFieldName in valueCheckResult){
        if(valueCheckResult['rc']>0){
            return Promise.reject(unifiedHelper.returnResult(valueCheckResult))
        }*/
        //}
        recorder=await unifiedModel.readName({'dbModel':dbModel[currentColl],nameToBeSearched:inputValueFiledValue,recorderLimit:suggestLimit[currentColl]['maxOptionNum'],'readNameField':inputValueFiledName,'originalColl':originalColl})
        //constructedValue[inputValueFiledName]=inputValue[inputValueFiledName]['value']
    }else{
        recorder=await unifiedModel.readName({'dbModel':dbModel[currentColl],recorderLimit:suggestLimit[currentColl]['maxOptionNum'],'readNameField':inputValueFiledName,'originalColl':originalColl})
    }
    // console.log(`read db result is ${JSON.stringify(recorder)}`)
    return Promise.resolve(unifiedHelper.returnResult(recorder))


}

/*var readAll=async function ({eCurrentColl,req,res}){
    let result=await unifiedModel.readAll({'dbModel':dbModel[eCurrentColl],populateOpt:populateOpt[eCurrentColl],recorderLimit:pageSetting[eCurrentColl]['limit']})
    let totalRecorderNum=result.length
    console.log(`read all recorder number is ${JSON.stringify(totalRecorderNum)}`)
    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    return Promise.resolve(unifiedHelper.returnResult(result))
}*/






//alldbModel:传入所有的dbModel，以便删除所有coll中的数据
var removeAll=async function (){
/*    console.log(`in`)
    console.log(`req is ${req}`)*/
    for(let singleDbModel in dbModel){
        //console.log(`singleDbModel is ${JSON.stringify(singleDbModel)}`)
        let result=await unifiedModel.removeAll({'dbModel':dbModel[singleDbModel]})
/*        try{
            let result=await unifiedModel.removeAll({'dbModel':dbModel[singleDbModel]})
        }
        catch(e){
            console.log(`remove all err is ${JSON.stringify(e)}`)
        }*/

        //console.log(`result is ${JSON.stringify(result)}`)
/*        if(result.rc>0){
            return res.json(unifiedHelper.returnResult(result))
        }*/
    }
    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    return Promise.resolve({rc:0})
// console.log(`req is ${JSON.stringify(req)}`)
/*    try{

    }catch(e){
        console.log(`remove all err is ${JSON.stringify(e)}`)
    }*/

}

/*                            统计信息                     */

/**         获得当前剩余资金        **/
var getCurrentCapital=async function({req,res}){
    let reqBodyResult=validateFormat.validateReqBody(req.body)
    if(reqBodyResult.rc>0){
        return Promise.reject(reqBodyResult)
    }
    console.log(`getCurrentCapital params is ${JSON.stringify(req.body.values)}`)
    // 获得统计数据
    let groupData=await unifiedModel.getCurrentCapital({eColl:collEnum.bill})
    console.log(`groupData is ${JSON.stringify(groupData)}`)
    //计算统计数据（根据billType的结构进行计算）
    let billTypeStructure=await getStaticBillType()
    if(0===billTypeStructure.length){
        return Promise.resolve({rc:0,msg:{structure:[],data:[]}})
    }
    console.log(`billTypeStructure  is ${JSON.stringify(billTypeStructure)}`)
    let dateTemplate=unifiedHelper.genDataStructureBaseOnBillType(billTypeStructure)
    console.log(`dateTemplate  is ${JSON.stringify(dateTemplate)}`)
    // 将数据放入template
    unifiedHelper.matchCurrentCaptialIntoTemplateArray(billTypeStructure,dateTemplate,groupData.msg)
    console.log(`after exec matchDataIntoTemplateArray ${JSON.stringify(dateTemplate)}`)
//billType的结构在和 当前资金额一起返回。因为结构和资金额都只需要在页面载入时执行一次即可
    return Promise.resolve({rc:0,msg:{structure:billTypeStructure,data:dateTemplate}})
}

/**         获得分组信息        **/
var getGroupCapital=async function({req,res}){
    //console.log(`getGroupCapital values is ${JSON.stringify(req.body.values)}`)
    //1 检测输入格式
    let rules=inputRule.staticQuery
    let sanitizedInputValue=unifiedHelper.sanityStaticQueryDate(req.body.values,rules)
    //console.log(`static santiy result is ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        return Promise.reject(unifiedHelper.returnResult(sanitizedInputValue))
    }

    let match={}
    if(true==='startDate' in req.body.values['searchParams']){
        if(false==='$and' in match){
            match['$and']=[]
        }
        let value={'cDate':{'$gt': req.body.values['searchParams']['startDate']}}
        match['$and'].push(value)
    }
    if(true==='endDate' in req.body.values['searchParams']){
        if(false==='$and' in match){
            match['$and']=[]
        }
        let value={'cDate':{'$gt': req.body.values['searchParams']['endDate']}}
        match['$and'].push(value)
    }

    let filterDeletedRecorder={'dDate':{'$exists':0}}
    if(false==='$and' in match){
        if(false==='$and' in match){
            match['$and']=[]
            match['$and'].push(filterDeletedRecorder)
        }

    }else{
        match=filterDeletedRecorder
    }
    // console.log(`static query match is ${JSON.stringify(match)}`)
    let groupData=await unifiedModel.getGroupCapital({dbModel:dbModel.bill,'match':match})

    let billTypeStructure=await getStaticBillType()
    let dataTemplate=unifiedHelper.genDataStructureBaseOnBillType(billTypeStructure)

    let result=unifiedHelper.matchGroupDataIntoTemplateArray(billTypeStructure,groupData.msg)
    return Promise.resolve({rc:0,msg:result.msg})
}

var getStaticBillType=async function(){
    // console.log(`getStaticBillType params is ${JSON.stringify(req.body.values)}`)

    let result=await unifiedModel.getStaticBillType()
    //删除没有子项的billType（其下没有任何inOut）
     result.forEach(
         (v,i)=>{
            //console.log(`v is ${JSON.stringify(v)}`)
            if(undefined===v || null===v){
                //console.log(`null index is ${i}`)
                result.splice(i,1)
            }
        }
    )
    return Promise.resolve(result)
}

module.exports= {
    create,
    update,
    search,
    remove,
    //readAll,
    // readName_old,
    filterFieldValue, //对字段的值进行过滤，输入值是{fiels:xxxx}或者{field:{fk:xxxxx}}

    removeAll,
    /*  统计信息    */
    getCurrentCapital,
    getGroupCapital,
    getStaticBillType,
}