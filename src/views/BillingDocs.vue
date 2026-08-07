<template>
  <div class="page-shell">
    <div class="query-card">
        <el-form :model="query" class="lui-form-grid" size="small" data-field-count="8">
          <el-form-item label="来源系统">
            <el-select v-model="query.sourceSystem" clearable placeholder="请选择" @change="onQuerySourceChange">
              <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="单据类型">
            <el-select v-model="query.docType" clearable placeholder="请选择" @change="onQueryDocTypeChange">
              <el-option v-for="item in queryDocTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="交易类型">
            <el-select v-model="query.tradeType" clearable placeholder="请选择" @change="onQueryTradeTypeChange">
              <el-option v-for="item in queryTradeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="计费单据状态">
            <el-select
              v-model="query.billingNodes"
              multiple
              collapse-tags
              clearable
              placeholder="请选择"
              class="lui-select-no-tag-tip"
              @change="scheduleDisableSelectTagTips"
            >
              <el-option v-for="item in billingStatusOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="收付方向">
            <el-select v-model="query.direction" clearable placeholder="请选择">
              <el-option label="应收" value="应收" />
              <el-option label="应付" value="应付" />
            </el-select>
          </el-form-item>
          <el-form-item label="业务条线">
            <el-select v-model="query.bizLine" clearable placeholder="请选择">
              <el-option label="冷链物流" value="冷链物流" />
              <el-option label="大件物流" value="大件物流" />
            </el-select>
          </el-form-item>
          <el-form-item label="按商家接入">
            <el-select v-model="query.isMerchantAccess" clearable placeholder="请选择">
              <el-option label="是" value="是" />
              <el-option label="否" value="否" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="query.status" clearable placeholder="请选择">
              <el-option label="已启用" value="已启用" />
              <el-option label="已停用" value="已停用" />
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
          <h3>计费要素管理列表</h3>
          <el-button type="primary" size="small" @click="openDrawer('create')">新建</el-button>
        </div>
        <el-table :data="filteredList" class="lui-table-fill">
          <el-table-column prop="sourceSystem" label="来源系统" min-width="110" />
          <el-table-column prop="docType" label="单据类型" min-width="100" />
          <el-table-column prop="tradeType" label="交易类型" min-width="100" />
          <el-table-column prop="direction" label="收付方向" min-width="90" />
          <el-table-column prop="billingNode" label="计费单据状态" min-width="120" />
          <el-table-column prop="bizLine" label="业务条线" min-width="100" />
          <el-table-column prop="isMerchantAccess" label="按商家接入" min-width="100" />
          <el-table-column prop="status" label="状态" min-width="90">
            <template slot-scope="{ row }">
              <el-tag :type="statusTagType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" min-width="90" />
          <el-table-column label="操作" min-width="220" fixed="right">
            <template slot-scope="{ row }">
              <el-button type="text" @click="openDrawer('view', row)">查看</el-button>
              <el-button type="text" @click="openDrawer('edit', row)">编辑</el-button>
              <el-button type="text" @click="toggleStatus(row)">{{ row.status === '已启用' ? '停用' : '启用' }}</el-button>
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
      :title="drawerTitle"
      :visible.sync="drawerVisible"
      width="800px"
      :close-on-click-modal="false"
      custom-class="lui-form-dialog lui-dialog--lg"
      append-to-body
    >
      <div class="dialog-body">
        <h3 class="section-title">基础信息</h3>
        <el-form
          v-if="drawerMode === 'view'"
          :model="form"
          class="lui-form-grid drawer-form--view"
          size="small"
        >
          <el-form-item label="来源系统" required>
            <div class="drawer-view-text">{{ form.sourceSystem || '-' }}</div>
          </el-form-item>
          <el-form-item label="单据类型" required>
            <div class="drawer-view-text">{{ form.docType || '-' }}</div>
          </el-form-item>
          <el-form-item label="交易类型" required>
            <div class="drawer-view-text">{{ form.tradeType || '-' }}</div>
          </el-form-item>
          <el-form-item label="计费单据状态" required>
            <div class="drawer-view-text">{{ (form.billingNodes || []).join('、') || '-' }}</div>
          </el-form-item>
          <el-form-item label="按商家接入" required>
            <div class="drawer-view-text">{{ form.isMerchantAccess || '-' }}</div>
          </el-form-item>
        </el-form>
        <el-form v-else :model="form" class="lui-form-grid" size="small">
          <el-form-item label="来源系统" required>
            <el-select v-model="form.sourceSystem" clearable placeholder="请选择" @change="onFormSourceChange">
              <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="单据类型" required>
            <el-select v-model="form.docType" clearable placeholder="请选择" @change="onFormDocTypeChange">
              <el-option v-for="item in formDocTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="交易类型" required>
            <el-select v-model="form.tradeType" clearable placeholder="请选择" @change="onFormTradeTypeChange">
              <el-option v-for="item in formTradeTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="计费单据状态" required>
            <el-select
              v-model="form.billingNodes"
              multiple
              collapse-tags
              clearable
              placeholder="请选择（可多选）"
              class="lui-select-no-tag-tip"
              @change="scheduleDisableSelectTagTips"
            >
              <el-option
                v-for="item in billingStatusOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="按商家接入" required>
            <el-select v-model="form.isMerchantAccess" clearable placeholder="请选择">
              <el-option label="是" value="是" />
              <el-option label="否" value="否" />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="elements-header">
          <h3 class="section-title" style="margin-bottom: 0">计费要素配置</h3>
          <el-tooltip
            placement="top"
            effect="dark"
            popper-class="elements-tip-popper"
            content="业务要素在同一配置内需唯一；保存时按「交易类型 + 计费单据状态」做外部防重。"
          >
            <i class="el-icon-question elements-tip-icon" aria-label="说明" />
          </el-tooltip>
        </div>
        <div v-if="drawerMode !== 'view'" class="batch-add">
          <el-form class="lui-form-grid lui-form-grid--cols-1 batch-add__form" size="small" @submit.native.prevent>
            <el-form-item label="批量录入" class="lui-form-grid__span-all lui-form-item--top">
              <el-input
                v-model="batchText"
                type="textarea"
                :rows="3"
                class="batch-add__textarea"
                placeholder="可从表格复制明细批量录入，最多6列（不含表头）；回车自动识别填充"
                @keydown.native.enter.exact.prevent="onBatchEnter"
              />
            </el-form-item>
          </el-form>
        </div>
        <el-table :data="pagedElements" size="small" border class="elements-table">
          <el-table-column label="业务要素" min-width="140">
            <template slot-scope="{ row }">
              <div
                v-if="drawerMode !== 'view'"
                class="element-field"
                :class="{ 'element-field--error': isElementNameDuplicate(row) || (elementSubmitAttempted && isElementRowIncomplete(row)) }"
              >
                <el-input
                  v-model="row.name"
                  size="small"
                  clearable
                  placeholder="请输入"
                  class="lui-control-block element-field__control"
                  :class="{ 'is-error': isElementNameDuplicate(row) || (elementSubmitAttempted && isElementRowIncomplete(row)) }"
                  @blur="onElementNameBlur(row)"
                />
                <p v-if="isElementNameDuplicate(row)" class="element-field__error">
                  <img class="element-field__error-icon" :src="errorHintIcon" alt="" width="14" height="14">
                  <span>内容重复</span>
                </p>
                <p v-else-if="elementSubmitAttempted && isElementRowIncomplete(row)" class="element-field__error">
                  <img class="element-field__error-icon" :src="errorHintIcon" alt="" width="14" height="14">
                  <span>请填写</span>
                </p>
              </div>
              <span v-else>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="业务要素编码" min-width="168">
            <template slot-scope="{ row }">
              <el-input
                v-if="drawerMode !== 'view'"
                v-model="row.code"
                size="small"
                placeholder="请填写"
                :class="{ 'is-error': isElementRowIncomplete(row) && elementSubmitAttempted }"
              />
              <span v-else>{{ row.code }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数据维度" min-width="110">
            <template slot-scope="{ row }">
              <el-select
                v-if="drawerMode !== 'view'"
                v-model="row.dataDimension"
                class="lui-control-block"
                size="small"
                clearable
                placeholder="请选择"
                :class="{ 'is-error': isElementRowIncomplete(row) && elementSubmitAttempted }"
              >
                <el-option label="整单" value="整单" />
                <el-option label="包裹" value="包裹" />
                <el-option label="整数" value="整数" />
              </el-select>
              <span v-else>{{ row.dataDimension || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="定价维度" width="90" align="center">
            <template slot-scope="{ row }">
              <el-checkbox v-model="row.dimension" :disabled="drawerMode === 'view'" />
            </template>
          </el-table-column>
          <el-table-column label="计费因子" width="90" align="center">
            <template slot-scope="{ row }">
              <el-checkbox v-model="row.factor" :disabled="drawerMode === 'view'" />
            </template>
          </el-table-column>
          <el-table-column label="计费条件" width="90" align="center">
            <template slot-scope="{ row }">
              <el-checkbox v-model="row.condition" :disabled="drawerMode === 'view'" />
            </template>
          </el-table-column>
          <el-table-column v-if="drawerMode !== 'view'" label="操作" width="72" align="center">
            <template slot-scope="{ $index }">
              <el-button
                type="text"
                class="element-ops__link element-ops__link--delete"
                :disabled="elements.length <= 1"
                @click="removeElement(elementAbsIndex($index))"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div
          v-if="drawerMode !== 'view'"
          ref="elementsAddRow"
          class="elements-table__add-wrap"
        >
          <div
            class="elements-table__add-row"
            @click="addElement"
          ><span class="elements-table__add-plus">+</span><span class="elements-table__add-text">新增</span></div>
        </div>
        <div class="elements-pager">
          <span class="elements-pager__total">共 {{ elements.length }} 条记录</span>
          <div v-if="elements.length > 10" class="elements-pager__control">
            <el-pagination
              layout="prev, pager, next, sizes, jumper"
              :current-page.sync="elementPage"
              :page-size.sync="elementPageSize"
              :page-sizes="[10]"
              :total="elements.length"
            />
          </div>
        </div>
      </div>
      <div v-if="drawerMode !== 'view'" slot="footer" class="dialog-footer">
        <el-button size="small" @click="drawerVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="saveDrawer">确定</el-button>
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
        <el-table-column prop="action" label="操作内容" min-width="180" />
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="logVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { BILLING_DOCS, BILLING_ELEMENTS, BILLING_LOGS } from '../mock/data'
import {
  listSourceSystems,
  listDocTypes,
  listTradeTypes,
  resolveParentsByTradeType,
  resolveSourceByDocType,
  isValidCascadePath
} from '../mock/cascade'
import { statusTagType } from '../utils/statusTag'
import { publicAsset } from '../utils/publicAsset'

const BILLING_STATUS_OPTIONS = ['揽收', '妥投', '派送', '签收', '异常', '理赔', '退回', '待入库']
const ELEMENT_NAME_CODE = {
  重量: 'WEIGHT',
  体积: 'VOLUME',
  始发省: 'START_PROV',
  始发城市: 'START_CITY',
  商家编码: 'MERCHANT_ID',
  业务单号: 'BIZ_NO'
}

function createEmptyElement() {
  return {
    name: '',
    code: '',
    dataDimension: '',
    dimension: false,
    factor: false,
    condition: false
  }
}

function createDefaultForm() {
  return {
    sourceSystem: '',
    docType: '',
    tradeType: '',
    billingNodes: [],
    isMerchantAccess: ''
  }
}

export default {
  name: 'BillingDocs',
  data() {
    return {
      billingStatusOptions: BILLING_STATUS_OPTIONS,
      query: {
        sourceSystem: '',
        docType: '',
        tradeType: '',
        billingNodes: [],
        direction: '',
        bizLine: '',
        isMerchantAccess: '',
        status: ''
      },
      list: BILLING_DOCS.map(i => ({
        ...i,
        creator: i.creator || '张**'
      })),
      applied: {},
      drawerVisible: false,
      drawerMode: 'view',
      form: createDefaultForm(),
      elements: BILLING_ELEMENTS.map(i => ({ ...i })),
      batchText: '',
      elementSubmitAttempted: false,
      elementPage: 1,
      elementPageSize: 10,
      editingId: null,
      logVisible: false,
      logs: BILLING_LOGS,
      sourceOptions: listSourceSystems()
    }
  },
  computed: {
    errorHintIcon() {
      return publicAsset('d2c-assets/icon-hint-error.svg')
    },
    drawerTitle() {
      if (this.drawerMode === 'create') return '新建单据计费要素'
      if (this.drawerMode === 'edit') return '编辑单据计费要素'
      return '查看单据计费要素'
    },
    filteredList() {
      const q = this.applied
      return this.list.filter(row => {
        if (q.sourceSystem && row.sourceSystem !== q.sourceSystem) return false
        if (q.docType && row.docType !== q.docType) return false
        if (q.tradeType && row.tradeType !== q.tradeType) return false
        if (q.direction && row.direction !== q.direction) return false
        if (q.bizLine && row.bizLine !== q.bizLine) return false
        if (q.isMerchantAccess && row.isMerchantAccess !== q.isMerchantAccess) return false
        if (q.status && row.status !== q.status) return false
        if (q.billingNodes && q.billingNodes.length) {
          const nodes = String(row.billingNode || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean)
          const hit = q.billingNodes.some(n => nodes.includes(n))
          if (!hit) return false
        }
        return true
      })
    },
    queryDocTypeOptions() {
      return listDocTypes(this.query.sourceSystem)
    },
    queryTradeTypeOptions() {
      return listTradeTypes(this.query.sourceSystem, this.query.docType)
    },
    formDocTypeOptions() {
      return listDocTypes(this.form.sourceSystem)
    },
    formTradeTypeOptions() {
      return listTradeTypes(this.form.sourceSystem, this.form.docType)
    },
    duplicateElementNames() {
      const counts = {}
      this.elements.forEach(row => {
        const name = (row.name || '').trim()
        if (!name) return
        counts[name] = (counts[name] || 0) + 1
      })
      return new Set(Object.keys(counts).filter(k => counts[k] > 1))
    },
    pagedElements() {
      const start = (this.elementPage - 1) * this.elementPageSize
      return this.elements.slice(start, start + this.elementPageSize)
    }
  },
  updated() {
    this.scheduleDisableSelectTagTips()
  },
  beforeDestroy() {
    if (this._tipDisableRaf) cancelAnimationFrame(this._tipDisableRaf)
  },
  methods: {
    statusTagType,
    scheduleDisableSelectTagTips() {
      if (this._tipDisableRaf) cancelAnimationFrame(this._tipDisableRaf)
      this._tipDisableRaf = requestAnimationFrame(() => {
        this._tipDisableRaf = null
        this.disableSelectTagTips()
      })
    },
    /** LUI 多选 Select 的 tag 默认带 dark tooltip，关闭该气泡 */
    disableSelectTagTips() {
      // 弹层 append-to-body，需在 document 上查找
      document.querySelectorAll('.lui-select-no-tag-tip .el-select__tags .el-tag').forEach(tag => {
        let vm = tag.__vue__
        while (vm) {
          if (vm.$options && vm.$options.name === 'ElTooltip') {
            vm.disabled = true
            vm.showPopper = false
            break
          }
          vm = vm.$parent
        }
      })
    },
    syncCascadeValue(target, field, options) {
      if (target[field] && !options.some(o => o.value === target[field])) {
        target[field] = ''
      }
    },
    onQuerySourceChange() {
      this.syncCascadeValue(this.query, 'docType', this.queryDocTypeOptions)
      this.syncCascadeValue(this.query, 'tradeType', this.queryTradeTypeOptions)
    },
    onQueryDocTypeChange(val) {
      if (val && !this.query.sourceSystem) {
        this.query.sourceSystem = resolveSourceByDocType(val, this.query.tradeType)
      }
      this.syncCascadeValue(this.query, 'tradeType', this.queryTradeTypeOptions)
    },
    onQueryTradeTypeChange(val) {
      if (!val) return
      const parents = resolveParentsByTradeType(val, {
        sourceSystem: this.query.sourceSystem,
        docType: this.query.docType
      })
      if (parents.sourceSystem) this.query.sourceSystem = parents.sourceSystem
      if (parents.docType) this.query.docType = parents.docType
    },
    onFormSourceChange() {
      this.syncCascadeValue(this.form, 'docType', this.formDocTypeOptions)
      this.syncCascadeValue(this.form, 'tradeType', this.formTradeTypeOptions)
    },
    onFormDocTypeChange(val) {
      if (val && !this.form.sourceSystem) {
        this.form.sourceSystem = resolveSourceByDocType(val, this.form.tradeType)
      }
      this.syncCascadeValue(this.form, 'tradeType', this.formTradeTypeOptions)
    },
    onFormTradeTypeChange(val) {
      if (!val) return
      const parents = resolveParentsByTradeType(val, {
        sourceSystem: this.form.sourceSystem,
        docType: this.form.docType
      })
      if (parents.sourceSystem) this.form.sourceSystem = parents.sourceSystem
      if (parents.docType) this.form.docType = parents.docType
    },
    resetQuery() {
      this.query = {
        sourceSystem: '',
        docType: '',
        tradeType: '',
        billingNodes: [],
        direction: '',
        bizLine: '',
        isMerchantAccess: '',
        status: ''
      }
      this.applied = {}
    },
    handleSearch() {
      this.applied = {
        ...this.query,
        billingNodes: (this.query.billingNodes || []).slice()
      }
    },
    openDrawer(mode, row) {
      this.drawerMode = mode
      this.batchText = ''
      this.elementPage = 1
      this.elementSubmitAttempted = false
      this.editingId = row && row.id ? row.id : null
      if (row) {
        this.form = {
          sourceSystem: row.sourceSystem,
          docType: row.docType,
          tradeType: row.tradeType,
          billingNodes: String(row.billingNode || '')
            .split(/[,，、]/)
            .map(s => s.trim())
            .filter(Boolean),
          isMerchantAccess: row.isMerchantAccess || ''
        }
        this.elements = (row.elements && row.elements.length)
          ? row.elements.map(i => ({ ...i }))
          : BILLING_ELEMENTS.map(i => ({ ...i }))
      } else {
        this.form = createDefaultForm()
        this.elements = [createEmptyElement()]
      }
      this.logVisible = false
      this.drawerVisible = true
    },
    openLog() {
      this.drawerVisible = false
      this.logVisible = true
    },
    onElementNameBlur(row) {
      const name = (row.name || '').trim()
      if (ELEMENT_NAME_CODE[name] && !(row.code || '').trim()) {
        row.code = ELEMENT_NAME_CODE[name]
      }
    },
    isElementRowIncomplete(row) {
      return !(row.name || '').trim() || !(row.code || '').trim() || !(row.dataDimension || '').trim()
    },
    isElementNameDuplicate(row) {
      const name = (row.name || '').trim()
      return Boolean(name && this.duplicateElementNames.has(name))
    },
    elementAbsIndex(pageIndex) {
      return (this.elementPage - 1) * this.elementPageSize + pageIndex
    },
    ensureElementPageInRange() {
      const maxPage = Math.max(1, Math.ceil(this.elements.length / this.elementPageSize) || 1)
      if (this.elementPage > maxPage) this.elementPage = maxPage
    },
    addElement() {
      this.elements.push(createEmptyElement())
      this.elementPage = Math.ceil(this.elements.length / this.elementPageSize) || 1
      this.$nextTick(() => {
        const addWrap = this.$refs.elementsAddRow
        if (addWrap && addWrap.scrollIntoView) {
          addWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
        const tableBody = this.$el.querySelector('.elements-table .el-table__body-wrapper')
        if (tableBody) {
          tableBody.scrollTop = tableBody.scrollHeight
        }
      })
    },
    removeElement(index) {
      if (this.elements.length <= 1) {
        this.$message.warning('至少保留一行计费要素')
        return
      }
      this.elements.splice(index, 1)
      this.ensureElementPageInRange()
    },
    parseBoolCell(value) {
      const text = String(value == null ? '' : value).trim().toLowerCase()
      if (!text) return false
      return ['1', 'true', '是', 'y', 'yes', '√', '勾'].includes(text)
    },
    onBatchEnter() {
      if (!(this.batchText || '').trim()) return
      this.applyBatchAdd()
    },
    applyBatchAdd() {
      const raw = (this.batchText || '').trim()
      if (!raw) {
        this.$message.warning('请先粘贴要批量添加的明细')
        return
      }
      const lines = raw.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
      const added = []
      lines.forEach(line => {
        const cols = line.split(/\t|,|，/).map(s => s.trim()).slice(0, 6)
        if (!cols.length || cols.every(c => !c)) return
        const row = createEmptyElement()
        row.name = cols[0] || ''
        row.code = cols[1] || ELEMENT_NAME_CODE[row.name] || ''
        row.dataDimension = cols[2] || ''
        if (cols[3] !== undefined && cols[3] !== '') row.dimension = this.parseBoolCell(cols[3])
        if (cols[4] !== undefined && cols[4] !== '') row.factor = this.parseBoolCell(cols[4])
        if (cols[5] !== undefined && cols[5] !== '') row.condition = this.parseBoolCell(cols[5])
        added.push(row)
      })
      if (!added.length) {
        this.$message.warning('未解析到有效明细，请检查粘贴内容')
        return
      }
      const onlyEmpty = this.elements.length === 1 && !this.elements[0].name && !this.elements[0].code
      this.elements = onlyEmpty ? added : this.elements.concat(added)
      this.batchText = ''
      this.elementPage = Math.ceil(this.elements.length / this.elementPageSize) || 1
      this.$message.success(`已批量添加 ${added.length} 条`)
    },
    saveDrawer() {
      if (!isValidCascadePath(this.form.sourceSystem, this.form.docType, this.form.tradeType)) {
        this.$message.warning('请选择完整的来源系统 / 单据类型 / 交易类型级联路径')
        return
      }
      if (!this.form.billingNodes || !this.form.billingNodes.length) {
        this.$message.warning('请选择计费单据状态')
        return
      }
      if (!this.form.isMerchantAccess) {
        this.$message.warning('请选择按商家接入')
        return
      }
      const statusKey = this.form.billingNodes.slice().sort().join(',')
      const dup = this.list.find(row => {
        if (this.drawerMode === 'edit' && row.id === this.editingId) return false
        const rowKey = String(row.billingNode || '')
          .split(/[,，、]/)
          .map(s => s.trim())
          .filter(Boolean)
          .sort()
          .join(',')
        return row.tradeType === this.form.tradeType && rowKey === statusKey
      })
      if (dup) {
        this.$message.warning('交易类型 + 计费单据状态已存在，请勿重复配置')
        return
      }
      if (this.duplicateElementNames.size) {
        this.$message.warning('业务要素存在重复，请修改后再保存')
        return
      }
      this.elementSubmitAttempted = true
      const incompleteIdx = this.elements.findIndex(row => this.isElementRowIncomplete(row))
      if (incompleteIdx >= 0) {
        this.elementPage = Math.floor(incompleteIdx / this.elementPageSize) + 1
        this.$message.warning('存在未填写的业务要素，请填写完整或删除后再提交')
        return
      }
      const payload = {
        sourceSystem: this.form.sourceSystem,
        docType: this.form.docType,
        tradeType: this.form.tradeType,
        billingNode: this.form.billingNodes.join(','),
        direction: '应收',
        bizLine: '冷链物流',
        isMerchantAccess: this.form.isMerchantAccess,
        creator: '张**',
        elements: this.elements.map(item => ({ ...item }))
      }
      if (this.drawerMode === 'create') {
        this.list.unshift({
          id: `DOC${Date.now()}`,
          status: '已启用',
          ...payload
        })
        this.$message.success('新建成功')
      } else if (this.drawerMode === 'edit' && this.editingId) {
        const idx = this.list.findIndex(row => row.id === this.editingId)
        if (idx >= 0) {
          this.$set(this.list, idx, {
            ...this.list[idx],
            ...payload
          })
        }
        this.$message.success('保存成功')
      } else {
        this.$message.success('已保存（预览态）')
      }
      this.drawerVisible = false
    },
    toggleStatus(row) {
      const next = row.status === '已启用' ? '停用' : '启用'
      const title = next === '启用' ? '启用确认' : '停用确认'
      this.$confirm(`确认${next}该计费单据？`, title, {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        row.status = row.status === '已启用' ? '已停用' : '已启用'
        this.$message.success(`已${next}`)
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.dialog-body {
  padding: 0;
}
.drawer-view-text {
  box-sizing: border-box;
  width: 100%;
  min-height: 32px;
  padding: 5px 12px;
  border: 1px solid #e4e5e9;
  border-radius: 8px;
  background: #f5f5f6;
  color: #868d9f;
  font-size: 14px;
  line-height: 22px;
  cursor: default;
  user-select: text;
}
.elements-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 12px;
}
.elements-tip-icon {
  color: #868d9f;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.elements-tip-icon:hover {
  color: #525765;
}
.batch-add {
  margin-bottom: 12px;
}
.batch-add__form.lui-form-grid {
  grid-template-columns: 1fr !important;
  --lui-form-row-gap: 16px;
}
.batch-add__textarea {
  width: 100%;
}
/* 与上方筛选项同一套描边：常态 #E4E5E9 / hover 主色 10% / focus 主色 */
.batch-add__textarea >>> .el-textarea__inner {
  min-height: 80px;
  border-radius: 8px;
  border-color: #e4e5e9 !important;
  font-size: 14px;
  line-height: 22px;
  color: #23252b;
  resize: vertical;
}
.batch-add__textarea >>> .el-textarea__inner:hover {
  border-color: rgba(60, 110, 240, 0.1) !important;
}
.batch-add__textarea >>> .el-textarea__inner:focus {
  border-color: #3c6ef0 !important;
}
.batch-add__textarea >>> .el-textarea__inner::placeholder {
  color: #babec7;
}
.elements-table {
  width: 100%;
  font-size: 14px;
}
.elements-table >>> .el-table__header th.el-table__cell {
  font-size: 14px;
  font-weight: 400 !important;
  color: #525765 !important;
  line-height: 16px;
}
.elements-table >>> .el-table__header th.el-table__cell .cell {
  line-height: 16px;
  font-weight: 400;
  color: #525765;
}
.elements-table >>> .el-table__body .cell {
  line-height: 16px;
  font-size: 14px;
  overflow: visible !important;
  position: relative;
}
.elements-table >>> .el-table__body td.el-table__cell {
  font-size: 14px;
  vertical-align: middle;
  height: 52px !important;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  overflow: visible !important;
}
.elements-table >>> .el-table__body tr {
  height: 52px !important;
}
.elements-table >>> .el-checkbox {
  height: 32px;
  display: inline-flex;
  align-items: center;
}
.elements-table >>> .el-input__inner,
.elements-table >>> .el-select .el-input__inner {
  font-size: 14px !important;
  height: 32px !important;
  line-height: 32px !important;
}
.elements-table >>> .el-input--small .el-input__inner,
.elements-table >>> .el-select .el-input--small .el-input__inner {
  font-size: 14px !important;
}
.element-field {
  position: relative;
  width: 100%;
  min-width: 0;
  height: 32px;
}
.element-field__control {
  width: 100%;
}
/* 重复项全部标红，压过全局 focus/hover 蓝边 */
.element-field--error >>> .el-input__inner,
.element-field--error >>> .el-input.is-focus .el-input__inner,
.element-field--error >>> .el-input__inner:hover,
.element-field--error >>> .el-input__inner:focus,
.elements-table >>> .el-select.is-error .el-input__inner,
.elements-table >>> .el-select.is-error .el-input.is-focus .el-input__inner,
.elements-table >>> .el-select.is-error:hover .el-input:not(.is-disabled) .el-input__inner,
.elements-table >>> .el-input.is-error .el-input__inner,
.elements-table >>> .element-field__control.is-error .el-input__inner {
  border-color: var(--lui-danger, #fc3737) !important;
  background-color: var(--lui-danger-bg, rgba(252, 55, 55, 0.1)) !important;
  box-shadow: none !important;
}
/* 红字原地叠在框下，不撑高行 */
.element-field__error {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  left: 0;
  top: 100%;
  margin: 2px 0 0;
  padding: 0;
  color: var(--lui-danger, #fc3737);
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  z-index: 3;
  pointer-events: none;
}
.element-field__error-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  object-fit: contain;
}
.element-ops__link.el-button--text {
  padding: 0;
  height: 32px;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  line-height: 22px;
}
.elements-table .element-ops__link--delete.el-button--text {
  color: #868d9f !important;
}
.elements-table .element-ops__link--delete.el-button--text:hover,
.elements-table .element-ops__link--delete.el-button--text:focus {
  color: #525765 !important;
}
.elements-table .element-ops__link--delete.el-button--text.is-disabled,
.elements-table .element-ops__link--delete.el-button--text.is-disabled:hover {
  color: #babec7 !important;
}
.element-ops__link--add.el-button--text {
  color: #3c6ef0;
}
.elements-table__add-wrap {
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e5e9;
}
/* 样式以 global.css 为准，避免 scoped 覆盖冲突 */
.elements-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}
.elements-pager__total {
  flex-shrink: 0;
  font-size: 14px;
  line-height: 28px;
}
.elements-pager__control {
  margin-left: auto;
  display: flex;
  align-items: center;
}
.elements-pager__control >>> .el-pagination {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 0;
  height: 28px;
  font-weight: 400;
}
.elements-pager__control >>> .el-pagination .btn-prev,
.elements-pager__control >>> .el-pagination .btn-next,
.elements-pager__control >>> .el-pager li {
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  line-height: 26px !important;
  margin: 0 4px !important;
  padding: 0 !important;
  font-size: 14px !important;
  box-sizing: border-box !important;
  border: 1px solid #d9d9d9 !important;
  border-radius: 8px !important;
  background: #fff !important;
  color: #525765 !important;
}
.elements-pager__control >>> .el-pager li.active {
  background: #3c6ef0 !important;
  border-color: #3c6ef0 !important;
  color: #fff !important;
}
.elements-pager__control >>> .el-pager li:hover {
  color: #3c6ef0 !important;
}
.elements-pager__control >>> .el-pager li.active:hover {
  color: #fff !important;
}
.elements-pager__control >>> .el-pagination .btn-prev .el-icon,
.elements-pager__control >>> .el-pagination .btn-next .el-icon {
  font-size: 12px;
  line-height: 26px;
}
.elements-pager__control >>> .el-pagination__sizes {
  height: 28px !important;
  margin: 0 0 0 8px !important;
  line-height: 28px !important;
}
.elements-pager__control >>> .el-pagination .el-select {
  height: 28px !important;
}
.elements-pager__control >>> .el-pagination .el-select .el-input {
  width: 110px;
  height: 28px !important;
}
.elements-pager__control >>> .el-pagination .el-select .el-input__inner {
  height: 28px !important;
  line-height: 26px !important;
  font-size: 14px !important;
  padding: 0 24px 0 8px !important;
  border-radius: 8px !important;
  border: 1px solid #d9d9d9 !important;
  box-sizing: border-box !important;
  color: #23252b !important;
}
.elements-pager__control >>> .el-pagination .el-input__suffix {
  right: 4px;
  height: 28px !important;
  line-height: 28px !important;
  display: flex;
  align-items: center;
}
.elements-pager__control >>> .el-pagination .el-select .el-input .el-select__caret {
  line-height: 28px !important;
  font-size: 12px;
  color: #868d9f;
  position: relative;
  top: 1px; /* 图7：下箭头下移 1px */
}
.elements-pager__control >>> .el-pagination__jump {
  margin-left: 8px !important;
  height: 28px !important;
  line-height: 28px !important;
  font-size: 14px;
  color: #525765;
}
.elements-pager__control >>> .el-pagination__jump .el-input {
  width: 48px;
  margin: 0 4px;
  height: 28px !important;
}
.elements-pager__control >>> .el-pagination__jump .el-input__inner {
  height: 28px !important;
  line-height: 26px !important;
  padding: 0 4px !important;
  border-radius: 8px !important;
  border: 1px solid #d9d9d9 !important;
  box-sizing: border-box !important;
  text-align: center;
  font-size: 14px;
}
</style>

<style>
/* tooltip 挂载在 body，需非 scoped */
.elements-tip-popper {
  max-width: 360px;
  padding: 8px 12px !important;
  background: rgba(0, 0, 0, 0.9) !important;
  border: none !important;
  color: #fff !important;
  font-size: 12px;
  line-height: 18px;
  border-radius: 4px !important;
}
.elements-tip-popper[x-placement^='top'] .popper__arrow {
  border-top-color: rgba(0, 0, 0, 0.9) !important;
}
.elements-tip-popper[x-placement^='top'] .popper__arrow::after {
  border-top-color: rgba(0, 0, 0, 0.9) !important;
}
.elements-tip-popper[x-placement^='bottom'] .popper__arrow {
  border-bottom-color: rgba(0, 0, 0, 0.9) !important;
}
.elements-tip-popper[x-placement^='bottom'] .popper__arrow::after {
  border-bottom-color: rgba(0, 0, 0, 0.9) !important;
}
</style>
