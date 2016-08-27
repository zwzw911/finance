/**
 * Created by ada on 2016/8/7.
 */
    /*全部使用reslove返回数据，便于调试，以及便于通过rc判断*/
var fs=require('fs')
var error=require('../../../define/error/asyncNodeError').asyncNodeError

var right={rc:0}

var asyncFs={
    asyncFileFolderExist(filePath){
        return new Promise(function(reslove,reject){
            fs.access(filePath,fs.F_OK,(err)=>{
                if(err){
                    reslove(error.fs.fileNotExist(filePath))
                }else{
                    reslove(right)
                }
            })
        })
    }
}

exports.asyncFunc={
    asyncFs,
}
