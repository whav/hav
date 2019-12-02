let webpack = require("webpack");
let baseConfig = require("./webpack.dev.config.js");

const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

module.exports = opts => {
  let config = baseConfig(opts);
  let entries = {};

  Object.keys(config.entry).forEach(key => {
    entries[key] = ["react-hot-loader/patch", ...config.entry[key]];
  });

  return {
    ...config,
    entry: entries,
    plugins: [
      ...config.plugins,
      new webpack.HotModuleReplacementPlugin(),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: "disabled"
      })
    ],
    output: {
      ...config.output,
      publicPath: "http://127.0.0.1:8002/bundles/"
    },
    devServer: {
      headers: { "Access-Control-Allow-Origin": "*" },
      port: "8002"
    }
  };
};
