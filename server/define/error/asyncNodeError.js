/**
 * Created by zw on 2016/7/3.
 * 设置async函数（Promise）的错误
 */
    'use strict'

var asyncNodeError={
    //68000~68999
    fs:{
        fileNotExist(file){return {rc:68000,msg:{client:`文件（目录）${file}不存在`,server:`文件（目录）${file}不存在`}}},
        readFileFail(file){return {rc:68002,msg:{client:`无法读取文件${file}`,server:`文件${file}无法读取`}}},
        readFDirFail(dir){return {rc:68003,msg:{client:`无法读取目录${dir}`,server:`目录${dir}无法读取`}}},
        fstatFail(file){return {rc:68004,msg:{client:`文件${file}属性无法读取`,server:`文件（目录）${file}属性无法读取`}}}
    }
}

module.exports={
    asyncNodeError
}
/*exports.asyncNodeError={
    //miscError:misc,
    asyncNodeError
}*/
