<template>
    <section class="container">
        <Row>
            <Col :xs="24" :sm="24" :md="24" :lg="8">
                <div class="signup-container">
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
                            <Input type="password" prefix="ios-lock-outline" v-model="signinForm.password" placeholder="请输入密码" size="large" @on-enter="handleSubmit('signinForm')" clearable/>
                        </FormItem>

                        <!-- 提交登录 -->
                        <FormItem>
                            <Button type="primary" @click="handleSubmit('signinForm')" size="large" :loading="loading" long>登 录</Button>
                        </FormItem>
                    </Form>

                    <!-- OAuth Wrap -->
                    <div class="oauth-wrap">
                        <div class="oauth-wrap-title">
                            <span class="short-line"></span>
                            <span class="line-text">第三方账号快捷登录</span> 
                            <span class="short-line"></span>
                        </div>
                        <Button type="primary" size="large" @click="requestQQOAuthLogin()" :loading="oauthRequesting" long>
                            <svg-icon icon-class="qq" /> QQ一键登录
                        </Button>
                    </div>
                </div>
            </Col>

            <Col :xs="24" :sm="24" :md="24" :lg="16">
                <div class="signup-bg-container">
                    <img :src="require('@/assets/image/signin-bg.jpg')" class="signup-bg-image" />
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
            oauthRequesting: false,
            sendCaptchaTxt: '获取验证码',
            showAgreement: false,

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
            }
        }
    },
    methods: {
        // 提交登录
        handleSubmit(name) {
            this.$refs[name].validate((valid) => {
                if (valid) {
                    this.loading = true
                    this.$store.dispatch('handleSignin', {
                        account: this.signinForm.account,
                        password: this.signinForm.password,
                        captchaCode: this.signinForm.captchaCode,
                        captchaToken: this.captchaToken,
                        bindToken: ''
                    }).then(res => {
                        this.$Message.success('登录成功')

                        // 同步用户登录态
                        this.$store.dispatch('getUserInfo')
                        this.$router.push({ path: '/' })
                        this.loading = false
                    }).catch(err => {
                        // 重置图形验证码
                        this.loadImageCaptcha()
                        this.loading = false

                        this.$Message.error(err.msg)
                    })
                }
            })
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
        requestQQOAuthLogin() {
            this.oauthRequesting = true
            this.$axios.$get('/user/oauth/qq').then(rsp => {
                if (rsp.code === 0) {
                    // 转跳前往授权
                    window.location.href = rsp.data.redirect_url
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
                this.oauthRequesting = false
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
    height: 530px;
    width: 100%;
    max-width: 310px;
    overflow: hidden;
    .signup-form {
        width: 80%;
        margin: 10% auto;
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
    .oauth-wrap {
        width: 80%;
        margin: 10% auto;
        .oauth-wrap-title {
            height: 22px;
            margin-bottom: 20px;
            width: 100%;
            display: flex;
            justify-content: center;
            .line-text {
                width: 140px;
                height: 22px;
                line-height: 22px;
                text-align: center;
                display: inline-block;
            }
            .short-line {
                width: 40px;
                height: 22px;
                display: inline-block;
                position: relative;
                &::before {
                    content: ' ';
                    display: block;
                    height: 1px;
                    width: 100%;
                    position: absolute;
                    top: 10px;
                    background: #cccccc;
                }
            }
        }
    }
}
.signup-bg-container {
    border: 1px solid #e7eaf3;
    border-radius: 0.25rem;
    box-shadow: 0 0.5rem 1.2rem rgba(189, 197, 209, 0.2);
    width: 100%;
    height: 530px;
    overflow: hidden;
    .signup-bg-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
@media screen and (max-device-width:991px) {
    .signup-container {
        max-width: 400px;
        margin: 0 auto;
    }
}
</style>
