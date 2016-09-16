/**
 * Created by ada on 2016/9/15.
 */
'use strict'
var app=angular.module('finance',[]);
app.factory('financeCRUDHelper',function($http){
    return {
        billType:{
            //idx无用，只是为了统一使用参数
            'create':function(idx,inputAttr,recorder){
                //首先加入db
                
                //然后加入client数据，防止多次返回
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
                //首先更新数据到db
                
                //然后更新client端数据 
                recorder.splice(idx,1)
            },
            'update':function(idx,inputAttr,recorder){
                //首先更新数据到db
                
                // console.log(idx)
                //然后更新client端数据
                for(var field in inputAttr){
                    recorder[idx][field]=inputAttr[field]['value']
                    //清除不必要的数据
                    // inputAttr[field]['value']=''
                    inputAttr[field]['originalValue']=''
                }
            },
            'read':function(){},
        },
        departmentInfo:{
            'create':function(){},
            'delete':function(){},
            'update':function(){},
            'read':function(){},
        },
        employeeInfo:{
            'create':function(){},
            'delete':function(){},
            'update':function(){},
            'read':function(){},
        },
        billInfo:{
            'create':function(){},
            'delete':function(){},
            'update':function(){},
            'read':function(){},
        }

    }
})