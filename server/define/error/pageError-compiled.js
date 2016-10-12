'use strict';

/**
 * Created by wzhan039 on 2016-10-04.
 */

module.exports = {
    //60000~60100
    common: {
        inputValuesFormatWrong: { rc: 60000, msg: { client: '参数格式不正确', server: '参数格式不正确，必须是JSON或者能够解析成json的字符串' } },
        inputValuesParseFail: { rc: 60002, msg: { client: '参数格式不正确', server: '参数无法解析成JSON' } },
        unknownColl: { rc: 60003, msg: { 'client': '数据库操作错误，请联系管理员', server: '未知的集合名' } }
    },
    //60100~60200
    billType: {
        //
    },
    //60200~60300
    department: {},
    //60300~60400
    employee: {
        departmentNotExist: { rc: 60300, msg: { client: '所选部门不存在', server: 'department id 不存在' } }
    },
    //60400~60500
    bill: {
        reimburserNotExist: { rc: 60400, msg: { client: '报销员工不存在', server: 'employee id 不存在' } },
        billTypeNotExist: { rc: 60402, msg: { client: '报销类型不存在', server: 'billType id 不存在' } }
    }
};

//# sourceMappingURL=pageError-compiled.js.map