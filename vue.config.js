const WorkerPlugin = require('worker-plugin')
const webpack = require('webpack')

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/sass/global.scss";`
      }
    }
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: true
    }
  },
  configureWebpack: {
    output: {
      globalObject: "this"
    },
    plugins: [
      new WorkerPlugin(),
      new webpack.DefinePlugin({
        PRODUCTION: JSON.stringify(process.env.NODE_ENV === 'production'),
        DEVELOPMENT: JSON.stringify(process.env.NODE_ENV !== 'production')
      }),
    ],
  },
  chainWebpack: config => {
    if (process.env.NODE_ENV === 'development') {
      config.output.filename('[name].[hash].js').end() 
    }

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .use('babel-loader')
      .loader('babel-loader')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
  }
}  