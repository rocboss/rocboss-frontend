<template>
  <Row class="post-item-content-thumbs">
    <viewer :options="options" :images="imgs">
      <!-- 1P -->
      <template v-if="imgs.length === 1">
        <template v-for="img,index in imgs">
          <Col span="24">
          <img class="img-thumb" :src="img + $store.state.oss.thumbnail" :data-source="img" :key="img">
          </Col>
        </template>
      </template>
      <!-- 2P -->
      <template v-if="imgs.length === 2">
        <template v-for="img,index in imgs">
          <Col span="12">
          <img class="img-thumb" :src="img + $store.state.oss.thumbnail" :data-source="img" :key="img">
          </Col>
        </template>
      </template>
      <!-- 3P -->
      <template v-if="imgs.length === 3">
        <template v-for="img,index in imgs">
          <Col span="8">
          <img class="img-thumb" :src="img + $store.state.oss.thumbnail" :data-source="img" :key="img">
          </Col>
        </template>
      </template>
      <!-- 4P -->
      <template v-if="imgs.length === 4">
        <template v-for="img,index in imgs">
          <Col span="12">
          <img class="img-thumb" :src="img + $store.state.oss.thumbnail" :data-source="img" :key="img">
          </Col>
        </template>
      </template>
      <!-- 5P -->
      <template v-if="imgs.length === 5">
        <template v-for="img,index in imgs">
          <Col :span="index > 1 ? 8 : 12">
          <img class="img-thumb" :src="img + $store.state.oss.thumbnail" :data-source="img" :key="img">
          </Col>
        </template>
      </template>
      <!-- 6P -->
      <template v-if="imgs.length === 6">
        <template v-for="img,index in imgs">
          <Col span="8">
          <img class="img-thumb" :src="img + $store.state.oss.thumbnail" :data-source="img" :key="img">
          </Col>
        </template>
      </template>
      <!-- 7P -->
      <template v-if="imgs.length === 7">
        <template v-for="img,index in imgs">
          <Col :span="index > 2 ? 6 : 8">
          <img class="img-thumb" :src="img + $store.state.oss.thumbnail" :data-source="img" :key="img">
          </Col>
        </template>
      </template>
      <!-- 8P -->
      <template v-if="imgs.length === 8">
        <template v-for="img,index in imgs">
          <Col span="6">
          <img class="img-thumb" :src="img + $store.state.oss.thumbnail" :data-source="img" :key="img">
          </Col>
        </template>
      </template>
      <!-- 9P -->
      <template v-if="imgs.length === 9">
        <template v-for="img,index in imgs">
          <Col span="8">
          <img class="img-thumb" :src="img + $store.state.oss.thumbnail" :data-source="img" :key="img">
          </Col>
        </template>
      </template>
    </viewer>
  </Row>
</template>

<script>
import Vue from 'vue'
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'

Vue.use(Viewer)
export default {
    props: {
        imgs: Array
    },
    data() {
        return {
            options: {
                title: false,
                navbar: true,
                toolbar: true,
                url: 'data-source'
            }
        }
    },
    methods: {
        showImage(aliasId, index) {

        }
    }
}
</script>


<style lang="less" scoped>
.post-item-content-thumbs {
    line-height: 0;
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
</style>
