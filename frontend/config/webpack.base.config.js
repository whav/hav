const path = require("path");
const webpack = require("webpack");
const autoprefixer = require("autoprefixer");
const BundleTracker = require("webpack-bundle-tracker");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = opts => {
  const { PROJECT_ROOT, NODE_ENV } = opts;
  const devMode = NODE_ENV !== "production";

  const output_path = path.resolve(PROJECT_ROOT, "./build/");

  let plugins = [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(NODE_ENV)
      }
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? "[name].css" : "[name]-[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id]-[hash].css"
    }),
    new BundleTracker({
      path: output_path
    })
  ];

  return {
    context: PROJECT_ROOT,
    entry: {
      hav: ["./src/hav/index"],
      havAdmin: ["./src/admin/index"]
    },
    output: {
      path: output_path,
      filename: "[name]-[hash].js"
    },
    plugins,
    resolve: {
      extensions: [".js", ".json"]
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            devMode ? "style-loader" : MiniCssExtractPlugin.loader,
            "css-loader",
            "postcss-loader",
            "sass-loader"
          ]
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
        // react-icons does not have an es5 build
        // so we need to pipe it through babel
        {
          test: /react-icons\/(.)*(.js)$/,
          loader: "babel-loader"
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
};
