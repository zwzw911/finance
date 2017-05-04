/**
 * Created by wzhan039 on 2017-05-02.
 */
'use strict'
var businessLogicalError={
    createUpdate:{
        //80000~80099
        billType:{
            parentBillTypeCantContainInOut:{rc:80000,msg:{client:"单据类型不正确",server:"父单据类型不能包含支取"}},
            childBillTypeMustContainInOut:{rc:80002,msg:{client:"单据类型不正确",server:"子单据类型必须包含支取"}},
        },
        //80100~80199
        bill:{
            billTypeInCorrect:{rc:80100,msg:{client:'单据类型不正确',server:'单据类型必须有parentBillType和inOut字段'}},
        }
    },
 /*   update:{
        //80500~80599
        billType:{
            parentBillypeCantContainInOut:{rc:80500,msg:{client:"单据类型不正确",server:"父单据类型不能包含支取"}},
            childBillypeMustContainInOut:{rc:80502,msg:{client:"单据类型不正确",server:"子单据类型必须包含支取"}},
        },
        //80600~80699
        bill:{
            billTypeInCorrect:{rc:80600,msg:{client:'单据类型不正确',server:'单据类型必须有parentBillType和inOut字段'}},
        }
    },*/
}

module.exports={
    businessLogicalError
}