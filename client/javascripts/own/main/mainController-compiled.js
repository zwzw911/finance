'use strict';

/**
 * Created by ada on 2016/8/28.
 */
var app = angular.module('app', ['ui.router', 'ui.event', 'ngSanitize', 'MassAutoComplete', 'contDefine', 'component', 'finance']);
app.constant('appCont', {
    //和server不同，此处的配置，只是为了将外键的ObjectID替换成人类可读的字符串，（暂时）是1：1的关系
    //格式还是采用object，以便后续可以加入其他选项
    //nestedPrefix用来删除对应的字段，因为这些字段只是server用来serach用，无需在client显示
    fkRedundancyFields: {
        billType: {
            parentBillType: { nestedPrefix: 'parentBillTypeFields', fields: ['name'] }
        },
        department: {
            parentDepartment: { fields: ['name'] }
        },
        employee: {
            leader: { fields: ['name'] },
            department: { fields: ['name'] }
        },
        bill: {
            billType: { fields: ['name'] },
            reimburser: { fields: ['name'] }
        }
    },
    coll: {
        'billType': 'billType',
        'department': 'department',
        'employee': 'employee',
        'bill': 'bill'
    },
    collNameSearch: {
        'billType': 'name',
        'department': 'name',
        'employee': 'name',
        'bill': 'title'
    },
    //每个coll中，类型为date的字段。用来再cilent对server返回的数据进行日期处理
    dateField: {
        billType: ['cDate', 'uDate'],
        bill: ['billDate', 'cDate', 'uDate'],
        employee: ['cDate', 'uDate'],
        department: ['cDate', 'uDate']
    }
});

app.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true); //为了去除url中的#

    $urlRouterProvider.when("", "/configuration").otherwise("/");
    $stateProvider.state('configuration', {
        url: '/configuration',
        templateUrl: 'configuration.ejs',
        controller: 'configurationController' }).state('configuration.billType', {
        url: '/billType',
        templateUrl: 'configuration.billType.ejs',
        controller: 'configuration.billType.Controller'
    }).state('configuration.departmentInfo', {
        url: '/departmentInfo',
        templateUrl: 'configuration.departmentInfo.ejs',
        controller: 'configuration.departmentInfo.Controller'
    }).state('configuration.employeeInfo', {
        url: '/employeeInfo',
        templateUrl: 'configuration.employeeInfo.ejs',
        controller: 'configuration.employeeInfo.Controller'
    }).state('bill', {
        url: '/bill',
        templateUrl: 'bill.ejs',
        controller: 'billController'
    }).state('bill.billInfo', {
        url: '/billInfo',
        templateUrl: 'bill.billInfo.ejs',
        controller: 'bill.billInfo.Controller'
    });
});

app.controller('mainController', function ($scope, htmlHelper) {
    htmlHelper.adjustFooterPosition();

    window.onresize = function () {
        htmlHelper.adjustFooterPosition();
        htmlHelper.verticalModalCenter('CRUDRecorder');
    };
});

app.controller('configurationController', function ($scope, htmlHelper) {
    htmlHelper.adjustFooterPosition();
    $scope.adjustFooterPosition = function () {
        //console.log('configuration resize')
        htmlHelper.adjustFooterPosition();
    };
});

/*test=function(){
    console.log('test in')
}*/
app.controller('configuration.billType.Controller', function ($scope, $q, $sce, appCont, cont, contEnum, inputAttrHelper, htmlHelper, validateHelper, financeHelper, commonHelper, financeCRUDHelper) {

    //需要用到的数据
    $scope.allData = {
        inputAttr: cont.inputAttr.billType, //CRUD记录的时候，对输入进行设置
        inputRule: cont.inputRule.billType, //CRUD，对输入进行设置（min/maxLength）以及进行检测
        //存储当前载入的数据，数组，以便判断是否为空
        recorder: [],

        queryFieldEnable: false, //当前 字段查询是否展开

        selectedQueryField: '', //当前选中的查询字段
        selectedQueryFieldValue: undefined, //下拉菜单中选中的值
        queryField: cont.queryField.billType, //可选的查询字段

        activeQueryValue: {}, //当前生效的查询字段和查询值 {field:['value1','value2']}   采用{}初始化，则可以直接通过函数的参数进行修改；缺点是无法在前端判断是否为{}

        recorderDialogShow: false, //当前modal-dialog是否显示（用来add/modify记录）

        //从finance/financeCRUDHelper中载入对应CRUD方法
        //CRUDOperation:financeCRUDHelper.billType,

        // currentOperation:'',
        currentIdx: -1, //当前操作的记录的idx

        selectedAC: {
            name: { value: null, _id: null },
            parentBillType: { value: null, _id: null } },

        currentOpType: null

    };

    //}
    $scope.allFunc = {
        loadCurrentData: function loadCurrentData(idx, inputAttr, recorder) {
            inputAttrHelper.loadCurrentData(idx, inputAttr, recorder);
        },
        initAllFieldInputAttr: function initAllFieldInputAttr(inputAttr) {
            $scope.modal.buttonFlag = true;
            //console.log(`optype is ${}`)
            if (contEnum.opType.create === $scope.allData.currentOpType) {
                inputAttrHelper.initAllFieldInputAttrCreate(inputAttr);
            }
            if (contEnum.opType.update === $scope.allData.currentOpType) {
                inputAttrHelper.initAllFieldInputAttrUpdate(inputAttr);
            }
        },
        initSingleFieldInputAttr: function initSingleFieldInputAttr(field, inputAttr) {
            //console.log(`field is ${field}`)
            //console.log(`inputAttr is ${JSON.stringify(inputAttr)}`)
            $scope.modal.buttonFlag = true;
            if (contEnum.opType.create === $scope.allData.currentOpType) {
                inputAttrHelper.initSingleFieldInputAttrCreate(field, inputAttr);
            }
            if (contEnum.opType.update === $scope.allData.currentOpType) {
                inputAttrHelper.initSingleFieldInputAttrUpdate(field, inputAttr);
            }
            // financeHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
        },
        setCurrentOpTypeCreate: function setCurrentOpTypeCreate() {
            $scope.allData.currentOpType = contEnum.opType.create;
        },
        setCurrentOpTypeUpdate: function setCurrentOpTypeUpdate() {
            $scope.allData.currentOpType = contEnum.opType.update;
        },
        setCurrentOpTypeDelete: function setCurrentOpTypeDelete() {
            $scope.allData.currentOpType = contEnum.opType.delete;
        },
        setCurrentOpTypeSearch: function setCurrentOpTypeSearch() {
            $scope.allData.currentOpType = contEnum.opType.search;
        },

        CRUDOperation: function CRUDOperation(idx, inputAttr, recorder, selectedAC) {
            console.log('current op type is ' + $scope.allData.currentOpType.toString());
            console.log('current selectedAC is ' + selectedAC);
            if (contEnum.opType.create === $scope.allData.currentOpType) {
                if ($scope.modal.buttonFlag) {
                    financeCRUDHelper.dataOperator.billType.create(idx, inputAttr, recorder, selectedAC, appCont.fkRedundancyFields.billType, appCont.coll.billType, appCont.dateField.billType);
                    $scope.allFunc.switchDialogStatus();
                }
            }
            if (contEnum.opType.update === $scope.allData.currentOpType) {
                if ($scope.modal.buttonFlag) {
                    financeCRUDHelper.dataOperator.billType.update(idx, inputAttr, recorder, selectedAC, appCont.fkRedundancyFields.billType, appCont.coll.billType, appCont.dateField.billType);
                    $scope.allFunc.switchDialogStatus();
                }
            }
            if (contEnum.opType.delete === $scope.allData.currentOpType) {
                //if($scope.modal.buttonFlag){
                financeCRUDHelper.dataOperator.billType.delete(idx, recorder, appCont.coll.billType);
                //$scope.switchDialogStatus();
                //}
            }
            if (contEnum.opType.search === $scope.allData.currentOpType) {
                //if($scope.modal.buttonFlag){
                console.log('enter search');
                console.log('origin search is ' + JSON.stringify($scope.allData.activeQueryValue));
                console.log('origin fkconfig is ' + JSON.stringify(appCont.fkRedundancyFields.billType));
                var convertedValue = financeHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue, appCont.fkRedundancyFields.billType);
                console.log('search convert result is ' + JSON.stringify(convertedValue));
                financeCRUDHelper.dataOperator.billType.search(recorder, convertedValue, appCont.fkRedundancyFields.billType, appCont.coll.billType, appCont.dateField.billType);
                //$scope.switchDialogStatus();
                //}
            }
        },

        //当input提供autoComplete功能时，blur要做的操作
        //因为需要额外的检测当前input的value是否有对应的外键（是否为－1），所以独立为一个函数
        //currentId:当前记录的objId（如果是create，为undefined）
        acBlur: function acBlur(field, inputAttr, currentId) {
            console.log('field is ' + field + ',currentId is ' + currentId + ',ac field is ' + JSON.stringify($scope.allData.selectedAC[field]) + ',current op type is ' + contEnum.opType.update.toString());
            // if(contEnum.opType.update===$scope.allData.currentOpType){
            //     inputAttrHelper.initSingleFieldInputAttrUpdate(field,inputAttr)
            // }

            //console.log(`check id is ${$scope.allData.selectedAC[field]}`)
            //acBlur无需检测input（min/max/minLength等），只需检测a，是否选择（null或者objId），b.是否和当前一样（不能把自己当成自己的父）
            if (-1 === $scope.allData.selectedAC[field]['_id']) {
                // console.log(`before msg is ${JSON.stringify(inputAttr[field])}`)
                inputAttrHelper.setSingleInputAttrErrorMsg(field, inputAttr, '' + inputAttr[field]['chineseName'] + inputAttr[field]['value'] + '不存在');
                //console.log(`after err msg is ${JSON.stringify(JSON.stringify(inputAttr[field]))}`)
                //return false
            } else {
                console.log('check is self');
                //只有update的时候，才需要判断是否为自己
                if (contEnum.opType.update === $scope.allData.currentOpType && $scope.allData.selectedAC[field]['_id'] === currentId) {
                    // console.log(`check is self in`)
                    inputAttrHelper.setSingleInputAttrErrorMsg(field, inputAttr, inputAttr[field]['chineseName'] + '不能为自己');
                }
                if (contEnum.opType.create === $scope.allData.currentOpType) {
                    inputAttrHelper.initSingleFieldInputAttrUpdate(field, inputAttr);
                    inputAttr[field]['value'] = $scope.allData.selectedAC[field]['value'];
                }
            }

            /*            else{
                            financeHelper.checkInput(field,inputRule,inputAttr)
                        }*/

            //modal.allInputValidCheck(inputAttr)
            $scope.modal.buttonFlag = inputAttrHelper.allInputValidCheck(inputAttr);
            /*            console.log(`validate result is ${JSON.stringify(inputAttr)}`)
                        console.log(`but flag is ${$scope.modal.buttonFlag}`)*/
        },

        nonAcBlur: function nonAcBlur(field, inputRule, inputAttr) {
            validateHelper.checkInput(field, inputRule, inputAttr);
            $scope.modal.buttonFlag = inputAttrHelper.allInputValidCheck(inputAttr);
        },

        /*        allInputValidCheck:function(inputAttr){
                    $scope.modal.buttonFlag=inputAttrHelper.allInputValidCheck(inputAttr)
                },*/
        //create/update

        allCheckInput: function allCheckInput(inputRule, inputAttr) {
            validateHelper.allCheckInput(inputRule, inputAttr);
        },

        //从activatedQueryValue中删除value
        //queryFiled:parentBillType
        //queryValue:'a'
        //activatedQueryValue:{parentBillType:['a','b']}
        deleteQueryValue: function deleteQueryValue(queryFiled, queryValue, activatedQueryValue) {
            financeHelper.deleteQueryValue(queryFiled, queryValue, activatedQueryValue);
            console.log('after delete query value ' + activatedQueryValue);
        },
        // $scope.addQueryValue=financeHelper.addQueryValue
        addQueryValue: function addQueryValue(queryFiled, queryValue, activatedQueryValue) {
            console.log('add query in');
            console.log('activatedQueryValue length is ' + Object.keys($scope.allData.activeQueryValue).length);
            financeHelper.addQueryValue(queryFiled, queryValue, appCont.fkRedundancyFields.billType, activatedQueryValue);
            console.log('after add query value ' + JSON.stringify(activatedQueryValue));
        },
        /*        //转换成server端格式
                convertAddQueryValueToServerFormat:function(activateQueryFieldAndValue,fkConfig){
                    financeHelper.convertAddQueryValueToServerFormat()
                },*/
        queryFieldChange: function queryFieldChange(selectedQueryField) {
            $scope.allData.selectedQueryFieldValue = '';
        },
        isActiveQueryValueEmpty: function isActiveQueryValueEmpty() {
            return Object.keys($scope.allData.activeQueryValue).length === 0;
        },
        clickQueryFlag: function clickQueryFlag() {
            $scope.allData.queryFieldEnable = !$scope.allData.queryFieldEnable;
        },

        switchDialogStatus: function switchDialogStatus() {
            $scope.allData.recorderDialogShow = !$scope.allData.recorderDialogShow;
            htmlHelper.verticalModalCenter('CRUDRecorder');
        },

        setCurrentIdx: function setCurrentIdx(idx) {
            $scope.allData.currentIdx = idx;
        },

        //因为需要对$scope.allData下的数据进行操作，所以不能单独放到一个module中，只能放在controller中
        acFun: {
            //for query and update
            parentBillType: {
                suggest: function suggest(name) {
                    var deferred = $q.defer();
                    financeCRUDHelper.dataOperator.billType.readName(name, appCont.coll.billType, appCont.collNameSearch.billType).success(function (data, status, header, config) {
                        //$scope.allData.inputAttr['parentBillType']['suggestList']=[]
                        var tmpResult = [];
                        //console.log(`get suggest result is ${data.msg}`)
                        //初始设为-1
                        if ('' !== name && null !== name) {
                            $scope.allData.selectedAC.parentBillType._id = -1;
                        }

                        if (data.msg.length > 0) {
                            data.msg.forEach(function (e) {
                                //label:下拉菜单中的选项，value：选中后显示的内容，id:选中项目的id（用作外键）
                                tmpResult.push({ label: e.name, value: e.name, id: e._id });
                                //如果当前输入的值存在选项中，隐式的认为此值被选中
                                console.log('suggest change: term is ' + name + ', item name is ' + e.name);
                                if (name === e.name) {
                                    //console.log(`input is selet`)
                                    $scope.allData.selectedAC.parentBillType._id = e._id;
                                    $scope.allData.selectedAC.parentBillType.value = name;
                                    console.log('set id is ' + JSON.stringify($scope.allData.selectedAC.parentBillType));
                                }
                            });
                            deferred.resolve(tmpResult);
                            //$scope.allData.inputAttr['parentBillType']['suggestList']=$scope.suggestListValue.parentBillType
                            //$scope.suggestListValue
                        }
                    }).error(function (data, status, header, config) {
                        deferred.resolve({ rc: 9999, msg: data });
                    });
                    return deferred.promise;
                },
                on_select: function on_select(selected) {
                    console.log('selected is ' + JSON.stringify(selected));
                    $scope.allData.selectedAC.parentBillType._id = selected.id;
                    $scope.allData.selectedAC.parentBillType.value = selected.value;
                }
            },
            //only for query。query的时候，提供可能的选项
            name: {
                suggest: function suggest(name) {
                    var deferred = $q.defer();
                    financeCRUDHelper.dataOperator.billType.readName(name).success(function (data, status, header, config) {

                        var tmpResult = [];
                        //console.log(`get suggest result is ${data.msg}`)
                        //初始设为-1
                        if ('' !== name && null !== name) {
                            $scope.allData.selectedAC.name._id = -1;
                        }

                        if (data.msg.length > 0) {
                            data.msg.forEach(function (e) {
                                //label:下拉菜单中的选项，value：选中后显示的内容，id:选中项目的id（用作外键）
                                tmpResult.push({ label: e.name, value: e.name, id: e._id });
                                //如果当前输入的值存在选项中，隐式的认为此值被选中
                                console.log('suggest change: term is ' + name + ', item name is ' + e.name);
                                if (name === e.name) {
                                    //console.log(`input is selet`)
                                    $scope.allData.selectedAC.name._id = e._id;
                                    console.log('set id is ' + $scope.allData.selectedAC.name);
                                }
                            });
                            deferred.resolve(tmpResult);
                            //$scope.allData.inputAttr['parentBillType']['suggestList']=$scope.suggestListValue.parentBillType
                            //$scope.suggestListValue
                        }
                    }).error(function (data, status, header, config) {
                        deferred.resolve({ rc: 9999, msg: data });
                    });
                    return deferred.promise;
                },
                on_select: function on_select(selected) {
                    console.log('selected is ' + JSON.stringify(selected));
                    $scope.allData.selectedAC.billType = selected.id;
                }
            }
        }
    };

    $scope.modal = {
        title: { 'create': '添加数据', 'update': '修改数据' },
        buttonFlag: true };

    htmlHelper.adjustFooterPosition();
    //初始化调用


    //同时提供query和update时使用
    $scope.allData.inputAttr['parentBillType']['suggestList'] = $scope.allFunc.acFun.parentBillType;
    //only for query
    $scope.allData.inputAttr['name']['suggestList'] = $scope.allFunc.acFun.name;

    financeCRUDHelper.dataOperator.billType.read($scope.allData.recorder, appCont.fkRedundancyFields.billType, appCont.coll.billType, appCont.dateField.billType);
});

/*
app.controller('configuration.departmentInfo.Controller',function($scope,cont,basicHelper,helper,$sce,financeHelper,financeCRUDHelper,contEnum){
    $scope.allData={
        inputAttr:cont.inputAttr.department,//CRUD记录的时候，对输入进行设置
        inputRule:cont.inputRule.department,//CRUD，对输入进行设置（min/maxLength）以及进行检测
        recorder:[//使用数组，以便判断是否为空
        ],

        queryFieldEnable:false,//当前 字段查询是否展开

        selectedQueryField:'', //当前选中的查询字段
        selectedQueryFieldValue:undefined,//下拉菜单中选中的值
        queryField:cont.queryField.department, //可选的查询字段

        activeQueryValue:{},//当前生效的查询字段和查询值 {field:['value1','value2']}

        recorderDialogShow:false,//当前modal-dialog是否显示（用来add/modify记录）

        //从finance/financeCRUDHelper中载入对应CRUD方法
        CRUDOperation:financeCRUDHelper.department,

        currentOperation:'',
        currentIdx:-1, //当前操作的记录的idx

        currentOpType:null,

        loadCurrentData:function(idx,inputAttr,recorder){
            financeHelper.loadCurrentData(idx,inputAttr,recorder);
        },
        initAllFieldInputAttr:function(inputAttr){
            $scope.modal.buttonFlag=true;
            financeHelper.initAllFieldInputAttr(inputAttr,this.currentOpType)
        },
        initSingleFieldInputAttr:function(field,inputAttr){
            $scope.modal.buttonFlag=true;
            financeHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
        }
    }
    //当前字段对应的coll/field（从哪个coll/field获得值来完成autocomplete功能）
    var tmpStr,tmpColl,tmpField
    for(var field in $scope.allData.inputAttr){
        if(true===$scope.allData.inputAttr[field]['isQueryAutoComplete'] || true===$scope.allData.inputAttr[field]['isCRUDAutoComplete']){
            if(''===$scope.allData.inputAttr[field]['autoCompleteCollField']){
                alert('配置错误')
            }else{
                tmpStr=$scope.allData.inputAttr[field]['autoCompleteCollField'].split('.')
                tmpColl=tmpStr[0]
                tmpField=tmpStr[1]
                //添加/修改记录的时候 提供autoComplete功能
                $scope.allData.inputAttr[field]['suggestList']={suggest:financeCRUDHelper.suggest_state[tmpColl][tmpField]}
            }
        }
    }

    $scope.modal={
        commonError:"commonError",//create或者update是，发生的非field错误
        title:{'create':'添加数据','update':'修改数据'},
        inputBlur:financeHelper.checkInput,
        inputFocus:financeHelper.initSingleFieldInputAttr,
        buttonFlag:true,//初始为true
        allInputValidCheck:function(inputAttr){
            $scope.modal.buttonFlag=financeHelper.allInputValidCheck(inputAttr)
        },
        CRUDOperation:{
            //此处idx只是为了格式统一，实际没用
            'create':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeCRUDHelper.department.create(idx,inputAttr,recorder);
                    $scope.switchDialogStatus()
                }
            },
            'update':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeCRUDHelper.department.update(idx,inputAttr,recorder);
                    $scope.switchDialogStatus();
                }
            },
        },
        allCheckInput:financeHelper.allCheckInput,

    }

    helper.adjustFooterPosition()
    //初始化调用


    $scope.deleteQueryValue=financeHelper.deleteQueryValue
    $scope.addQueryValue=financeHelper.addQueryValue

    $scope.change=function(selectedQueryField){
        $scope.allData.selectedQueryFieldValue=''
    }

    $scope.clickQueryFlag=function(){
        $scope.allData.queryFieldEnable=!$scope.allData.queryFieldEnable
    }



    $scope.switchDialogStatus=function(){
        $scope.allData.recorderDialogShow=!$scope.allData.recorderDialogShow
        helper.verticalModalCenter('CRUDRecorder')
    }
    $scope.setOperationType=function(type,idx){
        $scope.allData.currentOperation=type
        $scope.allData.currentIdx=idx
    }
})



app.controller('configuration.employeeInfo.Controller',function($scope,cont,basicHelper,helper,$sce,financeHelper,financeCRUDHelper,contEnum){
    $scope.allData={
        inputAttr:cont.inputAttr.employee,//CRUD记录的时候，对输入进行设置
        inputRule:cont.inputRule.employee,//CRUD，对输入进行设置（min/maxLength）以及进行检测
        //使用数组，以便判断是否为空
        recorder:[
            {name:'张三',leaderName:"王五",departmentName:'工业部',onBoardDate:new Date(),cDate:new Date()},
            {name:'李四',leaderName:"王五",departmentName:'工业部',onBoardDate:new Date(),cDate:new Date()},

        ],

        queryFieldEnable:false,//当前 字段查询是否展开

        selectedQueryField:'', //当前选中的查询字段
        selectedQueryFieldValue:undefined,//下拉菜单中选中的值
        queryField:cont.queryField.employee, //可选的查询字段

        activeQueryValue:{},//当前生效的查询字段和查询值 {field:['value1','value2']}
        recorderDialogShow:false,//当前modal-dialog是否显示（用来add/modify记录）

        //从finance/financeCRUDHelper中载入对应CRUD方法
        CRUDOperation:financeCRUDHelper.employee,

        currentOperation:'',
        currentIdx:-1, //当前操作的记录的idx

        currentOpType:null,

        loadCurrentData:function(idx,inputAttr,recorder){
// console.log('load data')
            financeHelper.loadCurrentData(idx,inputAttr,recorder);
        },
        initAllFieldInputAttr:function(inputAttr){
            $scope.modal.buttonFlag=true;
            financeHelper.initAllFieldInputAttr(inputAttr,this.currentOpType)
        },
        initSingleFieldInputAttr:function(field,inputAttr){
            $scope.modal.buttonFlag=true;
            financeHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
        }
    }

    //当前字段对应的coll/field（从哪个coll/field获得值来完成autocomplete功能）
    var tmpStr,tmpColl,tmpField
    for(var field in $scope.allData.inputAttr){
        if(true===$scope.allData.inputAttr[field]['isQueryAutoComplete'] || true===$scope.allData.inputAttr[field]['isCRUDAutoComplete']){

            if(''===$scope.allData.inputAttr[field]['autoCompleteCollField']){
                alert('配置错误')
            }else{
                tmpStr=$scope.allData.inputAttr[field]['autoCompleteCollField'].split('.')
                tmpColl=tmpStr[0]
                tmpField=tmpStr[1]
                //添加/修改记录的时候 提供autoComplete功能
                $scope.allData.inputAttr[field]['suggestList']={suggest:financeCRUDHelper.suggest_state[tmpColl][tmpField]}
            }
        }
    }

    $scope.modal={
        title:{'create':'添加数据','update':'修改数据'},
        inputBlur:financeHelper.checkInput,
        inputFocus:financeHelper.initSingleFieldInputAttr,
        buttonFlag:true,//初始为true
        allInputValidCheck:function(inputAttr){
            $scope.modal.buttonFlag=financeHelper.allInputValidCheck(inputAttr)
        },
        CRUDOperation:{
            'create':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeCRUDHelper.employee.create(idx,inputAttr,recorder);
                    $scope.switchDialogStatus()
                }
            },
            'update':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeCRUDHelper.employee.update(idx,inputAttr,recorder);
                    $scope.switchDialogStatus();
                }
            },
        },
        allCheckInput:financeHelper.allCheckInput,

    }

    helper.adjustFooterPosition()

    $scope.deleteQueryValue=financeHelper.deleteQueryValue
    $scope.addQueryValue=financeHelper.addQueryValue

    $scope.change=function(selectedQueryField){
        $scope.allData.selectedQueryFieldValue=''
    }

    $scope.clickQueryFlag=function(){
        $scope.allData.queryFieldEnable=!$scope.allData.queryFieldEnable
    }


    $scope.switchDialogStatus=function(){
        $scope.allData.recorderDialogShow=!$scope.allData.recorderDialogShow
        helper.verticalModalCenter('CRUDRecorder')
    }
    $scope.setOperationType=function(type,idx){
        $scope.allData.currentOperation=type
        $scope.allData.currentIdx=idx
    }
})

app.controller('billController',function($scope,cont,helper){
    $scope.adjustFooterPosition=function(){
        //console.log('main resize')
        helper.adjustFooterPosition()
    }

/!*    window.onresize=function(){
        helper.adjustFooterPosition()

        //窗口位置大小变化时，重新设置modal的top
        //每次都要先瞬时显示dialog，以便计算高度
        //首先判断当前modal是否显示，没有的话才瞬时显示
        if(false===$('#modal').hasClass('show')){
            $('#modal').addClass('show')
        }
        helper.verticalCenter('CRUDRecorder')
        //当前modal没有打开，则瞬时显示计算完毕后，立刻消失
        if(false===$('#modal').hasClass('show')){
            $('#modal').removeClass('show')
        }

    }*!/
})



app.controller('bill.billInfo.Controller',function($scope,cont,basicHelper,helper,$sce,financeHelper,financeCRUDHelper,contEnum){
    $scope.allData={
        inputAttr:cont.inputAttr.bill,//CRUD记录的时候，对输入进行设置
        inputRule:cont.inputRule.bill,//CRUD，对输入进行设置（min/maxLength）以及进行检测
        //使用数组，以便判断是否为空
        recorder:[
            {title:'asb',content:"打车费",billName:'加班费',billDate:new Date(),amount:1000,cDate:new Date()},
            {title:'alu',content:"餐费",billName:'加班费',billDate:new Date(),amount:2000,cDate:new Date()},
        ],

        queryFieldEnable:false,//当前 字段查询是否展开

        selectedQueryField:'', //当前选中的查询字段
        selectedQueryFieldValue:undefined,//下拉菜单中选中的值
        queryField:cont.queryField.bill, //可选的查询字段


        activeQueryValue:{},//当前生效的查询字段和查询值 {field:['value1','value2']}
        recorderDialogShow:false,//当前modal-dialog是否显示（用来add/modify记录）

        //从finance/financeCRUDHelper中载入对应CRUD方法
        CRUDOperation:financeCRUDHelper.bill,

        currentOperation:'',
        currentIdx:-1, //当前操作的记录的idx

        currentOpType:null,

        loadCurrentData:function(idx,inputAttr,recorder){
// console.log('load data')
            financeHelper.loadCurrentData(idx,inputAttr,recorder);
        },
        initAllFieldInputAttr:function(inputAttr){
            $scope.modal.buttonFlag=true;
            financeHelper.initAllFieldInputAttr(inputAttr,this.currentOpType)
        },
        initSingleFieldInputAttr:function(field,inputAttr){
            $scope.modal.buttonFlag=true;
            financeHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
        }
    }

    //当前字段对应的coll/field（从哪个coll/field获得值来完成autocomplete功能）
    var tmpStr,tmpColl,tmpField
    for(var field in $scope.allData.inputAttr){
        if(true===$scope.allData.inputAttr[field]['isQueryAutoComplete'] || true===$scope.allData.inputAttr[field]['isCRUDAutoComplete']){
            if(''===$scope.allData.inputAttr[field]['autoCompleteCollField']){
                alert('配置错误')
            }else{
                tmpStr=$scope.allData.inputAttr[field]['autoCompleteCollField'].split('.')
                tmpColl=tmpStr[0]
                tmpField=tmpStr[1]
                //添加/修改记录的时候 提供autoComplete功能
                $scope.allData.inputAttr[field]['suggestList']={suggest:financeCRUDHelper.suggest_state[tmpColl][tmpField]}
            }
        }
    }

    $scope.modal={
        title:{'create':'添加数据','update':'修改数据'},
        inputBlur:financeHelper.checkInput,
        inputFocus:financeHelper.initSingleFieldInputAttr,
        buttonFlag:true,//初始为true
        allInputValidCheck:function(inputAttr){
            $scope.modal.buttonFlag=financeHelper.allInputValidCheck(inputAttr)
        },
        CRUDOperation:{
            'create':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeCRUDHelper.department.create(idx,inputAttr,recorder);
                    $scope.switchDialogStatus()
                }
            },
            'update':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeCRUDHelper.department.update(idx,inputAttr,recorder);
                    $scope.switchDialogStatus();
                }
            },
        },
        allCheckInput:financeHelper.allCheckInput,

    }

    helper.adjustFooterPosition()

    $scope.deleteQueryValue=financeHelper.deleteQueryValue
    $scope.addQueryValue=financeHelper.addQueryValue

    $scope.change=function(selectedQueryField){
        $scope.allData.selectedQueryFieldValue=''
    }

    $scope.clickQueryFlag=function(){
        $scope.allData.queryFieldEnable=!$scope.allData.queryFieldEnable
    }


    $scope.switchDialogStatus=function(){
        $scope.allData.recorderDialogShow=!$scope.allData.recorderDialogShow
        helper.verticalModalCenter('CRUDRecorder')
    }
    $scope.setOperationType=function(type,idx){
        $scope.allData.currentOperation=type
        $scope.allData.currentIdx=idx
    }
})*/

//# sourceMappingURL=mainController-compiled.js.map