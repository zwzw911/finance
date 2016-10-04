'use strict';

/**
 * Created by wzhan039 on 2016-02-14.
 */
exports.redisError = {
    LuaError: {
        LueExecFail: function LueExecFail(fileName) {
            return { rc: 50000, msg: { client: '数据库操作出错', server: '执行Lua脚本' + fileName + '出错' } };
        },
        LueParamNotObject: function LueParamNotObject(fileName) {
            return { rc: 50000, msg: { client: '参数不正确', server: 'Lua脚本' + fileName + '的参数必须为对象' } };
        }
    },
    cmdError: {
        setError: { rc: 50000, msg: { client: '保存数据出错', server: 'redis set操作失败' } },
        getError: { rc: 50002, msg: { client: '读取数据出错', server: 'redis get操作失败' } },
        hsetError: { rc: 50004, msg: { client: '保存数据出错', server: 'redis hset操作失败' } },
        hgetError: { rc: 50006, msg: { client: '读取数据出错', server: 'redis hget操作失败' } },
        keyNotExist: { rc: 50008, msg: { client: '数据不存在', server: 'redis中没有找到对应的键' } },
        existsFail: { rc: 50010, msg: { client: '查找数据命令出错', server: 'redis exist命令出错' } },
        hexistsFail: { rc: 50011, msg: { client: '查找数据命令出错', server: 'redis hexist命令出错' } },
        rpushFail: { rc: 50012, msg: { client: '添加数据输错', server: 'redis rpush命令出错' } },
        llenFail: { rc: 50014, msg: { client: '读取数据长度出错', server: 'redis llen命令出错' } },
        lindexFail: { rc: 50016, msg: { client: '读取数组某个数据出错', server: 'redis lindex命令出错' } },
        lpopFail: { rc: 50018, msg: { client: '读取最后输入的数据出错', server: 'redis lpop命令出错' } },
        ttlFail: { rc: 50020, msg: { client: '读取数据剩余时间出错', server: 'redis ttl命令出错' } },
        luaFail: { rc: 50022, msg: { client: '脚本执行失败', server: 'redis Lua脚本执行失败' } },

        shaFail: function shaFail(file) {
            return { rc: 50024, msg: { client: 'sha文件' + file + '失败', server: 'sha文件' + file + '失败' } };
        }
    },
    other: {
        notExist: function notExist(key, subKey) {
            return { rc: 50100, msg: { client: '数据不存在', server: 'redis中，' + key + ' ' + subKey + '不存在' } };
        }
    },
    captcha: {
        getError: { rc: 50100, msg: { client: '取验证码出错', server: '' } },
        saveError: { rc: 50102, msg: { client: '存验证码出错', server: '' } },
        delError: { rc: 50104, msg: { client: '除验证码出错', server: '' } },
        expire: { rc: 50106, msg: { client: '证码超时，请重新输入', server: '' } },
        notExist: { rc: 50108, msg: { client: '证码超时或者不存在' } }
    },
    adminLogin: {
        notLogin: { rc: 50200, msg: { client: '未登录', server: '' } },
        userPasswordNotExist: { rc: 50202, msg: { client: '户名密码不存在', server: '' } },
        getNameFail: { rc: 50204, msg: { client: '取用户名出错', server: '' } },
        getPasswordFail: { rc: 50206, msg: { client: '取密码出错', server: '' } }
    },
    intervalCheckBaseIP: {
        listIsEmpty: { rc: 50300, msg: { client: 'ist为空', server: '' } }
    },
    globalSetting: {
        hgetFail: { rc: 50400, msg: { client: 'get命令出错', server: '' } }
    }
};

//# sourceMappingURL=redisError-compiled.js.map