var path=require('path')
var webpack=require('webpack')
module.exports = {
    //插件项
    //plugins: [commonsPlugin],
    //页面入口文件配置
    entry: {
		//angular mainController
        client : './main_entry.js',
		//vendors:['jquery','moment','bootstrap','angular-moment','angular-ui-router','angular-sanitize','angular-mass-autocomplete',require('angular-ui-utils')]
		//pack 第三方入口文件
		//third : './third_entry.js',
    },
    //入口文件输出配置
    output: {
        path: './client',
        filename: '[name].bundle.js'
    },
    plugins: [

//添加我们的插件 提取js插件库

        //new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),

//声明jQuery全局插件

        new webpack.ProvidePlugin({

/*            $: "jquery",

            jQuery: "jquery"*/

        })

    ],
	resolve: {
		alias: {
			moment: 'moment/min/moment-with-locales.mim.js'
		},
	}
/*	externals: {
		jquery: 'window.$'
	},*/

	/*module: {
		loaders: [
			{
			test: /\.js$/,
			//exclude: /node_modules/,
			loader: 'babel'
			}
		]
	}*/
	/*
    module: {
        //加载器配置
        loaders: [
            { test: /\.css$/, loader: 'style-loader!css-loader' },
            { test: /\.js$/, loader: 'jsx-loader?harmony' },
            { test: /\.scss$/, loader: 'style!css!sass?sourceMap'},
            { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
        ]
    },
    //其它解决方案配置
    resolve: {
        root: 'E:/github/flux-example/src', //绝对路径
        extensions: ['', '.js', '.json', '.scss'],
        alias: {
            AppStore : 'js/stores/AppStores.js',
            ActionType : 'js/actions/ActionType.js',
            AppAction : 'js/actions/AppAction.js'
        }
    }*/
}