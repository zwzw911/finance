/**
 * Created by zw on 2016/7/3.
 */
'use strict'
var randomStringType={
    basic:Symbol('basic'),
    normal:Symbol('normal'),
    complicated:Symbol('complicated')
}

var userState={
    noSess:Symbol('noSess'),
    login:Symbol('login'),
    notLogin:Symbol('not login'),

}

exports.node={
    randomStringType:randomStringType,
    userState:userState,
}