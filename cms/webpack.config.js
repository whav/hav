const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ManifestPlugin = require('webpack-manifest-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin')

const buildPath = path.resolve(__dirname, 'site/theme/static/')

module.exports = {
    context: __dirname,
    entry: {
      index: ["./src/index"]
    },
    output: {
      // build directly to the themes static directory
      path: buildPath,
      //filename: "[name]-[hash].js"
      filename: "[name].js"
    },

    plugins: [
        new ExtractTextPlugin("[name].css"),
        new ManifestPlugin(),
        new CleanWebpackPlugin([buildPath])
    ],
    resolve: { extensions: [".js", ".json"] },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: "style-loader",
            use: ["css-loader?importLoaders=1", "postcss-loader"]
          })
        },
        {
          test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
          loader: "file-loader"
        },
        {
          test: /\.(png|jpg|jpeg|woff|woff2)$/,
          loader: "url-loader",
          options: {
            limit: 10000
          }
        },
        // everything else
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: "babel-loader"
        }
      ]
    }
};