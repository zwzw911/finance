webpackJsonp([2,4],{

/***/ 121:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($, moment) {/**
 * Created by wzhan039 on 2016-08-18.
 * 通用函数（可供finance调用）
 */
    

var componentApp=angular.module('component',['angularMoment']);
//var moment=require('moment')
//common的程序
componentApp.factory('validateHelper',function(){
    var dataTypeCheck=
        {
            isArray(obj) {
                return obj && typeof obj === 'object' &&
                Array == obj.constructor;
            },
            isInt: function (value) {
                // return !isNaN(parseInt(value))
                return parseInt(value).toString()===value.toString()
            },
            isNumber: function (value) {
                return !isNaN(parseFloat(value))
            },
            isString(value){
                return typeof value === 'string'

            },
            isStringEmpty(value){
                return ( "" === value || 0 === value.length || "" === value.trim() || null===value);
            },
            isEmpty(value) {
                if (undefined === value || null === value) {
                    return true
                }
                switch (typeof value) {
                    case "string":
                        return ( "" === value || 0 === value.length || "" === value.trim());
                        break;
                    case "object":
                        if (true === this.isArray(value)) {
                            return 0 === value.length
                        } else {
                            return 0 === Object.keys(value).length
                        }
                        break;
                }
                return false
            },
            isDate(date) {
                let parsedDate=new Date(date)
                if(parsedDate.toLocaleString() ===  'Invalid Date'){
                    return false
                }
                return parsedDate;
                //}
            },
            isPositive(value) {
                let parsedValue = parseFloat(value)
                /*        if(isNaN(parsedValue)){
                 return false
                 }*/
                return parsedValue > 0
            },
/*            isSetValue(value){
                return undefined===value
            },
            isEmpty(value){

            }*/
        }

        var ruleTypeCheck=
            {
                inputValueTypeCheck(value){
                    if(false===dataTypeCheck.isArray(value)  && false===dataTypeCheck.isNumber(value) && dataTypeCheck.isString(value) ){
                        return false
                    }else{
                        return true
                    }
                },
                exceedMaxLength(value, maxLength) {
                    //length属性只能在数字/字符/数组上执行
                    if(false==this.inputValueTypeCheck(value)){
                        // console.log(false)
                        return false
                    }
                    //client都是字符
                    // console.log(value.length)
                    return value.length > maxLength
                },

                exceedMinLength(value, minLength) {
                    if(false==this.inputValueTypeCheck(value)){
                        return false
                    }
                    //client都是字符
                    return value.length < minLength
                },
                exactLength(value, exactLength) {
                    if(false==this.inputValueTypeCheck(value)){
                        return false
                    }
                    //client都是字符
                    return value.length === exactLength
                },
                exceedMax(value, definedValue) {
                    return parseFloat(value) > parseFloat(definedValue)
                },
                exceedMin(value, definedValue) {
                    return parseFloat(value) < parseFloat(definedValue)
                },
                'enum':function(value,definedValue){
                    return definedValue.indexOf(value)===-1
                },
            }

    //检查input value（对单个field进行检查，因为此函数在每个input发生blur就要调用）
    // inputRule/inputAttr是coll级别
    function checkInput(field,inputRule,inputAttr){
        // console.log(`inputAttr is ${JSON.stringify(inputAttr)}`)
        //console.log(`field to be checked is ${JSON.stringify(field)}`)
        //id不需要检测
        if('id'===field){
            return true
        }
        //console.log(`inputRule of ${field} is ${JSON.stringify(inputRule[field])}`)
        var requireFlag=inputRule[field]['require']['define']
        //console.log(`requireFlag of ${field} is ${requireFlag}`)
        var currentValue=inputAttr[field]['value']
        if(undefined===requireFlag){
            requireFlag=false
        }

        // if(''===currentValue){
//console.log(`currentValue is ${JSON.stringify(currentValue)}`)
//        console.log(`currentValue of ${field} is ${JSON.stringify(currentValue.toString())}`)
//        console.log(`currentValue type of ${field} is ${JSON.stringify(typeof currentValue)}`)
        //如果是字符，需要调用专用的函数判断是否为空
        if(true===dataTypeCheck.isEmpty(currentValue)){
            //console.log(`${field} is empty`)
            if(false===requireFlag){
                inputAttr[field]['validated']=true
                return true
            }
            if(true===requireFlag){
                inputAttr[field]['validated']=false
                inputAttr[field]['errorMsg']=inputRule[field]['require']['msg']
                return false
            }
        }

        //检查类型
        let tmpFieldDataType=inputRule[field]['type']
        let dataTypeCheckResult=false
/*        console.log(`dataType is ${JSON.stringify(tmpFieldDataType)}`)
        console.log(`value is ${JSON.stringify(currentValue)}`)*/
        switch (tmpFieldDataType){
            case 'int':
                dataTypeCheckResult=dataTypeCheck.isInt(currentValue)
                break;
            case 'float':
                dataTypeCheckResult=dataTypeCheck.isNumber(currentValue)
                break;
            case 'number':
                dataTypeCheckResult=dataTypeCheck.isNumber(currentValue)
                break;
            case 'string':
                dataTypeCheckResult=dataTypeCheck.isString(currentValue)
                break;
            case 'date':
                // console.log(`value to be check is ${JSON.stringify(currentValue)}`)
                dataTypeCheckResult=dataTypeCheck.isDate(currentValue)
                break;
        }
//console.log(`field ${field} type check result is ${JSON.stringify(dataTypeCheckResult)}`)

        if(false===dataTypeCheckResult){
            if('int'===tmpFieldDataType || 'float'===tmpFieldDataType || 'number'===tmpFieldDataType){
                inputAttr[field]['errorMsg']=inputAttr[field]['chineseName']+'必须是数字'
            }
            if('date'===tmpFieldDataType){
                inputAttr[field]['errorMsg']=inputAttr[field]['chineseName']+'必须是日期'
            }
            inputAttr[field]['validated']=false
            //console.log(`error is ${JSON.stringify(inputAttr[field])}`)
            return false
        }


        //input不空，检查当前字段除了require之外的其他所有rule
        if(''!==currentValue){
            for(let singleRule in inputRule[field]){
                let ruleCheckFunc
                if('require'===singleRule || 'type'===singleRule){
                    continue
                }


                //检查rule
                switch (singleRule){
                    case 'max':
                        ruleCheckFunc='exceedMax'
                        break;
                    case 'min':
                        ruleCheckFunc='exceedMin'
                        break;
                    case 'maxLength':
                        ruleCheckFunc='exceedMaxLength'
                        break;
                    case 'minLength':
                        ruleCheckFunc='exceedMinLength'
                        break;
                    case 'enum':
                        ruleCheckFunc='enum'
                        break;
                }
//console.log(`field ${field} rule check type is ${ruleCheckFunc}`)
//console.log(`field ${field} with value is ${JSON.stringify(currentValue)}`)
//console.log(`tobe checked value's rule is ${JSON.stringify(inputRule[field][singleRule]['define'])}`)
                if(true===ruleTypeCheck[ruleCheckFunc](currentValue,inputRule[field][singleRule]['define'])){
                    inputAttr[field]['errorMsg']=inputRule[field][singleRule]['msg']
                    inputAttr[field]['validated']=false
                    return false
                }else{
                    inputAttr[field]['errorMsg']=""
                    inputAttr[field]['validated']=true
                }
            }
        }
        return true
    }
    //对所有的input进行检测
    function allCheckInput(inputRule,inputAttr){
        //console.log(`input attr is ${JSON.stringify(inputAttr)}`)
        // console.log('check input in')
        let tmpResult
        for(let singleField in inputAttr){
            tmpResult=checkInput(singleField,inputRule,inputAttr)
            // console.log(`single filed ${singleField} check result is ${tmpResult}`)
            if(false===tmpResult){
                return false
            }
        }
        return true
    }

    return {dataTypeCheck,ruleTypeCheck,checkInput,allCheckInput}
})

componentApp.factory('htmlHelper',function(validateHelper){
    return {
        /*
        * leftOffset:覆盖元素的left和当前元素left 之间的offset。可正可负。
        * topOffset：覆盖元素的top和当前元素top 之间的offset。可正可负。
        * widthOffset：覆盖元素的width和当前元素width 之间的offset。可正可负。
        * heightOffset：覆盖元素的height和当前元素height 之间的offset。可正可负。
        * */
        setCoverEle:function(currentEleId,coveringEleId,offset={leftOffset:0,topOffset:0,widthOffset:0,heightOffset:0}){
            let errorMsg={
                eleNotExist:function(eleId){
                    return {rc:1,msg: `元素$(eleId)不存在`}
                },
                paramNotNumber:function(eleId){
                    return {rc:2,msg: `元素$(eleId)不是数值`}
                },
            }

            //1. 检测输入参数
            let currentEle=document.getElementById(currentEleId)
            if(undefined===currentEle){
                return  errorMsg.eleNotExist(currentEleId)
            }
            let coveringEle=document.getElementById(coveringEleId)
            if(undefined===coveringEle){
                return  errorMsg.eleNotExist(coveringEleId)
            }

            for(let key in offset){
                if(validateHelper.dataTypeCheck.isNumber(offset[key])){return errorMsg.paramNotNumber(key)}
            }

            //设置覆盖元素的参数
            coveringEle.style.position='absolute'
            coveringEle.style.left=currentEle.offsetLeft+offset.leftOffset+'px'
            coveringEle.style.top=currentEle.offsetTop+offset.topOffset+'px'
            coveringEle.style.width=currentEle.offsetWidth+offset.widthOffset+'px'
            coveringEle.style.height=currentEle.offsetHeight+offset.heightOffset+'px'
        },

        /*
        * 说明：根据页面的内容设置footer的位置，使之一直位于页面最下方
        *       如果页面内容（html内容）小于浏览器视口（不包含工具栏），给footer添加fixed-footer，使得footer位于最下方
        *       否则移除fixed-footer(因为此时footer已经在最下方)
        * */
        adjustFooterPosition:function(){
            // let contentHeight = document.body.scrollHeight//网页正文全文高度
            // let winHeight = window.innerHeight//可视窗口高度，不包括浏览器顶部工具栏
            let contentHeight = $(document).height()//网页正文全文高度
            let winHeight = $(window).height()//可视窗口高度，不包括浏览器顶部工具栏
            // console.log(`contentHeight is ${contentHeight}, winHeight is ${winHeight}`)
            //console.log(winHeight)
            if(!(contentHeight > winHeight)){
                //当网页正文高度小于可视窗口高度时，为footer添加类fixed-bottom
                //console.log('add')
                $("footer").addClass("fixed-footer");
            } else {
                // console.log('remove')
                $("footer").removeClass("fixed-footer");
            }

        },



        /*
        *   说明： bootstrap提供的modal-dialog只能水平居中，本函数用作垂直居中
        *   窗口位置大小变化时，重新设置modal的top
        *   因为modal在隐藏时，无法计算得到height（试图通过在载入页面时，先瞬时显示在隐藏modal的方法，来获得height，但是失败），所以直接在元素填入height属性，供js提取使用
        */
        verticalModalCenter:function(dialogId){
            var dialog=document.getElementById(dialogId)
            //因为此函数可能在整个window上监听onsize，所以需要判断modal是否存在，不存在直接退出
            if(null===dialog){
                return false
            }
            var windowHeight=$(window).height()
            //var dialogHeight=dialog.offsetHeight
            //console.log(dialog.offsetHeight)
            var dialogHeight=dialog.style.height.replace('px','')

            //console.log(`windos height is ${windowHeight}`)
            //console.log(`dialog height is ${dialogHeight}`)
            //diag太长了
            //60是botstrap中为diaglog定义的上下margin，略微上移，符合人类审美
          if(windowHeight-dialogHeight<30){
                var top=20 //不能覆盖header
            }else{
/*                console.log(`windowHeight-dialogHeight is ${windowHeight-dialogHeight}`)
                console.log(`windowHeight-dialogHeight/2 is ${(windowHeight-dialogHeight)/2}`)*/
                top=((windowHeight-dialogHeight)/2)-30
                //console.log(`result is ${top}`)
            }

/*            var top=((windowHeight-dialogHeight)/2)-60
            if(top<0){
                top=0
            }*/

            dialog.style.top=top+'px'

        },


    }
})

/*            设置 查询条件 时，使用的函数              */
componentApp.factory('queryHelper',function(contEnum) {
    //var allFunc={}
    //allFunc={
    //field：要操作的字段名
    //idx：要删除的搜索值（因为搜索值是一个数组，格式为[{value:'val1'}]）
    function deleteQueryValue(field, idx, activateQueryFieldAndValue) {
        if(activateQueryFieldAndValue[field] && activateQueryFieldAndValue[field][idx]){
            activateQueryFieldAndValue[field].splice(idx,1)
            if (0 === activateQueryFieldAndValue[field].length) {
                delete activateQueryFieldAndValue[field]
            }
        }
    }

    //因为inputAttr和queryField可能不一致（例如，query的时候要求有创建日期，而inputAttr是不能有的（server自动创建））。
    //为了正确显示query使用的字段，要根据key（英文），从queryField中找到对应的idx，然后页面根据idx找到中文（而不是直接返回）
    //field: 字段的英文名
    //queryField: constant的queryField中coll的定义
    function getQueryFiledChineseName(field,queryField){
        // console.log(`getQueryFiledChineseName in`)
        for(let singleQueryField of queryField){
            if(field===singleQueryField['key']){
                return singleQueryField['value']
            }
        }
    }
/*    function deleteQueryValue(field, idx, activateQueryFieldAndValue) {
        for (var i = 0; i < activateQueryFieldAndValue[field].length; i++) {
            if (value === activateQueryFieldAndValue[field][i]) {
                activateQueryFieldAndValue[field].splice(i, 1)
                break
            }
        }
        if (0 === activateQueryFieldAndValue[field].length) {
            delete activateQueryFieldAndValue[field]
        }
    }*/

    //将选择的field和value键入数组（以便在client显示，而不能直接转换成server端的格式）
    //{name:['a','b'],parentBillType:['c','d']}
    function addQueryValueOld(field, value, fkConfig,activateQueryFieldAndValue) {
        // console.log(`field is ${field},value is ${JSON.stringify(value)}, activated value is ${activateQueryFieldAndValue}`)
        // if(undefined===activateQueryFieldAndValue){
        //     console.log(`in to init activea vlauy`)
        //     activateQueryFieldAndValue={}
        // }
        // console.log(`field is ${JSON.stringify(field)}`)
        // console.log(`field is ${JSON.stringify(value)}`)

/*        let eleValue={'value':value}
        //是外键，需要找到对应的冗余字段
        if(true=== field in fkConfig){
            let redundancyField=fkConfig[field]['fields'][0] //当前冗余字段虽然是数组，但是其实只有一个元素
            if (undefined === activateQueryFieldAndValue[field]) {
                activateQueryFieldAndValue[field] = {}  //外键为object，内置冗余字段
            }
            if (undefined === activateQueryFieldAndValue[field][redundancyField]) {
                activateQueryFieldAndValue[field][redundancyField] = []
            }
            activateQueryFieldAndValue[field][redundancyField].push(eleValue)
        }else{
            if (undefined === activateQueryFieldAndValue[field]) {
                activateQueryFieldAndValue[field] = []  //非外键直接数组，内置查询参数
            }
            activateQueryFieldAndValue[field].push(eleValue)
        }*/

        if (undefined === activateQueryFieldAndValue[field]) {
            activateQueryFieldAndValue[field] = []
        }
        //如果是select传递过来的值
        let inputValue
        if (value.key){
            inputValue=value.key
        }else{
            inputValue=value
        }
        activateQueryFieldAndValue[field].push(inputValue)
    }

    //无论字段类型，使用同一个函数进行处理，得到统一格式
    //{name:[{value:'val1'},{value:'val2'}], parentBillType:{name:[{value:'name1'}]}, age:[{value:20,comOp:'gt',compSymbol:'>'}]}
    //如果是日期或者数字，会多出一个compSymbol，用来在页面上显示比较符，需要通过convertAddQueryValueToServerFormat去掉
    function addQueryValue(field, value,activateQueryFieldAndValue,operator) {

/*        console.log(`field is ${JSON.stringify(field)}`)
        console.log(`value is ${JSON.stringify(value)}`)
        console.log(`operator is ${JSON.stringify(operator)}`)*/


        if (undefined === activateQueryFieldAndValue[field]) {
            activateQueryFieldAndValue[field] = []
        }


        //如果有比较符，同时activateQueryFieldAndValue的某个查询元素也带有此相同的比较符，那么直接用新的值代替这个元素中的搜索值
        if(operator) {
            //将测是否已经有对应的compOp
            //有，直接覆盖value
            for (let singleParam of activateQueryFieldAndValue[field]) {
                if (singleParam['compOp'] && operator === singleParam['compOp']) {
                    singleParam['value'] = value
                    return true
                }
            }
        }

        //activateQueryFieldAndValue字段的搜索数组中没有 比较符
        let valueToBePush={}   //如果当前此字段没有对应的比较符，那么valueToBePush初始化为{}，并赋值；  否则从当前字段中取出符号为此
        if(operator) {
            valueToBePush['compOp']=operator
            if('gt'===operator){
                valueToBePush['compSymbol']='>'
            }
            if('lt'===operator){
                valueToBePush['compSymbol']='<'
            }
        }
        //如果是select传递过来的值
        if (value.key) {
            valueToBePush['value']=value.key
        } else {
            valueToBePush['value']=value
        }



        activateQueryFieldAndValue[field].push(valueToBePush)
    }


    //如果是外键，选择外键对应的冗余字段（一般是一个）；同时，如果是日期或者数字，去掉compSymbol
    // {"values":{"name":[{"value":"{{billtype_name_1}}"}],"parentBillType":{"name":[{"value":"{{billtype_name_2}}"}]}}}
    function convertAddQueryValueToServerFormat(activateQueryFieldAndValue,fkConfig,currentPage){
        let formattedValue={}
        if(Object.keys(activateQueryFieldAndValue).length>0){
            for(let fieldName in activateQueryFieldAndValue){
                let aValue //应用需要加入值的数组（外键和非外键的结构不一致）
                //1. 创建必要的结构
                //如果是外键
                if(true===fieldName in fkConfig){
                    if(undefined===formattedValue[fieldName]){
                        formattedValue[fieldName]={}
                    }
                    let redundancyField=fkConfig[fieldName]['fields'][0]//当前冗余字段虽然是数组，但是其实只有一个元素
                    if(undefined===formattedValue[fieldName][redundancyField]){
                        formattedValue[fieldName][redundancyField]=[]
                    }
                    aValue=formattedValue[fieldName][redundancyField]
                }else{
                    if(undefined===formattedValue[fieldName]){
                        formattedValue[fieldName]=[]    //非外键直接数组
                    }
                    aValue=formattedValue[fieldName]
                }

                for(let singleValue of activateQueryFieldAndValue[fieldName]){
                    //不能直接 delete singleValue['compSymbol']（因为是引用），只能直接复制
                    let newValue={}
                    newValue['value']=singleValue['value']
                    newValue['compOp']=singleValue['compOp']

                    aValue.push(newValue)
                }

            }
        }



        return {'currentPage':currentPage,'searchParams':formattedValue}
    }


    //实际要传送到server端的 查询 数据，可能在前端显示给用户看的时候需要格式化（例如时间，可能只要显示YYYY-DD-MM，而不要HH:mm）
    let formatQueryValue={
        'date':function(fieldValue){
            // console.log(`date tiem stamp ${fieldValue}`)
            return moment(fieldValue,'x').format('YYYY-MM-DD') //小x说明是以ms为单位
        },
        'dateTime':function(){}
    }

    return {deleteQueryValue,addQueryValue,convertAddQueryValueToServerFormat,formatQueryValue,getQueryFiledChineseName}
})
/*    function convertAddQueryValueToServerFormat(activateQueryFieldAndValue,fkConfig,currentPage){
        let formattedValue={}
        if(Object.keys(activateQueryFieldAndValue).length>0){
            for(let fieldName in activateQueryFieldAndValue){
                let aValue //应用需要加入值的数组（外键和非外键的结构不一致）
                //1. 创建必要的结构
                //如果是外键
                if(true===fieldName in fkConfig){
                    if(undefined===formattedValue[fieldName]){
                        formattedValue[fieldName]={}
                    }
                    let redundancyField=fkConfig[fieldName]['fields'][0]//当前冗余字段虽然是数组，但是其实只有一个元素
                    if(undefined===formattedValue[fieldName][redundancyField]){
                        formattedValue[fieldName][redundancyField]=[]
                    }
                    aValue=formattedValue[fieldName][redundancyField]
                }else{
                    if(undefined===formattedValue[fieldName]){
                        formattedValue[fieldName]=[]    //非外键直接数组
                    }
                    aValue=formattedValue[fieldName]
                }

                for(let singleValue of activateQueryFieldAndValue[fieldName]){
                    let newValue={value:singleValue}
                    aValue.push(newValue)
                }

            }
        }



        return {'currentPage':currentPage,'searchParams':formattedValue}
    }
    return {deleteQueryValue,addQueryValue,convertAddQueryValueToServerFormat}
})*/

componentApp.factory('inputAttrHelper',function(contEnum,validateHelper,dateTimePickerHelper) {
    //对某个input设置errorMsg（errorMsg隐式设置input样式）
    function setSingleInputAttrErrorMsg(field,inputAttr,errMsg){
        inputAttr[field]['errorMsg']=errMsg
        inputAttr[field]['validated']=false
    }

    //对一个inputAttr中所有field进行初始化
    function initAllFieldInputAttrCreate(inputAttr,inputRule){
        // console.log(inputAttr)
        for(let singleField in inputAttr){
            // console.log(singleField)
            initSingleFieldInputAttrCreate(singleField,inputAttr,inputRule)
        }
        // console.log(inputAttr)
    }
    //对inputAttr中的一个字段进行初始化
    //除了被initAllFieldInputAttrUpdate调用，也会在mainController中被直接调用，所以参数必须是field/inputAttr
    function initSingleFieldInputAttrCreate(singleField,inputAttr,inputRule){
        // console.log(opType)
        //initAllFieldInputAttrCreate
        if('date'===inputRule[singleField]['type']){
            inputAttr[singleField]['value']=null
            // }
            inputAttr[singleField]['originalValue']=null
        }else{
            inputAttr[singleField]['value']=''
            // }
            inputAttr[singleField]['originalValue']=''
        }

        //无需默认设成false，因为点击 确定按钮的时候，需要通过undefined来判断是否 需要进行validate
/*        //在create的时候，如果字段是必须的，则validated初始设为false（防止直接点击确定提交POST请求）；否则设为undefined
        if(true===inputAttr[singleField]['require']){
            inputAttr[singleField]['validated']='false'
        }else{
            inputAttr[singleField]['validated']='undefined'
        }*/

        inputAttr[singleField]['errorMsg']=''
    }



    //对一个inputAttr中所有field进行初始化
    function initAllFieldInputAttrUpdate(inputAttr){
        // console.log(`inputAttrinputAttr is ${JSON.stringify(inputAttr)}`)
        for(let singleField in inputAttr){
            // console.log(singleField)
            initSingleFieldInputAttrUpdate(singleField,inputAttr)
        }
         // console.log(`after init ${JSON.stringify(inputAttr)}`)
    }
    //除了被initAllFieldInputAttrUpdate调用，也会在mainController中被直接调用，所以参数必须是field/inputAttr
    function initSingleFieldInputAttrUpdate(field,inputAttr){
        // console.log(`singleFieldInputAttr is ${JSON.stringify(singleFieldInputAttr)}`)
        // if(contEnum.opType.create===opType){
        //     inputAttr[field]['value']=''
        // }
        inputAttr[field]['originalValue']=''
        inputAttr[field]['validated']='undefined'
        inputAttr[field]['errorMsg']=''
    }


    //是否所有的input检测都通过了，如果是require，且validated属性为undefined的字段，需要进行validate
    function allInputValidCheck(inputAttr,inputRule){
        // console.log(`all input check validate in`)
        for(let field in inputAttr){
/*            if(undefined===inputAttr[field]['validated']){
                validateHelper.checkInput(field,inputRule,inputAttr)

            }*/
            if(false===inputAttr[field]['validated']){
                // console.log(inputAttr[field])
                return false
            }
        }
        return true
    }
    //将当前的记录载入到inputAttr
    function loadCurrentData(idx,inputAttr,recorder,fkConfig,selectedAC){
        // console.log(`recorder to be loaded is ${JSON.stringify(recorder[idx])}`)
        for(var field in inputAttr){

            if(undefined===recorder[idx][field] || null===recorder[idx][field]){
                inputAttr[field]['value']=''
                inputAttr[field]['originalValue']='' //用来比较是不是做了修改
            }else{
                let newValue=recorder[idx][field]
                if(true===field in fkConfig){
                    let redundancyField=fkConfig[field]['fields'][0]
                    newValue=recorder[idx][field][redundancyField]
                }
                inputAttr[field]['value']=newValue
                inputAttr[field]['originalValue']=newValue //用来比较是不是做了修改

                //除了将recorder的数据载入inputAttr，还需要载入selectedAC，以便在update，且不更改selectedAC的情况下，有数据可以放入inputAttr
                if(true=== field in selectedAC){
                    selectedAC[field]._id = recorder[idx][field]['_id']
                    selectedAC[field].value = recorder[idx][field][fkConfig[field]['fields'][0]]
                    //无需直接赋值给$scope.allData.inputAttr，而是通过acBlur判断通过后才赋值
                    // console.log(`load selectedAC is ${JSON.stringify(selectedAC)}`)
                }

                //如果是日期，除了把值放入inputAttr，还需要手工在页面上显示日期（ng-model对datetimepicker不起作用）
                if('date'===inputAttr[field]['inputDataType']){
                    dateTimePickerHelper.setDate(field,inputAttr[field]['value'])
                }

                /*          patch(bill，amount全部为正)          */
                if('amount'===field){
                    inputAttr[field]['value']=Math.abs(newValue)
                    inputAttr[field]['originalValue']=Math.abs(newValue) //用来比较是不是做了修改
                }
/*                //判断field是否为select(是否设置了容纳初始值的变量，已经定义的类型是否为select)，如果是，除了inputAttr，同时赋值给selectInitValue，以便为select设置初始值
                if(true=== field in selectInitValue && 'select'===inputAttr[field]['inputType']){
                    //英文转换成中文
                    let selectOption=inputAttr[field]['selectOption']
                    for(let singleOption of selectOption){
                        if(singleOption['key']===newValue){
                            selectInitValue[field]=singleOption['value']
                        }
                    }

                }*/
            }

        }
        // console.log(`inputAttr to be loaded is ${JSON.stringify(inputAttr)}`)
        // console.log(`selectInitValue to be loaded is ${JSON.stringify(selectInitValue)}`)
    }

    //为未在inputRule中定义的字段，在inputAttr中产生对应的field，以便显示在页面
    //举例，创建或者修改记录时，其中的cDate/uDate，是server自动产生，而无需client输入，但是可能需要显示在页面，此时，需要添加到inputAttr
    //记录到inputAttr是，只需value一个key，无需type，因为只是显示，不会修改（只在server修改）
    function generateAdditionalFieldIntoInputAttr(recorder,inputAttr){
        for(var singleFieldName in recorder){
            if(undefined===inputAttr[singleFieldName]){
                inputAttr[singleFieldName]={}
                inputAttr[singleFieldName]['value']=recorder[singleFieldName] //只需value一个key，无需type，因为只是显示，不会修改（只在server修改）
            }
        }
    }

    //如果是select传递进来的值，是inputAttr[field][value]='取入'{key:'in',value:'取入'}   ===> inputAttr[field][value]={'in'}
    function convertReadableToEnum(inputAttr,inputRule){
        for(let field in inputAttr){
            if('select'===inputAttr[field]['inputType']){
                //select空，检查是否require；非require，不进行转换
                if(''===inputAttr[field]['value'] || null===inputAttr[field]['value']){
                    if(false===inputRule[field]['require']['define']){
                        continue
                    }
                }
                //enum非空，执行readable==>enum的转换
                else{
                    for(let singleOption of inputAttr[field]['selectOption']){
                        if(singleOption.value===inputAttr[field]['value']){
                            inputAttr[field]['value']=singleOption.key
                        }
                    }
                }


            }
        }
    }

    //将inputAttr的value转换成values:{f1:{value:1},f2:{value:2}}的格式，以便在传递到server
//如果无值，则设成null，server会自动进行处理
    function convertedInputAttrFormatCreate(inputAttrs){
        var value={}
        for(var singleInputAttr in inputAttrs){
            value[singleInputAttr]={}
            //console.log(`current field is ${singleInputAttr}`)
            //console.log(`current field value is ${JSON.stringify(inputAttrs[singleInputAttr]) }`)
            if(undefined!==inputAttrs[singleInputAttr]['value'] &&  null!==inputAttrs[singleInputAttr]['value'] && ''!==inputAttrs[singleInputAttr]['value']){
/*                //如果是枚举类型（性别，支取类型）,那么值取其中的key （key:'in',value:'取入'）
                if(true===inputAttrs[singleInputAttr]['isSelect']){
                    value[singleInputAttr]['value']=inputAttrs[singleInputAttr]['value']['key']
                }else{*/
                    value[singleInputAttr]['value']=inputAttrs[singleInputAttr]['value']
                //}

            }else{
                value[singleInputAttr]['value']=null
            }
        }
        return value
    }


    //只有value和originalValue的值不同，才会将value发送到server
    function convertedInputAttrFormatUpdate(inputAttrs){
        var value={}
        for(var singleInputAttr in inputAttrs){
            value[singleInputAttr]={}
            //console.log(`current field is ${singleInputAttr}`)
            //console.log(`current field value is ${JSON.stringify(inputAttrs[singleInputAttr]) }`)
            //if(inputAttrs[singleInputAttr]['value']!==inputAttrs[singleInputAttr]['originalValue']){
                if(undefined!==inputAttrs[singleInputAttr]['value'] &&  null!==inputAttrs[singleInputAttr]['value'] && ''!==inputAttrs[singleInputAttr]['value']){
                    //如果是枚举类型（性别，支取类型）,那么值取其中的key （key:'in',value:'取入'）
/*                    if(true===inputAttrs[singleInputAttr]['isSelect']){
                        value[singleInputAttr]['value']=inputAttrs[singleInputAttr]['value']['key']
                    }else{*/
                        value[singleInputAttr]['value']=inputAttrs[singleInputAttr]['value']
                    //}
                }else{
                    value[singleInputAttr]['value']=null
                }
            //}
        }
        return value
    }

    //acObj:客户端获得的autoComplete的选中值；values：将要发送到server的数据
    //acObj {parentBillType:{value:'xxx','_id':null}====>values  {parentBillType:{value:'_id'}}
    function convertSingleACFormat(acField,acObj,values){
        // for(let key in acObj){
        if(undefined!==acObj && null!==acObj){
            values[acField]={value:null}
            if(undefined!==acObj[acField]['_id'] || null!==acObj[acField]['_id']){
                values[acField]['value']=acObj[acField]['_id']
            }
        }

        // }
    }

    //对于create，如果是null的话，说明没有设置
    function initSingleAcFieldForCreate(acField,acObj){
        if(undefined===acObj[acField] || null===acObj[acField]){
            acObj[acField]={}
        }
        acObj[acField]['value']=''
        acObj[acField]['_id']=null
    }

    //对于update，如果_id是-1的话，说明没有设置（null代表要删除此字段）
    function initSingleAcFieldForUpdate(acField,acObj){
        if(undefined===acObj[acField] || null===acObj[acField]){
            acObj[acField]={}
        }
        acObj[acField]['value']=''
        acObj[acField]['_id']=-1
    }
    return {
        setSingleInputAttrErrorMsg,
        initSingleFieldInputAttrCreate,
        initAllFieldInputAttrCreate,
        initSingleFieldInputAttrUpdate,
        initAllFieldInputAttrUpdate,
        allInputValidCheck,
        loadCurrentData,
        generateAdditionalFieldIntoInputAttr,
        convertReadableToEnum,
        convertedInputAttrFormatCreate,
        convertedInputAttrFormatUpdate,
        convertSingleACFormat,
        initSingleAcFieldForCreate,
        initSingleAcFieldForUpdate,
    }
})

componentApp.factory('commonHelper',function(){
    //对server返回的result，进行检查，如果是日期，用moment进行转换
    //result：从server返回的结果(非数组，而是单个记录)；filedType：当前result的field类型
    function convertDateTime(singleRecorder,fieldType){
        let dateFormat='YYYY-MM-DD HH:mm:ss'
        for(let singleFiled in singleRecorder){
            //result中的字段是否为date，是的话用moment进行转换
            if(-1!==fieldType.indexOf(singleFiled)){
                singleRecorder[singleFiled]=moment(singleRecorder[singleFiled]).format(dateFormat)
            }
        }
    }

    /*      从db读取的数据，如果是select方式的，则从key（英文）转换成value（中文）     */
    //recorder：search返回的记录（数组）
    //inputAttr:recorder对应的inputAttr（以coll为单位）
    //遍历每个记录的每个字段，如果是select，调用convertEnumData进行转换
    function convertSingleRecorderEnumData(singleRecorder,inputAttr){
        //遍历inputAttr，获得select的字段名和字段值（防止每个记录都重遍历）
        //存储是select的字段名
        let fieldIsSelect=[]
        for(let fieldName in inputAttr){
            // console.log(`fiedls name is ${fieldName}`)
            if('select'===inputAttr[fieldName]['inputType']){
                fieldIsSelect.push(fieldName)
            }
        }
        // console.log(`select field to ve convert is ${JSON.stringify(fieldIsSelect)}`)
/*        recorder.map(
            (singleRecorder,idx)=>{*/
                fieldIsSelect.map(
                    (isSelectFieldName,idx)=>{
                        // console.log(`orig value is ${JSON.stringify(singleRecorder)}`)
                        // let convertedValue=convertEnumDataToReadable(singleRecorder[isSelectFieldName],inputAttr[isSelectFieldName]['selectOption'])
                        // console.log(`convtered value is ${JSON.stringify(convertedValue)}`)
                        singleRecorder[isSelectFieldName]=convertEnumDataToReadable(singleRecorder[isSelectFieldName],inputAttr[isSelectFieldName]['selectOption'])
                        // console.log(`convtered value is ${JSON.stringify(singleRecorder)}`)
                    }
                )
/*            }
        )*/
    }

    /*                  如果某个字段是select，那么显示的时候，是中文，而不是英文                            */
    //例如 性别，读取到的是male/female，需要翻译成男/女
    //ecodedValue: male
    //selectOption: inputAttr中的selectOption [{key:'male',value:'男'}]
    function convertEnumDataToReadable(encodedValue,selectOption){
        // console.log( `select value is ${encodedValue}`)
        // console.log( `select option is ${JSON.stringify(selectOption)}`)
        let matchedValue
        selectOption.forEach(
            (ele)=>{
                if(encodedValue===ele.key){
                    matchedValue= ele.value
                }
            }
        )
        return matchedValue
/*        selectOption.map(
            (ele,idx)=>{
                console.log(`single ele is ${JSON.stringify(ele)}`)

            }
        )*/
    }

    return {
        convertDateTime,
        convertSingleRecorderEnumData,
    }
})

componentApp.service('modal',function(){
    let _modalId,_modalMsgId,_modalTitleId,_modalCloseButtonId,_modalCloseSymbolId
    function _setTop(){
        //$('#modal_modal>div').height()=174，直接测量得到，因为只有在show时，才有height，hide时为0
        //var top=parseInt((document.body.clientHeight-174)/2)
        $('#'+_modalId).css('top',100)
    }
    function _modalHide(){
        $('#'+_modalMsgId).text('')
        $('#'+_modalId).removeClass('show')
        $('#'+_modalTitleId).text('').removeClass('text-danger').removeClass('text-info')
        $('#'+_modalCloseButtonId).removeClass('btn-danger').removeClass('btn-info').unbind('click')
        $('#'+_modalCloseSymbolId).unbind('click')
    }
    /*                  设置id            */
    //modal的id
    this.setModalId=function(modalId){
        _modalId=modalId
        //默认是如下格式，可以通过set覆盖
        _modalMsgId=modalId+'_msg'
        _modalTitleId=modalId + '_title'
        _modalCloseButtonId=modalId+'_close_button'
        _modalCloseSymbolId=modalId+'_close_symbol'
    }

    //modalMsg：显示信息的元素
    this.setModalMsgId=function(modalMsgId){
        _modalMsgId=modalMsgId
    }

    this.setModalTitleId=function(modalTitleId){
        _modalTitleId=modalTitleId
    }

    this.setModalCloseButtonId=function(modalCloseButtonId){
        _modalCloseButtonId=modalCloseButtonId
    }

    this.setModalCloseSymbolId=function(modalCloseSymbolId){
        _modalCloseSymbolId=modalCloseSymbolId
    }

    /*              设置信息            */
    this.showErrMsg=function(msg){
        _setTop()
        $('#'+_modalMsgId).text(msg)
        //$('#modal_msg').text=msg
        $('#'+_modalId).addClass('show')
        $('#'+_modalTitleId).text('错误').addClass('text-danger')
        $('#'+_modalCloseButtonId).addClass('btn-danger').bind('click',function(){
            _modalHide(_modalId)
        })
        $('#'+_modalCloseSymbolId).bind('click',function(){
            _modalHide(_modalId)
        })
    }

    this.showInfoMsg=function(msg) {
        _setTop()
        $('#' + _modalMsgId).text(msg)
        $('#' + _modalId ).addClass('show')
        $('#' +_modalTitleId).text('信息').addClass('text-info')
        $('#' + _modalCloseButtonId).addClass('btn-info').bind('click', function () {
            _modalHide(_modalId)
        })
        $('#' + _modalCloseSymbolId).bind('click', function () {
            //console.log(`click symbol id is ${_modalCloseSymbolId}`)
            _modalHide(_modalId)
        })
    }


})

componentApp.service('modalChoice',function(htmlHelper){
    let _modalId,_modalMsgId,_modalTitleId,_modalYesButtonId,_modalNoButtonId,_modalCloseSymbolId
    function _setTop(){
        //$('#modal_modal>div').height()=174，直接测量得到，因为只有在show时，才有height，hide时为0
        //var top=parseInt(($(window).height()-174)/2)
        $('#'+_modalId).css('top',100)
        //htmlHelper.verticalModalCenter(_modalId)
    }
    function _modalHide(){
        $('#'+_modalMsgId).text('')
        $('#'+_modalId).removeClass('show')
        $('#'+_modalTitleId).text('').removeClass('text-danger').removeClass('text-info')
        $('#'+_modalYesButtonId).removeClass('btn-danger').removeClass('btn-info').unbind('click')
        $('#'+_modalNoButtonId).removeClass('btn-danger').removeClass('btn-info').unbind('click')
        $('#'+_modalCloseSymbolId).unbind('click')
    }
    /*                  设置id            */
    //modal的id
    this.setModalId=function(modalId){
        _modalId=modalId
        //默认是如下格式，可以通过set覆盖
        _modalMsgId=modalId+'_msg'
        _modalTitleId=modalId + '_title'
        _modalYesButtonId=modalId+'_yes_button'
        _modalNoButtonId=modalId+'_no_button'
        _modalCloseSymbolId=modalId+'_close_symbol'
    }

    /*//choice is yes/no, string
    function setChoice(choice){
        //采用jquery的deferred，以便全局操作
        let deferred=$q.defer()
        if('yes'===choice.toLowerCase()){
            deferred.resolve(true)
        }else{
            deferred.resolve(false)
        }
        return deferred.promise
    }*/
    //modalMsg：显示信息的元素
    this.setModalMsgId=function(modalMsgId){
        _modalMsgId=modalMsgId
    }

    this.setModalTitleId=function(modalTitleId){
        _modalTitleId=modalTitleId
    }

    this.setModalYesButtonId=function(modalYesButtonId){
        _modalYesButtonId=modalYesButtonId
    }

    this.setModalNoButtonId=function(modalNoButtonId){
        _modalNoButtonId=modalNoButtonId
    }

    this.setModalCloseSymbolId=function(modalCloseSymbolId){
        _modalCloseSymbolId=modalCloseSymbolId
    }

    /*              设置信息            */
    //currentPage:删除后要重新获得当前页的数据
    this.showChoiceMsg=function(msg,yesDelFunc,idx,recorder,currentPage) {
/*        console.log(  `enter show choice msg`)
        console.log(  `_modalId is ${_modalId}`)*/
        _setTop()
        $('#' + _modalMsgId).text(msg)
        $('#' + _modalId ).addClass('show')
        $('#' +_modalTitleId).text('删除').addClass('text-danger')
        $('#' + _modalYesButtonId).addClass('btn-danger').bind('click', function () {
            _modalHide(_modalId)
            yesDelFunc(idx,recorder,currentPage)
            //return setChoice('yes')
        })
        $('#' + _modalNoButtonId).addClass('').bind('click', function () {
            _modalHide(_modalId)
            //return setChoice('no')
        })
        $('#' + _modalCloseSymbolId).bind('click', function () {
            //console.log(`click symbol id is ${_modalCloseSymbolId}`)
            _modalHide(_modalId)
        })
    }


})

//采用jquery的方式对指定的input进行初始化，以及设置获得日期时间
componentApp.service('dateTimePickerHelper',function(){
    // let _dateTimeEleId
    this.initEle=function(eleId){
        //_dateTimeEleId=eleId
        // console.log(`dateTimePicker init in`)
        // console.log(`id is ${eleId}`)
        // console.log(typeof moment('asdf').format('YYYY-MM-DD'))
        // console.log(moment('2013').format('YYYY-MM-DD'))
/*
        $(function () {
            console.log(`date tiem picker is id ${_dateTimeEleId}`)
            $('#' + _dateTimeEleId).datetimepicker()
        })*/
        $('#'+eleId).datetimepicker(
            {
            locale:'zh-cn', // 根据moment的定义，https://github.com/moment/moment/tree/develop/locale
/*            default:function(){
                
            },*/
                viewMode:'days',//default days, accept decades/years/months/
                format:'YYYY-MM-DD', //http://momentjs.com/docs/#/displaying/format/ 'YYYY-MM-DD HH:mm'
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-arrow-up",
                down: "fa fa-arrow-down"
            }
        }
        ).on(
            'dp.change',function(e){
                //$('#'+eleId+'>input').val(e.date)
                // console.log(`ele ${eleId} on change result is ${JSON.stringify(e.date)}`)
        }
        )

        // $('#'+_dateTimeEleId).data("DateTimePicker").date("2016-02-01")
    }

    this.getCurrentDate=function(eleId){
        return $('#'+eleId).data("DateTimePicker").date()
    }
    this.getCurrentDateInTimeStamp=function(eleId){
        let currentDate= $('#'+eleId).data("DateTimePicker").date()
        return moment(currentDate).unix()*1000  //转换成ms，以便和db兼容
    }

    this.setDate=function(eleId,date){
        // console.log(`setDate date is ${date}`)
        $('#'+eleId).data("DateTimePicker").date(date)
    }
    this.getDate=function(eleId){
        return $('#'+eleId).data("DateTimePicker").date()
    }

    this.setFirstDay=function(eleId){
        // let [year,month]=[moment().get('year'),moment().get('month')]
        // let firstDay=year+'-'+month+'-01'
        let d=moment().startOf("month")
        // console.log(`first day is ${d}`)
        $('#'+eleId).data("DateTimePicker").date(d)
        //$('#'+eleId).data("DateTimePicker").setValue(d)
    }
    this.setLastDay=function(eleId){
        // let [year,month]=[moment().get('year'),moment().get('month')]
        // let firstDay=year+'-'+month+'-01'
        let d=moment().endOf("month")
        $('#'+eleId).data("DateTimePicker").date(d)
    }

    this.setLastYearToday=function(eleId,currentDate){
        // let [year,month]=[moment().get('year'),moment().get('month')]
        // let firstDay=year+'-'+month+'-01'
        let d=moment(currentDate).subtract(1,'years')
        // console.log(`last year today is ${d}`)
        $('#'+eleId).data("DateTimePicker").date(d)
        //$('#'+eleId).data("DateTimePicker").setValue(d)
    }
    this.validateDate=function(eleId){
        let datetobecheck=$('#'+eleId).data("DateTimePicker").date()
        // console.log(`date to be check is ${datetobecheck}`)
        // console.log(`date to be checked result is ${moment(datetobecheck).format("YYYY-MM-DD")}`)
        if("Invalid date"===moment(datetobecheck).format("YYYY")){
            return false
        }
        return true
    }
})

//分页函数
componentApp.service('paginationHelper',function(validateHelper){
    //根据serve传递过来的数据，产生用于页面的分页 数据
    //serverData：从server端获得的原始分页数据
    //返回：angular用于渲染页面的 分页 数据
    this.generateClientPagination=function(serverPaginationInfo){
        let clientPagination= {
            'paginationInfo': null,//存储server返回的pagination信息。{"start":1,"end":2,"currentPage":1,"showPrevious":false,"showNext":true,"totalPage":2,"pageSize":6}
            'pageRange': null,//根据server传递的start和end产生一个连续数组，标识页码
            'goToPageNo': null,//go to page no
            'goToButtonEnable': false,//go to button是否enable（只有填入了合格的页码，才能enable button）
        }

        //console.log(`clientPagination is ${JSON.stringify(clientPagination)}`)
        clientPagination.paginationInfo=serverPaginationInfo

        if(null===clientPagination.pageRange){
            clientPagination.pageRange=[]
        }
        if(null!==clientPagination.pageRange){
            clientPagination.pageRange.splice(0, clientPagination.pageRange.length)
        }
        for(let i=clientPagination.paginationInfo.start;i<=clientPagination.paginationInfo.end;i++){
            let ele={}
            ele['pageNo']=i
            ele['active']=false
            if(i===clientPagination.paginationInfo.currentPage){
                ele['active']=true
            }

            clientPagination.pageRange.push(ele)
        }
// console.log(`clientPagination is ${JSON.stringify(clientPagination)}`)
        return clientPagination
    }

    //判读页码是否为整数
    this.validateGoToPageNo=function(goToPageNo){
        return validateHelper.dataTypeCheck.isInt(goToPageNo)
    }
})

//module.exports=componentApp.name
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(0)))

/***/ }),

/***/ 122:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Created by ada on 2016/9/15.
 */

/*      for webpack     */
// require('./component')


var financeApp=angular.module('finance',['component']);

financeApp.factory('financeHelper',function($http,$q,inputAttrHelper,commonHelper,modal,modalChoice,paginationHelper){
/*    //根据inputAttr的内容，生成合适的values，以便server处理
    var generateInputValue=function(inputAttr){
        let values={}
        for(let key in inputAttr){
            if(inputAttr[key] && inputAttr[key]['value']){
                values[key]={}
                values[key]['value']=inputAttr[key]['value']
            }
        }
        return values
    }*/
    modal.setModalId('modalCommon')

    modalChoice.setModalId('modalChoice')

    var dataOperator=
    {
        //billType: {
        //idx无用，只是为了统一使用参数(create和update同样在modal上操作，使用同一个按钮)
        //成功添加一个记录后，无论当前页码是多少，都要返回第一页
        'create': function (idx, inputAttr, recorder, selectAC, fkConfig, eColl, aDateToBeConvert,pagination) {
            //首先加入db（加入db时，angular已经执行过value的检测，因此无需再次执行inputCheck）
            //从inputAttr提取数据，转换成{field1:{value1:xxx},field2:{value2:yyy}}如果是select，则从value(中文)转换成key(英文)
            let value = inputAttrHelper.convertedInputAttrFormatCreate(inputAttr)
            // console.log(`converted value is ${JSON.stringify(value)}`)
            //convertedValue['newAddedRecorder']=value
            //转换外键的格式
            for (let singleFKField in fkConfig) {
                inputAttrHelper.convertSingleACFormat(singleFKField, selectAC, value)
            }
            let paginationInfo=pagination.paginationInfo
            let url = '/' + eColl
            // value['currentPage']=
            $http.post(url, {values:{recorderInfo:value,'currentPage':paginationInfo.currentPage}}).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //直接对整个返回的记录数组进行enum的转换（单独使用convertRecorderEnumData，效率较高）
                    data.msg['recorder'].map(
                        (singleRecorder,idx)=>{
                            commonHelper.convertSingleRecorderEnumData(singleRecorder,inputAttr)
                        }
                    )

                    //对server返回的数据中的日期进行格式化，并删除nestedPrefix字段
                    if (null !== data.msg && null !==data.msg.recorder) {
                        data.msg.recorder.map(
                            (ele,idx)=>{
                                commonHelper.convertDateTime(ele, aDateToBeConvert)
                                //检查外键是否存在，存在的话，将外键object转换成字符
                                // console.log(`before FK format result ${JSON.stringify(data.msg)}`)
                                //需要删除nestedPrefix字段
                                for (let singleFKField in fkConfig) {
                                    let nestedPrefix = fkConfig[singleFKField]['nestedPrefix']
                                    delete data.msg.recorder[nestedPrefix]
                                }

                                // console.log(`after FK format result ${JSON.stringify(data.msg.recorder)}`)
                            }
                        )


                        if(1===data.msg.recorder.length){
                            recorder.splice(0,0,data.msg.recorder[0])

                        }
                        if(1<data.msg.recorder.length){
                            //清空记录
                            recorder.splice(0,data.msg.recorder.length)
                            //全部添加第一页的记录
                            data.msg.recorder.map(
                                (ele,idx)=>{
                                    recorder.push(ele)
                                }
                            )

                        }
                        //添加后，记录数量超过pageSize，删除多余记录（可能不止一条？）
                        if(recorder.length>paginationInfo.pageSize){
                            let startIdx=paginationInfo.pageSize
                            let deleteNum=recorder.length-paginationInfo.pageSize
                            recorder.splice(startIdx,deleteNum)
                        }

                        //设置分页
                        let a=paginationHelper.generateClientPagination(data.msg['paginationInfo'])
                        Object.assign(pagination,a)
                        //recorder.push(data.msg)
                        modal.showInfoMsg('记录添加成功')
                    }

                    //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                } else {
                    modal.showErrMsg(JSON.stringify(data.msg))
                }
            }).error(function () {
                // console.log('err')
            })
            //然后加入client数据，防止多次返回
            //_angularDataOp.create(idx,inputAttr,recorder)
        },

        //delete返回的是删除记录后，当前页 的数据
        //fkConfig: 清楚数组中多余的字段
        //dateField: 转换日期格式
        'delete': function (idx, recorder, eColl,convertedValue,fkConfig,aDateToBeConvert,pagination) {
            //URL中的id用于告知删除哪个
            // console.log(`convertedValue is ${JSON.stringify(convertedValue)}`)
            let url = '/' + eColl + '/delete/' + recorder[idx]['_id']
            //删除后，还是留在原来的页上，因此必须上传 searchParams和currentPage
            $http.post(url, {values:convertedValue}).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //设置分页
                    let a=paginationHelper.generateClientPagination(data.msg['paginationInfo'])
                    Object.assign(pagination,a)

                    if (data.msg.recorder) {
                        let returnRecorderLength = data.msg.recorder.length
                        // console.log(`recorder length is ${returnRecorderLength}`)
                        // console.log(`return pagination  is ${JSON.stringify(pagination)}`)
                        //删除最后一页上的一个记录，且删完后最后一页还有其他记录;则只需删除对应的记录
                        if(0===returnRecorderLength){
                            recorder.splice(idx,1)
                            return true
                        }
                        //删除非最后一页的一个记录，则最后补充一个记录
                        if(1===returnRecorderLength){
                            recorder.splice(idx,1)
                        }
                        //删除最后一页的一个记录，且此记录为最后一页的唯一记录；则删完后要跳转到前一页(recorder清空，并压入前一页的所有值)
                        if (pagination.paginationInfo.pageSize==returnRecorderLength) {
                            // console.log(`recorder before splice is ${JSON.stringify(recorder)}`)
                            recorder.splice(0,recorder.length)
                            // console.log(`recorder after splice is ${JSON.stringify(recorder)}`)
                        }

                        //因为返回的记录是数组，所有可以同一个过程压入数据
                        data.msg.recorder.map(
                            (ele, idx)=> {
                                commonHelper.convertDateTime(ele, aDateToBeConvert)
                                //需要删除nestedPrefix字段
                                for (let singleFKField in fkConfig) {
                                    let nestedPrefix = fkConfig[singleFKField]['nestedPrefix']
                                    delete data.msg['recorder'][nestedPrefix]
                                }
                                recorder.push(ele)
                            }
                        )
                    }



/*                    recorder.splice(0, recorder.length)   //清空数组
                    //console.log(`after empty array is ${JSON.stringify(recorder)}`)
                    data.msg['recorder'].forEach(function (e) {
                        commonHelper.convertDateTime(e, aDateToBeConvert)
                        //需要删除nestedPrefix字段
                        for (let singleFKField in fkConfig) {
                            let nestedPrefix = fkConfig[singleFKField]['nestedPrefix']
                            delete data.msg[nestedPrefix]
                        }
                        /!*                            if(e.parentBillType && e.parentBillType.name){
                         console.log('in')
                         e.parentBillType=e.parentBillType.name
                         }*!/
                        recorder.push(e)*/

/*                    console.log(`after push array is ${JSON.stringify(recorder)}`)

                    pagination.paginationInfo=data.msg['paginationInfo']

                    if(null===pagination.pageRange){
                        pagination.pageRange=[]
                    }
                    if(null!==pagination.pageRange){
                        pagination.pageRange.splice(0, pagination.pageRange.length)
                    }
                    for(let i=pagination.paginationInfo.start;i<=pagination.paginationInfo.end;i++){
                        let ele={}
                        ele['pageNo']=i
                        ele['active']=false
                        if(i===pagination.paginationInfo.currentPage){
                            ele['active']=true
                        }

                        pagination.pageRange.push(ele)
                    }*/
                    //console.log(`generate page range is ${JSON.stringify(pagination.pageRange)}`)
                    // recorder=data.msg
                    //console.log(`page info is ${JSON.stringify(pagination)}`)

                } else {
                    modal.showErrMsg(data.msg)
                }
            }).error(function (data, status, header, config) {

            })
            //然后更新client端数据
            //_angularDataOp.delete(idx, recorder)
        },
        'update': function (idx, inputAttr, recorder, selectAC, fkConfig, eColl, aDateToBeConvert) {
            //首先更新数据到db（更新db时，angular已经执行过value的检测，因此无需再次执行inputCheck）
            //将修改过的值上传修改
            let value = inputAttrHelper.convertedInputAttrFormatUpdate(inputAttr)
// console.log(`update op convert result is ${JSON.stringify(value)}`)
            //将外键的id转换成server可以接收的格式
            for (let singleFKField in fkConfig) {
                inputAttrHelper.convertSingleACFormat(singleFKField, selectAC, value)
            }

            // console.log(`value 1 is ${JSON.stringify(value)}`)
            //添加要更新记录的_id。必须使用_id（server只认识_id）
            // console.log(`idx is ${idx},recorder is ${JSON.stringify(recorder[idx])}`)
            value['_id'] = {value: recorder[idx]['_id']}
            // console.log(`value 2 is ${JSON.stringify(value)}`)
            //Object.assign(value,selectAC)
            let url = '/' + eColl
            //只是为了凑齐格式，其实update无需currentPage
            $http.put(url, {values: {'recorderInfo':value,'currentPage':1}}).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //直接对整个返回的记录数组进行enum的转换（单独使用convertRecorderEnumData，效率较高）
                    //update返回一个记录（非数组格式），且包含在data.msg中
                    commonHelper.convertSingleRecorderEnumData(data.msg,inputAttr)
                    //对server返回的数据中的日期进行格式化
                    //console.log(`before date format result ${JSON.stringify(returnResult.msg)}`)
                    commonHelper.convertDateTime(data.msg, aDateToBeConvert)
                    //需要删除nestedPrefix字段
                    for (let singleFKField in fkConfig) {
                        let nestedPrefix = fkConfig[singleFKField]['nestedPrefix']
                        delete data.msg[nestedPrefix]
                    }
                    /*                        // 外键用name/title替换（不显示ObjectId）
                     for(let singleFKField in fkConfig){
                     let aRedundancyFields=fkConfig[singleFKField]['fields']
                     //每个fk可能对应多个冗余field
                     for(let singleField of aRedundancyFields){
                     if(data.msg[singleFKField] && data.msg[singleFKField][singleField]){
                     if(undefined===data.msg[singleFKField]){
                     data.msg[singleFKField]=data.msg[singleFKField][singleField]
                     }
                     }
                     }
                     }*/
                    /*                        if(data.msg.parentBillType && data.msg.parentBillType.name){
                     data.msg.parentBillType=data.msg.parentBillType.name
                     }*/
                    for (let singleField in data.msg) {
                        recorder[idx][singleField] = data.msg[singleField]
                    }
                    //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                } else {
                    modal.showErrMsg(JSON.stringify(data.msg))
                }
            }).error(function () {
                console.log('err')
            })
        },
        'readName': function (name, eColl,callerColl) {
            let url = '/' + eColl + '/name/'
            return $http.post(url, {values: name,caller:callerColl}, {})
        },
        'search': function (recorder, queryValue, fkConfig, eColl, aDateToBeConvert,pagination,inputAttr) {
// console.log(`search input attr is ${JSON.stringify(inputAttr)}`)
            let url = '/' + eColl + "/" + "search"
            return  $http.post(url, {values: queryValue}).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //直接对整个返回的记录数组进行enum的转换（单独使用convertRecorderEnumData，效率较高）
                    //直接对整个返回的记录数组进行enum的转换（单独使用convertRecorderEnumData，效率较高）
                    data.msg['recorder'].map(
                        (singleRecorder,idx)=>{
                            commonHelper.convertSingleRecorderEnumData(singleRecorder,inputAttr)
                        }
                    )
                    //对server返回的数据中的日期进行格式化
                    //console.log(`read result is ${JSON.stringify(data.msg)}`)

                    recorder.splice(0, recorder.length)   //清空数组
                    //console.log(`after empty array is ${JSON.stringify(recorder)}`)
                    data.msg['recorder'].forEach(function (e) {
                        commonHelper.convertDateTime(e, aDateToBeConvert)
                        //需要删除nestedPrefix字段
                        for (let singleFKField in fkConfig) {
                            let nestedPrefix = fkConfig[singleFKField]['nestedPrefix']
                            delete data.msg[nestedPrefix]
                        }

                        recorder.push(e)
                    })
                    //console.log(`after push array is ${JSON.stringify(recorder)}`)
                    let a=paginationHelper.generateClientPagination(data.msg['paginationInfo'])
                    Object.assign(pagination,a)

                    // console.log(`page info is ${JSON.stringify(pagination)}`)

                    // htmlHelper.adjustFooterPosition()
                } else {
                    modal.showErrMsg(JSON.stringify(data.msg))
                }
            }).error(function () {
                console.log('err')
            })
        },
        'getCurrentCapital':function(){
            let url="/bill/static/getCurrentCapital"
            let deferred=$q.defer()
            $http.post(url,{}).success(function(data, status, header, config){
                if(0===data.rc){
                    let currentCapital=[],totalCurrentCapital=null
                    //获得各个分组
                    for(let topBillTyeEle of data.msg.data){
                        let sumAmount=eval(topBillTyeEle.join('+'))
                        currentCapital.push(sumAmount)
                    }
                    //获得各分组的总计
                    totalCurrentCapital=eval(currentCapital.join('+'))
                    // structure=data.msg.structure
                    deferred.resolve({rc:0,msg:{"currentCapital":currentCapital,"totalCapital":totalCurrentCapital,"billTypeStructure":data.msg.structure}})
                    // console.log(`current captial array is ${JSON.stringify(currentCapital)}`)
                    // console.log(`totalCurrentCapital is ${JSON.stringify(totalCurrentCapital)}`)
                }else{
                    modal.showErrMsg(JSON.stringify(data.msg))
                    deferred.reject(data)
                }

            }).error(function(){

            })

            return deferred.promise
        },
        'getGroupCapital':function(searchParams,currentPage){
            // console.log(`pass in curentPage is ${currentPage}`)
            let url="/bill/static/getGroupCapital"
            let deferred=$q.defer()
            let groupCapital
            $http.post(url,{values:{"searchParams":searchParams,"currentPage":currentPage}}).success(function(data, status, header, config){
                if(0===data.rc){
                    groupCapital=data.msg
                    deferred.resolve({rc:0,'groupCapital':groupCapital})
                    // console.log(`getGroupCapital is${JSON.stringify(groupCapital)}`)
                }else{
                    modal.showErrMsg(JSON.stringify(data.msg))
                }

            }).error(function(){

            })

            return deferred.promise
        },
        'getServerTime':function(){
            let deferred=$q.defer()
            let url="/getServerTime";
            return $http.get(url,{}) //返回promise，在mainController中通过success初始化日期
          /*  $http.get(url,{}).success(
                (data, status, header, config)=>{
                    console.log(`${JSON.stringify(data)}`)
                    deferred.resolve(data)
                }
            ).error(
                (data, status, header, config)=>{
                    console.log(`get server time failed`)
                    alert('get server time failed')
                    deferred.reject(false)
                }
            )*/
        }
    }

    return {
        dataOperator,
        //suggest_state
    }
})

//module.exports=financeApp.name

/***/ }),

/***/ 123:
/***/ (function(module, exports) {

/**
 * Created by ada on 2016/9/5.
 * 由/maintain/developer_helper。js产生inputRule和inputAttr
 */
var constantApp=angular.module('contDefine',[])
constantApp.constant('cont',{

    //dataType主要验证client的用户输入，所以只要基本数据类型
    dataType:{
        'int':'int',
        'float':'float',
        'number':'number',

        'string':'string',

        'date':'date',
    },
    //asideName:{configuration:'配置信息',bill:'单据信息'},//aside菜单名称
    //angular检查input输入的rule（由服务器端脚本根据inputRule生成：包括去除不必要字段，关联到相关字段等操作）
    inputRule:
    {
        "user": {
            "name": {
                "require": {
                    "define": true,
                    "msg": "用户名不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "用户名所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "用户名包含的字符数不能少于2个"
                },
                "type": "string"
            },
            "salt": {
                "require": {
                    "define": false,
                    "msg": "盐不能为空"
                },
                "maxLength": {
                    "define": 10,
                    "msg": "盐所包含的字符数不能超过10个"
                },
                "minLength": {
                    "define": 1,
                    "msg": "盐包含的字符数不能少于1个"
                },
                "type": "string"
            },
            "password": {
                "require": {
                    "define": true,
                    "msg": "密码不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "密码所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 6,
                    "msg": "密码包含的字符数不能少于6个"
                },
                "type": "string"
            },
            "encryptedPassword": {
                "require": {
                    "define": true,
                    "msg": "密码不能为空"
                },
                "type": "string"
            }
        },
        "department": {
            "name": {
                "require": {
                    "define": true,
                    "msg": "部门名称不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "部门名称所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "部门名称包含的字符数不能少于2个"
                },
                "type": "string"
            },
            "parentDepartment": {
                "require": {
                    "define": false,
                    "msg": "上级部门不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "上级部门所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "上级部门包含的字符数不能少于2个"
                },
                "type": "string"
            }
        },
        "employee": {
            "name": {
                "require": {
                    "define": true,
                    "msg": "员工姓名不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "员工姓名所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "员工姓名包含的字符数不能少于2个"
                },
                "type": "string"
            },
            "leader": {
                "require": {
                    "define": false,
                    "msg": "上级主管不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "上级主管所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "上级主管包含的字符数不能少于2个"
                },
                "type": "string"
            },
            "gender": {
                "require": {
                    "define": false,
                    "msg": "性别的默认值不能为空"
                },
                "enum": {
                    "define": [
                        "male",
                        "female"
                    ],
                    "msg": "性别的默认值不正确"
                },
                "type": "string"
            },
            "birthDay": {
                "require": {
                    "define": false,
                    "msg": "出生日期不能为空"
                },
                "type": "date"
            },
            "department": {
                "require": {
                    "define": true,
                    "msg": "所属部门不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "所属部门所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "所属部门包含的字符数不能少于2个"
                },
                "type": "string"
            },
            "onBoardDate": {
                "require": {
                    "define": false,
                    "msg": "入职日期不能为空"
                },
                "type": "date"
            }
        },
        "billType": {
            "name": {
                "require": {
                    "define": true,
                    "msg": "单据类别不能为空"
                },
                "maxLength": {
                    "define": 40,
                    "msg": "单据类别所包含的字符数不能超过40个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "单据类别包含的字符数不能少于2个"
                },
                "type": "string"
            },
            "inOut": {
                "require": {
                    "define": false,
                    "msg": "支取类型不能为空"
                },
                "enum": {
                    "define": [
                        "in",
                        "out"
                    ],
                    "msg": "支取类型不正确"
                },
                "type": "string"
            },
            "parentBillType": {
                "require": {
                    "define": false,
                    "msg": "父类别不能为空"
                },
                "maxLength": {
                    "define": 40,
                    "msg": "父类别所包含的字符数不能超过40个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "父类别包含的字符数不能少于2个"
                },
                "type": "string"
            }
        },
        "bill": {
            "title": {
                "require": {
                    "define": false,
                    "msg": "单据抬头不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "单据抬头所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "单据抬头包含的字符数不能少于2个"
                },
                "type": "string"
            },
            "content": {
                "require": {
                    "define": false,
                    "msg": "单据内容不能为空"
                },
                "maxLength": {
                    "define": 60,
                    "msg": "单据内容所包含的字符数不能超过60个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "单据内容包含的字符数不能少于2个"
                },
                "type": "string"
            },
            "billType": {
                "require": {
                    "define": true,
                    "msg": "单据类别不能为空"
                },
                "maxLength": {
                    "define": 40,
                    "msg": "单据类别所包含的字符数不能超过40个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "单据类别包含的字符数不能少于2个"
                },
                "type": "string"
            },
            "billDate": {
                "require": {
                    "define": false,
                    "msg": "单据日期不能为空"
                },
                "type": "date"
            },
            "amount": {
                "require": {
                    "define": true,
                    "msg": "报销金额不能为空"
                },
                "min": {
                    "define": 0,
                    "msg": "报销金额的值不能小于0"
                },
                "max": {
                    "define": 100000,
                    "msg": "报销金额的值不能大于100000"
                },
                "type": "float"
            },
            "reimburser": {
                "require": {
                    "define": true,
                    "msg": "报销员工不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "报销员工所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "报销员工包含的字符数不能少于2个"
                },
                "type": "string"
            },
            /*      patch, 只是用来判断input是否为date，以便用datetimepicker进行初始化
            *       更好的解决方法是，设置一个额外的字段，而不是复用cDate
            *       更好的解决方式是：把cDate字段暴露出来，放在inputRule中进行检测
            * */
            "cDate":{
                "type": "date"
            }
        }
    },


    //angularjs处理input需要使用的数据
    inputAttr:
    {
        "user": {
            "name": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "normal",
                "selectOption": [],
                "isQueryAutoComplete": false, //在执行查询条件的设置时，值是否是autoComplete

                "autoCompleteCollField": "",
                "suggestList": [],
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "用户名",
                "errorMsg": "",
                "validated": "undefined"
            },

        },
        "department": {
            "name": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "normal",
                "selectOption": [],
                "isQueryAutoComplete": true,

                "autoCompleteCollField":'department.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "部门名称",
                "errorMsg": "",
                "validated": "undefined"
            },
            "parentDepartment": {
                "value": "",
                "originalValue": "",
                "isFKField": true,
                "inputType": "autoComplete",
                "selectOption": [],
                "isQueryAutoComplete": true,

                "autoCompleteCollField":'department.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "上级部门",
                "errorMsg": "",
                "validated": "undefined"
            }
        },
        "employee": {
            "name": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "normal",
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true
                "autoCompleteCollField":'employee.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "员工姓名",
                "errorMsg": "",
                "validated": "undefined"
            },
            "leader": {
                "value": "",
                "originalValue": "",
                "isFKField": true,
                "inputType": "autoComplete",
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true

                "autoCompleteCollField":'employee.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化

                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "上级主管",
                "errorMsg": "",
                "validated": "undefined"
            },
            "gender": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "select",
                "selectOption":[{key:null,value:''},{key:'male',value:'男'},{key:'female',value:'女'}],
                "isQueryAutoComplete": false,
                "autoCompleteCollField": "",
                "suggestList": [],
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "性别",
                "errorMsg": "",
                "validated": "undefined"
            },
            "birthDay": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "date",
                "selectOption": [],
                "isQueryAutoComplete": false,

                "autoCompleteCollField": "",
                "suggestList": [],
                "inputDataType": "date",
                "inputIcon": "",
                "chineseName": "出生日期",
                "errorMsg": "",
                "validated": "undefined"
            },
            "department": {
                "value": "",
                "originalValue": "",
                "isFKField": true,
                "inputType": "autoComplete",
                "selectOption": [],
                "isQueryAutoComplete": true,//在选择查询字段时，是否enable AC，一般为true

                "autoCompleteCollField":'department.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化

                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "所属部门",
                "errorMsg": "",
                "validated": "undefined"
            },
            "onBoardDate": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "date",
                "selectOption": [],
                "isQueryAutoComplete": false, //在选择查询字段时，是否enable AC，一般为true
                "autoCompleteCollField":'',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "date",
                "inputIcon": "",
                "chineseName": "入职日期",
                "errorMsg": "",
                "validated": "undefined"
            }
        },
        "billType": {
            /*            "id":{
             "value":'',//不能改变
             },*/
            "name": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "normal",
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true
                "autoCompleteCollField":'billType.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "单据类别",
                "errorMsg": "",
                "validated": "undefined"
            },
            "inOut": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "select",
                "selectOption": [{key:null,value:''},{key:'in',value:'取入'},{key:'out',value:'支出'}],
                "isQueryAutoComplete": false,
                "autoCompleteCollField": "",
                "suggestList": {},
                "inputDataType": "select",
                "inputIcon": "",
                "chineseName": "支取类型",
                "errorMsg": "",
                "validated": "undefined"
            },
            "parentBillType": {
                "value": "",
                "originalValue": "",
                "isFKField": true,
                "inputType": "autoComplete",
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true
                "autoCompleteCollField":'billType.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "父类别",
                "errorMsg": "",
                "validated": "undefined"
            }
        },
        "bill": {
            "title": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "autoComplete",
                "selectOption": [],
                "isQueryAutoComplete": true,
                "autoCompleteCollField":'bill.title',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "单据抬头",
                "errorMsg": "",
                "validated": "undefined"
            },
            "content": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "autoComplete",
                "selectOption": [],
                "isQueryAutoComplete": true,
                "autoCompleteCollField":'bill.content',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "单据内容",
                "errorMsg": "",
                "validated": "undefined"
            },
            "billType": {
                "value": "",
                "originalValue": "",
                "isFKField": true,
                "inputType": "autoComplete",
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true,
                "autoCompleteCollField":'billType.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "单据类别",
                "errorMsg": "",
                "validated": "undefined"
            },
            "billDate": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "date",
                "selectOption": [],
                "isQueryAutoComplete": false,
                "autoCompleteCollField":'',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "date",
                "inputIcon": "",
                "chineseName": "单据日期",
                "errorMsg": "",
                "validated": "undefined"
            },
            "amount": {
                "value": "",
                "originalValue": "",
                "isFKField": false,
                "inputType": "normal",
                "selectOption": [],
                "isQueryAutoComplete": false,
                "autoCompleteCollField":'',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "报销金额",
                "errorMsg": "",
                "validated": "undefined"
            },
            "reimburser": {
                "value": "",
                "originalValue": "",
                "isFKField": true,
                "inputType": "autoComplete",
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true
                "autoCompleteCollField":'employee.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "报销员工",
                "errorMsg": "",
                "validated": "undefined"
            },
            // 'cDate':{
            //     chineseName:'报销日期',
            // }
        }
    },
    
    //用来给查询字段select提供option，详见angularjs。md
    //×××可以通过在inputAttr中使用isQueryField替代×××
    //单独使用一个对象表示
    //value：在页面显示给用户
    //key: 加入查询参数是的字段
    //type:检测查询参数格式
    queryField:{
        "user": [
            {
                "value": "用户名",
                "key": "name",
                "type": "string"
            },
            {
                "value": "密码",
                "key": "password",
                "type": "string"
            }
        ],
        "department": [
            {
                "value": "部门名称",
                "key": "name",
                "type": "string"
            },
            {
                "value": "上级部门",
                "key": "parentDepartment",
                "type": "objectId"
            }
        ],
        "employee": [
            {
                "value": "员工姓名",
                "key": "name",
                "type": "string"
            },
            {
                "value": "上级主管",
                "key": "leader",
                "type": "objectId"
            },
            {
                "value": "性别",
                "key": "gender",
                "type": "string"
            },
            {
                "value": "出生日期",
                "key": "birthDay",
                "type": "date"
            },
            {
                "value": "所属部门",
                "key": "department",
                "type": "objectId"
            },
            {
                "value": "入职日期",
                "key": "onBoardDate",
                "type": "date"
            }
        ],
        "billType": [
            {
                "value": "单据类别",
                "key": "name",
                "type": "string"
            },
            {
                "value": "支取类型",
                "key": "inOut",
                "type": "string"
            },
            {
                "value": "父类别",
                "key": "parentBillType",
                "type": "objectId"
            }
        ],
        "bill": [
            {
                "value": "单据抬头",
                "key": "title",
                "type": "string"
            },
            {
                "value": "单据内容",
                "key": "content",
                "type": "string"
            },
            {
                "value": "单据类别",
                "key": "billType",
                "type": "objectId"
            },
            {
                "value": "单据日期",
                "key": "billDate",
                "type": "date"
            },
            {
                "value": "报销金额",
                "key": "amount",
                "type": "float"
            },
            {
                "value": "报销员工",
                "key": "reimburser",
                "type": "objectId"
            },
            {
             "value": "报销日期",
             "key": "cDate",
             "type": "date"
             },
            // {
            //     cDate:{
            //     "value": "报销日期",
            //     "type": "date"
            // }
            // },
        ]
    },

queryFieldChineseName:
    {
        "user": {
            "name": "用户名"
        },
        "department": {
            "name": "部门名称",
            "parentDepartment": "上级部门"
        },
        "employee": {
            "name": "员工姓名",
            "leader": "上级主管",
            "gender": "性别",
            "birthDay": "出生日期",
            "department": "所属部门",
            "onBoardDate": "入职日期"
        },
        "billType": {
            "name": "单据类别",
            "inOut": "支取类型",
            "parentBillType": "父类别"
        },
        "bill": {
            "title": "单据抬头",
            "content": "单据内容",
            "billType": "单据类别",
            "billDate": "单据日期",
            "amount": "报销金额",
            "reimburser": "报销员工",
            "cDate": "报销日期"
        }
    },

})

constantApp.constant('contEnum',{
/*    opType:{
        'create': Symbol('create'),
        'read': Symbol('read'),
        'update': Symbol('update'),
        'delete': Symbol('delete'),
        'search': Symbol('search'),
    },*/
/*          value采用字符，而不是symbol，因为为modal设置title是，key只能用字符       */
    opType:{
        'create': 'create',
        'read': 'read',
        'update': 'update',
        'delete': 'delete',
        'search':'search',
    },
    //主要用于在client判断是否合法操作符；也可进行赋值操作
    'operator':{
        'gt':'gt',
        'lt':'lt',
        'eq':'eq',
    },

    //在inputAttr中，指定每个field对应在页面上input的类型
    //inputAttr只在CU的时候才使用
    inputType:{
        'normal':'normal',//普通的input
        'select':'select', //field在页面应该使用select
        'date':'date',//field是日期类型
        'autoComplete':'autoComplete', //field需要 自动完成功能
    }
})

//module.exports=constantApp.name

/***/ }),

/***/ 149:
/***/ (function(module, exports, __webpack_require__) {

/**
 * Created by ada on 2016/8/28.
 */
 /***************** webpack config  ******************************/
__webpack_require__(123)
__webpack_require__(121)
__webpack_require__(122)

/**************************************************************/


var mainApp=angular.module('mainApp',['ui.router','ui.event','ngSanitize','MassAutoComplete','contDefine','component','finance'])
//var app=angular.module('app',[require('angular-ui-router'),'ui.event','ngSanitize','MassAutoComplete','contDefine','component','finance'])
mainApp.constant('appCont',{
    //和server不同，此处的配置，只是为了将外键的ObjectID替换成人类可读的字符串，（暂时）是1：1的关系
    //格式还是采用object，以便后续可以加入其他选项
    //nestedPrefix用来删除对应的字段，因为这些字段只是server用来serach用，无需在client显示
    fkRedundancyFields:{
        billType:{
            parentBillType:{nestedPrefix:'parentBillTypeFields',fields:['name']}
        },
        department:{
            parentDepartment:{fields:['name']}
        },
        employee:{
            leader:{fields:['name']},
            department:{fields:['name']}
        },
        bill:{
            billType:{fields:['name']},
            reimburser:{fields:['name']},
        },
    },
    coll:{
        'billType':'billType',
        'department':'department',
        'employee':'employee',
        'bill':'bill',
    },
    collNameSearch:{
        'billType':'name',
        'department':'name',
        'employee':'name',
        'bill':'title',
    },
    //每个coll中，类型为date的字段。用来再cilent对server返回的数据进行日期处理
    dateField:{
        billType:['cDate','uDate'],
        bill:['billDate','cDate','uDate'],
        employee:['cDate','uDate'],
        department:['cDate','uDate'],
    },

    //临时存储   外键   的id，以便后续acBlur的时候检测是否   外键   正确
    selectedAC:{
        "department": {
            "parentDepartment": {"value": null, "_id": null}
        },
        "employee": {
            "leader": {"value": null, "_id": null},
            "department": {"value": null, "_id": null}
        },
        "billType": {
            "parentBillType": {"value": null, "_id": null}//value：选中的记录的名称，id：选中的记录的实际id。ac有时候需要显示给用户 字符，但实际传递给server id，以便操作
        },
        "bill": {
            "billType": {"value": null, "_id": null},
            "reimburser": {"value": null, "_id": null}
        }
    },

    //当input为date时，如果需要使用datetimepicker，则需要提供id，以便进行初始化
    //所有的页面中，id都一样
    dateInputIdInQuery:{
        ////设置查询条件时，用作选择 起始日期 的input的Id
        ////设置查询条件时，用作选择 结束日期 的input的Id
        //"department": [ "queryStartDate","queryEndDate"],
        //"employee": [ "queryStartDate","queryEndDate"],
        //"billType": [ "queryStartDate","queryEndDate"],
        //"bill": [ "queryStartDate","queryEndDate"],
        //不采用数组，而是使用对象。因为除了初始化，还需要分别取值，设置月开始/结束日期
        "department": {
            "queryStartDate": "queryStartDate", //设置查询条件时，用作选择 起始日期 的input的Id
            "queryEndDate": "queryEndDate",//设置查询条件时，用作选择 结束日期 的input的Id
        },
        "employee": {
            "queryStartDate": "queryStartDate", //设置查询条件时，用作选择 起始日期 的input的Id
            "queryEndDate": "queryEndDate",//设置查询条件时，用作选择 结束日期 的input的Id
        },
        "billType": {
            "queryStartDate": "queryStartDate", //设置查询条件时，用作选择 起始日期 的input的Id
            "queryEndDate": "queryEndDate",//设置查询条件时，用作选择 结束日期 的input的Id
        },
        "bill": {
            "queryStartDate": "queryStartDate", //设置查询条件时，用作选择 起始日期 的input的Id
            "queryEndDate": "queryEndDate",//设置查询条件时，用作选择 结束日期 的input的Id
        }
    },


/*    //用于update的时候，初始化select（枚举，例如性别）的值
    selectInitValue:{
        billType:{
            inOut:null,
        },
        employee:{
            gender:null,
        }
    },*/
})

mainApp.config(function($stateProvider,$urlRouterProvider,$locationProvider){
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
        .state('bill.static',{
            url:'/static',
            templateUrl:'bill.static.ejs',
            controller:'bill.static.Controller',
        })
})

mainApp.controller('mainController',function($scope,htmlHelper){
    htmlHelper.adjustFooterPosition()

    window.onresize=function(){
        htmlHelper.adjustFooterPosition()
        htmlHelper.verticalModalCenter('CRUDRecorder')
    }
})

mainApp.controller('configurationController',function($scope,htmlHelper){
    htmlHelper.adjustFooterPosition()
    $scope.adjustFooterPosition=function(){
        //console.log('configuration resize')
        htmlHelper.adjustFooterPosition()
    }

})

mainApp.factory('templateFunc',function($q,$sce,appCont,cont,contEnum,inputAttrHelper,htmlHelper,validateHelper,queryHelper,commonHelper,financeHelper,modalChoice,dateTimePickerHelper,paginationHelper){
    var generateControllerData=function(eColl){
        return {
            showMandatoryField:true, //当CU的modal中，field太多的时候，把require=true的字段，通过此字段决定是否显示
            showAdditionalField:false, //当CU的modal中，field太多的时候，把require=false的字段，通过此字段决定是否显示
            inputAttr:cont.inputAttr[eColl],//CRUD记录的时候，对输入进行设置
            inputRule:cont.inputRule[eColl],//CRUD，对输入进行设置（min/maxLength）以及进行检测
            //存储当前载入的数据，数组，以便判断是否为空
            recorder:[],
// test:null,
            queryFieldEnable:false,//当前 字段查询是否展开

            // selectInitValue:appCont.selectInitValue[eColl], //用于update的时候，初始化select（枚举，例如性别）的值

            selectedQueryField:undefined, //当前选中的查询字段，是key（实际字段名）：value（显示给用户看的中文字段名）的键值对
            selectedQueryFieldOperator:undefined,//如果是数字，当前选中的比较符
            selectedQueryFieldValue:undefined,//如果选择的字段是字符或者数字，对应设置的值
            //如果是日期，需要2个变量确定，此时不能使用selectedQueryFieldValue
            // selectedStartDateValue:undefined,
            // selectedEndDateValue:undefined,

            queryField:cont.queryField[eColl], //可选的查询字段
            queryFieldChineseName:cont.queryFieldChineseName[eColl], //用来在页面上，根据queryField中的字段名称（英文），直接映射到中文名

            activeQueryValue:{},//当前生效的查询字段和查询值 ，可以直接传递给server{stringField:[{value:'val1'},{value:'val2'}], numberField:[{value:1,compOp:'gt'},{value:2,compOp:'lt'}]}   采用{}初始化，则可以直接通过函数的参数进行修改；缺点是无法在前端判断是否为{}

            recorderDialogShow:false,//当前modal-dialog是否显示（用来add/modify记录）

            currentIdx:-1, //当前操作的记录的idx

            //临时存储用户选择的外键值，之后在acBlur中进行检查此外键值是否validate
            //对于当前用户选择的记录，保存id，以便在create/update的时候，确保能上传正确的id值（acBlur的时候检查id，如果正确，将value保存到allData.inputAttr,告诉用户选择的外键值validate）
            //对于设置查询条件，直接保存到allData.inputAttr即可
            selectedAC:appCont.selectedAC[eColl],

            currentOpType:null,

            // queryStartDate:undefined,
            // queryEndDate:undefined,

        }
    }

    /*            pagination            */
    function  generatePaginationData(eColl){
        return {
            'paginationInfo':{},
            'pageRange':null,
            'goToPageNo':null,
            'goToButtonEnable':false,
        }
    }

    function generatePaginationFunc($scope){
        let allFuncResult={}
        allFuncResult={
            //移动到某页
            validateGoToPageNo:function(){
                //判断页码是否为整数（返回boolean值）
                $scope.pagination.goToButtonEnable=paginationHelper.validateGoToPageNo($scope.pagination.goToPageNo)
                if(false===$scope.pagination.goToButtonEnable){
                    $scope.pagination.goToPageNo=null
                }
                //if(false===validateHelper.dataTypeCheck.isInt($scope.pagination.goToPageNo)){
                //    $scope.pagination.goToPageNo=null
                //    $scope.pagination.goToButtonEnable=false
                //}else{
                //    $scope.pagination.goToButtonEnable=true
                //}
                // console.log($scope.pagination.goToButtonEnable)
            }
        }
        return allFuncResult
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


    function generateCreateUpdateModalInfo(){
        return {
            title:{'create':'添加数据','update':'修改数据'},
            buttonFlag:true,//初始为true
        }
    }

    //此处$scope并非controlller中$scope，只是一个变量的名字；为了方便从controller中把function移植
    function allFunc($scope,eColl){

        let fkConfig=appCont.fkRedundancyFields[eColl]
        //需要进行转换的日期字段名称
        let dateField=appCont.dateField[eColl]

        let allFuncResult={
            switchAdditionalFields:function(){
                $scope.allData.showAdditionalField=!$scope.allData.showAdditionalField
            },
            switchMandatoryFields:function(){
                $scope.allData.showMandatoryField=!$scope.allData.showMandatoryField
            },
            // onchange:function(){
            //     console.log(`date change result is ${JSON.stringify($scope.allData.selectedStartDateValue)}`)
            // },

//在对记录进行update的时候，根据idx，将recorder中的一个载入到inputAttr
            loadCurrentData:function (idx,inputAttr,recorder){
/*                //初始化selectInitValue（防止上个记录的值被读取到当前记录）
                for(let singleSelectField in $scope.allData.selectInitValue){
                    $scope.allData.selectInitValue[singleSelectField]=null
                }*/
                //首先将recorder中的记录的数据载入inputAttr，通过过ng-model的方式传递到页面
                inputAttrHelper.loadCurrentData(idx,inputAttr,recorder,fkConfig,$scope.allData.selectedAC);
                //然后处理日期类型的数据（要使用datetimepicker的方法才能显示数据）
            },

            //初始化当前coll所有字段的inputAttr
            initAllFieldInputAttr:function (inputAttr,inputRule){
                //console.log(`optype is ${}`)
                if(contEnum.opType.create===$scope.allData.currentOpType){
                    // console.log(`initAllFieldInputAttr->create: inputRule is ${JSON.stringify(inputRule)}`)
                    inputAttrHelper.initAllFieldInputAttrCreate(inputAttr,inputRule)
                    // console.log(`after init inputattr is ${JSON.stringify(inputAttr)}`)
                }
                if(contEnum.opType.update===$scope.allData.currentOpType){
                    inputAttrHelper.initAllFieldInputAttrUpdate(inputAttr)
                }
                //对modal中（create/update中，数据为date的input进行初始化）
                for(let fieldName in $scope.allData.inputAttr){
                    // console.log(`init field name is ${fieldName}`)
                    if('date'===$scope.allData.inputRule[fieldName]['type']){
                        // console.log(`init inpot name is ${fieldName}`)
                        dateTimePickerHelper.initEle(fieldName)
                    }
                }
            },

            initSingleFieldInputAttr:function(field,inputAttr,inputRule){
                //console.log(`field is ${field}`)
                //console.log(`inputAttr is ${JSON.stringify(inputAttr)}`)
                $scope.modal.buttonFlag=true;
                if(contEnum.opType.create===$scope.allData.currentOpType){
                    inputAttrHelper.initSingleFieldInputAttrCreate(field,inputAttr,inputRule)
                }
                if(contEnum.opType.update===$scope.allData.currentOpType){
                    inputAttrHelper.initSingleFieldInputAttrUpdate(field,inputAttr)
                }
                // queryHelper.initSingleFieldInputAttr(field,inputAttr,this.currentOpType)
            },
            //因为create和update公用一个modal，所以需要设置opType来区分操作类型
            setCurrentOpTypeCreate(){
                // console.log(`create enter`)
                $scope.allData.currentOpType=contEnum.opType.create
            },
            setCurrentOpTypeUpdate(){
                $scope.allData.currentOpType=contEnum.opType.update
            },
            /*        setCurrentOpTypeDelete(){
             $scope.allData.currentOpType=contEnum.opType.delete
             },
             setCurrentOpTypeSearch(){
             $scope.allData.currentOpType=contEnum.opType.search
             },*/
            //不同操作，参数不一样，所以使用不同的函数（create update因为使用同一个modal，所以使用同一个函数，内部使用opType区分）
            CRUDOperation:{
                'createUpdate':function(idx,inputAttr,recorder,selectedAC){
                    if(contEnum.opType.create===$scope.allData.currentOpType){
                        if($scope.modal.buttonFlag){
                            //let convertedValue=queryHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue,fkConfig,$scope.pagination.paginationInfo.currentPage)
                            financeHelper.dataOperator.create(idx,inputAttr,recorder,selectedAC,fkConfig,eColl,dateField,$scope.pagination);
                            $scope.allFunc.switchDialogStatus()
                            //操作完成（无论成功失败），将操作类型 复位
                            $scope.allData.currentOpType=null
                            // console.log(`pagi info of create is ${JSON.stringify($scope.pagination)}`)
                        }
                    }
                    if(contEnum.opType.update===$scope.allData.currentOpType){
                        if($scope.modal.buttonFlag){
                            // console.log(`update inputattr is ${JSON.stringify(inputAttr)}`)
                            financeHelper.dataOperator.update(idx,inputAttr,recorder,selectedAC,fkConfig,eColl,dateField);
                            $scope.allFunc.switchDialogStatus();
                            //操作完成（无论成功失败），将操作类型 复位
                            $scope.allData.currentOpType=null
                        }
                    }
                },
                'delete':function(idx,recorder,currentPage){
                    let convertedValue=queryHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue,fkConfig,currentPage)
                    financeHelper.dataOperator.delete(idx,recorder,eColl,convertedValue,fkConfig,dateField,$scope.pagination);
                },
                'search':function(recorder,currentPage){
                    // console.log(`enter search`)
                    let inputAttr=$scope.allData.inputAttr
                    // console.log(`$scope.allData.inputAttr is ${JSON.stringify(inputAttr)}`)
                    //console.log(`origin search is ${JSON.stringify($scope.allData.activeQueryValue)}`)
                    //console.log(`origin fkconfig is ${JSON.stringify(fkConfig)}`)
                    let convertedValue=queryHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue,fkConfig,currentPage)
                    // console.log(`search convert result is ${JSON.stringify(convertedValue)}`)
                    //console.log(`after convert activeQueryValue result is ${JSON.stringify($scope.allData.activeQueryValue)}`)
                    //没有任何查询条件，或者删除了所有查询条件
/*                    if(0===Object.keys($scope.allData.activeQueryValue).length){
                        financeHelper.dataOperator.read(recorder,fkConfig,eColl,dateField)
                    }else{*/
                    financeHelper.dataOperator.search(recorder,convertedValue,fkConfig,eColl,dateField,$scope.pagination,$scope.allData.inputAttr);
                    // console.log(`after search pagination is ${JSON.stringify($scope.pagination)}`)
                    //}

                    //$scope.switchDialogStatus();
                }
            },

            //在crete/update记录时，如果input提供autoComplete功能时（一般是外键），blur时需要检测input的内容是否存在，不存在需要报错提示。
            //因为需要额外的检测当前input的value是否有对应的外键（是否为－1），所以独立为一个函数
            //currentId:当前记录的objId（如果是create，为undefined）
            acBlur:function(field,inputAttr,currentId,inputRule){
                // console.log(`acBlur field is ${field},currentId is ${currentId},ac field is ${JSON.stringify($scope.allData.selectedAC[field])},current op type is ${$scope.allData.currentOpType.toString()}`)
                // if(contEnum.opType.update===$scope.allData.currentOpType){
                //     inputAttrHelper.initSingleFieldInputAttrUpdate(field,inputAttr)
                // }

                //console.log(`check id is ${$scope.allData.selectedAC[field]}`)
                //acBlur无需检测input（min/max/minLength等），只需检测a，是否选择（null或者objId），b.是否和当前一样（不能把自己当成自己的父）
                if(null===$scope.allData.selectedAC[field]['_id']){
                    // console.log(`before msg is ${JSON.stringify(inputAttr[field])}`)
                    if(true===$scope.allData.inputRule[field]['require']['define']){
                        inputAttrHelper.setSingleInputAttrErrorMsg(field,inputAttr,`${inputAttr[field]['chineseName']}${inputAttr[field]['value']}不存在`)
                    }
                }else{
                    //input中的内容在db中有对应的记录
                    // console.log(`check is self`)
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

                /*            else{
                 queryHelper.checkInput(field,inputRule,inputAttr)
                 }*/

                //modal.allInputValidCheck(inputAttr)
                $scope.modal.buttonFlag=inputAttrHelper.allInputValidCheck(inputAttr,inputRule)
                /*            console.log(`validate result is ${JSON.stringify(inputAttr)}`)
                 console.log(`but flag is ${$scope.modal.buttonFlag}`)*/
            },

            nonAcBlur:function(field,inputRule,inputAttr){
                validateHelper.checkInput(field,inputRule,inputAttr)
                $scope.modal.buttonFlag=inputAttrHelper.allInputValidCheck(inputAttr,inputRule)
            },


            /*        allInputValidCheck:function(inputAttr){
             $scope.modal.buttonFlag=inputAttrHelper.allInputValidCheck(inputAttr)
             },*/
            //create/update

            //在create/update的dialog上点击确定时，需要的操作
            CUDialogClick:function(){
                // console.log(`cu diaolg enter`)
                //如果有date类型的字段，需要手工将值填入inputAttr（因为datetimepicker初始化后，无法直接通过input获得值，只能通过datetimepicker提供的方法）
                for(let singleFiled in $scope.allData.inputAttr){
                    if('date'===$scope.allData.inputAttr[singleFiled]['inputType']){
                        let dateValue=dateTimePickerHelper.getCurrentDateInTimeStamp(singleFiled)
                        if(isNaN(dateValue)){
                            $scope.allData.inputAttr[singleFiled]['value']=null
                        }else{
                            $scope.allData.inputAttr[singleFiled]['value']=dateValue
                        }

                    }
                }
                 // console.log(`before convertReadable to enum inputAttr is ${JSON.stringify($scope.allData.inputAttr)}`)
                 inputAttrHelper.convertReadableToEnum($scope.allData.inputAttr,$scope.allData.inputRule)
                // console.log(`after convertReadable to enum inputAttr is ${JSON.stringify($scope.allData.inputAttr)}`)
                validateHelper.allCheckInput($scope.allData.inputRule,$scope.allData.inputAttr)
                let allInputValidateResult=inputAttrHelper.allInputValidCheck($scope.allData.inputAttr,$scope.allData.inputRule)
                if(true===allInputValidateResult){
                    this.CRUDOperation.createUpdate($scope.allData.currentIdx,$scope.allData.inputAttr,$scope.allData.recorder,$scope.allData.selectedAC)
                }
            },
/*            allCheckInput:function(inputRule,inputAttr){
                console.log(`input rule is ${JSON.stringify(inputRule)}`)
                console.log(`input attr is ${JSON.stringify(inputAttr)}`)
                validateHelper.allCheckInput(inputRule,inputAttr)
                console.log(`validate result is ${JSON.stringify(inputAttr)}`)
            },*/

            //从activatedQueryValue中删除value
            //queryFiled:parentBillType
            //queryValue:'a'
            //activatedQueryValue:{parentBillType:['a','b']}
            deleteQueryValue:function(queryFiled,idx,activatedQueryValue){
                // console.log(`idx is ${idx}`)
                queryHelper.deleteQueryValue(queryFiled,idx,activatedQueryValue)
                // console.log(`after delete query value ${JSON.stringify(activatedQueryValue)}`)
            },
            // $scope.addQueryValue=queryHelper.addQueryValue
            addQueryValue:function(){
                // console.log(`add query in`)
                // console.log(`value is ${$scope.allData.selectedQueryFieldValue}`)
                // console.log(`startDate is ${$scope.allData.selectedStartDateValue}`)
                // console.log(`startDate is ${$scope.allData.selectedEndDateValue}`)
                let selectedQueryFiled=$scope.allData.selectedQueryField['key']
                //判断queryField的类型，如果是date或者数字，要做特殊处理
                let queryFiledType=$scope.allData.selectedQueryField['type']
                // console.log(`queryFiledType is ${queryFiledType}`)
                //对于日期，operator是根据开始/结束日期固定
                if('date'===queryFiledType){
                    let startDateEleId=appCont.dateInputIdInQuery[eColl]['queryStartDate']
                    let endDateEleId=appCont.dateInputIdInQuery[eColl]['queryEndDate']
                    let startDateValue=dateTimePickerHelper.getCurrentDateInTimeStamp(startDateEleId)
                    let endDateValue=dateTimePickerHelper.getCurrentDateInTimeStamp(endDateEleId)
                    // console.log(`startDateEleId is ${JSON.stringify(startDateEleId)}`)
                    // console.log(`endDateEleId is ${JSON.stringify(endDateEleId)}`)
                    // console.log(`startDateValue is ${JSON.stringify(startDateValue)}`)
                    // console.log(`endDateValue is ${JSON.stringify(endDateValue)}`)
                    // console.log(`validate reuyslt is ${dateTimePickerHelper.validateDate(startDateEleId)}`)
                    if(dateTimePickerHelper.validateDate(startDateEleId)){
                        // let value=$scope.allData.selectedStartDateValue
                        queryHelper.addQueryValue(selectedQueryFiled,startDateValue,$scope.allData.activeQueryValue,'gt') //开始日期，操作符为gt
                    }
                    if(dateTimePickerHelper.validateDate(endDateEleId)){
                        // let value=$scope.allData.selectedEndDateValue
                        queryHelper.addQueryValue(selectedQueryFiled,endDateValue,$scope.allData.activeQueryValue,'lt') //开始日期，操作符为gt
                    }
                    // console.log(`after selectedQueryOperator is ${JSON.stringify($scope.allData.activeQueryValue)}`)
                }else if(['float','int','number'].indexOf(queryFiledType)>-1){
                    // console.log(`selectedQueryOperator is ${$scope.allData.selectedQueryFieldOperator}`)
                    //对于日期，如果operator不存在
                    let value=$scope.allData.selectedQueryFieldValue
                    if(false===$scope.allData.selectedQueryFieldOperator in contEnum.operator){
                        $scope.allData.selectedQueryFieldOperator=contEnum.operator.eq
                    }
                    queryHelper.addQueryValue(selectedQueryFiled,value,$scope.allData.activeQueryValue,$scope.allData.selectedQueryFieldOperator)
                    // console.log(`after selectedQueryOperator is ${JSON.stringify($scope.allData.activeQueryValue)}`)
                }else{
                    //字符
                    if(validateHelper.dataTypeCheck.isString($scope.allData.selectedQueryFieldValue) && false===validateHelper.dataTypeCheck.isStringEmpty($scope.allData.selectedQueryFieldValue)){
                        queryHelper.addQueryValue(selectedQueryFiled,$scope.allData.selectedQueryFieldValue,$scope.allData.activeQueryValue) //没有操作符
                    }

                }

                $scope.allData.selectedQueryFieldValue=undefined
                $scope.allData.selectedStartDateValue=undefined
                $scope.allData.selectedEndDateValue=undefined
                // console.log(`after add query value ${JSON.stringify($scope.allData.activeQueryValue)}`)
            },
//第一次focus的时候，selectedQueryFieldValue是udefined，设置成空，触发AC，显示所有选项
trigSelectedQueryFieldValueChange:function(){
    // console.log($scope.allData.selectedQueryFieldValue)
    if(undefined===$scope.allData.selectedQueryFieldValue){
        $scope.allData.selectedQueryFieldValue=""
    }

},
            formatQueryValue:function(fieldName,fieldValue){
                //console.log(`field name is ${fieldName}`)
                //console.log(`orig date is ${fieldValue}`)
                let fieldType=$scope.allData.inputRule[fieldName]['type']
                switch (fieldType){
                    case 'date':
                        // console.log(`orig date is ${queryHelper.formatQueryValue.date(fieldValue)}`)
                        return queryHelper.formatQueryValue.date(fieldValue)
                        break;
                    default:
                        return fieldValue
                }
            },

            queryFieldChange:function(){
                //初始清空值
                $scope.allData.selectedQueryFieldValue=undefined
                $scope.allData.selectedStartDateValue=undefined
                $scope.allData.selectedEndDateValue=undefined
                //判断选择字段的类型，如果是日期，则进行初始化(按需初始化)
                let selectedQueryField
                if($scope.allData.selectedQueryField && ''!==$scope.allData.selectedQueryField){
                    selectedQueryField=$scope.allData.selectedQueryField
                }
                // console.log(`activate value is ${JSON.stringify($scope.allData.activeQueryValue)}`)
                // console.log(`selected query field is ${JSON.stringify(selectedQueryField)}`)
                // console.log(`selected query field rle is ${JSON.stringify($scope.allData.inputRule[selectedQueryField['key']])}`)
                if('date'===selectedQueryField['type']){
                    // console.log(`date filed choose`)
                    // console.log(`id is ${appCont.dateInputIdInQuery[eColl]['queryStartDate']}`)
                    //根据date input的id，通过datetimepicker进行初始化
                    //appCont.dateInputIdInQuery[eColl].map((v)=>dateTimePickerHelper.initEle(v))
                    //dateTimePickerHelper.initEle(appCont.dateInputIdInQuery[eColl]['queryStartDate'])
                    //只需初始化一次
                    dateTimePickerHelper.setFirstDay(appCont.dateInputIdInQuery[eColl]['queryStartDate'])

                    //dateTimePickerHelper.initEle(appCont.dateInputIdInQuery[eColl]['queryEndDate'])
                    dateTimePickerHelper.setLastDay(appCont.dateInputIdInQuery[eColl]['queryEndDate'])
                }
            },

            clickQueryFlag:function(){
                $scope.allData.queryFieldEnable=!$scope.allData.queryFieldEnable
            },

            //选择查询条件完毕，并添加完成后，selectedField/selectedFieldValue设成空
            initSelectedQueryField:function(){
                $scope.allData.selectedQueryField=undefined
                $scope.allData.selectedQueryFieldValue=undefined
            },

            getQueryFiledChineseName:function(field){
                return queryHelper.getQueryFiledChineseName(field,$scope.allData.queryField)
            },

            switchDialogStatus:function(){
                // console.log(`CU diag flag is ${$scope.allData.recorderDialogShow}`)
                $scope.allData.recorderDialogShow=!$scope.allData.recorderDialogShow
                //显示recorder modal的时候，如果是create，那么button初始为disable（不能直接提交）；如果是update，那么是enable（可以直接提交）
                if(true===$scope.allData.recorderDialogShow){
                    if(contEnum.opType.create===$scope.allData.currentOpType){
                        $scope.modal.buttonFlag=false
                    }
                    if(contEnum.opType.update===$scope.allData.currentOpType){
                        $scope.modal.buttonFlag=true
                    }
                }
                htmlHelper.verticalModalCenter('CRUDRecorder')

/*                alert($('table').attr('height'))
                alert($('table').attr('width'))*/
            },

            setCurrentIdx:function(idx){
                $scope.allData.currentIdx=idx
            },

            //通用autoComplete，for both create/update and query
            //其中对selectedAC的处理，虽然也是for both create/update and query，但是实际只有在create/update的时候才会用到
            generateSuggestList:function(fkColl,fieldName){
                //最终返回suggest和on_select的一个对应
                let suggestList={}

                //设置suggest
                suggestList['suggest']=function(name){
                    let deferred=$q.defer()
                    let searchValue={}

                    //如果是外键，那么实际对应的field名称，例如：parentBillType对应的是name
                    let realFieldNameToRead=fieldName
                    //替换成外键所以在的coll中的名称，以便server通过format检测（否则如果外键在不同的coll，server无法正确通过）
                    if(fieldName in fkConfig){
                        realFieldNameToRead=fkConfig[fieldName]['fields'][0]
                    }

                    searchValue[realFieldNameToRead]={}
                    searchValue[realFieldNameToRead]['value']=name
                    financeHelper.dataOperator.readName(searchValue,fkColl,eColl).success(
                        (data, status, header, config)=>{
                            let tmpResult = []
                            // console.log(`get suggest result is ${JSON.stringify(data.msg)}`)
                            //如果当前的字段是外键（定义在allData.selectedAC中），需要确定的id，以便保存到数据库，则初始设为-1
                            //if (data.msg.length === 1) {
                            //初始化selectedAC
                                if(true=== fieldName in $scope.allData.selectedAC){
                                    if ('' !== name && null !== name) {
                                        $scope.allData.selectedAC[fieldName]._id = null
                                        $scope.allData.selectedAC[fieldName].value=null
                                    }
                                }
                            //}


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

                            }
                            deferred.resolve(tmpResult)
                        }
                    ).error(
                        (data, status, header, config)=>{
                            deferred.resolve({rc: 9999, msg: data})
                        }
                    )
                    return deferred.promise
                }

                suggestList['on_select']=function (selected) {
                    // console.log(`on_selected is ${JSON.stringify(selected)}`)
                    if(true=== fieldName in $scope.allData.selectedAC){
                        // console.log(`select ac filed is ${fieldName}`)
                        $scope.allData.selectedAC[fieldName]._id = selected.id
                        $scope.allData.selectedAC[fieldName].value = selected.value
                        //无需直接赋值给$scope.allData.inputAttr，而是通过acBlur判断通过后才赋值
                    }else{
                        //不是外键，直接保存在inputAttr中
                        $scope.allData.inputAttr[fieldName]['value']=selected.value
                    }
                }

                suggestList['on_attach']=function(){
                    let deferred=$q.defer()
                    let searchValue={}

                    //如果是外键，那么实际对应的field名称，例如：parentBillType对应的是name
                    let realFieldNameToRead=fieldName
                    //替换成外键所以在的coll中的名称，以便server通过format检测（否则如果外键在不同的coll，server无法正确通过）
                    if(fieldName in fkConfig){
                        realFieldNameToRead=fkConfig[fieldName]['fields'][0]
                    }

                    searchValue[realFieldNameToRead]={}
                    searchValue[realFieldNameToRead]['value']=''
                    financeHelper.dataOperator.readName(searchValue,fkColl,eColl).success(
                        (data, status, header, config)=>{
                            let tmpResult = []
                            // console.log(`get suggest result is ${JSON.stringify(data.msg)}`)
                            //如果当前的字段是外键（定义在allData.selectedAC中），需要确定的id，以便保存到数据库，则初始设为-1
                            //if (data.msg.length === 1) {
                            //初始化selectedAC
                            if(true=== fieldName in $scope.allData.selectedAC){
                                // if ('' !== name && null !== name) {
                                    $scope.allData.selectedAC[fieldName]._id = null
                                    $scope.allData.selectedAC[fieldName].value=null
                                // }
                            }
                            //}


                            if (data.msg.length > 0) {
                                data.msg.forEach(function (e) {
                                    //label:下拉菜单中的选项，value：选中后显示的内容，id:选中项目的id（用作外键）
                                    tmpResult.push({label: e.name, value: e.name, id: e._id})
                                    //如果当前的字段是外键（定义在allData.selectedAC中），且输入的值存在db中，则将id保存到selectedAC中，以便crete/update使用（query也保存，但是实际不使用），包括blur时做检测
/*                                    if(true=== fieldName in $scope.allData.selectedAC){
                                        //输入的外键值，在db中存在，保存其id，
                                        if (name === e.name) {
                                            $scope.allData.selectedAC[fieldName]._id = e._id
                                            $scope.allData.selectedAC[fieldName].value = name
                                            // console.log(`set id is ${JSON.stringify($scope.allData.selectedAC[fieldName])}`)
                                        }
                                    }*/
                                })
                                // console.log(`tmpresult is ${JSON.stringify(tmpResult)}`)
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

                return suggestList
            },

            showChoiceModal:function(){
                //console.log(`enter show choice modal`)
                modalChoice.setModalId('modalChoice')
                modalChoice.showChoiceMsg('确认删除',$scope.allFunc.CRUDOperation.delete,$scope.allData.currentIdx,$scope.allData.recorder,$scope.pagination.paginationInfo.currentPage)
            },
        }


        return allFuncResult
    }


    function setACConfig($scope,eColl){
        for(let singleFieldName in $scope.allData.inputAttr){
            let singleInputAttr=$scope.allData.inputAttr[singleFieldName]
            //无论是query还是create/update需要AC，都要为对应的字段设置AC
            if(true===singleInputAttr['isQueryAutoComplete'] || 'autoComplete'===singleInputAttr['inputType']){
                //从autoCompleteCollField字段中获取从哪个coll的哪个field中获得ac
                let fk=singleInputAttr['autoCompleteCollField'].split('.')
                let fkColl=fk[0]
                let fkField=fk[1]
                // console.log(`field for ac is ${singleFieldName}, related coll is ${coll}, related field is ${field}`)

                //$scope.allData.inputAttr[singleFieldName]['suggestList']=$scope.allFunc.generateSuggestList(appCont.coll[eColl],singleFieldName)
                //$scope.allData.inputAttr['name']['suggestList']=$scope.allFunc.generateSuggestList(appCont.coll.billType,'name')

                //字段名是原始字段名（符合正常的逻辑），server会根据fkconfig自动查找对应的字段
                //第一个参数是ac对应外部coll，对应的field通过配置文件进行读取
                //第二个是当前coll中用作外键的字段，通过此字段，将用户选择的name/id存入到selectAC中
                $scope.allData.inputAttr[singleFieldName]['suggestList']=$scope.allFunc.generateSuggestList(appCont.coll[fkColl],singleFieldName)
            }
        }
    }

    //对controller做初始化操作
    function init($scope,eColl){

// console.log(`query field chinese name is ${JSON.stringify($scope.allData.queryFieldChineseName)}`)
        //let convertedValue=queryHelper.convertAddQueryValueToServerFormat($scope.allData.activeQueryValue,fkConfig,currentPage)
        //financeHelper.dataOperator.search($scope.allData.recorder,appCont.fkRedundancyFields[eColl],appCont.coll[eColl],appCont.dateField[eColl])
        var promise=financeHelper.dataOperator.search($scope.allData.recorder,{'currentPage':1,'searchParams':{}},appCont.fkRedundancyFields[eColl],eColl,appCont.dateField[eColl],$scope.pagination,$scope.allData.inputAttr);
        promise.then(function(v){
             // console.log(`search done pagination is ${JSON.stringify($scope.pagination)}`)
            htmlHelper.adjustFooterPosition()
        })
        //let [startDate,endDate]=[appCont.dateInputIdInQuery[eColl].queryStartDate,appCont.dateInputIdInQuery[eColl].queryStartDate]

        //appCont.dateInputIdInQuery[eColl].map((v)=>{console.log(`map is is ${v}`);dateTimePickerHelper.initEle(v)})
        ////dateTimePickerHelper.initEle(appCont.dateInputIdInQuery[eColl]['queryStartDate'])
        //dateTimePickerHelper.setFirstDay(appCont.dateInputIdInQuery[eColl][0])
        //
        ////dateTimePickerHelper.initEle(appCont.dateInputIdInQuery[eColl]['queryEndDate'])
        //dateTimePickerHelper.setLastDay(appCont.dateInputIdInQuery[eColl][1])
        dateTimePickerHelper.initEle(appCont.dateInputIdInQuery[eColl]['queryStartDate'])
        dateTimePickerHelper.setFirstDay(appCont.dateInputIdInQuery[eColl]['queryStartDate'])

        dateTimePickerHelper.initEle(appCont.dateInputIdInQuery[eColl]['queryEndDate'])
        dateTimePickerHelper.setLastDay(appCont.dateInputIdInQuery[eColl]['queryEndDate'])
/*        // let startDate=
        dateTimePickerHelper.initEle(startDate)
        dateTimePickerHelper.initEle(endDate)*/

    }

    

    //以下5个函数有严格的先后顺序，需要顺序执行
    return {
        generateControllerData, //产生所需数据（除了分页信息之外）

        generatePaginationData,//初始化分页信息数据
        generatePaginationFunc,//分页需要用到的函数

        generateCreateUpdateModalInfo, //设置create/update用的modal
        allFunc, //返回一个对象，value是函数
        setACConfig,//对需要AC的字段设置AC的配置（通过allFunc.generateSuggestList产生的对象，赋值给对应的字段）
        init, //设置位置，初始化数据


        // generateDateTimePickerFunc, //设置datetimepicker的一些函数
    }
})



mainApp.controller('configuration.billType.Controller',function($scope,templateFunc){
    //appCont,cont,contEnum,inputAttrHelper,htmlHelper,validateHelper,queryHelper,commonHelper,financeHelper,templateFunc
    //需要用到的数据，预先定义好
    $scope.allData=templateFunc.generateControllerData('billType')
    //初始化为对象，否则无法进行引用传递。调用 generateClientPagination 会自动根据server 返回的信息来填充一个对象并返回
    $scope.pagination={}
    $scope.paginationFunc=templateFunc.generatePaginationFunc($scope)

    $scope.modal=templateFunc.generateCreateUpdateModalInfo()
    $scope.allFunc=templateFunc.allFunc($scope,'billType')

    templateFunc.setACConfig($scope,'billType')
    //初始化调用
    templateFunc.init($scope,'billType')
})



mainApp.controller('configuration.departmentInfo.Controller',function($scope,templateFunc){
    //需要用到的数据，预先定义好
    $scope.allData=templateFunc.generateControllerData('department')

    //初始化为对象，否则无法进行引用传递。调用 generateClientPagination 会自动根据server 返回的信息来填充一个对象并返回
    $scope.pagination={}
    $scope.paginationFunc=templateFunc.generatePaginationFunc($scope)

    $scope.modal=templateFunc.generateCreateUpdateModalInfo()
    $scope.allFunc=templateFunc.allFunc($scope,'department')

    templateFunc.setACConfig($scope,'department')
    //初始化调用
    templateFunc.init($scope,'department')
})



mainApp.controller('configuration.employeeInfo.Controller',function($scope,templateFunc){
    //需要用到的数据，预先定义好
    $scope.allData=templateFunc.generateControllerData('employee')
    //初始化为对象，否则无法进行引用传递。调用 generateClientPagination 会自动根据server 返回的信息来填充一个对象并返回
    $scope.pagination={}
    $scope.paginationFunc=templateFunc.generatePaginationFunc($scope)

    $scope.modal=templateFunc.generateCreateUpdateModalInfo()
    $scope.allFunc=templateFunc.allFunc($scope,'employee')

    templateFunc.setACConfig($scope,'employee')
    //初始化调用
    templateFunc.init($scope,'employee')
})

mainApp.controller('billController',function($scope,htmlHelper){
    $scope.adjustFooterPosition=function(){
        //console.log('main resize')
        htmlHelper.adjustFooterPosition()
    }


})



mainApp.controller('bill.billInfo.Controller',function($scope,templateFunc){
    //需要用到的数据，预先定义好
    $scope.allData=templateFunc.generateControllerData('bill')
    //$scope.pagination=templateFunc.generatePaginationData('bill')
    //初始化为对象，否则无法进行引用传递。调用 generateClientPagination 会自动根据server 返回的信息来填充一个对象并返回
    $scope.pagination={}
    $scope.paginationFunc=templateFunc.generatePaginationFunc($scope)
    $scope.modal=templateFunc.generateCreateUpdateModalInfo()
    $scope.allFunc=templateFunc.allFunc($scope,'bill')

    templateFunc.setACConfig($scope,'bill')
    //初始化调用
    templateFunc.init($scope,'bill')



    // templateFunc.generateDateTimePickerFunc.allFunc.initDateTimePicker('bill')
})


mainApp.controller('bill.static.Controller',function($scope,financeHelper,dateTimePickerHelper){
    $scope.allData={
        currentCapitalFlag:true,//当前资金 是否显示
        queryDurationFlag:false, //查询分组数据的时候，是不是显示对应的时间段查询
        serverTime:null,//从服务器获得的时间
        queryDataTimeId:{
            'queryStartDate':'queryStartDate',
            'queryEndDate':'queryEndDate'
        }, //设置时间的html id
        totalCurrentCapital:null,//个分组的资金总计
        currentCapital:null,//数组，当前各类别的资金，最后汇总成总资金
        groupCapital:null, //数组，各类别资金，按照时间分类
        billTypeStructure:null,//账单的结构，用来填充表的字头
        billTypeStructureShowInTable:null,//从billTypeStructure中的child，组合成新的数组，用来填充表头（因为原始的billTypeStructure是2层数组结构（top-child），无法ng-repeat,同时，如果在th外包一层<div>，会导致angular无法解析（tr中只能包含th/td））
        billGroupDataShowInTable:null,//为了在页面上容易处理，将server端的数据，处理成二维的数组（每个元素代表一个月份的记录，每个元素是数组，包含月份，子billType的值已经合计，已经总合计）

    }

    $scope.allFunc={
        showHideCurrentCapital:function(){
            $scope.allData.currentCapitalFlag=!$scope.allData.currentCapitalFlag
        },
        showHideQueryDuration:function(){
            $scope.allData.queryDurationFlag=!$scope.allData.queryDurationFlag
        },
        convertBillTypeToHtml:function(baseBillTypeStructure){
            let result=[]
            for(let topBillType of baseBillTypeStructure){
                for(let child of topBillType['child']){
                    result.push(child['name'])
                }
                result.push('合计')
            }
            return result
        },
        //server端传来的是["2017-3";[[123,234,345],[567,657,453]]]，转换成[["2017-3",123,234,345,合计1,567,657,453,合计2，总计]]
        convertGroupDataToFlatArray:function(groupCapital){
            let result=[]
            for(let dateKey in groupCapital){
                let flatRecorder=[]

                //1. 加入日期
                flatRecorder.push(dateKey)
                //为了计算一行数据的总计，需要保存每个child的total，最后执行+，并存储到最终结果
                let singleChildTotal=[]
                for(let child of groupCapital[dateKey]){
                    //添加每个父billType的合计项
                    let childTotal=eval(child.join("+"))
                    child.push(childTotal)
                    flatRecorder=flatRecorder.concat(child)
                    singleChildTotal.push(childTotal)
                }
                let singleRecorderTotal=eval(singleChildTotal.join("+"))
                flatRecorder.push(singleRecorderTotal)
                result.push(flatRecorder)
            }
            // console.log(`converted result is ${JSON.stringify(result)}`)
            return result
        },
        init:function(){
            dateTimePickerHelper.initEle($scope.allData.queryDataTimeId.queryStartDate)
            dateTimePickerHelper.initEle($scope.allData.queryDataTimeId.queryEndDate)
            financeHelper.dataOperator.getServerTime().success(
                (data, status, header, config)=>{
                    dateTimePickerHelper.setLastYearToday($scope.allData.queryDataTimeId.queryStartDate,data)
                    dateTimePickerHelper.setDate($scope.allData.queryDataTimeId.queryEndDate,data)
                    //console.log(`${JSON.stringify(data)}`)
                    let startDate=dateTimePickerHelper.getCurrentDateInTimeStamp($scope.allData.queryDataTimeId.queryStartDate)
                    let endDate=dateTimePickerHelper.getCurrentDateInTimeStamp($scope.allData.queryDataTimeId.queryEndDate)
                    let searchParams={"startDate":{"value":startDate},"endDate":{"value":endDate}}
                    let currentPage=1
                    //因为是promise，所以通过传值方式返回数据
                    //初始化执行一次
                    //let p1=
                    // financeHelper.dataOperator.getCurrentCapital($scope.allData.currentCapital,$scope.allData.totalCurrentCapital,$scope.allData.structure)
                    // console.log(`mainController totalCurrentCapital is ${JSON.stringify()}`)
                    financeHelper.dataOperator.getCurrentCapital().then(function(value){
                        // console.log(`get current captial resylt is ${JSON.stringify(value)}`)
                        $scope.allData.totalCurrentCapital=value.msg['totalCapital']
                        $scope.allData.currentCapital=value.msg['currentCapital']
                        $scope.allData.billTypeStructure=value.msg['billTypeStructure']
                        $scope.allData.billTypeStructureShowInTable=$scope.allFunc.convertBillTypeToHtml($scope.allData.billTypeStructure)
                        // console.log(`currentCapital  is ${JSON.stringify(value.msg['currentCapital'])}`)
                        financeHelper.dataOperator.getGroupCapital(searchParams,currentPage).then(
                            (value)=>{
                                $scope.allData.groupCapital=value.groupCapital
                                // console.log($scope.allData.groupCapital)
                                $scope.allData.billGroupDataShowInTable=$scope.allFunc.convertGroupDataToFlatArray($scope.allData.groupCapital)
                                //financeHelper.dataOperator.getCurrentCapital($scope.allData.currentCapital)
                                // financeHelper.dataOperator.getGroupCapital(searchParams,currentPage,$scope.allData.groupCapital)
                            },

                            (error)=> {
                                // console.log(`get getCurrentCapital time failed`)
                            }
                        )
                    },function(error){})


                }
            ).error(
                (data, status, header, config)=>{
                    // console.log(`get server time failed`)
                }

            )
        },
        queryGroupCapital:function(currentPage){
            let startDate=dateTimePickerHelper.getCurrentDateInTimeStamp($scope.allData.queryDataTimeId.queryStartDate)
            let endDate=dateTimePickerHelper.getCurrentDateInTimeStamp($scope.allData.queryDataTimeId.queryEndDate)
            let values={"startDate":{"value":startDate},"endDate":{"value":endDate}}
            financeHelper.dataOperator.getGroupCapital(values,currentPage).then(
                (value)=>{
                    $scope.allData.groupCapital=value.groupCapital
                    // console.log($scope.allData.groupCapital)
                    $scope.allData.billGroupDataShowInTable=$scope.allFunc.convertGroupDataToFlatArray($scope.allData.groupCapital)
                    //financeHelper.dataOperator.getCurrentCapital($scope.allData.currentCapital)
                    // financeHelper.dataOperator.getGroupCapital(searchParams,currentPage,$scope.allData.groupCapital)
                },

                (error)=> {
                    // console.log(`get getCurrentCapital time failed`)
                }
            )
        }

    }

    $scope.allFunc.init()
    // console.log(`static enter`)

    // $('.currentCapital').after("<p>+</p>")
/*    //需要用到的数据，预先定义好
    $scope.allData=templateFunc.generateControllerData('bill')
    //$scope.pagination=templateFunc.generatePaginationData('bill')
    //初始化为对象，否则无法进行引用传递。调用 generateClientPagination 会自动根据server 返回的信息来填充一个对象并返回
    $scope.pagination={}
    $scope.paginationFunc=templateFunc.generatePaginationFunc($scope)
    $scope.modal=templateFunc.generateCreateUpdateModalInfo()
    $scope.allFunc=templateFunc.allFunc($scope,'bill')

    templateFunc.setACConfig($scope,'bill')
    //初始化调用
    templateFunc.init($scope,'bill')*/



    // templateFunc.generateDateTimePickerFunc.allFunc.initDateTimePicker('bill')
})
//module.exports=mainApp.name

/***/ })

},[149]);