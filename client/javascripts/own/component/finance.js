/**
 * Created by ada on 2016/9/15.
 */
'use strict'
var app=angular.module('finance',[]);
app.factory('financeHelper',function(){
    return {
        //传入字段，以及对应的value，那么从activateQueryFieldAndValue删除对应的value，如果filed中对应的value为0，则同时删除field
        deleteQueryValue:function(field,value,activateQueryFieldAndValue){
            for(var i=0;i<activateQueryFieldAndValue[field].length;i++){
                if(value===activateQueryFieldAndValue[field][i]){
                    activateQueryFieldAndValue[field].splice(i,1)
                    break
                }
            }
            if( 0===activateQueryFieldAndValue[field].length){
                delete activateQueryFieldAndValue[field]
            }
        },
        //将选中的field和value加入到allData.activeQueryValue
        addQueryValue:function(field,value,activateQueryFieldAndValue){
            console.log(field)
            if(undefined===activateQueryFieldAndValue[field]){
                activateQueryFieldAndValue[field]=[]
            }
            activateQueryFieldAndValue[field].push(value)
            console.log(activateQueryFieldAndValue)
        }
    }
})