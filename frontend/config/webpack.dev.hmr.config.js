import baseConfig from './webpack.dev.config.js';


module.exports = (opts) => {

  let config = baseConfig(opts);

  return {
    ...config,
    output: {
      ...config.output,
      publicPath: 'http://localhost:8080/bundles/'
    }
  };
};
