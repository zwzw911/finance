'use strict';

/**
 * Created by wzhan039 on 2016-03-03.
 * 对浏览器传入的数据的检测定义
 */

var regex = require('../regex/regex').regex;

var inputDataType = require('../enum/validEnum').enum.dataType;
/*********************************************/
/* input定义，理论上应该定义单独文件中       */
/*********************************************/
//在server端，定义和属性放在一起（属性没几个）
//chineseName和type为必需。 type:输入数据的类型，string、int、date、boolean。array，object，默认是string
//结构按照mongoDB的collection进行划分，因为input的数据最终还是要存入db

//mongodb的validate error是client input validate的一个子集
//只需要error定义，input value的msg是由validate函数自动产生的；
//每个rule都有对应的mongo error，但是具体是否使用，在mongoValidate中定义
//
var inputRule = {
    department: { //名称必须和mongo中的一致
        name: {
            chineseName: '部门名称',
            type: inputDataType.string,
            require: { define: true, error: { rc: 10000 }, mongoError: { rc: 20000, msg: '部门名称不能为空' } }, //mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
            minLength: { define: 2, error: { rc: 10002 }, mongoError: { rc: 20002, msg: '部门名称至少2个字符' } },
            maxLength: { define: 10, error: { rc: 10004 }, mongoError: { rc: 20004, msg: '部门名称的长度不能超过10个字符' } }
        },
        parentDepartment: {
            chineseName: '上级部门',
            type: inputDataType.string,
            require: { define: false, error: { rc: 10006 }, mongoError: { rc: 20006, msg: '上级部门不能为空' } },
            format: { define: regex.objectId, error: { rc: 10008 }, mongoError: { rc: 20008, msg: '上级部门的id格式不正确' } } },
        cDate: {
            chineseName: '创建日期',
            type: inputDataType.date,
            require: { define: true, error: { rc: 10010 }, mongoError: { rc: 20010, msg: '创建日期不能为空' } }
        },
        uDate: {
            chineseName: '修改日期',
            type: inputDataType.date,
            require: { define: true, error: { rc: 10012 }, mongoError: { rc: 20012, msg: '修改日期不能为空' } }
        },
        dDate: {
            chineseName: '删除日期',
            type: inputDataType.date,
            require: { define: false, error: { rc: 10014 }, mongoError: { rc: 20014, msg: '删除日期不能为空' } }
        }
    },
    employee: {
        name: {
            chineseName: '员工姓名',
            type: inputDataType.string,
            require: { define: true, error: { rc: 10020 }, mongoError: { rc: 20020, msg: '员工姓名不能为空' } },
            format: { define: regex.userName, error: { rc: 10022 }, mongoError: { rc: 20022, msg: '员工姓名必须由2-20个字符组成' } }
            /*            minLength:{define:2,error:{rc:10022},mongoError:{rc:20022}},
                        maxLength:{define:4,error:{rc:10024},mongoError:{rc:20024}},*/
        },
        leader: {
            chineseName: '上级主管',
            type: inputDataType.string,
            require: { define: false, error: { rc: 10024 }, mongoError: { rc: 20024, msg: '员工姓名不能为空' } },
            format: { define: regex.objectId, error: { rc: 10026 }, mongoError: { rc: 20026, msg: '所属部门的id格式不正确' } }
        },
        department: {
            chineseName: '所属部门',
            type: inputDataType.string,
            require: { define: true, error: { rc: 10030 }, mongoError: { rc: 20030, msg: '所属部门不能为空' } },
            format: { define: regex.objectId, error: { rc: 10032 }, mongoError: { rc: 20032, msg: '所属部门的id格式不正确' } } },
        onBoardDate: {
            chineseName: '入职日期',
            type: inputDataType.date,
            require: { define: false, error: { rc: 10036 }, mongoError: { rc: 20036, msg: '入职日期不能为空' } }
        },
        cDate: {
            chineseName: '创建日期',
            type: inputDataType.date,
            require: { define: true, error: { rc: 10038 }, mongoError: { rc: 20038, msg: '创建日期不能为空' } }
        },
        uDate: {
            chineseName: '修改日期',
            type: inputDataType.date,
            require: { define: true, error: { rc: 10039 }, mongoError: { rc: 20039, msg: '修改日期不能为空' } }
        },
        dDate: {
            chineseName: '删除日期',
            type: inputDataType.date,
            require: { define: false, error: { rc: 10040 }, mongoError: { rc: 20040, msg: '删除日期不能为空' } }
        }
    },
    billType: {
        name: {
            chineseName: '单据类别',
            type: inputDataType.string,
            require: { define: true, error: { rc: 10041 }, mongoError: { rc: 20041, msg: '单据类别不能为空' } },
            minLength: { define: 2, error: { rc: 10042 }, mongoError: { rc: 20042, msg: '单据类别至少2个字符' } },
            maxLength: { define: 40, error: { rc: 10044 }, mongoError: { rc: 20044, msg: '单据类别的长度不能超过40个字符' } }
        },
        parentBillType: {
            chineseName: '父类别',
            type: inputDataType.string,
            require: { define: true, error: { rc: 10046 }, mongoError: { rc: 20046, msg: '父类别不能为空' } },
            format: { define: regex.objectId, error: { rc: 10048 }, mongoError: { rc: 20048, msg: '父类别的id格式不正确' } } },
        cDate: {
            chineseName: '创建日期',
            type: inputDataType.date,
            require: { define: true, error: { rc: 10050 }, mongoError: { rc: 20050, msg: '创建日期不能为空' } }
        },
        uDate: {
            chineseName: '修改日期',
            type: inputDataType.date,
            require: { define: true, error: { rc: 10052 }, mongoError: { rc: 20052, msg: '修改日期不能为空' } }
        },
        dDate: {
            chineseName: '删除日期',
            type: inputDataType.date,
            require: { define: false, error: { rc: 10054 }, mongoError: { rc: 20054, msg: '删除日期不能为空' } }
        }
    },
    bill: {
        title: {
            chineseName: '单据抬头',
            type: inputDataType.string,
            require: { define: false, error: { rc: 10060 }, mongoError: { rc: 20060, msg: '单据抬头不能为空' } },
            minLength: { define: 2, error: { rc: 10062 }, mongoError: { rc: 20062, msg: '单据抬头至少2个字符' } },
            maxLength: { define: 20, error: { rc: 10064 }, mongoError: { rc: 20064, msg: '单据抬头的长度不能超过20个字符' } }
        },
        content: {
            chineseName: '单据内容',
            type: inputDataType.string,
            require: { define: false, error: { rc: 10066 }, mongoError: { rc: 20066, msg: '单据内容不能为空' } },
            minLength: { define: 2, error: { rc: 10068 }, mongoError: { rc: 20068, msg: '单据内容至少2个字符' } },
            maxLength: { define: 60, error: { rc: 10070 }, mongoError: { rc: 20070, msg: '单据内容的长度不能超过60个字符' } }
        },
        billType: {
            chineseName: '单据类别',
            type: inputDataType.string,
            require: { define: false, error: { rc: 10072 }, mongoError: { rc: 20072, msg: '单据类别不能为空' } },
            format: { define: regex.objectId, error: { rc: 10074 }, mongoError: { rc: 20074, msg: '单据类别的id格式不正确' } } },
        billDate: {
            chineseName: '单据日期',
            type: inputDataType.date,
            require: { define: false, error: { rc: 10076 }, mongoError: { rc: 20076, msg: '单据日期不能为空' } }
        },
        amount: {
            chineseName: '报销金额',
            type: inputDataType.float,
            require: { define: true, error: { rc: 10078 }, mongoError: { rc: 20078, msg: '报销金额不能为空' } },
            min: { define: 0, error: { rc: 10080 }, mongoError: { rc: 20080, msg: '报销金额不能小于0元' } },
            max: { define: 100000, error: { rc: 10082 }, mongoError: { rc: 20082, msg: '报销金额不能大于100000元' } }
        },
        reimburser: {
            chineseName: '报销员工',
            type: inputDataType.string,
            require: { define: true, error: { rc: 10884 }, mongoError: { rc: 20084, msg: '报销员工不能为空' } },
            format: { define: regex.objectId, error: { rc: 10086 }, mongoError: { rc: 20086, msg: '报销员工的id格式不正确' } } },

        cDate: {
            chineseName: '创建日期',
            type: inputDataType.date,
            require: { define: true, error: { rc: 10090 }, mongoError: { rc: 20090, msg: '创建日期不能为空' } }
        },
        uDate: {
            chineseName: '修改日期',
            type: inputDataType.date,
            require: { define: true, error: { rc: 10092 }, mongoError: { rc: 20092, msg: '修改日期不能为空' } }
        },
        dDate: {
            chineseName: '删除日期',
            type: inputDataType.date,
            require: { define: false, error: { rc: 10094 }, mongoError: { rc: 20094, msg: '删除日期不能为空' } }
        }
    }
};

module.exports = {
    inputRule: inputRule
};
/*var inputRuleDefine={
    user:{
        userName:{
            chineseName: '用户名',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10000}},
            //使用min/maxLength即可，不用正则，节省cpu
            minLength: {define: 2, error: {rc: 10002}},
            maxLength: {define: 40, error: {rc: 10004}}
            //format:{define:regex.userName,error:{rc:10006}}
        },
        password:{
            chineseName: '密码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10010}},
            //直接使用regex。同时判断类型和长度范围
            format: {define: regex.loosePassword, error: {rc: 10012}}
        },
        //由password派生出来
        encryptedPassword:{
            chineseName: '加密密码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10014}},
            //直接使用regex。同时判断类型和长度范围
            format: {define: regex.encryptedPassword, error: {rc: 10016}}
        },
        //只是为了显示不同的chineseName
        oldPassword:{
            chineseName: '旧密码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10017}},
            //直接使用regex。同时判断类型和长度范围
            format: {define: regex.loosePassword, error: {rc: 10018}}
        },
        rePassword:{
            chineseName: '再次输入密码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10019}},
            //直接使用regex。同时判断类型和长度范围
            format: {define: regex.loosePassword, error: {rc: 10020}}
        },
        mobilePhone:{
            chineseName: '手机号',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10030}},
            //直接使用regex。同时判断类型和长度范围
            format: {define: regex.mobilePhone, error: {rc: 10032}}
        },
        captcha:{
            chineseName: '验证码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10022}},
            exactLength:{define: 4, error: {rc: 10024}}
        },
        originalThumbnailName:{
            chineseName: '头像',
            type:inputDataType.file,
            require: {define: true, error: {rc: 10030}},
            format:{define: regex.originalThumbnail, error: {rc: 10032}}
        },
        hashedThumbnailName:{
            chineseName: '头像',
            type:inputDataType.file,
            require: {define: true, error: {rc: 10040}},
            format:{define: regex.hashedThumbnail, error: {rc: 10042}}
        }
    },

    adminLogin: {
        userName: {
            chineseName: '用户名',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10100}},
            minLength: {define: 2, error: {rc: 10102}},
            maxLength: {define: 40, error: {rc: 10104}}
        },
        password: {
            chineseName: '密码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10110}},
            //minLength:{define:2,error:{rc:9006}},
            //maxLength:{define:20,error:{rc:9008}},
            format: {define: regex.strictPassword, error: {rc: 10112}}
        },
        captcha:{
            chineseName: '验证码',
            type:inputDataType.string,
            require: {define: true, error: {rc: 10120}},
            exactLength:{define: 4, error: {rc: 10122}}
        },
    }
}*/

// exports.inputRuleDefine=inputRuleDefine

//# sourceMappingURL=inputRule-compiled.js.map

//# sourceMappingURL=inputRule-compiled-compiled.js.map