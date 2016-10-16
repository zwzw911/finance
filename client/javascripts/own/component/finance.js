/**
 * Created by ada on 2016/9/15.
 */
'use strict'
var app=angular.module('finance',[]);
/*app.factory('CRUDUrl',function($http){
    var department={
        'create':function(values){
            return
        },
        'readAll':function(){
            return $http.get("/department/",{})
        },
        'readName':function(name){
            return $http.get("/department/name/"+name,{})
        },
        'update':function(values){
            return $http.put("/department/name/",{values:values})
        },
        'remove':function(values){
            return $http.delete("/department",{values:values})
        },
    }
})*/
app.factory('financeCRUDHelper',function($http){
    //根据inputAttr的内容，生成合适的values，以便server处理
    var generateInputValue=function(inputAttr){
        let values={}
        for(let key in inputAttr){
            if(inputAttr[key] && inputAttr[key]['value']){
                values[key]={}
                values[key]['value']=inputAttr[key]['value']
            }
        }
        return values
    }

    //在angular侧对数据的操作O,对所有页面都是通用的
    var _angularDataOp={
        //idx无用，只是为了统一使用参数
        'create':function(idx,inputAttr,recorder){
            var tmpRecorder={}
            for(var field in inputAttr){
                tmpRecorder[field]=inputAttr[field]['value']

                //清除不必要的数据
                inputAttr[field]['value']=''
                inputAttr[field]['originalValue']=''
            }
            //加入angular端的数据集合
            recorder.push(tmpRecorder)
            // console.log(recorder)
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
        'read':function(){

        }
    }
    return {
        billType:{
            //idx无用，只是为了统一使用参数(create和update同样在modal上操作，使用同一个按钮)
            'create':function(idx,inputAttr,recorder){
                //首先加入db（加入db时，angular已经执行过value的检测，因此无需再次执行inputCheck）
                let value={}
                for(let singleInputAttr in inputAttr){
                    if(''!==inputAttr[singleInputAttr]['value']){
                        value[singleInputAttr]={}
                        value[singleInputAttr]['value']=inputAttr[singleInputAttr]['value']
                    }
                }
                $http.post('/billType',{values:value})

                //然后加入client数据，防止多次返回
                _angularDataOp.create(idx,inputAttr,recorder)
            },
            'delete':function(idx,recorder){
                //首先更新数据到db
                
                //然后更新client端数据
                _angularDataOp.delete(idx,recorder)
            },
            'update':function(idx,inputAttr,recorder){
                //首先更新数据到db（更新db时，angular已经执行过value的检测，因此无需再次执行inputCheck）
                //将修改过的值上传修改
                let value={}
                for(let singleInputAttr in inputAttr){
                    if(inputAttr[singleInputAttr]['value']!==inputAttr[singleInputAttr]['originalValue']){
                        value[singleInputAttr]={}
                        value[singleInputAttr]['value']=inputAttr[singleInputAttr]['value']
                    }
                }

                //然后更新client端数据
                _angularDataOp.update(idx,inputAttr,recorder)
            },
            'read':function(){
                _angularDataOp.read()
            },
        },
        department:{
            //idx无用，只是为了统一使用参数
            'create':function(idx,inputAttr,recorder){
                //首先加入db
                // console.log(inputAttr)

                $http.post('/department',{values:generateInputValue(inputAttr)},{}).success(function(data,ststus,header,config){
                    console.log(data)
                }).error(function(data,ststus,header,config){
                    console.log(data)
                })
                //然后加入client数据，防止多次返回
                _angularDataOp.create(idx,inputAttr,recorder)
            },
            'delete':function(idx,recorder){
                //首先更新数据到db

                //然后更新client端数据
                _angularDataOp.delete(idx,recorder)
            },
            'update':function(idx,inputAttr,recorder){
                //首先更新数据到db


                //然后更新client端数据
                _angularDataOp.update(idx,inputAttr,recorder)
            },
            'read':function(){
                _angularDataOp.read()
            },
        },
        employee:{
            //idx无用，只是为了统一使用参数
            'create':function(idx,inputAttr,recorder){
                //首先加入db

                //然后加入client数据，防止多次返回
                // console.log(inputAttr)
                _angularDataOp.create(idx,inputAttr,recorder)
            },
            'delete':function(idx,recorder){
                //首先更新数据到db

                //然后更新client端数据
                _angularDataOp.delete(idx,recorder)
            },
            'update':function(idx,inputAttr,recorder){
                //首先更新数据到db


                //然后更新client端数据
                _angularDataOp.update(idx,inputAttr,recorder)
            },
            'read':function(){
                _angularDataOp.read()
            },
        },
        bill:{
            //idx无用，只是为了统一使用参数
            'create':function(idx,inputAttr,recorder){
                //首先加入db

                //然后加入client数据，防止多次返回
                _angularDataOp.create(idx,inputAttr,recorder)
            },
            'delete':function(idx,recorder){
                //首先更新数据到db

                //然后更新client端数据
                _angularDataOp.delete(idx,recorder)
            },
            'update':function(idx,inputAttr,recorder){
                //首先更新数据到db


                //然后更新client端数据
                _angularDataOp.update(idx,inputAttr,recorder)
            },
            'read':function(){
                _angularDataOp.read()
            },
        },


        /*  说明：用来完成自动匹配功能。参数只能采用function(term)的格式。
        *   term:输入的关键字（用来查找匹配的值）
        */
        //
        'suggest_state': {
            billType:{
                name:function (term) {
                    var q = term.toLowerCase().trim();
                    var results = [];
                    var states = ['billType1', 'Alaska', 'California', /* ... */];
                    // Find first 10 states that start with `term`.
                    for (var i = 0; i < states.length && results.length < 10; i++) {
                        var state = states[i];
                        if (state.toLowerCase().indexOf(q) === 0)
                            results.push({label: state, value: state});
                    }

                    return results;
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
    }
})