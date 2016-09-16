/**
 * Created by ada on 2016/8/28.
 */
var app=angular.module('app',['ui.router','ui.event','ngSanitize','MassAutoComplete','contDefine','component','finance'])
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
        
        //窗口位置大小变化时，重新设置modal的top
        helper.verticalCenter('CRUDRecorder')
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
app.controller('configuration.billType.Controller',function($scope,cont,basicHelper,helper,$sce,financeHelper,financeCRUDHelper){
    $scope.allData={
        inputAttr:cont.inputAttr.billType,//CRUD记录的时候，对输入进行设置
        inputRule:cont.inputRule.billType,//CRUD，对输入进行设置（min/maxLength）以及进行检测
        recorder:[//使用数组，以便判断是否为空
        ],

        queryFieldEnable:false,//当前 字段查询是否展开

        selectedQueryField:'',
        queryField:cont.queryField.billType, //可选的查询字段
        
        suggestValue:{suggest:suggest_state},//当前select下拉值
        selectedValue:undefined,//下拉菜单中选中的值
        dirty:'', //当前选择的查询值

        activeQueryValue:{},//当前生效的查询字段和查询值 {field:['value1','value2']}

        recorderDialogShow:false,//当前modal-dialog是否显示（用来add/modify记录）
        
        //从finance/financeCRUDHelper中载入对应CRUD方法
        CRUDOperation:financeCRUDHelper.billType,

        currentOperation:{
            'read':function(){},
            'delete':function(idx,recorder){
                financeCRUDHelper.billType.delete(idx,recorder)
            },
        }, //当前操作的类型（CRUD）
        currentIdx:-1, //当前操作的记录的idx
    }

    $scope.modal={
        title:{'create':'添加数据','update':'修改数据'},
        inputBlur:financeHelper.checkInput,
        inputFocus:financeHelper.initInput,
        buttonFlag:false,
        allInputValidCheck:function(inputAttr){
            $scope.modal.buttonFlag=financeHelper.allInputValidCheck(inputAttr)
        },
        CRUDOperation:{
            'create':function(idx,inputAttr,recorder){
                financeCRUDHelper.billType.create(idx,inputAttr,recorder);
                $scope.switchDialogStatus()
            },
            'update':function(idx,inputAttr,recorder){
                financeCRUDHelper.billType.update(idx,inputAttr,recorder);
                $scope.switchDialogStatus();
            },
        },
/*        CRUD
        createNewRecorder:financeCRUDHelper.billType.create,
        updateRecorder:financeCRUDHelper.billType.update,*/
    }
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
    
    helper.adjustFooterPosition()
    
    $scope.deleteQueryValue=financeHelper.deleteQueryValue
    $scope.addQueryValue=financeHelper.addQueryValue

    $scope.change=function(selectedQueryField){

        $scope.allData.selectedQueryField=selectedQueryField
    }

    $scope.clickQueryFlag=function(){
        $scope.allData.queryFieldEnable=!$scope.allData.queryFieldEnable
    }

    //需要设modal为show，才能计算modal的高度
    $('#modal').addClass('show')
    helper.verticalCenter('CRUDRecorder')
    $('#modal').removeClass('show')
    
    $scope.switchDialogStatus=function(){
        $scope.allData.recorderDialogShow=!$scope.allData.recorderDialogShow
    }
    
    $scope.setOperationType=function(type,idx){
        $scope.allData.currentOperation=type
        $scope.allData.currentIdx=idx
    }

    $scope.loadData=function(idx,inputAttr,recorder){
        for(var field in inputAttr){
            inputAttr[field]['value']=recorder[idx][]

        }
    }
})
app.controller('configuration.departmentInfo.Controller',function($scope,cont,basicHelper,helper,$sce,financeHelper){
    $scope.allData={
        inputAttr:cont.inputAttr.department,//CRUD记录的时候，对输入进行设置
        inputRule:cont.inputRule.department,//CRUD，对输入进行设置（min/maxLength）以及进行检测
        recorder:[//使用数组，以便判断是否为空
        ],

        queryFieldEnable:false,//当前 字段查询是否展开

        selectedQueryField:'',
        queryField:cont.queryField.department, //可选的查询字段

        suggestValue:{suggest:suggest_state},//当前select下拉值
        selectedValue:undefined,//下拉菜单中选中的值
        dirty:'', //当前选择的查询值

        activeQueryValue:{},//当前生效的查询字段和查询值 {field:['value1','value2']}
    }

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

    helper.adjustFooterPosition()
    //需要设modal为show，才能计算modal的高度
    $('#modal').addClass('show')
    helper.verticalCenter('CRUDRecorder')
    $('#modal').removeClass('show')

    $scope.switchDialogStatus=function(){
        $scope.allData.recorderDialogShow=!$scope.allData.recorderDialogShow
    }
    $scope.deleteQueryValue=financeHelper.deleteQueryValue
    $scope.addQueryValue=financeHelper.addQueryValue

    $scope.change=function(selectedQueryField){

        $scope.allData.selectedQueryField=selectedQueryField
    }

    $scope.clickQueryFlag=function(){
        $scope.allData.queryFieldEnable=!$scope.allData.queryFieldEnable
    }
})
app.controller('configuration.employeeInfo.Controller',function($scope,cont,basicHelper,helper,$sce,financeHelper){
    $scope.allData={
        inputAttr:cont.inputAttr.employee,//CRUD记录的时候，对输入进行设置
        inputRule:cont.inputRule.employee,//CRUD，对输入进行设置（min/maxLength）以及进行检测
        recorder:[
            {name:'张三',leaderName:"王五",departmentName:'工业部',onBoardDate:new Date(),cDate:new Date()},
            {name:'李四',leaderName:"王五",departmentName:'工业部',onBoardDate:new Date(),cDate:new Date()},
        //使用数组，以便判断是否为空
        ],

        queryFieldEnable:false,//当前 字段查询是否展开

        selectedQueryField:'',
        queryField:cont.queryField.employee, //可选的查询字段

        suggestValue:{suggest:suggest_state},//当前select下拉值
        selectedValue:undefined,//下拉菜单中选中的值
        dirty:'', //当前选择的查询值

        activeQueryValue:{},//当前生效的查询字段和查询值 {field:['value1','value2']}
    }

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

    helper.adjustFooterPosition()
    //需要设modal为show，才能计算modal的高度
    $('#modal').addClass('show')
    helper.verticalCenter('CRUDRecorder')
    $('#modal').removeClass('show')

    $scope.switchDialogStatus=function(){
        $scope.allData.recorderDialogShow=!$scope.allData.recorderDialogShow
    }
    $scope.deleteQueryValue=financeHelper.deleteQueryValue
    $scope.addQueryValue=financeHelper.addQueryValue

    $scope.change=function(selectedQueryField){

        $scope.allData.selectedQueryField=selectedQueryField
    }

    $scope.clickQueryFlag=function(){
        $scope.allData.queryFieldEnable=!$scope.allData.queryFieldEnable
    }

})

app.controller('billController',function($scope,cont,helper){
    $scope.adjustFooterPosition=function(){
        //console.log('main resize')
        helper.adjustFooterPosition()
    }
})
app.controller('bill.billInfo.Controller',function($scope,cont,basicHelper,helper,$sce,financeHelper){
    $scope.allData={
        inputAttr:cont.inputAttr.bill,//CRUD记录的时候，对输入进行设置
        inputRule:cont.inputRule.bill,//CRUD，对输入进行设置（min/maxLength）以及进行检测
        recorder:[
            {title:'asb',content:"打车费",billName:'加班费',billDate:new Date(),amount:1000,cDate:new Date()},
            {title:'alu',content:"餐费",billName:'加班费',billDate:new Date(),amount:2000,cDate:new Date()},
            //使用数组，以便判断是否为空
        ],

        queryFieldEnable:false,//当前 字段查询是否展开

        selectedQueryField:'',
        queryField:cont.queryField.bill, //可选的查询字段

        suggestValue:{suggest:suggest_state},//当前select下拉值
        selectedValue:undefined,//下拉菜单中选中的值
        dirty:'', //当前选择的查询值

        activeQueryValue:{},//当前生效的查询字段和查询值 {field:['value1','value2']}
        
        modal:{
            title:'添加'
        }
    }
    

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

    helper.adjustFooterPosition()
    //初始时，先瞬时show modal，才能计算modal的高度，之后立刻hide modal
    $('#modal').addClass('show')
    helper.verticalCenter('CRUDRecorder')
    $('#modal').removeClass('show')

    $scope.switchDialogStatus=function(){
        $scope.allData.recorderDialogShow=!$scope.allData.recorderDialogShow
    }
    $scope.deleteQueryValue=financeHelper.deleteQueryValue
    $scope.addQueryValue=financeHelper.addQueryValue

    $scope.change=function(selectedQueryField){

        $scope.allData.selectedQueryField=selectedQueryField
    }

    $scope.clickQueryFlag=function(){
        $scope.allData.queryFieldEnable=!$scope.allData.queryFieldEnable
    }
})