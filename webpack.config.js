var path=require('path')
var webpack=require('webpack')
//插件，用来从js中提取css（loader会先把css转换成js）
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {

    //页面入口文件配置
    entry: {
		//自己写的js的入口文件
		ownjs : './client/javascripts/own/main/mainController.js',
		//需要打包的第三方js库，只写一个名称，会到node_modules中搜索，找不到就报错
		vendorjs:['jquery','moment','angular','bootstrap','angular-moment','angular-ui-router','angular-sanitize','angular-mass-autocomplete','eonasdan-datetimepicker','event'],
		//自己写的css的入口文件（只是简单的require了自己写的css的路径）
		owncss: './css_own_entry.js',
		//第三方css的入口文件（只是简单的require了第三方的css的路径）
		vendorcss: './css_vendor_entry.js',

    },
    //入口文件输出配置
    output: {
        path: 'client',
		//文件名采用chunkhash，如此，各个chunk的修改就不会有影响（例如，如果只修改了ownjs中的文件，则vendorjs的文件名不会变更）
        filename: '[name]-[chunkhash].js'
    },
	module: {
		rules: [
			//将字体文件转换成js
			{
			  test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)|\.otf($|\?)/,
			  loader: 'url-loader'
			},
			//将css文件从js中抽取到css中,只能采用以下格式（而不是// use: "css-loader",）
			{
				test: /\.css$/,
				// use: "css-loader",
				use: ExtractTextPlugin.extract({
					//fallback: "style-loader",
					use: "css-loader"
				})
			},
		]
	},

    plugins: [
    	//命名css
		new ExtractTextPlugin("[name].css"),

		//提取js中公共部分（对css无影响）
		//必须有2个文件名，一个和entry中的一样，用来包含所有第三方库；另外一个随便定义，用来存储ownjs发生变化时的变化
        new webpack.optimize.CommonsChunkPlugin({name:['vendorjs','mainfest']}),

		//声明jQuery全局插件: 把Jquery声明为全局变量，以便其他js组件使用
		new webpack.ProvidePlugin({
		  "$": "jquery",
		  "jQuery": "jquery",
		  "window.jQuery": "jquery",
			"moment":"moment",
		  //"moment":'moment',
		})

    ],
	resolve: {
		//如果js不是绝对/相对路径，且无法在node_modules中找到，则在此进行查找
		//一下模块，要么是自己做过修改的，要么是不提供npm install服务的
		alias: {
			//做过修改，支持空字符，显示所有选项的功能
			'angular-mass-autocomplete':'./client/javascripts/3rd/massautocomplete.js',

			'eonasdan-datetimepicker':'./client/javascripts/3rd/Eonasdan_datetimepicker/bootstrap-datetimepicker.js',
			'event':'./client/javascripts/3rd/event.js',
		},
	}
}