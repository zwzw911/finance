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
    },

    //临时存储   外键   的id，以便后续acBlur的时候检测是否   外键   正确
    selectedAC: {
        "department": {
            "parentDepartment": { "value": null, "_id": null }
        },
        "employee": {
            "leader": { "value": null, "_id": null },
            "department": { "value": null, "_id": null }
        },
        "billType": {
            "parentBillType": { "value": null, "_id": null } //value：选中的记录的名称，id：选中的记录的实际id。ac有时候需要显示给用户 字符，但实际传递给server id，以便操作
        },
        "bill": {
            "billType": { "value": null, "_id": null },
            "reimburser": { "value": null, "_id": null }
        }
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

app.factory('templateFunc', function ($q, $sce, appCont, cont, contEnum, inputAttrHelper, htmlHelper, validateHelper, queryHelper, commonHelper, financeHelper) {
    var generateControllerDate = function generateControllerDate(eColl) {
        return {
            inputAttr: cont.inputAttr[eColl], //CRUD记录的时候，对输入进行设置
            inputRule: cont.inputRule[eColl], //CRUD，对输入进行设置（min/maxLength）以及进行检测
            //存储当前载入的数据，数组，以便判断是否为空
            recorder: [],

            queryFieldEnable: false, //当前 字段查询是否展开

            selectedQueryField: '', //当前选中的查询字段
            selectedQueryFieldValue: undefined, //下拉菜单中选中的值
            queryField: cont.queryField[eColl], //可选的查询字段

            activeQueryValue: {}, //当前生效的查询字段和查询值 {field:['value1','value2']}   采用{}初始化，则可以直接通过函数的参数进行修改；缺点是无法在前端判断是否为{}

            recorderDialogShow: false, //当前modal-dialog是否显示（用来add/modify记录）

            currentIdx: -1, //当前操作的记录的idx

            //临时存储用户选择的外键值，之后在acBlur中进行检查此外键值是否validate
            //对于当前用户选择的记录，保存id，以便在create/update的时候，确保能上传正确的id值（acBlur的时候检查id，如果正确，将value保存到allData.inputAttr,告诉用户选择的外键值validate）
            //对于设置查询条件，直接保存到allData.inputAttr即可
            selectedAC: appCont.selectedAC[eColl],

            currentOpType: null
        };
    };

    function generateCreateUpdateModalInfo() {
        return {
            title: { 'create': '添加数据', 'update': '修改数据' },
            buttonFlag: true };
    }

    //此处$scope并非controlller中$scope，只是一个变量的名字；为了方便从controller中把function移植
    function allFunc($scope, eColl) {

        var fkConfig = appCont.fkRedundancyFields[eColl];
        //需要进行转换的日期字段名称
        var dateField = appCont.dateField[eColl];

        var allFuncResult = {
            //在对记录进行update的时候，根据idx，将recorder中的一个载入到inputAttr
            loadCurrentData: function loadCurrentData(idx, inputAttr, recorder) {
                inputAttrHelper.loadCurrentData(idx, inputAttr, recorder, fkConfig);
            },

            //初始化当前coll所有字段的inputAttr
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
                // queryHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
            },
            //因为create和update公用一个modal，所以需要设置opType来区分操作类型
            setCurrentOpTypeCreate: function setCurrentOpTypeCreate() {
                $scope.allData.currentOpType = contEnum.opType.create;
            },
            setCurrentOpTypeUpdate: function setCurrentOpTypeUpdate() {
                $scope.allData.currentOpType = contEnum.opType.update;
            },

            /*        setCurrentOpTypeDelete(){
             $scope.allData.currentOpType=contEnum.opType.delete
             },
             setCurrentOpTypeSearch(){
             $scope.allData.currentOpType=contEnum.opType.search
             },*/
            //不同操作，参数不一样，所以使用不同的函数（create update因为使用同一个modal，所以使用同一个函数，内部使用opType区分）
            CRUDOperation: {
                'createUpdate': function createUpdate(idx, inputAttr, recorder, selectedAC) {
                    if (contEnum.opType.create === $scope.allData.currentOpType) {
                        if ($scope.modal.buttonFlag) {
                            financeHelper.dataOperator.create(idx, inputAttr, recorder, selectedAC, fkConfig, eColl, dateField);
                            $scope.allFunc.switchDialogStatus();
                            //操作完成（无论成功失败），将操作类型 复位
                            $scope.allData.currentOpType = null;
                        }
                    }
                    if (contEnum.opType.update === $scope.allData.currentOpType) {
                        if ($scope.modal.buttonFlag) {
                            financeHelper.dataOperator.update(idx, inputAttr, recorder, selectedAC, fkConfig, eColl, dateField);
                            $scope.allFunc.switchDialogStatus();
                            //操作完成（无论成功失败），将操作类型 复位
                            $scope.allData.currentOpType = null;
                        }
                    }
                },
                'delete': function _delete(idx, recorder) {
                    financeHelper.dataOperator.delete(idx, recorder, eColl);
                },
                'search': function search(recorder) {
                    console.log('enter search');
                    console.log('origin search is ' + JSON.stringify($scope.allData.activeQueryValue));
                    console.log('origin fkconfig is ' + JSON.stringify(fkConfig));
                    var convertedValue = queryHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue, fkConfig);
                    console.log('search convert result is ' + JSON.stringify(convertedValue));

                    //没有任何查询条件，或者删除了所有查询条件
                    if (0 === Object.keys($scope.allData.activeQueryValue).length) {
                        financeHelper.dataOperator.read($scope.allData.recorder, fkConfig, eColl, dateField);
                    } else {
                        financeHelper.dataOperator.search(recorder, convertedValue, fkConfig, eColl, dateField);
                    }

                    $scope.allData.selectedQueryField = '';
                    $scope.allData.selectedQueryFieldValue = '';
                    //$scope.switchDialogStatus();
                }
            },

            //在crete/update记录时，如果input提供autoComplete功能时（一般是外键），blur时需要检测input的内容是否存在，不存在需要报错提示。
            //因为需要额外的检测当前input的value是否有对应的外键（是否为－1），所以独立为一个函数
            //currentId:当前记录的objId（如果是create，为undefined）
            acBlur: function acBlur(field, inputAttr, currentId) {
                console.log('acBlur field is ' + field + ',currentId is ' + currentId + ',ac field is ' + JSON.stringify($scope.allData.selectedAC[field]) + ',current op type is ' + contEnum.opType.update.toString());
                // if(contEnum.opType.update===$scope.allData.currentOpType){
                //     inputAttrHelper.initSingleFieldInputAttrUpdate(field,inputAttr)
                // }

                //console.log(`check id is ${$scope.allData.selectedAC[field]}`)
                //acBlur无需检测input（min/max/minLength等），只需检测a，是否选择（null或者objId），b.是否和当前一样（不能把自己当成自己的父）
                if (null === $scope.allData.selectedAC[field]['_id']) {
                    // console.log(`before msg is ${JSON.stringify(inputAttr[field])}`)
                    inputAttrHelper.setSingleInputAttrErrorMsg(field, inputAttr, '' + inputAttr[field]['chineseName'] + inputAttr[field]['value'] + '不存在');
                    //console.log(`after err msg is ${JSON.stringify(JSON.stringify(inputAttr[field]))}`)
                    //return false
                } else {
                    //input中的内容在db中有对应的记录
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
                 queryHelper.checkInput(field,inputRule,inputAttr)
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
                queryHelper.deleteQueryValue(queryFiled, queryValue, activatedQueryValue);
                console.log('after delete query value ' + activatedQueryValue);
            },
            // $scope.addQueryValue=queryHelper.addQueryValue
            addQueryValue: function addQueryValue(queryFiled, queryValue, activatedQueryValue) {
                console.log('add query in');
                console.log('activatedQueryValue length is ' + Object.keys($scope.allData.activeQueryValue).length);
                queryHelper.addQueryValue(queryFiled, queryValue, fkConfig, activatedQueryValue);
                console.log('after add query value ' + JSON.stringify(activatedQueryValue));
            },

            queryFieldChange: function queryFieldChange(selectedQueryField) {
                $scope.allData.selectedQueryFieldValue = '';
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

            //通用autoComplete，for both create/update and query
            //其中对selectedAC的处理，虽然也是for both create/update and query，但是实际只有在create/update的时候才会用到
            generateSuggestList: function generateSuggestList(eColl, fieldName) {
                //最终返回suggest和on_select的一个对应
                var suggestList = {};

                //设置suggest
                suggestList['suggest'] = function (name) {
                    var deferred = $q.defer();
                    var searchValue = {};
                    searchValue[fieldName] = {};
                    searchValue[fieldName]['value'] = name;
                    financeHelper.dataOperator.readName(searchValue, eColl).success(function (data, status, header, config) {
                        var tmpResult = [];
                        //console.log(`get suggest result is ${data.msg}`)
                        //如果当前的字段是外键（定义在allData.selectedAC中），需要确定的id，以便保存到数据库，则初始设为-1
                        if (true === fieldName in $scope.allData.selectedAC) {
                            if ('' !== name && null !== name) {
                                $scope.allData.selectedAC[fieldName]._id = null;
                                $scope.allData.selectedAC[fieldName].value = null;
                            }
                        }

                        if (data.msg.length > 0) {
                            data.msg.forEach(function (e) {
                                //label:下拉菜单中的选项，value：选中后显示的内容，id:选中项目的id（用作外键）
                                tmpResult.push({ label: e.name, value: e.name, id: e._id });
                                //如果当前的字段是外键（定义在allData.selectedAC中），且输入的值存在db中，则将id保存到selectedAC中，以便crete/update使用（query也保存，但是实际不使用），包括blur时做检测
                                if (true === fieldName in $scope.allData.selectedAC) {
                                    //输入的外键值，在db中存在，保存其id，
                                    if (name === e.name) {
                                        $scope.allData.selectedAC[fieldName]._id = e._id;
                                        $scope.allData.selectedAC[fieldName].value = name;
                                        // console.log(`set id is ${JSON.stringify($scope.allData.selectedAC[fieldName])}`)
                                    }
                                }
                            });
                            deferred.resolve(tmpResult);
                        }
                    }).error(function (data, status, header, config) {
                        deferred.resolve({ rc: 9999, msg: data });
                    });
                    return deferred.promise;
                };

                suggestList['on_select'] = function (selected) {
                    console.log('on_selected is ' + JSON.stringify(selected));
                    if (true === fieldName in $scope.allData.selectedAC) {
                        $scope.allData.selectedAC[fieldName]._id = selected.id;
                        $scope.allData.selectedAC[fieldName].value = selected.value;
                        //无需直接赋值给$scope.allData.inputAttr，而是通过acBlur判断通过后才赋值
                    } else {
                        //不是外键，直接保存在inputAttr中
                        $scope.allData.inputAttr[fieldName]['value'] = selected.value;
                    }
                };

                return suggestList;
            }
        };

        return allFuncResult;
    }

    function setACConfig($scope) {
        for (var singleFieldName in $scope.allData.inputAttr) {
            var singleInputAttr = $scope.allData.inputAttr[singleFieldName];
            //无论是query还是create/update需要AC，都要为对应的字段设置AC
            if (true === singleInputAttr['isQueryAutoComplete'] || true === singleInputAttr['isCRUDAutoComplete']) {
                //从autoCompleteCollField字段中获取从哪个coll的哪个field中获得ac
                var fk = singleInputAttr['autoCompleteCollField'].split('.');
                var coll = fk[0];
                var field = fk[1];
                console.log('field for ac is ' + singleFieldName + ', related coll is ' + coll + ', related field is ' + field);

                $scope.allData.inputAttr['parentBillType']['suggestList'] = $scope.allFunc.generateSuggestList(appCont.coll.billType, 'parentBillType');
                $scope.allData.inputAttr['name']['suggestList'] = $scope.allFunc.generateSuggestList(appCont.coll.billType, 'name');

                //字段名是原始字段名（符合正常的逻辑），server会根据fkconfig自动查找对应的字段
                $scope.allData.inputAttr[singleFieldName]['suggestList'] = $scope.allFunc.generateSuggestList(appCont.coll[coll], singleFieldName);
            }
        }
    }

    //以下4个函数有严格的先后顺序，需要顺序执行
    return {
        generateControllerDate: generateControllerDate, //产生
        generateCreateUpdateModalInfo: generateCreateUpdateModalInfo, //设置create/update用的modal
        allFunc: allFunc, //返回一个对象，value是函数
        setACConfig: setACConfig };
});

app.controller('configuration.billType.Controller', function ($scope, $q, $sce, appCont, cont, contEnum, inputAttrHelper, htmlHelper, validateHelper, queryHelper, commonHelper, financeHelper, templateFunc) {

    //为bill/billType/employee/department设置数据($scope.allData)
    //必须放在controller中，以便可以直接使用其他模块（例如cont.inputAttr），

    //需要用到的数据，预先定义好
    $scope.allData = templateFunc.generateControllerDate(appCont.coll.billType);
    $scope.modal = templateFunc.generateCreateUpdateModalInfo();
    $scope.allFunc = templateFunc.allFunc($scope, appCont.coll.billType);
    /*$scope.allFunc={
        //在对记录进行update的时候，根据idx，将recorder中的一个载入到inputAttr
        loadCurrentData:function(idx,inputAttr,recorder){
            inputAttrHelper.loadCurrentData(idx,inputAttr,recorder,appCont.fkRedundancyFields.billType);
        },
        initAllFieldInputAttr:function(inputAttr){
            $scope.modal.buttonFlag=true;
            //console.log(`optype is ${}`)
            if(contEnum.opType.create===$scope.allData.currentOpType){
                inputAttrHelper.initAllFieldInputAttrCreate(inputAttr)
            }
            if(contEnum.opType.update===$scope.allData.currentOpType){
                inputAttrHelper.initAllFieldInputAttrUpdate(inputAttr)
            }
          },
        initSingleFieldInputAttr:function(field,inputAttr){
            //console.log(`field is ${field}`)
            //console.log(`inputAttr is ${JSON.stringify(inputAttr)}`)
            $scope.modal.buttonFlag=true;
            if(contEnum.opType.create===$scope.allData.currentOpType){
                inputAttrHelper.initSingleFieldInputAttrCreate(field,inputAttr)
            }
            if(contEnum.opType.update===$scope.allData.currentOpType){
                inputAttrHelper.initSingleFieldInputAttrUpdate(field,inputAttr)
            }
            // queryHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
        },
        //因为create和update公用一个modal，所以需要设置opType来区分操作类型
        setCurrentOpTypeCreate(){
            $scope.allData.currentOpType=contEnum.opType.create
        },
        setCurrentOpTypeUpdate(){
            $scope.allData.currentOpType=contEnum.opType.update
        },
    /!*        setCurrentOpTypeDelete(){
            $scope.allData.currentOpType=contEnum.opType.delete
        },
        setCurrentOpTypeSearch(){
            $scope.allData.currentOpType=contEnum.opType.search
        },*!/
        //不同操作，参数不一样，所以使用不同的函数（create update因为使用同一个modal，所以使用同一个函数，内部使用opType区分）
        CRUDOperation:{
            'createUpdate':function(idx,inputAttr,recorder,selectedAC){
                if(contEnum.opType.create===$scope.allData.currentOpType){
                    if($scope.modal.buttonFlag){
                        financeHelper.dataOperator.create(idx,inputAttr,recorder,selectedAC,appCont.fkRedundancyFields.billType,appCont.coll.billType,appCont.dateField.billType);
                        $scope.allFunc.switchDialogStatus()
                        //操作完成（无论成功失败），将操作类型 复位
                        $scope.allData.currentOpType=null
                    }
                }
                if(contEnum.opType.update===$scope.allData.currentOpType){
                    if($scope.modal.buttonFlag){
                        financeHelper.dataOperator.update(idx,inputAttr,recorder,selectedAC,appCont.fkRedundancyFields.billType,appCont.coll.billType,appCont.dateField.billType);
                        $scope.allFunc.switchDialogStatus();
                        //操作完成（无论成功失败），将操作类型 复位
                        $scope.allData.currentOpType=null
                    }
                }
            },
            'delete':function(idx,recorder){
                financeHelper.dataOperator.delete(idx,recorder,appCont.coll.billType);
            },
            'search':function(recorder){
                console.log(`enter search`)
                console.log(`origin search is ${JSON.stringify($scope.allData.activeQueryValue)}`)
                console.log(`origin fkconfig is ${JSON.stringify(appCont.fkRedundancyFields.billType)}`)
                let convertedValue=queryHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue,appCont.fkRedundancyFields.billType)
                console.log(`search convert result is ${JSON.stringify(convertedValue)}`)
                  //没有任何查询条件，或者删除了所有查询条件
                if(0===Object.keys($scope.allData.activeQueryValue).length){
                    financeHelper.dataOperator.read($scope.allData.recorder,appCont.fkRedundancyFields.billType,appCont.coll.billType,appCont.dateField.billType)
                }else{
                    financeHelper.dataOperator.search(recorder,convertedValue,appCont.fkRedundancyFields.billType,appCont.coll.billType,appCont.dateField.billType);
                }
                  $scope.allData.selectedQueryField=''
                $scope.allData.selectedQueryFieldValue=''
                //$scope.switchDialogStatus();
            }
        },
          //在crete/update记录时，如果input提供autoComplete功能时（一般是外键），blur时需要检测input的内容是否存在，不存在需要报错提示。
        //因为需要额外的检测当前input的value是否有对应的外键（是否为－1），所以独立为一个函数
        //currentId:当前记录的objId（如果是create，为undefined）
        acBlur:function(field,inputAttr,currentId){
            console.log(`acBlur field is ${field},currentId is ${currentId},ac field is ${JSON.stringify($scope.allData.selectedAC[field])},current op type is ${contEnum.opType.update.toString()}`)
            // if(contEnum.opType.update===$scope.allData.currentOpType){
            //     inputAttrHelper.initSingleFieldInputAttrUpdate(field,inputAttr)
            // }
              //console.log(`check id is ${$scope.allData.selectedAC[field]}`)
            //acBlur无需检测input（min/max/minLength等），只需检测a，是否选择（null或者objId），b.是否和当前一样（不能把自己当成自己的父）
            if(null===$scope.allData.selectedAC[field]['_id']){
                // console.log(`before msg is ${JSON.stringify(inputAttr[field])}`)
                inputAttrHelper.setSingleInputAttrErrorMsg(field,inputAttr,`${inputAttr[field]['chineseName']}${inputAttr[field]['value']}不存在`)
                //console.log(`after err msg is ${JSON.stringify(JSON.stringify(inputAttr[field]))}`)
                //return false
            }else{
                //input中的内容在db中有对应的记录
                console.log(`check is self`)
                //只有update的时候，才需要判断是否为自己
                if(contEnum.opType.update===$scope.allData.currentOpType && $scope.allData.selectedAC[field]['_id']===currentId){
                    // console.log(`check is self in`)
                    inputAttrHelper.setSingleInputAttrErrorMsg(field,inputAttr,`${inputAttr[field]['chineseName']}不能为自己`)
                }
                if(contEnum.opType.create===$scope.allData.currentOpType){
                    inputAttrHelper.initSingleFieldInputAttrUpdate(field,inputAttr)
                    inputAttr[field]['value']=$scope.allData.selectedAC[field]['value']
                }
            }
    /!*            else{
                queryHelper.checkInput(field,inputRule,inputAttr)
            }*!/
              //modal.allInputValidCheck(inputAttr)
            $scope.modal.buttonFlag=inputAttrHelper.allInputValidCheck(inputAttr)
    /!*            console.log(`validate result is ${JSON.stringify(inputAttr)}`)
            console.log(`but flag is ${$scope.modal.buttonFlag}`)*!/
        },
          nonAcBlur:function(field,inputRule,inputAttr){
            validateHelper.checkInput(field,inputRule,inputAttr)
            $scope.modal.buttonFlag=inputAttrHelper.allInputValidCheck(inputAttr)
        },
    /!*        allInputValidCheck:function(inputAttr){
            $scope.modal.buttonFlag=inputAttrHelper.allInputValidCheck(inputAttr)
        },*!/
        //create/update
          allCheckInput:function(inputRule,inputAttr){
            validateHelper.allCheckInput(inputRule,inputAttr)
        },
          //从activatedQueryValue中删除value
        //queryFiled:parentBillType
        //queryValue:'a'
        //activatedQueryValue:{parentBillType:['a','b']}
        deleteQueryValue:function(queryFiled,queryValue,activatedQueryValue){
            queryHelper.deleteQueryValue(queryFiled,queryValue,activatedQueryValue)
            console.log(`after delete query value ${activatedQueryValue}`)
        },
        // $scope.addQueryValue=queryHelper.addQueryValue
        addQueryValue:function(queryFiled,queryValue,activatedQueryValue){
            console.log(`add query in`)
            console.log(`activatedQueryValue length is ${Object.keys($scope.allData.activeQueryValue).length}`)
            queryHelper.addQueryValue(queryFiled,queryValue,appCont.fkRedundancyFields.billType,activatedQueryValue)
            console.log(`after add query value ${JSON.stringify(activatedQueryValue)}`)
        },
    /!*        //转换成server端格式
        convertAddQueryValueToServerFormat:function(activateQueryFieldAndValue,fkConfig){
            queryHelper.convertAddQueryValueToServerFormat()
        },*!/
        queryFieldChange:function(selectedQueryField){
            $scope.allData.selectedQueryFieldValue=''
        },
    /!*        isActiveQueryValueEmpty:function(){
            return Object.keys($scope.allData.activeQueryValue).length===0
        },*!/
        clickQueryFlag:function(){
            $scope.allData.queryFieldEnable=!$scope.allData.queryFieldEnable
        },
            switchDialogStatus:function(){
            $scope.allData.recorderDialogShow=!$scope.allData.recorderDialogShow
            htmlHelper.verticalModalCenter('CRUDRecorder')
        },
          setCurrentIdx:function(idx){
            $scope.allData.currentIdx=idx
        },
          //通用autoComplete，for both create/update and query
        //其中对selectedAC的处理，虽然也是for both create/update and query，但是实际只有在create/update的时候才会用到
        generateSuggestList:function(eColl,fieldName){
            //最终返回suggest和on_select的一个对应
            let suggestList={}
              //设置suggest
            suggestList['suggest']=function(name){
                let deferred=$q.defer()
                let searchValue={}
                searchValue[fieldName]={}
                searchValue[fieldName]['value']=name
                financeHelper.dataOperator.readName(searchValue,eColl).success(
                    (data, status, header, config)=>{
                        let tmpResult = []
                        //console.log(`get suggest result is ${data.msg}`)
                        //如果当前的字段是外键（定义在allData.selectedAC中），需要确定的id，以便保存到数据库，则初始设为-1
                        if(true=== fieldName in $scope.allData.selectedAC){
                            if ('' !== name && null !== name) {
                                $scope.allData.selectedAC[fieldName]._id = null
                                $scope.allData.selectedAC[fieldName].value=null
                            }
                        }
                          if (data.msg.length > 0) {
                            data.msg.forEach(function (e) {
                                //label:下拉菜单中的选项，value：选中后显示的内容，id:选中项目的id（用作外键）
                                tmpResult.push({label: e.name, value: e.name, id: e._id})
                                //如果当前的字段是外键（定义在allData.selectedAC中），且输入的值存在db中，则将id保存到selectedAC中，以便crete/update使用（query也保存，但是实际不使用），包括blur时做检测
                                if(true=== fieldName in $scope.allData.selectedAC){
                                    //输入的外键值，在db中存在，保存其id，
                                    if (name === e.name) {
                                        $scope.allData.selectedAC[fieldName]._id = e._id
                                        $scope.allData.selectedAC[fieldName].value = name
                                        // console.log(`set id is ${JSON.stringify($scope.allData.selectedAC[fieldName])}`)
                                    }
                                }
                            })
                            deferred.resolve(tmpResult)
                        }
                    }
                ).error(
                    (data, status, header, config)=>{
                        deferred.resolve({rc: 9999, msg: data})
                    }
                )
                return deferred.promise
            }
              suggestList['on_select']=function (selected) {
                console.log(`on_selected is ${JSON.stringify(selected)}`)
                if(true=== fieldName in $scope.allData.selectedAC){
                    $scope.allData.selectedAC[fieldName]._id = selected.id
                    $scope.allData.selectedAC[fieldName].value = selected.value
                    //无需直接赋值给$scope.allData.inputAttr，而是通过acBlur判断通过后才赋值
                }else{
                    //不是外键，直接保存在inputAttr中
                    $scope.allData.inputAttr[fieldName]['value']=selected.value
                }
            }
              return suggestList
        },
    
      }*/

    htmlHelper.adjustFooterPosition();
    //初始化调用


    //同时提供query和update时使用
    /*    $scope.allData.inputAttr['parentBillType']['suggestList']=$scope.allFunc.acFun.parentBillType
        //only for query
        $scope.allData.inputAttr['name']['suggestList']=$scope.allFunc.acFun.name*/

    /*    for(let singleFieldName in $scope.allData.inputAttr){
            let singleInputAttr=$scope.allData.inputAttr[singleFieldName]
            //无论是query还是create/update需要AC，都要为对应的字段设置AC
            if(true===singleInputAttr['isQueryAutoComplete'] || true===singleInputAttr['isCRUDAutoComplete']){
                //从autoCompleteCollField字段中获取从哪个coll的哪个field中获得ac
                let fk=singleInputAttr['autoCompleteCollField'].split('.')
                let coll=fk[0]
                let field=fk[1]
                console.log(`field for ac is ${singleFieldName}, related coll is ${coll}, related field is ${field}`)
    
                $scope.allData.inputAttr['parentBillType']['suggestList']=$scope.allFunc.generateSuggestList(appCont.coll.billType,'parentBillType')
                $scope.allData.inputAttr['name']['suggestList']=$scope.allFunc.generateSuggestList(appCont.coll.billType,'name')
    
                //字段名是原始字段名（符合正常的逻辑），server会根据fkconfig自动查找对应的字段
                $scope.allData.inputAttr[singleFieldName]['suggestList']=$scope.allFunc.generateSuggestList(appCont.coll[coll],singleFieldName)
            }
        }*/

    templateFunc.setACConfig($scope);
    financeHelper.dataOperator.read($scope.allData.recorder, appCont.fkRedundancyFields.billType, appCont.coll.billType, appCont.dateField.billType);
});

/*
app.controller('configuration.departmentInfo.Controller',function($scope,cont,basicHelper,helper,$sce,queryHelper,financeHelper,contEnum){
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

        //从finance/financeHelper中载入对应CRUD方法
        CRUDOperation:financeHelper.department,

        currentOperation:'',
        currentIdx:-1, //当前操作的记录的idx

        currentOpType:null,

        loadCurrentData:function(idx,inputAttr,recorder){
            queryHelper.loadCurrentData(idx,inputAttr,recorder);
        },
        initAllFieldInputAttr:function(inputAttr){
            $scope.modal.buttonFlag=true;
            queryHelper.initAllFieldInputAttr(inputAttr,this.currentOpType)
        },
        initSingleFieldInputAttr:function(field,inputAttr){
            $scope.modal.buttonFlag=true;
            queryHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
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
                $scope.allData.inputAttr[field]['suggestList']={suggest:financeHelper.suggest_state[tmpColl][tmpField]}
            }
        }
    }

    $scope.modal={
        commonError:"commonError",//create或者update是，发生的非field错误
        title:{'create':'添加数据','update':'修改数据'},
        inputBlur:queryHelper.checkInput,
        inputFocus:queryHelper.initSingleFieldInputAttr,
        buttonFlag:true,//初始为true
        allInputValidCheck:function(inputAttr){
            $scope.modal.buttonFlag=queryHelper.allInputValidCheck(inputAttr)
        },
        CRUDOperation:{
            //此处idx只是为了格式统一，实际没用
            'create':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeHelper.department.create(idx,inputAttr,recorder);
                    $scope.switchDialogStatus()
                }
            },
            'update':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeHelper.department.update(idx,inputAttr,recorder);
                    $scope.switchDialogStatus();
                }
            },
        },
        allCheckInput:queryHelper.allCheckInput,

    }

    helper.adjustFooterPosition()
    //初始化调用


    $scope.deleteQueryValue=queryHelper.deleteQueryValue
    $scope.addQueryValue=queryHelper.addQueryValue

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



app.controller('configuration.employeeInfo.Controller',function($scope,cont,basicHelper,helper,$sce,queryHelper,financeHelper,contEnum){
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

        //从finance/financeHelper中载入对应CRUD方法
        CRUDOperation:financeHelper.employee,

        currentOperation:'',
        currentIdx:-1, //当前操作的记录的idx

        currentOpType:null,

        loadCurrentData:function(idx,inputAttr,recorder){
// console.log('load data')
            queryHelper.loadCurrentData(idx,inputAttr,recorder);
        },
        initAllFieldInputAttr:function(inputAttr){
            $scope.modal.buttonFlag=true;
            queryHelper.initAllFieldInputAttr(inputAttr,this.currentOpType)
        },
        initSingleFieldInputAttr:function(field,inputAttr){
            $scope.modal.buttonFlag=true;
            queryHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
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
                $scope.allData.inputAttr[field]['suggestList']={suggest:financeHelper.suggest_state[tmpColl][tmpField]}
            }
        }
    }

    $scope.modal={
        title:{'create':'添加数据','update':'修改数据'},
        inputBlur:queryHelper.checkInput,
        inputFocus:queryHelper.initSingleFieldInputAttr,
        buttonFlag:true,//初始为true
        allInputValidCheck:function(inputAttr){
            $scope.modal.buttonFlag=queryHelper.allInputValidCheck(inputAttr)
        },
        CRUDOperation:{
            'create':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeHelper.employee.create(idx,inputAttr,recorder);
                    $scope.switchDialogStatus()
                }
            },
            'update':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeHelper.employee.update(idx,inputAttr,recorder);
                    $scope.switchDialogStatus();
                }
            },
        },
        allCheckInput:queryHelper.allCheckInput,

    }

    helper.adjustFooterPosition()

    $scope.deleteQueryValue=queryHelper.deleteQueryValue
    $scope.addQueryValue=queryHelper.addQueryValue

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



app.controller('bill.billInfo.Controller',function($scope,cont,basicHelper,helper,$sce,queryHelper,financeHelper,contEnum){
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

        //从finance/financeHelper中载入对应CRUD方法
        CRUDOperation:financeHelper.bill,

        currentOperation:'',
        currentIdx:-1, //当前操作的记录的idx

        currentOpType:null,

        loadCurrentData:function(idx,inputAttr,recorder){
// console.log('load data')
            queryHelper.loadCurrentData(idx,inputAttr,recorder);
        },
        initAllFieldInputAttr:function(inputAttr){
            $scope.modal.buttonFlag=true;
            queryHelper.initAllFieldInputAttr(inputAttr,this.currentOpType)
        },
        initSingleFieldInputAttr:function(field,inputAttr){
            $scope.modal.buttonFlag=true;
            queryHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
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
                $scope.allData.inputAttr[field]['suggestList']={suggest:financeHelper.suggest_state[tmpColl][tmpField]}
            }
        }
    }

    $scope.modal={
        title:{'create':'添加数据','update':'修改数据'},
        inputBlur:queryHelper.checkInput,
        inputFocus:queryHelper.initSingleFieldInputAttr,
        buttonFlag:true,//初始为true
        allInputValidCheck:function(inputAttr){
            $scope.modal.buttonFlag=queryHelper.allInputValidCheck(inputAttr)
        },
        CRUDOperation:{
            'create':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeHelper.department.create(idx,inputAttr,recorder);
                    $scope.switchDialogStatus()
                }
            },
            'update':function(idx,inputAttr,recorder){
                if($scope.modal.buttonFlag){
                    financeHelper.department.update(idx,inputAttr,recorder);
                    $scope.switchDialogStatus();
                }
            },
        },
        allCheckInput:queryHelper.allCheckInput,

    }

    helper.adjustFooterPosition()

    $scope.deleteQueryValue=queryHelper.deleteQueryValue
    $scope.addQueryValue=queryHelper.addQueryValue

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