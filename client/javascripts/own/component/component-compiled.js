/**
 * Created by wzhan039 on 2016-08-18.
 * 通用函数（可供finance调用）
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var app = angular.module('component', ['angularMoment']);

//common的程序
app.factory('validateHelper', function () {
    var dataTypeCheck = {
        isArray: function isArray(obj) {
            return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && Array == obj.constructor;
        },

        isInt: function isInt(value) {
            // return !isNaN(parseInt(value))
            return parseInt(value).toString() === value.toString();
        },
        isNumber: function isNumber(value) {
            return !isNaN(parseFloat(value));
        },
        isString: function isString(value) {
            return typeof value === 'string';
        },
        isStringEmpty: function isStringEmpty(value) {
            return "" === value || 0 === value.length || "" === value.trim();
        },
        isDate: function isDate(date) {
            var parsedDate = new Date(date);
            if (parsedDate.toLocaleString() === 'Invalid Date') {
                return false;
            }
            return parsedDate;
            //}
        },
        isPositive: function isPositive(value) {
            var parsedValue = parseFloat(value);
            /*        if(isNaN(parsedValue)){
             return false
             }*/
            return parsedValue > 0;
        }
    };

    var ruleTypeCheck = {
        inputValueTypeCheck: function inputValueTypeCheck(value) {
            if (false === dataTypeCheck.isArray(value) && false === dataTypeCheck.isNumber(value) && dataTypeCheck.isString(value)) {
                return false;
            } else {
                return true;
            }
        },
        exceedMaxLength: function exceedMaxLength(value, maxLength) {
            //length属性只能在数字/字符/数组上执行
            if (false == this.inputValueTypeCheck(value)) {
                // console.log(false)
                return false;
            }
            //client都是字符
            // console.log(value.length)
            return value.length > maxLength;
        },
        exceedMinLength: function exceedMinLength(value, minLength) {
            if (false == this.inputValueTypeCheck(value)) {
                return false;
            }
            //client都是字符
            return value.length < minLength;
        },
        exactLength: function exactLength(value, _exactLength) {
            if (false == this.inputValueTypeCheck(value)) {
                return false;
            }
            //client都是字符
            return value.length === _exactLength;
        },
        exceedMax: function exceedMax(value, definedValue) {
            return parseFloat(value) > parseFloat(definedValue);
        },
        exceedMin: function exceedMin(value, definedValue) {
            return parseFloat(value) < parseFloat(definedValue);
        }
    };

    //检查input value（对单个field进行检查，因为此函数在每个input发生blur就要调用）
    // inputRule/inputAttr是coll级别
    function checkInput(field, inputRule, inputAttr) {
        // console.log(`inputAttr is ${JSON.stringify(inputAttr)}`)
        // console.log(`field to be checked is ${JSON.stringify(field)}`)
        //id不需要检测
        if ('id' === field) {
            return true;
        }
        //console.log(`before field is ${field}`)
        var requireFlag = inputRule[field]['require']['define'];
        //console.log(`after field is ${field}`)
        var currentValue = inputAttr[field]['value'];
        if (undefined === requireFlag) {
            requireFlag = false;
        }

        if ('' === currentValue) {
            if (false === requireFlag) {
                inputAttr[field]['validated'] = true;
                return true;
            }
            if (true === requireFlag) {
                inputAttr[field]['validated'] = false;
                inputAttr[field]['errorMsg'] = inputRule[field]['require']['msg'];
                return false;
            }
        }

        //检查类型
        var tmpFieldDataType = inputRule[field]['type'];
        var dataTypeCheckResult = false;
        /*        console.log(`dataType is ${JSON.stringify(tmpFieldDataType)}`)
                console.log(`value is ${JSON.stringify(currentValue)}`)*/
        switch (tmpFieldDataType) {
            case 'int':
                dataTypeCheckResult = dataTypeCheck.isInt(currentValue);
                break;
            case 'float':
                dataTypeCheckResult = dataTypeCheck.isNumber(currentValue);
                console.log('resulr is ' + JSON.stringify(dataTypeCheckResult));
                break;
            case 'number':
                dataTypeCheckResult = dataTypeCheck.isNumber(currentValue);
                break;
            case 'string':
                dataTypeCheckResult = dataTypeCheck.isString(currentValue);
                break;
            case 'date':
                dataTypeCheckResult = dataTypeCheck.isDate(currentValue);
                break;
        }

        if (false === dataTypeCheckResult) {
            if ('int' === tmpFieldDataType || 'float' === tmpFieldDataType || 'number' === tmpFieldDataType) {
                inputAttr[field]['errorMsg'] = inputAttr[field]['chineseName'] + '必须是数字';
            }
            if ('date' === tmpFieldDataType) {
                inputAttr[field]['errorMsg'] = inputAttr[field]['chineseName'] + '必须是日期';
            }
            inputAttr[field]['validated'] = false;
            console.log('error is ' + JSON.stringify(inputAttr[field]));
            return false;
        }

        //input不空，检查当前字段除了require之外的其他所有rule
        if ('' !== currentValue) {
            for (var singleRule in inputRule[field]) {
                var ruleCheckFunc = void 0;
                if ('require' === singleRule) {
                    continue;
                }

                //检查rule
                switch (singleRule) {
                    case 'max':
                        ruleCheckFunc = 'exceedMax';
                        break;
                    case 'min':
                        ruleCheckFunc = 'exceedMin';
                        break;
                    case 'maxLength':
                        ruleCheckFunc = 'exceedMaxLength';
                        break;
                    case 'minLength':
                        ruleCheckFunc = 'exceedMinLength';
                        break;
                }

                if (true === ruleTypeCheck[ruleCheckFunc](currentValue, inputRule[field][singleRule]['define'])) {
                    inputAttr[field]['errorMsg'] = inputRule[field][singleRule]['msg'];
                    inputAttr[field]['validated'] = false;
                    return false;
                } else {
                    inputAttr[field]['errorMsg'] = "";
                    inputAttr[field]['validated'] = true;
                }
            }
        }
        return true;
    }
    //对所有的input进行检测
    function allCheckInput(inputRule, inputAttr) {
        // console.log(`input attr is ${JSON.stringify(inputAttr)}`)
        // console.log('check input in')
        var tmpResult = void 0;
        for (var singleField in inputAttr) {
            tmpResult = checkInput(singleField, inputRule, inputAttr);
            // console.log(`single filed ${singleField} check result is ${tmpResult}`)
            if (false === tmpResult) {
                return false;
            }
        }
        return true;
    }

    return { dataTypeCheck: dataTypeCheck, ruleTypeCheck: ruleTypeCheck, checkInput: checkInput, allCheckInput: allCheckInput };
});

app.factory('htmlHelper', function (validateHelper) {
    return {
        /*
        * leftOffset:覆盖元素的left和当前元素left 之间的offset。可正可负。
        * topOffset：覆盖元素的top和当前元素top 之间的offset。可正可负。
        * widthOffset：覆盖元素的width和当前元素width 之间的offset。可正可负。
        * heightOffset：覆盖元素的height和当前元素height 之间的offset。可正可负。
        * */
        setCoverEle: function setCoverEle(currentEleId, coveringEleId) {
            var offset = arguments.length <= 2 || arguments[2] === undefined ? { leftOffset: 0, topOffset: 0, widthOffset: 0, heightOffset: 0 } : arguments[2];

            var errorMsg = {
                eleNotExist: function eleNotExist(eleId) {
                    return { rc: 1, msg: '元素$(eleId)不存在' };
                },
                paramNotNumber: function paramNotNumber(eleId) {
                    return { rc: 2, msg: '元素$(eleId)不是数值' };
                }
            };

            //1. 检测输入参数
            var currentEle = document.getElementById(currentEleId);
            if (undefined === currentEle) {
                return errorMsg.eleNotExist(currentEleId);
            }
            var coveringEle = document.getElementById(coveringEleId);
            if (undefined === coveringEle) {
                return errorMsg.eleNotExist(coveringEleId);
            }

            for (var key in offset) {
                if (validateHelper.dataTypeCheck.isNumber(offset[key])) {
                    return errorMsg.paramNotNumber(key);
                }
            }

            //设置覆盖元素的参数
            coveringEle.style.position = 'absolute';
            coveringEle.style.left = currentEle.offsetLeft + offset.leftOffset + 'px';
            coveringEle.style.top = currentEle.offsetTop + offset.topOffset + 'px';
            coveringEle.style.width = currentEle.offsetWidth + offset.widthOffset + 'px';
            coveringEle.style.height = currentEle.offsetHeight + offset.heightOffset + 'px';
        },

        /*
        * 说明：根据页面的内容设置footer的位置，使之一直位于页面最下方
        *       如果页面内容（html内容）小于浏览器视口（不包含工具栏），给footer添加fixed-footer，使得footer位于最下方
        *       否则移除fixed-footer(因为此时footer已经在最下方)
        * */
        adjustFooterPosition: function adjustFooterPosition() {
            // let contentHeight = document.body.scrollHeight//网页正文全文高度
            // let winHeight = window.innerHeight//可视窗口高度，不包括浏览器顶部工具栏
            var contentHeight = $(document).height(); //网页正文全文高度
            var winHeight = $(window).height(); //可视窗口高度，不包括浏览器顶部工具栏
            // console.log(`contentHeight is ${contentHeight}, winHeight is ${winHeight}`)
            //console.log(winHeight)
            if (!(contentHeight > winHeight)) {
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
        verticalModalCenter: function verticalModalCenter(dialogId) {
            var dialog = document.getElementById(dialogId);
            //因为此函数可能在整个window上监听onsize，所以需要判断modal是否存在，不存在直接退出
            if (null === dialog) {
                return false;
            }
            var windowHeight = $(window).height();
            //var dialogHeight=dialog.offsetHeight
            //console.log(dialog.offsetHeight)
            var dialogHeight = dialog.style.height.replace('px', '');

            //console.log(`windos height is ${windowHeight}`)
            //console.log(`dialog height is ${dialogHeight}`)
            //diag太长了
            //60是botstrap中为diaglog定义的上下margin，略微上移，符合人类审美
            if (windowHeight - dialogHeight < 30) {
                var top = 20; //不能覆盖header
            } else {
                /*                console.log(`windowHeight-dialogHeight is ${windowHeight-dialogHeight}`)
                                console.log(`windowHeight-dialogHeight/2 is ${(windowHeight-dialogHeight)/2}`)*/
                top = (windowHeight - dialogHeight) / 2 - 30;
                //console.log(`result is ${top}`)
            }

            /*            var top=((windowHeight-dialogHeight)/2)-60
                        if(top<0){
                            top=0
                        }*/

            dialog.style.top = top + 'px';
        }

    };
});

/*            设置 查询条件 时，使用的函数              */
app.factory('queryHelper', function (contEnum) {
    //var allFunc={}
    //allFunc={
    //field：要操作的字段名
    //idx：要删除的搜索值（因为搜索值是一个数组，格式为[{value:'val1'}]）
    function deleteQueryValue(field, idx, activateQueryFieldAndValue) {
        if (activateQueryFieldAndValue[field] && activateQueryFieldAndValue[field][idx]) {
            activateQueryFieldAndValue[field].splice(idx, 1);
            if (0 === activateQueryFieldAndValue[field].length) {
                delete activateQueryFieldAndValue[field];
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
    function addQueryValueOld(field, value, fkConfig, activateQueryFieldAndValue) {
        // console.log(`field is ${field},value is ${JSON.stringify(value)}, activated value is ${activateQueryFieldAndValue}`)
        // if(undefined===activateQueryFieldAndValue){
        //     console.log(`in to init activea vlauy`)
        //     activateQueryFieldAndValue={}
        // }
        console.log('field is ' + JSON.stringify(field));
        console.log('field is ' + JSON.stringify(value));

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
            activateQueryFieldAndValue[field] = [];
        }
        //如果是select传递过来的值
        var inputValue = void 0;
        if (value.key) {
            inputValue = value.key;
        } else {
            inputValue = value;
        }
        activateQueryFieldAndValue[field].push(inputValue);
    }

    //无论字段类型，使用同一个函数进行处理，得到统一格式
    //{name:[{value:'val1'},{value:'val2'}], parentBillType:{name:[{value:'name1'}]}, age:[{value:20,comOp:'gt',compSymbol:'>'}]}
    //如果是日期或者数字，会多出一个compSymbol，用来在页面上显示比较符，需要通过convertAddQueryValueToServerFormat去掉
    function addQueryValue(field, value, activateQueryFieldAndValue, operator) {

        /*        console.log(`field is ${JSON.stringify(field)}`)
                console.log(`value is ${JSON.stringify(value)}`)
                console.log(`operator is ${JSON.stringify(operator)}`)*/

        if (undefined === activateQueryFieldAndValue[field]) {
            activateQueryFieldAndValue[field] = [];
        }

        //如果有比较符，同时activateQueryFieldAndValue的某个查询元素也带有此相同的比较符，那么直接用新的值代替这个元素中的搜索值
        if (operator) {
            //将测是否已经有对应的compOp
            //有，直接覆盖value
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = activateQueryFieldAndValue[field][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var singleParam = _step.value;

                    if (singleParam['compOp'] && operator === singleParam['compOp']) {
                        singleParam['value'] = value;
                        return true;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        //activateQueryFieldAndValue字段的搜索数组中没有 比较符
        var valueToBePush = {}; //如果当前此字段没有对应的比较符，那么valueToBePush初始化为{}，并赋值；  否则从当前字段中取出符号为此
        if (operator) {
            valueToBePush['compOp'] = operator;
            if ('gt' === operator) {
                valueToBePush['compSymbol'] = '>';
            }
            if ('lt' === operator) {
                valueToBePush['compSymbol'] = '<';
            }
        }
        //如果是select传递过来的值
        if (value.key) {
            valueToBePush['value'] = value.key;
        } else {
            valueToBePush['value'] = value;
        }

        activateQueryFieldAndValue[field].push(valueToBePush);
    }

    //如果是外键，选择外键对应的冗余字段（一般是一个）；同时，如果是日期或者数字，去掉compSymbol
    // {"values":{"name":[{"value":"{{billtype_name_1}}"}],"parentBillType":{"name":[{"value":"{{billtype_name_2}}"}]}}}
    function convertAddQueryValueToServerFormat(activateQueryFieldAndValue, fkConfig, currentPage) {
        var formattedValue = {};
        if (Object.keys(activateQueryFieldAndValue).length > 0) {
            for (var fieldName in activateQueryFieldAndValue) {
                var aValue = void 0; //应用需要加入值的数组（外键和非外键的结构不一致）
                //1. 创建必要的结构
                //如果是外键
                if (true === fieldName in fkConfig) {
                    if (undefined === formattedValue[fieldName]) {
                        formattedValue[fieldName] = {};
                    }
                    var redundancyField = fkConfig[fieldName]['fields'][0]; //当前冗余字段虽然是数组，但是其实只有一个元素
                    if (undefined === formattedValue[fieldName][redundancyField]) {
                        formattedValue[fieldName][redundancyField] = [];
                    }
                    aValue = formattedValue[fieldName][redundancyField];
                } else {
                    if (undefined === formattedValue[fieldName]) {
                        formattedValue[fieldName] = []; //非外键直接数组
                    }
                    aValue = formattedValue[fieldName];
                }

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = activateQueryFieldAndValue[fieldName][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var singleValue = _step2.value;

                        //不能直接 delete singleValue['compSymbol']（因为是引用），只能直接复制
                        var newValue = {};
                        newValue['value'] = singleValue['value'];
                        newValue['compOp'] = singleValue['compOp'];

                        aValue.push(newValue);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        }

        return { 'currentPage': currentPage, 'searchParams': formattedValue };
    }

    //实际要传送到server端的 查询 数据，可能在前端显示给用户看的时候需要格式化（例如时间，可能只要显示YYYY-DD-MM，而不要HH:mm）
    var formatQueryValue = {
        date: function date(fieldValue) {
            console.log('date tiem stamp ' + fieldValue);
            return moment(fieldValue, 'X').format('YYYY-MM-DD');
        },
        dateTime: function dateTime() {}
    };

    return { deleteQueryValue: deleteQueryValue, addQueryValue: addQueryValue, convertAddQueryValueToServerFormat: convertAddQueryValueToServerFormat, formatQueryValue: formatQueryValue };
});
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

app.factory('inputAttrHelper', function (contEnum) {
    //对某个input设置errorMsg（errorMsg隐式设置input样式）
    function setSingleInputAttrErrorMsg(field, inputAttr, errMsg) {
        inputAttr[field]['errorMsg'] = errMsg;
        inputAttr[field]['validated'] = false;
    }
    //对inputAttr中的一个字段进行初始化
    function initSingleFieldInputAttrCreate(field, inputAttr) {
        // console.log(opType)
        // if(contEnum.opType.create===opType){
        inputAttr[field]['value'] = '';
        // }
        inputAttr[field]['originalValue'] = '';
        inputAttr[field]['validated'] = 'undefined';
        inputAttr[field]['errorMsg'] = '';
    }
    //对一个inputAttr中所有field进行初始化
    function initAllFieldInputAttrCreate(inputAttr) {
        // console.log(inputAttr)
        for (var singleField in inputAttr) {
            // console.log(singleField)
            initSingleFieldInputAttrCreate(singleField, inputAttr);
        }
        // console.log(inputAttr)
    }

    function initSingleFieldInputAttrUpdate(field, inputAttr) {
        // console.log(opType)
        // if(contEnum.opType.create===opType){
        //     inputAttr[field]['value']=''
        // }
        inputAttr[field]['originalValue'] = '';
        inputAttr[field]['validated'] = 'undefined';
        inputAttr[field]['errorMsg'] = '';
    }
    //对一个inputAttr中所有field进行初始化
    function initAllFieldInputAttrUpdate(inputAttr) {
        // console.log(inputAttr)
        for (var singleField in inputAttr) {
            // console.log(singleField)
            initSingleFieldInputAttrUpdate(singleField, inputAttr);
        }
        // console.log(inputAttr)
    }
    //是否所有的input检测都通过了（或者无需）
    function allInputValidCheck(inputAttr) {
        for (var field in inputAttr) {
            if (false === inputAttr[field]['validated']) {
                // console.log(inputAttr[field])
                return false;
            }
        }
        return true;
    }
    //将当前的记录载入到inputAttr
    function loadCurrentData(idx, inputAttr, recorder, fkConfig) {
        for (var field in inputAttr) {

            if (undefined === recorder[idx][field] || null === recorder[idx][field]) {
                inputAttr[field]['value'] = '';
                inputAttr[field]['originalValue'] = ''; //用来比较是不是做了修改
            } else {
                var newValue = recorder[idx][field];
                if (true === field in fkConfig) {
                    var redundancyField = fkConfig[field]['fields'][0];
                    newValue = recorder[idx][field][redundancyField];
                }
                inputAttr[field]['value'] = newValue;
                inputAttr[field]['originalValue'] = newValue; //用来比较是不是做了修改
            }
        }
    }

    //为未在inputRule中定义的字段，在inputAttr中产生对应的field，以便显示在页面
    //举例，创建或者修改记录时，其中的cDate/uDate，是server自动产生，而无需client输入，但是可能需要显示在页面，此时，需要添加到inputAttr
    //记录到inputAttr是，只需value一个key，无需type，因为只是显示，不会修改（只在server修改）
    function generateAdditionalFieldIntoInputAttr(recorder, inputAttr) {
        for (var singleFieldName in recorder) {
            if (undefined === inputAttr[singleFieldName]) {
                inputAttr[singleFieldName] = {};
                inputAttr[singleFieldName]['value'] = recorder[singleFieldName]; //只需value一个key，无需type，因为只是显示，不会修改（只在server修改）
            }
        }
    }

    //将inputAttr的value转换成values:{f1:{value:1},f2:{value:2}}的格式，以便在传递到server
    //如果无值，则设成null，server会自动进行处理
    function convertedInputAttrFormatCreate(inputAttrs) {
        var value = {};
        for (var singleInputAttr in inputAttrs) {
            value[singleInputAttr] = {};
            //console.log(`current field is ${singleInputAttr}`)
            //console.log(`current field value is ${JSON.stringify(inputAttrs[singleInputAttr]) }`)
            if (undefined !== inputAttrs[singleInputAttr]['value'] && null !== inputAttrs[singleInputAttr]['value'] && '' !== inputAttrs[singleInputAttr]['value']) {
                value[singleInputAttr]['value'] = inputAttrs[singleInputAttr]['value'];
            } else {
                value[singleInputAttr]['value'] = null;
            }
        }
        return value;
    }

    //只有value和originalValue的值不同，才会将value发送到server
    function convertedInputAttrFormatUpdate(inputAttrs) {
        var value = {};
        for (var singleInputAttr in inputAttrs) {
            value[singleInputAttr] = {};
            //console.log(`current field is ${singleInputAttr}`)
            //console.log(`current field value is ${JSON.stringify(inputAttrs[singleInputAttr]) }`)
            if (inputAttr[singleInputAttr]['value'] !== inputAttr[singleInputAttr]['originalValue']) {
                if (undefined !== inputAttrs[singleInputAttr]['value'] && null !== inputAttrs[singleInputAttr]['value'] && '' !== inputAttrs[singleInputAttr]['value']) {
                    value[singleInputAttr]['value'] = inputAttrs[singleInputAttr]['value'];
                } else {
                    value[singleInputAttr]['value'] = null;
                }
            }
        }
        return value;
    }

    //acObj:客户端获得的autoComplete的选中值；values：将要发送到server的数据
    //acObj {parentBillType:{value:'xxx','_id':null}====>values  {parentBillType:{value:'_id'}}
    function convertSingleACFormat(acField, acObj, values) {
        // for(let key in acObj){
        if (undefined !== acObj && null !== acObj) {
            values[acField] = { value: null };
            if (undefined !== acObj[acField]['_id'] || null !== acObj[acField]['_id']) {
                values[acField]['value'] = acObj[acField]['_id'];
            }
        }

        // }
    }

    //对于create，如果是null的话，说明没有设置
    function initSingleAcFieldForCreate(acField, acObj) {
        if (undefined === acObj[acField] || null === acObj[acField]) {
            acObj[acField] = {};
        }
        acObj[acField]['value'] = '';
        acObj[acField]['_id'] = null;
    }

    //对于update，如果_id是-1的话，说明没有设置（null代表要删除此字段）
    function initSingleAcFieldForUpdate(acField, acObj) {
        if (undefined === acObj[acField] || null === acObj[acField]) {
            acObj[acField] = {};
        }
        acObj[acField]['value'] = '';
        acObj[acField]['_id'] = -1;
    }
    return {
        setSingleInputAttrErrorMsg: setSingleInputAttrErrorMsg,
        initSingleFieldInputAttrCreate: initSingleFieldInputAttrCreate,
        initAllFieldInputAttrCreate: initAllFieldInputAttrCreate,
        initSingleFieldInputAttrUpdate: initSingleFieldInputAttrUpdate,
        initAllFieldInputAttrUpdate: initAllFieldInputAttrUpdate,
        allInputValidCheck: allInputValidCheck,
        loadCurrentData: loadCurrentData,
        generateAdditionalFieldIntoInputAttr: generateAdditionalFieldIntoInputAttr,
        convertedInputAttrFormatCreate: convertedInputAttrFormatCreate,
        convertedInputAttrFormatUpdate: convertedInputAttrFormatUpdate,
        convertSingleACFormat: convertSingleACFormat,
        initSingleAcFieldForCreate: initSingleAcFieldForCreate,
        initSingleAcFieldForUpdate: initSingleAcFieldForUpdate
    };
});

app.factory('commonHelper', function () {
    //对server返回的result，进行检查，如果是日期，用moment进行转换
    //result：从server返回的结果(非数组，而是单个记录)；filedType：当前result的field类型
    function convertDateTime(singleRecorder, fieldType) {
        var dateFormat = 'YYYY-MM-DD HH:mm:ss';
        for (var singleFiled in singleRecorder) {
            //result中的字段是否为date，是的话用moment进行转换
            if (-1 !== fieldType.indexOf(singleFiled)) {
                singleRecorder[singleFiled] = moment(singleRecorder[singleFiled]).format(dateFormat);
            }
        }
    }

    return {
        convertDateTime: convertDateTime
    };
});

app.service('modal', function () {
    var _modalId = void 0,
        _modalMsgId = void 0,
        _modalTitleId = void 0,
        _modalCloseButtonId = void 0,
        _modalCloseSymbolId = void 0;
    function _setTop() {
        //$('#modal_modal>div').height()=174，直接测量得到，因为只有在show时，才有height，hide时为0
        //var top=parseInt((document.body.clientHeight-174)/2)
        $('#' + _modalId).css('top', 100);
    }
    function _modalHide() {
        $('#' + _modalMsgId).text('');
        $('#' + _modalId).removeClass('show');
        $('#' + _modalTitleId).text('').removeClass('text-danger').removeClass('text-info');
        $('#' + _modalCloseButtonId).removeClass('btn-danger').removeClass('btn-info').unbind('click');
        $('#' + _modalCloseSymbolId).unbind('click');
    }
    /*                  设置id            */
    //modal的id
    this.setModalId = function (modalId) {
        _modalId = modalId;
        //默认是如下格式，可以通过set覆盖
        _modalMsgId = modalId + '_msg';
        _modalTitleId = modalId + '_title';
        _modalCloseButtonId = modalId + '_close_button';
        _modalCloseSymbolId = modalId + '_close_symbol';
    };

    //modalMsg：显示信息的元素
    this.setModalMsgId = function (modalMsgId) {
        _modalMsgId = modalMsgId;
    };

    this.setModalTitleId = function (modalTitleId) {
        _modalTitleId = modalTitleId;
    };

    this.setModalCloseButtonId = function (modalCloseButtonId) {
        _modalCloseButtonId = modalCloseButtonId;
    };

    this.setModalCloseSymbolId = function (modalCloseSymbolId) {
        _modalCloseSymbolId = modalCloseSymbolId;
    };

    /*              设置信息            */
    this.showErrMsg = function (msg) {
        _setTop();
        $('#' + _modalMsgId).text(msg);
        //$('#modal_msg').text=msg
        $('#' + _modalId).addClass('show');
        $('#' + _modalTitleId).text('错误').addClass('text-danger');
        $('#' + _modalCloseButtonId).addClass('btn-danger').bind('click', function () {
            _modalHide(_modalId);
        });
        $('#' + _modalCloseSymbolId).bind('click', function () {
            _modalHide(_modalId);
        });
    };

    this.showInfoMsg = function (msg) {
        _setTop();
        $('#' + _modalMsgId).text(msg);
        $('#' + _modalId).addClass('show');
        $('#' + _modalTitleId).text('信息').addClass('text-info');
        $('#' + _modalCloseButtonId).addClass('btn-info').bind('click', function () {
            _modalHide(_modalId);
        });
        $('#' + _modalCloseSymbolId).bind('click', function () {
            //console.log(`click symbol id is ${_modalCloseSymbolId}`)
            _modalHide(_modalId);
        });
    };
});

app.service('modalChoice', function (htmlHelper) {
    var _modalId = void 0,
        _modalMsgId = void 0,
        _modalTitleId = void 0,
        _modalYesButtonId = void 0,
        _modalNoButtonId = void 0,
        _modalCloseSymbolId = void 0;
    function _setTop() {
        //$('#modal_modal>div').height()=174，直接测量得到，因为只有在show时，才有height，hide时为0
        //var top=parseInt(($(window).height()-174)/2)
        $('#' + _modalId).css('top', 100);
        //htmlHelper.verticalModalCenter(_modalId)
    }
    function _modalHide() {
        $('#' + _modalMsgId).text('');
        $('#' + _modalId).removeClass('show');
        $('#' + _modalTitleId).text('').removeClass('text-danger').removeClass('text-info');
        $('#' + _modalYesButtonId).removeClass('btn-danger').removeClass('btn-info').unbind('click');
        $('#' + _modalNoButtonId).removeClass('btn-danger').removeClass('btn-info').unbind('click');
        $('#' + _modalCloseSymbolId).unbind('click');
    }
    /*                  设置id            */
    //modal的id
    this.setModalId = function (modalId) {
        _modalId = modalId;
        //默认是如下格式，可以通过set覆盖
        _modalMsgId = modalId + '_msg';
        _modalTitleId = modalId + '_title';
        _modalYesButtonId = modalId + '_yes_button';
        _modalNoButtonId = modalId + '_no_button';
        _modalCloseSymbolId = modalId + '_close_symbol';
    };

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
    this.setModalMsgId = function (modalMsgId) {
        _modalMsgId = modalMsgId;
    };

    this.setModalTitleId = function (modalTitleId) {
        _modalTitleId = modalTitleId;
    };

    this.setModalYesButtonId = function (modalYesButtonId) {
        _modalYesButtonId = modalYesButtonId;
    };

    this.setModalNoButtonId = function (modalNoButtonId) {
        _modalNoButtonId = modalNoButtonId;
    };

    this.setModalCloseSymbolId = function (modalCloseSymbolId) {
        _modalCloseSymbolId = modalCloseSymbolId;
    };

    /*              设置信息            */
    //currentPage:删除后要重新获得当前页的数据
    this.showChoiceMsg = function (msg, yesDelFunc, idx, recorder, currentPage) {
        /*        console.log(  `enter show choice msg`)
                console.log(  `_modalId is ${_modalId}`)*/
        _setTop();
        $('#' + _modalMsgId).text(msg);
        $('#' + _modalId).addClass('show');
        $('#' + _modalTitleId).text('删除').addClass('text-danger');
        $('#' + _modalYesButtonId).addClass('btn-danger').bind('click', function () {
            _modalHide(_modalId);
            yesDelFunc(idx, recorder, currentPage);
            //return setChoice('yes')
        });
        $('#' + _modalNoButtonId).addClass('').bind('click', function () {
            _modalHide(_modalId);
            //return setChoice('no')
        });
        $('#' + _modalCloseSymbolId).bind('click', function () {
            //console.log(`click symbol id is ${_modalCloseSymbolId}`)
            _modalHide(_modalId);
        });
    };
});

//采用jquery的方式对指定的input进行初始化，以及设置获得日期时间
app.service('dateTimePickerHelper', function () {
    // let _dateTimeEleId
    this.initEle = function (eleId) {
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
        $('#' + eleId).datetimepicker({
            locale: 'zh-cn', // 根据moment的定义，https://github.com/moment/moment/tree/develop/locale
            /*            default:function(){
                            
                        },*/
            viewMode: 'days', //default days, accept decades/years/months/
            format: 'YYYY-MM-DD', //http://momentjs.com/docs/#/displaying/format/ 'YYYY-MM-DD HH:mm'
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-arrow-up",
                down: "fa fa-arrow-down"
            }
        }).on('dp.change', function (e) {
            //$('#'+eleId+'>input').val(e.date)
            console.log('ele ' + eleId + ' on change result is ' + JSON.stringify(e.date));
        });

        // $('#'+_dateTimeEleId).data("DateTimePicker").date("2016-02-01")
    };

    this.getCurrentDate = function (eleId) {
        return $('#' + eleId).data("DateTimePicker").date();
    };
    this.getCurrentDateInTimeStamp = function (eleId) {
        var currentDate = $('#' + eleId).data("DateTimePicker").date();
        return moment(currentDate).unix();
    };

    this.setFirstDay = function (eleId) {
        // let [year,month]=[moment().get('year'),moment().get('month')]
        // let firstDay=year+'-'+month+'-01'
        var d = moment().startOf("month");
        $('#' + eleId).data("DateTimePicker").date(d);
    };
    this.setLastDay = function (eleId) {
        // let [year,month]=[moment().get('year'),moment().get('month')]
        // let firstDay=year+'-'+month+'-01'
        var d = moment().endOf("month");
        $('#' + eleId).data("DateTimePicker").date(d);
    };

    this.validateDate = function (eleId) {
        var datetobecheck = $('#' + eleId).data("DateTimePicker").date();
        // console.log(`date to be check is ${datetobecheck}`)
        // console.log(`date to be checked result is ${moment(datetobecheck).format("YYYY-MM-DD")}`)
        if ("Invalid date" === moment(datetobecheck).format("YYYY")) {
            return false;
        }
        return true;
    };
});

//# sourceMappingURL=component-compiled.js.map