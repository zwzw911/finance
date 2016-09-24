/**
 * Created by wzhan039 on 2015-12-16.
 */
'use strict';
//var redis=require('redis');

var ioredis = require('ioredis');

var ioredisOption = {
    host: '127.0.0.1',
    port: 6379,
    family: '4', //IPv4
    db: 0
};

module.exports = {
    ioredisClient: new ioredis(ioredisOption)
};

//# sourceMappingURL=redis_connection-compiled.js.map