var path = require("path");
var webpack = require('webpack');
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
            './src/cms/index'
        ],
        hav: [
            './src/hav/index',
        ],
        havAdmin: [
            './src/admin/index'
        ],
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
    resolve: {extensions: ['.js', '.json', '.css']},
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader?importLoaders=1',
                    'postcss-loader'
                ]
            },
            {
                test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                loader: 'file-loader'
            },
            {
                test: /\.(png|jpg|jpeg|woff|woff2)$/,
                loader: "url-loader",
                options: {
                    limit: 10000
                }
            },
            // react-icons does not have an es5 build
            // so we need to pipe it through babel
            {
                test: /react-icons\/(.)*(.js)$/,
                loader: 'babel-loader',
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
