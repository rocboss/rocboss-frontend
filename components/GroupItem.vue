<template>
    <div class="group-item" :class="{'active': activeGroupId == group.id}">
        <nuxt-link :to="'/group/'+group.id">
            <svg-icon icon-class="left-arrow" class="group-item-arrow" :size="12"></svg-icon> {{ group.name }}
        </nuxt-link>
    </div>
</template>

<script>
export default {
  props: {
    group: Object,
    activeGroupId: Number
  },
  data() {
    return {

    }
  }
}
</script>

<style lang="less" scoped>
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
        a {
            color: #2d8cf0;
            font-weight: bold;
            .group-item-arrow {
                color: #2d8cf0;
            }
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
</style>
