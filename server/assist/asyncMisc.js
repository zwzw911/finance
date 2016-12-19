/**
 * Created by wzhan039 on 2016-12-16.
 * async的函数单独放置
 */

/*var populateSingleDoc=function(singleDoc,populateOpt,populatedFields){
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

}*/

/*
var populateSingleDoc=function(singleDoc,populateOpt,populatedFields){
    //return new Promise(function(resolve,reject){
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
            singleDoc.populate(populateOpt).execPopulate()
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
    //})

}

module.exports={
    populateSingleDoc,
}*/
