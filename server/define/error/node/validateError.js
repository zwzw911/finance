/**
 * Created by Ada on 2017/1/23.
 */
'use strict'

var validateError={
    validateHelper:{
        //valueTypeCheck
        unknownDataType:{rc:69500,msg:'未知数据类型'},

        //ruleFormatCheck
        ruleMustBeObject:{rc:69510,msg:'rule定义必须是对象'},
        mandatoryFiledNotExist:{rc:69512,msg:'字段必需存在'},
        chineseNameNotString:{rc:69514,msg:'chineseName字段必须是字符串'},
        chineseNameEmpty:{rc:69516,msg:'chineseName字段不能为空'},

        needMin:{rc:69518,msg:'type为int时，必需包含Min属性'},
        needMax:{rc:69520,msg:'type为int时，必需包含Max属性'},
        needMaxLength:{rc:69522,msg:'type为string或者number时，必需包含maxLength属性'},
        needFormat:{rc:69524,msg:'type为objectId是，必须包含format属性'},

        // ruleDefineNotRight:{rc:69816,msg:'rule的定义不正确'},
        /*            maxLengthDefineNotInt:{rc:69818,msg:'maxLength的定义不是整数'},
         minLengthDefineNotInt:{rc:69820,msg:'minLength的定义不是整数'},
         exactLengthDefineNotInt:{rc:69822,msg:'exactLengt的定义不是整数'},*/
        lengthDefineNotInt:{rc:69526,msg:'length定义不是整数'},
        lengthDefineMustLargeThanZero:{rc:69528,msg:'length的定义必须大于0'},
        maxDefineNotInt:{rc:69530,msg:'max的定义不是整数'},
        minDefineNotInt:{rc:69532,msg:'min的定义不是整数'},
        requireDefineNotBoolean:{rc:69534,msg:'require的定义不是布尔值'},
        enumDefineNotArray:{rc:69536,msg:'enum的定义不是数组'},
        enumDefineLengthMustLargerThanZero:{rc:69538,msg:'enum的定义数组不能为空'},
        ruleDefineNotDefine:{rc:69540,msg:'define字段没有定义'},
        errorFieldNotDefine:{rc:69542,msg:'error字段不存在'},
        rcFieldNotDefine:{rc:69544,msg:'rc字段不存在'},
        ruleDefineWrong:function(collName,fieldName,ruleName){return {rc:69546,msg:`${collName}的字段${fieldName}中的rule ${ruleName}的define值不正确`}},

        // rcFormatWrong:{rc:69842,msg:'错误代码格式不正确'},
    },
    validateFormat:{
        /*              checkInput              */
        //CU总结构
        CUValuesTypeWrong:{rc:69600,msg:{client:'参数格式不正确',server:'参数类型不正确，必须是JSON'}},
        CUValuesFormatMissRecorderInfo:{rc:69602,msg:{client:'参数格式不正确',server:'参数格式不正确，必须必须包含recorderInfo'}},
        CUValuesRecorderInfoMustBeObject:{rc:69604,msg:{client:'参数格式不正确',server:'参数格式不正确，recorderInfo必须是对象'}},
        CUValuesFormatMisCurrentPage:{rc:69606,msg:{client:'参数格式不正确',server:'参数格式不正确，必须必须包含currentPage'}},
        CUValuesCurrentPageMustBeInt:{rc:69608,msg:{client:'参数格式不正确',server:'参数格式不正确，currentPage必须是整数'}},
        //CU->recorderInfo
        recorderInfoCantEmpty:{rc:69610,msg:'待检测的输入值不能为空'},
        recorderInfoFieldNumExceed:{rc:69612,msg:{client:'参数格式不正确',server:'参数中的字段数量超出定义的数量'}},
        recorderInfoFormatWrong:{rc:69614,msg:{client:'参数格式不正确',server:'参数格式必须是field:{value:val}'}},
        recorderInfoFiledRuleNotDefine:{rc:69616,msg:'待检测的输入值没有对应的检测规则'},
        //recorderInfoIncludeSkipFiled:{rc:69711,msg:'不能包含需要略过的字段'},
        recorderInfoHasDuplicateField:{rc:69618,msg:{client:'参数格式不正确',server:'参数中的有重复字段'}},


        //search(read)总结构
        SValuesTypeWrong:{rc:69620,msg:{client:'参数格式不正确',server:'参数类型不正确，必须是JSON'}},
        SValuesFormatMissSearchParams:{rc:69622,msg:{client:'参数格式不正确',server:'参数格式不正确，必须必须包含SearchParams'}},
        SValuesSearchParamsMustBeObject:{rc:69624,msg:{client:'参数格式不正确',server:'参数格式不正确，SearchParams必须是对象'}},
        SValuesFormatMisCurrentPage:{rc:69626,msg:{client:'参数格式不正确',server:'参数格式不正确，必须必须包含currentPage'}},
        SValuesCurrentPageMustBeInt:{rc:69628,msg:{client:'参数格式不正确',server:'参数格式不正确，currentPage必须是整数'}},
        //search->searchParams
        searchParamsCantEmpty:{rc:69630,msg:{client:`查询参数格式不正确`,server:`查询参数不能为空对象`}},
        searchParamsFieldNoRelatedRule:{rc:69632,msg:{client:`查询字符不正确`,server:`查询参数的键无对应的rule`}},
        searchParamsFiledValueCantEmpty:{rc:69633,msg:{client:`查询参数格式不正确`,server:`查询参数的普通字段（的查询参数）不能为空`}},
        searchParamsFKFiledValueNotObject:{rc:69634,msg:{client:`查询参数格式不正确`,server:`查询参数的外键字段的（搜索）值必须是对象`}},//外键是对象，里面是对应的字段，已经字段对应的数组
        searchParamsFKNoRelatedRule:{rc:69636,msg:{client:`查询字符不正确`,server:`查询参数的外键无对应的rule`}},
        searchParamsFKFiledValueCantEmpty:{rc:69638,msg:{client:`查询参数格式不正确`,server:`查询参数的外键字段（的查询参数）不能为空`}},
        //search->validateSingleSearchParamsFormat
        singleSearchParamsValueMustBeArray:{rc:69640,msg:{client:`查询参数格式不正确`,server:`查询参数的字段（的搜索值）必须是数组`}},
        singleSearchParamsValueCantEmpty:{rc:69642,msg:{client:`查询参数格式不正确`,server:`查询参数的字段（的搜索值）不能为空数组`}},
        singleSearchParamsValueLengthExceed:{rc:69644,msg:{client:`查询参数数量过多`,server:`查询参数的键值中的值数量过多`}},
        singleSearchParamsElementMustBeObject:{rc:69646,msg:{client:`查询字符不正确`,server:`查询参数的键值中的单个查询条件必须是对象`}},
        singleSearchParamsElementKeysLengthExceed:{rc:69648,msg:{client:`查询字符不正确`,server:`查询参数的键值中的查询元素的键数量超出`}},//一般是value和compOp
        singleSearchParamsElementMissKeyValue:{rc:69650,msg:{client:`查询字符格式不正确`,server:`查询参数中，字段类型为数字或者日期，必须包含value`}},
        singleSearchParamsElementMissKeyCompOp:{rc:69652,msg:{client:`查询字符格式不正确`,server:`查询参数中，字段类型为数字或者日期，必须包含操作符`}},
        singleSearchParamsElementCompOpWrong:{rc:69654,msg:{client:`查询字符格式不正确`,server:`查询参数中，操作符不是预定义的符号之一`}},








        inputSearchValueElementCanNotEmpty:{rc:69656,msg:{client:`查询字符不能为空`,server:`查询参数的键值中的查询字符不能为空`}},

        inputSearchNotObject:{rc:69500,msg:{client:`查询参数格式不正确`,server:`查询参数必须是对象`}},
        //inputSearchCanNotEmpty:,
        //inputSearchNotContainCurrentPage:{rc:69504,msg:{client:`查询参数格式不正确`,server:`查询参数缺少currentPage`}},
        //inputSearchCurrentPageMustBeInt:{rc:69506,msg:{client:`查询参数格式不正确`,server:`查询参数中currentPage必须是整数`}},
        //inputSearchNotContainSearchParams:{rc:69508,msg:{client:`查询参数格式不正确`,server:`查询参数缺少searchParams`}},
        //inputSearchSearchParamsMustBeObject:{rc:69510,msg:{client:`查询参数格式不正确`,server:`查询参数中searchParams必须是对象`}},








        inputSearchValueElementKeyNotDefined:{rc:69528,msg:{client:`查询字符不正确`,server:`查询参数的键值中的key没有在fkAdditionalConfig中定义`}},


        inputSearchValueElementMustBeStringNumberDate:{rc:69534,msg:{client:`查询字符不正确`,server:`查询参数中非外键的键值值，其中每个元素必须是字符数字日期`}},
        //inputSearchValueElementSpecialTypeShouldBeObject:{rc:69517,msg:{client:`查询字符格式不正确`,server:`查询参数为数字日期，值应该为对象`}},
        inputSearchValueElementStringCantBeObject:{rc:69536,msg:{client:`查询字符格式不正确`,server:`查询参数的键值中的查询字符必须是对象`}},


        inputSearchValueElementCantContainCompOp:{rc:69544,msg:{client:`查询字符格式不正确`,server:`查询参数中，字段类型为字符，不能为对象`}},

        // unknownDataType:{rc:69700,msg:'未知数据类型'},
        //illegalField:function(fieldName){return {rc:69702,msg:`字段${fieldName}非法`}},








        // inputValuesParseFail:{rc:69720,msg:{client:'参数格式不正确',server:'参数无法解析成JSON'}},

        //inputValuesFiledValueNotSet:{rc:69723,msg:{client:'参数格式不正确',server:'参数中字段的value没有定义'}},




        deleteFormatWrong:{rc:69728,msg:{client:"格式不正确，无法删除失败",server:"删除的参数必须在URL中"}},
    },
    validateValue:{
        //validateCreateUpdateInputValue
        CUObjectIdEmpty:{rc:69700,msg:'objectId不能为空'},
        CUObjectIdWrong:{rc:69702,msg:'objectId的格式不正确'},
        CUValueNotDefineWithRequireTrue:{rc:69704,msg:'待检测的输入值未定义，而rule中require为true'},
        CUTypeWrong:{rc:69706,msg:'类型不正确'},
        STypeWrong:{rc:69708,msg:'类型不正确'},
    }
}

module.exports={
    validateError,

}