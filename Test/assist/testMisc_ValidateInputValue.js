/**
 * Created by wzhan039 on 2016-07-07.
 */
'use strict'
require("babel-polyfill");
require("babel-core/register")
var testModule=require('../../server/assist/misc').func;
var miscError=require('../../server/define/error/nodeError').nodeError.assistError
var validateInputValueError=miscError.misc.validateInputValue
/*          for generateRandomString test       */
var regex=require('../../server/define/regex/regex').regex
var dataType=require('../../server/define/enum/validEnum').enum.dataType
//var randomStringTypeEnum=require('../../server/define/enum/node').node.randomStringType



/***************************************************************************/
/*******     辅助函数，根据预定义dataType，检测value是否合格      **********/
/***************************************************************************/
var checkDataTypeBaseOnTypeDefine=function(test){
    let func=testModule.validateInputValue._private.checkDataTypeBaseOnTypeDefine
    let value,tmpDataType,result,tmp

    test.expect(9)

    value='randomString'
    tmpDataType='noEnumDataType'
    result=func(value,tmpDataType)
    test.equal(result.rc,validateInputValueError.unknownDataType.rc,'unknown data type check failed');

    value='0'
    tmpDataType=dataType.int
    result=func(value,tmpDataType)
    test.equal(result,0,'data type int check failed');

    value='1.1'
    tmpDataType=dataType.float
    result=func(value,tmpDataType)
    test.equal(result,1.1,'data type float check failed');

    value='randomString'
    tmpDataType=dataType.string
    result=func(value,tmpDataType)
    test.equal(result,true,'data type string check failed');



    value=new Date('2016').getTime()
    tmpDataType=dataType.date
    result=func(value,tmpDataType)
    test.equal(result.toLocaleString(),new Date(value).toLocaleString(),'data type date check failed');

    value=[]
    tmpDataType=dataType.array
    result=func(value,tmpDataType)
    test.equal(result,true,'data type array check failed');

    value={}
    tmpDataType=dataType.object
    result=func(value,tmpDataType)
    test.equal(result,true,'data type object check failed');

    value='C:/Windows/System32/drivers/etc/hosts'
    tmpDataType=dataType.file
    result=func(value,tmpDataType)
    test.equal(result,true,'data type file check failed');

    value='C:/Program Files'
    tmpDataType=dataType.folder
    result=func(value,tmpDataType)
    test.equal(result,true,'data type folder check failed');

    test.done()

}



/***************************************************************************/
/***************               checkInput                *******************/
/***************************************************************************/
var checkInput=function(test){
    let func=testModule.validateInputValue.checkInput
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let rule,value,tmpDataType,result,tmp
    let error={rc:1234,msg:''}

    test.expect(20)

    //1 检测inputValue是否为空
    rule={}
    value=null
    result=func(value,rule)
    test.equal(result.rc,validateInputValueError.valueNotDefine.rc,'value null check fail')
    value=undefined
    result=func(value,rule)
    test.equal(result.rc,validateInputValueError.valueNotDefine.rc,'value undefined check fail')

    //2 检查inputValue是否有未定义的字段
    rule={name:{}}
    value={'notExistField':{value:'a'}}
    result=func(value,rule)
    test.equal(result.notExistField.rc,validateInputValueError.valueRelatedRuleNotDefine.rc,'not exist field check fail')


    //3.1 如果有id，检测id
    rule={name:{}}
    value={'_id':{value:null}}
     result=func(value,rule)
     test.equal(result._id.rc,validateInputValueError.objectIdEmpty.rc,'field _id null check fail')
    value={'_id':{value:undefined}}
    result=func(value,rule)
    test.equal(result._id.rc,validateInputValueError.objectIdEmpty.rc,'field _id undefined check fail')

    value={'_id':{value:{}}}
    result=func(value,rule)
    test.equal(result._id.rc,validateInputValueError.objectIdWrong.rc,'field _id {} check fail')


    //3.2 如果是objectId（外键），提前检测
    rule={'fk':{chineseName:'外键1',type:dataType.objectId,require:{define:true,error:error},format:{define:regex.objectId,error:error}}}
    value={'fk':{value:"asdf"}}
    result=func(value,rule)
    test.equal(result.fk.rc,error.rc,'field fk require true, wrong objectId, check fail')
    rule.fk.require.define=false
    result=func(value,rule)
    test.equal(result.fk.rc,error.rc,'field fk require false, wrong objectId, check fail')

    //fk  require, but inputValue no fk
    rule={}
    rule.fk={chineseName:'外键1',type:dataType.objectId,require:{define:true,error:error},format:{define:regex.objectId,error:error}}
    rule.name={chineseName:'名字',type:dataType.string,require:{define:false,error:error},maxLength:{define:20,error:error}}
    value={'name':{value:'a'}}
    result=func(value,rule,false)
    // console.log(result)
    test.equal(result.fk.rc,error.rc,'field fk require true, no objectId, check fail')

    // 3.3 default set+require true+input value empty
    rule={}
    rule.name={chineseName:'名字',type:dataType.string,require:{define:true,error:error},maxLength:{define:20,error:error}}
    value={name:{value:null}}
    result=func(value,rule)
    test.equal(result.name.rc,validateInputValueError.valueNotDefineWithRequireTrue.rc,'require true, default empty and input empty, check fail')

    //3.4 format check
    rule={salt:{
        chineseName: '盐',
        type:dataType.string,
        //require=false：client无需此字段，server通过函数（必须有salt来sha密码）保证由此字段
        require: {define: false, error: {rc: 10000},mongoError:{rc:20000,msg:'盐不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        minLength:{define:2,error:{rc:10002},mongoError:{rc:20002,msg:'盐至少2个字符'}},
        maxLength:{define:8,error:{rc:10004},mongoError:{rc:20004,msg:'盐的长度不能超过8个字符'}},
        format:{define:regex.salt,error:{rc:10005},mongoError:{rc:20005,msg:'盐必须由10个字符组成'}} //server端使用
    }},
        value={salt:{value:'1'}}
    result=func(value,rule)
    // console.log(result)
    test.equal(result.salt.rc,10005,'format check,ignore minLength, check fail')
    value={salt:{value:'123456789'}}
    result=func(value,rule)
    test.equal(result.salt.rc,10005,'format check,ignore maxLength, check fail')
    value={salt:{value:'1234567890'}}
    result=func(value,rule)
    test.equal(result.salt.rc,0,'format check,ignore min/maxLength, check fail')


    //3.5 maxLength
    rule.name={chineseName:'名字',type:dataType.string,require:{define:false,error:error},maxLength:{define:5,error:error}}
    value={name:{value:'123456'}}
    result=func(value,rule)
    test.equal(result.name.rc,error.rc,'maxLength, check fail')

    //3.6 enum
    rule={}
    rule.gender={chineseName:'性别',type:dataType.string,require:{define:false,error:error},'enum':{define:['female','male'],error:{rc:4567,msg:'value is not enum'}}}
    value={gender:{value:'123456'}}
    result=func(value,rule)
    test.equal(result.gender.rc,4567,'enum gender, check fail')


    // 3.7 type check
    rule={}
    rule.name={chineseName:'名字',type:dataType.string,require:{define:false,error:error},maxLength:{define:5,error:{rc:7654,msg:'名字不是数字'}}}
    value={name:{value:1234}}
    result=func(value,rule)
    test.equal(result.name.rc,validateInputValueError.typeWrong.rc,'wrong type, check fail')

    //3.8 all except enum/maxLength/format
    rule={
        age:{
            chineseName:'年龄',
            type:dataType.int,
            default:10,
            require:{define:true,error:{rc:1,msg:'age必须'}},
            min:{define:10,error:{rc:5,msg:'age最小10'}},
            max:{define:9999,error:{rc:6,msg:'age最大9999'}},
        }
    }

    value={age:{value:1}}
    result=func(value,rule)
    test.equal(result.age.rc,5,'min check fail')
    value={age:{value:10000}}
    result=func(value,rule)
    test.equal(result.age.rc,6,'max check fail')

    rule={
        name:{
            chineseName:'名字',
            type:dataType.string,
            default:'',
            require:{define:true,error:{rc:1,msg:'名字必须'}},
            minLength:{define:2,error:{rc:2,msg:'名字长度最小2'}},
            maxLength:{define:4,error:{rc:3,msg:'名字长度最大4'}},
            // exactLength:{define:3,error:{rc:4,msg:"名字长度2"}},
        }
    }
    //maxLength先检
    value={name:{value:'asdfv'}}
    result=func(value,rule)
    test.equal(result.name.rc,3,'maxLength check fail')
    value={name:{value:'a'}}
    result=func(value,rule)
    test.equal(result.name.rc,2,'minLength check fail')

    test.done()
}

//检查_id（rule中未定义）和外键id（rule中定义）
//测试在checkInput中添加了新的代码
var checkInputAdditional=function(test){
    test.expect(7)

    let func=testModule.validateInputValue.checkInput
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let rule,value,tmpDataType,result,tmp
    let error={rc:1234,msg:''}

    rule={}
    value={
        _id:{value:'57f8dc65a795ace017f36be7'},
    }
    result=func(value,rule)
    //console.log(result)
    test.equal(result._id.rc,0,'correct _id check fail')

    value={
        id:{value:'57f8dc65a795ace017f36be7'},
    }
    result=func(value,rule)
    //console.log(result)
    test.equal(result.id.rc,0,'correct id check fail')

    value={
        _id:{value:'57f8dc65a795ace017f36'},
    }
    result=func(value,rule)
    //console.log(result)
    test.equal(result._id.rc,validateInputValueError.objectIdWrong.rc,'wrong _id check fail')
    value={
        id:{value:'57f8dc65a795ace017f36'},
    }
    result=func(value,rule)
    //console.log(result)
    test.equal(result.id.rc,validateInputValueError.objectIdWrong.rc,'wrong id check fail')

    rule={
        fk:{
            chineseName:'外键',
            type:dataType.objectId,
            // default:'10',
            require:{define:true,error:error},
            format:{define:regex.objectId,error:error}
        },
    }

    value={
        fk:{value:'57f8dc65a795ace017f36be7'}
    }
    result=func(value,rule)
    test.equal(result.fk.rc,0,'correct fk check fail')

    value={
        fk:{value:'57f8dc65'}
    }
    result=func(value,rule)
    //有对应rule，则rcquwrule中的定义
    test.equal(result.fk.rc,rule.fk.format.error.rc,'wrong fk check fail')

    rule={
        fk:{
            chineseName:'外键',
            type:dataType.objectId,
            // default:'10',
            require:{define:false,error:error},
            format:{define:regex.objectId,error:error}
        },
    }
    value={
        fk:{value:'57f8dc65a795ace017f36b'}
    }
    result=func(value,rule)
    //console.log(`wrong but not require ${JSON.stringify(result)}`)
    test.equal(result.fk.rc,rule.fk.format.error.rc,'wrong fk but require false check fail')


    test.done()
}

//独立的函数
var checkSearchValue=function(test){

    test.expect(2)

    let func=testModule.validateInputValue.checkSearchValue
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let rule,value,tmpDataType,result,tmp
    let requireError={rc:1234,msg:''}
    let maxLengthError={rc:1235,msg:''}

    rule={name:{
        chineseName:'名称',
        type:dataType.string,
        require:{define:false,error:requireError},
        maxLength:{define:10,error:maxLengthError}
    }}

    value={
        name:{
            value:'123456789'
        }
    }
    result=func(value,rule)
    //console.log(result)
    test.equal(result.name.rc,0,'correct name length check fail')

    value={
        name:{
            value:'12345678901'
        }
    }
    result=func(value,rule)
    test.equal(result.name.rc,rule.name.maxLength.error.rc,'wrong name length check fail')


    test.done()
}


exports.validate={
    _private:{
        checkDataTypeBaseOnTypeDefine,
    },
    checkInput,
    checkInputAdditional,
    checkSearchValue
}