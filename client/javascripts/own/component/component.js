/**
 * Created by wzhan039 on 2016-08-18.
 * 通用函数（可供finance调用）
 */
    'use strict'

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