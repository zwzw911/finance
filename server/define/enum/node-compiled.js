/**
 * Created by zw on 2016/7/3.
 */
'use strict';

var randomStringType = {
    basic: Symbol('basic'),
    normal: Symbol('normal'),
    complicated: Symbol('complicated')
};

var userState = {
    noSess: Symbol('noSess'),
    login: Symbol('login'),
    notLogin: Symbol('not login')

};

var coll = {
    department: 'department', //不用symbol，而用字符。因为需要作为error的key使用
    employee: 'employee',
    billType: 'billType',
    bill: 'bill'
};

var env = {
    'development': Symbol('development'),
    'production': Symbol('production')
};
exports.node = {
    randomStringType: randomStringType,
    userState: userState,
    coll: coll,
    env: env
};

//# sourceMappingURL=node-compiled.js.map