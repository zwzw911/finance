'use strict';

/**
 * Created by ada on 2016/8/7.
 */
/*全部使用reslove返回数据，便于调试，以及便于通过rc判断*/

var fs = require('fs');
var error = require('../../../define/error/asyncNodeError').asyncNodeError;

var right = { rc: 0 };

var asyncFs = {
    asyncFileFolderExist: function asyncFileFolderExist(filePath) {
        return new Promise(function (reslove, reject) {
            fs.access(filePath, fs.F_OK, function (err) {
                if (err) {
                    reslove(error.fs.fileNotExist(filePath));
                } else {
                    reslove(right);
                }
            });
        });
    },
    asyncReadFile: function asyncReadFile(file) {
        return new Promise(function (resolve, reject) {
            fs.readFile(file, function (err, data) {
                if (err) {
                    reject(error.fs.readFileFail(file));
                }
                resolve(data);
            });
        });
    },
    asyncReadDir: function asyncReadDir(path) {
        return new Promise(function (resolve, reject) {
            fs.readdir(path, function (err, data) {
                if (err) {
                    reject(error.fs.readFDirFail(path));
                }
                resolve(data);
            });
        });
    },
    asyncIsFile: function asyncIsFile(file) {
        return new Promise(function (resolve, reject) {
            fs.lstat(file, function (err, stats) {
                // console.log(file);
                if (err) {
                    reject(error.fs.fstatFail(file));
                }
                // console.log(stats);
                resolve(stats.isFile());
            });
        });
    },
    asyncIsDir: function asyncIsDir(dir) {
        return new Promise(function (resolve, reject) {
            fs.lstat(dir, function (err, stats) {
                if (err) {
                    reject(error.fs.fstatFail(dir));
                }
                resolve(stats.isDirectory());
            });
        });
    }
};

module.exports = {
    asyncFs: asyncFs
};

//# sourceMappingURL=wrapAsyncNode-compiled.js.map

//# sourceMappingURL=wrapAsyncNode-compiled-compiled.js.map