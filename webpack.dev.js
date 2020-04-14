const path = require('path');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(
	common,
	{
		mode: 'development',
		devtool: 'inline-source-map'
	},
	{
		devServer: {
			contentBase: path.join(__dirname, 'dist'),
			compress: true,
			port: 3000
		}
	},
	{
		module: {
			rules: [
				{
					test: /\.s[ac]ss$/i,
					use: [
						'style-loader',
						'css-loader',
						'sass-loader'
					]
				}
			]
		}
	}
);
