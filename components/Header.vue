<template>
  <div class="header-container">
    <!-- site name -->
    <div class="site-name">
      <nuxt-link to="/">ROCBOSS</nuxt-link>
    </div>
    <!-- search area -->
    <div class="search-wrap">
      <Input ref="searchInput" class="search-input" 
        :class="{'expand': initedSearch}" 
        :icon="!initedSearch ? 'ios-search' : ''" 
        :placeholder="initedSearch ? '请输入关键词回车搜索' : ''" 
        v-model="searchContent"
        @on-click="doFocusInput()" 
        @on-blur="cancelFocusInput()"
        @on-enter="doSearch()"/>
    </div>
    <!-- profile area -->
    <div class="profile-wrap">
      <template v-if="+$store.state.userInfo.id === 0">
        <!-- 注册 -->
        <router-link to="/signup" class="signup-area">
          <Button shape="circle">注册</Button>
        </router-link>

        <!-- 登录 -->
        <router-link to="/signin" class="signin-area">
          <Button type="primary" shape="circle">登录</Button>
        </router-link>
      </template>

      <template v-if="+$store.state.userInfo.id > 0">
        <!-- 消息提醒 -->
        <div class="message-box" :class="{'active': $store.state.activeNav === 'message'}">
          <router-link to="/messages">
            <svg-icon icon-class="notice"></svg-icon>
            <div class="dot" v-if="unreadMsgCount > 0"></div>
          </router-link>
        </div>

        <!-- 用户相关 -->
        <div class="user-avatar-wrap">
          <img :src="$store.state.userInfo.avatar + $store.state.oss.avatar" class="avatar"
            :alt="$store.state.userInfo.username">
          <Dropdown class="userinfo" placement="bottom-end" trigger="click">
            <a href="javascript:void(0)">
              <span class="nickname">{{ $store.state.userInfo.username }}</span>
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem>
                <router-link class="link" :to="'/user/' + $store.state.userInfo.username">我的主页</router-link>
              </DropdownItem>
              <DropdownItem>
                <router-link class="link" to="/setting">设置中心</router-link>
              </DropdownItem>
              <DropdownItem v-if="$store.state.userInfo.role == 99">
                <router-link class="link" to="/admin">管理中心</router-link>
              </DropdownItem>
              <DropdownItem><a class="link" @click="logout()">退出登录</a></DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
  export default {
      computed: {
          checkUnreadMessageCount() {
              return this.$store.state.checkUnreadMessageCount
          },
          userInfo() {
              return this.$store.state.userInfo
          }
      },
      data() {
          return {
              initedSearch: false,
              searchContent: '',
              intervalInstance: null,
              unreadMsgCount: 0,
              intervalTime: 10000
          }
      },
      mounted() {
          if (this.userInfo.id > 0) {
              this.getUnreadMessageCount()
              if (this.intervalInstance === null) {
                  this.intervalInstance = setInterval(() => {
                      this.getUnreadMessageCount()
                  }, this.intervalTime)
              }
          }
      },
      methods: {
          logout() {
              this.$store.dispatch('logout')
          },
          getUnreadMessageCount() {
              this.$axios.$get('/message/unread/count').then(rsp => {
                  if (rsp.code === 0) {
                      this.unreadMsgCount = rsp.data.unread_count
                  } else {
                      this.$Message.error(rsp.msg || '服务不可用')
                  }
              }).catch(error => {
                  this.$Message.error(error.toString())
              })
          },
          doFocusInput() {
              this.initedSearch = true
              this.$refs.searchInput.focus()
          },
          cancelFocusInput() {
              this.initedSearch = false
          },
          doSearch() {
              this.$router.push({ path: '/?keyword=' + this.searchContent })
          }
      },
      watch: {
          userInfo: function(newVal, oldVal) {
              if (newVal.id > 0) {
                  if (this.intervalInstance === null) {
                      this.getUnreadMessageCount()
                      if (this.intervalInstance === null) {
                          this.intervalInstance = setInterval(() => {
                              this.getUnreadMessageCount()
                          }, this.intervalTime)
                      }
                  }
              } else {
                  if (this.intervalInstance !== null) {
                      clearInterval(this.intervalInstance)
                      this.intervalInstance = null
                  }
              }
          },
          checkUnreadMessageCount: function(newVal, oldVal) {
              this.getUnreadMessageCount()
          }
      }
  }

</script>

<style lang="less" scoped>
  .header-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;

    .site-name {
      font-size: 22px;
      color: #2d8cf0;
      font-weight: bold;
      flex: 1;
    }

    .search-wrap {
      flex: 1;
      text-align: center;

      .search-input {
        width: auto;
      }
    }

    .profile-wrap {
      flex: 1;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;

      .signup-area {
        margin-right: 10px;
      }

      .ivu-dropdown-rel {
        height: 32px;
        line-height: 32px;

        a {
          height: 32px;
          line-height: 32px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          color: #495060;

          .nickname {
            display: inline-block;
            max-width: 110px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 8px;
            font-weight: 500;
          }
        }
      }

      .ivu-dropdown-item {
        padding: 0;
      }

      .user-avatar-wrap {
        height: 64px;
        position: relative;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .avatar {
          width: 26px;
          height: 26px;
          display: inline-block;
          border-radius: 50%;
        }

        .userinfo {
          height: 32px;
          display: inline-block;
          margin-left: 10px;

          .link {
            width: 100%;
            height: 100%;
            display: block;
            padding: 7px;
            text-align: center;
            color: #495060;
          }
        }
      }

      .message-box,
      .fund-box {
        height: 100%;
        width: 40px;
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin: 0 1rem 0 0;

        &.active {
          a {
            color: #2d8cf0;
          }
        }

        a {
          color: #515a6e;

          &:hover {
            color: #2d8cf0;
          }
        }

        .dot {
          width: 8px;
          height: 8px;
          background: #ed4014;
          border-radius: 4px;
          position: absolute;
          top: 14px;
          right: 14px;
        }

        .svg-icon {
          height: 22px;
          width: 22px;
          line-height: 22px;
          display: block;
        }
      }
    }
  }

  @media screen and (max-device-width:991px) {
    .header-container {
      padding: 0 20px;
    }
    .search-wrap, .circle-btn {
      display: none;
    }
  }
</style>

<style lang="less">
  .search-input {
    .ivu-input {
      width: 32px;
      border-radius: 18px;
      padding: 0;
      transition: width .2s;
      color: transparent;
      &:focus {
        color: #666;
        width: 200px;
        padding: 4px 7px;
      }
    }
  }
</style>