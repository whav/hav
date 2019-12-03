const { CleanWebpackPlugin } = require("clean-webpack-plugin");
let baseConfig = require("./webpack.base.config");

module.exports = opts => {
  const { CDN_PATH, PROJECT_ROOT } = opts,
    config = baseConfig(opts);

  return {
    ...config,
    mode: "production",
    devtool: "source-map",
    output: {
      ...config.output,
      // set CDN_PATH to your cdn static file directory
      publicPath: CDN_PATH || "/static/wp/"
    },
    plugins: [new CleanWebpackPlugin(), ...config.plugins]
  };
};
