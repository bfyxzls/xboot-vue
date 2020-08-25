<style lang="less">
@import "../../../styles/table-common.less";
@import "./reportManage.less";
</style>
<template>
  <div class="search">
    <Card>
      <Form ref="searchForm" :model="searchForm" inline :label-width="70">
        <FormItem label="组织机构">
          <department-tree-choose @on-change="handleSelectDepTree" ref="depTree"></department-tree-choose>
        </FormItem>
         <Form-item label="分类" prop="typeId">
          <Select v-model="searchForm.typeId" clearable style="width: 200px">
            <Option value="1" selected>业主评价表</Option>
            <Option value="2">专家评价表</Option>
            <Option value="3">管理评价表</Option>
          </Select>
        </Form-item>
         <Form-item label="ID" prop="id">
            <Input
              type="text"
              v-model="searchForm.id"
              clearable
              placeholder="请输入ID"
              style="width: 200px"
            />
          </Form-item>
        <Form-item label="创建时间">
          <DatePicker
            type="daterange"
            format="yyyy-MM-dd"
            clearable
            @on-change="selectDateRange"
            placeholder="选择起始时间"
            style="width: 200px"
          ></DatePicker>
        </Form-item>
        <Form-item style="margin-left:-35px;" class="br">
          <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
          <Button @click="exportExcel" type="primary" icon="ios-search">导出</Button>
        </Form-item>
      </Form>

      <Row v-show="openTip">
        <Alert show-icon>
          已选择
          <span class="select-count">{{selectCount}}</span> 项
          <a class="select-clear" @click="clearSelectAll">清空</a>
        </Alert>
      </Row>
      <Row>
        <Table
          :loading="loading"
          border
          :columns="columns"
          :data="data"
          ref="table"
          sortable="custom"
          @on-sort-change="changeSort"
          @on-selection-change="changeSelect"
        ></Table>
      </Row>
      <Row type="flex" justify="end" class="page">
        <Page
          :current="pageNumber"
          :total="total"
          :page-size="pageSize"
          @on-change="changePage"
          @on-page-size-change="changePageSize"
          :page-size-opts="[10,20,50]"
          size="small"
          show-total
          show-elevator
          show-sizer
        ></Page>
      </Row>
    </Card>

    <Modal :title="modalTitle" v-model="roleModalDetailVisible" :mask-closable="false" :width="500">
      <div
        v-for="(item, i) in recordDetailList"
        :key="i"
        style="border-bottom:1px dashed #aaa;padding:5px;"
      >
        题目： {{item.templateTitle}}
        <div v-if="item.questionType === 4">
          <img :src="item.content" width="50" height="50" />
        </div>
        <div v-if="item.questionType === 1">{{item.score}}</div>
        <div v-if="item.questionType === 2 || item.questionType === 3">{{item.content}}</div>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  getReportList,
  getRecordDetailList,
  getReportExport
} from "@/api/index";
import util from "@/libs/util.js";
import departmentTreeChoose from "@/views/my-components/xboot/department-tree-choose";

export default {
  name: "task-manage",
  components: {
    departmentTreeChoose
  },
  data() {
    return {
      openTip: true,
      openSearch: true,
      openLevel: "0",
      loading: true,
      treeLoading: true,
      depTreeLoading: true,
      submitPermLoading: false,
      submitDepLoading: false,
      searchKey: "",
      sortColumn: "createTime",
      sortType: "desc",
      modalType: 0,
      modalTitle: "",
      roleForm: {
        name: "",
        description: ""
      },
      roleFormValidate: {
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }]
      },
      searchForm: {
        id: "",
        nickName: "",
        username: "",
        departmentId: "",
        mobile: "",
        email: "",
        sex: "",
        type: "",
        status: "",
        pageNumber: 1,
        pageSize: 10,
        sort: "createTime",
        order: "desc",
        startDate: "",
        endDate: ""
      },
      submitLoading: false,
      selectList: [],
      selectCount: 0,
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center"
        },
        {
          type: "index",
          width: 60,
          align: "center"
        },
        {
          title: "ID",
          key: "id",
          width: 200,
          sortable: true
        },
        {
          title: "账号",
          key: "createByName",
          width: 200,
          sortable: true
        },
         {
          title: "昵称",
          key: "createByNickName",
          width: 200,
          sortable: true
        },
        {
          title: "行政区",
          key: "departmentTreeTitle",
          width: 300,
          sortable: true
        },
        {
          title: "小区",
          key: "courtTitle",
          width: 200,
          sortable: true
        },
        {
          title: "分数",
          key: "score",
          width: 100,
          sortable: true
        },
        {
          title: "分类",
          key: "typeTitle",
          minWidth: 150,
          sortable: true
        },
          {
          title: "经度",
          key: "longitude",
          width: 100,
          sortable: true
        },
          {
          title: "纬度",
          key: "latitude",
          width: 100,
          sortable: true
        },
        {
          title: "任务",
          key: "taskTitle",
          minWidth: 150,
          sortable: true
        },

        {
          title: "创建时间",
          key: "createTime",
          width: 170,
          sortable: true,
          sortType: "desc"
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 100,

          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    size: "small"
                  },
                  style: {
                    marginRight: "5px"
                  },
                  on: {
                    click: () => {
                      this.detail(params.row);
                    }
                  }
                },
                "查看"
              )
            ]);
          }
        }
      ],
      data: [],
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      permData: [],
      editRolePermId: "",
      selectAllFlag: false,
      depData: [],
      dataType: 0,
      roleModalVisible: false,
      roleModalDetailVisible: false,
      editDepartments: [],
      courtList: [],
      tenementList: [],
      taskList: [],
      typeList: [],
      courtAllList: [],
      recordDetailList: []
    };
  },
  methods: {
    init() {
      this.getList();
    },
    handleSelectDepTree(v) {
      this.searchForm.departmentId = v;
    },
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },

    renderContent(h, { root, node, data }) {
      let icon = "";
      if (data.level == 0) {
        icon = "ios-navigate";
      } else if (data.level == 1) {
        icon = "md-list-box";
      } else if (data.level == 2) {
        icon = "md-list";
      } else if (data.level == 3) {
        icon = "md-radio-button-on";
      } else {
        icon = "md-radio-button-off";
      }
      return h(
        "span",
        {
          style: {
            display: "inline-block",
            cursor: "pointer"
          },
          on: {
            click: () => {
              data.checked = !data.checked;
            }
          }
        },
        [
          h("span", [
            h("Icon", {
              props: {
                type: icon,
                size: "16"
              },
              style: {
                "margin-right": "8px",
                "margin-bottom": "3px"
              }
            }),
            h("span", data.title)
          ])
        ]
      );
    },
    changePage(v) {
      this.searchForm.pageNumber = v;
      this.getList();
      this.clearSelectAll();
    },
    changePageSize(v) {
      this.searchForm.pageSize = v;
      this.getList();
    },
    changeSort(e) {
      this.sortColumn = e.key;
      this.sortType = e.order;
      if (e.order == "normal") {
        this.sortType = "";
      }
      this.getList();
    },
    selectDateRange(v) {
      if (v) {
        this.searchForm.startDate = v[0];
        this.searchForm.endDate = v[1];
      }
    },

    handleSearch() {
      this.searchForm.pageNumber = 1;
      this.searchForm.pageSize = 10;
      this.getList();
    },
    exportExcel() {
      getReportExport(this.searchForm).then(res=>{});
    },
    getList() {
      // 多条件搜索用户列表
      this.loading = true;
      getReportList(this.searchForm).then(res => {
        this.loading = false;
        if (res.success) {
          this.data = res.result.content;
          this.total = res.result.totalElements;
        }
      });
    },
    cancel() {
      this.roleModalVisible = false;
    },

    detail(v) {
      this.modalType = 2;
      this.modalTitle = "查看";
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let roleInfo = JSON.parse(str);
      getRecordDetailList({ recordId: roleInfo.id }).then(res => {
        if (res.success) {
          this.recordDetailList = res.result;
        }
      });
      this.roleForm = roleInfo;
      this.roleModalDetailVisible = true;
    },

    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },

    // 全选反选
    selectTreeAll() {
      this.selectAllFlag = !this.selectAllFlag;
      let select = this.selectAllFlag;
      this.selectedTreeAll(this.permData, select);
    },
    // 递归全选节点
    selectedTreeAll(permData, select) {
      let that = this;
      permData.forEach(function(e) {
        e.checked = select;
        if (e.children && e.children.length > 0) {
          that.selectedTreeAll(e.children, select);
        }
      });
    }
  },
  mounted() {
    this.init();
  }
};
</script>