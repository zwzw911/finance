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
        }

    }
})