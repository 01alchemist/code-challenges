const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const packageJson = require('./package.json');

const rootDir = path.resolve(__dirname, '../../');
const outDir = '../../dist/task-2';
const mode = process.env.NODE_ENV || 'development';
const isDevMode = mode === 'development';

const entries = ['./src/index.ts'];

module.exports = {
    entry: { index: isDevMode ? ['webpack/hot/poll?1000', ...entries] : entries },
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
    },
    mode,
    externals: [nodeExternals()],
    devServer: {
        hot: true,
        contentBase: path.resolve(__dirname),
        publicPath: '/',
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '~common': path.join(__dirname, '../../../common/'),
        },
    },
    plugins: [
        new CleanWebpackPlugin([path.resolve(__dirname, outDir)], { root: rootDir }),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(packageJson.version),
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, outDir),
        devtoolModuleFilenameTemplate: function(info) {
            return 'file:///' + encodeURI(info.absoluteResourcePath);
        },
        library: '[name]',
        libraryTarget: 'umd',
    },
};
