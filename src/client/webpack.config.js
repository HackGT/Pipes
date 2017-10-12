const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

// Load HTML files
const loadLandingPage = new HtmlWebpackPlugin({
    filename: '../index.html',
    template: path.resolve(__dirname, 'home/index.html'),
    chunks: []
});
const loadDashboardApp = new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(__dirname, 'dashboard/index.html')
});

// Load Static Assets
const loadStaticFiles = new CopyWebpackPlugin([{
    from: path.resolve(__dirname, 'assets/'),
    to: '../assets'
}]);

// Load Sass files
const extractSass = new ExtractTextPlugin({
    filename: "[name].css",
    disable: process.env.NODE_ENV === "development"
});

// Load node_module dependencies
const loadVendors = new webpack.optimize.CommonsChunkPlugin({
    name: 'vendors',
    filename: 'vendors.bundle.js',
    minChunks: (m) => m.resource && !!~m.resource.indexOf('node_modules')
});

module.exports = {
    entry: path.resolve(__dirname, "dashboard/index.tsx"),
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "../../out/public/app"),
        publicPath: process.env.ROOT_URL + '/app'
    },
    
    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",
    
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    
    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            //{
            //    test: /\.tsx?$/,
            //    loader: "awesome-typescript-loader?configFileName=" + path.resolve(__dirname, "tsconfig.json")
            //},
            {
                test: /\.tsx?$/,
                loaders: [
                    'react-hot-loader',
                    `awesome-typescript-loader?configFileName=${path.resolve(__dirname, 'tsconfig.json')}`
                ]
            },
            
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {enforce: "pre", test: /\.js$/, loader: "source-map-loader"},
            
            // All sass files should be compiled
            {
                test: /\.scss$/,
                loaders: extractSass.extract('css-loader!sass-loader')
            }
        ]
    },
    
    plugins: [
        loadVendors,
        extractSass,
        loadLandingPage,
        loadDashboardApp,
        loadStaticFiles,
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            URL: JSON.stringify(config.server.url)
        })
    ]
};