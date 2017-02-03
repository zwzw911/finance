/**
 * Created by zw on 2015/8/18.
 */
    /*
    * total:记录总数
    * currentPage: 当前页码(数字)或者first/last（字符）
    * pageSize：每页显示记录数
    * pageLength：显示页的数量
    *
    * 结果：返回分页html的起始页码和结束页码，以及 前一页 后一页是否可得
    * */
var pagination=function({total,currentPage,pageSize=10,pageLength=10}){

    //如果输入参数不正确，设定默认值
/*    if(pageSize<0 || undefined===pageSize){pageSize=10}
    if(pageLength<0 || undefined===pageLength){pageLength=10}*/

    var totalPage=Math.ceil(total/pageSize)//用来定位page范围
    var showPrevious=false
    var showNext=false;
    var maxLoop=Math.ceil(totalPage/pageLength)//每次显示pageLength个页，总共可以显示多少次
    //显示的起始，结束页码
    var start,end;
    //var showPageNum=2*halfShowNum+1

    if(1===totalPage){
        start=end=1;//不需要分页组件
        showPrevious=showNext=false;
    }
    if('last'===currentPage || currentPage>totalPage){
        currentPage=totalPage
    }
    if('first'===currentPage ||currentPage<1){
        currentPage=1;
    }
    if(currentPage>0 && currentPage<=totalPage){
        //页码
        for(var i=0;i<maxLoop;i++){
            start=i*pageLength+1
            end=(i+1)*pageLength
            if(end>totalPage){
                end=totalPage
            }

            if(end>start && currentPage>=start && currentPage<=end){
                if(currentPage==start){
                    //当前页位于第一个loop的第一页
                    if(start==1){
                        showPrevious=false;
                    }else{
                        showPrevious=true
                    }
                    //当前页位于非第一个loop的第一个

                    if(end>start){
                        showNext=true
                    }else{
                        showNext=false
                    }
                }
                if(currentPage==end){
                    if(currentPage<totalPage){
                        showNext=true
                    }else{
                        showNext=false
                    }

                    if(currentPage>start){
                        showPrevious=true;
                    }else{
                        showPrevious=false;
                    }

                }
                if(currentPage<end && currentPage>start){
                    showNext=true;
                    showPrevious=true;
                }
                break
            }
            //当前页码范围只有一个页码，说明此页码是最后一个页码
            if(end===start && currentPage===start ){
                if(1===currentPage){
                    showNext=false
                    showPrevious=false;
                }
                 if(currentPage>1 && currentPage<totalPage){
                     showNext=true
                     showPrevious=true;
                 }
                if(currentPage>1 && currentPage===totalPage){
                    showNext=false
                    showPrevious=true;
                }
            }
        }
    }
    ////当前在客户端显示的所有页数对应的总记录数（以便client可以在不要求server的信息时，直接计算分页信息。用于添加记录时在client直接计算分页信息）
    // let totalRecorderNumberForShownPage=total >= end*pageSize ? end*pageSize:total
    //pageSize;返回给前端使用
    return {start:start,end:end,currentPage:currentPage,showPrevious:showPrevious,showNext:showNext,totalPage:totalPage,pageSize:pageSize,pageLength:pageLength,
        // totalRecorderNumberForShownPage:totalRecorderNumberForShownPage
    }
}

module.exports={
    pagination,
}