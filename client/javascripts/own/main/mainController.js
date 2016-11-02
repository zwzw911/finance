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

app.controller('mainController',function($scope,htmlHelper){
    htmlHelper.adjustFooterPosition()

    window.onresize=function(){
        htmlHelper.adjustFooterPosition()
        htmlHelper.verticalModalCenter('CRUDRecorder')
    }
})

app.controller('configurationController',function($scope,htmlHelper){
    htmlHelper.adjustFooterPosition()
    $scope.adjustFooterPosition=function(){
        //console.log('configuration resize')
        htmlHelper.adjustFooterPosition()
    }

})

/*test=function(){
    console.log('test in')
}*/
app.controller('configuration.billType.Controller',function($scope,$q,$sce,cont,contEnum,inputAttrHelper,htmlHelper,validateHelper,financeHelper,commonHelper,financeCRUDHelper){

    //需要用到的数据
    $scope.allData={
        inputAttr:cont.inputAttr.billType,//CRUD记录的时候，对输入进行设置
        inputRule:cont.inputRule.billType,//CRUD，对输入进行设置（min/maxLength）以及进行检测
        //存储当前载入的数据，数组，以便判断是否为空
        recorder:[],

        queryFieldEnable:false,//当前 字段查询是否展开

        selectedQueryField:'', //当前选中的查询字段
        selectedQueryFieldValue:undefined,//下拉菜单中选中的值
        queryField:cont.queryField.billType, //可选的查询字段

        activeQueryValue:{},//当前生效的查询字段和查询值 {field:['value1','value2']}

        recorderDialogShow:false,//当前modal-dialog是否显示（用来add/modify记录）
        
        //从finance/financeCRUDHelper中载入对应CRUD方法
        //CRUDOperation:financeCRUDHelper.billType,

        // currentOperation:'',
        currentIdx:-1, //当前操作的记录的idx

        selectedAC:{
            name:{value:null,_id:null},
            parentBillType:{value:null,_id:null},//value：选中的记录的名称，id：选中的记录的实际id。ac有时候需要显示给用户 字符，但实际传递给server id，以便操作

        },

        currentOpType:null,

    }



//}
    $scope.allFunc={
        loadCurrentData:function(idx,inputAttr,recorder){
            inputAttrHelper.loadCurrentData(idx,inputAttr,recorder);
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
            // financeHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
        },
        setCurrentOpTypeCreate(){
            $scope.allData.currentOpType=contEnum.opType.create
        },
        setCurrentOpTypeUpdate(){
            $scope.allData.currentOpType=contEnum.opType.update
        },
        setCurrentOpTypeDelete(){
            $scope.allData.currentOpType=contEnum.opType.delete
        },

        CRUDOperation:function(idx,inputAttr,recorder,selectedAC){
            console.log(`current op type is ${$scope.allData.currentOpType.toString()}`)
            console.log(`current selectedAC is ${selectedAC}`)
            if(contEnum.opType.create===$scope.allData.currentOpType){
                if($scope.modal.buttonFlag){
                    financeCRUDHelper.dataOperator.billType.create(idx,inputAttr,recorder,selectedAC);
                    $scope.allFunc.switchDialogStatus()
                }
            }
            if(contEnum.opType.update===$scope.allData.currentOpType){
                if($scope.modal.buttonFlag){
                    financeCRUDHelper.dataOperator.billType.update(idx,inputAttr,recorder,selectedAC);
                    $scope.allFunc.switchDialogStatus();
                }
            }
            if(contEnum.opType.delete===$scope.allData.currentOpType){
                //if($scope.modal.buttonFlag){
                    financeCRUDHelper.dataOperator.billType.delete(idx,recorder);
                    //$scope.switchDialogStatus();
                //}
            }
        },

        //当input提供autoComplete功能时，blur要做的操作
        //因为需要额外的检测当前input的value是否有对应的外键（是否为－1），所以独立为一个函数
        //currentId:当前记录的objId
        acBlur:function(field,inputAttr,currentId){
            //console.log(`currentId is ${currentId}`)
            inputAttrHelper.initSingleFieldInputAttrUpdate(field,inputAttr)
            //console.log(`check id is ${$scope.allData.selectedAC[field]}`)
            //acBlur无需检测input（min/max/minLength等），只需检测a，是否选择（null或者objId），b.是否和当前一样（不能把自己当成自己的父）
            if(-1===$scope.allData.selectedAC[field]){
                //console.log(`before msg is ${JSON.stringify(inputAttr[field])}`)
                inputAttrHelper.setSingleInputAttrErrorMsg(field,inputAttr,`${inputAttr[field]['chineseName']}${inputAttr[field]['value']}不存在`)
                //console.log(`after err msg is ${JSON.stringify(JSON.stringify(inputAttr[field]))}`)
                //return false
            }else{
                if($scope.allData.selectedAC[field]===currentId){
                    inputAttrHelper.setSingleInputAttrErrorMsg(field,inputAttr,`${inputAttr[field]['chineseName']}不能为自己`)
                }

            }

/*            else{
                financeHelper.checkInput(field,inputRule,inputAttr)
            }*/

            //modal.allInputValidCheck(inputAttr)
            $scope.modal.buttonFlag=inputAttrHelper.allInputValidCheck(inputAttr)
/*            console.log(`validate result is ${JSON.stringify(inputAttr)}`)
            console.log(`but flag is ${$scope.modal.buttonFlag}`)*/
        },

        nonAcBlur:function(field,inputRule,inputAttr){
            validateHelper.checkInput(field,inputRule,inputAttr)
        },


        allInputValidCheck:function(inputAttr){
            $scope.modal.buttonFlag=inputAttrHelper.allInputValidCheck(inputAttr)
        },
        //create/update

        allCheckInput:function(inputRule,inputAttr){
            validateHelper.allCheckInput(inputRule,inputAttr)
        },

        queryFieldChange:function(selectedQueryField){
            $scope.allData.selectedQueryFieldValue=''
        },

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

        //因为需要对$scope.allData下的数据进行操作，所以不能单独放到一个module中，只能放在controller中
        acFun:{
            //for query and update
            parentBillType: {
                suggest: function (name) {
                    let deferred = $q.defer()
                    financeCRUDHelper.dataOperator.billType.readName(name).success(function (data, status, header, config) {
                        //$scope.allData.inputAttr['parentBillType']['suggestList']=[]
                        let tmpResult = []
                        //console.log(`get suggest result is ${data.msg}`)
                        //初始设为-1
                        if ('' !== name && null !== name) {
                            $scope.allData.selectedAC.parentBillType = -1
                        }

                        if (data.msg.length > 0) {
                            data.msg.forEach(function (e) {
                                //label:下拉菜单中的选项，value：选中后显示的内容，id:选中项目的id（用作外键）
                                tmpResult.push({label: e.name, value: e.name, id: e._id})
                                //如果当前输入的值存在选项中，隐式的认为此值被选中
                                console.log(`suggest change: term is ${name}, item name is ${e.name}`)
                                if (name === e.name) {
//console.log(`input is selet`)
                                    $scope.allData.selectedAC.parentBillType = e._id
                                    console.log(`set id is ${$scope.allData.selectedAC.parentBillType}`)
                                }
                            })
                            deferred.resolve(tmpResult)
                            //$scope.allData.inputAttr['parentBillType']['suggestList']=$scope.suggestListValue.parentBillType
                            //$scope.suggestListValue
                        }
                    }).error(function (data, status, header, config) {
                        deferred.resolve({rc: 9999, msg: data})
                    })
                    return deferred.promise
                },
                on_select: function (selected) {
                    console.log(`selected is ${JSON.stringify(selected)}`)
                    $scope.allData.selectedAC.parentBillType = selected.id
                }
            },
            //only for query
            name: {
                suggest: function (name) {
                    let deferred = $q.defer()
                    financeCRUDHelper.dataOperator.billType.readName(name).success(function (data, status, header, config) {

                        let tmpResult = []
                        //console.log(`get suggest result is ${data.msg}`)
                        //初始设为-1
                        if ('' !== name && null !== name) {
                            $scope.allData.selectedAC.illType = -1
                        }

                        if (data.msg.length > 0) {
                            data.msg.forEach(function (e) {
                                //label:下拉菜单中的选项，value：选中后显示的内容，id:选中项目的id（用作外键）
                                tmpResult.push({label: e.name, value: e.name, id: e._id})
                                //如果当前输入的值存在选项中，隐式的认为此值被选中
                                console.log(`suggest change: term is ${name}, item name is ${e.name}`)
                                if (name === e.name) {
//console.log(`input is selet`)
                                    $scope.allData.selectedAC.billType = e._id
                                    console.log(`set id is ${$scope.allData.selectedAC.billType}`)
                                }
                            })
                            deferred.resolve(tmpResult)
                            //$scope.allData.inputAttr['parentBillType']['suggestList']=$scope.suggestListValue.parentBillType
                            //$scope.suggestListValue
                        }
                    }).error(function (data, status, header, config) {
                        deferred.resolve({rc: 9999, msg: data})
                    })
                    return deferred.promise
                },
                on_select: function (selected) {
                    console.log(`selected is ${JSON.stringify(selected)}`)
                    $scope.allData.selectedAC.billType = selected.id
                }
            }
        }
    }

    $scope.modal={
        title:{'create':'添加数据','update':'修改数据'},
        buttonFlag:true,//初始为true
    }

    htmlHelper.adjustFooterPosition()
    //初始化调用
    $scope.deleteQueryValue=financeHelper.deleteQueryValue
    $scope.addQueryValue=financeHelper.addQueryValue

    //同时提供query和update时使用
    $scope.allData.inputAttr['parentBillType']['suggestList']=$scope.allFunc.acFun.parentBillType
    //only for query
    $scope.allData.inputAttr['name']['suggestList']=$scope.allFunc.acFun.billType

    financeCRUDHelper.dataOperator.billType.read($scope.allData.recorder)

})



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
