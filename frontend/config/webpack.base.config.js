var path = require("path");
var webpack = require("webpack");
var autoprefixer = require("autoprefixer");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = (opts) => {
  const { PROJECT_ROOT, NODE_ENV } = opts;

  let plugins = [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(NODE_ENV)
      }
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      chunks: ["hav", "havAdmin"]
    }),
    new ExtractTextPlugin(opts.EXTRACT_CSS_NAME || "[name]-[contenthash].css")
  ];

  return {
    context: PROJECT_ROOT,
    entry: {
      hav: ["./src/hav/index"],
      havAdmin: ["./src/admin/index"],
      vendor: [
        "whatwg-fetch",
        "react",
        "react-dom",
      ],
      semantic: [
        './src/semantic/semantic.less'
      ]
    },
    output: {
      path: path.resolve(PROJECT_ROOT, "./build/"),
      filename: "[name]-[hash].js"
    },
    plugins,
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
        // react-icons does not have an es5 build
        // so we need to pipe it through babel
        {
          test: /react-icons\/(.)*(.js)$/,
          loader: "babel-loader"
        },
        {
            test: /\.less$/,
            use: [
              {
                loader: "style-loader" // translates CSS into CommonJS
              },
              {
                loader: "css-loader" // translates CSS into CommonJS
              },
              {
                loader: "postcss-loader"
              },
              {
                loader: "less-loader" // compiles Less to CSS
              }
            ]
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
