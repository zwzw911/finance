/**
 * Created by ada on 2015/7/31.
 * classed by db
 */
/*全部使用reslove返回数据，便于调试，以及便于通过rc判断*/
'use strict';

require("babel-polyfill");
require("babel-core/register");
//mongo的validate error和input value共享一个定义
//var mongoError=require('../../../../define/validateRule/inputRule').inputRule;

var collections = require('../../../../model/mongo/common/structure').collections;
var fieldDefine = require('../../../../model/mongo/common/structure').fieldDefine;
//为了返回{rc:xxx,msg:'xxxxx'}格式的结果，只能requireinputRule（structure中的error msg是rc+msg的字符串格式，不太符合常用格式）
var inputRule = require('../../../../define/validateRule/inputRule').inputRule;
/*
*  validate。使用同一的函数处理
* */

var mongoKind2InputRule = {
    required: 'require',
    min: 'min',
    max: 'max',
    minlength: 'minLength',
    maxlength: 'maxLength',
    regexp: 'format', //在mongo中，类型是match，但是返回的error中，kind是regexp
    ObjectID: 'format' };

/*  采用统一的函数进行mongo的validate（以前每个collection一个validate函数，不方便）
* 根据validate的error信息直接找到inputValue中对应的rule的mongoError
* 1. 遍历所有collection，检查err.message是否包含collection名称，以此判断validate err发生在哪个collection上
* 2. 遍历collection的schema中的所有字段，查看对应的err.errors[field]是否存在，判断validate err发生在此collection的哪个field
* 3. 读取此err的类型（mongo内建validator类型），然后从inputRule中读取到对应的错误，并返回错误代码（mongoError）
* */
/*var mongoValidate=function(doc,cb){
    doc.validate(function(err){
        for(let collectionName of collections){
            if(-1!==err.message.indexOf(collectionName)){//判断当前错误是哪个collection产生的
                for(let singleFieldName in fieldDefine[collectionName]){//遍历collection中的每个字段，是否在err中有对应的
                    if(err.errors[singleFieldName]){//某个字段有error
                        let kind=err.errors[singleFieldName]['kind']    //此field错误的类型
                        if(inputRule[collectionName][singleFieldName][mongoKind2InputRule[kind]]){  //在inputValue中，对应的rule存在
                            console.log(inputRule[collectionName][singleFieldName][mongoKind2InputRule[kind]]['mongoError'])
                            return cb(inputRule[collectionName][singleFieldName][mongoKind2InputRule[kind]]['mongoError'])
                        }
                    }
                }
            }
        }

        return cb({rc:0})
    })
}*/
var asyncMongoValidate = function asyncMongoValidate(doc) {
    return new Promise(function (reslove, reject) {
        doc.validate(function (err) {
            //console.log(err)
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = collections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var collectionName = _step.value;

                    if (-1 !== err.message.indexOf(collectionName)) {
                        //判断当前错误是哪个collection产生的
                        for (var singleFieldName in fieldDefine[collectionName]) {
                            //遍历collection中的每个字段，是否在err中有对应的
                            if (err.errors[singleFieldName]) {
                                //某个字段有error
                                var kind = err.errors[singleFieldName]['kind']; //此field错误的类型
                                //console.log(inputRule[collectionName][singleFieldName][mongoKind2InputRule[kind]])
                                if (inputRule[collectionName][singleFieldName][mongoKind2InputRule[kind]]) {
                                    //在inputValue中，对应的rule存在
                                    reslove(inputRule[collectionName][singleFieldName][mongoKind2InputRule[kind]]['mongoError']);
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            reslove({ rc: 0 });
        });
    });
};

/*var test=async function(doc){
    asyncMongoValidate(doc)
}*/

module.exports = {
    asyncMongoValidate: asyncMongoValidate

};

//# sourceMappingURL=mongoValidate-compiled.js.map