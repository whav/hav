let webpack = require("webpack");
let baseConfig = require("./webpack.dev.config.js");

module.exports = (opts) => {
  console.log(opts);
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
      publicPath: "http://localhost:8080/bundles/"
    }
  };
};
