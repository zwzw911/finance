/**
 * Created by zw on 2016/7/3.
 * 设置async函数（Promise）的错误
 */
    'use strict'

var asyncNodeError={
    //68000~68999
    fs:{
        fileNotExist(file){return {rc:68000,msg:{client:`文件（目录）${file}不存在`,server:`文件（目录）${file}不存在`}}},
    }
}

module.exports={
    asyncNodeError
}
/*exports.asyncNodeError={
    //miscError:misc,
    asyncNodeError
}*/
