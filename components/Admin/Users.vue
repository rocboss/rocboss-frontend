<template>
<div>
    <Table :columns="userColumn" :data="rows">
        <template slot-scope="{ row, index }" slot="username">
            <img :src="row.avatar + $store.state.oss.avatar_small" class="avatar" :alt="row.username"> 
            <a :href="'/user/'+row.username" target="_blank">{{ row.username }}</a>
        </template>
        <template slot-scope="{ row, index }" slot="action">
            <i-switch v-model="row.is_banned" :loading="row.loading" @on-change="banUser(row)" false-color="#13ce66" true-color="#ff4949" size="large">
                <span slot="open">禁言</span>
                <span slot="close">正常</span>
            </i-switch>
        </template>
    </Table>

    <!-- 分页 -->
    <div class="pagination-wrap" v-if="total >= page_size">
        <Page :current="page" :total="total" :page-size="page_size" @on-change="pageTurn" />
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            userColumn: [
                {
                    title: '用户ID',
                    width: 100,
                    key: 'id'
                },
                {
                    title: '用户名',
                    width: 150,
                    slot: 'username'
                },
                {
                    title: '邮箱',
                    width: 200,
                    key: 'email'
                },
                {
                    title: '注册时间',
                    width: 150,
                    key: 'created_at'
                },
                {
                    title: '最后活跃',
                    width: 150,
                    key: 'updated_at'
                },
                {
                    title: '操作',
                    slot: 'action',
                    width: 165,
                    align: 'center'
                }
            ],

            loading: false,
            page: 1,
            page_size: 20,
            rows: [],
            total: 0
        }
    },
    methods: {
        init() {
            this.loadData()
        },
        // 翻页
        pageTurn(page) {
            this.page = page
            this.loadData()
        },
        loadData() {
            this.loading = true
            this.$axios.$get('/admin/users', {
                params: {
                    page: this.page,
                    page_size: this.page_size
                }
            }).then(rsp => {
                if (rsp.code === 0) {
                    rsp.data.rows.forEach(row => {
                        row.loading = false
                    })
                    this.rows = rsp.data.rows
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
        // 禁言用户
        banUser(user) {
            user.loading = true
            this.$axios.$post('/admin/ban/user', {
                user_id: user.id
            }).then(rsp => {
                if (rsp.code === 0) {
                    this.$Message.success(user.is_banned ? '禁言成功' : '取消禁言成功')
                } else {
                    this.$Message.error(rsp.msg || '服务不可用')
                }
                user.loading = false
            }).catch(error => {
                this.$Message.error(error.toString() || '服务不可用')
                user.loading = false
            })
        }
    }
}
</script>

<style lang="less" scoped>
.avatar {
    width: 28px;
    height: 28px;
    display: inline-block;
    border-radius: 50%;
    vertical-align: middle;
}
.pagination-wrap {
    padding: 10px;
    text-align: center;
}
</style>