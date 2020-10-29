import webpack from 'webpack';
import base from './webpack.config';
import WebpackNotifierPlugin from 'webpack-notifier';

const config: webpack.Configuration = {
  ...base,
  mode: 'development',
  devtool: 'eval',
  output: {
    ...base.output,
    pathinfo: true,
    publicPath: 'http://localhost:8080/build/',
  },
  devServer: {
    compress: true,
    publicPath: '/build/',
    contentBase: false,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  },
  plugins: [new WebpackNotifierPlugin()],
} as any;

export default config;
