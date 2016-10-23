/**
 * Created by wzhan039 on 2016-10-04.
 */

module.exports={
    //60000~60100
    common:{
        unknownColl:{rc:60000,msg:{'client':'数据库操作错误，请联系管理员',server:'未知的集合名'}},
    },
    //60100~60200
    billType:{
        parentBillTypeNotExist:{rc:60100,msg:{client:'上级单据类型不存在',server:'parent billType id 不存在'}},
        parentCantBeSelf:{rc:60102,msg:{client:'上级单据类型不能设为自己',server:'parentBillType id 不能设成自己'}},
        billTypeNotExists:{rc:60106,msg:{client:'单据类型不存在',server:'billType id 不存在'}},
    },
    //60200~60300
    department:{
        parentDepartmentNotExist:{rc:60200,msg:{client:'上级部门不存在',server:'department id 不存在'}},
        parentCantBeSelf:{rc:60202,msg:{client:'上级部门不能设为自己',server:'parentDepartment id 不能设成自己'}},
        departmentNotExists:{rc:60206,msg:{client:'部门不存在',server:'department id 不存在'}},
    },
    //60300~60400
    employee:{
        departmentNotExist:{rc:60300,msg:{client:'所选部门不存在',server:'department id 不存在'}},
        leaderNotExist:{rc:60302,msg:{client:'上级主管不存在',server:'employee id 不存在'}},
        leaderCantBeSelf:{rc:60304,msg:{client:'主管不能设为自己',server:'leader id 不能设成自己'}},
        employeeNotExists:{rc:60306,msg:{client:'员工不存在',server:'employee id 不存在'}},
    },
    //60400~60500
    bill:{
        reimburserNotExist:{rc:60400,msg:{client:'报销员工不存在',server:'employee id 不存在'}},
        billTypeNotExist:{rc:60402,msg:{client:'报销类型不存在',server:'billType id 不存在'}},
        billNotExist:{rc:60406,msg:{client:'报销不存在',server:'bill id 不存在'}},
    },
}