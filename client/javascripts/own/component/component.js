/**
 * Created by wzhan039 on 2016-08-18.
 */
    'use strict'
var app=angular.module('component',[]);
app.factory('basicHelper',function(){
    return {
        dataTypeCheck: {
            isNumber: function (value) {
                return isNaN(parseFloat(value))
            }

        },
    }
})
app.factory('helper',function(basicHelper){
    return {

        /*
        * leftOffset:覆盖元素的left和当前元素left 之间的offset。可正可负。
        * topOffset：覆盖元素的top和当前元素top 之间的offset。可正可负。
        * widthOffset：覆盖元素的width和当前元素width 之间的offset。可正可负。
        * heightOffset：覆盖元素的height和当前元素height 之间的offset。可正可负。
        * */
        setCoverEle:function(currentEleId,coveringEleId,offset={leftOffset:0,topOffset:0,widthOffset:0,heightOffset:0}){
            let errorMsg={
                eleNotExist:function(eleId){
                    return {rc:1,msg: `元素$(eleId)不存在`}
                },
                paramNotNumber:function(eleId){
                    return {rc:2,msg: `元素$(eleId)不是数值`}
                },
            }

            //1. 检测输入参数
            /*             let eleId={'currentEleId':currentEleId,'coveringEleId':coveringEleId}
           //只用getElementById用来判断元素是否存在，获取元素的属性使用jQuery
            //因为getElementById获得的元素在上级可以获得CSS属性，但是此函数无法获得。奇怪
            //jQuery可以稳定工作
            for(let singleEle in eleId){
                if(undefined===document.getElementById(eleId[singleEle])){
                    return  errorMsg.eleNotExist(singleEle)
                }
            }*/
            let currentEle=document.getElementById(currentEleId)
            if(undefined===currentEle){
                return  errorMsg.eleNotExist(currentEleId)
            }
            let coveringEle=document.getElementById(coveringEleId)
            if(undefined===coveringEle){
                return  errorMsg.eleNotExist(coveringEleId)
            }

            // let offset={'leftOffset':leftOffset,'topOffset':topOffset,'widthOffset':widthOffset,'heightOffset':heightOffset}
            for(let key in offset){
                if(basicHelper.dataTypeCheck.isNumber(offset[key])){return errorMsg.paramNotNumber(key)}
            }

            //offsetXXX（例如offsetLeft）在上级函数可以获得值，但是在此函数只能获得0.所以使用jQuery来获得元素的属性
            //let offsetParam={'offsetLeft':leftOffset,'offsetTop':topOffset,'offsetWidth':widthOffset,'offsetHeight':heightOffset}
            // let offsetParam={'left':leftOffset,'top':topOffset,'width':widthOffset,'height':heightOffset}
/*            let currentEleParam={},coveringEleParam={}
            // let currentEle=$('#'+currentEleId),coveringEle=$('#'+coveringEleId)

            //for(let key in offsetParam){
                //2. 获得当前ele的left/top/width/height
                //currentEleParam['left']=currentEle.left()
            //console.log(currentEleParam)
                //3. 计算覆盖元素的left/top/width/height
                coveringEleParam[key]=currentEleParam[key]+offsetParam[key]
            //}*/


            //4. 设置覆盖元素参数
/*            coveringEle.style.display='absolute'
            for(let key in offsetParam){
                coveringEle.style[key]=coveringEleParam[key]+'px'
            }*/
/*            console.log(currentEle.offsetLeft)
            console.log(currentEle.offsetTop)
            console.log(currentEle.offsetWidth)
            console.log(currentEle.offsetHeight)*/
            coveringEle.style.position='absolute'
            coveringEle.style.left=currentEle.offsetLeft+offset.leftOffset+'px'
            coveringEle.style.top=currentEle.offsetTop+offset.topOffset+'px'
            coveringEle.style.width=currentEle.offsetWidth+offset.widthOffset+'px'
            coveringEle.style.height=currentEle.offsetHeight+offset.heightOffset+'px'
/*            console.log(coveringEle.style.left)
            console.log(coveringEle.style.top)
            console.log(coveringEle.style.width)
            console.log(coveringEle.style.height)*/


        }
    }
})