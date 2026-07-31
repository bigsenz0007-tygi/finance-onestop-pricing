<template>
  <div class="page-shell">
    <div class="query-card">
      <el-form :model="query" size="small" class="lui-form-grid" data-field-count="4">
        <el-form-item label="业务场景">
          <el-input v-model="query.keyword" placeholder="业务场景编码或名称" clearable />
        </el-form-item>
        <el-form-item label="定价方式">
          <el-select v-model="query.billingType" clearable placeholder="请选择">
            <el-option label="产品定价" value="产品定价" />
            <el-option label="业务场景定价" value="业务场景定价" />
          </el-select>
        </el-form-item>
        <el-form-item label="收付方向">
          <el-select v-model="query.direction" clearable placeholder="请选择">
            <el-option label="应收" value="应收" />
            <el-option label="应付" value="应付" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="请选择">
            <el-option label="启用" value="启用" />
            <el-option label="停用" value="停用" />
          </el-select>
        </el-form-item>
        <div class="query-actions">
          <el-button size="small" @click="resetQuery">重置</el-button>
          <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
        </div>
      </el-form>
    </div>

    <div class="table-card">
      <div class="table-toolbar">
        <h3>业务场景档案</h3>
        <el-button type="primary" size="small" @click="openCreate">新建</el-button>
      </div>
      <el-table :data="filteredList">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="code" label="业务场景编码" min-width="120" />
        <el-table-column prop="name" label="业务场景名称" min-width="140" />
        <el-table-column prop="billingTarget" label="计费对象" min-width="90" />
        <el-table-column prop="billingType" label="定价方式" min-width="120" />
        <el-table-column prop="direction" label="收付方向" min-width="90" />
        <el-table-column prop="status" label="状态" min-width="90">
          <template slot-scope="{ row }">
            <el-tag size="small" :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" min-width="80" />
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column prop="remark" label="备注" min-width="80" />
        <el-table-column label="操作" min-width="220" fixed="right">
          <template slot-scope="{ row }">
            <template v-if="row.status === '停用'">
              <el-button type="text" @click="enableRow(row)">启用</el-button>
              <el-button type="text" @click="openEdit(row)">修改</el-button>
            </template>
            <template v-else>
              <el-button type="text" @click="disableRow(row)">停用</el-button>
              <el-button type="text" @click="openEdit(row)">修改</el-button>
            </template>
            <el-button type="text" @click="openLog">日志</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <span>共 {{ filteredList.length }} 条</span>
        <el-pagination
          layout="prev, pager, next, sizes, jumper"
          :total="filteredList.length"
          :page-size="10"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>

    <el-dialog
      :title="isEdit ? '业务场景管理-编辑' : '业务场景管理-新建'"
      :visible.sync="dialogVisible"
      width="640px"
      :close-on-click-modal="false"
      custom-class="lui-form-dialog lui-dialog--md"
      append-to-body
    >
      <el-form ref="form" :model="form" :rules="rules" class="lui-form-grid" size="small">
        <el-form-item label="业务场景编码" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="业务场景名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="计费对象" prop="billingTarget">
          <el-select v-model="form.billingTarget" clearable placeholder="请选择">
            <el-option label="账单" value="账单" />
            <el-option label="整单" value="整单" />
            <el-option label="明细" value="明细" />
          </el-select>
        </el-form-item>
        <el-form-item label="定价方式" prop="billingType">
          <el-select v-model="form.billingType" clearable placeholder="请选择">
            <el-option label="产品定价" value="产品定价" />
            <el-option label="业务场景定价" value="业务场景定价" />
          </el-select>
        </el-form-item>
        <el-form-item label="收付方向" prop="direction">
          <el-select v-model="form.direction" clearable placeholder="请选择">
            <el-option label="应收" value="应收" />
            <el-option label="应付" value="应付" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" class="lui-form-grid__span-all lui-form-item--top">
          <el-input v-model="form.remark" type="textarea" :rows="2" clearable placeholder="请输入" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="save">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="日志"
      :visible.sync="logVisible"
      width="640px"
      custom-class="lui-form-dialog lui-dialog--md"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-table :data="logs">
        <el-table-column prop="time" label="操作时间" min-width="160" />
        <el-table-column prop="operator" label="操作人" min-width="100" />
        <el-table-column prop="action" label="操作内容" min-width="160" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="logVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { SCENARIOS } from '../mock/data'
import { statusTagType } from '../utils/statusTag'

function createDefaultForm() {
  return {
    code: '',
    name: '',
    billingTarget: '',
    direction: '',
    billingType: '',
    status: '启用',
    remark: ''
  }
}

export default {
  name: 'PricingCapability',
  data() {
    return {
      query: { keyword: '', billingType: '', direction: '', status: '' },
      applied: {},
      list: SCENARIOS.map(i => ({ ...i })),
      dialogVisible: false,
      isEdit: false,
      form: createDefaultForm(),
      rules: {
        code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
        name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        billingTarget: [{ required: true, message: '请选择', trigger: 'change' }],
        direction: [{ required: true, message: '请选择', trigger: 'change' }],
        billingType: [{ required: true, message: '请选择', trigger: 'change' }]
      },
      logVisible: false,
      logs: [
        { time: '2023-10-10 10:00:00', operator: '张三', action: '修改了计费对象' },
        { time: '2023-10-01 12:00:00', operator: '李四', action: '新建了该数据' }
      ]
    }
  },
  computed: {
    filteredList() {
      const q = this.applied
      return this.list.filter(row => {
        const kw = !q.keyword || row.code.includes(q.keyword) || row.name.includes(q.keyword)
        return kw
          && (!q.billingType || row.billingType === q.billingType)
          && (!q.direction || row.direction === q.direction)
          && (!q.status || row.status === q.status)
      })
    }
  },
  methods: {
    statusTagType,
    resetQuery() {
      this.query = { keyword: '', billingType: '', direction: '', status: '' }
      this.applied = {}
    },
    handleSearch() {
      this.applied = { ...this.query }
    },
    openCreate() {
      this.isEdit = false
      this.form = createDefaultForm()
      this.logVisible = false
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form && this.$refs.form.clearValidate())
    },
    openEdit(row) {
      this.isEdit = true
      this.form = {
        ...row,
        status: row.status === '停用' ? '停用' : '启用',
        remark: row.remark === '-' ? '' : (row.remark || '')
      }
      this.logVisible = false
      this.dialogVisible = true
    },
    openLog() {
      this.dialogVisible = false
      this.logVisible = true
    },
    save() {
      this.$refs.form.validate(valid => {
        if (!valid) return
        if (!this.isEdit && this.list.some(i => i.code === this.form.code)) {
          this.$message.warning('业务场景编码已存在，请勿重复')
          return
        }
        if (this.list.some(i => i.name === this.form.name && (!this.isEdit || i.code !== this.form.code))) {
          this.$message.warning('业务场景名称已存在，请勿重复')
          return
        }
        // 保存后直接启用（去掉初始化态）
        const nextStatus = '启用'
        if (this.isEdit) {
          const idx = this.list.findIndex(i => i.code === this.form.code)
          if (idx > -1) {
            this.$set(this.list, idx, {
              ...this.list[idx],
              name: this.form.name,
              billingTarget: this.form.billingTarget,
              direction: this.form.direction,
              billingType: this.form.billingType,
              remark: this.form.remark || '-',
              status: nextStatus
            })
          }
        } else {
          this.list.unshift({
            code: this.form.code,
            name: this.form.name,
            billingTarget: this.form.billingTarget,
            direction: this.form.direction,
            billingType: this.form.billingType,
            remark: this.form.remark || '-',
            status: nextStatus,
            creator: '当前用户',
            createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
          })
        }
        this.$message.success('已保存并启用')
        this.dialogVisible = false
      })
    },
    enableRow(row) {
      this.$confirm('确认启用该业务场景？', '启用确认', { type: 'warning' })
        .then(() => {
          row.status = '启用'
          this.$message.success('已启用')
        })
        .catch(() => {})
    },
    disableRow(row) {
      this.$confirm('确认停用该业务场景？', '停用确认', { type: 'warning' })
        .then(() => {
          row.status = '停用'
          this.$message.success('已停用')
        })
        .catch(() => {})
    },
    removeRow(row) {
      this.$confirm('确认删除该业务场景？删除后不可恢复。', '二次确认', { type: 'warning' })
        .then(() => {
          this.list = this.list.filter(i => i.code !== row.code)
          this.$message.success('已删除')
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
/* 备注多行框：左右 padding 与上方 input/select（10px）一致，使「请输入」与上方内容左缘对齐 */
.lui-form-grid >>> .el-form-item.lui-form-item--top {
  align-items: flex-start;
}
.lui-form-grid >>> .el-form-item.lui-form-item--top .el-form-item__content {
  line-height: normal;
}
.lui-form-grid >>> .el-textarea__inner {
  padding-left: 10px;
  padding-right: 10px;
}
</style>

