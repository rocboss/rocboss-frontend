<template>
  <Content class="user-container" v-if="user.id">
    <Row>
      <!-- 用户内容 -->
      <Col :xs="24" :sm="24" :md="24" :lg="17">
        <div class="user-feed-wrap">
          <!-- 筛选 -->
          <Menu class="selections" mode="horizontal" :active-name="activeType" @on-select="changeActiveType">
            <MenuItem name="1">冒泡</MenuItem>
            <MenuItem name="2">文章</MenuItem>
          </Menu>

          <!-- 主题列表 -->
          <PostItem v-for="(post, index) in list" :key="index" :post="post" />

          <!-- 空数据·占位图 -->
          <div v-if="list.length === 0" class="empty-post-wrap">
            <img :src="require('@/assets/image/empty.png')" class="empty-image">
            <div class="empty-tips">
              暂无数据哦~
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrap" v-if="total > 0">
            <Page :total="total" :page-size="page_size" :current="page" @on-change="pageTurn"></Page>
          </div>
        </div>
      </Col>

      <!-- 用户基本信息 -->
      <Col :xs="24" :sm="24" :md="24" :lg="7">
        <div class="left-bar">
          <div class="user-bg"></div>
          <div class="user-info">
            <div class="user-avatar">
              <img class="avatar-img" :src="user.avatar + $store.state.oss.avatar" alt="">
            </div>
            <div class="user-name">
              <span class="username">{{ user.username }}</span>
            </div>
          </div>
          <div class="user-signature">
            <span>{{ user.signature.length > 0 ? user.signature : 'Ta很懒，什么签名也没有哦' }}</span>
          </div>
        </div>
        <!-- 统计 -->
        <div class="right-bar user-statistic-container">
          <div class="statistics">
            <div class="statistic">
              <div class="num-board">关注了</div>
              <div class="num">{{ user.attention_user_count }}</div>
            </div>
            <div class="statistic">
              <div class="num-board">关注者</div>
              <div class="num">{{ user.fans_user_count }}</div>
            </div>
          </div>
        </div>

        <!-- 关注/私信 -->
        <div class="right-bar user-options" v-if="user.id !== $store.state.userInfo.id ">
          <Button class="option left" type="primary" @click="attend">
            <svg-icon :size="14" icon-class="follow"></svg-icon>
            <span v-if="user.is_attentioned === 0">关注TA</span>
            <span v-else>取消关注</span>
          </Button>
          <Button class="option right" @click="whisperModal.show = true">
            <svg-icon :size="14" icon-class="chat"></svg-icon>发私信
          </Button>
        </div>
      </Col>
    </Row>

    <!-- 私信弹窗 -->
    <Modal class="whisperModal" title="私信" width="360" v-model="whisperModal.show">
      <div class="content">
        <div class="user-info">
          <div>
            <img :src="user.avatar">
          </div>
          <div>
            {{user.username}}
          </div>
        </div>
        <div>
          <Input v-model="whisperModal.content" type="textarea" :rows="4" placeholder="请输入私信内容" />
        </div>
      </div>
      <div slot="footer">
        <Button type="primary" size="large" long @click="sendWhisper(user.id)">发送</Button>
      </div>
    </Modal>
  </Content>
</template>

<script>
  import PostItem from '~/components/PostItem.vue'
  export default {
      head() {
          return {
              title: '主页'
          }
      },
      components: {
          PostItem
      },
      data() {
          return {
              list: [],
              total: 0,
              page: 1,
              page_size: 20,
              loading: false,
              activeType: '1',

              username: '',
              user: {},

              groups: [],
              groupPage: 1,
              groupPageSize: 5,
              groupTotal: 0,

              whisperModal: {
                  show: false,
                  content: ''
              }
          }
      },
      methods: {
          // 切换Tab
          changeActiveType(name) {
              this.activeType = name

              // 重新加载POST数据
              this.page = 1
              this.loadData()

              // 重新生成路由
              this.reGenerateRouter()
          },
          // 翻页
          pageTurn(page) {
              this.page = page
              // 重新加载POST数据
              this.loadData()

              // 重新生成路由
              this.reGenerateRouter()
          },
          // 加载用户信息
          loadUserInfo(success) {
              this.$axios.$get('/user/profile/:username'.replace(':username', this.username)).then(rsp => {
                  if (rsp.code === 0) {
                      // 赋值当前用户
                      this.user = rsp.data
                      success()
                  } else {
                      this.$Message.error(rsp.msg || '服务不可用')
                  }
              }).catch(error => {
                  this.$Message.error(error.toString() || '服务不可用')
              })
          },
          // 加载数据
          loadData() {
              if (this.loading) {
                  return false
              }
              this.loading = true
              this.$axios.$get('/posts', {
                  params: {
                      user_id: this.user.id,
                      type: this.activeType,
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
          },
          // 重新生成路由
          reGenerateRouter() {
              this.$router.push({
                  path: '/user/' + this.username + '?page=' + this.page + '&type=' + this.activeType
              })
          },
          // 关注用户、取消关注
          attend() {
              this.$axios.$post('/user/attend', {
                  'attentioned_user_id': this.user.id
              }).then(rsp => {
                  if (rsp.code === 0) {
                      this.user.is_attentioned = rsp.data < 0 ? 0 : 1
                      if (this.user.is_attentioned == 0) {
                          this.user.fans_user_count--
                      } else {
                          this.user.fans_user_count++
                      }
                  } else {
                      this.$Message.error(rsp.msg || '服务不可用')
                  }
                  this.loading = false
              }).catch(error => {
                  this.$Message.error(error.toString() || '服务不可用')
              })
          },
          // 发私信
          sendWhisper(userId) {
              this.$axios.$post('/user/whisper', {
                  'receive_user_id': userId,
                  'content': this.whisperModal.content
              }).then(res => {
                  if (res.code === 0) {
                      this.$Message.success('发送成功')
                  } else {
                      this.$Message.error(res.msg || '服务不可用')
                  }
                  // 清空
                  this.whisperModal.content = ''
                  this.whisperModal.show = false
              }).catch(error => {
                  this.$Message.error(error.toString() || '服务不可用')
                  this.whisperModal.show = false
              })
          }

      },
      watch: {
          '$route'(to, from) {
              if (to.name === 'user-username') {
                  // 获取当前用户名
                  this.username = this.$route.params.username || ''
                  this.activeType = this.$route.query.type || '1'
                  this.loadUserInfo(() => {
                      // 加载首页POST数据
                      this.page = parseInt(this.$route.query.page) || 1
                      this.loadData()
                  })
              }
          }
      },
      mounted() {
          this.$store.commit('changeActiveNav', 'user')

          // 获取当前用户名
          this.username = this.$route.params.username || ''
          this.activeType = this.$route.query.type || '1'
          this.loadUserInfo(() => {
              // 加载首页POST数据
              this.page = parseInt(this.$route.query.page) || 1
              this.loadData()
          })
      }
  }
</script>

<style lang="less" scoped>
  .user-container {
    min-height: 200px;

    .user-feed-wrap {
      width: 100%;
      max-width: 670px;
      background: #fff;
      border: 1px solid #e7eaf3;
      border-radius: 0.25rem;
      box-shadow: 0 0.5rem 1.2rem rgba(189, 197, 209, 0.2);

      .empty-post-wrap {
        height: 300px;
        width: 100%;
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
      height: 40px;
      color: #5C7390;
      position: relative;
      margin-left: 10px;
      overflow: hidden;

      span {
        line-height: 40px;
        display: block;
        width: 100%;
        text-align: left;
        font-size: 14px;
        font-weight: bold;
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

    .user-signature {
      margin-top: 10px;
      line-height: 22px;
      font-size: 14px;
      text-align: justify;
      letter-spacing: 2px;
      color: #465F70;
    }

    .user-createtime {
      font-size: 12px;
      color: #A8B7C7;
      line-height: 40px;
      height: 40px;

      .user-type-label {
        padding: 0 5px;
        height: 20px;
        line-height: 20px;
        background: #eee;
        font-size: 12px;
        border-radius: 3px;
        display: inline-block;
      }
    }

    .user-groups {
      padding: 40px 0 30px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-start;
      position: relative;

      .load-more {
        position: absolute;
        bottom: 0;
        left: 0;
        color: #2d8cf0;
        cursor: pointer;

        .svg-icon {
          color: #2d8cf0;
        }
      }

      .info-label {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        font-weight: bold;
        color: #5C7390;
      }

      .user-group-wrap {
        width: 100%;
      }
    }

  }

  .selections {
    border-bottom: 1px solid #efefef;
    box-sizing: content-box;
    z-index: 0;
    width: 100%;
    border-radius: 0.25rem;
  }

  .statistics {
    width: 100%;
    height: 80px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    border-radius: 5px;

    .statistic {
      width: 50%;
      height: inherit;
      text-align: center;

      .num-board,
      .num {
        height: 40px;
      }

      .num-board {
        font-size: 14px;
        color: #8590a6;
        line-height: 50px;
      }

      .num {
        display: inline-block;
        font-size: 18px;
        color: #465F70;
        font-weight: 600;
        line-height: 30px;
      }

      &:last-child {
        border-left: 1px solid #eee;
      }
    }

  }

  .user-options {
    width: 100%;
    padding: 32px 1rem;

    .option {
      width: 48%;

      .svg-icon {
        margin-right: 10px;
      }
    }
  }

  .pagination-wrap {
    padding: 20px;
  }

  .sidebar-wrap {
    background: #fff;
    position: relative;
  }

  .whisperModal {
    .ivu-modal-header-inner {
      text-align: center;
    }

    .content {

      .user-info {
        display: flex;
        /* justify-items: center; */
        align-items: center;
        margin-bottom: 10px;

        img {
          width: 20px;
          height: 20px;
          margin-right: 10px;
        }
      }
    }
  }

  .ivu-menu-horizontal.ivu-menu-light:after {
    display: none;
  }
</style>
