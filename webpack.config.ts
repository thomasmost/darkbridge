import path from 'path';
import webpack from 'webpack';
// import nodeExternals from 'webpack-node-externals';

const config: webpack.Configuration = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    app: './src/client/index.tsx',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.css'],
  },
  output: {
    path: path.resolve(__dirname, './public/build/'),
    filename: '[name].js',
  },
  // externals: [],
};

export default config;
