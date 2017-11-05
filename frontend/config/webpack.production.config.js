let path = require("path");
let webpack = require("webpack");
let BundleTracker = require("webpack-bundle-tracker");
let baseConfig = require("./webpack.base.config");
let WebpackCleanupPlugin = require("webpack-cleanup-plugin");
let ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = opts => {
  const { CDN_PATH, PROJECT_ROOT } = opts,
    config = baseConfig(opts),
    output_path = path.resolve(PROJECT_ROOT, "dist/");

  return {
    ...config,
    output: {
      ...config.output,
      path: output_path,
      // set CDN_PATH to your cdn static file directory
      publicPath: CDN_PATH || "/static/wp/"
    },
    plugins: [
      ...config.plugins,
      // production bundle stats file
      new BundleTracker({
        path: output_path
      }),
      // pass options to uglify
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      // minifies your code
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        output: {
          comments: false
        },
        sourceMap: false
      }),
      // this cleans up the build directory
      new WebpackCleanupPlugin({
        exclude: ["webpack-stats.json"]
      })
    ]
  };
};
