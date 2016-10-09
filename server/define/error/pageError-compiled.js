'use strict';

/**
 * Created by wzhan039 on 2016-10-04.
 */

module.exports = {
    //60000~60100
    common: {
        inputValuesFormatWrong: { rc: 60000, msg: { client: '参数格式不正确', server: '参数格式不正确，必须是JSON或者能够解析成json的字符串' } },
        inputValuesParseFail: { rc: 60002, msg: { client: '参数格式不正确', server: '参数无法解析成JSON' } }
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
    billInfo: {}
};

//# sourceMappingURL=pageError-compiled.js.map