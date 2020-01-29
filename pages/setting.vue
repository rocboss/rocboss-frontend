<template>
    <Content class="user-container" v-if="userInfo.id">
        <Row type="flex" style="justify-content: center;">
            <Col :xs="24" :sm="24" :md="24" :lg="7">
                <div class="left-auto-wrap">
                    <!-- 基本信息 -->
                    <div class="left-bar">
                        <div class="user-bg"></div>
                        <div class="user-info">
                            <div class="user-avatar">
                                <img class="avatar-img" :src="userInfo.avatar + $store.state.oss.avatar" alt="">
                            </div>
                            <div class="user-name">
                                <span class="username">{{ userInfo.username }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 设置导航 -->
                    <div class="left-bar" style="padding: 0;">
                        <Menu mode="vertical" :active-name="activeName" @on-select="selectSettingItem">
                            <MenuItem name="baseinfo">
                                基本信息
                            </MenuItem>
                            <MenuItem name="password">
                                修改密码
                            </MenuItem>
                        </Menu>
                    </div>
                </div>
            </Col>
            <Col :xs="24" :sm="24" :md="24" :lg="17">
                <div class="setting-container">
                    <!-- 基本信息 -->
                    <div v-if="activeName === 'baseinfo'">
                        <Form :label-width="80">
                            <FormItem label="">
                                <img class="avatar-img" :src="userInfo.avatar + $store.state.oss.avatar" alt="">
                                <!-- 图片上传 -->
                                <Upload
                                    ref="imgUpload"
                                    :action="imgUploadGateway"
                                    :show-upload-list="false"
                                    :on-success="handleSuccess"
                                    :format="['jpg', 'jpeg', 'png', 'gif']"
                                    :max-size="1024"
                                    :on-format-error="handleFormatError"
                                    :on-exceeded-size="handleMaxSize"
                                    :before-upload="handleBeforeUpload"
                                    :headers="headers"
                                    accept="image/*"
                                    multiple
                                    type="drag">
                                    <div class="icon-btn">
                                        <svg-icon icon-class="camera"></svg-icon>
                                    </div>
                                </Upload>
                            </FormItem>
                            <FormItem label="用户名">
                                <Input v-model="userInfo.username" disabled placeholder="用户名" class="setting-input"></Input>
                            </FormItem>
                            <FormItem label="个性签名">
                                <Input v-model="userInfo.signature" type="textarea" :rows="5" class="setting-input" placeholder="请输入你的个性签名" />
                            </FormItem>
                            <FormItem>
                                <Button type="primary" :loading="loading" @click="submitBaseinfo">提交</Button>
                            </FormItem>
                        </Form>
                    </div>

                    <!-- 设置密码 -->
                    <div v-if="activeName === 'password'">
                        <Form :label-width="80">
                            <FormItem label="当前密码">
                                <Input v-model="passwordSetting.oldPassword" type="password" placeholder="请输入当前密码" class="setting-input"></Input>
                            </FormItem>
                            <FormItem label="新密码">
                                <Input v-model="passwordSetting.newPassword" type="password" placeholder="请输入新密码" class="setting-input"></Input>
                            </FormItem>
                            <FormItem label="重复密码">
                                <Input v-model="passwordSetting.repeatPassword" type="password" placeholder="请再次输入新密码" class="setting-input"></Input>
                            </FormItem>
                            <FormItem>
                                <Button type="primary" :loading="loading" @click="changePassword">提交</Button>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            </Col>
        </Row>
    </Content>
</template>
<script>
export default {
    mounted() {
        if (this.userInfo.id === 0) {
            this.$router.push({ path: '/signin' })
        }
    },
    computed: {
        userInfo: {
            get: function() {
                return Object.assign({}, this.$store.state.userInfo)
            },
            set: function(user) {
                this.$store.commit('changeUserInfo', user)
            }
        }
    },
    data() {
        return {
            loading: false,
            activeName: 'baseinfo',

            avatar_id: 0,
            imgList: [],
            // 图片上传网关
            imgUploadGateway: process.env.NUXT_ENV_API_GATEWAY + '/upload/avatar',
            headers: {
                'X-Authorization': this.$cookies.get('ROCBOSS-TOKEN')
            },

            phoneSetting: {
                phone: '',
                captcha: '',
                country_code: 86,
                isSending: false,
                sendCaptchaTxt: '获取验证码'
            },

            passwordSetting: {
                oldPassword: '',
                newPassword: '',
                repeatPassword: ''
            },

            messageSeeting: {
                push: true
            },

            formItem: {
                input: '',
                select: '',
                radio: 'male',
                checkbox: [],
                switch: true,
                date: '',
                time: '',
                slider: [20, 50],
                textarea: ''
            }
        }
    },
    methods: {
        selectSettingItem(name) {
            this.activeName = name
        },
        // 提交基本信息
        submitBaseinfo() {
            // 新头像
            this.imgList.forEach(img => {
                this.avatar_id = img.id
            })

            this.loading = true
            this.$axios.$post('/user/baseinfo', {
                avatar_id: this.avatar_id,
                signature: this.userInfo.signature
            }).then(rsp => {
                if (rsp.code === 0) {
                    this.$Message.success('提交成功')
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
                this.loading = false
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
                this.loading = false
            })
        },

        // 图片上传成功处理
        handleSuccess(res, img) {
            if (res.code === 0) {
                img.id = res.data.img_id
                img.url = res.data.img_url

                this.avatar_id = res.data.img_id
                // console.log(Object.assign(this.userInfo, { avatar: res.data.img_url }))
                this.$store.commit('changeUserInfo', Object.assign(this.userInfo, { avatar: res.data.img_url }))
            }
        },
        handleFormatError(file) {
            this.$Notice.warning({
                title: '图片格式不合法',
                desc: '图片文件 ' + file.name + ' 不合法，请选择 jpg 或 png 图片。'
            })
        },
        // 上传前校验
        handleBeforeUpload() {
            // 置空
            this.$refs.imgUpload.fileList = []
            this.imgList = this.$refs.imgUpload.fileList
            return true
        },
        handleMaxSize(file) {
            this.$Notice.warning({
                title: '图片大小限制',
                desc: '图片文件  ' + file.name + ' 太大了，不可以超过 1MB.'
            })
        },
        validatePassword() {
            if (!this.passwordSetting.oldPassword.length) {
                this.$Message.error('旧密码不能为空')
                return false
            }
            if (!this.passwordSetting.newPassword.length) {
                this.$Message.error('新密码不能为空')
                return false
            }
            if (!this.passwordSetting.repeatPassword.length) {
                this.$Message.error('重复新密码不能为空')
                return false
            }
            if (this.passwordSetting.newPassword === this.passwordSetting.oldPassword) {
                this.$Message.error('新旧密码不能相同')
                return false
            }
            if (this.passwordSetting.newPassword !== this.passwordSetting.repeatPassword) {
                this.$Message.error('重复新密码错误')
                return false
            }
            return true
        },
        changePassword() {
            if (!this.validatePassword()) {
                return
            }
            this.loading = true
            this.$axios.$post('/user/password', {
                'old_password': this.passwordSetting.oldPassword,
                'new_password': this.passwordSetting.newPassword
            }).then(rsp => {
                if (rsp.code === 0) {
                    this.$Message.success('修改成功')
                    this.$store.dispatch('logout')
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
                this.loading = false
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
                this.loading = false
            })
        }
    },
    watch: {
        'userInfo.id': function change(value) {
            if (value === 0) {
                this.$router.push({ path: '/signin' })
            }
        }
    }
}
</script>
<style lang="less" scoped>
.user-container {
    min-height: 200px;
    .user-bg {
        width: calc(100% + 2rem);
        height: 100px;
        margin: -1rem;
        background: #2d8cf0;
        border-radius: .25rem .25rem 0 0;
    }
    .user-info {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: flex-start;
        margin-top: -20px;
    }
    .user-avatar {
        border-radius: 5px;
        border: 3px solid #fff;
        .avatar-img {
            display: block;
            border-radius: 5px;
            width: 60px;
            height: 60px;
        }
    }
    .user-name {
        width: 100%;
        height: 50px;
        color: #5C7390;
        position: relative;
        margin-left: 10px;
        overflow: hidden;
        span {
            line-height: 50px;
            display: block;
            width: 100%;
            text-align: left;
            font-size: 16px;
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .nickname {
            font-weight: bold;
            font-size: 16px;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
.setting-container {
    background: #fff;
    min-height: 532px;
    padding: 4rem 2rem;
    border: 1px solid #efefef;
    border-radius: .25rem;
    .avatar-img {
        display: block;
        border-radius: 5px;
        width: 100px;
        height: 100px;
    }
    .setting-input {
        width: 300px;
        max-width: 100%;
    }
    .now-phone-txt {
        padding: 3px 5px;
        background: #2d8cf0;
        color: #fff;
        border-radius: 2px;
    }
    .phone-txt {
        font-weight: bold;
        font-size: 16px;
    }
    .send-sms-btn {
        border-radius: 0;
        height: 32px;
    }
    .setting-phone {
        .setting-select {
            width: 80px;
            height: 32px;
            background-color: #2d8cf0;
            color: #ffffff;
            text-align: center;
            border-radius: 0px !important;
        }
        .setting-input {
            width: 220px;
        }

    }
}
</style>
<style lang="less">
.user-container {
    .ivu-menu-light {
        width: 100%!important;
    }
    .ivu-input {
        background-color: #F7F9FB!important;
        border: none!important;
    }
    .ivu-input[disabled], fieldset[disabled] .ivu-input {
        background-color: #D8DDE6!important;
        color: #333!important;
    }
    .ivu-upload {
        width: 100px;
        height: 100px;
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, .2);
    }
    .ivu-upload-drag {
        border: none!important;
        background: none!important;
    }
    .icon-btn {
        height: 100%;
        vertical-align: middle;
        line-height: 98px;
        .svg-icon {
            color: #fff;
        }
    }
    .setting-phone {
        .setting-select {
            .ivu-select-selection {
                width: 80px;
                height: 32px;
                background-color: #2d8cf0;
                text-align: center;
                border-radius: 0px !important;
                border: none;
            .ivu-select-placeholder {
                color: #ffffff;
            }
            .ivu-select-arrow {
                color: #ffffff;
            }

            }
        }

    }
}
</style>

