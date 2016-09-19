/**
 * Created by wzhan039 on 2016-09-19.
 */

var checkInputFunc=require('../server/assist/misc-compiled').func.validate._private.checkRuleBaseOnRuleDefine
var rule=require('../server/define/validateRule/inputRule').inputRule

//对每个coll单独进行检测
for (let singleColl in rule){
    let result=checkInputFunc(rule[singleColl])
    if(result.rc>0){
        console.log(result)
        return false
    }

}
console.log('done')
return true
