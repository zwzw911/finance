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
var LuaError=require('../../define/error/redisError').redisError.LuaError
var ioredisClient=require('../../model/redis/connection/redis_connection').ioredisClient
var regex=require('../../define/regex/regex').regex

//将文件的 内容 sha化
function shaFileContent(scriptContent){
    return new Promise(function(resolve,reject){
        ioredisClient.script('load',scriptContent,(err,sha)=>{
            if(err){reject(ioredisError.shaFail())}
            resolve(sha)
        })
    })
}

//sha单个Lua脚本
async function shaSingleFile(file){
    // let fileExist=await asyncFs.asyncIsDir(file)
    // console.log(fileExist)
    // fileExist.then((v)=>console.log(v),(e)=>console.log(e))

    let content=await asyncFs.asyncReadFile(file)
    // console.log(content)
    let sha=await shaFileContent(content)
    return sha
}

//sha文件或者目录
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


//执行指定的Lua脚本(用于测试)
async function execLua(fileOrDir,fileTobeExec,params){
     //console.log(params)
    let shaResult=await shaLuaFileOrDir(fileOrDir)
    for(let filePath in shaResult){
        // console.log(filePath)
        if(-1!==filePath.indexOf(fileTobeExec)){

            return new Promise(function(reslove,reject){
                if(params){
                    //为了能使Lua将字符串（对象转换）转换成table，key不能由括号（无论单还是双）括起
                    params=params.replace(regex.lua.paramsConvert,'$1$2')
                }
                ioredisClient.evalsha(shaResult[filePath],0,params,function(err,result){
                    if(err){console.log(`sha err is ${err}`);reject(LuaError.LueExecFail(fileTobeExec))}
                    console.log(`sha result is ${result}`);reslove(result)
                })
            })

        }
    }
    // return shaResult
}

//执行sha后的lua脚本（实际使用）
function execSHALua(sha,params){
    return new Promise(function(reslove,reject){
        if(params){
            if('string'!==typeof params && 'object'!==typeof params){
                reject(LuaError.LueParamNotObject(sha))
            }
            if('object'===typeof params){
                params=JSON.stringify(params)
            }
            //为了能使Lua将字符串（对象转换）转换成table，key不能由括号（无论单还是双）括起
            params=params.replace(regex.lua.paramsConvert,'$1$2')
        }
/*        console.log(`sha is ${sha}`)
        console.log(`params is ${params}`)*/
        //统一格式，没有key（key num为0），参数是对象转换的字符串
        ioredisClient.evalsha(sha,0,params,function(err,result){
            if(err){
                console.log(`sha err is ${err}`);
                console.log(`parsed sha err is ${LuaError.LueExecFail(sha)}`);

                reject(LuaError.LueExecFail(sha))
            }else{
                //console.log(`type of result ${typeof result}`);
                console.log(`sha result is ${result}`);
                if(result && result!==''){
                    //result=
                    reslove(JSON.parse(result))
                }
            }

        })
    })
    // return shaResult
}

module.exports={
    shaSingleFile,
    shaLuaFileOrDir,
    execLua,
    execSHALua,
}
