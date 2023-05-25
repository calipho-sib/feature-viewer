const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { merge } = require("webpack-merge");

const commonConfig = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
};

// For minified version — without external dependencies
const minConfig = {
  entry: "./src/feature-viewer.js",

  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "",
    library: "FeatureViewer",
    libraryTarget: "var",
    filename: "feature-viewer.min.js",
  },

  target: ['web']
};

// For complete version — including external dependencies
const maxConfig = {
  entry: "./lib/index.js",

  output: {
    path: path.resolve(__dirname, "dist"),
    publicPath: "",
    library: "FeatureViewer",
    libraryTarget: "var",
    filename: "feature-viewer.bundle.js",
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./examples/simple.html",
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      d3: "d3",
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },

  target: ['web']
};

module.exports = [
  merge(commonConfig, minConfig),
  merge(commonConfig, maxConfig),
];
