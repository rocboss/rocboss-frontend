<template>
    <!-- 评论数据 -->
    <div class="comment-item clearfix" v-if="!comment.deleted">
        <div class="comment-item-userinfo">
            <router-link :to="'/user/' + comment.user.username">
                <div class="comment-item-userinfo-avatar">
                    <img class="comment-item-userinfo-avatar-img" :src="comment.user.avatar + $store.state.oss.avatar" alt="">
                </div>
            </router-link>
        </div>
        <!-- 评论内容 -->
        <div class="comment-item-content">
            <!-- 基础信息 -->
            <div class="comment-item-content-header">
                <router-link :to="'/user/' + comment.user.username">
                    <span class="nickname">{{ comment.user.username }}</span>
                    <span class="username">@{{ comment.user.username }}</span>
                    <span class="time">{{ comment.created_at }}</span>
                </router-link>
            </div>
            <!-- 内容区域 -->
            <template v-for="content in comment.contents">
                <!-- 文字内容 -->
                <div class="comment-item-content-text" v-if="content['type'] === '2'">
                    <p>{{ content['content'] }}</p>
                </div>
                <!-- 图片 -->
                <Row class="comment-item-content-thumbs" v-if="content.type === '3'">
                    <!-- 1P -->
                    <Col span="12">
                        <!-- 图片 -->
                        <image-thumbs :imgs="[content.content]"></image-thumbs>
                    </Col>
                </Row>
            </template>

            <!-- 操作区域 -->
            <!-- 评论操作区 -->
            <div class="comment-operations">
                <Poptip
                    v-if="comment.canManage"
                    confirm
                    title="确定删除该评论？"
                    @on-ok="confirmDeleteComment(comment)"
                    @on-cancel="">
                    <span class="delete">删除</span>
                </Poptip>
                <span class="reply" v-if="!comment.showReplyForm" @click="showReplyForm(comment)">回复</span>
                <span class="reply" v-if="comment.showReplyForm" @click="hideReplyForm(comment)">隐藏</span>
            </div>

            <!-- 评论回复区 -->
            <div :id="'comment-reply-'+comment.id" class="comment-reply">
                <div v-show="comment.showReplyForm">
                    <Input v-show="false" v-model="comment.atUserId"></Input>
                    <Input class="comment-reply-input" v-model="comment.content" :placeholder="comment.replyPlaceholder" autofocus></Input>
                    <Button class="comment-reply-submit-btn" :loading="comment.replySending" type="primary" @click="submitReply(comment)">提交</Button>
                </div>
            </div>

            <!-- 回复区域 -->
            <div class="reply-container" v-if="comment.replies.rows.length > 0">
                <div v-for="reply in comment.replies.rows" class="reply-item">
                    <span class="reply-userinfo"><router-link :to="'/user/' + reply.user.username">{{ reply.user.username }}</router-link> 
                        <template v-if="reply.at_user.id > 0">
                            回复 <router-link :to="'/user/' + reply.at_user.username">{{ reply.at_user.username }}</router-link>
                        </template>
                    ： </span>
                    <span class="reply-content">{{ reply.content }}</span>
                    <div class="reply-operations">
                        <span class="time">{{ reply.created_at }}</span>
                        <!-- 管理权限可以删除 -->
                        <Poptip
                            v-if="reply.canManage"
                            confirm
                            title="确定删除该回复？"
                            @on-ok="confirmDeleteReply(reply.id, comment)"
                            @on-cancel="">
                            <span class="delete">删除</span>
                        </Poptip>
                        <span class="reply" @click="showReplyForm(comment, reply.user.username, reply.user.id)">回复</span>
                    </div>
                </div>
                <!-- 加载全部回复 -->
                <div class="load-more-reply" v-if="comment.replies.rows.length < comment.replies.total && comment.replies.total > 3">
                    <span class="tip" @click="loadMoreReply(comment)">加载全部回复 <svg-icon icon-class="down-arrow"></svg-icon></span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ImageThumbs from '~/components/Post/ImageThumbs.vue'

export default {
    props: {
        comment: Object
    },
    components: {
        ImageThumbs
    },
    methods: {
        // 确认删除评论
        confirmDeleteComment(comment) {
            this.$axios.$delete('/comment/' + comment.id).then(rsp => {
                if (rsp.code === 0) {
                    // this.comments.splice(this.comments.findIndex(comment => {
                    //     return comment.id === id
                    // }), 1)
                    comment.deleted = true
                    this.$Message.success('删除成功')
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
            })
        },

        // 展示回复框
        showReplyForm(comment, username, atUserId) {
            comment.showReplyForm = true
            comment.replyPlaceholder = username ? '@' + username : '回复内容...'
            comment.content = ''
            comment.atUserId = atUserId || 0
        },

        // 隐藏回复框
        hideReplyForm(comment) {
            comment.showReplyForm = false
            comment.replyPlaceholder = '回复内容...'
            comment.content = ''
            comment.atUserId = 0
        },

        // 提交回复
        submitReply(comment) {
            comment.replySending = true

            this.$axios.$post('/post/_reply', {
                comment_id: comment.id,
                content: comment.content,
                at_user_id: comment.atUserId
            }).then(rsp => {
                if (rsp.code === 0) {
                    // 加载最新回复数据
                    this.loadMoreReply(comment)
                    this.hideReplyForm(comment)

                    this.$Message.success('发表成功')
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
                comment.content = ''
                comment.replySending = false
            }).catch(error => {
                comment.replySending = false
                this.$Message.error(error.toString() || '服务不可用')
                this.loading = false
            })
        },

        // 确认删除回复
        confirmDeleteReply(id, comment) {
            this.$axios.$delete('/reply/' + id).then(rsp => {
                if (rsp.code === 0) {
                    this.$Message.success('删除成功')

                    comment.replies.rows.splice(comment.replies.rows.findIndex(reply => {
                        return reply.id === id
                    }), 1)
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
            })
        },

        // 加载更多回复，业务逻辑限制评论下回复数最大100条，直接取全量数据
        loadMoreReply(comment) {
            this.$axios.$get('/post/_comment/' + comment.id + '/_replies', {
                params: {
                    page: 1,
                    page_size: 100
                }
            }).then(rsp => {
                if (rsp.code === 0) {
                    comment.replies = rsp.data
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
                this.loading = false
            })
        },

        // 页面滚动到指定位置
        scrollTop(number = 0, time) {
            var self = this
            if (!time) {
                document.body.scrollTop = document.documentElement.scrollTop = number
                return number
            }
            const spacingTime = 20 // 设置循环的间隔时间  值越小消耗性能越高
            let spacingInex = time / spacingTime // 计算循环的次数
            let nowTop = document.body.scrollTop + document.documentElement.scrollTop // 获取当前滚动条位置
            let everTop = (number - nowTop) / spacingInex // 计算每次滑动的距离
            let scrollTimer = setInterval(() => {
                if (spacingInex > 0) {
                    spacingInex--
                    self.scrollTop(nowTop += everTop)
                } else {
                    clearInterval(scrollTimer) // 清除计时器
                }
            }, spacingTime)
        }
    }
}
</script>

<style lang="less" scoped>
.comment-item {
    width: 100%;
    padding: 20px;
    min-height: 100px;
    border-bottom: 1px solid #efefef;
    &-userinfo {
        width: 60px;
        height: inherit;
        float: left;
        position: relative;
        &-avatar {
            position: absolute;
            top: 0;
            left: 0;
            width: 40px;
            height: 40px;
            border-radius: 5px;
            z-index: 100;
            &-img {
                width: 100%;
                height: 100%;
                border-radius: 5px;
            }
        }
    }
    &-content {
        width: calc(100% - 50px);
        height: inherit;
        float: right;
        &-header {
            width: 100%;
            height: 40px;
            line-height: 20px;
            word-break: break-all;
            position: relative;
            .nickname {
                color: #14171a;
                font-size: 14px;
                font-weight: bold;
            }
            .username {
                font-size: 14px;
                color: #657786;
                position: absolute;
                top: 20px;
                left: 0;
            }
            .time {
                float: right;
                font-size: 12px;
                color: #657786;
            }
        }
        &-text {
            margin: 10px 0;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-size: 14px;
            line-height: 24px;
            text-align: justify;
            text-justify: inter-ideograph;/*IE*/
        }
        &-thumbs {
            line-height: 0;
            .img-thumb {
                width: 100%;
                height: 100%;
                border: 1px solid #fff;
                transition: all .3s;
                cursor: pointer;
            }
        }
        &-video {
            line-height: 0;
            .video-player-box {
                width: 100%;
            }
        }
        &-options {
            height: 18px;
            line-height: 18px;
            margin-bottom: 2px;
            margin-top: 10px;
            position: relative;
            .action {
                display: inline-block;
                min-width: 80px;
                .num {
                    display: inline-block;
                    line-height: 18px;
                    height: 18px;
                    margin-left: 5px;
                }
            }
            .btn-text {
                
                &:focus {
                    box-shadow: none;
                }
                padding: 0;
                .svg-icon {
                    font-size: 18px;
                    color: #657786;
                }
            }
            .detail-entrance {
                position: absolute;
                right: 0;
                top: 0;
                .svg-icon {
                    font-size: 14px;
                    color: #8ca6bb;
                }
            }
        }
    }
    .comment-operations {
        height: 24px;
        line-height: 24px;
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        position: relative;
        .delete, .reply {
            margin-left: 5px;
            color: #A8B7C7;
            &:hover {
                cursor: pointer;
                color: #2d8cf0;
            }
        }
    }
    .comment-reply {
        position: relative;
        .comment-reply-input {
            width: calc(100% - 60px);
        }
        .comment-reply-submit-btn {
            position: absolute;
            top: 0;
            right: 0;
            border-radius: 0;
        }
    }
    .reply-container {
        margin-top: 10px;
        padding: 5px 10px;
        min-height: 44px;
        line-height: 24px;
        background: #F7F9FB;
        .reply-item {
            width: 100%;
            line-height: 24px;
            position: relative;
            margin: 5px 0;
            .reply-operations {
                height: 24px;
                line-height: 24px;
                display: flex;
                flex-direction: row;
                justify-content: flex-end;
                position: relative;
                .time {
                    height: 24px;
                    line-height: 24px;
                    color: #A8B7C7;
                    position: absolute;
                    left: 0;
                    top: 0;
                }
                .delete, .reply {
                    margin-left: 5px;
                    color: #A8B7C7;
                    &:hover {
                        cursor: pointer;
                        color: #2d8cf0;
                    }
                }
            }
        }
        .load-more-reply {
            height: 24px;
            line-height: 24px;
            user-select: none;
            .tip {
                color: #2d8cf0;
                cursor: pointer;
            }
        }
    }
}
</style>
