/**
 * Created by wzhan039 on 2016-09-30.
 */
var envEnum=require('../../define/enum/node').node.env
module.exports={
    'env':envEnum.development,
    //true：req.ip是最近的一个IP（最近的代理服务器IP）；req.ips是数组，从源头开始，到最近代理的IP；
    //fasle：req.ip(s)返回undefined和[]。此时需要req.connection.remoteAddress
    'trust proxy':false,
}