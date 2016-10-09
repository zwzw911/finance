'use strict';

/**
 * Created by wzhan039 on 2015-07-08.
 */

var mongoose = require('mongoose');
var fs = require('fs');
var regex = require('../../../define/regex/regex').regex;
var dbFinance = require('./connection').dbFinance;

//使用ES6的promise
//mongoose.Promise=Promise
//mongoose.Promise = Promise
var mongoSetting = require('../../../config/global/globalSettingRule').mongoSetting;

var inputRule = require('../../../define/validateRule/inputRUle').inputRule;

var collections = ['department', 'employee', 'billType', 'bill'];

var schemaOptions = {
    autoIndex: true, //if true,每次app启动，moogoose都会发送ensureIndex给每个index，可能影响性能。
    bufferCommands: true, //如果mongodb没有启动，moogoose会缓存命令。//必须
    //capped:	//本collection为capped（环形集合，超出最大数量后，新的覆盖老的。插入速度极快）
    //collection: //collection默认名字是在Model中设置的，为了自定义collection的名称，可以设置此选项
    //emitIndexErrors：	//设为true，则当mongoose发出ensureIndex，但是失败后，会在model产生一个error事件
    //id:	//vitual getter，用model初始化后的document，可以通过这个方法直接获得objectId（这是mogoose产生的，还没有存入mongodb）
    _id: true, //schema中不用显示设置objectid，mongoose会自动产生objectId
    minimize: true, //如果schema中的field是对象，则minimize=true时，当document中此field为空**对象**，此doc被save时，空对象的字段不会被保存
    //read:,	//设置read的优选项：primary(default 只从primary读)/primaryPrefered（主要从P，如果P挂掉，从S读）/secondary/secondaryPrefered/nearest（从网络延迟最下的读,需要在connect时候设置var options = { replset: { strategy: 'ping' }};）
    safe: true, //设为true，如果出错，返回error到callback。设为{j:1,w:2,wtimeout:5000}，除了error返回callback，还能保证写操作被提交到日志和至少2个rep中，并且写操作超过5秒就超时
    Strict: true, //默认true，如果要保存的数据中，字段没有在schema中定义，数据将无法保存。也可以设置成throw，如此便抛出错误，而不是仅仅drop数据。
    //shardKey:{f1:1,f2:1}		//为collection设置shardKey（每个schema不同）
    //toJSON,		//类似toObject，除了还可以使用JSON.stringify(doc)
    //toObject,
    validateBeforeSave: mongoSetting.schemaOptions.validateBeforeSaveFlag };
//convert mongodb data to objet, so that nodejs can manipulate directly
var toObjectOptions = {
    getters: true, //apply all getters (path and virtual getters)
    virtuals: true, //apply virtual getters (can override getters option)
    minimize: true, // remove empty objects (defaults to true)
    depopulate: false, //如果有外键，直接使用外键而不是外键对应的记录(defaults to false)
    versionKey: false, //whether to include the version key (defaults to true)        //not include version key in result
    retainKeyOrder: false // keep the order of object keys. If this is set to true, Object.keys(new Doc({ a: 1, b: 2}).toObject()) will always produce ['a', 'b'] (defaults to false)
};

/*
* schema definition
* 内置validator的定义放在ruleDefine中
* required(all)/min_max(number)/enum_match_minLength_maxLength()
* */

/*                           department                        */
var fieldDefine = {
    user: {
        name: { type: String, unique: true },
        salt: { type: String },
        encryptedPassword: { type: String },
        cDate: { type: Date, default: Date.now },
        uDate: { type: Date, default: Date.now },
        dDate: { type: Date }
    },
    department: { //采用和inputRule一样的名字，以便之后用for循环添加内置validator
        name: { type: String, unique: true }, //全部设成{}，即使只有type定义，以便之后添加validator
        parentDepartment: { type: mongoose.Schema.Types.ObjectId, ref: "departments" },
        cDate: { type: Date, default: Date.now },
        uDate: { type: Date, default: Date.now },
        dDate: { type: Date }
    },
    employee: {
        name: { type: String },
        leader: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
        gender: { type: String },
        birthDay: { type: Date },
        department: { type: mongoose.Schema.Types.ObjectId, ref: "departments" },
        onBoardDate: { type: Date },
        cDate: { type: Date, default: Date.now },
        uDate: { type: Date, default: Date.now },
        dDate: { type: Date }
    },
    billType: {
        name: { type: String, unique: true },
        parentBillType: { type: mongoose.Schema.Types.ObjectId, ref: "billTypes" },
        cDate: { type: Date, default: Date.now },
        uDate: { type: Date, default: Date.now },
        dDate: { type: Date }
    },
    bill: {
        title: { type: String },
        content: { type: String },
        billType: { type: mongoose.Schema.Types.ObjectId, ref: "billTypes" },
        billDate: { type: Date },
        amount: { type: Number },
        reimburser: { type: mongoose.Schema.Types.ObjectId, ref: "employees" },
        cDate: { type: Date, default: Date.now },
        uDate: { type: Date, default: Date.now },
        dDate: { type: Date }
    }
};

/*
* 根据define/validateRule/validateRule的rule设置schema的rule
* */
//validateInput中的rule，在mongoose中对应的validator
var ruleMatch = {
    require: 'required',
    min: 'min',
    max: 'max',
    minLength: 'minlength',
    maxLength: 'maxlength',
    format: 'match',
    'enum': 'enum'
};
//console.log(fieldDefine['department']['parentDepartment'])
/*                          将inputRule中的rule定义转换成mongoose内置validator                          */
//根据flag确实是否要为field设置内建validator
if (true === mongoSetting.schemaOptions.validateFlag) {
    for (var singleCollectionsName in fieldDefine) {
        //读取每个collection
        for (var singleFiled in fieldDefine[singleCollectionsName]) {
            //读取每个collection下的字段（path）
            for (var singleItem in inputRule[singleCollectionsName][singleFiled]) {
                //读取每个字段下对应在inputRule下的每个rule
                if (ruleMatch[singleItem]) {
                    //rule是否在mongo中有对应的内建validator
                    var singleRuleValue = inputRule[singleCollectionsName][singleFiled][singleItem];

                    //如果define是format，且value为ObjectID，则无需在mongo上设置对应的内建validator（因为type为objectId的字段会自动判断输入值是否为objectId,er无需添加额外的validator）
                    if ('format' === singleItem) {
                        if (regex.objectId === singleRuleValue['define']) {
                            continue;
                        }
                    }

                    if (false !== singleRuleValue['define']) {
                        //一般而言，有define就可以判断为有validator，但是require比较特殊，只有true才认为有对应的定义
                        if (fieldDefine[singleCollectionsName][singleFiled]) {
                            //对应的field在mongo中有定义，则为此field添加validator
                            fieldDefine[singleCollectionsName][singleFiled][ruleMatch[singleItem]] = [];
                            fieldDefine[singleCollectionsName][singleFiled][ruleMatch[singleItem]].push(singleRuleValue['define']);
                            //fieldDefine[singleCollectionsName][singleFiled][ruleMatch[singleItem]].push(singleRuleValue['mongoError'])
                            var errorMsg = '错误代码' + singleRuleValue['mongoError']['rc'] + ':' + singleRuleValue['mongoError']['msg'];
                            fieldDefine[singleCollectionsName][singleFiled][ruleMatch[singleItem]].push(errorMsg); //只能接受字符串
                        }
                    }
                }
            }
        }
    }
}

// fs.writeFile('mongodb.txt',JSON.stringify(fieldDefine))
//console.log(fieldDefine['department']['name'])
//console.log(fieldDefine['employee']['gender']['enum'])
//console.log(JSON.stringify(fieldDefine['billType']))

var userSchema = new mongoose.Schema(fieldDefine['user'], schemaOptions);

var departmentSchema = new mongoose.Schema(fieldDefine['department'], schemaOptions);

var employeeSchema = new mongoose.Schema(fieldDefine['employee'], schemaOptions);
var billTypeSchema = new mongoose.Schema(fieldDefine['billType'], schemaOptions);

var billSchema = new mongoose.Schema(fieldDefine['bill'], schemaOptions);

var userModel = dbFinance.model('users', userSchema);
var departmentModel = dbFinance.model('departments', departmentSchema);
var employeeModel = dbFinance.model('employees', employeeSchema);
var billTypeModel = dbFinance.model('billTypes', billTypeSchema);
var billModel = dbFinance.model('bills', billSchema);

//console.log(billModel)
module.exports = {
    userModel: userModel,
    departmentModel: departmentModel,
    employeeModel: employeeModel,
    billTypeModel: billTypeModel,
    billModel: billModel,
    //以下export，为了mongoValidate
    collections: collections,
    fieldDefine: fieldDefine
}; //

//# sourceMappingURL=structure-compiled.js.map

//# sourceMappingURL=structure-compiled-compiled.js.map