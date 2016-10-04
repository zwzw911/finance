/**
 * Created by wzhan039 on 2016-09-27.
 * 从globalSettingRule中抽取出default值，以便可以直接使用（而不用在写成 coll[filed]['default']的形式）
 */

var rule=require('../server/config/global/globalSettingRule').defaultSetting
var fs=require('fs')

function extractDefaultValue(rule){
    let result={}
    for(let singleSet in rule){
        result[singleSet]={}
        for(let singleField in rule[singleSet]){
            //if(undefined)
            result[singleSet][singleField]=rule[singleSet][singleField]['default']
        }
    }
    return result
}

//console.log(extractDefaultValue(rule))
fs.writeFile('../server/config/global/defaultGlobalSetting.js',JSON.stringify(extractDefaultValue(rule)))
//fs.writeFile('./defaultGlobalSetting.js',JSON.stringify(extractDefaultValue(rule)))