import Vue from "vue";

// 引入svg组件
import SvgIcon from '@/components/SvgIcon'

// 全局注册svg-icon
Vue.component('svg-icon', SvgIcon)

const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('@/assets/icon', false, /\.svg$/)
requireAll(req)

