var path = require("path");
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var autoprefixer = require('autoprefixer');


module.exports = (opts) => {
  const {PROJECT_ROOT, NODE_ENV} = opts;

  let plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
      },
    }),
    new webpack.ProvidePlugin({
        'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
    }),
    new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        chunks: [
            'hav',
            'havAdmin'
        ]
    })
  ];

  return {
    context: PROJECT_ROOT,
    entry: {
        cms: [
            './src/cms/cms.css'
        ],
        hav: './src/hav/index',
        havAdmin: './src/admin/index',
        vendor: [
            'react',
            'react-dom',
        ],
    },
    output: {
        path: path.resolve(PROJECT_ROOT, './build/'),
        filename: "[name]-[hash].js"
    },
    plugins,
    resolve: {extensions: ['.js', '.json']},
    module: {
        loaders: [
            {test: /\.css$/, loaders: ['style-loader', 'css-loader?-autoprefixer', 'postcss-loader']},
            {
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000"
            },
            {
                test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                loader: 'file-loader'
            },
            {
                test: /\.(png|jpg|jpeg)?$/,
                loader: "url-loader?limit=10000"
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            // everything else
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader'
            }
        ],
    }
  };
};
