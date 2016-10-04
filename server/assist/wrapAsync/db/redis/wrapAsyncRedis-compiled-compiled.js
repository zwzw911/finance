/**
 * Created by wzhan039 on 2016-07-29.
 */
/*
* ioredis的方法本身已经支持返回Promise，理论上可以直接使用await，但是现在需要格式化返回的结果，所以采用ioredis的callback方式，自己包装成Pormise的格式
* error：转换成{rc:xxx,msg}     result: {rc:0,msg：null}
*
* */

/*
* ioredis中，获得数据没有回调（set/hset等）
* */
'use strict';

var ioredisClient = require('../../../../model/redis/connection/redis_connection').ioredisClient;
var redisError = require('../../../../define/error/redisError').redisError;

var rcRight = { rc: 0 };

function asyncHget(key, subKey) {
    // console.log('subkey is'+subKey)
    return new Promise(function (resolve, reject) {
        // try{
        ioredisClient.hget([key, subKey], function (err, data) {
            if (err) {
                reject(redisError.cmdError.hgetError);
            } else {
                // console.log(data)
                rcRight.msg = data;
                resolve(rcRight);
            }
        });
        /*        }catch(e){
                    reject('hget fail')
                }*/
    });
}

function asyncHexists(key, subKey) {
    return new Promise(function (resolve, reject) {
        // try{
        // reject('test')
        ioredisClient.hexists([key, subKey], function (err, data) {
            if (err) {
                reject(redisError.cmdError.existsFail);
            } else {
                rcRight.msg = data;
                resolve(rcRight);
            }
        });
        /*        }
                catch(e){
                    reject(redisError.general.hexistsFail)
                }*/
    });
}

module.exports = {
    asyncHget: asyncHget,
    asyncHexists: asyncHexists
};

//# sourceMappingURL=wrapAsyncRedis-compiled.js.map

//# sourceMappingURL=wrapAsyncRedis-compiled-compiled.js.map