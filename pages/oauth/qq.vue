<template>
    <section class="container">
        <Spin size="large" fix v-if="oauthRequesting"></Spin>
        <Row v-show="!oauthRequesting">
            <Col :xs="24" :sm="24" :md="24" :lg="24">
                <div class="signup-container">
                    <!-- QQ用户信息 -->
                    <div class="qq-userinfo-wrap">
                        <div class="avatar-wrap">
                            <img :src="QQUserInfo.avatar" class="qq-avatar">
                        </div>
                        <div class="username-wrap">
                            {{ QQUserInfo.nick }}
                        </div>
                        <div class="tips">
                            该QQ尚未绑定任何账号
                        </div>
                    </div>
                    <Tabs class="bind-wrap" value="login-bind">
                        <TabPane label="绑定已有账号" name="login-bind">
                            <Form class="signup-form" ref="signinForm" :model="signinForm" :rules="signinFormRule">
                                <!-- 用户名 -->
                                <FormItem prop="account">
                                    <Input type="text" prefix="ios-contact-outline" v-model="signinForm.account" placeholder="请输入用户名或邮箱" size="large"/>
                                </FormItem>

                                <!-- 图片验证码 -->
                                <FormItem prop="captchaCode">
                                    <Input type="text" prefix="ios-checkmark-circle-outline" v-model="signinForm.captchaCode" placeholder="图片验证码" size="large"/>
                                    <div class="captcha-image-wrap">
                                        <img :src="captchaImage" class="captcha-image" @click="loadImageCaptcha">
                                    </div>
                                </FormItem>

                                <!-- 密码 -->
                                <FormItem prop="password">
                                    <Input type="password" prefix="ios-lock-outline" v-model="signinForm.password" placeholder="请输入密码" size="large" clearable/>
                                </FormItem>

                                <!-- 提交登录 -->
                                <FormItem>
                                    <Button type="primary" @click="handleSubmitLoginBind('signinForm')" size="large" :loading="loading" long>登录绑定</Button>
                                </FormItem>
                            </Form>
                        </TabPane>
                        <TabPane label="注册新账号" name="register-bind">
                            <Form class="signup-form" ref="signupForm" :model="signupForm" :rules="signupFormRule">
                                <!-- 用户名 -->
                                <FormItem prop="username">
                                    <Input type="text" prefix="ios-contact-outline" v-model="signupForm.username" placeholder="请输入您的用户名" size="large"/>
                                </FormItem>

                                <!-- 邮箱账号 -->
                                <FormItem prop="email">
                                    <Input type="email" prefix="ios-mail-outline" v-model="signupForm.email" placeholder="请输入您的邮箱账号" size="large"/>
                                </FormItem>

                                <!-- 图片验证码 -->
                                <FormItem prop="captchaCode">
                                    <Input type="text" prefix="ios-checkmark-circle-outline" v-model="signupForm.captchaCode" placeholder="图片验证码" size="large"/>
                                    <div class="captcha-image-wrap">
                                        <img :src="captchaImage" class="captcha-image" @click="loadImageCaptcha">
                                    </div>
                                </FormItem>

                                <!-- 邮件验证码 -->
                                <FormItem prop="emailCode">
                                    <Input type="text" prefix="ios-compass-outline" v-model="signupForm.emailCode" placeholder="邮件验证码" size="large"/>
                                    <div class="captcha-image-wrap">
                                        <Button @click="sendEmailCode()" :disabled="sending">{{ sendCaptchaTxt }}</Button>
                                    </div>
                                </FormItem>
                                <!-- 密码 -->
                                <FormItem prop="password">
                                    <Input type="password" prefix="ios-lock-outline" v-model="signupForm.password" placeholder="请输入密码" size="large" clearable/>
                                </FormItem>
                                <!-- 重复密码 -->
                                <FormItem prop="rePassword">
                                    <Input type="password" prefix="ios-lock-outline" v-model="signupForm.rePassword" placeholder="请再次输入密码" size="large" clearable/>
                                </FormItem>
                                <!-- 用户协议 -->
                                <FormItem>
                                    <Checkbox v-model="signupForm.agreed" />我已阅读并同意<span class="user-agreement" @click="showAgreement = true">《用户服务协议》</span>
                                </FormItem>
                                <!-- 提交注册 -->
                                <FormItem>
                                    <Button type="primary" @click="handleSubmitRegisterBind('signupForm')" size="large" :loading="loading" :disabled="!signupForm.agreed" long>注册绑定</Button>
                                </FormItem>
                            </Form>
                        </TabPane>
                    </Tabs>
                </div>
            </Col>
        </Row>
    </section>
</template>

<script>
export default {
    mounted() {
        this.loadImageCaptcha()
        if (this.$store.state.userInfo.id > 0) {
            this.$router.push({ path: '/' })
        }
        if (!this.$route.query.code) {
            this.$router.push({ path: '/signin' })
        }
        this.requestQQOAuthLogin(this.$route.query.code)
    },
    head() {
        return {
            title: '登录'
        }
    },
    data() {
        return {
            loading: false,
            sending: false,
            oauthRequesting: true,
            sendCaptchaTxt: '获取验证码',
            showAgreement: false,

            bindToken: '',
            QQUserInfo: {},

            captchaToken: '',
            captchaImage: '',

            signinForm: {
                account: '',
                password: '',
                captchaCode: ''
            },

            signinFormRule: {
                account: [
                    { required: true, message: '请填写用户名或邮箱', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入用户密码', trigger: 'blur' },
                    { type: 'string', min: 6, message: '密码至少6位', trigger: 'blur' }
                ],
                captchaCode: [
                    { required: true, message: '请输入图片验证码', trigger: 'blur' }
                ]
            },

            signupForm: {
                username: '',
                email: '',
                password: '',
                rePassword: '',
                captchaCode: '',
                emailCode: '',
                agreed: true
            },

            signupFormRule: {
                username: [
                    { required: true, message: '请填写用户名', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请填写常用邮箱地址', trigger: 'blur' },
                    { pattern: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/, message: '邮箱地址格式错误!', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入用户密码', trigger: 'blur' },
                    { type: 'string', min: 6, message: '密码至少6位', trigger: 'blur' }
                ],
                rePassword: [
                    { required: true, message: '请输入用户密码', trigger: 'blur' },
                    {
                        validator: (rule, value, callback) => {
                            if (value === '') {
                                callback(new Error('请再次输入密码'))
                            } else if (value !== this.signupForm.password) {
                                callback(new Error('两次输入密码不一致!'))
                            } else {
                                callback()
                            }
                        },
                        trigger: 'change'
                    }
                ],
                emailCode: [
                    { required: true, message: '请输入邮箱验证码', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        // 提交登录绑定
        handleSubmitLoginBind(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.loading = true
                    this.$store.dispatch('handleSignin', {
                        account: this.signinForm.account,
                        password: this.signinForm.password,
                        captchaCode: this.signinForm.captchaCode,
                        captchaToken: this.captchaToken,
                        bindToken: this.bindToken
                    }).then(res => {
                        this.$Message.success('绑定成功')

                        // 同步用户登录态
                        this.$store.dispatch('getUserInfo')
                        this.$router.push({ path: '/' })
                        this.loading = false
                    }).catch(err => {
                        if (err.code === 401) {
                            // 401错误直接转跳登录页
                            this.$router.push({ path: '/signin' })
                        }

                        // 重置图形验证码
                        this.loadImageCaptcha()
                        this.loading = false

                        this.$Message.error(err.msg)
                    })
                }
            })
        },

        // 提交注册绑定
        handleSubmitRegisterBind(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.loading = true
                    this.$store.dispatch('handleSignup', {
                        email: this.signupForm.email,
                        username: this.signupForm.username,
                        password: this.signupForm.password,
                        captcha: this.signupForm.emailCode,
                        bindToken: this.bindToken
                    }).then(res => {
                        this.$Message.success('注册绑定成功')

                        // 同步用户登录态
                        this.$store.dispatch('getUserInfo')
                        this.$router.push({ path: '/' })
                        this.loading = false
                    }).catch(err => {
                        if (err.code === 401) {
                            // 401错误直接转跳登录页
                            this.$router.push({ path: '/signin' })
                        }

                        this.loading = false
                        this.$Message.error(err.msg)
                    })
                }
            })
        },

        // 发送邮件验证码
        sendEmailCode() {
            if (!(/(^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$)/.test(this.signupForm.email))) {
                this.$Message.warning('邮箱格式不正确')
                return false
            }
            if (this.signupForm.captchaCode.length < 4) {
                this.$Message.warning('请先输入图形验证码')
                return false
            }
            if (!this.sending) {
                this.sending = true
                // 发送邮箱验证码
                this.$axios.$post('/user/send-captcha', {
                    email: this.signupForm.email,
                    captchaCode: this.signupForm.captchaCode,
                    captchaToken: this.captchaToken
                }).then(rsp => {
                    if (rsp.code === 0) {
                        let seconds = 60
                        const loop = setInterval(() => {
                            seconds--
                            this.sendCaptchaTxt = seconds + 's后重新发送'
                            if (seconds === 0) {
                                this.sending = false
                                this.sendCaptchaTxt = '获取验证码'
                                clearInterval(loop)
                            }
                        }, 1000)
                        this.$Message.success('邮件发送成功')
                    } else {
                        // 重置图形验证码
                        this.loadImageCaptcha()
                        this.sending = false

                        this.$Message.error(rsp.msg || '服务不可用')
                    }
                })
            }
        },

        // 获取图片验证码
        loadImageCaptcha() {
            this.$axios.$get('/imageCaptcha').then(rsp => {
                if (rsp.code === 0) {
                    this.captchaToken = rsp.data.captchaToken
                    this.captchaImage = rsp.data.captchaImage
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
            })
        },

        // 请求OOAuth登录
        requestQQOAuthLogin(code) {
            this.oauthRequesting = true
            this.$axios.$post('/user/oauth/qq', {
                code
            }).then(rsp => {
                // 授权通过
                if (rsp.code === 0) {
                    // 已绑定用户，完成授权登录
                    if (rsp.data.hasBind === true) {
                        // 设置用户身份信息
                        this.$cookies.set('ROCBOSS-TOKEN', rsp.data.token)

                        // 同步用户登录态
                        this.$store.dispatch('getUserInfo')

                        this.$Message.success('登录成功')
                        this.$router.push({ path: '/' })
                    } else {
                        this.bindToken = rsp.data.bindToken
                        this.QQUserInfo = rsp.data.QQUserInfo
                        this.oauthRequesting = false
                    }
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                    this.$router.push({ path: '/signin' })
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
.signup-container {
    word-wrap: break-word;
    background-color: #fff;
    background-clip: border-box;
    border: 1px solid #e7eaf3;
    border-radius: .25rem;
    box-shadow: 0 0.5rem 1.2rem rgba(189, 197, 209, .2);
    min-height: 100px;
    min-height: 200px;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    overflow: hidden;
    .qq-userinfo-wrap {
        padding: 30px;
        background: #DCE8F9;
        .avatar-wrap {
            height: 40px;
            width: 40px;
            border-radius: 50%;
            overflow: hidden;
            margin: 0 auto;
            .qq-avatar {
                width: 100%;
                height: 100%;
            }
        }
        .username-wrap {
            line-height: 42px;
            height: 42px;
            font-size: 14px;
            text-align: center;
            font-weight: bold;
        }
        .tips {
            margin: 0 auto;
            margin-bottom: -42px;
            height: 24px;
            width: 160px;
            text-align: center;
            line-height: 24px;
            background: #fff;
            border-radius: 10px;
            color: #5C7390;
            font-size: 12px;
        }
    }
    .bind-wrap {
        margin-top: 30px;
        .signup-form {
            width: 80%;
            margin: 10px auto;
            .captcha-image-wrap {
                height: 34px;
                position: absolute;
                top: 1px;
                right: 1px;
                background: #fff;
                border-radius: 5px;
                overflow: hidden;
                cursor: pointer;
                .captcha-image {
                    height: 34px;
                }
            }
            .find-password-link {
                float: left;
            }
            .signup-link {
                float: right;
            }
            .user-agreement {
                font-weight: bold;
                cursor: pointer;
                color: #2d8cf0;
            }
        }
    }
}
</style>
<style lang="less">
.signup-container {
    .ivu-tabs-bar {
        border: none;
        .ivu-tabs-nav-scroll {
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>

