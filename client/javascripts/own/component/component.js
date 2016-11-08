/**
 * Created by wzhan039 on 2016-08-18.
 * 通用函数（可供finance调用）
 */
    'use strict'
var app=angular.module('component',['angularMoment']);

//common的程序
app.factory('validateHelper',function(){
    var dataTypeCheck=
        {
            isArray(obj) {
                return obj && typeof obj === 'object' &&
                Array == obj.constructor;
            },
            isNumber: function (value) {
                return isNaN(parseFloat(value))
            },
            isString(value){
                return typeof value === 'string'
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
            }

    //检查input value（对单个field进行检查，因为此函数在每个input发生blur就要调用）
    // inputRule/inputAttr是coll级别
    function checkInput(field,inputRule,inputAttr){
        //id不需要检测
        if('id'===field){
            return true
        }
        var requireFlag=inputRule[field]['require']['define']
        var currentValue=inputAttr[field]['value']
        if(undefined===requireFlag){
            requireFlag=false
        }

        if(''===currentValue){
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

        //input不空，检查当前字段除了require之外的其他所有rule
        if(''!==currentValue){
            for(let singleRule in inputRule[field]){
                let ruleCheckFunc
                if('require'===singleRule){
                    continue
                }
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
                }

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
        // console.log(`input attr is ${JSON.stringify(inputAttr)}`)
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

app.factory('htmlHelper',function(validateHelper){
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
            var contentHeight = document.body.scrollHeight,//网页正文全文高度
                winHeight = window.innerHeight;//可视窗口高度，不包括浏览器顶部工具栏
/*console.log(contentHeight)
            console.log(winHeight)*/
            if(!(contentHeight > winHeight)){
                //当网页正文高度小于可视窗口高度时，为footer添加类fixed-bottom
                //console.log('add')
                $("footer").addClass("fixed-footer");
            } else {
                //console.log('remove')
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

            //60是botstrap中为diaglog定义的上下margin，略微上移，符合人类审美
            var top=((windowHeight-dialogHeight)/2)-60
            if(top<0){
                top=0
            }

            dialog.style.top=top+'px'

        },


    }
})


app.factory('financeHelper',function(contEnum) {
    //var allFunc={}
    //allFunc={
    //传入字段，以及对应的value，那么从activateQueryFieldAndValue删除对应的value，如果filed中对应的value为0，则同时删除field
    function deleteQueryValue(field, value, activateQueryFieldAndValue) {
        for (var i = 0; i < activateQueryFieldAndValue[field].length; i++) {
            if (value === activateQueryFieldAndValue[field][i]) {
                activateQueryFieldAndValue[field].splice(i, 1)
                break
            }
        }
        if (0 === activateQueryFieldAndValue[field].length) {
            delete activateQueryFieldAndValue[field]
        }
    }

    //将选中的field和value加入到allData.activeQueryValue
    function addQueryValue(field, value, activateQueryFieldAndValue) {
        // console.log(`field is ${field},value is ${JSON.stringify(value)}, activated value is ${activateQueryFieldAndValue}`)
        // if(undefined===activateQueryFieldAndValue){
        //     console.log(`in to init activea vlauy`)
        //     activateQueryFieldAndValue={}
        // }
        if (undefined === activateQueryFieldAndValue[field]) {
            activateQueryFieldAndValue[field] = []
        }

        //如果是select传递过来的值
        if (value.key) {
            activateQueryFieldAndValue[field].push(value.key)
        } else {
            activateQueryFieldAndValue[field].push(value)
        }

    }

    return {deleteQueryValue,addQueryValue}
})

app.factory('inputAttrHelper',function(contEnum) {
    //对某个input设置errorMsg（errorMsg隐式设置input样式）
    function setSingleInputAttrErrorMsg(field,inputAttr,errMsg){
        inputAttr[field]['errorMsg']=errMsg
        inputAttr[field]['validated']=false
    }
    //对inputAttr中的一个字段进行初始化
    function initSingleFieldInputAttrCreate(field,inputAttr){
        // console.log(opType)
        // if(contEnum.opType.create===opType){
            inputAttr[field]['value']=''
        // }
        inputAttr[field]['originalValue']=''
        inputAttr[field]['validated']='undefined'
        inputAttr[field]['errorMsg']=''
    }
    //对一个inputAttr中所有field进行初始化
    function initAllFieldInputAttrCreate(inputAttr){
        // console.log(inputAttr)
        for(let singleField in inputAttr){
            // console.log(singleField)
            initSingleFieldInputAttrCreate(singleField,inputAttr)
        }
        // console.log(inputAttr)
    }

    function initSingleFieldInputAttrUpdate(field,inputAttr){
        // console.log(opType)
        // if(contEnum.opType.create===opType){
        //     inputAttr[field]['value']=''
        // }
        inputAttr[field]['originalValue']=''
        inputAttr[field]['validated']='undefined'
        inputAttr[field]['errorMsg']=''
    }
    //对一个inputAttr中所有field进行初始化
    function initAllFieldInputAttrUpdate(inputAttr){
        // console.log(inputAttr)
        for(let singleField in inputAttr){
            // console.log(singleField)
            initSingleFieldInputAttrUpdate(singleField,inputAttr)
        }
        // console.log(inputAttr)
    }
    //是否所有的input检测都通过了（或者无需）
    function allInputValidCheck(inputAttr){
        for(let field in inputAttr){
            if(false===inputAttr[field]['validated']){
                // console.log(inputAttr[field])
                return false
            }
        }
        return true
    }
    //将当前的记录载入到inputAttr
    function loadCurrentData(idx,inputAttr,recorder){
        for(var field in inputAttr){
            if(undefined===recorder[idx][field] || null===recorder[idx][field]){
                inputAttr[field]['value']=''
                inputAttr[field]['originalValue']='' //用来比较是不是做了修改
            }else{
                inputAttr[field]['value']=recorder[idx][field]
                inputAttr[field]['originalValue']=recorder[idx][field] //用来比较是不是做了修改
            }

        }
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

    //将inputAttr的value转换成values:{f1:{value:1},f2:{value:2}}的格式，以便在传递到server
//如果无值，则设成null，server会自动进行处理
    function convertedInputAttrFormatCreate(inputAttrs){
        var value={}
        for(var singleInputAttr in inputAttrs){
            value[singleInputAttr]={}
            //console.log(`current field is ${singleInputAttr}`)
            //console.log(`current field value is ${JSON.stringify(inputAttrs[singleInputAttr]) }`)
            if(undefined!==inputAttrs[singleInputAttr]['value'] &&  null!==inputAttrs[singleInputAttr]['value'] && ''!==inputAttrs[singleInputAttr]['value']){
                value[singleInputAttr]['value']=inputAttrs[singleInputAttr]['value']
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
            if(inputAttr[singleInputAttr]['value']!==inputAttr[singleInputAttr]['originalValue']){
                if(undefined!==inputAttrs[singleInputAttr]['value'] &&  null!==inputAttrs[singleInputAttr]['value'] && ''!==inputAttrs[singleInputAttr]['value']){
                    value[singleInputAttr]['value']=inputAttrs[singleInputAttr]['value']
                }else{
                    value[singleInputAttr]['value']=null
                }
            }
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
        convertedInputAttrFormatCreate,
        convertedInputAttrFormatUpdate,
        convertSingleACFormat,
        initSingleAcFieldForCreate,
        initSingleAcFieldForUpdate,
    }
})

app.factory('commonHelper',function(){
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

    return {
        convertDateTime,
    }
})