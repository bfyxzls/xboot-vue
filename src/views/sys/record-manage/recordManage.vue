<style lang="less">
@import "../../../styles/table-common.less";
@import "./recordManage.less";
</style>
<template>
  <div class="search">
    <Card>
      <Form ref="searchForm" :model="searchForm" inline :label-width="70">
        <FormItem label="组织机构">
          <department-tree-choose @on-change="handleSelectDepTree" ref="depTree"></department-tree-choose>
        </FormItem>

        <Form-item label="分类" prop="typeId">
          <Select v-model="searchForm.typeId" placeholder="请选择" clearable style="width: 200px">
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
        <Form-item label="小区" prop="courtId">
          <Select v-model="searchForm.courtId" placeholder="请选择" clearable style="width: 200px">
            <Option v-for="(item) in courtAllList" :key="item.id" :value="item.id">{{item.title}}</Option>
          </Select>
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

      <Row class="operation">
        <Button @click="delAll" icon="md-trash">批量删除</Button>
        <Button @click="auditRecord" icon="md-trash">批量审核</Button>

        <Button @click="init" icon="md-refresh">刷新</Button>
        <Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
      </Row>
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

    <!-- 编辑 -->

    <Modal :title="modalTitle" v-model="roleModalVisible" :mask-closable="false" :width="500">
      <Form :label-width="80">
        <div
          v-for="(item, i) in recordDetailList"
          :key="i"
          style="border-bottom:1px dashed #aaa;padding:5px;"
        >
          <div>{{item.templateTitle}}</div>
          <div v-if="item.questionType === 1">
            <div>
              <RadioGroup v-model="item.score">
                <Radio v-for="sub in item.valueTemplateList" :label="sub.score" :key="sub.score">
                  <span>{{sub.title}}</span>
                </Radio>
              </RadioGroup>
            </div>
            <div v-if="item.content!=null && item.content.length>0">
              <Input v-model="item.content" :value="item.content" name="content" />
            </div>
            <div v-if="item.pictureUrl!=null && item.pictureUrl.length>0">
              <upload-pic-thumb v-model="currentfile[item.id]" />
            </div>
          </div>

          <div v-else-if="item.scoreType===0 && item.questionType === 2">
            <Input v-model="item.textValue" :value="item.textValue" name="textValue" />
          </div>

          <div v-else-if="item.scoreType===1 && item.questionType === 2">
            <div>
              <RadioGroup v-model="item.score">
                <Radio v-for="sub in item.valueTemplateList" :label="sub.score" :key="sub.score">
                  <span>{{sub.title}}</span>
                </Radio>
              </RadioGroup>
            </div>
            <div v-if="item.content!=null && item.content.length>0">
              <Input v-model="item.content" :value="item.content" name="content" />
            </div>
            <div v-if="item.pictureUrl!=null && item.pictureUrl.length>0">
              <upload-pic-thumb v-model="currentfile[item.id]" />
            </div>
          </div>

          <div v-else-if="item.questionType === 6">
            <CheckboxGroup v-model="item.score">
              <Checkbox v-for="sub in item.valueTemplateList" :label="sub.score" :key="sub.score">
                <span>{{sub.title}}</span>
              </Checkbox>
            </CheckboxGroup>
          </div>

          <div v-else-if="item.questionType === 3">
            <DatePicker v-model="item.dateValue" style="display: block" type="date"></DatePicker>
          </div>

          <div v-else-if="item.pictureUrl!=null  && item.pictureUrl.length>0">
            <upload-pic-thumb v-model="currentfile[item.id]" />
          </div>

          <div style="display:none">
            <Input v-model="item.id" :value="item.id" name="id" />
          </div>
        </div>
      </Form>

      <div slot="footer">
        <Button type="text" @click="cancel">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="submitSave">提交</Button>
      </div>
    </Modal>

    <Modal :title="modalTitle" v-model="roleModalDetailVisible" :mask-closable="false" :width="500">
      <div
        v-for="(item, i) in recordDetailList"
        :key="i"
        style="border-bottom:1px dashed #aaa;padding:5px;"
      >
        <div>题目： {{item.templateTitle}}</div>
        <div v-if="item.score!=null">分数：{{item.score}}</div>
        <div v-if="item.textValue!=null && item.textValue.length>0">文本选项：{{item.textValue}}</div>
        <div v-if="item.dateValue!=null && item.dateValue.length>0">日期选项：{{item.dateValue}}</div>
        <div v-if="item.pictureUrl!=null && item.pictureUrl.length>0">
          <viewer :images="item.pictureUrl.split(',')">
            <div
              class="detailed"
              style="padding:2px;margin:2px"
              v-for="v in item.pictureUrl.split(',')"
              v-bind:key="v"
            >
              <img :src="v" style="width:100px;" />
            </div>
          </viewer>
        </div>
        <div v-if="item.content!=null && item.content.length>0">备注:{{item.content}}</div>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  addRecord,
  editRecord,
  deleteRecord,
  getRecordListData,
  getAllTypeList,
  getTaskListData,
  getCourtListData,
  getTenementListData,
  getCourtAllList,
  getRecordDetailList,
  updateRecordDetailList,
  auditRecordDetailList,
  editRecordDetailList,
  getRecordExport,
  auditRecord,
} from "@/api/index";
import util from "@/libs/util.js";
import departmentTreeChoose from "@/views/my-components/xboot/department-tree-choose";
import uploadPicThumb from "@/views/my-components/xboot/upload-pic-thumb.vue";
import { set } from "date-fns";

export default {
  name: "record-manage",
  components: {
    departmentTreeChoose,
    uploadPicThumb,
  },
  data() {
    return {
      updSrc: "",
      currentfile: {},
      file: [],
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
        description: "",
      },
      roleFormValidate: {
        name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
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
        endDate: "",
      },
      submitLoading: false,
      selectList: [],
      selectCount: 0,
      columns: [
        {
          type: "selection",
          width: 60,
          align: "center",
        },
        {
          type: "index",
          width: 60,
          align: "center",
        },

        {
          title: "ID",
          key: "id",
          width: 200,
          sortable: true,
        },
        {
          title: "账号",
          key: "createByName",
          width: 200,
          sortable: true,
        },
        {
          title: "昵称",
          key: "createByNickName",
          width: 200,
          sortable: true,
        },
        {
          title: "行政区",
          key: "departmentTreeTitle",
          width: 150,
          sortable: true,
        },
        {
          title: "小区",
          key: "courtTitle",
          width: 150,
          sortable: true,
        },
        {
          title: "分类",
          key: "typeTitle",
          minWidth: 150,
          sortable: true,
        },
        {
          title: "任务",
          key: "taskTitle",
          minWidth: 150,
          sortable: true,
        },
        {
          title: "分数",
          key: "score",
          width: 150,
          sortable: true,
        },
        {
          title: "创建时间",
          key: "createTime",
          width: 170,
          sortable: true,
          sortType: "desc",
        },
        {
          title: "操作",
          key: "action",
          align: "center",
          fixed: "right",
          width: 350,
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.detail(params.row);
                    },
                  },
                },
                "查看"
              ),
              h(
                "Button",
                {
                  props: {
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.edit(params.row);
                    },
                  },
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: {
                    size: "small",
                  },
                  style: {
                    marginRight: "5px",
                  },
                  on: {
                    click: () => {
                      this.audit(params.row);
                    },
                  },
                },
                "审核"
              ),
              h(
                "Button",
                {
                  props: {
                    type: "error",
                    size: "small",
                  },
                  on: {
                    click: () => {
                      this.remove(params.row);
                    },
                  },
                },
                "删除"
              ),
            ]);
          },
        },
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
      taskId: "",
      roleModalVisible: false,
      roleModalDetailVisible: false,
      editDepartments: [],
      courtList: [],
      tenementList: [],
      taskList: [],
      typeList: [],
      courtAllList: [],
      recordDetailList: [],
    };
  },

  methods: {
    init() {
      this.getList();
      getAllTypeList().then((res) => {
        if (res.success) {
          this.typeList = res.result;
        }
      });

      getTaskListData().then((res) => {
        if (res.success) {
          this.taskList = res.result.content;
        }
      });
      getCourtListData().then((res) => {
        if (res.success) {
          this.courtList = res.result.content;
        }
      });
      getCourtAllList().then((res) => {
        if (res.success) {
          this.courtAllList = res.result;
        }
      });
      getTenementListData().then((res) => {
        if (res.success) {
          this.tenementList = res.result.content;
        }
      });
    },

    handleSelectDepTree(v) {
      this.searchForm.departmentId = v;
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
            cursor: "pointer",
          },
          on: {
            click: () => {
              data.checked = !data.checked;
            },
          },
        },
        [
          h("span", [
            h("Icon", {
              props: {
                type: icon,
                size: "16",
              },
              style: {
                "margin-right": "8px",
                "margin-bottom": "3px",
              },
            }),
            h("span", data.title),
          ]),
        ]
      );
    },
    changeBirth(v, d) {
      this.form.birth = v;
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
      getRecordExport(this.searchForm).then((res) => {});
    },

    getList() {
      // 多条件搜索用户列表
      this.loading = true;
      getRecordListData(this.searchForm).then((res) => {
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
    submitSave() {
      this.submitLoading = true;
      //let result = "";
      let result = [];
      for (var s in this.recordDetailList) {
        var picUrl = "";
        if (this.currentfile[this.recordDetailList[s].id] != undefined) {
          picUrl = this.currentfile[this.recordDetailList[s].id].toString();
        }

        result.push({
          templateId: this.recordDetailList[s].templateId,
          score: this.recordDetailList[s].score,
          content: this.recordDetailList[s].content,
          textValue: this.recordDetailList[s].textValue,
          dateValue: this.recordDetailList[s].dateValue,
          recordDetailId: this.recordDetailList[s].id,
          pictureUrl: picUrl,
        });
      }
      let recordFormDTO = {
        taskId: this.taskId,
        jsonRecordDetails: result,
      };
      if (this.modalType == 1) {
        editRecordDetailList(recordFormDTO).then((res) => {
          this.submitLoading = false;
          if (res.success) {
            this.$Message.success("操作成功");
            this.getList();
            this.roleModalVisible = false;
          }
        });
      }
      if (this.modalType == 2) {
        auditRecordDetailList(recordFormDTO).then((res) => {
          this.submitLoading = false;
          if (res.success) {
            this.$Message.success("操作成功");
            this.getList();
            this.roleModalVisible = false;
          }
        });
      }
    },
    add() {
      this.modalType = 0;
      this.modalTitle = "添加";
      this.$refs.roleForm.resetFields();
      delete this.roleForm.id;
      this.roleModalVisible = true;
    },
    edit(v) {
      this.modalType = 1;
      this.modalTitle = "编辑";
      this.$refs.searchForm.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let roleInfo = JSON.parse(str);
      getRecordDetailList({ recordId: roleInfo.id }).then((res) => {
        if (res.success) {
          this.recordDetailList = res.result;
          for (var img in this.recordDetailList) {
            if (this.recordDetailList[img].pictureUrl != null) {
              this.currentfile[
                this.recordDetailList[img].id
              ] = this.recordDetailList[img].pictureUrl.split(",");
            }
          }
        }
      });
      this.taskId = roleInfo.taskId;
      this.roleForm = roleInfo;
      this.roleModalVisible = true;
    },

    audit(v) {
      this.modalType = 2;
      this.modalTitle = "审核";
      //   this.$refs.roleForm.resetFields();
      // 转换null为""
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = "";
        }
      }
      let str = JSON.stringify(v);
      let roleInfo = JSON.parse(str);
      this.taskId = roleInfo.taskId;
      getRecordDetailList({ recordId: roleInfo.id }).then((res) => {
        if (res.success) {
          this.recordDetailList = res.result;
        }
      });
      this.roleForm = roleInfo;
      this.roleModalVisible = true;
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
      getRecordDetailList({ recordId: roleInfo.id }).then((res) => {
        if (res.success) {
          this.recordDetailList = res.result;
        }
      });
      this.roleForm = roleInfo;
      this.roleModalDetailVisible = true;
    },
    remove(v) {
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除 " + v.title + " ?",
        loading: true,
        onOk: () => {
          deleteRecord({ ids: v.id }).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.getList();
            }
          });
        },
      });
    },

    clearSelectAll() {
      this.$refs.table.selectAll(false);
    },
    changeSelect(e) {
      this.selectList = e;
      this.selectCount = e.length;
    },
    delAll() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要删除的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认删除",
        content: "您确认要删除所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          deleteRecord({ ids: ids }).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("删除成功");
              this.clearSelectAll();
              this.getList();
            }
          });
        },
      });
    },
    auditRecord() {
      if (this.selectCount <= 0) {
        this.$Message.warning("您还未选择要审核的数据");
        return;
      }
      this.$Modal.confirm({
        title: "确认审核",
        content: "您确认要审核所选的 " + this.selectCount + " 条数据?",
        loading: true,
        onOk: () => {
          let ids = "";
          this.selectList.forEach(function (e) {
            ids += e.id + ",";
          });
          ids = ids.substring(0, ids.length - 1);
          auditRecord({ ids: ids }).then((res) => {
            this.$Modal.remove();
            if (res.success) {
              this.$Message.success("审核成功");
              this.clearSelectAll();
              this.getList();
            }
          });
        },
      });
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
      permData.forEach(function (e) {
        e.checked = select;
        if (e.children && e.children.length > 0) {
          that.selectedTreeAll(e.children, select);
        }
      });
    },
  },
  mounted() {
    this.init();
  },
};
</script>