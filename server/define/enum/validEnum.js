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
    'password':'password',
    'objectId':'objectId',//mongodb的id
    // format:Symbol('regex'),
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

//rule定义中，出了ruleType之外的字段
//和ruleType同样的理由而不能使用Symbol
var otherFiledName={
    chineseName:'chineseName',
    default:'chineseName',
    type:'type',
}
//input对应的rule(client)，根据server获得，排除（exactLength/Format/eauqlTo)
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

exports.enum={
    dataType,
    ruleType,
    //clientRule,
    otherFiledName,
    clientRuleType,
}
