/**
 * Created by Ada on 2016/9/28.
 */
'use strict';

var billModel = require('./common/structure-compiled').billModel;
var mongooseErrorHandler = require('../../define/error/mongoError').mongooseErrorHandler;

var pageSetting = require('../../config/global/globalSettingRule').pageSetting;

var updateOptions = {
    'new': true, //是否返回更新后的doc。默认false，返回原始doc。设为true，返回更新后的数据（给client）
    'select': '', //返回哪些字段
    'upsert': false, //如果doc不存在，是否创建新的doc，默认false
    runValidators: false, //更新时是否执行validator。因为默写cavert，默认false
    setDefaultsOnInsert: false, //当upsert为true && 设为true，则插入文档时，使用default。
    'sort': '_id' };

//populate的选项
// var populateOpt=

function create(values) {
    //不能直接返回promise，而是通过callback捕获可能错误，并转换成可读格式
    //return billModel.insertMany(values)
    return new Promise(function (resolve, reject) {
        // console.log(`inserted values ${values}`)

        billModel.insertMany(values, function (err, result) {
            if (err) {
                //console.log(JSON.stringify(err))
                //能返回自定义错误，所以用resolve而不是reject
                resolve(mongooseErrorHandler(err));
            } else {
                resolve({ rc: 0, msg: result });
            }
        });
    });
}
function update(id, values) {

    values['uDate'] = Date.now();
    return new Promise(function (resolve, reject) {
        billModel.findByIdAndUpdate(id, values, updateOptions).exec(function (err, result) {
            if (err) {
                //console.log(`db err is ${err}`)
                resolve(mongooseErrorHandler(err));
            }
            //update成功，返回的是原始记录，需要转换成可辨认格式
            resolve({ rc: 0, msg: result });
        });
    });
}

//根据Id删除文档
function remove(id) {
    return new Promise(function (resolve, reject) {
        /*        billModel.findByIdAndRemove(id,function(err,result){
                    if(err){
                        //console.log(`db err is ${err}`)
                        resolve( mongooseErrorHandler(err))
                    }
                    //console.log(`success result is ${result}`)
                    //remove成功，返回的是原始记录，需要转换成可辨认格式
                    resolve({rc:0})
                })*/
        var values = {};
        values['dDate'] = Date.now();
        billModel.findByIdAndUpdate(id, values, updateOptions, function (err, result) {
            if (err) {
                // console.log(`db err is ${err}`)
                resolve(mongooseErrorHandler(err));
            } else {
                // console.log(`department insert result is ${JSON.stringify(result)}`)
                //resolve({rc:0,msg:result})
                //只需返回是否执行成功，而无需返回update后的doc
                resolve({ rc: 0 });
            }
        });
    });
}

//只做测试用
function removeAll() {
    return new Promise(function (resolve, reject) {
        billModel.remove({}, function (err, result) {
            if (err) {
                console.log('bill removeAll err is ' + err);
                resolve(mongooseErrorHandler(err));
            }
            //console.log(`success result is ${result}`)
            //remove成功，返回的是原始记录，需要转换成可辨认格式
            resolve({ rc: 0 });
        });
    });
}

function readAll(populateOpt) {
    return new Promise(function (resolve, reject) {
        var condition = { dDate: { $exists: false } };
        var selectField = null;
        var option = {};
        option.limit = pageSetting.bill.limit;
        billModel.find(condition, selectField, option).populate(populateOpt).exec(function (err, result) {
            if (err) {
                // console.log(`db err is ${err}`)
                resolve(mongooseErrorHandler(err));
            }
            resolve({ rc: 0, msg: result });
        });
    });
}

//无需readName，因为不做其他collection的外键
/*function readName(nameToBeSearched){
    return new Promise(function(resolve,reject){
        let condition={}
        if(undefined!==nameToBeSearched && ''!== nameToBeSearched.toString()){
            condition['name']=new RegExp(nameToBeSearched)
        }
        let selectField='name'
        let option={}
        option.limit=pageSetting.billType.limit
        billModel.find(condition,selectField,option,function(err,result){
            if(err){
                //console.log(`db err is ${err}`)
                resolve( mongooseErrorHandler(err))
            }
            //console.log(`success result is ${result}`)
            resolve({rc:0,msg:result})
        })
    })
}*/

//作为外键时，是否存在
function findById(id) {
    var selectedFields = arguments.length <= 1 || arguments[1] === undefined ? '-cDate -uDate -dDate' : arguments[1];

    return new Promise(function (resolve, reject) {
        billModel.find(id, selectedFields, function (err, result) {
            if (err) {
                //console.log(`db err is ${err}`)
                resolve(mongooseErrorHandler(err));
            }
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
    // readName,
    findById: findById
};

//# sourceMappingURL=billModel-compiled.js.map