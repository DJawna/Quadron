const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
    node: { fs: 'empty' },
    plugins: [
        new CopyPlugin([
          "index.css",
          "index.html",
          "assets/*"
        ]),
    ],
  entry: {
    "main" : './src/index.ts'
  } ,
  devtool: 'cheap-module-source-map',
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
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
};