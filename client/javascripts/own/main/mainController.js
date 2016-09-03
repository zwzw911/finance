/**
 * Created by ada on 2016/8/28.
 */
var app=angular.module('app',['ui.router'])
app.constant('cont',{
    asideName:['配置信息','单据信息']
})
app.controller('asideController',function($scope,cont){
    $scope.asideName=cont.asideName
})