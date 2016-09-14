/**
 * Created by ada on 2016/8/28.
 */
var app=angular.module('app',['ui.router','ui.event','ngSanitize','MassAutoComplete','contDefine','component'])
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

app.controller('mainController',function($scope,cont,helper,$sce){









    helper.adjustFooterPosition()
/*    $scope.adjustFooterPosition=function(){
        console.log('main resize')
        helper.adjustFooterPosition()
    }*/
    window.onresize=function(){
        helper.adjustFooterPosition()
    }
/*    window.onresize=function(){
        var offset={leftOffset:0,topOffset:0, widthOffset:-18,heightOffset:0}
        helper.setCoverEle('coveredEle','coveringEle',offset)
    }*/
/*    $('body').resize(function(){
        helper.adjustFooterPosition()
    })*/
})

app.controller('configurationController',function($scope,cont,helper){
    $scope.adjustFooterPosition=function(){
        //console.log('configuration resize')
        helper.adjustFooterPosition()
    }
/*    window.onresize=function(){
        console.log('resize')
        helper.adjustFooterPosition()
    }*/
})

/*test=function(){
    console.log('test in')
}*/
app.controller('configuration.billType.Controller',function($scope,cont,helper,$sce){
    $scope.dirty = {};

    var states = ['Alabama', 'Alaska', 'California', /* ... */ ];

    function suggest_state(term) {
        var q = term.toLowerCase().trim();
        var results = [];

        // Find first 10 states that start with `term`.
        for (var i = 0; i < states.length && results.length < 10; i++) {
            var state = states[i];
            if (state.toLowerCase().indexOf(q) === 0)
                results.push({ label: state, value: state });
        }

        return results;
    }

    $scope.autocomplete_options = {
        suggest: suggest_state
    };

/*    $scope.tags = [];

    function add_tag(selected) {
        // $scope.tags.push(selected.value);
        // Clear model
        // $scope.dirty.selected_tag = undefined;
    };*/

    $scope.ac_option_tag_select = {
        suggest: suggest_state,
        // on_select: add_tag
    };



    helper.adjustFooterPosition()
    $scope.inputAttr=cont.inputAttr.billType

/*$scope.filter=function(){
    console.log('out')
    $('#coveredEle').click()
    //$('#coveredEle').attr('size',2)
}*/
/*    $('#coveredEle').click(function(){console.log('text click')})
    var offset={leftOffset:0,topOffset:0, widthOffset:-18,heightOffset:0}
    helper.setCoverEle('coveredEle','coveringEle',offset)*/
    

/*    window.onresize=function(){
        helper.setCoverEle('coveredEle','coveringEle',offset)
    }*/
    $scope.queryField=cont.queryField.billType
    $scope.change=function(selectedQueryField){
        let testValue={
            name:[{key:'津贴'},{key:'工资'}]
        }
        console.log(selectedQueryField)
        $scope.queryFieldValue=testValue[selectedQueryField['value']]
        console.log($scope.queryFieldValue)
    }

    $scope.clickQueryFlag=function(){

        $scope.queryFlag=!$scope.queryFlag
        if($scope.queryFlag){
            // helper.setCoverEle('coveredEle','coveringEle')
        }
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
    helper.adjustFooterPosition()
    $scope.inputAttr=cont.inputAttr.employee

    $scope.clickQueryFlag=function(){
        $scope.queryFlag=!$scope.queryFlag
    }

    $scope.recorder=[
        {name:'张三',leaderName:"王五",departmentName:'工业部',onBoardDate:new Date(),cDate:new Date()},
        {name:'李四',leaderName:"王五",departmentName:'工业部',onBoardDate:new Date(),cDate:new Date()},
    ]
})

app.controller('billController',function($scope,cont,helper){
    $scope.adjustFooterPosition=function(){
        //console.log('main resize')
        helper.adjustFooterPosition()
    }
})
app.controller('bill.billInfo.Controller',function($scope,cont){
    helper.adjustFooterPosition()
})