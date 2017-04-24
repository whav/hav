import path from 'path'
const baseConfig = require('../frontend/config/webpack.dev.hmr.config.js')

const OPTIONS = {
  PROJECT_ROOT: __dirname,
  NODE_ENV: process.env.NODE_ENV || 'production',
  CDN_PATH: process.env.CDN_PATH || '/wp/',
  EXTRACT_CSS_NAME: 'styles.css'
};

let bConfig = baseConfig(OPTIONS)


const config = {
    ...bConfig,
    context: path.resolve(__dirname, '../frontend/'),
    entry: {
      cms: ["../frontend/src/cms/index"],
    },
    output: {
        path: path.resolve(__dirname, 'wp'),
        filename: 'index.js'
    },
    plugins: [
        ...bConfig.plugins
    ]
}

module.exports = config;
