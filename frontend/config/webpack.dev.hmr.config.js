let webpack = require("webpack");
let baseConfig = require("./webpack.dev.config.js");

module.exports = (opts) => {
  let config = baseConfig(opts);
  let entries = {};

  Object.keys(config.entry).forEach(key => {
    entries[key] = ["react-hot-loader/patch", ...config.entry[key]];
  });

  return {
    ...config,
    entry: entries,
    plugins: [...config.plugins, new webpack.HotModuleReplacementPlugin()],
    output: {
      ...config.output,
      publicPath: "http://127.0.0.1:8080/bundles/"
    },
    devServer: {
         headers: { "Access-Control-Allow-Origin": "*" }
    }
  };
};
