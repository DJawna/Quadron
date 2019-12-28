const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    node: { fs: 'empty' },
    plugins: [
        new CopyPlugin([
          "quadron.css"
        ]),
    ],
  entry: './index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'bin'),
  },
};