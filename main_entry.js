//jquery：使用单独的文件，而不用webpack打包
var angular=require('angular')

var $=require('jquery')
window.jQuery = $;
window.$ = $;

// require('./client/javascripts/3rd/moment_with_locals.js')
require('bootstrap')

require('angular-moment')
	require('angular-ui-router')
	//如果是直接通过文件，那么指明文件地址，并确保module.exports=module.name
	require('./client/javascripts/3rd/event.js')
	require('angular-sanitize')
	require('angular-mass-autocomplete')
	require('./client/javascripts/3rd/Eonasdan_datetimepicker/bootstrap-datetimepicker.min.js')

	require('./client/javascripts/own/component/component.js'),
	require('./client/javascripts/own/component/finance.js'),
	require('./client/javascripts/own/main/constant.js'),

	require('./client/javascripts/own/main/mainController.js')


/*module.exports= angular.module("App",[
    moment,
	/!*			related 3rd file		*!/
	//如果是通过npm install安装的，可以使用require直接载入
    require('angular-moment'),
    require('angular-ui-router'),
	//如果是直接通过文件，那么指明文件地址，并确保module.exports=module.name
	require('./client/javascripts/3rd/event.js'),
	require('angular-sanitize'),	
	require('angular-mass-autocomplete'),

	// require('./component_entry.js'),
	//require('./finance_entry.js'),
	//require('./constant_entry.js'),
	

	// 如果是直接通过文件，那么指明文件地址，并确保module.exports=module.name
	require('./client/javascripts/3rd/Eonasdan_datetimepicker/bootstrap-datetimepicker.js'),
	
/!*	require('./client/javascripts/own/component/component.js'),
	require('./client/javascripts/own/component/finance.js'),
	require('./client/javascripts/own/main/constant.js'),

	require('./client/javascripts/own/main/mainController.js'),*!/
]).name*/

/*
module.exports=angular.module('dist',[
    'App',
    require('./client/javascripts/own/main/mainController.js')
]).name*/