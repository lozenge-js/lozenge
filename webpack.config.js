const path = require('path');
var WebpackObfuscator = require('webpack-obfuscator');
var jsLoaders = [{ 
    loader: WebpackObfuscator.loader, 
    options: {
        rotateStringArray: true
    }
},{loader: 'babel-loader',
options: {
  presets: ['@babel/preset-env']
}}];
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
  rules: [
    {
        test: /\.js$/,
        use: jsLoaders
    },
    {
        test: /\.coffee$/,
        use: [...jsLoaders,'coffee-loader'],
      },
      {
        test: /\.rs$/,
        use: [...jsLoaders,{
          loader: 'wasm-loader'
        }, {
          loader: 'rust-native-wasm-loader',
          options: {
            release: true
          }
        }]
      },
      {
        test: /\.worker\.js$/,
        use: [...jsLoaders,{ loader: "worker-loader" }],
      },

  ],
},
};