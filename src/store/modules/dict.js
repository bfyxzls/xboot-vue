const dict = {
    state: {
        // 经常需要读取的数据字典
        sex: [],
        userType: [],
        questionType: [],
        education: [],
        expertType: []
    },
    mutations: {
        // 设置值的改变方法
        setSex(state, list) {
            state.sex = list;
        },

        setUserType(state, list) {
            state.userType = list;
        },

        setQuestionType(state, list) {
            state.questionType = list;
        },

        setEducation(state, list) {
            state.education = list;
        },

        setExpertType(state, list) {
            state.expertType = list;
        },
    }
};

export default dict;
