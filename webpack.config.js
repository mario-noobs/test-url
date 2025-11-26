const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')

const { join } = require('path')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  output: {
    path: join(__dirname, './dist/apps/test-url'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      optimization: isProduction,
      outputHashing: 'none',
      generatePackageJson: isProduction,
      sourceMap: isProduction,
    }),
  ],
}