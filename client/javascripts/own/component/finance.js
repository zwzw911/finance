/**
 * Created by ada on 2016/9/15.
 */
'use strict'
var app=angular.module('finance',['component','contDefine']);

app.factory('financeCRUDHelper',function($http,$q,inputAttrHelper,commonHelper,cont){
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

    //在angular侧对数据的操作O,对所有页面都是通用的
    var _angularDataOp={
        //inputAttr：当前的一条记录中所有field的信息
        //recorder: 数组，当前所有记录
        'create':function(singleReturnRecorder,inputAttr,recorder){
            inputAttrHelper.initAllFieldInputAttrCreate(inputAttr)
            //加入angular端的数据集合
            recorder.push(singleReturnRecorder)
        },
        'delete':function(idx,recorder){

            recorder.splice(idx,1)
        },
        'update':function(idx,inputAttr,recorder){
            for(var field in inputAttr){
                recorder[idx][field]=inputAttr[field]['value']
                //清除不必要的数据
                // inputAttr[field]['value']=''
                inputAttr[field]['originalValue']=''
            }
        },
        //newGetRecorder: 从server获得的数据
        //recorder：angular维护的数组，用来存储
        'read':function(newGetRecorder,recorder){

        }
    }

    var dataOperator=
    {
        billType: {
            //idx无用，只是为了统一使用参数(create和update同样在modal上操作，使用同一个按钮)
            'create': function (idx, inputAttr, recorder,selectAC) {
                //首先加入db（加入db时，angular已经执行过value的检测，因此无需再次执行inputCheck）
                //从inputAttr提取数据，转换成{field1:{value1:xxx},field2:{value2:yyy}}
                let value = inputAttrHelper.convertedInputAttrFormatCreate(inputAttr)
                //转换外键的格式
                inputAttrHelper.convertSingleACFormat('parentBillType',selectAC,value)
                $http.post('/billType', {values: value}).success(function (data, status, header, config) {
                    if (0 === data.rc) {
                        //对server返回的数据中的日期进行格式化
                        //只返回一个数据，而不是数组，所以只要判断是否null
                        if(null!==data.msg){
                            commonHelper.convertDateTime(data.msg, cont.dateField.billType)
                            //检查外键是否存在，存在的话，将外键object转换成字符
                            console.log(`before FK format result ${JSON.stringify(data.msg)}`)
                            if(data.msg.parentBillType && data.msg.parentBillType.name){
                                data.msg.parentBillType=data.msg.parentBillType.name
                            }
                            console.log(`after FK format result ${JSON.stringify(data.msg)}`)
                                recorder.push(data.msg)
                        }

                        //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                    }
                }).error(function () {
                    console.log('err')
                })
                //然后加入client数据，防止多次返回
                //_angularDataOp.create(idx,inputAttr,recorder)
            },
            'delete': function (idx, recorder) {
                //首先更新数据到db
                //设置要发送的数据（objId）
                //let value={}
                //value['_id']=recorder[idx]['_id']
                //console.log(`construct delete values is ${JSON.stringify(value)}`)
                $http.delete('/billType/'+recorder[idx]['_id'],{}).success(function (data, status, header, config) {
                    if (0 === data.rc) {
                        recorder.splice(idx,1)
                    }
                }).error(function(data, status, header, config){

                })
                //然后更新client端数据
                //_angularDataOp.delete(idx, recorder)
            },
            'update': function (idx, inputAttr, recorder,selectAC) {
                //首先更新数据到db（更新db时，angular已经执行过value的检测，因此无需再次执行inputCheck）
                //将修改过的值上传修改
                let value = inputAttrHelper.convertedInputAttrFormatCreate(inputAttr)

                //将外键的id转换成server可以接收的格式
                inputAttrHelper.convertSingleACFormat('parentBillType',selectAC,value)
                console.log(`value 1 is ${JSON.stringify(value)}`)
                //添加要更新记录的_id。必须使用_id（server只认识_id）
                console.log(`idx is ${idx},recorder is ${JSON.stringify(recorder[idx])}`)
                value['_id']={value:recorder[idx]['_id']}
                console.log(`value 2 is ${JSON.stringify(value)}`)
                //Object.assign(value,selectAC)
                $http.put('/billType', {values: value}).success(function (data, status, header, config) {
                    if (0 === data.rc) {
                        //对server返回的数据中的日期进行格式化
                        //console.log(`before date format result ${JSON.stringify(returnResult.msg)}`)
                        commonHelper.convertDateTime(data.msg, cont.dateField.billType)
                        // recorder.push(data.msg)
                        if(data.msg.parentBillType && data.msg.parentBillType.name){
                            data.msg.parentBillType=data.msg.parentBillType.name
                        }
                        for (let singleField in data.msg) {

                            recorder[idx][singleField] = data.msg[singleField]
                        }
                        //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                    }
                }).error(function () {
                    console.log('err')
                })
            },
            'read': function (recorder) {
                $http.get('/billType', {}).success(function (data, status, header, config) {
                    if (0 === data.rc) {
                        //对server返回的数据中的日期进行格式化
                        //console.log(`read result is ${JSON.stringify(data.msg)}`)

                        data.msg.forEach(function (e) {
                            commonHelper.convertDateTime(e, cont.dateField.billType)
                            if(e.parentBillType && e.parentBillType.name){
                                console.log('in')
                                e.parentBillType=e.parentBillType.name
                            }
                            recorder.push(e)
                        })
                        // recorder=data.msg
                        //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                    }
                }).error(function () {
                    console.log('err')
                })
            },
            'readName': function (name,suggest_state) {
                return $http.get('/billType/name/'+name, {})
            },
        },
        department: {
            //idx无用，只是为了统一使用参数
            'create': function (idx, inputAttr, recorder) {
                //首先加入db
                // console.log(inputAttr)
                var defer = $q.defer()
                $http.post('/department', {values: generateInputValue(inputAttr)}, {}).success(function (data, status, header, config) {
                    //console.log(data)
                    if (data.rc === 0) {
                        //使用insertmany，所以返回数组
                        let returnRec = data.msg[0]
                        console.log(inputAttr)
                        for (var singleField in returnRec) {
                            if ('_id' !== singleField && returnRec[singleField]) {
                                inputAttr[singleField]['value'] = returnRec[singleField]
                            }
                        }
                        _angularDataOp.create(idx, inputAttr, recorder)
                    }
                }).error(function (data, status, header, config) {
                    console.log(data)
                })
                //然后加入client数据，防止多次返回

            },
            'delete': function (idx, recorder) {
                //首先更新数据到db

                //然后更新client端数据
                _angularDataOp.delete(idx, recorder)
            },
            'update': function (idx, inputAttr, recorder) {
                //首先更新数据到db


                //然后更新client端数据
                _angularDataOp.update(idx, inputAttr, recorder)
            },
            'read': function () {
                _angularDataOp.read()
            },
        },
        employee: {
            //idx无用，只是为了统一使用参数
            'create': function (idx, inputAttr, recorder) {
                //首先加入db

                //然后加入client数据，防止多次返回
                // console.log(inputAttr)
                _angularDataOp.create(idx, inputAttr, recorder)
            },
            'delete': function (idx, recorder) {
                //首先更新数据到db

                //然后更新client端数据
                _angularDataOp.delete(idx, recorder)
            },
            'update': function (idx, inputAttr, recorder) {
                //首先更新数据到db


                //然后更新client端数据
                _angularDataOp.update(idx, inputAttr, recorder)
            },
            'read': function () {
                _angularDataOp.read()
            },
        },
        bill: {
            //idx无用，只是为了统一使用参数
            'create': function (idx, inputAttr, recorder) {
                //首先加入db

                //然后加入client数据，防止多次返回
                _angularDataOp.create(idx, inputAttr, recorder)
            },
            'delete': function (idx, recorder) {
                //首先更新数据到db

                //然后更新client端数据
                _angularDataOp.delete(idx, recorder)
            },
            'update': function (idx, inputAttr, recorder) {
                //首先更新数据到db


                //然后更新client端数据
                _angularDataOp.update(idx, inputAttr, recorder)
            },
            'read': function () {
                _angularDataOp.read()
            },
        },
    }

    /*  说明：用来完成自动匹配功能。参数只能采用function(term)的格式。
    *   term:输入的关键字（用来查找匹配的值）
    */
    //
    var suggest_state=
    {
        billType:{
            name:function (term) {
                //return [{label:'typebill1',value:'typebill1'},{label:'typebill2',value:'typebill2'}]
 /*               var q = term.toLowerCase().trim();
                var results = [];
/!*                $http.get('/billType/'+name, {}).success(function (data, status, header, config) {
                    if (0 === data.rc) {
                        //对server返回的数据中的日期进行格式化
                        // console.log(`read result is ${JSON.stringify(data.msg)}`)


                        data.msg.forEach(function (e) {
                            inputAttrHelper.convertDateTime(e, cont.dateField.billType)
                            recorder.push(e)
                        })
                        // recorder=data.msg
                        //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                    }
                }).error(function () {
                    console.log('err')
                })*!/
                var states = ['billType1', 'Alaska', 'California', /!* ... *!/];
                // Find first 10 states that start with `term`.
                for (var i = 0; i < states.length && results.length < 10; i++) {
                    var state = states[i];
                    if (state.toLowerCase().indexOf(q) === 0)
                        results.push({label: state, value: state});
                }

                return results;*/
            },

        },
        employee:{
            name:function (term) {
                var q = term.toLowerCase().trim();
                var results = [];
                var states = ['employee1', 'Alaska', 'California', /* ... */];
                // Find first 10 states that start with `term`.
                for (var i = 0; i < states.length && results.length < 10; i++) {
                    var state = states[i];
                    if (state.toLowerCase().indexOf(q) === 0)
                        results.push({label: state, value: state});
                }
                return results;
            },
        },
        department:{
            name:function (term) {
                var q = term.toLowerCase().trim();
                var results = [];
                var states = ['department1', 'Alaska', 'California', /* ... */];
                // Find first 10 states that start with `term`.
                for (var i = 0; i < states.length && results.length < 10; i++) {
                    var state = states[i];
                    if (state.toLowerCase().indexOf(q) === 0)
                        results.push({label: state, value: state});
                }

                return results;
            },
        },
        bill:{
            title:function (term) {
                var q = term.toLowerCase().trim();
                var results = [];
                var states = ['bill1', 'Alaska', 'California', /* ... */];
                // Find first 10 states that start with `term`.
                for (var i = 0; i < states.length && results.length < 10; i++) {
                    var state = states[i];
                    if (state.toLowerCase().indexOf(q) === 0)
                        results.push({label: state, value: state});
                }

                return results;
            },
        },
    }


    return {dataOperator,suggest_state}
})