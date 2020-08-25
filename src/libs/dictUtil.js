import axios from 'axios';
import { getDictData } from '@/api/index';

let dictUtil = {

};

// 获取常用的数据字典保存至vuex
dictUtil.initDictData = function (vm) {
    axios.get(getDictData + "sex").then(res => {
        if(res.success){
            vm.$store.commit("setSex", res.result);
        }
    });

    axios.get(getDictData + "userType").then(res => {
        if(res.success){
            vm.$store.commit("setUserType", res.result);
        }
    });

    axios.get(getDictData + "questionType").then(res => {
        if(res.success){
            vm.$store.commit("setQuestionType", res.result);
        }
    });

    axios.get(getDictData + "education").then(res => {
        if(res.success){
            vm.$store.commit("setEducation", res.result);
        }
    });
    axios.get(getDictData + "expertType").then(res => {
        if(res.success){
            vm.$store.commit("setExpertType", res.result);
        }
    });
};

export default dictUtil;
