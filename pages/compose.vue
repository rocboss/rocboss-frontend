<template>
  <Content>
    <Row type="flex" justify="center">
      <!-- 内容区 -->
      <Col :xs="24" :sm="24" :md="24" :lg="16">
      <div class="compose-wrap">
        <div class="area">
          <!-- POST 类型 -->
          <div class="type">
            <RadioGroup v-model="type" type="button">
              <Radio label="1">冒泡</Radio>
              <Radio label="2">文章</Radio>
            </RadioGroup>
          </div>

          <!-- 基本属性设置 -->
          <div class="baseinfo-setting">
            <!-- 默认官方Group -->
            <Select class="group-selection" size="small" v-model="selectedGroupId">
              <Option v-for="group in groups" :value="group.id" :key="group.id">{{ group.name }}</Option>
            </Select>
            <!-- 提交 -->
            <div class="compose-btn">
              <Button type="primary" @click.native="submit" :loading="loading" class="submit" long>提交</Button>
            </div>
          </div>

          <!-- 冒泡 -->
          <div class="bubble" v-show="type === '1'">
            <div class="input text-input">
              <Input v-model="content" type="textarea" :autosize="{minRows: 12,maxRows: 15}" :maxlength="200"
                placeholder="请输入文字描述..." />
              <div class="tips"><span class="tip">{{ 200 - content.length }}</span></div>
            </div>
            <!-- 媒体资源上传区域 -->
            <div class="input">
              <!-- 图片缩略图 -->
              <div class="img-upload-list" v-for="item in bubbleImgList">
                <template v-if="item.status === 'finished'">
                  <img :src="item.url + $store.state.oss.p100x100">
                  <div class="img-upload-list-cover">
                    <Icon type="ios-eye-outline" @click.native="handleView(item.url)"></Icon>
                    <Icon type="ios-trash-outline" @click.native="handleRemove(item)"></Icon>
                  </div>
                </template>

                <template v-else>
                  <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
                </template>
              </div>
              <!-- 图片预览 -->
              <Modal title="图片预览" v-model="visible" footer-hide>
                <img :src="previewImgUrl" v-if="visible" style="width: 100%">
              </Modal>

              <!-- 视频预览 -->
              <div class="video-preview" v-if="bubbleVideoList.length > 0">
                <!-- 视频组件 -->
                <Video :url="bubbleVideoList[0].video_url"></Video>
                <div class="delete-preview">
                  <Button type="dashed" @click.native="deleteBubblePreviewVideo">重新上传</Button>
                </div>
              </div>
              <!-- 视频上传进度条 -->
              <Progress v-if="bubbleVideoUploadStart" :percent="bubbleVideoUploadPercent" hide-info />

              <!-- 图片上传 -->
              <Upload v-show="bubbleImgList.length < 9 && bubbleVideoList.length === 0 && !bubbleVideoUploadStart"
                ref="bubbleImgUpload" :action="imgUploadGateway" :show-upload-list="false"
                :on-success="handleBubbleSuccess" :format="['jpg', 'jpeg', 'png', 'gif']" :max-size="5120"
                :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize"
                :before-upload="handleBeforeUpload" :headers="headers" accept="image/*" multiple type="drag">
                <div class="icon-btn">
                  <svg-icon :size="24" icon-class="camera"></svg-icon>
                </div>
              </Upload>

              <!-- （冒泡）视频上传 -->
              <video-uploader
                v-show="bubbleVideoList.length === 0 && bubbleImgList.length === 0 && !bubbleVideoUploadStart"
                @uploadState="changeBubbleUploadState" @uploadPercent="changeBubbleUploadPercent"
                @uploadSuccess="bubbleUploadSuccess" :options="options">
                <template slot="uploader">
                  <div class="ivu-upload ivu-upload-drag">
                    <uploader-unsupport></uploader-unsupport>
                    <uploader-btn class="icon-btn" :single="true" :attrs="attrs">
                      <svg-icon :size="24" icon-class="video"></svg-icon>
                    </uploader-btn>
                  </div>
                </template>
              </video-uploader>
            </div>
          </div>
          <!-- 文章 -->
          <div class="article" v-show="type === '2'">
            <!-- 文章内容数据块 -->
            <div v-for="content,index in contents" :key="index">
              <!-- 文章 -->
              <div class="item text-input" v-if="content.type === '1'">
                <div class="text">
                  <Input v-model="content.content" placeholder="请输入文章标题" />
                </div>
              </div>
              <!-- 文章 -->
              <div class="item text-input" v-if="content.type === '2'">
                <div class="text">
                  <Input v-model="content.content" type="textarea" :autosize="{minRows: 5,maxRows: 10}"
                    placeholder="请输入文字描述..." />
                </div>
                <div class='subtract-btn subtract-text' @click="removeElement(index)">
                  <svg-icon :size="22" icon-class="subtract"></svg-icon>
                </div>
              </div>
              <!-- 图片 -->
              <div class="item img-input" v-if="content.type === '3'">
                <img class="img-preview" :src="content.content.url" />
                <div class='subtract-btn subtract-img' @click="removeElement(index)">
                  <svg-icon :size="22" icon-class="subtract"></svg-icon>
                </div>
              </div>
              <!-- 视频 -->
              <div class="item video-input" v-if="content.type === '4'">
                <!-- 视频预览 -->
                <div class="video-preview">
                  <!-- 视频组件 -->
                  <Video :url="content.content.video_url"></Video>
                </div>
                <div class='subtract-btn subtract-video' @click="removeElement(index)">
                  <svg-icon :size="22" icon-class="subtract"></svg-icon>
                </div>
              </div>
            </div>
            <div class="video-progress-line-wrap">
              <!-- 视频上传进度条 -->
              <Progress v-if="articleVideoUploadStart" :percent="articleVideoUploadPercent" hide-info />
            </div>
            <!-- 新增数据块 -->
            <div class="type-warpper">
              <div class="type-content">
                <div class="type-btn" @click="addElement('2', '')">
                  <div class="text-btn">
                    <svg-icon :size="24" icon-class="text"></svg-icon>
                  </div>
                  <div>段落</div>
                </div>
                <div class="type-btn img-btn">
                  <!-- （文章）图片上传 -->
                  <Upload :before-upload="handleArticeImgUpload" :action="imgUploadGateway"
                    :on-success="handleArticelImgSuccess" :format="['jpg', 'jpeg', 'png', 'gif']" :max-size="5120"
                    :show-upload-list="false" :on-format-error="handleFormatError" :on-exceeded-size="handleMaxSize"
                    :headers="headers">
                    <div class="text-btn">
                      <svg-icon :size="24" icon-class="camera"></svg-icon>
                    </div>
                    <div>图片</div>
                  </Upload>
                </div>
                <div class="type-btn video-btn">
                  <!-- （文章）视频上传 -->
                  <video-uploader @uploadState="changeArticleUploadState" @uploadPercent="changeArticleUploadPercent"
                    @uploadSuccess="articleUploadSuccess" :options="options">
                    <template slot="uploader">
                      <uploader-unsupport></uploader-unsupport>
                      <uploader-btn class="text-btn" :single="true" :attrs="attrs">
                        <svg-icon :size="24" icon-class="video"></svg-icon>
                      </uploader-btn>
                    </template>
                  </video-uploader>
                  <div>视频</div>
                </div>
              </div>
              <div class="add-type">
                <svg-icon :size="22" icon-class="add"></svg-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
      </Col>
    </Row>
  </Content>
</template>

<script>
  import Vue from 'vue'
  import Video from '~/components/Post/Video'
  import VideoUploader from '~/components/Post/VideoUploader'

  export default {
      components: {
          Video,
          VideoUploader
      },
      head() {
          return {
              title: '发布冒泡/文章'
          }
      },
      mounted() {
          this.$store.commit('changeActiveNav', 'compose')

          if (this.$store.state.userInfo.id === 0) {
              this.$router.push({
                  path: '/signin'
              })
          }
          // 请求当前用户下 Group列表
          this.$axios.$get('/groups', {
              params: {
                  page: 1,
                  page_size: 20 // 固定数量
              }
          }).then(rsp => {
              if (rsp.code === 0) {
                  this.groups = rsp.data.rows
                  this.groupTotal = rsp.data.total

                  // 选中当前 Group。默认Group选择（需要和数据库保持一致）
                  this.selectedGroupId = this.$route.query.group_id || '8001'
              } else {
                  this.$Message.error(rsp.msg || '服务不可用')
              }
          }).catch(error => {
              this.$Message.error(error.toString() || '服务不可用')
          })

          this.bubbleImgList = this.$refs.bubbleImgUpload.fileList
      },
      data() {
          return {
              // Group选择（需要和数据库保持一致）
              selectedGroupId: '8001',

              groups: [],
              groupTotal: 0,

              // 冒泡下视频预览
              bubbleVideoUploadPercent: 0,
              articleVideoUploadPercent: 0,

              // 冒泡/文章下视频上传是否开始
              bubbleVideoUploadStart: false,
              articleVideoUploadStart: false,

              // 视频分片上传相关配置
              options: {
                  target: process.env.NUXT_ENV_API_GATEWAY + '/upload/video',
                  headers: {
                      'X-Authorization': this.$cookies.get('ROCBOSS-TOKEN')
                  },
                  simultaneousUploads: 1,
                  testChunks: true
              },
              attrs: {
                  accept: 'video/mp4'
              },

              loading: false,

              type: '1',
              // 冒泡文字内容
              content: '',
              bubbleImgList: [],
              bubbleVideoList: [],
              bubbleContents: [],

              // 图片上传网关
              imgUploadGateway: process.env.NUXT_ENV_API_GATEWAY + '/upload/img',
              headers: {
                  'X-Authorization': this.$cookies.get('ROCBOSS-TOKEN')
              },

              // 预览图片信息
              previewImgUrl: '',
              visible: false,
              article: {
                  type: '2',
                  content: '',
                  bubbleImgList: [],
                  video: ''
              },

              // 文章视频列表
              articleVideoList: [],

              // 文章内容集合
              contents: [{
                  type: '1',
                  content: ''
              },
              {
                  type: '2',
                  content: ''
              }
              ]
          }
      },
      methods: {
      // 修改冒泡视频上传状态
          changeBubbleUploadState(state) {
              this.bubbleVideoUploadStart = state
          },
          // 修改冒泡视频上传进度
          changeBubbleUploadPercent(percent) {
              this.bubbleVideoUploadPercent = percent
          },
          // 冒泡视频上传成功
          bubbleUploadSuccess(data) {
              this.bubbleVideoList.push(data)
          },
          // 修改文章视频上传状态
          changeArticleUploadState(state) {
              this.articleVideoUploadStart = state
          },
          // 修改文章视频上传进度
          changeArticleUploadPercent(percent) {
              this.articleVideoUploadPercent = percent
          },
          // 文章视频上传成功
          articleUploadSuccess(data) {
              this.contents.push({
                  type: '4',
                  content: data
              })
          },
          // 删除冒泡视频
          deleteBubblePreviewVideo() {
              this.bubblePlayerOptions.sources = []
              this.bubbleVideoList = []
          },
          addElement(type, content) {
              // 类型，1标题，2文字段落，3图片地址，4视频地址，5语音地址，6链接地址
              this.contents.push({
                  type,
                  content
              })
          },
          removeElement(index) {
              this.contents.splice(index, 1)
          },
          handleView(name) {
              this.previewImgUrl = name
              this.visible = true
          },
          handleRemove(file) {
              this.bubbleImgList.splice(this.bubbleImgList.indexOf(file), 1)
          },
          // 冒泡图片上传成功处理
          handleBubbleSuccess(res, img) {
              console.log(res)
              if (res.code === 0) {
                  img.id = res.data.img_id
                  img.url = res.data.img_url
              }
          },
          handleSuccess(res, img) {
              if (res.code === 0) {
                  img.id = res.data.img_id
                  img.url = res.data.img_url
              }
          },
          handleFormatError(file) {
              this.$Notice.warning({
                  title: '图片格式不合法',
                  desc: '图片文件 ' + file.name + ' 不合法，请选择 jpg 或 png 图片。'
              })
          },
          handleMaxSize(file) {
              this.$Notice.warning({
                  title: '图片大小限制',
                  desc: '图片文件  ' + file.name + ' 太大了，不可以超过 5MB.'
              })
          },
          // 上传前校验
          handleBeforeUpload() {
              const check = this.bubbleImgList.length < 9
              if (!check) {
                  this.$Notice.warning({
                      title: '最多可以上传9张图片'
                  })
              }
              return check
          },
          handleArticeImgUpload() {
              console.log('init img')
          },
          handleArticeVideoUpload() {
              console.log('init video')
          },
          // 文章图片
          handleArticelImgSuccess(res, img) {
              if (res.code === 0) {
                  img.id = res.data.img_id
                  img.url = res.data.img_url
                  console.log(img.url)
              }
              this.addElement('3', img)
          },
          // 文章视频

          // 删除文章视频
          deleteArticlePreviewVideo() {
              this.articlePlayerOptions.sources = []
              this.articleVideoList = []
          },
          // 提交POST
          submit() {
              let option = {}
              option.group_id = this.selectedGroupId
              // 冒泡
              if (this.type === '1') {
                  // 内容类型，1标题，2文字段落，3图片地址，4视频地址，5语音地址，6链接地址
                  this.bubbleContents = []

                  // 纳入图片
                  this.bubbleImgList.forEach(img => {
                      this.bubbleContents.push({
                          content: img.id,
                          type: '3'
                      })
                  })

                  // 纳入视频
                  this.bubbleVideoList.forEach(video => {
                      this.bubbleContents.push({
                          content: video.video_id,
                          type: '4'
                      })
                  })

                  if (this.bubbleContents.length === 0 && this.content.length < 3) {
                      this.$Message.error('文本内容不可少于3个字符')
                      return false
                  }

                  // 纳入文本
                  this.bubbleContents.unshift({
                      content: this.content,
                      type: '2' // 文字类型
                  })

                  option.type = 1
                  option.contents = this.bubbleContents
              }
              // 文章
              if (this.type === '2') {
                  this.articleContents = []
                  this.contents.forEach((item, index) => {
                      let content = item.content
                      if (item.type === '3') {
                          content = item.content.id
                      }
                      if (item.type === '4') {
                          content = item.content.video_id
                      }
                      this.articleContents.push({
                          type: item.type,
                          content: content
                      })
                  })
                  option.type = 2
                  option.contents = this.articleContents
              }

              // 请求发布
              this.loading = true
              this.$axios.$post('/post/push', option).then(rsp => {
                  if (rsp.code === 0) {
                      this.$Message.success('发表成功')
                      // 转跳
                      setTimeout(() => {
                          this.$router.push({
                              path: '/post/' + rsp.data.alias_id
                          })
                          this.loading = false
                      }, 600)
                  } else {
                      this.$Message.error(rsp.msg || '服务不可用')
                      this.loading = false
                  }
              }).catch(error => {
                  this.$Message.error(error.toString() || '服务不可用')
                  this.loading = false
              })
          }
      }
  }
</script>

<style lang="less" scoped>
  .compose-wrap {
    border-top: 2px solid #DCE8F9;
    min-height: 500px;
    background: #fff;
    box-shadow: 0 0 1px #D3DCE7;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 0 10% 30px;

    .area {
      width: 100%;
      max-width: 600px;
      padding: 0;

      .group-selected {
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .type {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
      }

      .input {
        margin-bottom: 10px;
      }

      .item {
        margin-bottom: 10px;
      }

      .article {
        margin-right: -48px;

        .subtract-btn {
          width: 24px;
          height: 24px;
          line-height: 24px;
          background-color: #ed3f14;
          text-align: center;
          font-size: 18px;
          border-radius: 20px;
          color: #ffffff;
          cursor: pointer;
        }

        .text-input,
        .img-input,
        .video-input {
          display: flex;
          justify-content: left;
          align-items: center;

          .text,
          .video-preview,
          .img-preview {
            width: calc(100% - 50px);
            margin-right: 10px;
          }

          .video-preview {
            height: 300px;
          }
        }

        .type-warpper {
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          flex-direction: row;

          .add-type {
            width: 24px;
            height: 24px;
            line-height: 24px;
            background-color: #2d8cf0;
            text-align: center;
            font-size: 18px;
            border-radius: 20px;
            color: #fff;
          }

          .triangle {
            width: 0;
            height: 0;
            border-left: 15px solid transparent;
            border-right: 15px solid transparent;
            border-bottom: 20px solid #D8DDE6;
            margin: 0 auto -5px;
          }

          .type-content {
            width: calc(100% - 50px);
            margin-right: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 14px;
            background-color: #F7F9FB;

            .type-btn {
              width: 33.33%;
              height: 100px;
              text-align: center;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-content: center;
              cursor: pointer;

              i {
                font-size: 40px;
              }

              .text-btn {
                font-size: 26px;
              }

              &:hover {
                background: #f0f7ff;
              }

              &.uploader-btn {
                padding: 0;
              }

              .video-text {
                font-size: 14px;
              }
            }
          }
        }
      }
    }
  }

  .img-upload-list {
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
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
  }

  .img-upload-list img {
    width: 100%;
    height: 100%;
  }

  .img-upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
  }

  .img-upload-list:hover .img-upload-list-cover {
    display: block;
  }

  .img-upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }

  .video-progress-line-wrap {
    width: calc(100% - 50px);
  }
</style>

<style lang="less">
  .compose-wrap {
    .area {
      .type {
        .ivu-radio-group {
          border-radius: 0 0 10px 10px !important;
          overflow: hidden;
          z-index: 999;
        }

        .ivu-radio-wrapper-checked {
          border-radius: 0 !important;
        }
      }

      .ivu-input {
        font-size: 14px;
        border-radius: 0;
        border: none;
        resize: none;
        padding: 10px;
        background-color: #FAFAFA;

        &:focus {
          outline: 0;
          box-shadow: none;
          background-color: #F5F7F9;
        }
      }

      .bubble,
      .article {
        .text-input {
          textarea {
            background-color: #FAFAFA;

            &:focus {
              background-color: #F5F7F9;
            }
          }

          .tips {
            position: relative;
            width: 100%;
            height: 20px;
            line-height: 20px;
            margin-top: -20px;
            text-align: right;

            .tip {
              display: inline-block;
              margin-right: 5px;
              color: #5C7390;
            }
          }
        }

        .icon-btn {
          width: 58px;
          height: 58px;
          display: flex;
          justify-content: center;
          align-items: center;

          .svg-icon {
            font-size: 24px;
            color: #5C7390;
          }

          &:hover {
            .svg-icon {
              color: #2d8cf0;
            }
          }
        }

        .type-warpper {
          .type-content {
            .video-btn {
              .uploader-btn.text-btn {
                padding: 0;
                color: #495060;
              }
            }
          }
        }
      }
    }

    .bubble {
      .ivu-upload {
        width: 58px;
        height: 58px;
        margin-right: 10px;
        display: inline-block;
      }
    }

    .uploader {
      display: inline-block;
    }

    .uploader-btn {
      border: none !important;

      &:hover {
        background-color: transparent !important;
      }
    }

    .delete-preview {
      margin-top: 10px;
    }

    .ivu-btn-text:focus {
      box-shadow: none;
    }

    .ivu-modal {
      .ivu-radio-group {
        display: flex;
        flex-wrap: wrap;

        .ivu-radio-group-item {
          height: 40px;
          line-height: 40px;
          width: 30%;
          margin-right: 1%;
          padding: 0 1%;

          &:hover {
            background: #F3F5F7;
            border-radius: 3px;
          }
        }
      }
    }

    .video-js {
      width: 100%;
    }

    .ivu-radio-group-button .ivu-radio-wrapper {
      border-radius: 0 !important;
    }

    .ivu-input-group-append,
    .ivu-input-group-prepend {
      border-radius: 0 !important;
      border: 0 !important;
      background: #2d8cf0;
      color: #fff;
    }

    .ivu-input[disabled],
    fieldset[disabled] .ivu-input {
      background: #eff5fd;
      color: #425167;
      font-weight: bold;
    }

    .ivu-select-single .ivu-select-selection .ivu-select-placeholder,
    .ivu-select-single .ivu-select-selection .ivu-select-selected-value {
      color: #fff;
    }

    .baseinfo-setting {
      margin: 5px 0;
      padding: 1px;
      width: 100%;
      height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .compose-btn {
        text-align: center;
      }

      .ivu-select {
        width: auto;
      }

      .group-selection {
        .ivu-select-selection {
          border: none !important;
          box-shadow: none;
        }

        .ivu-select-selected-value {
          padding-left: 12px !important;
          background: #DCE8F9;
          color: #2d8cf0 !important;
          border-radius: 15px;
          border: none;
        }

        .ivu-select-arrow {
          color: #2d8cf0;
        }
      }
    }

    .baseinfo-extra {
      margin: 30px 0 10px 0;
      height: 40px;
      width: 100%;

      .public-wrap {
        height: 36px;
        font-size: 14px;
        line-height: 36px;
        text-align: center;
        color: #5C7390;
      }

      .password-wrap {
        height: 36px;
        font-size: 18px;
        line-height: 36px;
        border-radius: 18px;
        width: 140px;
        margin: 0 auto;
        text-align: center;
        background: #F5F8FA;
        position: relative;

        .ivu-tooltip,
        .ivu-tooltip-rel {
          display: block;
        }

        .re-generate-btn {
          position: absolute;
          height: 36px;
          width: 36px;
          line-height: 32px;
          right: 0;
          top: 0;
          display: block;
          cursor: pointer;

          i {
            font-size: 22px;
          }
        }
      }

      .payment {
        z-index: 9999;
        width: 50%;
        min-width: 200px;
        margin: 0 auto;

        .ivu-input-group-append {
          display: none;
        }
      }
    }

    .ivu-radio-group {
      background: #DCE8F9;
    }

    .ivu-radio-group-button .ivu-radio-wrapper-checked {
      background: #2d8cf0 !important;
      color: #fff !important;
      box-shadow: none !important;
      border: none;
      overflow: hidden;
      border-radius: 12px !important;
    }

    .ivu-radio-group-button .ivu-radio-wrapper {
      border: none !important;
      background: #DCE8F9;
      color: #2d8cf0;

      &:before {
        display: none;
      }

      &:after {
        display: none;
      }
    }

    .ivu-radio-group-button .ivu-radio-focus {
      box-shadow: none !important;
      border: none;
    }

    .ivu-select-arrow {
      color: #fff;
    }

    .ivu-select-dropdown {
      z-index: 99999;
    }

    .ivu-upload-drag {
      background: #F5F8FA;
      border: none;

      &:hover {
        background: #f0f7ff;
      }
    }
  }
</style>