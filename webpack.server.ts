import * as webpack from 'webpack';
import * as path from 'path';
import nodeExternals from 'webpack-node-externals';

let lastMessage = '';

const handler = (percentage: number, message: string) => {
  const readablePercentage = (percentage * 100).toFixed();
  if (message !== lastMessage) {
    lastMessage = message;
    // eslint-disable-next-line no-console
    console.log(`${readablePercentage}% ${message}`);
  }
};

const config: webpack.Configuration = {
  entry: {
    server: ['./src/index.tsx'],
  },
  // node: {
  //   fs: 'empty',
  // },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.scss'],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve('./dist/'),
    filename: '[name].js',
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: [/\.ts$/, /\.tsx$/],
        exclude: /(node_modules)/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.json',
            },
          },
        ],
      },
    ],
  },
  plugins: [new webpack.ProgressPlugin(handler)],
};

export default config;
