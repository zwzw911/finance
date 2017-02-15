//jquery：使用单独的文件，而不用webpack打包
var angular=require('angular')
module.exports=angular.module("finance",[
	/*			related 3rd file		*/
	//如果是通过npm install安装的，可以使用require直接载入

	//如果是直接通过文件，那么指明文件地址，并确保module.exports=module.name
	require('./client/javascripts/own/main/constant.js'),
]).name