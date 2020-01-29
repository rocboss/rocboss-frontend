<template>
    <Content class="post-detail-container" v-show="aliasId.length > 0">
        <!-- 正常展示 -->
        <Row type="flex" v-if="canView">
            <!-- 内容区 -->
            <Col :xs="24" :sm="24" :md="24" :lg="17">
                <div class="post-content-wrap">
                    <!-- POST详情 -->
                    <div class="post-container" v-if="+post.id > 0">
                        <div class="post-item clearfix">
                            <div class="post-item-content">
                                <div class="post-item-userinfo">
                                    <router-link :to="'/user/' + post.user.username">
                                        <div class="post-item-userinfo-avatar">
                                            <img class="post-item-userinfo-avatar-img" :src="post.user.avatar + $store.state.oss.avatar" alt="">
                                        </div>
                                    </router-link>
                                </div>
                                <div class="post-item-content-header">
                                    <router-link :to="'/user/' + post.user.username">
                                        <span class="nickname">{{ post.user.username }}</span>
                                        <span class="username">@{{ post.user.username }}</span>
                                    </router-link>
                                    <!-- 置顶 -->
                                    <Tooltip content="置顶" placement="top" class="post-detail-icon" v-if="post.is_top > 0">
                                        <svg-icon icon-class="pin"></svg-icon>
                                    </Tooltip>
                                    <!-- 精华 -->
                                    <Tooltip content="精华" placement="top" class="post-detail-icon" v-if="post.is_essence > 0">
                                        <svg-icon icon-class="essence"></svg-icon>
                                    </Tooltip>
                                    <span class="time">{{ post.created_at }}</span>
                                </div>
                                <div :class="post.type === '2' && post.contents.length > 5 && showBrief ? 'article-wrap' : ''">
                                    <template v-for="content in post.contents">
                                        <!-- 冒泡内容 -->
                                        <template v-if="post.type === '1'">
                                            <!-- 文字 -->
                                            <div class="post-item-content-text" v-if="content.type === '2'">
                                                <p>{{ content.content }}</p>
                                            </div>

                                            <!-- 图片 -->
                                            <image-thumbs :imgs="content.content" v-if="content.type === '3'"></image-thumbs>

                                            <!-- 视频 -->
                                            <Row class="post-item-content-video" v-if="content.type === '4'">
                                                <!-- 视频组件 -->
                                                <Video :url="content.content"></Video>
                                            </Row>
                                        </template>

                                        <!-- 文章内容 -->
                                        <template v-if="post.type === '2'">
                                            <!-- 标题 -->
                                            <div class="post-item-content-text" v-if="content.type === '1'">
                                                <h3>{{ content.content }}</h3>
                                            </div>

                                            <!-- 文字 -->
                                            <div class="post-item-content-text" v-if="content.type === '2'">
                                                <p>{{ content.content }}</p>
                                            </div>

                                            <!-- 图片 -->
                                            <image-thumbs :imgs="[content.content]" v-if="content.type === '3'"></image-thumbs>

                                            <!-- 视频 -->
                                            <Row class="post-item-content-video" v-if="content.type === '4'">
                                                <!-- 视频组件 -->
                                                <Video :url="content.content"></Video>
                                            </Row>
                                        </template>
                                    </template>
                                    <!-- 点击阅读全文 -->
                                    <div class="show-more-btn" v-if="post.type === '2' && post.contents.length > 5 && showBrief " @click="showArticleMore">
                                        <span>点击阅读全文</span>
                                    </div>
                                </div>
                                
                                <!-- POST 操作区 -->
                                <div class="post-item-content-options">
                                    <!-- 评论 -->
                                    <div class="action">
                                        <svg-icon :size="24" icon-class="comment"></svg-icon>
                                        <span class="num">{{ post.comment_count }}</span>
                                    </div>
                                    <!-- 收藏 -->
                                    <div class="action" @click="doStar(post.id)">
                                        <svg-icon :size="24" :icon-class="post.hasStarred ? 'star-fill' : 'star'" :class="post.hasStarred ? 'icon-fill' : ''"></svg-icon>
                                        <Spin v-if="staring" class="upvoting" size="large"></Spin>
                                        <span class="num">{{ post.collection_count }}</span>
                                    </div>
                                    <!-- 点赞 -->
                                    <div class="action" @click="doUpvote(post.id)">
                                        <svg-icon :size="24" :icon-class="post.hasUpvoted ? 'like-fill' : 'like'" :class="post.hasUpvoted ? 'icon-fill' : ''"></svg-icon>
                                        <Spin v-if="upvoting" class="upvoting" size="large"></Spin>
                                        <span class="num">{{ post.upvote_count }}</span>
                                    </div>
                                    <!-- 操作 -->
                                    <div class="action options">
                                        <Dropdown class="post-options" @on-click="operatePost" trigger="click" placement="bottom-end">
                                            <div class="option">
                                                <Icon type="ios-arrow-down"></Icon>
                                            </div>
                                            <DropdownMenu slot="list">
                                                <DropdownItem name="tipOff">举报</DropdownItem>
                                                <!-- START 管理员操作 -->
                                                <DropdownItem name="cancelTop" v-if="post.canManage && post.is_top == 1 && $store.state.userInfo.role == 99">取消置顶</DropdownItem>
                                                <DropdownItem name="setTop" v-if="post.canManage && post.is_top == 0 && $store.state.userInfo.role == 99">置顶</DropdownItem>
                                                <DropdownItem name="cancelEssence" v-if="post.canManage && post.is_essence == 1 && $store.state.userInfo.role == 99">取消精华</DropdownItem>
                                                <DropdownItem name="setEssence" v-if="post.canManage && post.is_essence == 0 && $store.state.userInfo.role == 99">精华</DropdownItem>
                                                <!-- END 管理员操作 -->
                                                <DropdownItem name="delete" v-if="post.canManage">删除</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 回复框 -->
                    <Affix>
                        <compose-comment :post-id="+post.id" @pushSuccess="pushCommentSuccess"></compose-comment>
                    </Affix>

                    <!-- 评论区域 -->
                    <div class="comment-container" v-infinite-scroll="loadMoreComments" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
                        <!-- 评论数据 -->
                        <comment-item v-for="comment,index in comments" 
                            :key="comment.id" 
                            :comment="comment">

                        </comment-item>
                        
                        <!-- 空数据·占位图 -->
                        <div v-if="comments && comments.length === 0" class="empty-post-wrap">
                            <img :src="require('@/assets/image/empty.png')" class="empty-image">
                            <div class="empty-tips">
                                暂无评论，快来抢沙发~
                            </div>
                        </div>
                        <div class="loading" v-if="comments && comments.length > 0">
                            <div><Spin size="large" v-if="busy"></Spin></div>
                            <div v-if="!busy && commentsNoMore">已加载全部评论</div>
                        </div>
                    </div>
                </div>
            </Col>

            <!-- 侧边栏 -->
            <Col :xs="24" :sm="24" :md="24" :lg="7">
                <Affix>
                    <!-- 友情链接 -->
                    <links style="margin-top: 0;" />

                    <!-- 广告 -->
                    <ad />
                </Affix>
            </Col>
        </Row>
    </Content>
</template>

<script>
import Vue from 'vue'
import Video from '~/components/Post/Video'
import ImageThumbs from '~/components/Post/ImageThumbs.vue'
import CommentItem from '~/components/Post/CommentItem.vue'
import ComposeComment from '~/components/Post/ComposeComment.vue'
import Links from '~/components/Links.vue'
import Ad from '~/components/Ad.vue'

// No SSR
if (process.browser) {
    Vue.use(require('vue-infinite-scroll'))
}

// 加载POST详情数据
const getPostDetailData = async(axios, aliasId) => {
    let rsp = await axios.$get('/post/detail/' + aliasId)

    if (rsp.code !== 0) {
        throw 'error'
    }

    return {
        post: rsp.data
    }
}

// 加载评论数据
const getCommentsData = async(axios, postId, page, pageSize) => {
    let rsp = await axios.$get('/post/' + postId + '/_comments', {
        params: {
            page,
            page_size: pageSize
        }
    })

    return {
        comments: rsp.code === 0 ? rsp.data : []
    }
}

export default {
    async asyncData({ params, $axios, query, app, redirect }) {
        try {
            let aliasId = params.aliasId || ''
            let post = await getPostDetailData($axios, aliasId)
            let comments = post.post.id > 0 ? await getCommentsData($axios, post.post.id, 1, 20) : {}

            if (comments.comments.rows) {
                comments.comments.rows.forEach(row => {
                    row.deleted = false
                    row.showReplyForm = false
                    row.replyPlaceholder = row.replyPlaceholder || '回复内容...'
                    row.content = row.content || ''
                    row.atUserId = row.atUserId || 0
                    row.replySending = row.replySending || false
                })
            }

            return Object.assign({ aliasId }, post, {
                comments: comments.comments.rows || []
            })
        } catch (error) {
            redirect({ path: '/' })
        }
    },
    components: {
        ComposeComment,
        ImageThumbs,
        Video,
        CommentItem,
        Links,
        Ad
    },
    head() {
        return {
            title: '冒泡/文章详情'
        }
    },
    mounted() {
        this.$store.commit('changeActiveNav', 'post')
        this.aliasId = this.$route.params.aliasId || ''
    },
    data() {
        return {
            // 主题别名ID
            aliasId: '',

            post: {
                id: 0
            },

            canView: true,
            staring: false,
            upvoting: false,
            showBrief: true,

            // 是否正在加载过程中
            busy: false,
            // 评论相关
            commentsNoMore: false,
            commentsPage: 1,
            commentsPageSize: 20,
            comments: []
        }
    },
    methods: {
        // 显示更多文章
        showArticleMore() {
            this.showBrief = false
        },

        // 评论发表成功
        pushCommentSuccess() {
            // 修改评论数
            this.post.comment_count = +this.post.comment_count + 1

            // 重新加载
            this.commentsPage = 1
            setTimeout(() => {
                this.loadComments()
            }, 100)
        },
        // 操作POST
        operatePost(name) {
            if (name === 'delete') {
                // 删除POST
                // this.modal.deleteConfirmModal = true
                this.$Modal.confirm({
                    title: '确定删除该内容吗？',
                    content: '请注意，该操作一旦执行将无法撤回',
                    onOk: () => {
                        this.confirmDeletePost()
                    }
                })
            }
            if (name == 'setTop' || name == 'cancelTop') {
                // 置顶
                this.$Modal.confirm({
                    title: '确定' + (this.post.is_top == 1 ? '取消' : '') + '置顶该主题吗？',
                    onOk: () => {
                        this.confirmSetPostTop()
                    }
                })
            }

            if (name == 'setEssence' || name == 'cancelEssence') {
                // 置顶
                this.$Modal.confirm({
                    title: '确定' + (this.post.is_essence == 1 ? '取消' : '设置') + '该主题精华吗？',
                    onOk: () => {
                        this.confirmSetPostEssence()
                    }
                })
            }
        },

        // 确认置顶Post
        confirmSetPostTop() {
            this.$axios.$post('/post/top/:id'.replace(':id', this.post.id)).then(rsp => {
                if (rsp.code === 0) {
                    this.$Message.success('操作成功')
                    this.post.is_top = 1 - this.post.is_top
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
            })
        },

        // 确定精华Post
        confirmSetPostEssence() {
            this.$axios.$post('/post/essence/:id'.replace(':id', this.post.id)).then(rsp => {
                if (rsp.code === 0) {
                    this.$Message.success('操作成功')
                    this.post.is_essence = 1 - this.post.is_essence
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
            })
        },

        // 确认删除Post
        confirmDeletePost() {
            this.$axios.$delete('/post/:id'.replace(':id', this.post.id)).then(rsp => {
                if (rsp.code === 0) {
                    this.$Message.success('删除成功')
                    setTimeout(() => {
                        history.go(-1)
                    }, 800)
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
            })
        },

        // 收藏
        doStar() {
            this.staring = true
            this.$axios.$post('/post/star', {
                post_id: this.post.id
            }).then(rsp => {
                if (rsp.code === 0) {
                    if (rsp.data === -1) {
                        this.post.hasStarred = false
                    }
                    if (rsp.data === 1) {
                        this.post.hasStarred = true
                    }
                    this.post.collection_count = parseInt(this.post.collection_count) + rsp.data
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                    this.loading = false
                }
                setTimeout(() => {
                    this.staring = false
                }, 500)
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
                this.staring = false
            })
        },

        // 点赞
        doUpvote(id) {
            this.upvoting = true
            this.$axios.$post('/post/upvote', {
                post_id: this.post.id
            }).then(rsp => {
                if (rsp.code === 0) {
                    if (rsp.data === -1) {
                        this.post.hasUpvoted = false
                    }
                    if (rsp.data === 1) {
                        this.post.hasUpvoted = true
                    }
                    this.post.upvote_count = parseInt(this.post.upvote_count) + rsp.data
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                    this.loading = false
                }
                setTimeout(() => {
                    this.upvoting = false
                }, 500)
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
                this.upvoting = false
            })
        },

        // 加载评论
        loadComments() {
            if (this.post.id > 0) {
                this.busy = true
                getCommentsData(this.$axios, this.post.id, this.commentsPage, this.commentsPageSize).then(rsp => {
                    rsp.comments.rows.forEach((comment, index) => {
                        comment.showReplyForm = comment.showReplyForm || false
                        comment.replyPlaceholder = comment.replyPlaceholder || '回复内容...'
                        comment.content = comment.content || ''
                        comment.atUserId = comment.atUserId || 0
                        comment.replySending = comment.replySending || false
                    })
                    if (rsp.comments.rows.length === 0) {
                        this.commentsNoMore = true
                    } else {
                        this.commentsNoMore = false
                    }

                    if (this.commentsPage === 1) {
                        this.comments = rsp.comments.rows
                    } else {
                        this.comments = this.comments.concat(rsp.comments.rows)
                    }
                    this.busy = false
                }).catch(error => {
                    console.log(error)
                    this.busy = false
                    this.commentsNoMore = true
                    this.$Message.error(error.toString() || '服务不可用')
                    this.loading = false
                })
            }
        },

        // 加载更多评论
        loadMoreComments() {
            if (!this.commentsNoMore && this.comments.length > 0 && !this.busy) {
                this.commentsPage++
                this.loadComments()
            }
        }
    }
}
</script>

<style lang="less" scoped>
.sidebar {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: #fff;
    background-clip: border-box;
    border: 1px solid #e7eaf3;
    border-radius: .25rem;
    box-shadow: 0 0.5rem 1.2rem rgba(189, 197, 209, .2);
}
.post-content-wrap {
    max-width: 670px;
    border: 1px solid #e7eaf3;
    border-radius: 0.25rem;
    box-shadow: 0 0.5rem 1.2rem rgba(189, 197, 209, 0.2);
}
.post {
    &-container {
        width: 100%;
        background: #fff;
        box-shadow: 0 0 1px #D3DCE7;
        border-radius: .25rem .25rem 0 0;
        .article-wrap {
            max-height: 400px;
            overflow: hidden;
            position: relative;
            .show-more-btn {
                cursor: pointer;
                left: 0;
                bottom: 0;
                width: 100%;
                height: 70px;
                font-size: 14px;
                color: #495060;
                text-align: center;
                z-index: 999;
                display: block;
                position: absolute;
                background: linear-gradient(rgba(255, 255, 255, .9), #fff); 
                display: flex;
                align-items: center;
                justify-content: center;
                span {
                    width: 140px;
                    height: 30px;
                    line-height: 30px;
                    border-radius: 15px;
                    border: 1px solid #495060;
                }
            }
        }
    }
    &-item {
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
            width: 100%;
            height: inherit;
            float: right;
            &-header {
                width: calc(100% - 50px);
                height: 40px;
                margin-left: 50px;
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
                .post-detail-icon {
                    float: right;
                    margin-left: 10px;
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
            &-video {
                line-height: 0;
                .video-player-box {
                    width: 100%;
                }
            }
            &-options {
                height: 36px;
                line-height: 36px;
                margin-top: 10px;
                display: flex;
                text-align: center;
                flex-direction: row;
                align-items: flex-end;
                justify-content: flex-start;
                .action {
                    display: flex;
                    width: 25%;
                    height: 22px;
                    justify-content: flex-start;
                    flex-direction: row;
                    position: relative;
                    .svg-icon {
                        font-size: 22px;
                        height: 22px;
                        display: inline-block;
                        &:hover {
                            cursor: pointer;
                        }
                    }
                    .num {
                        display: inline-block;
                        line-height: 22px;
                        height: 22px;
                        margin-left: 5px;
                    }
                    &.options {
                        display: flex;
                        justify-content: flex-end;
                        .post-options {
                            position: absolute;
                            top: 0;
                            right: 0;
                            color: #5C7390;
                            .option {
                                width: 22px;
                                height: 22px;
                                line-height: 22px;
                                text-align: center;
                                border-radius: 50%;
                                .ivu-icon {
                                    font-size: 22px;
                                }
                                &:hover {
                                    cursor: pointer;
                                    background: #D3DCE7;
                                }
                            }

                        }
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
    }
}
.upvoting {
    position: absolute;
    top: -7px;
    left: -7px;
}
.comment {
    &-container {
        width: 100%;
        min-height: 200px;
        background: #fff;
        box-shadow: 0 0 1px #D3DCE7;
        border-radius: 0 0 .25rem .25rem;
        .empty-post-wrap {
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
}
.mini-icon {
    font-size: 14px!important;
    height: 14px!important;
    margin-right: 10px;
}
.loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 52px;
}
.icon-fill {
    color: #2d8cf0!important;
}
.post-type {
    min-height: 580px;
    background: #fff;
    box-shadow: 0 1px 1px #D3DCE7;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    .view-type {
        color:#568CE2;
        padding: 0px 2px;
    }
    .post-desc {
        margin: 20px 0;
        &.desc {
            font-size: 18px;

        }
        .svg-icon {
            color: #ffffff;
            margin-right: 8px;
        }
    }
}
</style>

