/**
 * Created by ada on 2016/9/15.
 */
'use strict';

var app = angular.module('finance', ['component']);

app.factory('financeHelper', function ($http, $q, inputAttrHelper, commonHelper, modal) {
    /*    //根据inputAttr的内容，生成合适的values，以便server处理
        var generateInputValue=function(inputAttr){
            let values={}
            for(let key in inputAttr){
                if(inputAttr[key] && inputAttr[key]['value']){
                    values[key]={}
                    values[key]['value']=inputAttr[key]['value']
                }
            }
            return values
        }*/
    modal.setModalId('modalCommon');

    var dataOperator = {
        //billType: {
        //idx无用，只是为了统一使用参数(create和update同样在modal上操作，使用同一个按钮)
        'create': function create(idx, inputAttr, recorder, selectAC, fkConfig, eColl, aDateToBeConvert) {
            //首先加入db（加入db时，angular已经执行过value的检测，因此无需再次执行inputCheck）
            //从inputAttr提取数据，转换成{field1:{value1:xxx},field2:{value2:yyy}}
            var value = inputAttrHelper.convertedInputAttrFormatCreate(inputAttr);
            //转换外键的格式
            for (var singleFKField in fkConfig) {
                inputAttrHelper.convertSingleACFormat(singleFKField, selectAC, value);
            }
            var url = '/' + eColl;
            $http.post(url, { values: value }).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //对server返回的数据中的日期进行格式化
                    //只返回一个数据，而不是数组，所以只要判断是否null
                    if (null !== data.msg) {
                        commonHelper.convertDateTime(data.msg, aDateToBeConvert);
                        //检查外键是否存在，存在的话，将外键object转换成字符
                        console.log('before FK format result ' + JSON.stringify(data.msg));
                        //需要删除nestedPrefix字段
                        for (var _singleFKField in fkConfig) {
                            var nestedPrefix = fkConfig[_singleFKField]['nestedPrefix'];
                            delete data.msg[nestedPrefix];
                        }
                        /*                            for(let singleFKField in fkConfig){
                         let aRedundancyFields=fkConfig[singleFKField]['fields']
                         //每个fk可能对应多个冗余field
                         for(let singleField of aRedundancyFields){
                         if(data.msg[singleFKField] && data.msg[singleFKField][singleField]){
                         if(undefined===data.msg[singleFKField]){
                         data.msg[singleFKField]={}
                         }
                         data.msg[singleFKField]=data.msg[singleFKField][singleField]
                         }
                         }
                         }*/

                        console.log('after FK format result ' + JSON.stringify(data.msg));
                        recorder.push(data.msg);
                        modal.showInfoMsg('记录添加成功');
                    }

                    //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                } else {
                    modal.showErrMsg(JSON.stringify(data.msg));
                }
            }).error(function () {
                console.log('err');
            });
            //然后加入client数据，防止多次返回
            //_angularDataOp.create(idx,inputAttr,recorder)
        },
        'delete': function _delete(idx, recorder, eColl) {
            //首先更新数据到db
            //设置要发送的数据（objId）
            //let value={}
            //value['_id']=recorder[idx]['_id']
            //console.log(`construct delete values is ${JSON.stringify(value)}`)
            var url = '/' + eColl + '/' + recorder[idx]['_id'];
            $http.delete(url, {}).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    recorder.splice(idx, 1);
                } else {
                    modal.showErrMsg(data.msg);
                }
            }).error(function (data, status, header, config) {});
            //然后更新client端数据
            //_angularDataOp.delete(idx, recorder)
        },
        'update': function update(idx, inputAttr, recorder, selectAC, fkConfig, eColl, aDateToBeConvert) {
            //首先更新数据到db（更新db时，angular已经执行过value的检测，因此无需再次执行inputCheck）
            //将修改过的值上传修改
            var value = inputAttrHelper.convertedInputAttrFormatCreate(inputAttr);

            //将外键的id转换成server可以接收的格式
            for (var singleFKField in fkConfig) {
                inputAttrHelper.convertSingleACFormat(singleFKField, selectAC, value);
            }

            console.log('value 1 is ' + JSON.stringify(value));
            //添加要更新记录的_id。必须使用_id（server只认识_id）
            console.log('idx is ' + idx + ',recorder is ' + JSON.stringify(recorder[idx]));
            value['_id'] = { value: recorder[idx]['_id'] };
            console.log('value 2 is ' + JSON.stringify(value));
            //Object.assign(value,selectAC)
            var url = '/' + eColl;
            $http.put(url, { values: value }).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //对server返回的数据中的日期进行格式化
                    //console.log(`before date format result ${JSON.stringify(returnResult.msg)}`)
                    commonHelper.convertDateTime(data.msg, aDateToBeConvert);
                    //需要删除nestedPrefix字段
                    for (var _singleFKField2 in fkConfig) {
                        var nestedPrefix = fkConfig[_singleFKField2]['nestedPrefix'];
                        delete data.msg[nestedPrefix];
                    }
                    /*                        // 外键用name/title替换（不显示ObjectId）
                     for(let singleFKField in fkConfig){
                     let aRedundancyFields=fkConfig[singleFKField]['fields']
                     //每个fk可能对应多个冗余field
                     for(let singleField of aRedundancyFields){
                     if(data.msg[singleFKField] && data.msg[singleFKField][singleField]){
                     if(undefined===data.msg[singleFKField]){
                     data.msg[singleFKField]=data.msg[singleFKField][singleField]
                     }
                     }
                     }
                     }*/
                    /*                        if(data.msg.parentBillType && data.msg.parentBillType.name){
                     data.msg.parentBillType=data.msg.parentBillType.name
                     }*/
                    for (var singleField in data.msg) {
                        recorder[idx][singleField] = data.msg[singleField];
                    }
                    //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                } else {
                    modal.showErrMsg(JSON.stringify(data.msg));
                }
            }).error(function () {
                console.log('err');
            });
        },
        'read': function read(recorder, fkConfig, eColl, aDateToBeConvert) {
            var url = '/' + eColl;
            $http.get(url, {}).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //对server返回的数据中的日期进行格式化
                    //console.log(`read result is ${JSON.stringify(data.msg)}`)
                    recorder.splice(0, recorder.length); //清空数组
                    data.msg.forEach(function (e) {
                        commonHelper.convertDateTime(e, aDateToBeConvert);
                        //需要删除nestedPrefix字段
                        for (var singleFKField in fkConfig) {
                            var nestedPrefix = fkConfig[singleFKField]['nestedPrefix'];
                            delete data.msg[nestedPrefix];
                        }
                        /*                            if(e.parentBillType && e.parentBillType.name){
                         console.log('in')
                         e.parentBillType=e.parentBillType.name
                         }*/
                        recorder.push(e);
                    });
                    // recorder=data.msg
                    //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                } else {
                    modal.showErrMsg(JSON.stringify(data.msg));
                }
            }).error(function () {
                console.log('err');
            });
        },
        'readName': function readName(name, eColl) {
            var url = '/' + eColl + '/name/';
            return $http.post(url, { values: name }, {});
        },
        'search': function search(recorder, queryValue, fkConfig, eColl, aDateToBeConvert) {

            var url = '/' + eColl + "/" + "search";
            $http.post(url, { values: queryValue }).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //对server返回的数据中的日期进行格式化
                    //console.log(`read result is ${JSON.stringify(data.msg)}`)

                    recorder.splice(0, recorder.length); //清空数组
                    console.log('after empty array is ' + JSON.stringify(recorder));
                    data.msg.forEach(function (e) {
                        commonHelper.convertDateTime(e, aDateToBeConvert);
                        //需要删除nestedPrefix字段
                        for (var singleFKField in fkConfig) {
                            var nestedPrefix = fkConfig[singleFKField]['nestedPrefix'];
                            delete data.msg[nestedPrefix];
                        }
                        /*                            if(e.parentBillType && e.parentBillType.name){
                         console.log('in')
                         e.parentBillType=e.parentBillType.name
                         }*/
                        recorder.push(e);
                    });
                    console.log('after push array is ' + JSON.stringify(recorder));
                    // recorder=data.msg
                    //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                } else {
                    modal.showErrMsg(JSON.stringify(data.msg));
                }
            }).error(function () {
                console.log('err');
            });
        }
    };

    return {
        dataOperator: dataOperator
    };
});

//# sourceMappingURL=finance-compiled.js.map