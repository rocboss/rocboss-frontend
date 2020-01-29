<template>
    <no-ssr>
        <uploader ref="uploader" :options="options">
            <slot name="uploader"></slot>
        </uploader>
    </no-ssr>
</template>

<script>
import Vue from 'vue'
import uploader from 'vue-simple-uploader'

// No SSR
if (process.browser) {
    Vue.use(uploader)
}

export default {
    props: {
        options: Object
    },
    mounted() {
        this.$nextTick(_ => {
            const uploader = this.$refs.uploader.uploader

            // 文件开始上传
            uploader.on('fileAdded', () => {
                this.$emit('uploadState', true)
            })
            // 文件上传失败
            uploader.on('fileError', (rootFile, file, message) => {
                this.$emit('uploadState', false)
                message = JSON.parse(message)
                this.$Message.error(message.data.msg)
            })
            // 文件上传中
            uploader.on('fileProgress', (rootFile, file) => {
                this.$emit('uploadPercent', Math.floor(rootFile.progress() * 100))
            })
            // 文件上传成功
            uploader.on('fileSuccess', (rootFile, file, message) => {
                this.$emit('uploadState', false)
                message = JSON.parse(message)
                if (message.code === 0) {
                    this.$emit('uploadSuccess', message.data)
                } else {
                    this.$Message.error(message.msg)
                }
            })
        })
    }
}
</script>

<style lang="less" scoped>
.uploader {
    .ivu-upload {
        display: flex;
        justify-content: center;
    }
}
</style>
