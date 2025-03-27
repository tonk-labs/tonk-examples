const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.ts',
    target: 'node',
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: !isProduction
            }
          }
        }
      ]
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      },
      extensionAlias: {
        '.js': ['.js', '.ts'],
        '.jsx': ['.jsx', '.tsx']
      }
    },

    output: {
      filename: 'index.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      library: {
        type: 'module'
      }
    },

    experiments: {
      outputModule: true
    },

    optimization: {
      minimize: isProduction
    }
  };
};
