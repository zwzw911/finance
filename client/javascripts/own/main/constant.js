/**
 * Created by ada on 2016/9/5.
 * 由/maintain/developer_helper。js产生inputRule和inputAttr
 */
var app=angular.module('contDefine',[])
app.constant('cont',{

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
                    "define": true,
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
                    "define": true,
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
            "parentBillType": {
                "require": {
                    "define": true,
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
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": false,
                "isCRUDAutoComplete": false,
                "autoCompleteCollField": "",
                "suggestList": [],
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "用户名",
                "errorMsg": "",
                "validated": "undefined"
            },
            "password": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": false,
                "isCRUDAutoComplete": false,
                "autoCompleteCollField": "",
                "suggestList": [],
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "密码",
                "errorMsg": "",
                "validated": "undefined"
            }
        },
        "department": {
            "name": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": true,
                "isCRUDAutoComplete": false,
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
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": true,
                "isCRUDAutoComplete": true, //在CRUD时，是否enable AC
                "autoCompleteCollField":'department.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
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
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true
                "isCRUDAutoComplete": false, //在CRUD时，是否enable AC
                "autoCompleteCollField":'employee.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "员工姓名",
                "errorMsg": "",
                "validated": "undefined"
            },
            "leader": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true
                "isCRUDAutoComplete": true, //在CRUD时，是否enable AC
                "autoCompleteCollField":'employee.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "上级主管",
                "errorMsg": "",
                "validated": "undefined"
            },
            "gender": {
                "value": "",
                "originalValue": "",
                isSelect:true,
                selectOption:[{key:'male',value:'男'},{key:'female',value:'女'}],
                "isQueryAutoComplete": false,
                "isCRUDAutoComplete": false,
                "autoCompleteCollField": "",
                "suggestList": [],
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "性别",
                "errorMsg": "",
                "validated": "undefined"
            },
            "birthDay": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": false,
                "isCRUDAutoComplete": false,
                "autoCompleteCollField": "",
                "suggestList": [],
                "blur": false,
                "focus": true,
                "inputDataType": "date",
                "inputIcon": "",
                "chineseName": "出生日期",
                "errorMsg": "",
                "validated": "undefined"
            },
            "department": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": true,//在选择查询字段时，是否enable AC，一般为true
                "isCRUDAutoComplete": true, //在CRUD时，是否enable AC
                "autoCompleteCollField":'department.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "所属部门",
                "errorMsg": "",
                "validated": "undefined"
            },
            "onBoardDate": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": false, //在选择查询字段时，是否enable AC，一般为true
                "isCRUDAutoComplete": false, //在CRUD时，是否enable AC
                "autoCompleteCollField":'',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
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
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true
                "isCRUDAutoComplete": false, //在CRUD时，是否enable AC
                "autoCompleteCollField":'billType.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "单据类别",
                "errorMsg": "",
                "validated": "undefined"
            },
            "parentBillType": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true
                "isCRUDAutoComplete": true, //在CRUD时，是否enable AC
                "autoCompleteCollField":'billType.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
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
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": true,
                "isCRUDAutoComplete": false, //在CRUD时，是否enable AC
                "autoCompleteCollField":'bill.title',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "单据抬头",
                "errorMsg": "",
                "validated": "undefined"
            },
            "content": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": true,
                "isCRUDAutoComplete": false, //在CRUD时，是否enable AC
                "autoCompleteCollField":'bill.content',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "单据内容",
                "errorMsg": "",
                "validated": "undefined"
            },
            "billType": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true,
                "isCRUDAutoComplete": true, //在CRUD时，是否enable AC
                "autoCompleteCollField":'billType.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "单据类别",
                "errorMsg": "",
                "validated": "undefined"
            },
            "billDate": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": false,
                "isCRUDAutoComplete": false, //在CRUD时，是否enable AC
                "autoCompleteCollField":'',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "date",
                "inputIcon": "",
                "chineseName": "单据日期",
                "errorMsg": "",
                "validated": "undefined"
            },
            "amount": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
                "isQueryAutoComplete": false,
                "isCRUDAutoComplete": false, //在CRUD时，是否enable AC
                "autoCompleteCollField":'',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "报销金额",
                "errorMsg": "",
                "validated": "undefined"
            },
            "reimburser": {
                "value": "",
                "originalValue": "",
                "isSelect": false,
                "selectOption": [],
		        "isQueryAutoComplete": true, //在选择查询字段时，是否enable AC，一般为true
                "isCRUDAutoComplete": true, //在CRUD时，是否enable AC
                "autoCompleteCollField":'employee.name',//AC从何处获得数据
                "suggestList": {},//使用autoComplete提供数据，在controller中初始化
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "报销员工",
                "errorMsg": "",
                "validated": "undefined"
            }
        }
    },
    
    //用来给查询字段select提供option，详见angularjs。md
    queryField:{
        "user": [
            {
                "value": "用户名",
                "key": "name"
            },
            {
                "value": "密码",
                "key": "password"
            }
        ],
        "department": [
            {
                "value": "部门名称",
                "key": "name"
            },
            {
                "value": "上级部门",
                "key": "parentDepartment"
            }
        ],
        "employee": [
            {
                "value": "员工姓名",
                "key": "name"
            },
            {
                "value": "上级主管",
                "key": "leader"
            },
            {
                "value": "性别",
                "key": "gender"
            },
            {
                "value": "出生日期",
                "key": "birthDay"
            },
            {
                "value": "所属部门",
                "key": "department"
            },
            {
                "value": "入职日期",
                "key": "onBoardDate"
            }
        ],
        "billType": [
            {
                "value": "单据类别",
                "key": "name"
            },
            {
                "value": "父类别",
                "key": "parentBillType"
            }
        ],
        "bill": [
            {
                "value": "单据抬头",
                "key": "title"
            },
            {
                "value": "单据内容",
                "key": "content"
            },
            {
                "value": "单据类别",
                "key": "billType"
            },
            {
                "value": "单据日期",
                "key": "billDate"
            },
            {
                "value": "报销金额",
                "key": "amount"
            },
            {
                "value": "报销员工",
                "key": "reimburser"
            }
        ]
    },




})

app.constant('contEnum',{
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
})