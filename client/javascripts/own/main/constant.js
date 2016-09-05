/**
 * Created by ada on 2016/9/5.
 */
var app=angular.module('contDefine')
app.constant('cont',{
    asideName:{configuration:'配置信息',bill:'单据信息'},//aside菜单名称
    //根据dbstructure设置查询条件
    filterField:
    {
         department: {
             name: {
                 value: '',
                 originalValue: '',
                 blur: false,
                 focus: true,
                 inputDataType: 'text',
                 inputIcon: '',
                 chineseName: '部门名称',
                 valid: undefined,
                 errorMsg: ''
             },
             parentDepartment: {
                 value: '',
                 originalValue: '',
                 blur: false,
                 focus: true,
                 inputDataType: 'text',
                 inputIcon: '',
                 chineseName: '上级部门',
                 valid: undefined,
                 errorMsg: ''
             },
         },
        employee: {
            name: {
                value: '',
                originalValue: '',
                blur: false,
                focus: true,
                inputDataType: 'text',
                inputIcon: '',
                chineseName: '员工姓名',
                valid: undefined,
                errorMsg: ''
            },
            leader: {
                value: '',
                originalValue: '',
                blur: false,
                focus: true,
                inputDataType: 'text',
                inputIcon: '',
                chineseName: '上级主管',
                valid: undefined,
                errorMsg: ''
            },
            department: {
                value: '',
                originalValue: '',
                blur: false,
                focus: true,
                inputDataType: 'text',
                inputIcon: '',
                chineseName: '所属部门',
                valid: undefined,
                errorMsg: ''
            },
            onBoardDate: {
                value: '',
                originalValue: '',
                blur: false,
                focus: true,
                inputDataType: 'date',
                inputIcon: '',
                chineseName: '入职日期',
                valid: undefined,
                errorMsg: ''
            },
        },
            /*        cDate:
             { value: '',
             originalValue: '',
             blur: false,
             focus: true,
             inputDataType: 'date',
             inputIcon: '',
             chineseName: '创建日期',
             valid: undefined,
             errorMsg: '' },
             uDate:
             { value: '',
             originalValue: '',
             blur: false,
             focus: true,
             inputDataType: 'date',
             inputIcon: '',
             chineseName: '修改日期',
             valid: undefined,
             errorMsg: '' },
             dDate:
             { value: '',
             originalValue: '',
             blur: false,
             focus: true,
             inputDataType: 'date',
             inputIcon: '',
             chineseName: '删除日期',
             valid: undefined,
             errorMsg: '' } },*/
            billType: {
                name: {
                    value: '',
                    originalValue: '',
                    blur: false,
                    focus: true,
                    inputDataType: 'text',
                    inputIcon: '',
                    chineseName: '单据类别',
                    valid: undefined,
                    errorMsg: ''
                },
                parentBillType: {
                    value: '',
                    originalValue: '',
                    blur: false,
                    focus: true,
                    inputDataType: 'text',
                    inputIcon: '',
                    chineseName: '父类别',
                    valid: undefined,
                    errorMsg: ''
                },
            },
            /*cDate:
             { value: '',
             originalValue: '',
             blur: false,
             focus: true,
             inputDataType: 'date',
             inputIcon: '',
             chineseName: '创建日期',
             valid: undefined,
             errorMsg: '' },
             uDate:
             { value: '',
             originalValue: '',
             blur: false,
             focus: true,
             inputDataType: 'date',
             inputIcon: '',
             chineseName: '修改日期',
             valid: undefined,
             errorMsg: '' },
             dDate:
             { value: '',
             originalValue: '',
             blur: false,
             focus: true,
             inputDataType: 'date',
             inputIcon: '',
             chineseName: '删除日期',
             valid: undefined,
             errorMsg: '' } },*/
            bill: {
                title: {
                    value: '',
                    originalValue: '',
                    blur: false,
                    focus: true,
                    inputDataType: 'text',
                    inputIcon: '',
                    chineseName: '单据抬头',
                    valid: undefined,
                    errorMsg: ''
                },
                content: {
                    value: '',
                    originalValue: '',
                    blur: false,
                    focus: true,
                    inputDataType: 'text',
                    inputIcon: '',
                    chineseName: '单据内容',
                    valid: undefined,
                    errorMsg: ''
                },
                billType: {
                    value: '',
                    originalValue: '',
                    blur: false,
                    focus: true,
                    inputDataType: 'text',
                    inputIcon: '',
                    chineseName: '单据类别',
                    valid: undefined,
                    errorMsg: ''
                },
                billDate: {
                    value: '',
                    originalValue: '',
                    blur: false,
                    focus: true,
                    inputDataType: 'date',
                    inputIcon: '',
                    chineseName: '单据日期',
                    valid: undefined,
                    errorMsg: ''
                },
                amount: {
                    value: '',
                    originalValue: '',
                    blur: false,
                    focus: true,
                    inputDataType: 'text',
                    inputIcon: '',
                    chineseName: '报销金额',
                    valid: undefined,
                    errorMsg: ''
                },
                reimburser: {
                    value: '',
                    originalValue: '',
                    blur: false,
                    focus: true,
                    inputDataType: 'text',
                    inputIcon: '',
                    chineseName: '报销员工',
                    valid: undefined,
                    errorMsg: ''
                },
            }
            /*cDate:
             { value: '',
             originalValue: '',
             blur: false,
             focus: true,
             inputDataType: 'date',
             inputIcon: '',
             chineseName: '创建日期',
             valid: undefined,
             errorMsg: '' },
             uDate:
             { value: '',
             originalValue: '',
             blur: false,
             focus: true,
             inputDataType: 'date',
             inputIcon: '',
             chineseName: '修改日期',
             valid: undefined,
             errorMsg: '' },
             dDate:
             { value: '',
             originalValue: '',
             blur: false,
             focus: true,
             inputDataType: 'date',
             inputIcon: '',
             chineseName: '删除日期',
             valid: undefined,
             errorMsg: '' } } */
    },

    
})