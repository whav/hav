let path = require('path');
let webpack = require('webpack');
let BundleTracker = require('webpack-bundle-tracker');
let baseConfig = require('./webpack.base.config');


module.exports = (opts) => {

  const {CDN_PATH, PROJECT_ROOT} = opts,
      config = baseConfig(opts),
      output_path = path.resolve(PROJECT_ROOT, 'build/');

  return {
    ...config,
    devtool: 'source-map',
    output: {
        ...config.output,
        path: output_path,
        publicPath: '/static/wp/',
    },
    plugins: [
      ...config.plugins,
      // local bundle stats file
      new BundleTracker({
        path: output_path,
        filename: 'webpack-stats-development.json'
      }),
      new webpack.NoEmitOnErrorsPlugin(),
      new webpack.NamedModulesPlugin()
    ]
  };
};
