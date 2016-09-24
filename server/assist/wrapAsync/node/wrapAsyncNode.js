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
    },
    asyncReadFile(file){
        return new Promise(function(resolve,reject){
            fs.readFile(file,(err,data)=>{
                if(err){reject(error.fs.readFileFail(file))}
                resolve(data)
            })
        })

    },
    asyncReadDir(path){
        return new Promise(function(resolve,reject){
            fs.readdir(path,(err,data)=>{
                if(err){reject(error.fs.readFDirFail(path))}
                resolve(data)
            })
        })
    },
    asyncIsFile(file){
        return new Promise(function(resolve,reject){
            fs.lstat(file,(err,stats)=>{
                // console.log(file);
                if(err){reject(error.fs.fstatFail(file))}
                // console.log(stats);
                resolve(stats.isFile())
            })
        })
    },
    asyncIsDir(dir){
        return new Promise(function(resolve,reject){
            fs.lstat(dir,(err,stats)=>{
                if(err){reject(error.fs.fstatFail(dir))}
                resolve(stats.isDirectory())
            })
        })
    },
}

module.exports={
    asyncFs,
}
