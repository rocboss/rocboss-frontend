const pkg = require('./package')
const { resolve } = require('path')

module.exports = {
    mode: 'universal',

    /*
    ** Headers of the page
    */
    head: {
        title: 'Index',
        titleTemplate: '%s - ROCBOSS',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' },
            { hid: 'keywords', name: 'keywords', content: 'ROCBOSS,微社区,高性能,高负载,SSR,BBS,视频社区,论坛,垂直社交' },
            { hid: 'description', name: 'description', content: 'ROCBOSS 最前沿的社区交流,最纯粹的技术切磋,一款优雅而简约的垂直微社区。' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ],
        script: [
            { src: 'https://hm.baidu.com/hm.js?48042604b3c7a9973810a87540843e34', async: true, defer: true } /* 引入百度统计的js*/
        ]
    },

    /*
    ** Customize the progress-bar color
    */
    loading: { color: '#2d8cf0' },

    /*
    ** Global CSS
    */
    css: [
        'view-design/dist/styles/iview.css',
        '@/assets/css/main.css'
    ],

    /*
    ** Router
    */
    router: {
        middleware: 'stats'
    },

    /*
    ** Plugins to load before mounting the App
    */
    plugins: [
        {
            src: '@/plugins/iview',
            ssr: true
        },
        '@/plugins/axios',
        '@/plugins/icon-svg',
        '@/plugins/statistic'
    ],

    /*
    ** Nuxt.js modules
    */
    modules: [
        '@nuxtjs/axios',
        'cookie-universal-nuxt'
    ],

    axios: {
        // proxyHeaders: false
        baseURL: process.env.NUXT_ENV_API_GATEWAY
    },

    /*
    ** Build configuration
    */
    build: {
        /*
        ** You can extend webpack config here
        */
        extend(config, ctx) {
            // 排除 nuxt 原配置的影响
            const svgRule = config.module.rules.find(rule => rule.test.test('.svg'))
            svgRule.exclude = [resolve(__dirname, 'assets/icon')]

            // svg 加载
            config.module.rules.push({
                test: /\.svg$/,
                include: [resolve(__dirname, 'assets/icon')],
                loader: 'svg-sprite-loader',
                options: {
                    symbolId: 'icon-[name]'
                }
            })
        }
    }
}
