<template>
  <section class="container">
    <Row type="flex" style="justify-content: center;">
      <Col :xs="24" :sm="24" :md="24" :lg="12">
      <Content class="assets-container">
        <!-- 资产概览 -->
        <div class="summary-wrap">
          <Row>
            <Col span="12" class="item">
            <div class="title">总资产</div>
            <div class="value">￥{{ $store.state.userInfo.balance }}</div>
            </Col>
            <Col span="12" class="item">
            <div class="title">操作</div>
            <div class="value">
                <Button type="text" @click="withdraw">提现</Button> | <Button type="text" @click="recharge">充值</Button>
            </div>
            </Col>
          </Row>
        </div>

        <!-- 充值区域 -->
        <div class="recharge-wrap" v-if="showRecharge">
          <InputNumber
            :max="100000"
            v-model="rechargeAmount"
            :formatter="value => `￥ ${value}`.replace(/B(?=(d{3})+(?!d))/g, ',')"
            :parser="value => value.replace(/$s?|(,*)/g, '')"></InputNumber>
          <Button :loading="recharging" @click="doRecharge()">充值</Button>
        </div>

        <!-- 资金流水 -->
        <div class="assets-flow">
          <div v-for="item in list" class="flow-item">
            <!-- 类型 -->
            <div class="type">
                <span v-if="item.change > 0">收入</span>
                <span v-else>支出</span>
            </div>
            <!-- 数额 -->
            <div class="amount">
                {{ item.change > 0 ? '+' + item.change : item.change }}
            </div>
            <!-- 备注 -->
            <div class="remark">
                {{ item.note }}
            </div>
            <!-- 余额 -->
            <div class="balance">
                {{ item.balance }}
            </div>
            <!-- 操作 -->
            <div class="option">
                详情
            </div>
          </div>
          <!-- 空数据·占位图 -->
          <div v-if="list.length === 0" class="empty-post-wrap">
            <img :src="require('@/assets/image/empty.png')" class="empty-image">
            <div class="empty-tips">
              暂无数据哦~
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrap" v-if="total >= page_size">
            <Page :current="page" :total="total" :page-size="page_size" @on-change="pageTurn" simple/>
        </div>
      </Content>
      </Col>
    </Row>
  </section>
</template>

<script>
  export default {
      head() {
          return {
              title: '我的资产'
          }
      },
      data() {
          return {
              loading: false,
              page: 1,
              page_size: 20,
              list: [],
              total: 0,

              recharging: false,
              showRecharge: false,
              rechargeAmount: 10
          }
      },
      mounted() {
          this.$store.commit('changeActiveNav', 'assets')
          this.loadData()
      },
      methods: {
          // 翻页
          pageTurn(page) {
              this.page = page
              this.loadData()
          },
          // 加载数据
          loadData() {
              if (this.loading) {
                  return false
              }
              this.loading = true
              this.$axios.$get('/user/assets/record', {
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
          },
          // 提现
          withdraw() {
              this.$Message.info('别急，这个还没开发呢(*^▽^*)')
          },
          // 充值
          recharge() {
              this.showRecharge = !this.showRecharge
          },
          // 执行充值
          doRecharge() {
              this.recharging = true
              this.$Message.info('暂未开放哟')
          }
      }
  }
</script>

<style lang="less" scoped>
  .assets-container {
    background: #fff;
    min-height: 100px;
    border: 1px solid #e7eaf3;
    border-radius: 0.25rem;
    box-shadow: 0 0.5rem 1.2rem rgba(189, 197, 209, 0.2);

    .summary-wrap {
      height: 100px;
      padding: 10px 20px;

      .item {
        text-align: center;

        .title {
          height: 40px;
          line-height: 40px;
          opacity: .8;
        }

        .value {
          height: 40px;
          line-height: 40px;
          font-weight: bold;
          font-size: 16px;
        }
      }
    }

    .recharge-wrap {
      padding: 20px;
      background: #f3f5f6;
      text-align: center;
    }

    .assets-flow {
      .flow-item {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 42px;
        line-height: 42px;
        border-top: 1px solid #efefef;
        .type {
          flex: 1;
          text-align: center;
        }

        .amount {
          flex: 1.5;
        }

        .remark {
          flex: 3;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
        }

        .balance {
            flex: 1.5;
        }

        .option {
            flex: 1;
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
    }

    .pagination-wrap {
        padding: 10px;
        text-align: center;
    }
  }
</style>
