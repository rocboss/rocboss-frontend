<template>
    <div class="sidebar links-wrap">
        <ul class="links clearfix">
            <li class="copyright">2014-2020&copy;ROCBOSS</li>
            <li class="link"><a class="Footer-link" target="_blank" href="https://rocboss.com">ROCBOSS官网</a></li>
        </ul>
    </div>
</template>

<script>
export default {

}
</script>

<style lang="less" scoped>
.links-wrap {
    padding: 10px;
    margin-top: 10px;
    min-height: 40px!important;
}
.links {
    list-style-type: none;
    .link, .copyright {
        float: left;
        color: #657786;
        padding-right: 8px;
        height: 22px;
        line-height: 22px;
        a {
            color: #657786;
            &:hover {
                color: #2d8cf0;
                text-decoration: underline;
            }
        }
    }
}
</style>