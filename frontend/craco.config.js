const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Ensure fallback object exists
      webpackConfig.resolve.fallback = webpackConfig.resolve.fallback || {};

      // Add polyfill for stream and process
      webpackConfig.resolve.fallback['stream'] = require.resolve('stream-browserify');
      webpackConfig.resolve.fallback['process'] = require.resolve('process/browser');

      // Provide process globally
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process/browser',
        }),
      ];

      return webpackConfig;
    },
  },
};
