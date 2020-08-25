import Vue from 'vue';
import Vuex from 'vuex';

import app from './modules/app';
import user from './modules/user';
import dict from './modules/dict';

Vue.use(Vuex);

const store = new Vuex.Store({
    xboot: "大叔最新管理系统",
    state: {
        // 状态
        
    },
    mutations: {
        // 改变方法
    },
    actions: {

    },
    modules: {
        app,
        user,
        dict
    }
});

export default store;
