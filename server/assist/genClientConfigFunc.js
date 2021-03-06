/**
 * Created by wzhan039 on 2016-11-10.
 *
 * 基于inputRule自动产生各种文件
 */
/*根据server端rule define，生成客户端rule define
 * obj:server端item的rule define( /server/define/validateRule/inputRule)
 * level：深度（2）
 * resultObj: 因为采用递归调用，所以结果参数，而不是直接return结果
 */

var clientRuleType=require('../define/enum/validEnum').enum.clientRuleType
var miscError=require('../define/error/nodeError').nodeError.assistError.misc
var rightResult={rc:0}

var validateHelper=require('./validateInput/validateHelper')
var dataTypeCheck=validateHelper.dataTypeCheck

var dataType=require('../define/enum/validEnum').enum.dataType

var dbStructure=require('../model/mongo/common/structure').fieldDefine

var inputRule=require('../define/validateRule/inputRule').inputRule
//var validateInputValue=require('not_used_validateFunc').func

var fs=require('fs')

var vueAsyncValidatorDateType=require('../define/enum/validEnum').enum.vueAsyncValidatorDateType


//根据inputRule，产生vue async-validator的datatype
var genVueAsyncValidatorDateType=function(){
    let result={}
    for(let coll in inputRule){
        result[coll]={}
        for(let field in inputRule[coll]){
            result[coll][field]={}
            //检查是否为外键,是外键的话，要重定向rule对应的coll/field
            let [newColl,newField]=[coll,field]
            // console.log(`db field is ${JSON.stringify(dbStructure[coll][field])}`)
            //使用获得coll/field在dbstructue中检查是否为外键
            if(dbStructure[coll] && dbStructure[coll][field] && true==='ref' in dbStructure[coll][field]){
                // console.log(`orig coll field is ${newColl}  ${newField}`)
                let ref=dbStructure[coll][field]['ref']
                newColl=ref.substring(0,ref.length-1) //去除最后一个字符s
                newField='name' //如果是外键，对应的字符字段一般都是name
                // console.log(`new coll field is ${newColl}  ${newField}`)
            }

            let type
            if(inputRule[newColl][newField]['type']){
                switch(inputRule[newColl][newField]['type']){
                    case dataType.date:
                        type=vueAsyncValidatorDateType.date
                        break;
                    case dataType.string:
                        type=vueAsyncValidatorDateType.string
                        if(true==='enum' in inputRule[newColl][newField]){
                            type=vueAsyncValidatorDateType.enum
                        }
                        break;
                    case dataType.int:
                        type=vueAsyncValidatorDateType.integer
                        break;
                    case dataType.file:
                        break;
                    case dataType.folder:
                        break;
/*                    case dataType.password:
                        type=vueAsyncValidatorDateType.string
/!*                        if(true==='format' in inputRule[newColl][newField]){
                            type=vueAsyncValidatorDateType.regexp
                        }*!/
                        break;*/
                    case dataType.objectId:
                        type=vueAsyncValidatorDateType.string
                        break;
                    default://自定义和async-validator一致
                        type=inputRule[newColl][newField]['type']
                }
            }
            result[coll][field]=type
        }
    }
    return result
}
//根据dbstructure，以inputRule为基础，生成对应iView的Rule
/*[
	{required:true,type:'date array',message:'',trigger:'blur'}
]*/
var generateClientRuleForVue=function(){
    let inputRuleVueAsyncValidatorDateType=genVueAsyncValidatorDateType()
    let result={}
    //需要提取到client的rule
    // clientRuleType['type']='type'

    //从inputRule中提取coll/field
    for(let coll in inputRule){
        result[coll]={}
        for(let field in inputRule[coll]){
            result[coll][field]=[]
            //检查是否为外键,是外键的话，要重定向rule对应的coll/field
            let [newColl,newField]=[coll,field]
            // console.log(`db field is ${JSON.stringify(dbStructure[coll][field])}`)
            //使用获得coll/field在dbstructue中检查是否为外键
            if(dbStructure[coll] && dbStructure[coll][field] && true==='ref' in dbStructure[coll][field]){
                // console.log(`orig coll field is ${newColl}  ${newField}`)
                let ref=dbStructure[coll][field]['ref']
                newColl=ref.substring(0,ref.length-1) //去除最后一个字符s
                newField='name' //如果是外键，对应的字符字段一般都是name
                // console.log(`new coll field is ${newColl}  ${newField}`)
            }

            let vueFiledType=inputRuleVueAsyncValidatorDateType[newColl][newField]

            for(let singleRule in clientRuleType){
				let singleClientRule={type:vueFiledType}
                if(inputRule[newColl][newField][singleRule]){
                // console.log(`ready coll field is ${newColl}  ${newField}`)
                    if(clientRuleType.maxLength===singleRule){
                        switch (vueFiledType) {
                            case vueAsyncValidatorDateType.string:
                                singleClientRule['max'] = inputRule[newColl][newField][singleRule]['define'];
                                break;
                            default:
                                continue
                        }
                    }else if(clientRuleType.minLength===singleRule) {
                        switch (vueFiledType) {
                            case vueAsyncValidatorDateType.string:
                                singleClientRule['min'] = inputRule[newColl][newField][singleRule]['define']
                                break;
                            default:
                                continue
                        }
                    }else if(clientRuleType.require===singleRule) {
                        singleClientRule['required'] = inputRule[newColl][newField][singleRule]['define']
                    }
                    else{
                        if(singleRule===vueFiledType){
                            singleClientRule[singleRule]=inputRule[newColl][newField][singleRule]['define']
                        }

                    }
                    console.log(`coll is ${newColl},field is ${newField},rule name is ${singleRule}, rule is ${JSON.stringify(inputRule[newColl][newField][singleRule])}`)
                    singleClientRule['message']=validateHelper.generateErrorMsg[singleRule](inputRule[coll][field]['chineseName'],inputRule[newColl][newField][singleRule]['define'],inputRule[newColl][newField]['default'])
                    //result[coll][field][singleRule]={}
                    //result[coll][field][singleRule]['define']=inputRule[newColl][newField][singleRule]['define']
                    //result[coll][field][singleRule]['msg']=validateHelper.generateErrorMsg[singleRule](inputRule[coll][field]['chineseName'],inputRule[newColl][newField][singleRule]['define'],inputRule[newColl][newField]['default'])
					singleClientRule['trigger']='blur'
					
                    result[coll][field].push(singleClientRule)
                }


            }
        }
    }
    return result
}

//iview使用async-validator进行验证，所以，所有输入值要放在filed;value的格式
var genVueClientInputValue=function(){
    let result={}
    for(let coll in inputRule){
        result[coll]={}
        for(let field in inputRule[coll]){
            result[coll][field]=''
        }
    }
    return result
}
//根据dbstructure，以inputRule为基础，生成对应的clientRule
var generateClientRule=function(){
    let result={}
    //需要提取到client的rule
    clientRuleType['type']='type'

    //从inputRule中提取coll/field
    for(let coll in inputRule){
        result[coll]={}
        for(let field in inputRule[coll]){
            result[coll][field]={}
            //检查是否为外键,是外键的话，要重定向rule对应的coll/field
            let [newColl,newField]=[coll,field]
            // console.log(`db field is ${JSON.stringify(dbStructure[coll][field])}`)
            //使用获得coll/field在dbstructue中检查是否为外键
            if(dbStructure[coll] && dbStructure[coll][field] && true==='ref' in dbStructure[coll][field]){
                // console.log(`orig coll field is ${newColl}  ${newField}`)
                let ref=dbStructure[coll][field]['ref']
                newColl=ref.substring(0,ref.length-1) //去除最后一个字符s
                newField='name' //如果是外键，对应的字符字段一般都是name
                // console.log(`new coll field is ${newColl}  ${newField}`)
            }

            for(let singleRule in clientRuleType){
                // console.log(`ready coll field is ${newColl}  ${newField}`)
                if(inputRule[newColl][newField][singleRule]){
                    //此地的type是指数据类型（而不是html中input type的类型）
                    if('type'===singleRule){
                        result[coll][field]['type']=inputRule[newColl][newField][singleRule]
                    }else{
                        result[coll][field][singleRule]={}
                        result[coll][field][singleRule]['define']=inputRule[newColl][newField][singleRule]['define']
                        result[coll][field][singleRule]['msg']=validateHelper.generateErrorMsg[singleRule](inputRule[coll][field]['chineseName'],inputRule[newColl][newField][singleRule]['define'],inputRule[newColl][newField]['default'])
                    }

                }
            }
        }
    }
    return result
}
//根据skipList提供的key，在origObj删除对应key
//专门使用：使用generateClientRule或者generateClientInputAttr，是从mongodb structure中直接转换，但是其中有些字段，例如cDate，是后台自动创建，无需前台检测，所以需要删除
//origObj: generateClientRule或者generateClientInputAttr产生的结果
//skipList:需要删除的字段
//处理完成返回true
var deleteNonNeededObject=function(origObj,skipList){
    if(false===dataTypeCheck.isObject(origObj)) {
        return miscError.deleteNonNeededObject.origObjTypeWrong
    }
    if(false===dataTypeCheck.isObject(skipList)){
        return miscError.deleteNonNeededObject.skipListTypeWrong
    }
    for(let coll in origObj){
        //对应的collection没有需要删除的字段
        if(undefined===skipList[coll]){
            continue
        }else{
            //对应的coll有对应的删除字段，查找出对应的字段，并删除
            for(let field in origObj[coll]){
                if(-1!==skipList[coll].indexOf(field)){
                    delete origObj[coll][field]
                }
            }
        }
    }
    return rightResult
}

//collection的某些字段是ObjectId，需要对应到具体的字段（例如department.parentDepartment在client实际显示的department name，而不是objectID）
//origObj: generateClientRule或者generateClientInputAttr产生的结果
//matchList：指定对应的filed连接到的coll.field(db中字段是objectID，但是用作外键，实际代表字符等，所以需要修改checkRule和inputAttr的chineseName)
var objectIdToRealField=function(origObj,matchList){
    //console.log(`inputRule obj is ${JSON.stringify(origObj)}`)
    //console.log(`err obj is ${JSON.stringify(origObj['department']['parentDepartment'])}`)
    if(false===dataTypeCheck.isObject(origObj)) {
        return miscError.objectIdToRealField.origObjTypeWrong
    }
    if(false===dataTypeCheck.isObject(matchList)){
        return miscError.objectIdToRealField.skipListTypeWrong
    }
    let tmp,tmpColl,tmpField
    //let tmpValue
//console.log(`match list is ${JSON.stringify(matchList)}`)
    for(let coll in matchList){
        if(undefined===matchList[coll]){
            continue
        }
        for (let field in matchList[coll]){

            tmp=matchList[coll][field].split('.')
            tmpColl=tmp[0]
            tmpField=tmp[1]
            //console.log(`coll is ${JSON.stringify(coll)}`)
            //console.log(`field is ${JSON.stringify(field)}`)
//console.log(`origObj is ${JSON.stringify(origObj[coll][field])}`)
            //如果是attr（通过判断是否有chineseName），保存原始的chineseName，但是inputDataType换成相关字段的类型
            if(origObj[coll][field]['chineseName']){
                origObj[coll][field]['inputDataType']=origObj[tmpColl][tmpField]['inputDataType']
                /*                tmpValue=origObj[coll][field]['chineseName']
                 console.log(tmpValue)
                 origObj[coll][field]=origObj[tmpColl][tmpField]

                 origObj[coll][field]['chineseName']=tmpValue
                 console.log(origObj[coll][field])*/
            }else{//否则就是ruleDefine
                //遍历关联字段的rule
                /*                console.log(coll)
                 console.log(field)
                 console.log(origObj[tmpColl][tmpField])*/
                for(let rule in origObj[tmpColl][tmpField]){
                    //console.log(rule)
                    //require还是使用原始的定义
                    if('require'===rule){
                        continue
                    }


                    //console.log(tmpField+" "+rule)
                    //其他rule的定义和msg采用关联字段的定义和msg（在客户端使用，没有rc）
                    //如果关联字段中 有某个rule，但是原始字段中 没有，那么在原始字段设置一个空rule
                    if(undefined===origObj[coll][field][rule]){
                        origObj[coll][field][rule]={}
                    }
                    //console.log(origObj[coll][field][rule]['define'])
                    //console.log(origObj[tmpColl][tmpField][rule]['define'])

                    //外键的类型，从objectId转化成对应coll.field的类型（string/int等）
                    if('type'===rule){
                        //console.log(rule)
                        //console.log(origObj[coll][field][rule])
                        origObj[coll][field][rule]=origObj[tmpColl][tmpField][rule]
                        continue
                    }
                    origObj[coll][field][rule]['define']=origObj[tmpColl][tmpField][rule]['define']
                    origObj[coll][field][rule]['msg']=origObj[tmpColl][tmpField][rule]['msg']
                }
            }
        }
    }

    return rightResult
}

/*根据server端rule define，生成客户端input的属性，以便angularjs对input进行检查
 * allInputRule:server端item的rule define( /server/define/validateRule/inputRule)。整个inputRule
 * allFieldDefine: 整个db的coll定义
 */
var generateClientInputAttr=function(allInputRule,allFieldDefine){
    let resultObj={}
    for(let coll in allFieldDefine){
        resultObj[coll]=generateSingleCollInputAttr(allInputRule[coll],allFieldDefine[coll])
    }
    return resultObj
}


/*根据server端input rule，生成客户端input的属性，以便angularjs对input进行检查
 * inputRule:server端item的rule define( /server/define/validateRule/inputRule),以coll为单位
 * fieldDefine：数据库的定义（/model/mongo/common/structure），以coll为单位
 */
var generateSingleCollInputAttr=function(inputRule,fieldDefine){
    let resultObj={}

    //在inputAttr中，指定每个field对应在页面上input的类型
    //inputAttr只在CU的时候才使用
    //inputType：指定input是什么类型（和client的constant中定义的一致）
    var inputType={
        'normal':'normal',//普通的input
            'select':'select', //field在页面应该使用select
            'date':'date',//field是日期类型
            'autoComplete':'autoComplete', //field需要 自动完成功能
    }

    //遍历coll的所有field
    for(let singleField in fieldDefine){
        //如果此field有对应的rule（cDate等不需要）
        if(inputRule[singleField]){
                //isQueryAutoComplete:字段作为查询时，值是否通过AC获得
                //isCRUDAutoComplete：在CRUD时，字段值是否可以通过AC获得
                //isSelect:input是否为select
                resultObj[singleField]={
                    // value:'',
                    originalValue:'',
                    isFKField:false,//是否为外键（如果是外键的话，存储的值格式为对象{show:'',id:''}。show：显示给用户看的内容，id；实际对应的记录的objectId
                    inputType:inputType.normal,//代替isSelect/isCRUDAutoComplete，决定使用何种input用来处理field的数据
                    //isSelect:false, //是否在页面上作为select
                    selectOption:[],//如果作为select，提供的可选项 {key:'male',value:'男'}。 key：实际存储到db中的值，value：在页面上显示的值
                    isQueryAutoComplete:false,
                    //isCRUDAutoComplete:false,
                    autoCompleteCollField:'',
                    suggestList:{}, //
                    inputDataType:null, //html元素中，input type=？  和inputRule中的type概念不一样
                    inputIcon:"",
                    chineseName:null,
                    errorMsg:"",
                    validated:'undefined'
                }

            resultObj[singleField]['chineseName']=inputRule[singleField]['chineseName']
            let temInputDataType
            switch (inputRule[singleField]['type']){
                case dataType.number:
                    resultObj[singleField]['inputDataType']='text'; //数字采用text而不是number，因为现代浏览器会自动判别输入内容，如果不是数字，则内容不会被传递到angular（即angular得到的是空值），此时无法给出类型不正确的信息，而只能给出值为空的信息
                    break;
                case dataType.float:
                    resultObj[singleField]['inputDataType']='text';
                    break;
                case dataType.int:
                    resultObj[singleField]['inputDataType']='text';
                    break;
                case dataType.password:
                    resultObj[singleField]['inputDataType']='password';
                    break;
                case dataType.date:
                    resultObj[singleField]['inputDataType']='date';
                    resultObj[singleField]['inputType']=inputType.date //input为date，需要使用datetimepicker
                    break;
                case dataType.objectId:
                    resultObj[singleField]['inputDataType']='text';
                    resultObj[singleField]['isFKField']=true;
                    //外键一般也是默认采用自动完成功能
                    resultObj[singleField]['inputType']=inputType.autoComplete
                    break;
                case dataType.string:
                    //如果是字符，默认是AC，且input的type属性为text
                    resultObj[singleField]['inputDataType']='text';
                    resultObj[singleField]['inputType']=inputType.autoComplete
                    //判断是否为enum
                    if(true==='enum' in inputRule[singleField]){
                        //如果是enum，进一步划分成select
                        resultObj[singleField]['inputDataType']='select';
                        resultObj[singleField]['inputType']=inputType.select  //使用select代替input
                        //resultObj[singleField]['isSelect']=true
                        //填入selectOption
                        resultObj[singleField]['selectOption']=[]
                        inputRule[singleField]['enum']['define'].map(
                            (ele,idx)=>{
                                resultObj[singleField]['selectOption'].push({'key':ele,'value':null})
                            }
                        )
                        // resultObj[singleField]['selectOption']=inputRule[singleField]['enum']['define']
                    }
                default:
                    resultObj[singleField]['inputDataType']='text'
            }

/*            //isQueryAutoComplete:字段作为查询时，值是否通过AC获得
            //isCRUDAutoComplete：在CRUD时，字段值是否可以通过AC获得
            //isSelect:input是否为select
            resultObj[singleField]={
                value:'',
                originalValue:'',
                isSelect:false, //是否在页面上作为select
                selectOption:[],//如果作为select，提供的可选项 {key:'male',value:'男'}。 key：实际存储到db中的值，value：在页面上显示的值
                isQueryAutoComplete:false,
                isCRUDAutoComplete:false,
                autoCompleteCollField:'',
                suggestList:{},
                inputDataType:temInputDataType, //html元素中，input type=？  和inputRule中的type概念不一样
                inputIcon:"",
                chineseName:tmpChineseName,
                errorMsg:"",
                validated:'undefined'
            }*/

        }
    }






    return resultObj
}

/*          根据structure产生client用的selectedAC             */
//如果db中，某个字段是外键，则把此字段加入
// 'billType':{'parentBillType:{value:null,_id:null}}
var genSelectedAC=function(){
    let result={}
    for(let singleCollName in dbStructure){
        for(let singleFieldName in dbStructure[singleCollName]){
            if(true === 'ref' in dbStructure[singleCollName][singleFieldName]){
                //初始化coll的结构
                if(false=== singleCollName in result){
                    result[singleCollName]={}
                }
                result[singleCollName][singleFieldName]={value:null,_id:null}
            }
        }
    }
    fs.writeFile('selectedAC.txt',JSON.stringify(result))
}

module.exports={
    genVueAsyncValidatorDateType,
	generateClientRuleForVue,
    genVueClientInputValue,
    generateClientRule,
    deleteNonNeededObject,
    objectIdToRealField,
    generateClientInputAttr,
    genSelectedAC,
}

//genSelectedAC()

//let result=generateClientRule()
//fs.writeFile('generateClientRule.txt',JSON.stringify(result))