<template>
  <section class="container">
    <Row>

      <!-- 内容区 -->
      <Col :xs="24" :sm="24" :md="24" :lg="17">
        <!-- 主题容器 -->
        <div class="posts-container">
          <Affix>
            <div class="posts-addons">
              <!-- 过滤器 -->
              <div class="posts-filter" v-if="keyword.length == 0">
                <div class="posts-filter-wrap">
                  <div class="filter-item" :class="{ 'active': postsFilterType === 'latest_post' }" @click="changeFilter('latest_post')">最新发表</div>
                  <div class="filter-item" :class="{ 'active': postsFilterType === 'latest_comment' }" @click="changeFilter('latest_comment')">最后回复</div>
                  <div class="filter-item" :class="{ 'active': postsFilterType === 'hot_comment' }" @click="changeFilter('hot_comment')">最热评论</div>
                  <div class="filter-item" :class="{ 'active': postsFilterType === 'essence_post' }" @click="changeFilter('essence_post')">精华内容</div>
                </div>
              </div>
              <div class="posts-filter" v-if="keyword.length > 0">
                <div class="search-res">以下是 <span class="highlight">{{ keyword }}</span> 的相关搜索结果</div>
              </div>
              <!-- 发布器入口 -->
              <div class="posts-compose-entrance">
                <Button type="primary" @click="$router.push({ name: 'compose' })"><svg-icon icon-class="edit" :size="14"></svg-icon> 发布</Button>
              </div>
            </div>
          </Affix>

          <!-- 主题列表 -->
          <PostItem v-for="(post, index) in postsRows" :key="index" :post="post"/>

          <!-- 空数据·占位图 -->
          <div v-if="postsRows.length === 0" class="empty-post-wrap">
            <img :src="require('@/assets/image/empty.png')" class="empty-image">
            <div class="empty-tips">
              暂无数据哦~
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrap" v-if="postsTotal > 0">
            <Page :total="postsTotal" :page-size="postsPageSize" :current="postsPage" @on-change="pagePostsTurn"></Page>
          </div>
        </div>
      </Col>

      <!-- 侧边栏 -->
      <Col :xs="24" :sm="24" :md="24" :lg="7">
        <div class="sidebar">
          <!-- 群组/分类 -->
          <div class="groups">
            <div class="group-item active">
              <svg-icon icon-class="left-arrow" class="group-item-arrow" :size="12"></svg-icon> 全部主题
            </div>

            <!-- 组群列表 -->
            <GroupItem v-for="(group, index) in groupsRows" :group="group" :key="index"></GroupItem>
          </div>
        </div>
        <!-- 友情链接 -->
        <links />
        <!-- 广告 -->
        <ad />
      </Col>

    </Row>
  </section>
</template>

<script>
import PostItem from '~/components/PostItem.vue'
import GroupItem from '~/components/GroupItem.vue'
import Links from '~/components/Links.vue'
import Ad from '~/components/Ad.vue'

// 加载主题列表数据
const getPosts = async(axios, filter_type, page, page_size, keyword) => {
    let posts = await axios.$get('/posts', {
        params: {
            page,
            page_size,
            filter_type,
            keyword
        }
    })

    return {
        postsPage: page,
        postsPageSize: page_size,
        postsFilterType: filter_type,
        postsRows: posts.data.rows,
        postsTotal: posts.data.total
    }
}

// 加载Group数据
const getGroups = async(axios, page, page_size) => {
    let groups = await axios.$get('/groups', {
        params: {
            page,
            page_size
        }
    })

    return {
        groupsPage: page,
        groupsPageSize: page_size,
        groupsRows: groups.data.rows,
        groupsTotal: groups.data.total
    }
}

export default {
    async asyncData({ params, $axios, query, app, redirect }) {
        try {
            // 加载首页POST数据
            let keyword = query.keyword || ''
            let page = parseInt(query.page) || 1
            let pageSize = 20
            let filterType = app.$cookies.get('ROCBOSS_POSTS_FILTER_TYPE') || 'latest_post'

            let [posts, groups] = await Promise.all([
                getPosts($axios, filterType, page, pageSize, keyword),
                // 获取Group列表（固定数量）
                getGroups($axios, 0, 20)
            ])
            return Object.assign(posts, groups)
        } catch (error) {
            redirect({ path: '/signin' })
        }
    },
    components: {
        PostItem,
        GroupItem,
        Links,
        Ad
    },
    head() {
        return {
            title: '全部'
        }
    },
    data() {
        return {
            keyword: '',
            loading: false,

            postsPage: 0,
            postsPageSize: 0,
            postsFilterType: ''
        }
    },
    methods: {
        // 处理分页
        pagePostsTurn(page) {
            let query = {
                page
            }
            if (this.$route.query.keyword) {
                query.keyword = this.$route.query.keyword
            }
            this.$router.push({ path: '/', query })
            this.postsPage = page
            this.loadData()
        },
        // 加载数据
        loadData() {
            this.loading = true
            this.scrollToTop(150)
            // 获取 Posts 数据
            getPosts(this.$axios, this.postsFilterType, this.postsPage, this.postsPageSize, this.keyword).then(posts => {
                this.postsRows = posts.postsRows
                this.postsTotal = posts.postsTotal

                this.loading = false
            })
        },
        // 滚动到顶部
        scrollToTop(scrollDuration) {
            var cosParameter = window.scrollY / 2
            var scrollCount = 0
            var oldTimestamp = performance.now()
            function step(newTimestamp) {
                scrollCount += Math.PI / (scrollDuration / (newTimestamp - oldTimestamp))
                if (scrollCount >= Math.PI) window.scrollTo(0, 0)
                if (window.scrollY === 0) return
                window.scrollTo(0, Math.round(cosParameter + cosParameter * Math.cos(scrollCount)))
                oldTimestamp = newTimestamp
                window.requestAnimationFrame(step)
            }
            window.requestAnimationFrame(step)
        },
        // 改变过滤类型
        changeFilter(type) {
            this.$cookies.set('ROCBOSS_POSTS_FILTER_TYPE', type)
            this.postsFilterType = type
            this.pagePostsTurn(1)
        }
    },
    watch: {
        '$route'(to, from) {
            if (to.path === from.path) {
                this.postsPage = parseInt(this.$route.query.page) || 1
                this.keyword = this.$route.query.keyword || ''
                this.loadData()
            }
        }
    },
    mounted() {
        this.$store.commit('changeActiveNav', 'index')
        this.keyword = this.$route.query.keyword || ''
        this.postsFilterType = this.$cookies.get('ROCBOSS_POSTS_FILTER_TYPE') || 'latest_post'
    }
}
</script>

<style lang="less" scoped>
.container {
  margin: 0 auto;

  .posts-container, .sidebar {
    width: 100%;
    max-width: 670px;
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

  .sidebar {
    min-height: 200px;
  }

  .posts-addons {
    height: 72px;
    border-bottom: 1px solid #efefef;
    display: inline-block;
    width: 100%;
    padding: 20px;
    background: #FFF;
    z-index: 110;
    .posts-filter {
      height: 32px;
      width: calc(100% - 100px);
      float: left;
      .search-res {
        height: 32px;
        line-height: 32px;
        font-size: 16px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        .highlight {
          color: #ed4014;
        }
      }
      .posts-filter-wrap {
        height: 32px;
        line-height: 32px;
        display: inline-block;
        // background: #F7F9FB;
        border-radius: 16px;
        overflow: hidden;
        .filter-item {
          width: 80px;
          text-align: center;
          display: inline-block;
          border-radius: 20px;
          cursor: pointer;
          &.active {
            background: #939faa;
            color: #fff;
            font-weight: bold;
          }
        }
      }
    }
    .posts-compose-entrance {
      float: left;
      height: 32px;
      width: 100px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      .svg-icon {
        font-size: 18px;
      }
    }
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

  .pagination-wrap {
    padding: 20px;
  }

  .group-item {
    width: 100%;
    height: 46px;
    line-height: 46px;
    text-align: left;
    padding-left: 20%;
    position: relative;
    cursor: pointer;
    border-bottom: 1px solid #efefef;
    font-size: 14px;
    a {
      display: block;
      width: 100%;
      height: 100%;
      color: #657786;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    &.active {
      color: #2d8cf0;
      font-weight: bold;
      .group-item-arrow {
        color: #2d8cf0;
      }
    }
    &:hover {
      opacity: .8;
    }
    .group-item-arrow {
      position: absolute;
      top: 17px;
      left: 20px;
      font-size: 12px;
      color: #657786;
      opacity: .6;
    }
  }
}
</style>
