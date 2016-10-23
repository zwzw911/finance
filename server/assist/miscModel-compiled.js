/**
 * Created by Ada on 2016/10/22.
 */
'use strict';

require("babel-polyfill");
require("babel-core/register");

var mongooseErrorHandler = require('../define/error/mongoError').mongooseErrorHandler;
//检测populateFields的字段是否有值，有进行populate，否则直接返回原始doc
var populateSingleDoc = function populateSingleDoc(singleDoc, populateOpt, populatedFields) {
    return new Promise(function (resolve, reject) {
        var populateFlag = false;
        // let createdResult=singleDoc
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = populatedFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var singlePopulatedField = _step.value;

                if (singleDoc[singlePopulatedField]) {
                    populateFlag = true;
                    break;
                }
            }
            // console.log(`department insert result is ${JSON.stringify(result)}`)
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        if (populateFlag) {
            singleDoc.populate(populateOpt, function (populateErr, populateResult) {
                //console.log('create populate')
                if (populateErr) {
                    //console.log(`department create fail: ${JSON.stringify(populateErr)}`)
                    resolve(mongooseErrorHandler(populateErr));
                }
                resolve({ rc: 0, msg: populateResult });
            });
        } else {
            resolve({ rc: 0, msg: singleDoc });
        }
    });
};

module.exports = {
    populateSingleDoc: populateSingleDoc
};

//# sourceMappingURL=miscModel-compiled.js.map