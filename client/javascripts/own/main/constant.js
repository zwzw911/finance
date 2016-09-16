/**
 * Created by ada on 2016/9/5.
 * 由/maintain/developer_helper。js产生inputRule和inputAttr
 */
var app=angular.module('contDefine',[])
app.constant('cont',{
    //asideName:{configuration:'配置信息',bill:'单据信息'},//aside菜单名称
    //angular检查input输入的rule（由服务器端脚本根据inputRule生成：包括去除不必要字段，关联到相关字段等操作）
    inputRule:
    {
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
                }
            },
            "parentDepartment": {
                "require": {
                    "define": false,
                    "msg": "上级部门不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "部门名称所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "部门名称包含的字符数不能少于2个"
                }
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
                }
            },
            "leader": {
                "require": {
                    "define": false,
                    "msg": "上级主管不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "员工姓名所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "员工姓名包含的字符数不能少于2个"
                }
            },
            "department": {
                "require": {
                    "define": true,
                    "msg": "所属部门不能为空"
                }
            },
            "onBoardDate": {
                "require": {
                    "define": false,
                    "msg": "入职日期不能为空"
                }
            }
        },
        "billType": {
            "name": {
                "require": {
                    "define": true,
                    "msg": "单据类别不能为空"
                },
                "maxLength": {
                    "define": 4,
                    "msg": "单据类别所包含的字符数不能超过40个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "单据类别包含的字符数不能少于2个"
                }
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
                }
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
                }
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
                }
            },
            "billType": {
                "require": {
                    "define": false,
                    "msg": "单据类别不能为空"
                },
                "maxLength": {
                    "define": 40,
                    "msg": "单据类别所包含的字符数不能超过40个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "单据类别包含的字符数不能少于2个"
                }
            },
            "billDate": {
                "require": {
                    "define": false,
                    "msg": "单据日期不能为空"
                }
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
                }
            },
            "reimburser": {
                "require": {
                    "define": true,
                    "msg": "报销员工不能为空"
                },
                "maxLength": {
                    "define": 20,
                    "msg": "员工姓名所包含的字符数不能超过20个"
                },
                "minLength": {
                    "define": 2,
                    "msg": "员工姓名包含的字符数不能少于2个"
                }
            }
        }
    },


    //angularjs处理input需要使用的数据
    inputAttr:
    {
        "department": {
            "name": {
                "value": "",
                "originalValue": "",
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
                "blur": false,
                "focus": true,
                "inputDataType": "text",
                "inputIcon": "",
                "chineseName": "上级主管",
                "errorMsg": "",
                "validated": "undefined"
            },
            "department": {
                "value": "",
                "originalValue": "",
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
            "name": {
                "value": "",
                "originalValue": "",
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
    }

    
})