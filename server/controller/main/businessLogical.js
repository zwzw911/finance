/**
 * Created by wzhan039 on 2017-05-02.
 * 用来处理业务逻辑
 */
'use strict'
var e_coll=require('../../define/enum/node').coll

var BlError=require('../../define/error/businessLogicalError').businessLogicalError

var unifiedModel=require("../../model/mongo/unifiedModel")

var dbModel=require("../../model/mongo/common/structure").model

//create时候的业务逻辑
/*var BlCreate=async function({recorderInfo,coll}){
    switch(coll){
        //如果是父字段（没有parentBillType），那么必须无inOut；如果有，必须有。即parentBillType和inOut是同时有无
        case e_coll.billType:
            if(!recorderInfo['parentBillType'] && recorderInfo['inOut']){
                return Promise.reject(BlError.create.billType.parentBillypeCantContainInOut)
            }
            if(recorderInfo['parentBillType'] && !recorderInfo['inOut']){
                return Promise.reject(BlError.create.billType.childBillypeMustContainInOut)
            }
            break;
        case e_coll.bill:
            /!*                      patch(如果是对bill进行操作，则要检查billType是否合格：即有inOut)               *!/
            // if(collEnum.bill===currentColl){
                let billTypeValid=await unifiedModel.checkBillTypeOkForBill({dbModel:dbModel.billType,id:recorderInfo['billType']['value']})
                if(false===billTypeValid.msg){
                    return Promise.reject(BlError.create.bill.billTypeInCorrect)
                }
                // console.log(`billTypeValid is ${JSON.stringify(billTypeValid)}`)
            // }
            break;
    }

    return {rc:0}
}*/


//update时候的业务逻辑
var BlCreateUpdate=async function({recorderInfo,recorderId,coll,ifCreate}){
    switch(coll){
        //如果是父字段（没有parentBillType），那么必须无inOut；如果有，必须有。即parentBillType和inOut是同时有无
        case e_coll.billType:


            let tobeCheckFields={}
            let fieldsToBeCheck=['parentBillType','inOut']
            //create，直接读取redorderInfo中的值
            if(ifCreate){
                for(let field of fieldsToBeCheck){
                    tobeCheckFields[field]=recorderInfo[field]
                }
            }
            //将要update和原始记录的字段合并（因为update中某些字段无值，所以要去原始记录的值；同理，原始记录无值，则取update的值（如果有））
            else{
                let originalBillType=await unifiedModel.findById({'dbModel':dbModel[e_coll.billType],'id':recorderId})
// console.log(`originalBillType is ${JSON.stringify(originalBillType)}`)
// console.log(`recorderInfo is ${JSON.stringify(recorderInfo)}`)
                for(let field of fieldsToBeCheck){
                    //update有值(包括null)，取update
// console.log(`field is ${field}`)
// console.log(`recorderInfo[field] is ${JSON.stringify(recorderInfo[field])}`)
                    if(undefined!==recorderInfo[field] && undefined!==recorderInfo[field]['value']){
                        tobeCheckFields[field]=recorderInfo[field]['value']
                    }
                    //update无值，但原始有值，取原始
                    else{
// console.log(`originalBillType['msg'][field] is ${JSON.stringify(originalBillType['msg'][field])}`)
                        if(undefined!==originalBillType['msg'][field]){
                            tobeCheckFields[field]=originalBillType['msg'][field]
                        }
                    }
                }
            }

// console.log(`tobeCheckFields['parentBillType'] is ${JSON.stringify(tobeCheckFields['parentBillType'])}`)
// console.log(`tobeCheckFields['inOut'] is ${JSON.stringify(tobeCheckFields['inOut'])}`)
            //此处需要同时检查undefined和null
            if(!tobeCheckFields['parentBillType'] && tobeCheckFields['inOut']){
                return Promise.reject(BlError.createUpdate.billType.parentBillTypeCantContainInOut)
            }
            if(tobeCheckFields['parentBillType'] && !tobeCheckFields['inOut']){
                return Promise.reject(BlError.createUpdate.billType.childBillTypeMustContainInOut)
            }
            break;
        case e_coll.bill:
            /*                      patch(如果是对bill进行操作，则要检查billType是否合格：即有inOut)               */
            // if(collEnum.bill===currentColl){
            //create：billType必定存在；update：可能存在
// console.log(``)
            if(recorderInfo['billType'] && recorderInfo['billType']['value']){
                let billTypeValid=await unifiedModel.checkBillTypeOkForBill({dbModel:dbModel.billType,id:recorderInfo['billType']['value']})
                if(false===billTypeValid.msg){
                    return Promise.reject(BlError.createUpdate.bill.billTypeInCorrect)
                }
            }

            // console.log(`billTypeValid is ${JSON.stringify(billTypeValid)}`)
            // }
            break;
    }

    return {rc:0}
}
module.exports={
    BlCreateUpdate,
    // BlUpdate,
}