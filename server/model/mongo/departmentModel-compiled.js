/**
 * Created by Ada on 2016/9/28.
 */
'use strict';

var departmentModel = require('./common/structure-compiled').departmentModel;
var mongooseErrorHandler = require('../../define/error/mongoError').mongooseErrorHandler;

var pageSetting = require('../../config/global/globalSettingRule').pageSetting;

function create(values) {
    //不能直接返回promise，而是通过callback捕获可能错误，并转换成可读格式
    //return departmentModel.insertMany(values)
    return new Promise(function (resolve, reject) {
        // console.log(`inserted values ${JSON.stringify(values)}`)
        /*let reg=/^[\u4E00-\u9FFF\w]{2,20}$/
                console.log(`value is ${values[0].name}`)
                let r=reg.test(values[0].name)
                console.log(`reg result  is ${r}`)*/
        departmentModel.insertMany(values, function (err, result) {
            if (err) {
                console.log(JSON.stringify(err));
                //能返回自定义错误，所以用resolve而不是reject
                resolve(mongooseErrorHandler(err));
            }
            resolve({ rc: 0, msg: result });
        });
    });
}
function update(id, values) {
    var updateOptions = {
        'new': false, //是否返回更新后的doc。默认false，返回原始doc
        'select': 'name', //返回哪些字段
        'upsert': false, //如果doc不存在，是否创建新的doc，默认false
        runValidators: false, //更新时是否执行validator。因为默写cavert，默认false
        setDefaultsOnInsert: false, //当upsert为true && 设为true，则插入文档时，使用default。
        'sort': '_id' };
    values['uDate'] = Date.now();
    return new Promise(function (resolve, reject) {
        // console.log(`update input is ${id}, ${JSON.stringify(values)}`)
        departmentModel.findByIdAndUpdate(id, values, updateOptions, function (err, result) {
            if (err) {
                // console.log(`db err is ${err}`)
                resolve(mongooseErrorHandler(err));
            }

            //update成功，返回的是原始记录，需要转换成可辨认格式
            // console.log(`db result is ${JSON.stringify(result)}`)
            resolve({ rc: 0 });
        });
    });
}

//根据Id删除文档
function remove(id) {
    return new Promise(function (resolve, reject) {
        departmentModel.findByIdAndRemove(id, function (err, result) {
            if (err) {
                //console.log(`db err is ${err}`)
                resolve(mongooseErrorHandler(err));
            }
            //console.log(`success result is ${result}`)
            //remove成功，返回的是原始记录，需要转换成可辨认格式
            resolve({ rc: 0 });
        });
    });
}

//只做测试用
function removeAll() {
    return new Promise(function (resolve, reject) {
        departmentModel.remove({}, function (err, result) {
            if (err) {
                //console.log(`db err is ${err}`)
                resolve(mongooseErrorHandler(err));
            }
            //console.log(`success result is ${result}`)
            //remove成功，返回的是原始记录，需要转换成可辨认格式
            resolve({ rc: 0 });
        });
    });
}

function readAll() {
    return new Promise(function (resolve, reject) {
        var condition = {};
        var selectField = null;
        var option = {};
        option.limit = pageSetting.department.limit;
        departmentModel.find(condition, selectField, option, function (err, result) {
            if (err) {
                //console.log(`db err is ${err}`)
                resolve(mongooseErrorHandler(err));
            }
            //console.log(`success result is ${result}`)
            resolve({ rc: 0, msg: result });
        });
    });
}

function readName(nameToBeSearched) {
    return new Promise(function (resolve, reject) {
        var condition = {};
        if (undefined !== nameToBeSearched && '' !== nameToBeSearched.toString()) {
            condition['name'] = new RegExp(nameToBeSearched);
        }
        var selectField = 'name';
        var option = {};
        option.limit = pageSetting.department.limit;
        departmentModel.find(condition, selectField, option, function (err, result) {
            if (err) {
                console.log('db err is ' + err);
                resolve(mongooseErrorHandler(err));
            }
            console.log('success result is ' + result);
            resolve({ rc: 0, msg: result });
        });
    });
}

//作为外键时，是否存在
function findById(id) {
    return new Promise(function (resolve, reject) {
        departmentModel.findById(id, '-cDate -uDate -dDate', function (err, result) {
            if (err) {
                console.log('db err is ' + err);
                resolve(mongooseErrorHandler(err));
            }
            console.log('department find by Id ' + result);
            // console.log(`original type is  ${typeof result}`)
            // let convert=result.toJSON()
            // console.log(`after toJSON type is  ${typeof convert}`)
            // delete result['_id']
            // console.log(`after delete is ${convert['_id']}`)
            // console.log(`after delete type is ${typeof result['_id']}`)
            // result['_id']=convert
            // console.log(`type of   ${typeof result['_id']}`)
            resolve({ rc: 0, msg: result });
        });
    });
}
module.exports = {
    create: create,
    update: update,
    remove: remove,
    removeAll: removeAll,
    readAll: readAll,
    readName: readName,
    findById: findById
};

//# sourceMappingURL=departmentModel-compiled.js.map