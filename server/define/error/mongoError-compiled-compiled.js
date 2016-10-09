'use strict';

var _slicedToArray = function () {
    function sliceIterator(arr, i) {
        var _arr = [];var _n = true;var _d = false;var _e = undefined;try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;_e = err;
        } finally {
            try {
                if (!_n && _i["return"]) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }return _arr;
    }return function (arr, i) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
}();

/**
 * Created by wzhan039 on 2016-10-04.
 *
 * 定义mogoose操作错误
 */

//用来或侧chineseName，以便返回错误给client
var inputRule = require('../validateRule/inputRule').inputRule;

/*
* mongoose操作错误（不包含validator的错误？？）
* err:mongo返回的错误
* fieldName：如果是validto人返回的错误，需要fieldName来获得err中的errormsg
* */
var mongooseErrorHandler = function mongooseErrorHandler(err) {
    //普通mongo错误
    if (err.code) {
        switch (err.code) {
            case 11000:
                return errorDefine.common.duplicate(err.errmsg);
            default:
                return errorDefine.common.unknownErrorType(err);
        }
    }
    //mongo validator错误。将错误 "错误代码20046:父类别不能为空" 转换成{rc:20046,msg:‘父类别不能为空’}
    if (err.errors) {
        for (var single in err.errors) {
            if (err.errors[single]['message']) {
                var rc = {};
                var tmp = err.errors[single]['message'].split(':');
                var regResultTmp = tmp[0].match(/.+(\d{5})/);
                var returnCode = regResultTmp[1];
                rc['rc'] = returnCode;
                rc['msg'] = tmp[1];
                return rc;
            }
        }
        //return err['errors'][fieldName]['message']
    }
};

//常见错误
var errorDefine = {
    common: {
        unknownErrorType: function unknownErrorType(err) {
            return { rc: 30000, msg: { client: '未知数据操作错误', server: '' + JSON.stringify(err) } };
        },
        duplicate: function duplicate(errmsg) {
            //'E11000 duplicate key error index: finance.billtypes.$name_1 dup key: { : \"aa\" }'=======>finance  billType   name
            var regex = /.*error\s+index:(.*)\s+dup.+/;
            var match = errmsg.match(regex);
            var matchResult = match[1];
            var tmp = matchResult.split('.');
            var _tmp = tmp;

            var _tmp2 = _slicedToArray(_tmp, 3);

            var db = _tmp2[0];
            var coll = _tmp2[1];
            var field = _tmp2[2];
            //mongoose自动将coll的名称加上s，为了和inputRule匹配，删除s
            //let trueCollName

            if ('s' === coll[coll.length - 1]) {
                coll = coll.substring(0, coll.length - 1);
            }

            var fieldRegex = /\$(\w+)_.*/;
            tmp = field.match(fieldRegex);
            field = tmp[1];

            //mongoose 自动将coll的名称改成全小写
            var chineseName = void 0;
            for (var singleColl in inputRule) {
                if (singleColl.toLowerCase() === coll) {
                    chineseName = inputRule[singleColl][field]['chineseName'];
                }
            }

            return { rc: 30002, msg: { client: chineseName + '的值已经存在', server: '集合' + coll + '的字段' + field + '的值重复' } };
        }
    }
};

module.exports = {
    mongooseErrorHandler: mongooseErrorHandler,
    errorDefine: errorDefine
};

//# sourceMappingURL=mongoError-compiled.js.map

//# sourceMappingURL=mongoError-compiled-compiled.js.map