let webpack = require("webpack");
let baseConfig = require("./webpack.dev.hmr.config.js");

module.exports = (opts) => {
  let config = baseConfig(opts);


  return {
    ...config,
    output: {
      ...config.output,
      publicPath: "/__wp__/"
    },
    devServer: {
        headers: { "Access-Control-Allow-Origin": "*" },
        host: "0.0.0.0",
        port: "8000"
    }
  };
};
