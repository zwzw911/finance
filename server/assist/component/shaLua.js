/**
 * Created by wzhan039 on 2016-09-23.
 */
/*
*  把redis的Lua脚本sha化，存入内存
*  单独一个文件，容易调试
* */
'use strict'
require("babel-polyfill");
require("babel-core/register")
var asyncFs=require('../wrapAsync/node/wrapAsyncNode').asyncFs
var ioredisError=require('../../define/error/redisError').redisError.cmdError
var ioredisClient=require('../../model/redis/connection/redis_connection').ioredisClient

//将文件的 内容 sha化
function shaFileContent(scriptContent){
    return new Promise(function(resolve,reject){
        ioredisClient.script('load',scriptContent,(err,sha)=>{
            if(err){reject(ioredisError.shaFail())}
            resolve(sha)
        })
    })
}

async function shaSingleFile(file){
    // let fileExist=await asyncFs.asyncIsDir(file)
    // console.log(fileExist)
    // fileExist.then((v)=>console.log(v),(e)=>console.log(e))

    let content=await asyncFs.asyncReadFile(file)
    // console.log(content)
    let sha=await shaFileContent(content)
    return sha
}

async function shaLuaFileOrDir(path){
    let allShaResult={}
    let singleShaResult=''
    let isDir,isFile
    isDir=await asyncFs.asyncIsDir(path)
    if(isDir){
        let dirContent=await asyncFs.asyncReadDir(path)
        for(let singleFileDir of dirContent){
            //需要提供路径（目录+文件名）
            let tmpFileDir=`${path}/${singleFileDir}`
            isFile=await asyncFs.asyncIsFile(tmpFileDir)
            if(isFile){
                singleShaResult=await shaSingleFile(tmpFileDir)
                allShaResult[tmpFileDir]=singleShaResult
                // console.log(tmpFileDir+':'+singleShaResult)
                continue
            }
            isDir=await asyncFs.asyncIsDir(tmpFileDir)
            if(isDir){
                let dirResult=await shaLuaFileOrDir(tmpFileDir)
                for(let key in dirResult){
                    allShaResult[key]=dirResult[key]
                }
            }
        }
    }
    return allShaResult
}

module.exports={
    shaSingleFile,
    shaLuaFileOrDir,
}
