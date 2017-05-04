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
        valuesNotExist:{rc:69600,msg:'输入值为空'},
        /*              checkInput              */
        //CUD总结构
        // CUDValuesTypeWrong:{rc:69600,msg:{client:'参数格式不正确',server:'参数类型不正确，必须是JSON'}},
        // CUDValuesFormatMissRecorderInfo:{rc:69602,msg:{client:'参数格式不正确',server:'参数格式不正确，必须必须包含recorderInfo'}},
        // CUDValuesRecorderInfoMustBeObject:{rc:69604,msg:{client:'参数格式不正确',server:'参数格式不正确，recorderInfo必须是对象'}},
        // CUDValuesFormatMisCurrentPage:{rc:69606,msg:{client:'参数格式不正确',server:'参数格式不正确，必须必须包含currentPage'}},
        // CUDValuesCurrentPageMustBeInt:{rc:69608,msg:{client:'参数格式不正确',server:'参数格式不正确，currentPage必须是整数'}},
        //recorderInfo(独立的部分，可以在CDU中进行检查)
        recorderInfoCantEmpty:{rc:69601,msg:'待检测的输入值不能为空'},
        recorderInfoFieldNumExceed:{rc:69602,msg:{client:'参数格式不正确',server:'参数中的字段数量超出定义的数量'}},//inputValue中的字段数量超出rule中定义的字段数量
        recorderInfoFormatWrong:{rc:69604,msg:{client:'参数格式不正确',server:'字段的值必须是object'}},
        recorderInfoFieldValueFiledNumNot1:{rc:69606,msg:{client:'参数格式不正确',server:'字段值（object），必须只包含一个key'}},
        recorderInfoFieldValueFiledWrong:{rc:69608,msg:{client:'参数格式不正确',server:'字段值（object）的key必须是value'}}, //{field:{value;xxxx}}
        recorderInfoFiledRuleNotDefine:{rc:69610,msg:'待检测的输入值没有对应的检测规则'},
        //recorderInfoIncludeSkipFiled:{rc:69711,msg:'不能包含需要略过的字段'},
        recorderInfoHasDuplicateField:{rc:69612,msg:{client:'参数格式不正确',server:'参数中的有重复字段'}},

        filterFieldValueNotObject:{rc:69613,msg:{client:'参数格式不正确',server:'参数必须是object'}},//
        filterFieldValueFieldNumNot1:{rc:69614,msg:{client:'参数格式不正确',server:'参数中的字段数量不是1'}},//只能包含id或者_id一个field
        filterFieldValueTypeWrong:{rc:69616,msg:{client:'参数格式不正确',server:'参数中的字段的值类型不正确'}},//只能是字符/数字/对象（外键）
        filterFieldValueFieldNotInRule:{rc:69618,msg:{client:'参数格式不正确',server:'参数中的字段未在rule中定义'}},//字段名称不再rule中
        filterFieldValueFKFieldNumNot1:{rc:69620,msg:{client:'参数格式不正确',server:'外键数量不为1'}},//如果是对象，则此对象的key不是外键对应的字段
        filterFieldValueFKFieldNotFK:{rc:69621,msg:{client:'参数格式不正确',server:'非外键'}},//value是object，但是其中的key不在fkConfig
        filterFieldValueFKFieldNoRelateField:{rc:69622,msg:{client:'参数格式不正确',server:'外键的定义不正确'}},//如果是对象，则此对象的key不是外键对应的字段
        // delRecorderInfoFieldNumNot1:{rc:69614,msg:{client:'参数格式不正确',server:'参数中的字段数量不是1'}},//只能包含id或者_id一个field
        // delRecorderInfoFieldNameWrong:{rc:69616,msg:{client:'参数格式不正确',server:'参数中的字段必须是id或者_id'}},
        // delRecorderInfoFormatWrong:{rc:69618,msg:{client:'参数格式不正确',server:'参数中的字段的值必须是object'}},
        // delRecorderInfoFieldValueFiledNumNot1:{rc:69620,msg:{client:'参数格式不正确',server:'字段值（object），必须只包含一个key'}},
        // delRecorderInfoFieldValueFiledWrong:{rc:69624,msg:{client:'参数格式不正确',server:'字段值（object）的key必须是value'}}, //{field:{value;xxxx}}
        //
        // delRecorderInfoFiledRuleNotDefine:{rc:69626,msg:'待检测的输入值没有对应的检测规则'},//预留，一般delete只有一个id

        //search(read)总结构
        // SValuesTypeWrong:{rc:69620,msg:{client:'参数格式不正确',server:'参数类型不正确，必须是JSON'}},
        // SValuesFormatMissSearchParams:{rc:69622,msg:{client:'参数格式不正确',server:'参数格式不正确，必须必须包含SearchParams'}},
        // SValuesSearchParamsMustBeObject:{rc:69624,msg:{client:'参数格式不正确',server:'参数格式不正确，SearchParams必须是对象'}},
        // SValuesFormatMisCurrentPage:{rc:69626,msg:{client:'参数格式不正确',server:'参数格式不正确，必须必须包含currentPage'}},
        // SValuesCurrentPageMustBeInt:{rc:69628,msg:{client:'参数格式不正确',server:'参数格式不正确，currentPage必须是整数'}},

        //searchParams(独立的部分，可以在S中进行检查)
        searchParamsCantEmpty:{rc:69630,msg:{client:`查询参数格式不正确`,server:`查询参数不能为空对象`}},
        searchParamsFieldsExceed:{rc:69731,msg:'值的字段数过大'},//输入值的字段数超过rule中定义的字段数
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
        singleSearchParamsElementContainUnexpectKey:{rc:69649,msg:{client:`查询字符格式不正确`,server:`查询参数中，查询元素的键不是预定的`}},
        singleSearchParamsElementMissKeyValue:{rc:69650,msg:{client:`查询字符格式不正确`,server:`查询参数中，必须包含value`}},
        singleSearchParamsElementMissKeyCompOp:{rc:69652,msg:{client:`查询字符格式不正确`,server:`查询参数中，字段类型为数字或者日期，必须包含操作符`}},
        singleSearchParamsElementCantContainCompOp:{rc:69653,msg:{client:`查询字符格式不正确`,server:`查询参数中，字段类型非数字或者日期，不能包含操作符`}},
        singleSearchParamsElementCompOpWrong:{rc:69654,msg:{client:`查询字符格式不正确`,server:`查询参数中，操作符不是预定义的符号之一`}},


        //static（总结构）
        staticValuesTypeWrong:{rc:69660,msg:{client:'参数格式不正确',server:'参数类型不正确，必须是JSON'}},
        staticValuesFormatMissSearchParams:{rc:69662,msg:{client:'参数格式不正确',server:'参数格式不正确，必须必须包含SearchParams'}},
        staticValuesSearchParamsMustBeObject:{rc:69664,msg:{client:'参数格式不正确',server:'参数格式不正确，SearchParams必须是对象'}},
        staticFormatMisCurrentPage:{rc:69666,msg:{client:'参数格式不正确',server:'参数格式不正确，必须必须包含currentPage'}},
        staticCurrentPageMustBeInt:{rc:69668,msg:{client:'参数格式不正确',server:'参数格式不正确，currentPage必须是整数'}},
        //static->searchParams format check
        staticSearchParamsFieldNoRelatedRule:{rc:69670,msg:{client:`查询字符不正确`,server:`查询参数的键无对应的rule`}},
        staticSearchParamsFiledValueCantEmpty:{rc:69672,msg:{client:`查询参数格式不正确`,server:`查询参数的普通字段（的查询参数）不能为空`}},

        //inputValue part：post的输入中，是否包含且只包含指定的部分（例如searchParsm）
        inputValuePartFormatWrong:{rc:69680,msg:{client:`输入参数格式不正确`,server:`输入参数必须是对象`}},
        inputValuePartNotExcepted:{rc:69682,msg:{client:`输入参数格式不正确`,server:`输入参数中，期望的参数未定义`}},
        inputValuePartNumNotExcepted:{rc:69684,msg:{client:`输入参数格式不正确`,server:`输入参数中，期望的参数数量不正确`}},
        inputValuePartMiss:{rc:69686,msg:{client:`输入参数格式不正确`,server:`输入参数中，某个参数并非期望的参数`}},
        inputValuePartSearchParamsValueFormatWrong:{rc:69688,msg:{client:`输入参数格式不正确`,server:`输入参数中，searchParams的值必须为object`}},
        inputValuePartRecorderInfoValueFormatWrong:{rc:69690,msg:{client:`输入参数格式不正确`,server:`输入参数中，RecorderInfo的值必须为object`}},
        inputValuePartCurrentPageValueFormatWrong:{rc:69692,msg:{client:`输入参数格式不正确`,server:`输入参数中，currentPage的值必须为整数`}},
        inputValuePartCurrentCollValueFormatWrong:{rc:69694,msg:{client:`输入参数格式不正确`,server:`输入参数中，currentColl的值必须为字符串`}},
        inputValuePartRecorderIdValueFormatWrong:{rc:69695,msg:{client:`输入参数格式不正确`,server:`输入参数中，RecorderId的值必须为字符`}},
        inputValuePartUndefinedPart:{rc:69696,msg:{client:`输入参数格式不正确`,server:`输入参数中，part未定义`}},
/*        inputValuePartSearchParamsMiss:{rc:69688,msg:{client:`输入参数格式不正确`,server:`输入参数中，searchParams不存在`}},
        inputValuePartRecorderInfoMiss:{rc:69690,msg:{client:`输入参数格式不正确`,server:`输入参数中，RecorderInfo不存在`}},
        inputValuePartCurrentPageMiss:{rc:69692,msg:{client:`输入参数格式不正确`,server:`输入参数中，currentPage不存在`}},
        inputValuePartCurrentCollMiss:{rc:69694,msg:{client:`输入参数格式不正确`,server:`输入参数中，currentColl不存在`}},*/



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




        // deleteFormatWrong:{rc:69728,msg:{client:"格式不正确，无法删除失败",server:"删除的参数必须在URL中"}},
    },
    validateValue:{
        //validateCreateUpdateInputValue
        // CUDFieldsZero:{rc:69700,msg:'字段的数量不能为空'}, //放入validateFormat
        CUDObjectIdEmpty:{rc:69701,msg:'objectId不能为空'},
        CUDObjectIdWrong:{rc:69702,msg:'objectId的格式不正确'},
        // inputValueFilesExceed:{rc:69703,msg:'值的字段数过大'},//输入值的字段数超过rule中定义的字段数
        mandatoryFieldMiss(fieldName){
            return {rc:69704,msg:`缺少必填字段${fieldName}`}//create的时候，某些必填字段没有填入
        },
/*        unexceptInputField(fieldName){
            return {rc:69705,msg:`未知字段${fieldName}`}//inputValue中的字段，没有在inputRule中定义（即client试图传入db中没有的字段）
        },*/
        // CUDValueNotDefineWithRequireTrue:{rc:69704,msg:'待检测的输入值未定义，而rule中require为true'},
        CUDTypeWrong:{rc:69706,msg:'类型不正确'},



        SValueEmpty:{rc:69714,msg:'查询值为空'},
        STypeWrong:{rc:69716,msg:'类型不正确'},
        // SRangeOutRange:{rc:69718,msg:'查询值超出范围'},
        filterFieldValueOutRange:{rc:69718,msg:'查询值超出范围'},//超出min/max/MaxLength，则可以skip查询过程，直接放回空数组给client
        /*      delete          */
        // deleteValueFieldNumWrong:{rc:69720,msg:'输入键值数量不正确'},
        // deleteValueFieldNameWrong:{rc:69722,msg:'输入键值名称不正确'},
        //deleteValueFieldValueWrong:{rc:69710,msg:'输入键值不正确'},//必须是mongodb objectid
        /*          static          */
        staticTypeWrong:{rc:69730,msg:'类型不正确'},

        /*          currentColl         */
        undefinedCurrentColl:{rc:69740,msg:'未定义的coll'},
        /*          currentPage         */
        invalidCurrentPage:{rc:69750,msg:'页码超出范围'},

        //
        unknownRuleType:{rc:69716,msg:'未知rule类型'},
    }
}

module.exports={
    validateError,

}