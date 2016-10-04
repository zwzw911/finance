/**
 * Created by Ada on 2016/9/28.
 */
'use strict';

var billTypeModel = require('./common/structure-compiled').billTypeModel;
var mongooseErrorHandler = require('../../define/error/mongoError').mongooseErrorHandler;

function create(values) {
    //不能直接返回promise，而是通过callback捕获可能错误，并转换成可读格式
    //return billTypeModel.insertMany(values)
    return new Promise(function (resolve, reject) {
        //console.log(`inserted values ${values}`)

        billTypeModel.insertMany(values, function (err, result) {
            if (err) {
                //console.log(JSON.stringify(err))
                //能返回自定义错误，所以用resolve而不是reject
                resolve(mongooseErrorHandler(err));
            }
            resolve(result);
        });
    });
}
function update(values) {}

module.exports = {
    create: create
};

//# sourceMappingURL=billTypeModel-compiled.js.map