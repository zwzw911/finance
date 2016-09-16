/**
 * Created by wzhan039 on 2016-08-18.
 */
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var app = angular.module('component', []);

app.factory('basicHelper', function () {
    var dataTypeCheck = {
        isArray: function isArray(obj) {
            return obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && Array == obj.constructor;
        },

        isNumber: function isNumber(value) {
            return isNaN(parseFloat(value));
        },
        isString: function isString(value) {
            return typeof value === 'string';
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

    return { dataTypeCheck: dataTypeCheck, ruleTypeCheck: ruleTypeCheck };
});

app.factory('helper', function (basicHelper) {
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
                if (basicHelper.dataTypeCheck.isNumber(offset[key])) {
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
            var contentHeight = document.body.scrollHeight,
                //网页正文全文高度
            winHeight = window.innerHeight; //可视窗口高度，不包括浏览器顶部工具栏
            /*console.log(contentHeight)
                        console.log(winHeight)*/
            if (!(contentHeight > winHeight)) {
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
        * */
        verticalCenter: function verticalCenter(dialogId) {
            var dialog = document.getElementById(dialogId);
            var windowHeight = $(window).height();
            var dialogHeight = dialog.offsetHeight;
            /*console.log(windowHeight)
                        console.log(dialogHeight)*/
            //60是botstrap中为diaglog定义的上下margin，略微上移，符合人类审美
            var top = (windowHeight - dialogHeight) / 2 - 60;
            if (top < 0) {
                top = 0;
            }
            dialog.style.top = top + 'px';
        }
    };
});

app.factory('financeHelper', function (basicHelper) {
    return {
        //传入字段，以及对应的value，那么从activateQueryFieldAndValue删除对应的value，如果filed中对应的value为0，则同时删除field
        deleteQueryValue: function deleteQueryValue(field, value, activateQueryFieldAndValue) {
            for (var i = 0; i < activateQueryFieldAndValue[field].length; i++) {
                if (value === activateQueryFieldAndValue[field][i]) {
                    activateQueryFieldAndValue[field].splice(i, 1);
                    break;
                }
            }
            if (0 === activateQueryFieldAndValue[field].length) {
                delete activateQueryFieldAndValue[field];
            }
        },
        //将选中的field和value加入到allData.activeQueryValue
        addQueryValue: function addQueryValue(field, value, activateQueryFieldAndValue) {
            console.log(field);
            if (undefined === activateQueryFieldAndValue[field]) {
                activateQueryFieldAndValue[field] = [];
            }
            activateQueryFieldAndValue[field].push(value);
            console.log(activateQueryFieldAndValue);
        },

        //检查input value
        checkInput: function checkInput(field, inputRule, inputAttr) {
            /*            console.log('blur')
                        console.log(field)*/
            var requireFlag = inputRule[field]['require']['define'];
            var currentValue = inputAttr[field]['value'];
            if (undefined === requireFlag) {
                requireFlag = false;
            }

            if ('' === currentValue) {
                if (false === requireFlag) {
                    return true;
                }
                if (true === requireFlag) {
                    inputAttr[field]['errorMsg'] = inputRule[field]['require']['msg'];
                    return false;
                }
            }
            //input不空，检查当前字段除了require之外的其他所有rule
            if ('' !== currentValue) {
                for (var singleRule in inputRule[field]) {
                    var ruleCheckFunc = void 0;
                    if ('require' === singleRule) {
                        continue;
                    }
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

                    if (true === basicHelper.ruleTypeCheck[ruleCheckFunc](currentValue, inputRule[field][singleRule]['define'])) {
                        inputAttr[field]['errorMsg'] = inputRule[field][singleRule]['msg'];
                        inputAttr[field]['validated'] = false;
                        break;
                    } else {
                        inputAttr[field]['errorMsg'] = "";
                        inputAttr[field]['validated'] = true;
                    }
                }
            }
        },
        //init input
        initInput: function initInput(field, inputAttr) {
            /*            console.log('focus')
                        console.log(field)
                        console.log(inputAttr)*/
            inputAttr[field]['errorMsg'] = '';
        },
        //是否所有的input检测都通过了（或者无需）
        allInputValidCheck: function allInputValidCheck(inputAttr) {
            // console.log('validate')
            for (var field in inputAttr) {
                if (false === inputAttr[field]['validated']) {
                    // console.log(inputAttr[field])
                    return false;
                }
            }
            return true;
        }
    };
});

//# sourceMappingURL=component-compiled.js.map