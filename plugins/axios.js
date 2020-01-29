import md5 from 'js-md5'


export default function ({
  $axios,
  app
}) {

  $axios.onRequest(config => {
    // ROCBOSS API 接口自动签名处理
    if (config.url.substr(0, 1) === '/') {
      let objectSort = obj => {
        let arr = []
        for (var key in obj) {
          arr.push(key)
        }
        arr.sort()
        let str = ''
        for (var i in arr) {
          let isObject = false
          if ((obj[arr[i]]) instanceof Object) {
            obj[arr[i]] = JSON.stringify(obj[arr[i]])
            isObject = true
          }
          str += arr[i].toLowerCase() + "=" + obj[arr[i]]
          if (isObject) {
            // 还原
            obj[arr[i]] = JSON.parse(obj[arr[i]])
          }
        }
        return str
      }

      let token = app.$cookies.get('ROCBOSS-TOKEN')
      if (token) {
        // 自定义鉴权 Header
        config.headers['X-Authorization'] = token
      }

      // 请求签名
      if (config.method == 'get') {
        // 处理 GET 请求
        config.params = config.params || {}
        config.params.timestamp = new Date().getTime()

        config.params.sign = md5(md5(objectSort(config.params)) + process.env.NUXT_ENV_TOKEN)
      } else if (config.method == 'post' || config.method == 'delete') {
        // 处理 POST & DELETE 请求
        config.data = config.data || {}
        config.data.request_id = config.data.timestamp = new Date().getTime()

        config.data.sign = md5(md5(objectSort(config.data)) + process.env.NUXT_ENV_TOKEN)
      }

    }
    return config
  })

  $axios.onResponse(rsp => {
    if (rsp.data.code === 401) {
        // 401错误直接转跳登录页
        app.router.push({ path: '/signin' })
        app.store.dispatch('logout')
    }
    return rsp;
  })
}