export const state = () => ({
    oss: {
        p300: '?x-oss-process=image/auto-orient,1/interlace,1/resize,m_lfit,w_300/quality,q_100',
        p100x100: '?x-oss-process=image/auto-orient,1/interlace,1/resize,m_fill,w_100,h_100/quality,q_100',
        avatar: '?x-oss-process=image/resize,m_fill,w_150,h_150,limit_0/auto-orient,1/format,png',
        avatar_small: '?x-oss-process=image/resize,m_fill,w_80,h_80,limit_0/auto-orient,1/format,png',
        thumbnail: '?x-oss-process=image/resize,m_fill,w_600,h_450,limit_0/auto-orient,1/format,png',
        thumbnail_middle: '?x-oss-process=image/format,png/auto-orient,1/resize,m_fill,w_300,h_225',
    },
    counter: 0,
    userInfo: {
        id: 0
    },
    activeNav: '',
    checkUnreadMessageCount: 0
})

export const mutations = {
    increment(state) {
        state.counter++
    },
    changeUserInfo(state, user) {
        state.userInfo = user
    },
    // 修改顶部导航
    changeActiveNav(state, nav) {
        state.activeNav = nav
    },

    // 检测最新未读消息数量
    checkUnreadMessageCount(state) {
        state.checkUnreadMessageCount = Date.parse(new Date())
    }
}

export const actions = {
    async nuxtServerInit({ commit, dispatch }, { $axios, app }) {
        // 获取 Token
        let token = app.$cookies.get('ROCBOSS-TOKEN')

        if (token) {
            try {
                await dispatch('getUserInfo')
            } catch (err) {
                dispatch('logout')
            }
        }
    },

    // 注册
    handleSignup({
        commit
    }, {
        email,
        username,
        password,
        captcha,
        bindToken
    }) {
        return new Promise((resolve, reject) => {
            this.$axios.$post('/user/register', {
                email,
                username,
                password,
                captcha,
                bindToken
            }).then(res => {
                // 注册成功
                if (res.code === 0) {
                    // 设置用户身份信息
                    this.$cookies.set('ROCBOSS-TOKEN', res.data.token)
                    resolve(res)
                } else {
                    reject(res)
                }
            }).catch(err => {
                reject(err)
            })
        })
    },

    // 登录
    handleSignin({
        commit
    }, {
        account,
        password,
        captchaCode,
        captchaToken,
        bindToken
    }) {
        return new Promise((resolve, reject) => {
            this.$axios.$post('/user/login', {
                account,
                password,
                captchaCode,
                captchaToken,
                bindToken
            }).then(res => {
                // 注册成功
                if (res.code === 0) {
                    // 设置用户身份信息
                    this.$cookies.set('ROCBOSS-TOKEN', res.data.token)
                    resolve(res)
                } else {
                    reject(res)
                }
            }).catch(err => {
                reject(err)
            })
        })
    },

    // 获取用户相关信息
    getUserInfo({
        state,
        commit,
        dispatch
    }) {
        return new Promise((resolve, reject) => {
            this.$axios.$get('/user/info').then(res => {
                if (res.code === 0) {
                    const userData = res.data.user

                    // 设置Store用户信息
                    commit('changeUserInfo', userData)

                    resolve(userData)
                } else {
                    dispatch('logout')
                    reject(res)
                }
            }).catch(err => {
                reject(err)
            })
        })
    },

    // 清空用户登录态
    logout({ commit }) {
        // 清空用户信息
        this.$cookies.remove('ROCBOSS-TOKEN')
        commit('changeUserInfo', { id: 0 })
    }
}
