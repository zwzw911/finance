/**
 * Created by wzhan039 on 2016-09-19.
 */

var validateFunc=require('../server/assist/misc-compiled').func.validate

var checkRule=validateFunc._private.checkRuleBaseOnRuleDefine
var sanityRule=validateFunc._private.sanityRule

var rule=require('../server/define/validateRule/inputRule').inputRule

//对每个coll单独进行检测
for (let singleColl in rule){
    let result=checkRule(rule[singleColl])
    if(result.rc>0){
        console.log(result)
        return false
    }

}

let sanityResult=sanityRule(rule)
console.log(sanityResult)
// if(sanityResult.rc>0){console.log(sanityResult)}

console.log('done')
return true
