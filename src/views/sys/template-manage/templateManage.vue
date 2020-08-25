<style lang="less">
@import "../../../styles/tree-common.less";
@import "./templateManage.less";
</style>
<template>
  <div class="search">
    <Card>
      <Row class="operation">
        <Button @click="add" type="primary" icon="md-add">添加子模板</Button>
        <Button @click="addRoot" icon="md-add">添加一级模板</Button>
        <Button @click="delAll" icon="md-trash">批量删除</Button>
        <Dropdown @on-click="handleDropdown">
          <Button>
            更多操作
            <Icon type="md-arrow-dropdown"></Icon>
          </Button>
          <DropdownMenu slot="list">
            <DropdownItem name="refresh">刷新</DropdownItem>
            <DropdownItem name="expandOne">收合所有</DropdownItem>
            <DropdownItem name="expandTwo">仅展开一级</DropdownItem>
            <DropdownItem name="expandThree">仅展开两级</DropdownItem>
            <DropdownItem name="expandAll">展开所有</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <i-switch v-model="strict" size="large" style="margin-left:5px">
          <span slot="open">级联</span>
          <span slot="close">单选</span>
        </i-switch>
      </Row>
      <!-- 编辑 -->
      <Row type="flex" justify="start">
        <Col :md="8" :lg="8" :xl="6">
          <Alert show-icon>
            当前选择编辑：
            <span class="select-title">{{editTitle}}</span>
            <a class="select-clear" v-if="form.id" @click="cancelEdit">取消选择</a>
          </Alert>
          <Input
            v-model="searchKey"
            suffix="ios-search"
            @on-change="search"
            placeholder="输入菜单名搜索"
            clearable
          />
          <div class="tree-bar" :style="{maxHeight: maxHeight}">
            <Tree
              ref="tree"
              :data="data"
              show-checkbox
              @on-select-change="selectTree"
              @on-check-change="changeSelect"
              :check-strictly="!strict"
            ></Tree>
            <Spin size="large" fix v-if="loading"></Spin>
          </div>
        </Col>
        <Col :md="20" :lg="18" :xl="9" style="margin-left:10px;">
          <Form ref="form" :model="form" :label-width="110" :rules="formValidate" width="100%">
            <FormItem label="名称" prop="title">
              <Input v-model="form.title" />
            </FormItem>

            <FormItem label="评价说明" prop="content" class="block-tool">
              <textarea v-model="form.content" rows="5" style="width:300px"/>
            </FormItem>

            <FormItem label="分值" prop="score">
              <Tooltip placement="right" content="请输入本题的分值">
                <Input v-model="form.score" />
              </Tooltip>
            </FormItem>

            <FormItem label="是否必填" prop="isRequired">
              <Select v-model="form.isRequired">
                <Option value="1">是</Option>
                <Option value="0">否</Option>
              </Select>
            </FormItem>

            <FormItem label="排序" prop="sortOrder">
              <Input v-model="form.sortOrder" />
            </FormItem>
            <FormItem label="记分类型" prop="scoreType">
              <Select v-model="form.scoreType">
                <Option value="0">不记分</Option>
                <Option value="1">记分</Option>
              </Select>
            </FormItem>
            <FormItem label="类型" prop="questionType">
              <Select v-model="form.questionType">
                <Option
                  v-for="(item, i) in this.$store.state.dict.questionType"
                  :key="i"
                  :value="item.value"
                >{{item.title}}</Option>
              </Select>
            </FormItem>
            <Form-item>
              <Button
                style="margin-right:5px"
                @click="submitEdit"
                :loading="submitLoading"
                type="primary"
                icon="ios-create-outline"
              >修改并保存</Button>
              <Button @click="handleReset">重置</Button>
            </Form-item>
          </Form>
        </Col>
      </Row>
    </Card>

    <Modal
      draggable
      :title="modalTitle"
      v-model="menuModalVisible"
      :mask-closable="false"
      :width="500"
      :styles="{top: '30px'}"
    >
      <!-- 添加 -->
      <Form ref="formAdd" :model="formAdd" :label-width="100" :rules="formValidate" width="100%">
        <div v-if="showParent">
          <FormItem label="上级节点：">{{parentTitle}}</FormItem>
        </div>
        <FormItem label="分类" prop="type" v-if="formAdd.level==0">
          <Select v-model="formAdd.typeId">
            <Option v-for="item in typeList" :value="item.id" :key="item.id" :label="item.title">
              <span style="margin-right:10px;">{{ item.title }}</span>
              <span style="color:#ccc;">{{ item.description }}</span>
            </Option>
          </Select>
        </FormItem>
        <FormItem label="名称" prop="title">
          <Input v-model="formAdd.title" />
        </FormItem>

        <FormItem label="内容" prop="content">
                        <textarea v-model="formAdd.content" rows="5" style="width:300px" />
        </FormItem>

        <FormItem label="分值" prop="score">
          <Tooltip placement="right" content="请输入本题的分值">
            <Input v-model="formAdd.score" />
          </Tooltip>
        </FormItem>
          <FormItem label="是否必填" prop="isRequired">
          <Select v-model="formAdd.isRequired">
            <Option value="1">是</Option>
            <Option value="0">否</Option>
          </Select>
        </FormItem>
        <FormItem label="排序" prop="sortOrder">
          <Input v-model="formAdd.sortOrder" />
        </FormItem>

        <FormItem label="记分类型" prop="scoreType">
          <Select v-model="formAdd.scoreType">
            <Option value="0">不记分</Option>
            <Option value="1">记分</Option>
          </Select>
        </FormItem>

        <FormItem label="类型" prop="questionType">
          <Select v-model="formAdd.questionType">
            <Option
              v-for="(item, i) in this.$store.state.dict.questionType"
              :key="i"
              :value="item.value"
            >{{item.title}}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="menuModalVisible = false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitAdd">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  addTemplate,
  editTemplate,
  deleteTemplate,
  getAllTypeList
} from "@/api/index";
import util from "@/libs/util.js";

export default {
  name: "template-manage",
  data() {
    return {
      loading: true,
      strict: true,
      maxHeight: "500px",
      expandLevel: 1,
      menuModalVisible: false,
      selectList: [],
      selectCount: 0,
      showParent: false,
      searchKey: "",
      parentTitle: "",
      editTitle: "",
      modalTitle: "",
      form: {
        id: "",
        title: "",
        name: "",
        content: "",
        type: "",
        parentId: "",
        score: 0,
        buttonType: "",
        type: 0,
        level: 0,
        status: 0,
        url: "",
        showAlways: true,
        questionType: 0
      },

      editorOption: {
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"], // toggled buttons
            ["blockquote", "code-block"]
          ]
        }
      },
      formAdd: {
        buttonType: ""
      },
      typeList: [],
      formValidate: {},
      submitLoading: false,
      data: [],
      dictPermissions: []
    };
  },
  computed: {
    editor() {
      return this.$refs.myQuillEditor.quill;
    }
  },
  methods: {
    init() {
      this.getAllList();
      getAllTypeList().then(res => {
        if (res.success) {
          this.typeList = res.result;
        }
      });
    },

    onEditorReady(editor) {
      // 准备编辑器
    },
    onEditorBlur() {}, // 失去焦点事件
    onEditorFocus() {}, // 获得焦点事件
    onEditorChange() {}, // 内容改变事件

    handleDropdown(name) {
      if (name == "expandOne") {
        this.expandLevel = 1;
        this.getAllList();
      } else if (name == "expandTwo") {
        this.expandLevel = 2;
        this.getAllList();
      } else if (name == "expandThree") {
        this.expandLevel = 3;
        this.getAllList();
      }
      if (name == "expandAll") {
        this.expandLevel = 4;
        this.getAllList();
      } else if (name == "refresh") {
        this.getAllList();
      }
    },
    getAllList() {
      this.loading = true;
      this.getRequest("/template/getAllList").then(res => {
        this.loading = false;
        if (res.success) {
          // 仅展开指定级数 默认后端已展开所有
          let expandLevel = this.expandLevel;
          res.result.forEach(function(e) {
            if (expandLevel == 1) {
              if (e.level == 0) {
                e.expand = false;
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function(c) {
                  if (c.level == 1) {
                    c.expand = false;
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function(b) {
                      if (b.level == 2) {
                        b.expand = false;
                      }
                    });
                  }
                });
              }
            } else if (expandLevel == 2) {
              if (e.level == 0) {
                e.expand = true;
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function(c) {
                  if (c.level == 1) {
                    c.expand = false;
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function(b) {
                      if (b.level == 2) {
                        b.expand = false;
                      }
                    });
                  }
                });
              }
            } else if (expandLevel == 3) {
              if (e.level == 0) {
                e.expand = true;
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function(c) {
                  if (c.level == 1) {
                    c.expand = true;
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function(b) {
                      if (b.level == 2) {
                        b.expand = false;
                      }
                    });
                  }
                });
              }
            }
          });
          this.data = res.result;
        }
      });
    },
    search() {
      if (this.searchKey) {
        this.loading = true;
        searchPermission({ title: this.searchKey }).then(res => {
          this.loading = false;
          if (res.success) {
            this.data = res.result;
          }
        });
      } else {
        this.getAllList();
      }
    },
    selectTree(v) {
      if (v.length > 0) {
        // 转换null为""
        for (let attr in v[0]) {
          if (v[0][attr] == null) {
            v[0][attr] = "";
          }
        }
        let str = JSON.stringify(v[0]);
        let menu = JSON.parse(str);
        this.form = menu;

        this.form.questionType = String(menu.questionType);
        this.form.scoreType = String(menu.scoreType);
        this.form.isRequired = String(menu.isRequired);

        this.editTitle = menu.title;
      } else {
        this.cancelEdit();
      }
    },
    cancelEdit() {
      let data = this.$refs.tree.getSelectedNodes()[0];
      if (data) {
        data.selected = false;
      }
      this.$refs.form.resetFields();
      this.form.id = "";
      this.editTitle = ""; 
    },
    handleReset() {
      let type = this.form.type;
      this.$refs.form.resetFields();
      this.form.component = "";
      this.form.type = type;
    },
    submitEdit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (!this.form.id) {
            this.$Message.warning("请先点击选择要修改的菜单节点");
            return;
          }
          this.submitLoading = true;

          editTemplate(this.form).then(res => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("编辑成功");
              // 标记重新获取菜单数据
              this.$store.commit("setAdded", false);
              util.initRouter(this);
              //主要为了不刷新左侧菜单
               selectTree(this.form); 
              this.init();
              this.menuModalVisible = false;
             

            }
          });
        }
      });
    },
    submitAdd() {
      this.$refs.formAdd.validate(valid => {
        if (valid) {
          this.submitLoading = true;

          addTemplate(this.formAdd).then(res => {
            this.submitLoading = false;
            if (res.success) {
              this.$Message.success("添加成功");
              // 标记重新获取菜单数据
              this.$store.commit("setAdded", false);
              util.initRouter(this);
              this.init();
              this.menuModalVisible = false;
            }
          });
        }
      });
    },

    add() {
      if (!this.form.id) {
        this.$Message.warning("请先点击选择一个节点");
        return;
      }
      this.parentTitle = this.form.title;
      this.modalTitle = "添加子节点(可拖动)";
      this.showParent = true;

      let component = "";
      this.formAdd = {
        parentId: this.form.id,
        level: Number(this.form.level) + 1,
        type: this.form.type,
        sortOrder: 0,
        score: 0,
        buttonType: "",
        status: 0,
        showAlways: true
      };
      if (this.form.level == 0) {
        this.formAdd.path = "/";
        this.formAdd.component = "Main";
      }
      this.menuModalVisible = true;
    },
    addRoot() {
      this.modalTitle = "添加顶部菜单(可拖动)";
      this.showParent = false;
      this.formAdd = {
        level: 0,
        sortOrder: 0,
        status: 0
      };
      this.menuModalVisible = true;
    },
    changeSelect(v) {
      this.selectCount = v.length;
      this.selectList = v;
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未勾选要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function(e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          deleteTemplate({ ids: ids }).then(res => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              // 标记重新获取菜单数据
              this.$store.commit("setAdded", false);
              util.initRouter(this);
              this.selectList = [];
              this.selectCount = 0;
              this.cancelEdit();
              this.init();
            }
          });
        }
      });
    }
  },
  mounted() {
    // 计算高度
    let height = document.documentElement.clientHeight;
    this.maxHeight = Number(height - 287) + "px";
    this.init();
  }
};
</script>