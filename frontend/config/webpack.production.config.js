let path = require("path");
let webpack = require("webpack");

let baseConfig = require("./webpack.base.config");
let WebpackCleanupPlugin = require("webpack-cleanup-plugin");

module.exports = opts => {
  const { CDN_PATH, PROJECT_ROOT } = opts,
    config = baseConfig(opts);

  return {
    ...config,
    mode: "production",
    output: {
      ...config.output,
      // set CDN_PATH to your cdn static file directory
      publicPath: CDN_PATH || "/static/wp/"
    },
    plugins: [
      ...config.plugins,
      // this cleans up the build directory
      new WebpackCleanupPlugin({
        exclude: ["webpack-stats.json"]
      })
    ]
  };
};
