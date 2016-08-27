'use strict';

/**
 * Created by ada on 2016/8/7.
 */
/**/
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
    }
};

exports.asyncFunc = {
    asyncFs: asyncFs
};

//# sourceMappingURL=wrapAsyncNode-compiled.js.map