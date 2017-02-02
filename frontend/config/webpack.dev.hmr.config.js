let baseConfig = require('./webpack.dev.config.js');

module.exports = (opts) => {

  let config = baseConfig(opts);

  return {
    ...config,
    plugins: [
        ...config.plugins,
    ],
    output: {
      ...config.output,
      publicPath: 'http://localhost:8080/bundles/'
    }
  };
};
