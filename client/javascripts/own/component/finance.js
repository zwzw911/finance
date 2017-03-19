/**
 * Created by ada on 2016/9/15.
 */
'use strict'
/*      for webpack     */
// require('./component')


var financeApp=angular.module('finance',['component']);

financeApp.factory('financeHelper',function($http,$q,inputAttrHelper,commonHelper,modal,modalChoice,paginationHelper){
/*    //根据inputAttr的内容，生成合适的values，以便server处理
    var generateInputValue=function(inputAttr){
        let values={}
        for(let key in inputAttr){
            if(inputAttr[key] && inputAttr[key]['value']){
                values[key]={}
                values[key]['value']=inputAttr[key]['value']
            }
        }
        return values
    }*/
    modal.setModalId('modalCommon')

    modalChoice.setModalId('modalChoice')

    var dataOperator=
    {
        //billType: {
        //idx无用，只是为了统一使用参数(create和update同样在modal上操作，使用同一个按钮)
        //成功添加一个记录后，无论当前页码是多少，都要返回第一页
        'create': function (idx, inputAttr, recorder, selectAC, fkConfig, eColl, aDateToBeConvert,pagination) {
            //首先加入db（加入db时，angular已经执行过value的检测，因此无需再次执行inputCheck）
            //从inputAttr提取数据，转换成{field1:{value1:xxx},field2:{value2:yyy}}如果是select，则从value(中文)转换成key(英文)
            let value = inputAttrHelper.convertedInputAttrFormatCreate(inputAttr)
            // console.log(`converted value is ${JSON.stringify(value)}`)
            //convertedValue['newAddedRecorder']=value
            //转换外键的格式
            for (let singleFKField in fkConfig) {
                inputAttrHelper.convertSingleACFormat(singleFKField, selectAC, value)
            }
            let paginationInfo=pagination.paginationInfo
            let url = '/' + eColl
            // value['currentPage']=
            $http.post(url, {values:{recorderInfo:value,'currentPage':paginationInfo.currentPage}}).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //直接对整个返回的记录数组进行enum的转换（单独使用convertRecorderEnumData，效率较高）
                    data.msg['recorder'].map(
                        (singleRecorder,idx)=>{
                            commonHelper.convertSingleRecorderEnumData(singleRecorder,inputAttr)
                        }
                    )

                    //对server返回的数据中的日期进行格式化，并删除nestedPrefix字段
                    if (null !== data.msg && null !==data.msg.recorder) {
                        data.msg.recorder.map(
                            (ele,idx)=>{
                                commonHelper.convertDateTime(ele, aDateToBeConvert)
                                //检查外键是否存在，存在的话，将外键object转换成字符
                                // console.log(`before FK format result ${JSON.stringify(data.msg)}`)
                                //需要删除nestedPrefix字段
                                for (let singleFKField in fkConfig) {
                                    let nestedPrefix = fkConfig[singleFKField]['nestedPrefix']
                                    delete data.msg.recorder[nestedPrefix]
                                }

                                // console.log(`after FK format result ${JSON.stringify(data.msg.recorder)}`)
                            }
                        )


                        if(1===data.msg.recorder.length){
                            recorder.splice(0,0,data.msg.recorder[0])

                        }
                        if(1<data.msg.recorder.length){
                            //清空记录
                            recorder.splice(0,data.msg.recorder.length)
                            //全部添加第一页的记录
                            data.msg.recorder.map(
                                (ele,idx)=>{
                                    recorder.push(ele)
                                }
                            )

                        }
                        //添加后，记录数量超过pageSize，删除多余记录（可能不止一条？）
                        if(recorder.length>paginationInfo.pageSize){
                            let startIdx=paginationInfo.pageSize
                            let deleteNum=recorder.length-paginationInfo.pageSize
                            recorder.splice(startIdx,deleteNum)
                        }

                        //设置分页
                        let a=paginationHelper.generateClientPagination(data.msg['paginationInfo'])
                        Object.assign(pagination,a)
                        //recorder.push(data.msg)
                        modal.showInfoMsg('记录添加成功')
                    }

                    //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                } else {
                    modal.showErrMsg(JSON.stringify(data.msg))
                }
            }).error(function () {
                // console.log('err')
            })
            //然后加入client数据，防止多次返回
            //_angularDataOp.create(idx,inputAttr,recorder)
        },

        //delete返回的是删除记录后，当前页 的数据
        //fkConfig: 清楚数组中多余的字段
        //dateField: 转换日期格式
        'delete': function (idx, recorder, eColl,convertedValue,fkConfig,aDateToBeConvert,pagination) {
            //URL中的id用于告知删除哪个
            // console.log(`convertedValue is ${JSON.stringify(convertedValue)}`)
            let url = '/' + eColl + '/delete/' + recorder[idx]['_id']
            //删除后，还是留在原来的页上，因此必须上传 searchParams和currentPage
            $http.post(url, {values:convertedValue}).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //设置分页
                    let a=paginationHelper.generateClientPagination(data.msg['paginationInfo'])
                    Object.assign(pagination,a)

                    if (data.msg.recorder) {
                        let returnRecorderLength = data.msg.recorder.length
                        // console.log(`recorder length is ${returnRecorderLength}`)
                        // console.log(`return pagination  is ${JSON.stringify(pagination)}`)
                        //删除最后一页上的一个记录，且删完后最后一页还有其他记录;则只需删除对应的记录
                        if(0===returnRecorderLength){
                            recorder.splice(idx,1)
                            return true
                        }
                        //删除非最后一页的一个记录，则最后补充一个记录
                        if(1===returnRecorderLength){
                            recorder.splice(idx,1)
                        }
                        //删除最后一页的一个记录，且此记录为最后一页的唯一记录；则删完后要跳转到前一页(recorder清空，并压入前一页的所有值)
                        if (pagination.paginationInfo.pageSize==returnRecorderLength) {
                            // console.log(`recorder before splice is ${JSON.stringify(recorder)}`)
                            recorder.splice(0,recorder.length)
                            // console.log(`recorder after splice is ${JSON.stringify(recorder)}`)
                        }

                        //因为返回的记录是数组，所有可以同一个过程压入数据
                        data.msg.recorder.map(
                            (ele, idx)=> {
                                commonHelper.convertDateTime(ele, aDateToBeConvert)
                                //需要删除nestedPrefix字段
                                for (let singleFKField in fkConfig) {
                                    let nestedPrefix = fkConfig[singleFKField]['nestedPrefix']
                                    delete data.msg['recorder'][nestedPrefix]
                                }
                                recorder.push(ele)
                            }
                        )
                    }



/*                    recorder.splice(0, recorder.length)   //清空数组
                    //console.log(`after empty array is ${JSON.stringify(recorder)}`)
                    data.msg['recorder'].forEach(function (e) {
                        commonHelper.convertDateTime(e, aDateToBeConvert)
                        //需要删除nestedPrefix字段
                        for (let singleFKField in fkConfig) {
                            let nestedPrefix = fkConfig[singleFKField]['nestedPrefix']
                            delete data.msg[nestedPrefix]
                        }
                        /!*                            if(e.parentBillType && e.parentBillType.name){
                         console.log('in')
                         e.parentBillType=e.parentBillType.name
                         }*!/
                        recorder.push(e)*/

/*                    console.log(`after push array is ${JSON.stringify(recorder)}`)

                    pagination.paginationInfo=data.msg['paginationInfo']

                    if(null===pagination.pageRange){
                        pagination.pageRange=[]
                    }
                    if(null!==pagination.pageRange){
                        pagination.pageRange.splice(0, pagination.pageRange.length)
                    }
                    for(let i=pagination.paginationInfo.start;i<=pagination.paginationInfo.end;i++){
                        let ele={}
                        ele['pageNo']=i
                        ele['active']=false
                        if(i===pagination.paginationInfo.currentPage){
                            ele['active']=true
                        }

                        pagination.pageRange.push(ele)
                    }*/
                    //console.log(`generate page range is ${JSON.stringify(pagination.pageRange)}`)
                    // recorder=data.msg
                    //console.log(`page info is ${JSON.stringify(pagination)}`)

                } else {
                    modal.showErrMsg(data.msg)
                }
            }).error(function (data, status, header, config) {

            })
            //然后更新client端数据
            //_angularDataOp.delete(idx, recorder)
        },
        'update': function (idx, inputAttr, recorder, selectAC, fkConfig, eColl, aDateToBeConvert) {
            //首先更新数据到db（更新db时，angular已经执行过value的检测，因此无需再次执行inputCheck）
            //将修改过的值上传修改
            let value = inputAttrHelper.convertedInputAttrFormatUpdate(inputAttr)
// console.log(`update op convert result is ${JSON.stringify(value)}`)
            //将外键的id转换成server可以接收的格式
            for (let singleFKField in fkConfig) {
                inputAttrHelper.convertSingleACFormat(singleFKField, selectAC, value)
            }

            // console.log(`value 1 is ${JSON.stringify(value)}`)
            //添加要更新记录的_id。必须使用_id（server只认识_id）
            // console.log(`idx is ${idx},recorder is ${JSON.stringify(recorder[idx])}`)
            value['_id'] = {value: recorder[idx]['_id']}
            // console.log(`value 2 is ${JSON.stringify(value)}`)
            //Object.assign(value,selectAC)
            let url = '/' + eColl
            //只是为了凑齐格式，其实update无需currentPage
            $http.put(url, {values: {'recorderInfo':value,'currentPage':1}}).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //直接对整个返回的记录数组进行enum的转换（单独使用convertRecorderEnumData，效率较高）
                    //update返回一个记录（非数组格式），且包含在data.msg中
                    commonHelper.convertSingleRecorderEnumData(data.msg,inputAttr)
                    //对server返回的数据中的日期进行格式化
                    //console.log(`before date format result ${JSON.stringify(returnResult.msg)}`)
                    commonHelper.convertDateTime(data.msg, aDateToBeConvert)
                    //需要删除nestedPrefix字段
                    for (let singleFKField in fkConfig) {
                        let nestedPrefix = fkConfig[singleFKField]['nestedPrefix']
                        delete data.msg[nestedPrefix]
                    }
                    /*                        // 外键用name/title替换（不显示ObjectId）
                     for(let singleFKField in fkConfig){
                     let aRedundancyFields=fkConfig[singleFKField]['fields']
                     //每个fk可能对应多个冗余field
                     for(let singleField of aRedundancyFields){
                     if(data.msg[singleFKField] && data.msg[singleFKField][singleField]){
                     if(undefined===data.msg[singleFKField]){
                     data.msg[singleFKField]=data.msg[singleFKField][singleField]
                     }
                     }
                     }
                     }*/
                    /*                        if(data.msg.parentBillType && data.msg.parentBillType.name){
                     data.msg.parentBillType=data.msg.parentBillType.name
                     }*/
                    for (let singleField in data.msg) {
                        recorder[idx][singleField] = data.msg[singleField]
                    }
                    //console.log(`date format result ${JSON.stringify(returnResult.msg)}`)
                } else {
                    modal.showErrMsg(JSON.stringify(data.msg))
                }
            }).error(function () {
                console.log('err')
            })
        },
        'readName': function (name, eColl,callerColl) {
            let url = '/' + eColl + '/name/'
            return $http.post(url, {values: name,caller:callerColl}, {})
        },
        'search': function (recorder, queryValue, fkConfig, eColl, aDateToBeConvert,pagination,inputAttr) {
// console.log(`search input attr is ${JSON.stringify(inputAttr)}`)
            let url = '/' + eColl + "/" + "search"
            return  $http.post(url, {values: queryValue}).success(function (data, status, header, config) {
                if (0 === data.rc) {
                    //直接对整个返回的记录数组进行enum的转换（单独使用convertRecorderEnumData，效率较高）
                    //直接对整个返回的记录数组进行enum的转换（单独使用convertRecorderEnumData，效率较高）
                    data.msg['recorder'].map(
                        (singleRecorder,idx)=>{
                            commonHelper.convertSingleRecorderEnumData(singleRecorder,inputAttr)
                        }
                    )
                    //对server返回的数据中的日期进行格式化
                    //console.log(`read result is ${JSON.stringify(data.msg)}`)

                    recorder.splice(0, recorder.length)   //清空数组
                    //console.log(`after empty array is ${JSON.stringify(recorder)}`)
                    data.msg['recorder'].forEach(function (e) {
                        commonHelper.convertDateTime(e, aDateToBeConvert)
                        //需要删除nestedPrefix字段
                        for (let singleFKField in fkConfig) {
                            let nestedPrefix = fkConfig[singleFKField]['nestedPrefix']
                            delete data.msg[nestedPrefix]
                        }

                        recorder.push(e)
                    })
                    //console.log(`after push array is ${JSON.stringify(recorder)}`)
                    let a=paginationHelper.generateClientPagination(data.msg['paginationInfo'])
                    Object.assign(pagination,a)

                    // console.log(`page info is ${JSON.stringify(pagination)}`)

                    // htmlHelper.adjustFooterPosition()
                } else {
                    modal.showErrMsg(JSON.stringify(data.msg))
                }
            }).error(function () {
                console.log('err')
            })
        },
        'getCurrentCapital':function(){
            let url="/bill/static/getCurrentCapital"
            let deferred=$q.defer()
            $http.post(url,{}).success(function(data, status, header, config){
                if(0===data.rc){
                    let currentCapital=[],totalCurrentCapital=null
                    //获得各个分组
                    for(let topBillTyeEle of data.msg.data){
                        let sumAmount=eval(topBillTyeEle.join('+'))
                        currentCapital.push(sumAmount)
                    }
                    //获得各分组的总计
                    totalCurrentCapital=eval(currentCapital.join('+'))
                    // structure=data.msg.structure
                    deferred.resolve({rc:0,msg:{"currentCapital":currentCapital,"totalCapital":totalCurrentCapital,"billTypeStructure":data.msg.structure}})
                    // console.log(`current captial array is ${JSON.stringify(currentCapital)}`)
                    // console.log(`totalCurrentCapital is ${JSON.stringify(totalCurrentCapital)}`)
                }else{
                    modal.showErrMsg(JSON.stringify(data.msg))
                    deferred.reject(data)
                }

            }).error(function(){

            })

            return deferred.promise
        },
        'getGroupCapital':function(searchParams,currentPage){
            // console.log(`pass in curentPage is ${currentPage}`)
            let url="/bill/static/getGroupCapital"
            let deferred=$q.defer()
            let groupCapital
            $http.post(url,{values:{"searchParams":searchParams,"currentPage":currentPage}}).success(function(data, status, header, config){
                if(0===data.rc){
                    groupCapital=data.msg
                    deferred.resolve({rc:0,'groupCapital':groupCapital})
                    // console.log(`getGroupCapital is${JSON.stringify(groupCapital)}`)
                }else{
                    modal.showErrMsg(JSON.stringify(data.msg))
                }

            }).error(function(){

            })

            return deferred.promise
        },
        'getServerTime':function(){
            let deferred=$q.defer()
            let url="/getServerTime";
            return $http.get(url,{}) //返回promise，在mainController中通过success初始化日期
          /*  $http.get(url,{}).success(
                (data, status, header, config)=>{
                    console.log(`${JSON.stringify(data)}`)
                    deferred.resolve(data)
                }
            ).error(
                (data, status, header, config)=>{
                    console.log(`get server time failed`)
                    alert('get server time failed')
                    deferred.reject(false)
                }
            )*/
        }
    }

    return {
        dataOperator,
        //suggest_state
    }
})

//module.exports=financeApp.name