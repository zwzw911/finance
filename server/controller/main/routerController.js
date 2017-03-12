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
var paginationSetting=require('../../config/global/globalSettingRule').paginationSetting

var suggestLimit=require('../../config/global/globalSettingRule').suggestLimit

var inputRule=require('../../define/validateRule/inputRule').inputRule
var dataConvert=require('../../assist/dataConvert')
//为了直接调用validateSingleSearchFieldValue
var validateValue=require('../../assist/validateInput/validateValue')
//readname中直接使用
var validateFormat=require('../../assist/validateInput/validateFormat')
// var validateFunc=require('../../assist/not_used_validateFunc').func
//var miscFunc=require('../../assist/misc')
// var validate=validateFunc.validate
var checkInterval=require('../../assist/misc').checkInterval

/*                      error               */
var pageError=require('../../define/error/pageError')

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
var collEnum=require('../../define/enum/node').node.coll
/*                      enum                */
var nodeEnum=require('../../define/enum/node').node
var envEnum=nodeEnum.env

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
var create=async function ({eCurrentColl,req,res}){
    // console.log(`chinese is 中文`)
     console.log(`before create san ${JSON.stringify(req.body.values)}`)
    //try{
    //1. 对输入进行检查，确保是合格的输入
    let sanitizedInputValue=unifiedHelper.sanityCUInput(req.body.values,inputRule[eCurrentColl],false,maxFieldNum[eCurrentColl])
    // console.log(`1st san ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        // returnResult(sanitizedInputValue)
        return Promise.reject(unifiedHelper.returnResult(sanitizedInputValue))
    }

    let currentPage=req.body.values['currentPage']

    //2. 数据加入数组采用insertMany，所有输入必须是数组
    let arrayResult=[]
    //从{name:{value:'11'}}====>{name:'11'}
    //     console.log(`before sant ${sanitizedInputValue.msg}`)
    //  console.log(`after sant ${validateFunc.convertClientValueToServerFormat(req.body.values)}`)
    arrayResult.push(dataConvert.convertCreateUpdateValueToServerFormat(req.body.values.recorderInfo))

    //3 删除null的字段（null说明字段为空，所以无需传入db
    for(let doc of arrayResult){
        dataConvert.constructCreateCriteria(doc)
    }
console.log(`after construct is ${JSON.stringify(arrayResult)}`)
    let fkConfig=fkAdditionalFieldsConfig[eCurrentColl]
    //4 检查外键是否存在
    //遍历所有记录
    for(let doc of arrayResult){
        //遍历所有的外键配置
        for(let singleFKFiled in fkConfig){
            //当前doc中，对应的外键有值，则需要获得此外键对应的额外冗余字段
            if(true===singleFKFiled in doc){
                let fkColl=fkConfig[singleFKFiled].relatedColl
                let fkId=doc[singleFKFiled]
                /*                let params={'dbModel':dbModel[fkColl],eCurrentColl:fkColl,fkFieldName:singleFKFiled,id:fkId}
                 //dbModel,eCurrentColl,fkFieldName,id
                 let result=await unifiedHelper.checkIdExist(params)*/

                let idExistResult=await unifiedModel.findById({'dbModel':dbModel[fkColl],'id':fkId})
                //console.log(`id exist result is ${JSON.stringify(idExistResult)}`)
                if(null===idExistResult.msg) {
                    return Promise.reject(pageError[eCurrentColl][singleFKFiled + 'NotExist'])
                }

            }
        }
    }

    /*                      patch(如果是对bill进行操作，则要检查billType是否合格：即有inOut)               */
    if(collEnum.bill===eCurrentColl){
        let billTypeValid=await unifiedModel.checkBillTypeOkForBill({dbModel:dbModel.billType,id:arrayResult[0]['billType']})
        if(false===billTypeValid.msg){
            return Promise.reject(pageError.bill.billTypeInCorrect)
        }
        // console.log(`billTypeValid is ${JSON.stringify(billTypeValid)}`)
    }

    //4.5 如果外键存在，获得外键的额外字段
    //console.log(`before get additional is ${JSON.stringify(arrayResult)}`)
    for(let idx in arrayResult) {
        // console.log(`idx is ${idx}`)
        let doc = arrayResult[idx]
        let getFkResult=await unifiedHelper.getFkAdditionalFields(doc,fkConfig,dbModel)
        if(getFkResult.rc>0){
            return Promise.reject(unifiedHelper.returnResult(getFkResult))
            //return res.json(getFkResult)
        }
    }
    console.log(`after get addational field ${JSON.stringify(arrayResult)}`)
    //console.log(`after get additional is ${JSON.stringify(arrayResult)}`)
    //5. 对db执行操作
    /*          采用insertmany，返回直接是否array        */
    //let tmp=await unifiedModel.create({'dbModel':dbModel[eCurrentColl],values:arrayResult})
    //let createResult=tmp.msg
    /*          采用save，返回是对象，需要push到array中      */
    let createResult=[]
    let tmp=await unifiedModel.create({'dbModel':dbModel[eCurrentColl],values:arrayResult})
    createResult.push(tmp.msg)

    console.log(`create result is ${JSON.stringify(createResult)}`)
    if(createResult.rc>0){
        return Promise.reject(unifiedHelper.returnResult(createResult))
    }

    //6 计算分页；根据currentPage获得返回的数据（根据currentPage的决定返回 a：currentPage＝1，返回单个添加完成的记录   b;currentPage>1，返回第一页的所有记录）
    //6.1 分页信息
    let calcPaginationResult,recorder=[],paginationInfo,searchParams={},newCurrentPage=1 //无论传入的currentPage是多少，最终计算分页，都要跳到第一页
    calcPaginationResult=await unifiedModel.calcPagination({'dbModel':dbModel[eCurrentColl],'searchParams':searchParams,'pageSize':paginationSetting[eCurrentColl]['pageSize'],'pageLength':paginationSetting[eCurrentColl]['pageLength'],'currentPage':newCurrentPage})
    console.log(`calc pagination result is ${JSON.stringify(calcPaginationResult)}`)
    if(calcPaginationResult.rc>0){
        return Promise.reject(calcPaginationResult)
    }
    paginationInfo=calcPaginationResult.msg

    //6.2 返回的数据
    //let recorder=result.msg.recorder
    //currentPage is 1，返回添加的记录
    if(1===currentPage){
        let result=await populateSingleDoc(createResult[0],populateOpt[eCurrentColl],populatedFields[eCurrentColl])
        if(result.rc>0){
            return Promise.reject( unifiedHelper.returnResult(result))
        }
        //创建的记录压入数组（前端统一处理日期格式）
        recorder.push(result.msg)
    }
    //currentPage is 1，返回第一页的记录
    if(1<currentPage){
        //没有任何搜索条件（否则新添加的记录可能被搜索条件排除在外）
        console.log(`convert search params id ${JSON.stringify(searchParams)}`)
        let result=await unifiedModel.search({'dbModel':dbModel[eCurrentColl],populateOpt:populateOpt[eCurrentColl],'searchParams':searchParams,'paginationInfo':paginationInfo})
        if(result.rc>0){
            return Promise.reject( unifiedHelper.returnResult(result))
        }
        recorder=result.msg
    }

    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    return Promise.resolve(unifiedHelper.returnResult({rc:0,msg:{'recorder':recorder,'paginationInfo':paginationInfo}}))

}


var update=async function ({eCurrentColl,req,res}){
    //1 检查输入的参数，并作转换（如果是字符串）
    // console.log(`before sanity values is ${JSON.stringify(req.body.values)}`)
    let sanitizedInputValue=await unifiedHelper.sanityCUInput(req.body.values,inputRule[eCurrentColl],true,maxFieldNum[eCurrentColl])
    //console.log(`sanity result is ${JSON.stringify(sanitizedInputValue)}`)
    //console.log(`update sanity result is ${sanitizedInputValue}`)
    if(sanitizedInputValue.rc>0){
        return Promise.reject(unifiedHelper.returnResult(sanitizedInputValue))
    }

    //2. 将client输入转换成server端的格式()
    // console.log(`before convert ${JSON.stringify(req.body.values)}`)
    let convertedResult=dataConvert.convertCreateUpdateValueToServerFormat(req.body.values['recorderInfo'])
     //console.log(`convert result is ${JSON.stringify(convertedResult)}`)

    //3， 提取数据并执行操作
    let id=convertedResult._id
    delete convertedResult._id
    //3.5 检查是否出了id之外，就没有其他的字段了；如果是，不做操作，直接退出
    if(0===Object.keys(convertedResult).length){
        return Promise.reject(unifiedHelper.returnResult(pageError.common.noFieldToBeUpdate))
    }

    let fkConfig=fkAdditionalFieldsConfig[eCurrentColl]
    //console.log(`after deleter id ${JSON.stringify(convertedResult)}`)

    /*          如果model采用findByIdupdate的方式，需要将value为null的字段放入$unset，以便在db中对应的doc删除字段        */
/*    //4 检查输入的更新字段中，是否有需要被删除的字段（设为null的字段）
    dataConvert.constructUpdateCriteria(convertedResult,fkConfig)*/
    /*          如果model采用find=>save的方式，无需对null字段操作，在model中直接将对应的字段值设为undefined即可        */

    //console.log(`construct update is ${JSON.stringify(convertedResult)}`)
    //console.log(`fkconfig is ${JSON.stringify(fkConfig)}`)

    //5 上级不能设成自己，且在对应的coll中必须有记录存在
    //遍历当前coll的外键
    for(let singleFK in fkConfig){
        //如果外键对应的coll还是当前coll，那么此外键的值不能等于当前记录的ObjectId（如果是自联接，那么外键的值不能等于自己的objectId）
        if(eCurrentColl===fkConfig[singleFK].relatedColl){
            if(id===convertedResult[singleFK]){
                //console.log(`fial filed is ${singleFK}CantBeSelf}`)
                return Promise.reject(unifiedHelper.returnResult(pageError[eCurrentColl][`${singleFK}CantBeSelf`]))
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
                return Promise.reject(pageError[eCurrentColl][singleFK + 'NotExist'])
            }
            // console.log(`fk result is ${JSON.stringify(result)}`)
/*            if(0<result.rc){
                // console.log('department fail')
                return res.json(unifiedHelper.returnResult(result))
            }*/
        }
    }
    //console.log(`fk exist check doen`)
    //7 如果外键存在，获得外键的额外字段
    // console.log(`convertedResult is ${JSON.stringify(convertedResult)}`)
    let getFkResult=await unifiedHelper.getFkAdditionalFields(convertedResult,fkConfig,dbModel)
    if(getFkResult.rc>0){
        return Promise.reject(getFkResult)
    }
    //console.log(`pass to update is ${JSON.stringify(convertedResult)}`)
    //7 执行update操作
    let result=await unifiedModel.update({'dbModel':dbModel[eCurrentColl],updateOptions:updateOpt[eCurrentColl],'id':id,values:convertedResult})
/*    if(result.rc>0){
        return res.json(unifiedHelper.returnResult(result))
    }*/
    //null说明没有执行任何更新
    if(null===result.msg){
        return Promise.reject(unifiedHelper.returnResult(pageError[eCurrentColl][`${eCurrentColl}NotExists`]))
    }
    //8 执行可能的populate操作
    let populateResult=await populateSingleDoc(result.msg,populateOpt[eCurrentColl],populatedFields[eCurrentColl])
    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    return Promise.resolve(unifiedHelper.returnResult(populateResult))
}


/*  删除一条记记录（设置dDate）
* 为了在client正确的模拟出删除的效果，需要在删除后重新计算 分页 信息，以便决定如何处理
* a. 如果 旧的当前页===新的当前页
*   a.1 如果总页数>新的当前页，则读取新的当前页的最后一条记录（给用户的感觉就是后一页的第一条记录填补到当前页了）
*   q.2 如果总页数===新的当前页，什么都不做（说明在最后一页上执行删除操作）
* b. 如果 旧的当前页>新的当前页，读取新的当前页的所有信息（删除的记录是最后一页的最后一条记录，删除后，需显示前一页的记录）
* c. 如果 旧的当前页<新的当前页，不可能发生的情况，需报错
* */
var remove=async function  ({eCurrentColl,req,res}){
    //总体格式，包括URL中的参数和POST的参数结构
    //delete传参数的方式和get类似，只能放在URL中，为了复用sanityValue函数，需要将参数转换成{field:{value:'val'}}
    let inputResult={}
    console.log(`delete params is ${JSON.stringify(req.params.id)}`)
    let checkResult=unifiedHelper.sanityDeleteValue(req.body.values,inputRule[eCurrentColl],true,maxFieldNum[eCurrentColl],req.params.id)
    //console.log(`delete check result is ${JSON.stringify(checkResult)}`)
    if(checkResult.rc>0){
        return Promise.reject(unifiedHelper.returnResult(checkResult))
    }

    //检查POST的body中的参数(searchParams和currentPage)
    let fkConfig=fkAdditionalFieldsConfig[eCurrentColl]
    let sanitizedInputValue=unifiedHelper.sanitySearchInput(req.body.values,fkConfig,eCurrentColl,inputRule)
    // console.log(`santiy result is ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        return Promise.reject(unifiedHelper.returnResult(sanitizedInputValue))
    }

    //传入的参数赋值给变量
    let id=req.params.id
    let currentPage=req.body.values['currentPage']
    let clientSearchParams=req.body.values['searchParams']
    let searchParams=dataConvert.genNativeSearchCondition(clientSearchParams,eCurrentColl,fkConfig,inputRule)

    let result=await unifiedModel.remove({'dbModel':dbModel[eCurrentColl],updateOptions:updateOpt[eCurrentColl],'id':id})
    //console.log(`db op result is ${result}`)
    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    if(result.rc>0){
        return Promise.resolve(unifiedHelper.returnResult(result))
    }

    /*      计算删除后的分页信息，决定如何返回记录给客户端（尽量只返回必须的记录，节省资源）     */
    //重新计算 分页
    let newPagination=await unifiedModel.calcPagination({'dbModel':dbModel[eCurrentColl],'searchParams':searchParams,'pageSize':paginationSetting[eCurrentColl]['pageSize'],'pageLength':paginationSetting[eCurrentColl]['pageLength'],'currentPage':currentPage})
    if(newPagination.rc>0){
        return Promise.reject(newPagination)
    }
    let newPaginationInfo=newPagination.msg
    let newCurrentPage=newPaginationInfo.currentPage

    console.log(`newCUrrent page is ${newCurrentPage}`)
    console.log(`oldCUrrent page is ${currentPage}`)
    console.log(`calc paginationInfo is ${JSON.stringify(newPaginationInfo)}`)
    let finalResult={rc:0,msg:{'recorder':[],'paginationInfo':newPaginationInfo}} //返回的结果
    //* c. 如果 旧的当前页<新的当前页，不可能发生的情况，需报错
    if(currentPage<newCurrentPage) {
        return Promise.reject(pageError.common.newCurrentPageLargeThanOldCurrentPage)
    }
    //* a. 如果 旧的当前页===新的当前页
    if(currentPage===newCurrentPage) {
        //*   a.1 如果总页数>新的当前页，则读取新的当前页的最后一条记录（给用户的感觉就是后一页的第一条记录填补到当前页了）
        if(newPaginationInfo.totalPage>newCurrentPage){
            let skipNum=paginationSetting[eCurrentColl]['pageSize']-1
            console.log(`skip num is ${skipNum}`)
            let tmpResult=await unifiedModel.search({'dbModel':dbModel[eCurrentColl],populateOpt:populateOpt[eCurrentColl],'searchParams':searchParams,'paginationInfo':newPaginationInfo,readRecorderNum:1,skipRecorderNumInPage:skipNum})
            console.log(`final result is ${JSON.stringify(finalResult)}`)
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
        console.log(`current>new Current in`)
        let tmpResult=await unifiedModel.search({'dbModel':dbModel[eCurrentColl],populateOpt:populateOpt[eCurrentColl],'searchParams':searchParams,'paginationInfo':newPaginationInfo})
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
var readName=async function  ({eCurrentColl,req,res}){
    console.log(`read name req.body is ${JSON.stringify(req.body)}`)
    let fkConfig=fkAdditionalFieldsConfig[eCurrentColl]

    //1 检查格式
    //let formatCheckResult=validateFunc.validateInputFormat(req.body.values,inputRule[eCurrentColl],1)
    let formatCheckResult=validateFormat.validateRecorderInfoFormat(req.body.values,inputRule[eCurrentColl],1)
    console.log(`format check result is ${JSON.stringify(formatCheckResult)}`)
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


    //return {rc:0}



/*    let sanitizedInputValue=unifiedHelper.sanityAutoCompleteInput(req.body.values,fkConfig,eCurrentColl,inputRule)
     console.log(`santiy result is ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){
        return Promise.reject(unifiedHelper.returnResult(sanitizedInputValue))
    }*/


    //let constructedValue={}
    // console.log(req.body.caller)
    // console.log(`coll is ${JSON.stringify(collEnum)}`)
/*          检查调用 readName的Coll是否存在              */
    if(false===req.body.caller in collEnum ){
        return pageError.common.callerCollNotExist
    }
console.log(`ready to read db`)
    console.log(`db is ${coll}`)
    console.log(`value is ${inputValueFiledValue}`)
    //console.log(`limit is ${JSON.stringify(pagi[coll]['limit'])}`)
    console.log(`field is ${JSON.stringify(inputValueFiledName)}`)
    let recorder
    if(null!==inputValueFiledValue && undefined!==inputValueFiledValue && ''!==inputValueFiledValue){
        //  有值的情况下，检查搜索值是否正确（否则checkSingleSearchValue会报错）
        //  在readName中，如果为undefined/null/''，是读取所有记录（即null是valida的值）；而在普通的inputSearch中，undefined/null/''会报错
        let chineseName=inputRule[coll][inputValueFiledName]['chineseName']
        //inputValue原本为单个字符，为了复用validateSingleSearchFieldValue，转换成数组
        let valueCheckResult=validateValue.validateSingleElementValue(chineseName,inputValueFiledValue,inputRule[coll][inputValueFiledName])
        console.log(   `value resuot is ${JSON.stringify(valueCheckResult)}`)
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
    console.log(`read db result is ${JSON.stringify(recorder)}`)
    return Promise.resolve(unifiedHelper.returnResult(recorder))


}



/*var readAll=async function ({eCurrentColl,req,res}){
    let result=await unifiedModel.readAll({'dbModel':dbModel[eCurrentColl],populateOpt:populateOpt[eCurrentColl],recorderLimit:pageSetting[eCurrentColl]['limit']})
    let totalRecorderNum=result.length
    console.log(`read all recorder number is ${JSON.stringify(totalRecorderNum)}`)
    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    return Promise.resolve(unifiedHelper.returnResult(result))
}*/

/*        将readAll的功能合并进来（本质都是读取记录）。读记录的时候要考虑到分页，readAll和search合并成一个函数
 *   req中包含2个参数：currentPage和searchParam
 *           values:{currentPage:1,searchParams:{}}
 * */
var search=async function ({eCurrentColl,req,res}){
    // console.log(`dbmodel is ${JSON.stringify(dbModel[eCurrentColl].modelName)}`)
console.log(`search params is ${JSON.stringify(req.body.values)}`)
    let fkConfig=fkAdditionalFieldsConfig[eCurrentColl]
    let sanitizedInputValue=unifiedHelper.sanitySearchInput(req.body.values,fkConfig,eCurrentColl,inputRule)
     console.log(`santiy result is ${JSON.stringify(sanitizedInputValue)}`)
    if(sanitizedInputValue.rc>0){

        return Promise.reject(unifiedHelper.returnResult(sanitizedInputValue))
    }

    let currentPage=req.body.values['currentPage']
    let clientSearchParams=req.body.values['searchParams']
    let searchParams=dataConvert.genNativeSearchCondition(clientSearchParams,eCurrentColl,fkConfig,inputRule)
    console.log(`convert search params id ${JSON.stringify(searchParams)}`)
    //console.log(`current coll is ${JSON.stringify(dbModel[eCurrentColl])}`)
    let paginationInfo,result
    result=await unifiedModel.calcPagination({'dbModel':dbModel[eCurrentColl],'searchParams':searchParams,'pageSize':paginationSetting[eCurrentColl]['pageSize'],'pageLength':paginationSetting[eCurrentColl]['pageLength'],'currentPage':currentPage})
    if(result.rc>0){
        return Promise.reject(result)
    }
    paginationInfo=result.msg
console.log(`pagination is ${JSON.stringify(result.msg)}`)

    result=await unifiedModel.search({'dbModel':dbModel[eCurrentColl],populateOpt:populateOpt[eCurrentColl],'searchParams':searchParams,'paginationInfo':paginationInfo})
    if(result.rc>0){
        return Promise.reject(result)
    }
    let recorder=result.msg
    //let paginationInfo=result.msg.paginationInfo

    //async中，所有调度的函数都必须是wait，以便返回一个promise对象；最终return的是一个函数，也必须是promise对象，否则会出错
    return Promise.resolve(unifiedHelper.returnResult({rc:0,msg:{'recorder':recorder,'paginationInfo':paginationInfo}}))
}




//alldbModel:传入所有的dbModel，以便删除所有coll中的数据
var removeAll=async function ({req,res}){
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
    // console.log(`getCurrentCapital params is ${JSON.stringify(req.body.values)}`)
    // 获得统计数据
    let groupData=await unifiedModel.getCurrentCapital({eColl:collEnum.bill})
    //console.log(`groupData is ${JSON.stringify(groupData)}`)
    //计算统计数据（根据billType的结构进行计算）
    let billTypeStructure=await getStaticBillType()
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
    remove,
    //readAll,
    readName,
    search,
    removeAll,
    /*  统计信息    */
    getCurrentCapital,
    getGroupCapital,
    getStaticBillType,
}