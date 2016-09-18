/**
 * Created by ada on 2016/9/15.
 */
'use strict'
var app=angular.module('finance',[]);
app.factory('financeCRUDHelper',function($http){
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
        department:{
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