import Vue from "vue";
import iView from "view-design";
import locale from "view-design/dist/locale/zh-CN"; // Change locale, check node_modules/iview/dist/locale

export default () => {
  Vue.use(iView, {
    locale
  });
}