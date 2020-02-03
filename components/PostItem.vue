<template>
  <div class="post-item">

    <!-- 用户 -->
    <div class="post-item-userinfo">
      <router-link :to="'/user/'+post.user.username">
        <div class="post-item-userinfo-avatar">
          <div class="post-item-commments" :class="{'empty-count': post.comment_count == 0}">
            {{ post.comment_count }}
          </div>
          <img class="post-item-userinfo-avatar-img" :src="post.user.avatar + $store.state.oss.avatar" alt="">
        </div>
      </router-link>
    </div>

    <!-- 内容 -->
    <div class="post-item-content">
      <!-- 用户 -->
      <div class="post-item-content-header">
        <router-link :to="'/post/' + post.alias_id">
          <span class="nickname">{{ post.user.username }}</span>
        </router-link>
        <span class="time">{{ post.created_at }}</span>
        <!-- 置顶 -->
        <Tooltip content="置顶" placement="top" v-if="post.is_top > 0">
          <svg-icon icon-class="pin" class="post-item-icon"></svg-icon>
        </Tooltip>
        <!-- 精华 -->
        <Tooltip content="精华" placement="top" v-if="post.is_essence > 0">
          <svg-icon icon-class="essence" class="post-item-icon"></svg-icon>
        </Tooltip>
        <!-- 存在图片 -->
        <svg-icon icon-class="image" class="post-item-icon" v-if="post.image_count > 0"></svg-icon>
        <!-- 存在视频 -->
        <svg-icon icon-class="video" class="post-item-icon" v-if="post.video_count > 0"></svg-icon>
        <!-- 存在附件 -->
        <svg-icon icon-class="attachment" class="post-item-icon" v-if="post.attachment_count > 0"></svg-icon>
      </div>

      <!-- 冒泡模式 -->
      <template v-if="post.type === '1'" v-for="content in post.contents">
        <!-- 内容 -->
        <div class="post-item-content-text" v-if="content.type === '2'">
          <router-link :to="'/post/' + post.alias_id">
            <p>{{ content.content }}</p>
          </router-link>
        </div>
      </template>

      <!-- 文章模式 -->
      <template v-if="post.type === '2'" v-for="content in post.contents">
        <!-- 标题 -->
        <div class="post-item-content-text" v-if="content.type === '1'">
          <router-link :to="'/post/' + post.alias_id">
            <p><svg-icon icon-class="article" :size="16"></svg-icon> {{ content.content }}</p>
          </router-link>
        </div>
      </template>
    </div>

    <!-- 点赞 -->
    <div class="post-item-praise" @click="($router.push({ path: '/post/' + post.alias_id }))">
      <div class="praise-wrap">
        <div class="praise-top">
          <svg-icon icon-class="praise" />
        </div>
        <!-- 点赞数 -->
        <div class="praise-bottom">
          {{ post.upvote_count }}
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
    props: {
        post: Object
    },
    data() {
        return {

        }
    }
}
</script>

<style lang="less" scoped>
.post-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  min-height: 100px;
  border-bottom: 1px solid #efefef;
  &:hover {
      background: #F7F9FB;
      cursor: pointer;
  }
  .post-item-userinfo {
    width: 90px;
    height: inherit;
    float: left;
    position: relative;
    .post-item-userinfo-avatar {
      margin: 25px 20px;
      width: 50px;
      height: 50px;
      border-radius: 25px;
      z-index: 100;
      position: relative;
      .post-item-userinfo-avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        display: block;
      }
      .post-item-commments {
        position: absolute;
        height: 28px;
        min-width: 28px;
        border: 3px solid #fff;
        border-radius: 50%;
        background: #2d8cf0;
        font-size: 10px;
        line-height: 22px;
        color: #fff;
        text-align: center;
        top: -8px;
        right: -8px;
        transform: scale(.9);
        &.empty-count {
          background: #8ca0b5;
        }
      }
    }
  }
  .post-item-content {
    width: calc(100% - 170px);
    height: inherit;
    padding: 25px 20px 25px 0;
    a {
      color: #495060;
    }
    .post-item-content-header {
      height: 20px;
      line-height: 20px;
      word-break: break-all;
      .nickname {
        color: #14171a;
        font-size: 14px;
        font-weight: bold;
      }
      .time {
        margin-left: 10px;
        font-size: 12px;
        color: #657786;
      }
      .post-item-icon {
        color: #657786;
        fill: #657786;
        margin-left: 6px;
      }
    }
    .post-item-content-text {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 24px;
      margin: 4px 0;
      text-align: justify;
      text-justify: inter-ideograph;/*IE*/
    }
  }
  .post-item-praise {
    width: 80px;
    height: 100px;
    .praise-wrap {
      width: 50px;
      height: 50px;
      display: block;
      background: #F7F9FB;
      margin: 25px 20px 25px 10px;
      border-radius: 3px;
      text-align: center;
      .praise-top {
        height: 25px;
        padding-top: 9px;
        .svg-icon {
          font-size: 16px;
          color: #77838F;
        }
      }
      .praise-bottom {
        font-size: 12px;
        line-height: 25px;
        color: #77838F;
      }
    }
  }
}


@media screen and (max-device-width:991px) {
  .post-item-userinfo {
    width: 60px!important;
    height: inherit;
    float: left;
    position: relative;
    .post-item-userinfo-avatar {
      margin: 10px 12px!important;
      width: 36px!important;
      height: 36px!important;
      border-radius: 18px!important;
      z-index: 100;
      position: relative;
      .post-item-commments {
        transform: scale(.7)!important;
      }
    }
  }
  .post-item-content { 
    width: calc(100% - 40px)!important;
    padding: 10px 20px 10px 0!important;
  }
  .post-item-praise {
    display: none;
  }
}
</style>
