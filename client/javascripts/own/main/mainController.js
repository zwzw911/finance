/**
 * Created by ada on 2016/8/28.
 */
var app=angular.module('app',['ui.router','contDefine'])
/*app.constant('cont',{
    asideName:{configuration:'配置信息',bill:'单据信息'},//aside菜单名称
    //根据dbstructure设置查询条件
    filterField:{
        department:{
            name:{labelName:'部门名称', inputType:'text'}
        },
        employee:{},
        billType:{},
        bill:{}
    },
})*/

app.config(function($stateProvider,$urlRouterProvider,$locationProvider){
    $locationProvider.html5Mode(true);//为了去除url中的#

    $urlRouterProvider.when("", "/configuration").otherwise("/");
    $stateProvider
        .state('configuration',{
            url:'/configuration',
            templateUrl:'configuration.ejs',
            controller:'configurationController',//只需在此定义；ui-view对应的ejs部分，无需写入ng-controller
        })
        .state('configuration.billType',{
            url:'/billType',
            templateUrl:'configuration.billType.ejs',
            controller:'configuration.billType.Controller',
        })
        .state('configuration.departmentInfo',{
            url:'/departmentInfo',
            templateUrl:'configuration.departmentInfo.ejs',
            controller:'configuration.departmentInfo.Controller',
        })
        .state('configuration.employeeInfo',{
            url:'/employeeInfo',
            templateUrl:'configuration.employeeInfo.ejs',
            controller:'configuration.employeeInfo.Controller',
        })

        .state('bill',{
            url:'/bill',
            templateUrl:'bill.ejs',
            controller:'billController',
        })
        .state('bill.billInfo',{
            url:'/billInfo',
            templateUrl:'bill.billInfo.ejs',
            controller:'bill.billInfo.Controller',
    })

})
app.controller('asideController',function($scope,cont){
    $scope.asideName=cont.asideName
})

app.controller('configurationController',function($scope,cont){

})

app.controller('configuration.billType.Controller',function($scope,cont){
    $scope.inputAttr=cont.inputAttr.billType

    $scope.clickQueryFlag=function(){
        $scope.queryFlag=!$scope.queryFlag
    }

    $scope.recorder=[
        {name:'津贴',parentBillType:undefined,cDate:new Date()},
        {name:'工资',parentBillType:undefined,cDate:new Date()},
    ]
})
app.controller('configuration.departmentInfo.Controller',function($scope,cont){
    $scope.inputAttr=cont.inputAttr.department

    $scope.clickQueryFlag=function(){
        $scope.queryFlag=!$scope.queryFlag
    }

    $scope.recorder=[
        {name:'机械部',parentDepartmentName:'工业部',cDate:new Date()},
        {name:'吊桥部',parentDepartmentName:'机械部',cDate:new Date()},
    ]
})
app.controller('configuration.employeeInfo.Controller',function($scope,cont){
    $scope.inputAttr=cont.inputAttr.employee

    $scope.clickQueryFlag=function(){
        $scope.queryFlag=!$scope.queryFlag
    }

    $scope.recorder=[
        {name:'张三',leaderName:"王五",departmentName:'工业部',onBoardDate:new Date(),cDate:new Date()},
        {name:'李四',leaderName:"王五",departmentName:'工业部',onBoardDate:new Date(),cDate:new Date()},
    ]
})

app.controller('billController',function($scope,cont){

})
app.controller('bill.billInfo.Controller',function($scope,cont){

})