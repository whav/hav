/**
 * The main webpack configuration.
 *
 * By default webpack commands will look for this file unless the --config [path] argument is used.
 * This config routes to other configs using, process.env.NODE_ENV to determine which config is being requested.
 *
 * Adding more configs:
 *  Just add the NODE_ENV=<config> prefix to your command or export to the environment.
 *  Add a case for your <config> value that returns the path to your config file.
 *
 * @returns {object} - returns a webpack config object
 */

process.traceDeprecation = true

const OPTIONS = {
  PROJECT_ROOT: __dirname,
  NODE_ENV: process.env.NODE_ENV,
  CDN_PATH: process.env.CDN_PATH
};

module.exports = (() => {
  let babel_env = process.env.BABEL_ENV;
  switch (process.env.NODE_ENV) {
    case "development":
      if (babel_env === 'hmr') {
        return require("./config/webpack.dev.hmr.config.js");
      }
      if (babel_env === 'docker') {
        return require("./config/webpack.docker.config");
      }
      return require("./config/webpack.dev.config.js");
    default:
      return require("./config/webpack.production.config.js");
  }
})()(OPTIONS);
