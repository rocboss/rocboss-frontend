<template>
    <Content>
        <Row type="flex">
            <Col span="12" :xs="24" :sm="24" :md="12" :lg="12" style="margin: 0 auto;">
                <div class="messages-box">
                    <div v-if="list.length > 0" v-for="message in list" class="message-item" :class="{'un-read': message.is_read === '0'}" @click="remarkRead(message)">
                        <!-- 消息用户信息 -->
                        <div class="message-item-userinfo">
                            <router-link v-if="message.sender_user.id > 0" :to="'/user/' + message.sender_user.username">
                                <div class="message-item-userinfo-avatar">
                                    <img class="message-item-userinfo-avatar-img" :src="message.sender_user.avatar + $store.state.oss.avatar" alt="">
                                </div>
                            </router-link>
                        </div>
                        <!-- 消息体-->
                        <div class="message-item-content">
                            <div class="message-item-content-header">
                                <router-link v-if="message.sender_user.id > 0" :to="'/user/' + message.sender_user.username">
                                    <span class="username">{{ message.sender_user.username }}</span>
                                </router-link>
                                <span v-else class="nickname">系统</span>
                                <span class="time">
                                    <span class="un-read-tag" v-if="message.is_read === '0'">未读</span>
                                    {{ message.created_at }}
                                </span>
                            </div>
                            <!-- 用户加圈消息提醒 -->
                            <div class="message-item-content-text" v-if="message.type === '2' && message.group_id > 0">
                                <router-link :to="'/group/' + message.group_id">
                                    {{ message.breif }} <svg-icon :size="14" icon-class="link"></svg-icon>
                                </router-link>
                            </div>
                             <!-- 评论&回复消息-->
                            <div class="message-item-content-text" v-if="message.type === '1'">
                                <router-link :to="'/post/' + message.post.alias_id + '?comment_id=' + message.comment.id">
                                    {{ message.breif }} <svg-icon :size="14" icon-class="link"></svg-icon>
                                </router-link>
                            </div>
                            <div class="message-item-content-block" v-if="message.type === '1' && message.reply_id === '0'">
                                <div v-if="message.comment.id > 0" v-for="content in message.comment.contents">
                                    <!-- 文字内容 -->
                                    <div class="message-item-content-comment-text" v-if="content['type'] === '2'">
                                        <p>{{ content['content'] }}</p>
                                    </div>
                                    <!-- 图片 -->
                                    <Row class="message-item-content-thumbs" v-if="content.type === '3'">
                                        <!-- 1P -->
                                        <Col span="12">
                                            <img class="img-thumb" :src="content.content + '@!thumbnail'" alt="">
                                        </Col>
                                    </Row>
                                </div>
                                <div v-if="message.comment.id === 0">
                                    <svg-icon icon-class="question"></svg-icon> 该评论已被删除
                                </div>
                            </div>
                            <div class="message-item-content-block" v-if="message.type === '1' && message.reply_id !== '0'">
                                {{ message.content }}
                            </div>
                            <!-- 用户私信消息提醒 -->
                            <div class="message-item-content-text" v-if="message.type === '5' && message.whisper_id > 0">
                                 <router-link :to="'/user/' + message.sender_user.username">
                                    {{ message.breif }} <svg-icon :size="14" icon-class="link"></svg-icon>
                                </router-link>
                            </div>
                            <div class="message-item-content-block" v-if="message.type === '5' && message.whisper_id !== '0'">
                                {{ message.whisper.content }}
                            </div>
                        </div>
                        
                    </div>

                    <!-- 分页 -->
                    <div v-if="total > 0" class="pagination-wrap">
                        <Page :total="total" :page-size="page_size" :current="page"  @on-change="pageTurn" style="float: right"></Page>
                    </div>

                    <!-- 空数据·占位图 -->
                    <div v-if="list.length === 0" class="empty-post-wrap">
                        <img :src="require('@/assets/image/empty.png')" class="empty-image">
                        <div class="empty-tips">
                            暂无消息通知哦~
                        </div>
                    </div>
                </div>
            </Col>
        </Row>
    </Content>
</template>
<script>
export default {
    head() {
        return {
            title: '我的通知'
        }
    },
    components: {

    },
    data() {
        return {
            page: 1,
            page_size: 20,
            total: 0,
            list: [],
            loading: false
        }
    },
    watch: {
        '$route.query'(to, from) {
            this.page = parseInt(this.$route.query.page) || 1
            this.loadData()
        }
    },
    methods: {
        pageTurn(page) {
            this.$router.push({ path: '/messages?page=' + page })
            this.page = page
            this.loadData()
        },
        // 标记消息已读
        remarkRead(message) {
            if (message.is_read === '0') {
                this.$axios.$post('/message/read/remark', {
                    message_id: message.id
                }).then(rsp => {
                    if (rsp.code === 0) {
                        message.is_read = '1'

                        // 重新check未读消息数
                        this.$store.commit('checkUnreadMessageCount')
                    } else {
                        this.$Message.error(rsp.msg || '服务不可用')
                    }
                }).catch(error => {
                    this.$Message.error(error.toString() || '服务不可用')
                })
            }
        },
        // 加载数据
        loadData() {
            if (this.loading) {
                return false
            }
            this.loading = true
            this.$axios.$get('/messages', {
                params: {
                    page: this.page,
                    page_size: this.page_size
                }
            }).then(rsp => {
                if (rsp.code === 0) {
                    this.list = rsp.data.rows
                    this.total = rsp.data.total
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
    mounted() {
        this.$store.commit('changeActiveNav', 'message')

        // 加载首页POST数据
        this.page = parseInt(this.$route.query.page) || 1
        this.loadData()
    }
}
</script>
<style lang="less" scoped>
.messages-box {
    min-height: 200px;
    background: #fff;
    border: 1px solid #e7eaf3;
    border-radius: 0.25rem;
    box-shadow: 0 0.5rem 1.2rem rgba(189, 197, 209, 0.2);
    .message-item {
        border-bottom: 1px solid #efefef;
        display: flex;
        &.un-read {
            background:#f8fbff;
            cursor: pointer;
        }
        .message-item-userinfo {
            width: 70px;
            height: inherit;
            float: left;
            position: relative;
            &-avatar {
                margin: 20px auto;
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
        .message-item-content {
            width: calc(100% - 70px);
            height: inherit;
            padding: 20px 20px 20px 0;
            .un-read-tag {
                margin-right: 5rpx;
                color: #2d8cf0;
            }
            &-header {
                height: 20px;
                line-height: 20px;
                word-break: break-all;
                .nickname {
                    color: #14171a;
                    font-size: 14px;
                    font-weight: bold;
                }
                .username {
                    font-size: 14px;
                    color: #657786;
                }
                .time {
                    float: right;
                    font-size: 12px;
                    color: #657786;
                }
            }
            &-text {
                margin-top: 2px;
                line-height: 20px;
                font-size: 14px;
                height: 20px;
            }
            &-comment-text {
                font-size: 14px;
            }
            &-thumbs {
                line-height: 0;
                margin-top: 10px;
                .img-thumb {
                    width: 100%;
                    height: 100%;
                    border: 1px solid #fff;
                    transition: all .3s;
                }
                .article-img-thumb {
                    width: 100%;
                    margin-bottom: 20px;
                }
            }
            &-block {
                margin-top: 10px;
                padding: 10px 12px;
                background: #f2f4f5;
                position: relative;
                &::before {
                    content: '';
                    width: 0;
                    height: 0;
                    display: block;
                    border-top: 5px solid transparent;
                    border-left: 5px solid transparent;
                    border-right: 5px solid transparent;
                    border-bottom: 5px solid #f2f4f5;
                    top: -10px;
                    left: 20px;
                    position: absolute;
                }
            }
        }
    }
    .pagination-wrap {
        display: inline-block;
        width: 100%;
        margin-top: 20px;
        padding: 20px;
    }
    .empty-post-wrap {
        width: 100%;
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        .empty-image {
            width: 150px;
            display: block;
        }
        .empty-tips {
            height: 64px;
            line-height: 64px;
            font-size: 14px;
            color: #A8B7C7;
        }
    }
}
</style>
