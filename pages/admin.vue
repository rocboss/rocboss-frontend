<template>
    <section class="container">
         <Row>
            <Col :xs="24" :sm="24" :md="24" :lg="24">
                <!-- 主题容器 -->
                <div class="admin-container">
                    <Tabs :animated="false" :value="activeTab" @on-click="changeActiveTab">
                        <!-- 平台概况 -->
                        <TabPane label="平台概况" name="summary">
                            <Summary ref="summary" />
                        </TabPane>
                        <!-- 用户管理 -->
                        <TabPane label="用户管理" name="users">
                            <Users ref="users" />
                        </TabPane>
                    </Tabs>
                </div>
            </Col>
        </Row>
    </section>
</template>

<script>
import Summary from '~/components/Admin/Summary.vue'
import Users from '~/components/Admin/Users.vue'
export default {
    head() {
        return {
            title: '管理中心'
        }
    },
    components: {
        Summary,
        Users
    },
    mounted() {
        this.activeTab = this.$route.query.tab || 'summary'
        this.$refs[this.activeTab].init()
    },
    data() {
        return {
            activeTab: 'summary'

        }
    },
    methods: {
        changeActiveTab(tab) {
            this.$router.push({ path: '/admin', query: { tab }})
            this.$refs[tab].init()
        }
    }
}
</script>

<style lang="less" scoped>
.container {
    margin: 0 auto;
    .admin-container {
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
        padding: 20px;
    }
}
</style>