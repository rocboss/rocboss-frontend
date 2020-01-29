<template>
    <div>
        <Row :gutter="16">
            <Col span="6">
                <Card class="summary-item">
                    <p>用户数</p>
                    <p class="number-highlight">{{ user_count }}</p>
                </Card>
            </Col>
            <Col span="6">
                <Card class="summary-item">
                    <p>冒泡数</p>
                    <p class="number-highlight">{{ post_count }}</p>
                </Card>
            </Col>
            <Col span="6">
                <Card class="summary-item">
                    <p>文章数</p>
                    <p class="number-highlight">{{ article_count }}</p>
                </Card>
            </Col>
            <Col span="6">
                <Card class="summary-item">
                    <p>图片/视频素材库</p>
                    <p class="number-highlight">{{ material_count }}</p>
                </Card>
            </Col>
        </Row>
        <div class="charts">
            <Row :gutter="16">
                <Col span="24">
                    <Card style="width: 100%">
                        <div style="text-align:center">
                            <h3>更多报表统计敬请期待...</h3>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
        <Spin size="large" fix v-if="loading"></Spin>
    </div>
</template>

<script>
export default {
    mounted() {

    },
    data() {
        return {
            loading: false,
            user_count: 0,
            post_count: 0,
            article_count: 0,
            material_count: 0
        }
    },
    methods: {
        init() {
            this.loadData()
        },
        loadData() {
            this.loading = true
            this.$axios.$get('/admin/summary').then(rsp => {
                if (rsp.code === 0) {
                    this.user_count = rsp.data.user_count
                    this.post_count = rsp.data.post_count
                    this.article_count = rsp.data.article_count
                    this.material_count = rsp.data.material_count
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
                this.loading = false
            }).catch(error => {
                this.loading = false
                this.$Message.error(error.toString() || '服务不可用')
            })
        }
    }
}
</script>

<style lang="less" scoped>
.summary-item {
    text-align: center;
    .number-highlight {
        font-size: 22px;
        line-height: 48px;
        font-weight: bold;
        color: #000;
    }
}
.charts {
    margin-top: 20px;
    color: #aaa;
}
</style>