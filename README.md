# vue全局变量配置
1. 标题：/locale/lang/zh-CN.js 里面修改title这个变量即可
2. 进行系统后上方显示的标题，这是组织机构的一级标题，通过『系统管理』-『部门管理』来配置
# vue字典定义
1. store/modules/dict.js定义属性和set方法
```
const dict = {
    state: {
        // 经常需要读取的数据字典
        sex: [],
    },
    mutations: {
        // 设置值的改变方法
        setSex(state, list) {
            state.sex = list;
        }
    }
};

export default dict;

```
2. libs/dicUtils.js里调用字典获取的方法，为set方法赋值
```
    axios.get(getDictData + "expertType").then(res => {
        if(res.success){
            vm.$store.commit("setExpertType", res.result);
        }
    });
```
# vue里componet的使用
在菜单里添加元素时，前端组件为view的路径，如果你在一级菜单下面，可以不用写菜单的路径，它的继承下来
```
名称 中文菜单上显示的名称，它在上一级菜单路径可能是/sys
路径 相对路径 expert-manage
路由英文名 随便起个名字 expert-manage
前端组件 从view文件夹下面开始的绝对路径 sys/expert-manage/expertManage
```
# 起始页的设置
```
libs/util.js文件
...
  currentPathArr = [
            {
                title: util.handleTitle(vm, util.getRouterObjByName(vm.$store.state.app.routers, 'home_index')),
                path: '/user-manage', //这个地址改为你的起始页
                name: 'home_index'
            }...
```