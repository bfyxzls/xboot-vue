// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css';
import App from './App'
import { router } from './router/index'
import store from './store'
import i18n from '@/locale'
import Icon from 'vue-awesome/components/Icon'
// 按需引入awesome图标
import 'vue-awesome/icons/brands/qq'
import 'vue-awesome/icons/brands/weixin'
import 'vue-awesome/icons/brands/weibo'
import 'vue-awesome/icons/brands/github'
import { getRequest, postRequest, putRequest, postBodyRequest, getNoAuthRequest, postNoAuthRequest } from '@/libs/axios'
import { setStore, getStore, removeStore } from '@/libs/storage'
import { format } from "date-fns";
import util from '@/libs/util'
import dictUtil from '@/libs/dictUtil'
import hasPermission from '@/libs/hasPermission'
import hasRole from '@/libs/hasRole'
import iviewArea from '@/views/my-components/iview-area';
import VueLazyload from 'vue-lazyload'
import VueClipboard from 'vue-clipboard2'
import VueApexCharts from 'vue-apexcharts'
import '@babel/polyfill'
import quillEditor from 'vue-quill-editor' 
import 'quill/dist/quill.snow.css'  // 富文本编辑器外部引用样式  三种样式三选一引入即可
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
Vue.config.productionTip = false
Vue.use(VueLazyload, {
    error: require('./assets/img-error.png'),
    loading: require('./assets/loading2.gif')
})
Vue.use(ViewUI, {
    i18n: (key, value) => i18n.t(key, value)
});
Vue.use(iviewArea);
Vue.use(VueClipboard);
Vue.component('icon', Icon);
Vue.use(hasPermission);
Vue.use(hasRole);
Vue.use(iviewArea);
Vue.use(VueApexCharts)
Vue.use(quillEditor)



Vue.use(Viewer)
Viewer.setDefaults({
    Options: { 'inline': true, 'button': true, 'navbar': true, 'title': true, 'toolbar': true, 'tooltip': true, 'movable': true, 'zoomable': true, 'rotatable': true, 'scalable': true, 'transition': true, 'fullscreen': true, 'keyboard': true, 'url': 'data-source' }
})




Vue.component('apexchart', VueApexCharts)
// 挂载全局使用的方法
Vue.prototype.getRequest = getRequest;
Vue.prototype.postRequest = postRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.postBodyRequest = postBodyRequest;
Vue.prototype.getNoAuthRequest = getNoAuthRequest;
Vue.prototype.postNoAuthRequest = postNoAuthRequest;
Vue.prototype.setStore = setStore;
Vue.prototype.getStore = getStore;
Vue.prototype.removeStore = removeStore;
Vue.prototype.format = format;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    i18n,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted() {
        // 初始化菜单
        util.initRouter(this);
        // 初始化全局数据字典
        dictUtil.initDictData(this);
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
    }
})
