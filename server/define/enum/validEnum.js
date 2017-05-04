/**
 * Created by wzhan039 on 2016-03-10.
 */
//input value的数据类型
    'use strict'
/*var dataType={
    int:'int',
    float:'float',
    string:'string',
    date:'date',
    array:'array',
    object:'object',
    file:'file',
    folder:'folder',
    number:'number',
    password:'string',

}*/

//input对应的rule(server)
//ruleType 不能使用 Symbol，因为会在rule定义中将value作为key使用，而Symbol值是不能作为key的。{userName:{require:false}}，此处require必须是字符，而不是Symbol。在checkInput，会使用ruleType[require]作为key，从rule中取得对应的rule定义
var ruleType={
    require:'require',
    maxLength:'maxLength',
    minLength:'minLength',
    exactLength:'exactLength',
    min:'min',
    max:'max',
    format:'format',
    equalTo:'equalTo',
    'enum':'enum',
}

//采用字符，而不是symbol，否则无法读取key：value对
var dataType={
    'int':'int',
    'float':'float',
    'string':'string',
    // 'string':'string',
    'date':'date',
    'array':'array',
    'object':'object',
    'file':'file',
    'folder':'folder',
    'number':'number',
    // 'password':'string',
    // 'password':'password',
    'objectId':'objectId',//mongodb的id
    // format:Symbol('regex'),
}


//rule定义中，出了ruleType之外的字段
//和ruleType同样的理由而不能使用Symbol
var otherFiledName={
    chineseName:'chineseName',
    default:'chineseName',
    type:'type',
}
//input对应的rule(client)，根据server获得，排除（exactLength/Format/eauqlTo): 不在client使用format（正则）
var clientRuleType={
    require:'require',
    maxLength:'maxLength',
    minLength:'minLength',
    //exactLength:'exactLength',
    min:'min',
    max:'max',
    'enum':'enum',
/*    format:'format',
    equalTo:'equalTo',*/
}

//async-validator使用的数据类型
//因为client端的iview使用async-validator对input的数据进行验证，所以要在inputRule.js中设置对应的sync-validator date type，以便转换
var vueAsyncValidatorDateType={
    'string': 'string',
    'number': 'number',
    'boolean':'boolean',
    'method': 'method',
    'regexp': 'regexp',
    'integer':'integer',
    'float': 'float',
    'array': 'array',
    'object': 'object',
    'enum':'enum',
    'date':'date',
    'url':'url',
    'hex':'hex',
    'email': 'email',
}

//asyncValidator的ruletype
var vueAsyncValidatorRuleType={
    'required':'required',
    'pattern':'pattern',
    'min':'min',
    'max':'max',
    'len':'len',
    'enum':'enum',
}

//输入的参数分为几部分
var validatePart={
    'searchParams':'searchParams',//检查输入的查询参数
    'recorderInfo':'recorderInfo',//create或者update是，传入的记录
    'recorderId':'recorderId',// for update/delete。{recorderId:xxx}记录的Id（因为在rule中没有对应的rule（db自动生成），所以给予单独part，来验证）；外键有对应的rule，所以直接放在recorderInfo中处理
    'currentPage':'currentPage',//当前页数，最大不超过10
    'currentColl':'currentColl',//当前操作的coll
    'filterFieldValue':'filterFieldValue', //对单个字段完成autoComplete的功能（提供可选的项目）{field1:xxx}后者{field;{fk:xxxx}}
}
module.exports={
    dataType,
    ruleType,
    //clientRule,
    otherFiledName,
    clientRuleType,
    vueAsyncValidatorDateType,
    vueAsyncValidatorRuleType,
    validatePart,
}


/*var dataType={
 'int':Symbol('int'),
 'float':Symbol('float'),
 'string':Symbol('string'),
 // 'string':'string',
 'date':Symbol('date'),
 'array':Symbol('array'),
 'object':Symbol('object'),
 'file':Symbol('file'),
 'folder':Symbol('folder'),
 'number':Symbol('number'),
 'password':Symbol('string'),
 'objectId':Symbol('objectId'),//mongodb的id
 // format:Symbol('regex'),
 }*/

/*//客户端需要的rule（和ruleType不同，某些rule可能只在server端需要，client不需要）
 var clientRule={
 require:'require',
 maxLength:'maxLength',
 minLength:'minLength',
 //exactLength:'exactLength',
 min:'min',
 max:'max',
 'enum':'enum'
 /!*    format:'format',
 equalTo:'equalTo',*!/
 }*/

//input对应的rule(server)
/*var ruleType={
 require:Symbol('require'),
 maxLength:Symbol('maxLength'),
 minLength:Symbol('minLength'),
 exactLength:Symbol('exactLength'),
 min:Symbol('min'),
 max:Symbol('max'),
 format:Symbol('format'),
 equalTo:Symbol('equalTo'),
 }*/