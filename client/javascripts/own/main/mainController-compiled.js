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
    },

    //当input为date时，如果需要使用datetimepicker，则需要提供id，以便进行初始化
    //所有的页面中，id都一样
    dateInputId: {
        "department": {
            "queryStartDate": "queryStartDate", //设置查询条件时，用作选择 起始日期 的input的Id
            "queryEndDate": "queryEndDate" },
        "employee": {
            "queryStartDate": "queryStartDate", //设置查询条件时，用作选择 起始日期 的input的Id
            "queryEndDate": "queryEndDate" },
        "billType": {
            "queryStartDate": "queryStartDate", //设置查询条件时，用作选择 起始日期 的input的Id
            "queryEndDate": "queryEndDate" },
        "bill": {
            "queryStartDate": "queryStartDate", //设置查询条件时，用作选择 起始日期 的input的Id
            "queryEndDate": "queryEndDate" }
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

app.factory('templateFunc', function ($q, $sce, appCont, cont, contEnum, inputAttrHelper, htmlHelper, validateHelper, queryHelper, commonHelper, financeHelper, modalChoice, dateTimePickerHelper) {
    var generateControllerData = function generateControllerData(eColl) {
        return {
            inputAttr: cont.inputAttr[eColl], //CRUD记录的时候，对输入进行设置
            inputRule: cont.inputRule[eColl], //CRUD，对输入进行设置（min/maxLength）以及进行检测
            //存储当前载入的数据，数组，以便判断是否为空
            recorder: [],

            queryFieldEnable: false, //当前 字段查询是否展开

            selectedQueryField: undefined, //当前选中的查询字段，是key（实际字段名）：value（显示给用户看的中文字段名）的键值对
            selectedQueryFieldOperator: undefined, //如果是数字，当前选中的比较符
            selectedQueryFieldValue: undefined, //如果选择的字段是字符或者数字，对应设置的值
            //如果是日期，需要2个变量确定，此时不能使用selectedQueryFieldValue
            // selectedStartDateValue:undefined,
            // selectedEndDateValue:undefined,

            queryField: cont.queryField[eColl], //可选的查询字段

            activeQueryValue: {}, //当前生效的查询字段和查询值 ，可以直接传递给server{stringField:[{value:'val1'},{value:'val2'}], numberField:[{value:1,compOp:'gt'},{value:2,compOp:'lt'}]}   采用{}初始化，则可以直接通过函数的参数进行修改；缺点是无法在前端判断是否为{}

            recorderDialogShow: false, //当前modal-dialog是否显示（用来add/modify记录）

            currentIdx: -1, //当前操作的记录的idx

            //临时存储用户选择的外键值，之后在acBlur中进行检查此外键值是否validate
            //对于当前用户选择的记录，保存id，以便在create/update的时候，确保能上传正确的id值（acBlur的时候检查id，如果正确，将value保存到allData.inputAttr,告诉用户选择的外键值validate）
            //对于设置查询条件，直接保存到allData.inputAttr即可
            selectedAC: appCont.selectedAC[eColl],

            currentOpType: null

        };
    };

    /*            pagination            */
    function generatePaginationData(eColl) {
        return {
            'paginationInfo': {},
            'pageRange': null,
            'goToPageNo': null,
            'goToButtonEnable': false
        };
    }

    function generatePaginationFunc($scope) {
        var allFuncResult = {};
        allFuncResult = {
            validateGoToPageNo: function validateGoToPageNo() {
                if (false === validateHelper.dataTypeCheck.isInt($scope.pagination.goToPageNo)) {
                    $scope.pagination.goToPageNo = null;
                    $scope.pagination.goToButtonEnable = false;
                } else {
                    $scope.pagination.goToButtonEnable = true;
                }
                console.log($scope.pagination.goToButtonEnable);
            }
        };
        return allFuncResult;
    }

    //在主函数中进行初始化
    /*    /!*                      datetimepicker                      *!/
        function generateDateTimePickerFunc(){
            let allFunc={}
            allFunc['initDateTimePicker']=function(eColl){
                dateTimePickerHelper.initEle(dateTimePickerHelper[eColl]['queryStartDate'])
                dateTimePickerHelper.initEle(dateTimePickerHelper[eColl]['queryEndDate'])
            }
            return allFunc
        }*/

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

            onchange: function onchange() {
                console.log('date change result is ' + JSON.stringify($scope.allData.selectedStartDateValue));
            },
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
                            //let convertedValue=queryHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue,fkConfig,$scope.pagination.paginationInfo.currentPage)
                            financeHelper.dataOperator.create(idx, inputAttr, recorder, selectedAC, fkConfig, eColl, dateField, $scope.pagination.paginationInfo);
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
                'delete': function _delete(idx, recorder, currentPage) {
                    var convertedValue = queryHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue, fkConfig, currentPage);
                    financeHelper.dataOperator.delete(idx, recorder, eColl, convertedValue, fkConfig, dateField, $scope.pagination);
                },
                'search': function search(recorder, currentPage) {
                    //console.log(`enter search`)
                    //console.log(`origin search is ${JSON.stringify($scope.allData.activeQueryValue)}`)
                    //console.log(`origin fkconfig is ${JSON.stringify(fkConfig)}`)
                    var convertedValue = queryHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue, fkConfig, currentPage);
                    // console.log(`search convert result is ${JSON.stringify(convertedValue)}`)
                    //console.log(`after convert activeQueryValue result is ${JSON.stringify($scope.allData.activeQueryValue)}`)
                    //没有任何查询条件，或者删除了所有查询条件
                    /*                    if(0===Object.keys($scope.allData.activeQueryValue).length){
                                            financeHelper.dataOperator.read(recorder,fkConfig,eColl,dateField)
                                        }else{*/
                    return financeHelper.dataOperator.search(recorder, convertedValue, fkConfig, eColl, dateField, $scope.pagination);
                    //}

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
                    if (true === $scope.allData.inputRule[field]['require']['define']) {
                        inputAttrHelper.setSingleInputAttrErrorMsg(field, inputAttr, '' + inputAttr[field]['chineseName'] + inputAttr[field]['value'] + '不存在');
                    }
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
                console.log('input rule is ' + JSON.stringify(inputRule));
                validateHelper.allCheckInput(inputRule, inputAttr);
            },

            //从activatedQueryValue中删除value
            //queryFiled:parentBillType
            //queryValue:'a'
            //activatedQueryValue:{parentBillType:['a','b']}
            deleteQueryValue: function deleteQueryValue(queryFiled, idx, activatedQueryValue) {
                console.log('idx is ' + idx);
                queryHelper.deleteQueryValue(queryFiled, idx, activatedQueryValue);
                console.log('after delete query value ' + JSON.stringify(activatedQueryValue));
            },
            // $scope.addQueryValue=queryHelper.addQueryValue
            addQueryValue: function addQueryValue() {
                // console.log(`add query in`)
                // console.log(`value is ${$scope.allData.selectedQueryFieldValue}`)
                // console.log(`startDate is ${$scope.allData.selectedStartDateValue}`)
                // console.log(`startDate is ${$scope.allData.selectedEndDateValue}`)
                var selectedQueryFiled = $scope.allData.selectedQueryField['key'];
                //判断queryField的类型，如果是date或者数字，要做特殊处理
                var queryFiledType = $scope.allData.inputRule[selectedQueryFiled]['type'];
                console.log('queryFiledType is ' + queryFiledType);
                //对于日期，operator是根据开始/结束日期固定
                if ('date' === queryFiledType) {
                    var startDateEleId = appCont.dateInputId[eColl]['queryStartDate'];
                    var endDateEleId = appCont.dateInputId[eColl]['queryEndDate'];
                    var startDateValue = dateTimePickerHelper.getCurrentDateInTimeStamp(startDateEleId);
                    var endDateValue = dateTimePickerHelper.getCurrentDateInTimeStamp(endDateEleId);
                    // console.log(`startDateEleId is ${JSON.stringify(startDateEleId)}`)
                    // console.log(`endDateEleId is ${JSON.stringify(endDateEleId)}`)
                    // console.log(`startDateValue is ${JSON.stringify(startDateValue)}`)
                    // console.log(`endDateValue is ${JSON.stringify(endDateValue)}`)
                    // console.log(`validate reuyslt is ${dateTimePickerHelper.validateDate(startDateEleId)}`)
                    if (dateTimePickerHelper.validateDate(startDateEleId)) {
                        // let value=$scope.allData.selectedStartDateValue
                        queryHelper.addQueryValue(selectedQueryFiled, startDateValue, $scope.allData.activeQueryValue, 'gt'); //开始日期，操作符为gt
                    }
                    if (dateTimePickerHelper.validateDate(endDateEleId)) {
                        // let value=$scope.allData.selectedEndDateValue
                        queryHelper.addQueryValue(selectedQueryFiled, endDateValue, $scope.allData.activeQueryValue, 'lt'); //开始日期，操作符为gt
                    }
                    console.log('after selectedQueryOperator is ' + JSON.stringify($scope.allData.activeQueryValue));
                } else if (['float', 'int', 'number'].indexOf(queryFiledType) > -1) {
                    console.log('selectedQueryOperator is ' + $scope.allData.selectedQueryFieldOperator);
                    //对于日期，如果operator不存在
                    var value = $scope.allData.selectedQueryFieldValue;
                    if (false === $scope.allData.selectedQueryFieldOperator in contEnum.operator) {
                        $scope.allData.selectedQueryFieldOperator = contEnum.operator.eq;
                    }
                    queryHelper.addQueryValue(selectedQueryFiled, value, $scope.allData.activeQueryValue, $scope.allData.selectedQueryFieldOperator);
                    console.log('after selectedQueryOperator is ' + JSON.stringify($scope.allData.activeQueryValue));
                } else {
                    //字符
                    if (validateHelper.dataTypeCheck.isString($scope.allData.selectedQueryFieldValue) && false === validateHelper.dataTypeCheck.isStringEmpty($scope.allData.selectedQueryFieldValue)) {
                        queryHelper.addQueryValue(selectedQueryFiled, $scope.allData.selectedQueryFieldValue, $scope.allData.activeQueryValue); //没有操作符
                    }
                }

                $scope.allData.selectedQueryFieldValue = undefined;
                $scope.allData.selectedStartDateValue = undefined;
                $scope.allData.selectedEndDateValue = undefined;
                console.log('after add query value ' + JSON.stringify($scope.allData.activeQueryValue));
            },

            formatQueryValue: function formatQueryValue(fieldName, fieldValue) {
                var fieldType = $scope.allData.inputRule[fieldName]['type'];
                switch (fieldType) {
                    case 'date':
                        console.log('orig date is ' + fieldValue);
                        // console.log(`orig date is ${queryHelper.formatQueryValue.date(fieldValue)}`)
                        return queryHelper.formatQueryValue.date(fieldValue);
                        break;
                    default:
                        return fieldValue;
                }
            },

            queryFieldChange: function queryFieldChange() {
                //初始清空值
                $scope.allData.selectedQueryFieldValue = undefined;
                $scope.allData.selectedStartDateValue = undefined;
                $scope.allData.selectedEndDateValue = undefined;
                //判断选择字段的类型，如果是日期，则进行初始化(按需初始化)
                var selectedQueryField = void 0;
                if ($scope.allData.selectedQueryField && '' !== $scope.allData.selectedQueryField) {
                    selectedQueryField = $scope.allData.selectedQueryField;
                }
                console.log('selected query field is ' + JSON.stringify(selectedQueryField));
                console.log('selected query field rle is ' + JSON.stringify($scope.allData.inputRule[selectedQueryField['key']]));
                if ('date' === $scope.allData.inputRule[selectedQueryField['key']]['type']) {
                    console.log('date filed choose');
                    console.log('id is ' + appCont.dateInputId[eColl]['queryStartDate']);
                    //根据date input的id，通过datetimepicker进行初始化
                    dateTimePickerHelper.initEle(appCont.dateInputId[eColl]['queryStartDate']);
                    dateTimePickerHelper.setFirstDay(appCont.dateInputId[eColl]['queryStartDate']);

                    dateTimePickerHelper.initEle(appCont.dateInputId[eColl]['queryEndDate']);
                    dateTimePickerHelper.setLastDay(appCont.dateInputId[eColl]['queryEndDate']);
                }
            },

            clickQueryFlag: function clickQueryFlag() {
                $scope.allData.queryFieldEnable = !$scope.allData.queryFieldEnable;
            },

            //选择查询条件完毕，并添加完成后，selectedField/selectedFieldValue设成空
            initSelectedQueryField: function initSelectedQueryField() {
                $scope.allData.selectedQueryField = '';
                $scope.allData.selectedQueryFieldValue = '';
            },

            switchDialogStatus: function switchDialogStatus() {
                $scope.allData.recorderDialogShow = !$scope.allData.recorderDialogShow;
                htmlHelper.verticalModalCenter('CRUDRecorder');
                /*                alert($('table').attr('height'))
                                alert($('table').attr('width'))*/
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

                    //如果是外键，那么实际对应的field名称，例如：parentBillType对应的是name
                    var realFieldNameToRead = fieldName;
                    //替换成外键所以在的coll中的名称，以便server通过format检测（否则如果外键在不同的coll，server无法正确通过）
                    if (fieldName in fkConfig) {
                        realFieldNameToRead = fkConfig[fieldName]['fields'][0];
                    }

                    searchValue[realFieldNameToRead] = {};
                    searchValue[realFieldNameToRead]['value'] = name;
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
            },

            showChoiceModal: function showChoiceModal() {
                //console.log(`enter show choice modal`)
                modalChoice.setModalId('modalChoice');
                modalChoice.showChoiceMsg('确认删除', $scope.allFunc.CRUDOperation.delete, $scope.allData.currentIdx, $scope.allData.recorder, $scope.pagination.paginationInfo.currentPage);
            }
        };

        return allFuncResult;
    }

    function setACConfig($scope, eColl) {
        for (var singleFieldName in $scope.allData.inputAttr) {
            var singleInputAttr = $scope.allData.inputAttr[singleFieldName];
            //无论是query还是create/update需要AC，都要为对应的字段设置AC
            if (true === singleInputAttr['isQueryAutoComplete'] || true === singleInputAttr['isCRUDAutoComplete']) {
                //从autoCompleteCollField字段中获取从哪个coll的哪个field中获得ac
                var fk = singleInputAttr['autoCompleteCollField'].split('.');
                var coll = fk[0];
                var field = fk[1];
                // console.log(`field for ac is ${singleFieldName}, related coll is ${coll}, related field is ${field}`)

                $scope.allData.inputAttr[singleFieldName]['suggestList'] = $scope.allFunc.generateSuggestList(appCont.coll[eColl], singleFieldName);
                //$scope.allData.inputAttr['name']['suggestList']=$scope.allFunc.generateSuggestList(appCont.coll.billType,'name')

                //字段名是原始字段名（符合正常的逻辑），server会根据fkconfig自动查找对应的字段
                $scope.allData.inputAttr[singleFieldName]['suggestList'] = $scope.allFunc.generateSuggestList(appCont.coll[coll], singleFieldName);
            }
        }
    }

    //对controller做初始化操作
    function init($scope, eColl) {

        //let convertedValue=queryHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue,fkConfig,currentPage)
        //financeHelper.dataOperator.search($scope.allData.recorder,appCont.fkRedundancyFields[eColl],appCont.coll[eColl],appCont.dateField[eColl])
        var promise = financeHelper.dataOperator.search($scope.allData.recorder, { 'currentPage': 1, 'searchParams': {} }, appCont.fkRedundancyFields[eColl], eColl, appCont.dateField[eColl], $scope.pagination);
        promise.then(function (v) {
            // console.log(`search done`)
            htmlHelper.adjustFooterPosition();
        });
        var startDate = appCont.dateInputId[eColl].queryStartDate;
        var endDate = appCont.dateInputId[eColl].queryStartDate;


        dateTimePickerHelper.initEle(appCont.dateInputId[eColl]['queryStartDate']);
        dateTimePickerHelper.setFirstDay(appCont.dateInputId[eColl]['queryStartDate']);

        dateTimePickerHelper.initEle(appCont.dateInputId[eColl]['queryEndDate']);
        dateTimePickerHelper.setLastDay(appCont.dateInputId[eColl]['queryEndDate']);
        /*        // let startDate=
                dateTimePickerHelper.initEle(startDate)
                dateTimePickerHelper.initEle(endDate)*/
    }

    //以下5个函数有严格的先后顺序，需要顺序执行
    return {
        generateControllerData: generateControllerData, //产生所需数据（除了分页信息之外）

        generatePaginationData: generatePaginationData, //初始化分页信息数据
        generatePaginationFunc: generatePaginationFunc, //分页需要用到的函数

        generateCreateUpdateModalInfo: generateCreateUpdateModalInfo, //设置create/update用的modal
        allFunc: allFunc, //返回一个对象，value是函数
        setACConfig: setACConfig, //对需要AC的字段设置AC的配置（通过allFunc.generateSuggestList产生的对象，赋值给对应的字段）
        init: init };
});

app.controller('configuration.billType.Controller', function ($scope, templateFunc) {
    //appCont,cont,contEnum,inputAttrHelper,htmlHelper,validateHelper,queryHelper,commonHelper,financeHelper,templateFunc
    //需要用到的数据，预先定义好
    $scope.allData = templateFunc.generateControllerData('billType');

    $scope.modal = templateFunc.generateCreateUpdateModalInfo();
    $scope.allFunc = templateFunc.allFunc($scope, 'billType');

    templateFunc.setACConfig($scope, 'billType');
    //初始化调用
    templateFunc.init($scope, 'billType');
});

app.controller('configuration.departmentInfo.Controller', function ($scope, templateFunc) {
    //需要用到的数据，预先定义好
    $scope.allData = templateFunc.generateControllerData('department');
    //console.log($scope.allData.queryFieldEnable)
    $scope.modal = templateFunc.generateCreateUpdateModalInfo();
    $scope.allFunc = templateFunc.allFunc($scope, 'department');

    templateFunc.setACConfig($scope, 'department');
    //初始化调用
    templateFunc.init($scope, 'department');
});

app.controller('configuration.employeeInfo.Controller', function ($scope, templateFunc) {
    //需要用到的数据，预先定义好
    $scope.allData = templateFunc.generateControllerData('employee');
    $scope.modal = templateFunc.generateCreateUpdateModalInfo();
    $scope.allFunc = templateFunc.allFunc($scope, 'employee');

    templateFunc.setACConfig($scope, 'employee');
    //初始化调用
    templateFunc.init($scope, 'employee');
});

app.controller('billController', function ($scope, htmlHelper) {
    $scope.adjustFooterPosition = function () {
        //console.log('main resize')
        htmlHelper.adjustFooterPosition();
    };
});

app.controller('bill.billInfo.Controller', function ($scope, templateFunc) {
    //需要用到的数据，预先定义好
    $scope.allData = templateFunc.generateControllerData('bill');
    $scope.pagination = templateFunc.generatePaginationData('bill');
    $scope.paginationFunc = templateFunc.generatePaginationFunc($scope);
    $scope.modal = templateFunc.generateCreateUpdateModalInfo();
    $scope.allFunc = templateFunc.allFunc($scope, 'bill');

    templateFunc.setACConfig($scope, 'bill');
    //初始化调用
    templateFunc.init($scope, 'bill');

    // templateFunc.generateDateTimePickerFunc.allFunc.initDateTimePicker('bill')
});

//# sourceMappingURL=mainController-compiled.js.map