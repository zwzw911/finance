/** Created by ada on 2015/6/13.
 */
'use strict'
var crypto=require('crypto');
var fs=require('fs');

var error=require('../../define/error/nodeError').nodeError.assistError.crypt

//var async=require=('async');

var validHashType=['md5','sha1','sha256','sha512','ripemd160'];

var validCryptType=['blowfish','aes192'];
//hashType放在string后（因为string是必填，而hashTye是可选）
var hash=function(string,hashType){
    if ('undefined'===typeof (string) || string.length>255){return false}

    if (validHashType.indexOf(hashType)===-1 || hashType===null || hashType===undefined){
        hashType="md5";
    }

    var inst=crypto.createHash(hashType);
    inst.update(string);
    return inst.digest('hex');
}

//hash+crypt
var hmac=function(hashType,string,pemFilePath){
    if ('undefined'===typeof (string) || string.length>255){return false}

    if (validHashType.indexOf(hashType)===-1 || hashType===null || hashType===undefined ){
        hashType="md5";
    }
    //var pemFilePath='../../../other/key/key.pem';//以当前目录为base
    var pem= fs.readFileSync(pemFilePath);//使用异步，无法返回结果
    var key=pem.toString('ascii');
    var inst=crypto.createHmac(hashType,key);
    inst.update(string);
    return inst.digest('hex');

    //async.series(
    //   [function(callback){
    //        //fs.readFile('../../../other/key/key.pem',function(err,pem){
    //        //    var pem= fs.readFileSync(pemFilePath);//使用异步，无法返回结果
    //        //    var key=pem.toString('ascii');
    //        //    var inst=crypto.createHmac(hashType,key);
    //        //    inst.update(string);
    //        //    var result=inst.digest('hex');
    //        //    callback(null,result)
    //        //    //return inst.digest('hex');
    //        //})
    //       callback(null,'2391c9eeff8b6baa1595e930716c99cb')
    //    }],
    //
    //    function(err,result){
    //        return result;
    //    }
    //);

}

 var crypt=function(cryptType,string,pemFilePath){
     if ('undefined'===typeof (string) || string.length>255){return false}
     if(validCryptType.indexOf(cryptType)===-1 || cryptType===null || cryptType===undefined){
         cryptType='blowfish';
     }
     //var pemFilePath='../../../other/key/key.pem';
     var pem=fs.readFileSync(pemFilePath);
         //if (err) throw err;
     var key=pem.toString('ascii');
     var inst=crypto.createCipher(cryptType,key);
     var result='';
     result+=inst.update(string,'utf8','hex');
     result+=inst.final('hex');
     return result;
 }

 var decrypt=function(cryptType,string,pemFilePath){
     //console.log(typeof (str))
     if ('undefined'===typeof (string) || string.length>255){return false}
     if(validCryptType.indexOf(cryptType)===-1 || cryptType===null || cryptType===undefined){
         cryptType='blowfish';
     }
     //var pemFilePath='../../../other/key/key.pem';
     var pem=fs.readFileSync(pemFilePath);
         //if (err) throw err;
        var key=pem.toString('ascii');
        var inst=crypto.createDecipher(cryptType,key);
        var result='';
        result+=inst.update(string,'hex','utf8');
        result+=inst.final('utf8');
        return result;
     //});

 };

 //产生[0-9a-f]的随机字符
 var asyncGenSalt=function(saltLength,cb){
     return new Promise(function (resolve,reject) {
         crypto.randomBytes(saltLength,(err,buf)=>{
             if(err){
                 reject(error.genSaltFail)
             }else{
                 resolve({rc:0,msg:buf.toString('hex')})
             }

         })
     })

}

//console.log(hash('11111111','md5'))
/*exports.hash=hash;
exports.hmac=hmac;
exports.crypt=crypt;
exports.decrypt=decrypt;*/
exports.crypt={
    hash,
    hmac,
    crypt,
    decrypt,
    asyncGenSalt,
}
//exports.genSalt=genSalt;

/*
genSalt(16,function(err,result){
	console.log(err)
	console.log(result)
})*/
