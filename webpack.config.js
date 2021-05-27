const path = require("path");
const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

// This is the main configuration object.
// Here, you write different options and tell Webpack what to do
module.exports = {
  // Path to your entry point. From this file Webpack will begin its work
  entry: "./lib/index.js",

  // Path and filename of your result bundle.
  // Webpack will bundle all JavaScript into this file
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
  // Default mode for Webpack is production.
  // Depending on mode Webpack will apply different things
  // on the final bundle. For now, we don't need production's JavaScript
  // minifying and other things, so let's set mode to development
  //   mode: 'development'
};
