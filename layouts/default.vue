<template>
  <div class="layout">
    <Layout>
        <!-- Header -->
        <Header>
          <div class="header-wrap">
            <MyHeader></MyHeader>
          </div>
        </Header>

        <!-- Content -->
        <Content>
          <div class="content-wrap">
            <nuxt />
          </div>
        </Content>

        <!-- Footer -->
        <Footer>
          <div class="footer-wrap">
            <MyFooter></MyFooter>
          </div>
        </Footer>
    </Layout>
  </div>
</template>

<script>
import MyHeader from '~/components/Header.vue'
import MyFooter from '~/components/Footer.vue'

export default {
    components: {
        MyHeader,
        MyFooter
    }
}
</script>

<style lang="less">
body {
  font-size: 12px;
}
.ivu-table {
  font-size: 12px;
}
.layout, .ivu-layout {
  min-height: 100vh;
}

.header-wrap, .content-wrap, .footer-wrap {
  height: 100%;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
}

.content-wrap, .footer-wrap {
  margin-top: 10px!important;
}
.ivu-affix {
  z-index: 200;
}
</style>
