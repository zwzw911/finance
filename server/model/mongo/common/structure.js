/**
 * Created by wzhan039 on 2015-07-08.
 */
//var inputDefine=require('../assist/input_define').inputDefine;
/*var uploadDefine=require('../assist/upload_define').uploadDefine;
var ueditor_config=require('../assist/ueditor_config').ue_config;
var input_validate=require('../error_define/input_validate').input_validate;*/
//var micellaneous=require('../assist_function/miscellaneous').func
var mongoose=require('./connection').mongoose;


var mongoSetting=require('../../../config/global/defaultGlobalSetting').mongoSetting

var inputRule=require('../../../define/validateRule/inputRUle').inputRule


var collections=['department','employee','billType','bill']


var schemaOptions={
    autoIndex:true, //if true,每次app启动，moogoose都会发送ensureIndex给每个index，可能影响性能。
    bufferCommands:false,	//如果mongodb没有启动，moogoose会缓存命令。
	//capped:	//本collection为capped（环形集合，超出最大数量后，新的覆盖老的。插入速度极快）
	//collection: //collection默认名字是在Model中设置的，为了自定义collection的名称，可以设置此选项
	//emitIndexErrors：	//设为true，则当mongoose发出ensureIndex，但是失败后，会在model产生一个error事件
	//id:	//vitual getter，用model初始化后的document，可以通过这个方法直接获得objectId（这是mogoose产生的，还没有存入mongodb）
    _id:true,//schema中不用显示设置objectid，mongoose会自动产生objectId
    minimize:true,	//如果schema中的field是对象，则minimize=true时，当document中此field为空**对象**，此doc被save时，空对象的字段不会被保存
	//read:,	//设置read的优选项：primary(default 只从primary读)/primaryPrefered（主要从P，如果P挂掉，从S读）/secondary/secondaryPrefered/nearest（从网络延迟最下的读,需要在connect时候设置var options = { replset: { strategy: 'ping' }};）
    safe:true,	//设为true，如果出错，返回error到callback。设为{j:1,w:2,wtimeout:5000}，除了error返回callback，还能保证写操作被提交到日志和至少2个rep中，并且写操作超过5秒就超时
    Strict:true,//默认true，如果要保存的数据中，字段没有在schema中定义，数据将无法保存。也可以设置成throw，如此便抛出错误，而不是仅仅drop数据。
	//shardKey:{f1:1,f2:1}		//为collection设置shardKey（每个schema不同）
	//toJSON,		//类似toObject，除了还可以使用JSON.stringify(doc)
	//toObject,
    validateBeforeSave:mongoSetting.schemaOptions.validateBeforeSaveFlag,		//true: 在保存（save or update）数据到DB的时候自动调用validate方法进行验证（包括mongoose内定和用户自定义validator）并保存；false:需要手工调用validate方法进行验证（内定和自定义），并且可以保存不合格数据（即需要自己做数据验证来决定是否可以保存；不做自定义验证的话，任何数据都可以保存了）
	//versionKey,		//（**不要设成false除非你知道自己在干啥**）。 设置version key的名称，默认是__v,可以生成任意字符串。
	//skipVersion,		//**不要设置除非你知道自己在干啥**
	//timestamps:{createAt:'cDate',updateAt:'uDate'},		//mongoose为schema包含createAt和updateAt字段，当然名字可以自己设定。但是可能需要手工填充日期时间。所以还是直接在schema中显示设置对应field，并为field设置default，以便可以自动填充日期
	//useNestedStrict:	//当false的时候，使用schema顶层的strict设置；true的时候，使用sub-document的strict设置
};
//convert mongodb data to objet, so that nodejs can manipulate directly
var toObjectOptions={
    getters:true,//apply all getters (path and virtual getters)
    virtuals:true,//apply virtual getters (can override getters option)
    minimize:true,// remove empty objects (defaults to true)
    depopulate:false,//depopulate any populated paths, replacing them with their original refs (defaults to false)
    versionKey:false,//whether to include the version key (defaults to true)        //not include version key in result
    retainKeyOrder:false // keep the order of object keys. If this is set to true, Object.keys(new Doc({ a: 1, b: 2}).toObject()) will always produce ['a', 'b'] (defaults to false)
}


/*
* schema definition
* 内置validator的定义放在ruleDefine中
* required(all)/min_max(number)/enum_match_minLength_maxLength()
* */

/*                           department                        */
let fieldDefine={
    department:{//采用和inputRule一样的名字，以便之后用for循环添加内置validator
        name:{type:String,unique:true},//全部设成{}，即使只有type定义，以便之后添加validator
        parentDepartment:{type:mongoose.Schema.Types.ObjectId,ref:"departments"},
        cDate:{type:Date,default:Date.now},
        uDate:{type:Date,default:Date.now},
        dDate:{type:Date},
    },
    employee:{
        name:{type:String},
        leader:{type:mongoose.Schema.Types.ObjectId,ref:"employees"},
        department:{type:mongoose.Schema.Types.ObjectId,ref:"departments"},
        onBoardDate:{type:Date},
        cDate:{type:Date,default:Date.now},
        uDate:{type:Date,default:Date.now},
        dDate:{type:Date},
    },
    billType:{
        name:{type:String,unique:true},
        parentBillType:{type:mongoose.Schema.Types.ObjectId,ref:"billTypes"},
        cDate:{type:Date,default:Date.now},
        uDate:{type:Date,default:Date.now},
        dDate:{type:Date},
    },
    bill: {
        title:{type:String},
        content:{type:String},
        billType:{type:mongoose.Schema.Types.ObjectId,ref:"billTypes"},
        billDate:{type:Date},
        reimburser:{type:mongoose.Schema.Types.ObjectId,ref:"employees"},
        amount:{type:Number},
        cDate:{type:Date,default:Date.now},
        uDate:{type:Date,default:Date.now},
        dDate:{type:Date},
    }
}




/*
* 根据define/validateRule/validateRule的rule设置schema的rule
* */
//validateInput中的rule，在mongoose中对应的validator
let ruleMatch={
    require:'required',
    min:'min',
    max:'max',
    minLength:'minlength',
    maxLength:'maxlenght',
    format:'match',
}
//console.log(fieldDefine['department']['parentDepartment'])
/*                          设置validator                          */
//let departmentRule=inputRule.department
if(true===mongoSetting.schemaOptions.validateFlag){
    for(let singleCollectionsName in inputRule){//读取每个collection
        for(let singleFiled in inputRule[singleCollectionsName]){//读取每个collection下的字段（path）
            for(let singleItem in inputRule[singleCollectionsName][singleFiled]){//读取每个字段下的rule
                if(ruleMatch[singleItem]){//rule是否在mongo中有对应的内建validator
                    let singleItemValue=inputRule[singleCollectionsName][singleFiled][singleItem]
                    if(false!==singleItemValue['define']) {//一般而言，有define就可以判断为有validator，但是require比较特殊，只有true才认为有对应的定义
                        if(fieldDefine[singleCollectionsName][singleFiled]){//对应的field在mongo中有定义，则为此field添加validator
                            fieldDefine[singleCollectionsName][singleFiled][ruleMatch[singleItem]]=[]
                            fieldDefine[singleCollectionsName][singleFiled][ruleMatch[singleItem]].push(singleItemValue['define'])
                            //fieldDefine[singleCollectionsName][singleFiled][ruleMatch[singleItem]].push(singleItemValue['mongoError'])
                            let errorMsg=`错误代码${singleItemValue['mongoError']['rc']}:${singleItemValue['mongoError']['msg']}`
                            fieldDefine[singleCollectionsName][singleFiled][ruleMatch[singleItem]].push(errorMsg)//只能接受字符串
                        }
                    }
                }
            }
        }
    }
}


//console.log(fieldDefine['department']['parentDepartment'])


var departmentSchema=new mongoose.Schema(
    fieldDefine['department'],
    schemaOptions
)

var employeeSchema=new mongoose.Schema(
    fieldDefine['employee'],
    schemaOptions
)
var billTypeSchema=new mongoose.Schema(
    fieldDefine['billType'],
    schemaOptions
)

var billSchema=new mongoose.Schema(
    fieldDefine['bill'],
    schemaOptions
)


var departmentModel=mongoose.model('departments',departmentSchema)
var employeeModel=mongoose.model('employees',employeeSchema)
var billTypeModel=mongoose.model('billTypes',billTypeSchema)
var billModel=mongoose.model('bills',billSchema)

module.exports={
    departmentModel,
    employeeModel,
    billTypeModel,
    billModel,
    //以下export，为了mongoValidate
    collections:collections,
    fieldDefine,
} //
/*
/!*                              user                        *!/
var userSch=new mongoose.Schema({
        name:{type:String, unique:true},
        password:String,
        mobilePhone:Number,
        thumbnail:{type:String,default:'b10e366431927231a487f08d9d1aae67f1ec18b4.png'},
        //articles:[{type:mongoose.Schema.Types.ObjectId,ref:'articles'}],
        cDate:{type:Date,default:Date()},
        mDate:{type:Date,default:Date()},
        dDate:Date
    },
    schemaOptions
);

userSch.set('toObject',toObjectOptions)

userSch.path('name').validate(function(value){
    if(input_validate.user.name.require.define){
        return input_validate.user.name.type.define.test(value)
    }else{
        return (null===value || input_validate.user.name.type.define.test(value))
    }
})
//password had been hashed
userSch.path('password').validate(function(value){
    if(input_validate.user.password.require.define){
        return input_validate.user.password.encryptedPassword.define.test(value)
    }else{
        return (null===value || input_validate.user.password.encryptedPassword.define.test(value))
    }
})
userSch.path('mobilePhone').validate(function(value){
    if(input_validate.user.mobilePhone.require.define){
        return input_validate.user.mobilePhone.type.define.test(value)
    }else{
        return (null===value || input_validate.user.mobilePhone.type.define.test(value))
    }
})
userSch.path('thumbnail').validate(function(value){
    if(input_validate.user.thumbnail.require.define){
        return input_validate.user.thumbnail.type.define.test(value)
    }else{
        return (null===value || input_validate.user.thumbnail.type.define.test(value))
    }
})
userSch.virtual('mDateConv').get(function(){
    return this.mDate.toLocaleString()
    //return this.mDate.toLocaleDateString()+' '+this.mDate.toLocaleTimeString()
})
/!*userSch.virtual('cDateConv').get(function(){
    return this.cDate.toLocaleString()
    //return this.mDate.toLocaleDateString()+' '+this.mDate.toLocaleTimeString()
})*!/
var userModel=mongoose.model('users',userSch)//mongoose auto convert user to users, so directly use users as collection name



/!*                              key                             *!/
var keySch=new mongoose.Schema({
    key:{type:String,unique:true},
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);
keySch.set('toObject',toObjectOptions);

keySch.path('key').validate(function(value){
    if(input_validate.key.key.require.define){
        return input_validate.key.key.type.define.test(value)
    }else{
        return (null===value || input_validate.key.key.type.define.test(value))
    }
})
var keyModel=mongoose.model('keys',keySch);

/!*                              attachment                             *!/
var attachmentSch=new mongoose.Schema({
    hashName:{type:String,unique:true},//hashName sha1 40+4 ~ 40+5
    name:String,//100  compatilbe with windows
    storePath:String,// 1024 for linux(don't care windows,since server use Linux as OS)
    size:Number,//in byte
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);
attachmentSch.set('toObject',toObjectOptions);
attachmentSch.path('hashName').validate(function(value){
    if(input_validate.attachment.hashName.require.define){
        return input_validate.attachment.hashName.type.define.test(value)
    }else{
        return (null===value || input_validate.attachment.hashName.type.define.test(value))
    }
    //return (value != null && value.length>=input_validate.attachment.hashName.minLength.define && value.length<=input_validate.attachment.hashName.maxLength.define );// 44 ~ 45,后缀为3～4个字符
});
attachmentSch.path('name').validate(function(value){
    return (value != null && value.length<input_validate.attachment.name.maxLength.define &&  value.length>=input_validate.attachment.name.minLength.define);
});
attachmentSch.path('storePath').validate(function(value){
    return (value != null && value.length<input_validate.attachment.storePath.maxLength.define);
});
attachmentSch.path('size').validate(function(value){
    if(input_validate.attachment.size.define){
        return ((value != null) && (value<input_validate.attachment.size.maxLength.define));
    }else{
        return ((value === null) || (value<input_validate.attachment.size.maxLength.define));
    }
});

attachmentSch.virtual('cDateConv').get(function(){
    return this.cDate.toLocaleString()
    //return this.mDate.toLocaleDateString()+' '+this.mDate.toLocaleTimeString()
})
var attachmentModel=mongoose.model('attachments',attachmentSch);

/!*                          inner_image                                 *!/
/!*
*   用户可能upload图片后又删除，所以需要对上传的文本和数据库进行同步
*   因此需要单独表（而不是和attachment混在一起，否则处理麻烦）
*   结构和attachment基本一致
* *!/
var innerImageSch=new mongoose.Schema({
    hashName:{type:String,unique:true},//sha1 40+5
    name:String,//100   compatilbe with windows
    storePath:String,// 1024 for linux(don't care windows,since server use Linux as OS)
    size:Number,//in byte
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);
innerImageSch.set('toObject',toObjectOptions);
innerImageSch.path('hashName').validate(function(value){
    if(input_validate.innerImage.hashName.require.define){
        return input_validate.innerImage.hashName.type.define.test(value)
    }else{
        return (null===value || input_validate.innerImage.hashName.type.define.test(value))
    }
    //return (value != null && value.length>=input_validate.innerImage.hashId.minLength.define && value.length<=input_validate.innerImage.hashId.maxLength.define);//44 ~ 45,后缀为3～4个字符
});
innerImageSch.path('name').validate(function(value){
    return (value != null && value.length<input_validate.innerImage.name.maxLength.define && value.length>=input_validate.innerImage.name.minLength.define);
});
innerImageSch.path('storePath').validate(function(value){
    return (value != null && value.length<input_validate.innerImage.storePath.maxLength.define);
});
innerImageSch.path('size').validate(function(value){
    return ((value != null) && (value<=input_validate.innerImage.size.maxLength.define));//此处采用ueditor_config中的设置
});

innerImageSch.virtual('mDateConv').get(function(){
    return this.mDate.toLocaleString()
    //return this.mDate.toLocaleDateString()+' '+this.mDate.toLocaleTimeString()
})

var innerImageModel=mongoose.model('innerImages',innerImageSch);


/!*                          comment                                 *!/
/!*
 *   传统方式，无父-子关系
 * *!/
var commentSch=new mongoose.Schema({
    //_id:mongoose.Schema.Types.ObjectId,
    //为了方便populate出user的内容，需要添加articleId，以便直接查找comment，然后populate
    articleId:{type:mongoose.Schema.Types.ObjectId,ref:"articles"},
    user:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
    content:String,// 255
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);
commentSch.set('toObject',toObjectOptions);
commentSch.path('articleId').validate(function(value){
    if(input_validate.comment.articleId.require.define){
        return input_validate.comment.articleId.type.define.test(value)
    }else{
        return (null===value || input_validate.comment.articleId.type.define.test(value))
    }
    //return (value != null || input_validate.comment.articleId.type.define.test(value));
});
commentSch.path('user').validate(function(value){
    //return (value != null || value.length<input_validate.comment.user.type.define.test(value));
    if(input_validate.comment.user.require.define){
        return input_validate.comment.user.type.define.test(value)
    }else{
        return (null===value || input_validate.comment.user.type.define.test(value))
    }
});
commentSch.path('content').validate(function(value){
    return (value == null || value.length<input_validate.comment.content.maxLength.define);
});

commentSch.virtual('mDateConv').get(function(){
    return this.mDate.toLocaleString()
    //return this.mDate.toLocaleDateString()+' '+this.mDate.toLocaleTimeString()
})
var commentModel=mongoose.model('comments',commentSch);

/!*                                      article                                  *!/
var articleSch=new mongoose.Schema({
    //_id:objectId(),
    hashId:{type:String,unique:true}, //hash id 40
    title:String,
    state:{type:String,enum:['正在编辑','编辑完成'],default:'正在编辑'},
    author:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
    //keys:[{type:mongoose.Schema.Types.ObjectId,ref:'keys'}],
    keys:[String],
    innerImage:[{type:mongoose.Schema.Types.ObjectId,ref:'innerImages'}], //采用_id作为外键
    attachment:[{type:mongoose.Schema.Types.ObjectId,ref:'attachments'}],
    pureContent:String,
    htmlContent:String,
    comment:[{type:mongoose.Schema.Types.ObjectId,ref:'comments'}],
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
}, schemaOptions);
articleSch.set('toObject',toObjectOptions);
articleSch.path('hashId').validate(function(value){
    if(input_validate.article.hashId.require.define){
        return input_validate.article.hashId.type.define.test(value)
    }else{
        return (null===value || input_validate.article.hashId.type.define.test(value))
    }
    //return value!=null && input_validate.article.hashId.type.define.test(value);
})
articleSch.path('title').validate(function(value){
    return value!=null && value.length>=input_validate.article.title.minLength.define && value.length<=input_validate.article.title.maxLength.define ;
})
articleSch.path('author').validate(function(value){
    if(input_validate.article.author.require.define){
        return input_validate.article.author.type.define.test(value)
    }else{
        return (null===value || input_validate.article.author.type.define.test(value))
    }
    //return value!=null && input_validate.article.author.type.define.test(value)
})
articleSch.path('keys').validate(function(value){
    if( value==[] || null===value ){return true}
    if(value.length<=input_validate.article.keys.maxSize.define){
        for(var i=0;i<value.length;i++){
            if(!input_validate.article.keys.type.define.test(value[i])){
                return false
            }
        }
    }
    return true
})

articleSch.path('innerImage').validate(function(value){
    if( value==[] || null===value ){return true}
    if(value.length<=input_validate.article.innerImage.maxSize.define){
        for(var i=0;i<value.length;i++){
            if(!input_validate.article.innerImage.type.define.test(value[i])){
                return false
            }
        }
    }
    return true
})
articleSch.path('attachment').validate(function(value){
    if( value==[] || null===value ){return true}
    if(value.length<=input_validate.article.attachment.maxSize.define){
        for(var i=0;i<value.length;i++){
            if(!input_validate.article.attachment.type.define.test(value[i])){
                return false
            }
        }
    }
    return true
})
articleSch.path('pureContent').validate(function(value){
    return null===value || value.length<input_validate.article.pureContent.maxLength.define
})
articleSch.path('htmlContent').validate(function(value){
    return null===value || value.length<input_validate.article.htmlContent.maxLength.define;
})

articleSch.virtual('mDateConv').get(function(){
    return this.mDate.toLocaleString()
})
innerImageSch.virtual('cDateConv').get(function(){
    return this.cDate.toLocaleString()
    //return this.mDate.toLocaleDateString()+' '+this.mDate.toLocaleTimeString()
})

var articleModel=mongoose.model('articles',articleSch);
//var commentModel=mongoose.model('comment',commentSch);

/!*                  folder                      *!/
var folderSch=new mongoose.Schema({
        folderName:{type:String},//255 infact, in Linux, the max lenght can be 1024, but for easy to use, just use 255
        owner:{type:mongoose.Schema.Types.ObjectId,ref:'users'},
        parentId:{type:mongoose.Schema.Types.ObjectId,ref:'folders'},
        level:Number,//当前目录的层数,从1开始计算
        cDate:Date,
        mDate:{type:Date,default:Date()},
        dDate:Date
    },
    schemaOptions
);
folderSch.set('toObject',toObjectOptions)
folderSch.path('folderName').validate(function(value){
    return (value!=null && input_validate.folder.folderName.type.define.test(value))
})
folderSch.path('owner').validate(function(value){
    return (value!=null && input_validate.folder.owner.type.define.test(value))
})
folderSch.path('parentId').validate(function(value){
    //对于用户的根目录,是没有parent目录的
    return (value==null || input_validate.folder.parentId.type.define.test(value))
})
folderSch.path('level').validate(function(value){
    return (value!=null && input_validate.folder.level.range.define.min<=value &&  input_validate.folder.level.range.define.max>=value)
})
folderSch.virtual('mDateConv').get(function(){
    return this.mDate.toLocaleString()
})
/!*folderSch.virtual('cDateConv').get(function(){
    return this.cDate.toLocaleString()
})*!/
var folderModel=mongoose.model('folders',folderSch);

/!**********************************************************************!/
/!**********************************************************************!/
/!*                          relation                                    *!/
/!**********************************************************************!/
/!**********************************************************************!/


/!*                      key-article                                     *!/
//为了搜索方便
var keyArticleSch=new mongoose.Schema({
    articleId:{type:mongoose.Schema.Types.ObjectId,ref:'articles'},
    keyId:{type:mongoose.Schema.Types.ObjectId,ref:'keys'}
},schemaOptions)
keyArticleSch.set('toObject',toObjectOptions)
keyArticleSch.path('articleId').validate(function(value){
    return (value!=null && input_validate.keyArticle.articleId.validateError.define.test(value))
})
keyArticleSch.path('keyId').validate(function(value){
    return (value!=null && input_validate.keyArticle.keyId.validateError.define.test(value))
})
var keyArticleModel=mongoose.model('keyArticles',keyArticleSch);


/!*                           article in folder                       *!/
var articleFolderSch=new mongoose.Schema({
        articleId:{type:mongoose.Schema.Types.ObjectId,ref:'articles'},
        folderId:{type:mongoose.Schema.Types.ObjectId,ref:'personalArticles'},
        cDate:Date,
        mDate:{type:Date,default:Date()},
        dDate:Date
    },
    schemaOptions
);
articleFolderSch.set('toObject',toObjectOptions)
articleFolderSch.path('articleId').validate(function(value){
    return (value!=null &&input_validate.articleFolder.articleId.type.define.test(value))
})
articleFolderSch.path('folderId').validate(function(value){
    return (value!=null &&input_validate.articleFolder.folderId.type.define.test(value))
})
var articleFolderModel=mongoose.model('articleFolders',articleFolderSch);


var errorSch=new mongoose.Schema({
    errorCode:Number, //new define file
    errorMsg:String, //new define file
    category:String,// which page
    subCategory:String,
    desc:String,//more detail information
    priority:String,
    cDate:Date,
    mDate:{type:Date,default:Date()},
    dDate:Date
},schemaOptions);
errorSch.set('toObject',toObjectOptions);
var errorModel=mongoose.model('errors',errorSch);





exports.userModel=userModel;
exports.articleModel=articleModel;
exports.keyModel=keyModel;
exports.attachmentModel=attachmentModel;
exports.innerImageModel=innerImageModel;
exports.errorModel=errorModel;
exports.commentModel=commentModel;
exports.folderModel=folderModel;
exports.keyArticleModel=keyArticleModel;
exports.articleFolderModel=articleFolderModel
//exports.readArticle=readArticle;*/
