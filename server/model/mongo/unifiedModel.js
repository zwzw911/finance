/**
 * Created by wzhan039 on 2016-12-09.
 * 因为几个coll的code有很多重复，所以合并放到一个文件
 */
/**
 * Created by Ada on 2016/9/28.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")

var dbModel=require('./common/structure').model

var mongooseErrorHandler=require('../../define/error/mongoError').mongooseErrorHandler

//var pageSetting=require('../../config/global/globalSettingRule').pageSetting
var pagination=require('../../assist/component/pagination').pagination

var mongooseOpEnum=require('../../define/enum/node').node.mongooseOp
//populate的选项
//read/update/read使用
// var populateOpt=
var updateOptions={
    'new':true,//是否返回更新后的doc。默认false，返回原始doc
    'select':'', //返回哪些字段
    'upsert':false,//如果doc不存在，是否创建新的doc，默认false
    runValidators:false,//更新时是否执行validator。因为默写cavert，默认false
    setDefaultsOnInsert:false,//当upsert为true && 设为true，则插入文档时，使用default。
    'sort':'_id',//如果找到多个文档（应该不太可能），按照什么顺序选择第一个文档进行update。
}

//无需返回任何paginationInfo，因为search已经返回，并存储在client端了
var create=async function ({dbModel,values}){
//使用Promise方式，以便catch可能的错误
    /*          原本使用insertMany，输入参数是数据，返回结果也是数据         */
/*    let result=await dbModel.insertMany(values).catch((err)=>{
        //console.log(`model err is ${JSON.stringify(err)}`)
        return  Promise.reject(mongooseErrorHandler(mongooseOpEnum.insertMany,err))
    })
    //result.name=undefined
    //console.log(`model result is ${JSON.stringify(modelResult)}`)
    return Promise.resolve({rc:0,msg:result})*/

    /*          为了使用mongoose的pre功能（为bill，判断正负），使用save保存         */
    let doc=new dbModel(values[0])
    let result=await doc.save(values[0]).catch((err)=>{
        //console.log(`model err is ${JSON.stringify(err)}`)
        return  Promise.reject(mongooseErrorHandler(mongooseOpEnum.insertMany,err))
    })
    //result.name=undefined
    //console.log(`model result is ${JSON.stringify(modelResult)}`)
    return Promise.resolve({rc:0,msg:result})
}

async function update({dbModel,updateOptions,id,values}){
    values['uDate']=Date.now()
    //console.log(`id is ${id}, values is ${JSON.stringify(values)}`)
    //无需执行exec返回一个promise就可以使用了？？？
/*    let result= await dbModel.findByIdAndUpdate(id,values,updateOptions).catch(
        (err)=>{
            return Promise.reject(mongooseErrorHandler(mongooseOpEnum.findByIdAndUpdate,err))
        }
    )
    //update成功，返回的是原始记录，需要转换成可辨认格式
    return Promise.resolve({rc:0,msg:result})*/

/*             使用传统的findById/set/save ,以便利用save middleware（bill的amount正负设置）     */
    let doc= await dbModel.findById(id).catch(
        (err)=>{
            return Promise.reject(mongooseErrorHandler(mongooseOpEnum.findByIdAndUpdate,err))
        }
    )
    //console.log(`update: oringal value is ${JSON.stringify(doc)}`)
    //console.log(`update: passed value is ${JSON.stringify(values)}`)
    //将values中的数据赋值给doc
    for(let field in values){
        //使用find/save的方式，为了不存储设为null的字段，需要设置字段为undefined（findByIdUpdate的话，把null字段放入$unset）
        if(null===values[field]){
           doc[field]=undefined
        }else{
            doc[field]=values[field]
        }

    }
//console.log(`update: after set value is ${JSON.stringify(doc)}`)
    let result=await doc.save().catch(
        (err)=>{
            return Promise.reject(mongooseErrorHandler(mongooseOpEnum.findByIdAndUpdate,err))
        }
    )
    //update成功，返回的是原始记录，需要转换成可辨认格式
    return Promise.resolve({rc:0,msg:result})

}

//根据Id删除文档（其实只是设置dData）
async function remove({dbModel,updateOptions,id}){
    //return new Promise(function(resolve,reject){
        let values={}
        values['dDate']=Date.now()
        let result= await dbModel.findByIdAndUpdate(id,values,updateOptions).catch(
            (err)=>{
                return Promise.reject(mongooseErrorHandler(mongooseOpEnum.findByIdAndUpdate,err))
            }
        )
    //只需返回是否执行成功，而无需返回update后的doc
        return Promise.resolve({rc:0})
/*        dbModel.findByIdAndUpdate(id,values,updateOptions,function(err,result){
            if(err){
                // console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }else{
                // console.log(`department insert result is ${JSON.stringify(result)}`)
                //resolve({rc:0,msg:result})
                //只需返回是否执行成功，而无需返回update后的doc
                resolve({rc:0})
            }

        })*/
    //})
}

//只做测试用
async  function removeAll({dbModel}){
    //console.log(`remove all in `)
    //return new Promise(function(resolve,reject){
        //remove放回一个promise
        await dbModel.remove({}).catch(
            function(err){
                return Promise.reject(mongooseErrorHandler(mongooseOpEnum.remove,err))
            }
        )
        return Promise.resolve({rc:0})
        /*dbModel.remove({},function(err,result){
            //reject( "manually raise remove all err")
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`success result is ${result}`)
            //remove成功，返回的是原始记录，需要转换成可辨认格式
            resolve({rc:0})
        })*/
    //})
}

/*async function readAll({dbModel,populateOpt,recorderLimit}){
    //return new Promise(function(resolve,reject){
        let condition={dDate:{$exists:false}}
        let selectField=null
        let option={}
        option.limit=recorderLimit
/!*        let result=await dbModel.find(condition,selectField,option).sort('cDate').populate(populateOpt)
        .catch(
            function(err){
                //console.log(`readall err is ${JSON.stringify(err)}`)
                return Promise.reject(mongooseErrorHandler(mongooseOpEnum.readAll,err))
            }
        )*!/
/!*    let query=dbModel.find(condition,selectField,option).sort('cDate')
    let count=await query.count()
    console.log(`count is ${JSON.stringify(count)}`)*!/
    let result=await dbModel.find(condition,selectField,option).sort('cDate').populate(populateOpt)
        .catch(
            function(err){
                console.log(`readall err is ${JSON.stringify(err)}`)
                return Promise.reject(mongooseErrorHandler(mongooseOpEnum.readAll,err))
            }
        )
        return Promise.resolve({rc:0,msg:result})
/!*        dbModel.find(condition,selectField,option).populate(populateOpt).exec(function (err,result) {
            if(err){
                // console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            resolve({rc:0,msg:result})
        })*!/
    //})
}*/

//readName主要是为suggestList提供选项，所以无需过滤被删除的记录（因为这些记录可能作为其他记录的外键存在）
//currentDb:在bill中选择billType时候，最上级的billType不能出现（因为这些billType只是用作统计用的）。因此需要添加这个参数，判断当前是否为bill
async function readName({dbModel,nameToBeSearched,recorderLimit,readNameField,callerColl}){
    //return new Promise(function(resolve,reject){
        //过滤标记为删除的记录
        // let condition={dDate:{$exists:false}}
        let condition={}
        if(undefined!==nameToBeSearched && ''!== nameToBeSearched.toString()){
            condition[readNameField]=new RegExp(nameToBeSearched,'i')
        }

        /*                 patch: 当前coll为bill的时候，billType只显示inOut有设置的记录                             */
        if('bill'===callerColl && 'billTypes'===dbModel.modelName) {
            condition['parentBillType'] = {'$exists': true}

        }
        /* ************************************************************************/


        console.log(`read name condition is ${JSON.stringify(condition)}`)
        //let selectField='name'?
        let option={}
        //option.limit=pageSetting.billType.limit
    //console.log(`read name condition is ${JSON.stringify(condition)}`)
        option.limit=recorderLimit
        let result = await dbModel.find(condition,readNameField,option)
            .catch(
                function(err){
                    return Promise.reject(mongooseErrorHandler(mongooseOpEnum.readName,err))
                }
            )
        return Promise.resolve({rc:0,msg:result})
/*        dbModel.find(condition,readNameField,option,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`success result is ${result}`)
            resolve({rc:0,msg:result})
        })*/
    //})
}

//作为外键时，是否存在
//selectedFields:'-cDate -uDate -dDate'
async function findById({dbModel,id,selectedFields='-cDate -uDate -dDate'}){
    let result=await dbModel.findById(id).catch(
        function(err){
/*            console.log(`findbyid errr is ${JSON.stringify(err)}`)
            console.log(`converted err is ${JSON.stringify(mongooseErrorHandler(mongooseOpEnum.findById,err))}`)*/
            return Promise.reject(mongooseErrorHandler(mongooseOpEnum.findById,err))
        }
    )
    return Promise.resolve({rc:0,msg:result})
}

/*
* readRecorderNum:在当前页上读取的记录数
* skipRecorderNumInPage：在当前页上跳过的记录数
* 以上2个参数可以为空，则读取指定页上的所有记录；设置的话，可以灵活的读取指定页的某些记录（主要是为了应用在remove操作中）
* */
async function search ({dbModel,populateOpt,searchParams,paginationInfo,readRecorderNum,skipRecorderNumInPage}) {
    //return new Promise(function(resolve,reject){
    //     console.log(`search in with params ${JSON.stringify(searchParams)}`)
    // searchParams['dDate']={'$exists':1}
    // console.log(`new search in with params ${JSON.stringify(searchParams)}`)
    let option={}

/*    //读取全部数据，不能有 limit
    let count=await dbModel.find(searchParams,'-dDate',option).exists('dDate',false).count()
    console.log(   `count is ${JSON.stringify(count)}`)
    let paginationInfo=pagination({'total':count,'currentPage':currentPage,'pageSize':pageSize,'pageLength':pageLength})*/

    //console.log(`readRecorderNumis ${readRecorderNum}`)
    //console.log(`skipRecorderNumInPage ${skipRecorderNumInPage}`)
    if(readRecorderNum){
        option.limit=readRecorderNum
    }else{
        option.limit=paginationInfo.pageSize
    }

    //当前页超过1，才计算skip，否则不用设置
    if(paginationInfo.currentPage>1){
        option.skip=(paginationInfo.currentPage-1)*paginationInfo.pageSize
        if(skipRecorderNumInPage){
            option.skip+=skipRecorderNumInPage
        }
    }
console.log(`search option is ${JSON.stringify(option)}`)
    //finalParams
    let result=await dbModel.find(searchParams,'-dDate',option).exists('dDate',false).sort('-cDate')
        .populate(populateOpt)   //populate外键，以便直接在client显示
    .catch(
        (err)=>{
            // console.log (`search err is ${JSON.stringify(err)}`)
            return Promise.reject(mongooseErrorHandler(mongooseOpEnum.search,err))
        }
    )
    //console.log(`find result is ${JSON.stringify(result)}`)
    return Promise.resolve({rc:0,msg:result})

/*        dbModel.find(searchParams,function(err,result){
            if(err){
                console.log(`db err is ${JSON.stringify(err)}`)
                resolve( mongooseErrorHandler(err))
            }
            console.log(`find result is ${JSON.stringify(result)}`)
            resolve({rc:0,msg:result})
        })*/
    //})
}


async function calcPagination({dbModel,searchParams,pageSize,pageLength,currentPage}){
    //console.log(   `searchParams is ${JSON.stringify(searchParams)}`)
    //console.log(   `pageSize is ${JSON.stringify(pageSize)}`)
    //console.log(   `pageLength is ${JSON.stringify(pageLength)}`)
    //console.log(   `currentPage is ${JSON.stringify(currentPage)}`)
    //读取全部数据，不能有 limit
    let count=await dbModel.find(searchParams,'-dDate').exists('dDate',false).count()
    //console.log(   `count is ${JSON.stringify(count)}`)
    let paginationInfo=pagination({'total':count,'currentPage':currentPage,'pageSize':pageSize,'pageLength':pageLength})
    //console.log(`calc paginationInfo is ${JSON.stringify(paginationInfo)}`)
    return Promise.resolve({rc:0,msg:paginationInfo})
}


//其实dbModel就是billModel，使用传参是为了防止在当前文件再次应用model文件
async function getCurrentCapital({eColl}){
    let restMount=await dbModel[eColl].aggregate([
        //{$match:match},//过滤出和条件的document
        // {$lookup:{localField:"billType",from:"billTypes",foreignField:"_id","as":"billTypeInfo"}},
        {$project:{'billType':1,"billTypeFields.name":1,amount:1}},//只读取必要的字段（而不是全部字段），进入下一阶段的聚合操作
        {$group:{"_id":{"billType":"$billType","name":"$billTypeFields.name"},'total':{$sum:"$amount"}}},
        {$sort:{"_id.year":1, "_id.month":1}},
    ])
    //console.log(`getCurrentCapital result is ${JSON.stringify(restMount)}`)
    return Promise.resolve({rc:0,msg:restMount})
}

async function getGroupCapital({dbModel,match}){
    console.log(`match in model is ${JSON.stringify(match)}`)
    let restMount=await dbModel.aggregate([
        {$match:match},//过滤出和条件的document
        // {$lookup:{localField:"billType",from:"billTypes",foreignField:"_id","as":"billTypeInfo"}},
        {$project:{'billType':1,"billTypeFields.name":1,cMonth:{"$month":"$cDate"},cYear:{"$year":"$cDate"},amount:1}},//只读取必要的字段（而不是全部字段），进入下一阶段的聚合操作
        //必须使用_id作为分组依据
        {$group:{"_id":{"billType":"$billType","name":"$billTypeFields.name",year:"$cYear",month:"$cMonth"},'total':{$sum:"$amount"}}},
        {$sort:{"_id.year":1, "_id.month":1}},
/*        {$project:{'billType':1,"billTypeFields.name":1,cMonth:{"$month":"$cDate"},cYear:{"$year":"$cDate"},amount:1}},//只读取必要的字段（而不是全部字段），进入下一阶段的聚合操作
        {$group:{"_id":{"billType":"$billType","name":"$billTypeFields.name",yearMonth:{$concat:["$cYear","-","$cMonth"]}},'total':{$sum:"$amount"}}},
        {$sort:{"_id.yearMonth":1}},*/
        // {$lookup:{localField:"_id",from:"billTypes",foreignField:"_id","as":"billTypeInfo"}},
    ])
    console.log(`getGroupCapital result is ${JSON.stringify(restMount)}`)
    return Promise.resolve({rc:0,msg:restMount})
}

/*      static的时候，获取需要统计的billType：1. 用来填充表格的thead  2. 用来获得统计数据的结构*/
async function getStaticBillType(){
    //获得顶层billType
    let billTypeResult=await dbModel.billType.find({"$and":[{"parentBillType":{"$exists":false}},{"inOut":{"$exists":false}}]},{"_id":1,"name":1}).lean()

    //如果有顶层billType，获得其子billType
    if(billTypeResult.length>0){
        let finalResult=billTypeResult.map(
            async (v,i)=>{
                let childType=await dbModel.billType.find({"$and":[{"parentBillType":v._id},{"inOut":{"$exists":true}}]},{"_id":1,"name":1}).lean()
                if(childType.length>0){
                    v.child=childType
                    //console.log(`childType is ${JSON.stringify(v)}`)
                    return v
                }
            }



        )
        return Promise.all(finalResult)
    }
}

/*  `             patch:   检测billType是否可以在bill中使用               */
async function checkBillTypeOkForBill({dbModel,id}){

        let findResult=await dbModel.find({
            "$and":[
                {"_id":id},
                {"parentBillType":{"$exists":true}},
                {"inOut":{"$exists":true}}
                ]
        }) //
/*    console.log(`checkBillTypeOkForBill result is ${JSON.stringify(findResult)}`)
        console.log(`checkBillTypeOkForBill count is ${findResult}`)*/
        let result= (findResult.length===0) ? false:true
        return Promise.resolve({rc:0,msg:result})


}



module.exports= {
    create,
    update,
    remove,
    removeAll,//测试用
    //readAll,
    readName,
    findById,
    search,
    calcPagination,//将pagination的功能从search中单独分离出来，以便给search的create复用
    /*      static      */
    getCurrentCapital,
    getGroupCapital,
    getStaticBillType,
    /*      patch， 检测billType是否可以在bill中使用（billType必须有parent，且inOut不为空）*/
    checkBillTypeOkForBill,
}