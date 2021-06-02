const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: "./lib/index.js",

  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "",
    library: "FeatureViewer",
    libraryTarget: "var",
    filename: "feature-viewer.bundle.js",
  },

  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: false,
    })],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './examples/simple.html'
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      d3: 'd3'
    })
  ]
};
