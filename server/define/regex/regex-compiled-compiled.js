/**
 * Created by wzhan039 on 2016-02-26.
 * 所有常量定义
 */
'use strict';
// ~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-  转义正则特殊字符
//常用正则

var regex = {
    singleSpecialChar: /^[A-Za-z0-9~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-]$/,
    email: /(\w+\.)*\w+@(\w+\.)+[A-Za-z]+/,
    ip: /(((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{2})|(2[0-4]\d)|(25[0-5]))/,
    sha1Hash: /^[0-9a-f]{40}$/,
    objectId: /^[0-9a-f]{24}$/, //mongodb objectid

    userName: /^[\u4E00-\u9FFF\w]{2,20}$/, //2-20个汉字/英文/数字
    salt: /^[0-9a-zA-Z]{10}$/,
    password: /^[A-Za-z0-9~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-]{6,20}$/,
    // encryptedPassword:/^[0-9a-f]{40}$/,
    //strictPassword:/^(?=.*[0-9])(?=.*[A-Za-z])(?=.*[\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?><\,\./;'\\\[\]])[A-Za-z0-9\~\\!\@\#\$\%\^\&\*\)\(\_\+\=\-\`\}\{\:\"\|\?><\,\./;'\\\[\]]{6,20}$/,//字母数字，特殊符号
    //strictPassword:/^(?=.*[0-9])(?=.*[A-Za-z])(?=.*[~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-])[A-Za-z0-9~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-]{6,20}$/,//字母数字，特殊符号
    //loosePassword:/^(?=.*[0-9])(?=.*[A-Za-z])[A-Za-z0-9]{2,20}$/,//宽松密码设置，字母数字
    //loosePassword:/^[A-Za-z0-9]{2,20}$/,//宽松密码设置，字母数字

    mobilePhone: /^\d{11,13}$/,
    hashImageName: /[0-9a-f]{40}\.[jpg|jpeg|png]/,
    folderName: /^[\u4E00-\u9FFF\w]{1,255}$/,
    keyName: /^[\u4E00-\u9FFF\w]{2,20}$/, //查询关键字，中文，英文
    pageNum: /\d{1,4}/,
    hashName: /[0-9a-f]{40}\.\w{3,4}/, //hash名+后缀
    captcha: /^[a-zA-Z0-9]{4}$/,
    hashedThumbnail: /^[0-9a-f]{40}\.[jpg|jpeg|png]$/,
    originalThumbnail: /^[\u4E00-\u9FFF\w]{2,20}\.[jpg|jpeg|png]$/,
    number: /^-?\d{1,}$/, //只能对字符正常工作，如果是纯数值会出错（1.0会true）; 无法处理巨大数字，因为会被parseFloat转换成科学计数法(1.23e+45}，从而无法用统一的regex处理

    thumbnail: /[0-9a-f]{40}\.[jpg|jpeg|png]/,

    randomString: {
        basic: /^[0-9A-Z]{4,}$/,
        normal: /^[0-9a-zA-Z]{4,}$/,
        complicated: /^[0-9a-zA-Z~`!@#%&)(_=}{:"><,;'\[\]\\\^\$\*\+\|\?\.\-]{4,}$/ },

    encodeHtmlChar: /[\s"&'<>]|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g, //把某些特殊字符转换成&xxx格式，传到client

    lua: {
        paramsConvert: /([{,])"(\w+)"/g }
};
module.exports = {
    regex: regex
};

//# sourceMappingURL=regex-compiled.js.map

//# sourceMappingURL=regex-compiled-compiled.js.map