<template>
    <div class="compose-wrap">

        <!-- 图片预览 -->
        <Modal title="图片预览" v-model="visible" footer-hide>
            <img :src="previewImgUrl" v-if="visible" style="width: 100%">
        </Modal>

        <div class="post-area" v-if="$store.state.userInfo.id">
            <div class="avatar-wrap">
                <img v-if="$store.state.userInfo.id" class="avatar-img" :src="$store.state.userInfo.avatar + $store.state.oss.avatar" :alt="$store.state.userInfo.nickname">
            </div>

            <div class="post-input">
                <Input v-model="content" type="textarea" placeholder="快来发表评论吧" :rows="replyRows" :maxlength="200" @on-focus="showReplyOperation">
                </Input>
                <!-- 字数统计 -->
                <div v-if="replyReady" class="comment-text-statistics">{{ content.length }}/200</div>

                <div v-show="replyReady" class="operations">
                    <!-- 图片上传 -->
                    <Upload
                        v-if="imgList.length < 1"
                        ref="imgUpload"
                        :action="imgUploadGateway"
                        :show-upload-list="false"
                        :on-success="handleSuccess"
                        :format="['jpg', 'jpeg', 'png', 'gif']"
                        :max-size="5120"
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

                    <!-- 取消评论 -->
                    <Button class="cancel-btn" shape="circle" @click="hideReplyOperation" type="text">取消</Button>
                    <!-- 提交评论 -->
                    <Button class="submit-btn" shape="circle" @click="submit" :loading="loading" type="primary">提交</Button>
                </div>
                
                <!-- 图片缩略图 -->
                <div class="img-upload-list" v-for="item,index in imgList" :key="index">
                    <template v-if="item.status === 'finished'">
                        <img :src="item.url + $store.state.oss.avatar">
                        <div class="img-upload-list-cover">
                            <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                            <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
                        </div>
                    </template>
                    <template v-else>
                        <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        postId: Number
    },
    data() {
        return {
            visible: false,
            loading: false,
            replyReady: false,
            replyRows: 1,

            // 图片上传网关
            imgUploadGateway: process.env.NUXT_ENV_API_GATEWAY + '/upload/img',
            headers: {
                'X-Authorization': this.$cookies.get('ROCBOSS-TOKEN')
            },

            content: '',
            previewImgUrl: '',
            imgList: []
        }
    },
    methods: {
        showReplyOperation() {
            this.replyRows = 5
            this.replyReady = true
        },
        hideReplyOperation() {
            this.replyRows = 1
            this.replyReady = false
        },
        handleView(name) {
            this.previewImgUrl = name
            this.visible = true
        },
        handleRemove(file) {
            this.imgList.splice(this.imgList.indexOf(file), 1)
        },
        // 图片上传成功处理
        handleSuccess(res, img) {
            if (res.code === 0) {
                img.id = res.data.img_id
                img.url = res.data.img_url
            } else {
                this.$Message.error(res.msg)
                // 置空
                this.imgList = []
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
            const check = this.imgList.length < 1
            if (!check) {
                this.$Notice.warning({
                    title: '最多可以上传1张图片'
                })
            }
            this.imgList = this.$refs.imgUpload.fileList
            return check
        },
        handleMaxSize(file) {
            this.$Notice.warning({
                title: '图片大小限制',
                desc: '图片文件  ' + file.name + ' 太大了，不可以超过 5MB.'
            })
        },
        // 提交评论
        submit() {
            if (this.content.length < 2) {
                this.$Message.error('评论内容至少需要2个字')
                return
            }
            let contents = []

            // 加入内容
            contents.push({
                content: this.content,
                type: '2'
            })

            // 纳入图片
            this.imgList.forEach(img => {
                contents.push({
                    content: img.id,
                    type: '3'
                })
            })

            // 请求发布
            this.loading = true
            this.$axios.$post('/post/_comment', {
                post_id: this.postId,
                contents: contents
            }).then(rsp => {
                if (rsp.code === 0) {
                    this.hideReplyOperation()

                    this.$Message.success('发表成功')
                    this.loading = false

                    this.content = ''
                    this.previewImgUrl = ''
                    this.imgList = []

                    // 发表成功
                    this.$emit('pushSuccess')
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                    this.loading = false
                }
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
                this.loading = false
            })
        }
    },
    deactivated() {
        this.replyRows = 1
        this.replyReady = false
    }
}
</script>

<style lang="less" scoped>
.post-area {
    min-height: 40px;
    width: 100%;
    padding: 20px;
    background: #f3f4ff;
    display: flex;
    justify-content: center;
    box-shadow: 0 0 1px #D3DCE7;
    .avatar-wrap {
        height: 40px;
        width: 40px;
        .avatar-img {
            height: 40px;
            width: 40px;
            border-radius: 5px;
            display: block;
        }
    }
    .post-input {
        width: calc(100% - 40px);
        height: inherit;
        position: relative;
        padding-left: 10px;
        .operations {
            width: 100%;
            height: 32px;
            margin-top: 10px;
            position: relative;
            .upload-btn {
                position: absolute;
                left: 0;
                bottom: 0;
                display: block;
                height: 32px;
                width: 32px;
            }
            .cancel-btn {
                position: absolute;
                right: 60px;
                bottom: 0;
            }
            .submit-btn {
                position: absolute;
                right: 0;
                bottom: 0;
            }
        }
    }
    .img-upload-list{
        display: inline-block;
        width: 60px;
        height: 60px;
        text-align: center;
        line-height: 60px;
        border: 1px solid transparent;
        border-radius: 4px;
        overflow: hidden;
        background: #fff;
        position: relative;
        box-shadow: 0 1px 1px rgba(0,0,0,.2);
        margin-top: -32px;
    }
    .img-upload-list img{
        width: 100%;
        height: 100%;
    }
    .img-upload-list-cover{
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,.6);
    }
    .img-upload-list:hover .img-upload-list-cover{
        display: block;
    }
    .img-upload-list-cover i{
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        margin: 0 2px;
    }
}
.img-upload-list{
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0,0,0,.2);
    margin-right: 4px;
}
.img-upload-list img{
    width: 100%;
    height: 100%;
}
.img-upload-list-cover{
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,.6);
}
.img-upload-list:hover .img-upload-list-cover{
    display: block;
}
.img-upload-list-cover i{
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
}
</style>
<style lang="less">
.post-input {
    .ivu-upload {
        width: 32px;
        height: 32px;
        line-height: 32px;
        border: none;
        border-radius: 50%;
        display: inline-block;
    }
    .ivu-input {
        font-size: 14px;
        border-radius: 0;
        border: none;
        resize: none;
        padding: 10px;
        background-color: #FFF;
        &:focus {
            outline: 0;
            box-shadow: none;
        }
    }
}
.comment-text-statistics {
    position: absolute;
    right: 5px;
    bottom: 45px;
    background: #fff;
    opacity: .8;
}
</style>
