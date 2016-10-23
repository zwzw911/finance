/**
 * Created by Ada on 2016/10/22.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")


var mongooseErrorHandler=require('../define/error/mongoError').mongooseErrorHandler
//检测populateFields的字段是否有值，有进行populate，否则直接返回原始doc
var populateSingleDoc=function(singleDoc,populateOpt,populatedFields){
    return new Promise(function(resolve,reject){
        let populateFlag=false
        // let createdResult=singleDoc
        for(let singlePopulatedField of populatedFields){
            if(singleDoc[singlePopulatedField]){
                populateFlag=true
                break;
            }
        }
        // console.log(`department insert result is ${JSON.stringify(result)}`)
        if(populateFlag){
            singleDoc.populate(populateOpt,function(populateErr,populateResult){
                //console.log('create populate')
                if(populateErr){
                    //console.log(`department create fail: ${JSON.stringify(populateErr)}`)
                    resolve( mongooseErrorHandler(populateErr))
                }
                resolve({rc:0,msg:populateResult})
            })
        }else{
            resolve({rc:0,msg:singleDoc})
        }
    })

}

module.exports={
    populateSingleDoc,
}