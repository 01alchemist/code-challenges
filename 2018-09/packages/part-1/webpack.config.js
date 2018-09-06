const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const packageJson = require('./package.json');

const outDir = '../../dist/part-1';
const mode = 'development';
const isDevMode = mode === 'development';

const entries = ['./src/index.ts'];
let devServer;

module.exports = {
    entry: { index: isDevMode ? [...entries] : entries },
    target: 'web',
    node: {
        __dirname: true,
        __filename: true,
    },
    mode,
    externals: [nodeExternals()],
    devServer: {
        hot: true,
        contentBase: path.resolve(__dirname),
        publicPath: '/',
        before(app, server) {
            devServer = server;
        },
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '~common': path.join(__dirname, '../../../common/'),
        },
    },
    plugins: [
        new CleanWebpackPlugin([path.resolve(__dirname, outDir)]),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(packageJson.version),
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'src/templates/index.html',
        }),
        reloadHtml,
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

function reloadHtml() {
    const cache = {};
    const plugin = { name: 'CustomHtmlReloadPlugin' };
    this.hooks.compilation.tap(plugin, compilation => {
        compilation.hooks.htmlWebpackPluginAfterEmit.tap(plugin, data => {
            const orig = cache[data.outputName];
            const html = data.html.source();
            if (orig && orig !== html) {
                devServer.sockWrite(devServer.sockets, 'content-changed');
            }
            cache[data.outputName] = html;
        });
    });
}
