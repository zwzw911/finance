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

var dataTypeCheck=require('./validateFunc').func.dataTypeCheck
var dataType=require('../define/enum/validEnum').enum.dataType

var dbStructure=require('../model/mongo/common/structure').fieldDefine

var fs=require('fs')

var generateClientRule=function(obj,level,resultObj){
    // let resultObj={}
    if('object'===typeof obj){
        for(let key in obj){
            resultObj[key]={}
            //深度为1,达到subItem
            if(1===level){
                for(let field in clientRuleType){
                    //rule有定义
                    if(undefined!==obj[key][field] && null!==obj[key][field]){
                        //读取rule定义
                        if(undefined!==obj[key][field]['define'] && null!==obj[key][field]['define']){
                            resultObj[key][field]={}
                            resultObj[key][field]['define']=obj[key][field]['define']
                            //产生错误信息，以便angularjs检查input错误时使用
                            resultObj[key][field]['msg']=validateInputValue._private.generateErrorMsg[field](obj[key]['chineseName'],obj[key][field]['define'],obj[key]['default'])
                        }
                    }
                }
            }else{
                //如果值是对象，递归调用
                if('object'===typeof obj[key]){
                    let currentLvl=level-1
                    generateClientRule(obj[key],currentLvl,resultObj[key])
                }

            }
        }
    }
    // return resultObj
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
    if(false===dataTypeCheck.isObject(origObj)) {
        return miscError.objectIdToRealField.origObjTypeWrong
    }
    if(false===dataTypeCheck.isObject(matchList)){
        return miscError.objectIdToRealField.skipListTypeWrong
    }
    let tmp,tmpColl,tmpField
    //let tmpValue
    for(let coll in matchList){
        if(undefined===matchList[coll]){
            continue
        }
        for (let field in matchList[coll]){

            tmp=matchList[coll][field].split('.')
            tmpColl=tmp[0]
            tmpField=tmp[1]

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
                    //console.log(origObj[tmpColl][tmpField][rule]['define'])
                    origObj[coll][field][rule]['define']=origObj[tmpColl][tmpField][rule]['define']
                    origObj[coll][field][rule]['msg']=origObj[tmpColl][tmpField][rule]['msg']
                }
            }
        }
    }

    return rightResult
}

/*根据server端rule define，生成客户端input的属性，以便angularjs对input进行检查
 * obj:server端item的rule define( /server/define/validateRule/inputRule)
 * level：深度（2）
 * resultObj: 因为采用递归调用，所以结果参数，而不是直接return结果
 */
var generateClientInputAttr=function(obj,level,resultObj){
    // let resultObj={}
    if('object'===typeof obj){
        for(let key in obj){
            resultObj[key]={}
            //深度为1，到达最底层
            if(1===level){
                let tmpChineseName=obj[key]['chineseName']
                let temInputDataType
                switch (obj[key]['type']){
                    case dataType.number:
                        temInputDataType='number';
                        break;
                    case dataType.float:
                        temInputDataType='number';
                        break;
                    case dataType.int:
                        temInputDataType='number';
                        break;
                    case dataType.password:
                        temInputDataType='password';
                        break;
                    case dataType.date:
                        temInputDataType='date';
                        break;
                    default:
                        temInputDataType='text'
                }

                //isQueryAutoComplete:字段作为查询时，值是否通过AC获得
                //isCRUDAutoComplete：在CRUD时，字段值是否可以通过AC获得
                //isSelect:input是否为select
                resultObj[key]={value:'',originalValue:'',isSelect:false,selectOption:[],isQueryAutoComplete:false,isCRUDAutoComplete:false,autoCompleteCollField:'',suggestList:{},blur:false,focus:true,inputDataType:temInputDataType,inputIcon:"",chineseName:tmpChineseName,errorMsg:"",validated:'undefined'}
            }else{
                //如果值是对象，递归调用
                if('object'===typeof obj[key]){
                    let currentLvl=level-1
                    //console.log(currentLvl)
                    generateClientInputAttr(obj[key],currentLvl,resultObj[key])
                }
                /*                else{
                 obj[key]={}
                 //func()
                 }*/
            }
        }
    }
    // return resultObj
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
    generateClientRule,
    deleteNonNeededObject,
    objectIdToRealField,
    generateClientInputAttr,
    genSelectedAC,
}

genSelectedAC()