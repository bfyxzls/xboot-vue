<template>

<Input
    type="text"
    v-model="message"
    clearable
    placeholder="请输入用户名"
    style="width: 200px"/>
      
</template>
<script>
export default {
  name: "test-manage",
  data() {
    return {
      message: "hello"
    };
  },
  methods: {
    init() {
      message = "hello world!";
    }
  },
  mounted() {},
  computed() {}
};
</script>