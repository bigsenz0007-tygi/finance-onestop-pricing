<template>
  <el-dialog
    title="地址配置"
    :visible.sync="dialogVisible"
    width="800px"
    custom-class="lui-form-dialog lui-dialog--lg address-combo-dialog"
    append-to-body
    :close-on-click-modal="false"
    @open="onOpen"
  >
    <div class="combo-form">
      <div class="combo-form__row">
        <label class="combo-form__label">始发地</label>
        <div class="combo-form__field" :class="{ 'is-error': fieldErrors.from }">
          <AddressSearchMultiSelect
            v-model="draftFrom"
            placeholder="请输入省份/城市/县区进行搜索，用逗号分隔，上限300；也可点击下拉选择地址"
            :error="!!fieldErrors.from"
            @change="clearFieldError('from')"
          />
          <p v-if="fieldErrors.from" class="combo-form__error">{{ fieldErrors.from }}</p>
        </div>
      </div>
      <div class="combo-form__row">
        <label class="combo-form__label">目的地</label>
        <div class="combo-form__field" :class="{ 'is-error': fieldErrors.to }">
          <AddressSearchMultiSelect
            v-model="draftTo"
            placeholder="请输入省份/城市/县区进行搜索，用逗号分隔，上限300；也可点击下拉选择地址"
            :error="!!fieldErrors.to"
            @change="clearFieldError('to')"
          />
          <p v-if="fieldErrors.to" class="combo-form__error">{{ fieldErrors.to }}</p>
        </div>
      </div>
      <div class="combo-form__actions">
        <el-button type="primary" size="small" @click="addRoute">添加</el-button>
      </div>
    </div>

    <el-table :data="routes" class="combo-table" max-height="280">
      <el-table-column label="始发地" min-width="100">
        <template slot-scope="{ row }">
          <span class="combo-table__cell">{{ formatLine(row.fromAddress) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="目的地" min-width="100">
        <template slot-scope="{ row }">
          <span class="combo-table__cell">{{ formatLine(row.toAddress) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="96" align="left" header-align="left">
        <template slot-scope="{ $index }">
          <el-button type="text" class="combo-table__del" @click="removeRoute($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" size="small" @click="confirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import AddressSearchMultiSelect from './AddressSearchMultiSelect.vue'

function joinBySemicolon(list) {
  return (list || []).filter(Boolean).join('; ')
}

export default {
  name: 'AddressComboModal',
  components: { AddressSearchMultiSelect },
  props: {
    visible: { type: Boolean, default: false },
    value: { type: Array, default: () => [] }
  },
  data() {
    return {
      routes: [],
      draftFrom: [],
      draftTo: [],
      fieldErrors: {
        from: '',
        to: ''
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(v) {
        this.$emit('update:visible', v)
      }
    }
  },
  methods: {
    formatLine(list) {
      if (!list || !list.length) return '-'
      return joinBySemicolon(list)
    },
    clearFieldError(key) {
      if (this.fieldErrors[key]) this.fieldErrors[key] = ''
    },
    onOpen() {
      const src = Array.isArray(this.value) ? this.value : []
      this.routes = src.map((r, i) => ({
        id: r.id || `r-${Date.now()}-${i}`,
        fromAddress: (r.fromAddress || []).slice(),
        toAddress: (r.toAddress || []).slice()
      }))
      this.draftFrom = []
      this.draftTo = []
      this.fieldErrors = { from: '', to: '' }
    },
    addRoute() {
      const fromAddress = (this.draftFrom || []).filter(Boolean)
      const toAddress = (this.draftTo || []).filter(Boolean)
      const errors = { from: '', to: '' }
      if (!fromAddress.length) errors.from = '请选择始发地'
      if (!toAddress.length) errors.to = '请选择目的地'
      this.fieldErrors = errors
      if (errors.from || errors.to) return

      this.routes.push({
        id: `r-${Date.now()}`,
        fromAddress,
        toAddress
      })
      this.draftFrom = []
      this.draftTo = []
      this.fieldErrors = { from: '', to: '' }
    },
    removeRoute(index) {
      this.routes.splice(index, 1)
    },
    confirm() {
      this.$emit(
        'confirm',
        this.routes.map(r => ({
          id: r.id,
          fromAddress: (r.fromAddress || []).slice(),
          toAddress: (r.toAddress || []).slice()
        }))
      )
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.combo-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.combo-form__row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 0;
  position: relative;
}
.combo-form__label {
  flex: 0 0 56px;
  margin-top: 5px;
  color: #525765;
  font-size: 14px;
  line-height: 22px;
  text-align: right;
  white-space: nowrap;
}
.combo-form__field {
  flex: 1 1 auto;
  min-width: 0;
  position: relative;
}
.combo-form__error {
  margin: 4px 0 0;
  color: #f53f3f;
  font-size: 12px;
  line-height: 18px;
}
.combo-form__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0;
}
.combo-table {
  width: 100%;
}
.combo-table__cell {
  display: block;
  word-break: break-all;
  white-space: normal;
  line-height: 22px;
}
.combo-table__del {
  color: #3c6ef0 !important;
  padding: 0;
  vertical-align: middle;
  line-height: 22px;
  height: 22px;
}
.combo-table >>> .el-table__header th:last-child .cell,
.combo-table >>> .el-table__body td:last-child .cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
}
</style>

<style>
/* 图1：最小 600 / 最大 800，内容自适应，垂直居中，底栏贴底 */
.el-dialog__wrapper:has(.address-combo-dialog) {
  display: flex;
  align-items: center;
  justify-content: center;
}
.address-combo-dialog.el-dialog {
  min-height: 600px;
  max-height: 800px;
  height: auto;
  margin: 0 !important;
  display: flex;
  flex-direction: column;
  border-radius: 8px !important;
  overflow: hidden;
  border: none;
  box-shadow: 0 8px 24px rgba(35, 37, 43, 0.12) !important;
}
.address-combo-dialog .el-dialog__header {
  flex: 0 0 auto;
}
.address-combo-dialog .el-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  max-height: none;
}
.address-combo-dialog .el-dialog__footer {
  flex: 0 0 auto;
  margin-top: auto;
}
</style>
