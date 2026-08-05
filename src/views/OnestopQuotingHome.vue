<template>
  <div class="page-shell">
    <div class="query-card">
      <el-form :model="query" class="lui-form-grid" size="small" data-field-count="9">
        <el-form-item label="报价方案">
          <el-input v-model="query.name" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="方案编码">
          <el-input v-model="query.schemeCode" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="商家编码">
          <el-input v-model="query.merchantCode" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="业务场景">
          <el-select v-model="query.businessScenario" clearable filterable placeholder="请选择">
            <el-option v-for="s in scenarioOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品类型">
          <el-select v-model="query.productType" clearable filterable placeholder="请选择">
            <el-option v-for="p in productTypeOptions" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="计费策略">
          <el-select v-model="query.strategy" clearable placeholder="请选择">
            <el-option label="普通" value="普通" />
            <el-option label="统计考核" value="统计考核" />
            <el-option label="合单计费" value="合单计费" />
            <el-option label="统计+合单" value="统计+合单" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="请选择">
            <el-option label="草稿" value="草稿" />
            <el-option label="已启用" value="已启用" />
            <el-option label="已停用" value="已停用" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建人">
          <el-input v-model="query.creator" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="创建时间" class="lui-form-item--range">
          <el-date-picker
            v-model="query.range"
            type="daterange"
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            range-separator="至"
          />
        </el-form-item>
        <div class="query-actions">
          <el-button size="small" @click="resetQuery">重置</el-button>
          <el-button type="primary" size="small" @click="handleSearch">查询</el-button>
        </div>
      </el-form>
    </div>

    <div class="table-card">
      <div class="table-toolbar">
        <h3>一站报价列表</h3>
        <el-button type="primary" size="small" @click="$emit('create')">新建</el-button>
      </div>
      <el-table :data="pagedList" class="lui-table-fill quoting-list-table">
        <el-table-column prop="name" label="报价方案名称" min-width="160" />
        <el-table-column prop="schemeCode" label="方案编码" min-width="140" />
        <el-table-column prop="merchantCode" label="商家编码" min-width="140" />
        <el-table-column prop="merchantName" label="商家名称" min-width="140">
          <template slot-scope="{ row }">
            <el-tooltip
              :disabled="!needEllipsis(row.merchantName)"
              placement="top"
              effect="dark"
              :content="String(row.merchantName || '')"
            >
              <span class="cell-ellipsis">{{ displayText(row.merchantName) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="businessScenario" label="业务场景" min-width="120" />
        <el-table-column prop="productType" label="产品类型" min-width="120" />
        <el-table-column prop="strategy" label="计费策略" min-width="110" />
        <el-table-column prop="status" label="状态" min-width="90">
          <template slot-scope="{ row }">
            <el-tag size="small" :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" min-width="80" />
        <el-table-column prop="createdAt" label="创建时间" min-width="168" />
        <el-table-column label="操作" min-width="200" fixed="right">
          <template slot-scope="{ row }">
            <el-button type="text" @click="$emit('open', row, 'view')">查看</el-button>
            <el-button type="text" @click="$emit('open', row, 'edit')">编辑</el-button>
            <el-button type="text" @click="toggleStatus(row)">{{ row.status === '已启用' ? '停用' : '启用' }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <span>共 {{ filteredList.length }} 条</span>
        <el-pagination
          layout="prev, pager, next, sizes, jumper"
          :total="filteredList.length"
          :current-page.sync="page"
          :page-size.sync="pageSize"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>
  </div>
</template>

<script>
const ELLIPSIS_LIMIT = 16

const emptyQuery = () => ({
  name: '',
  schemeCode: '',
  merchantCode: '',
  businessScenario: '',
  productType: '',
  strategy: '',
  status: '',
  creator: '',
  range: []
})

export default {
  name: 'OnestopQuotingHome',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      query: emptyQuery(),
      applied: {},
      page: 1,
      pageSize: 10,
      scenarioOptions: ['大件特配', '普通重货', '标准运输', '生鲜特配', '大促活动', '同城特快', '跨省加急', '逆向退换货'],
      productTypeOptions: ['重货标快', '京东标快', '京东特快']
    }
  },
  computed: {
    filteredList() {
      const q = this.applied
      return (this.list || []).filter(row => {
        const createdDay = String(row.createdAt || '').slice(0, 10)
        const inRange = !q.range || !q.range.length
          || (createdDay >= q.range[0] && createdDay <= q.range[1])
        return (!q.name || String(row.name || '').includes(q.name))
          && (!q.schemeCode || String(row.schemeCode || '').includes(q.schemeCode))
          && (!q.merchantCode || String(row.merchantCode || '').includes(q.merchantCode))
          && (!q.businessScenario || row.businessScenario === q.businessScenario)
          && (!q.productType || row.productType === q.productType)
          && (!q.strategy || row.strategy === q.strategy)
          && (!q.status || row.status === q.status)
          && (!q.creator || String(row.creator || '').includes(q.creator))
          && inRange
      })
    },
    pagedList() {
      const start = (this.page - 1) * this.pageSize
      return this.filteredList.slice(start, start + this.pageSize)
    }
  },
  watch: {
    filteredList() {
      const maxPage = Math.max(1, Math.ceil(this.filteredList.length / this.pageSize) || 1)
      if (this.page > maxPage) this.page = maxPage
    }
  },
  methods: {
    needEllipsis(text) {
      return String(text == null ? '' : text).length > ELLIPSIS_LIMIT
    },
    displayText(text) {
      const raw = String(text == null ? '' : text)
      if (raw.length <= ELLIPSIS_LIMIT) return raw
      return `${raw.slice(0, ELLIPSIS_LIMIT)}...`
    },
    statusTagType(status) {
      if (status === '已启用') return 'success'
      if (status === '已停用') return 'danger'
      return 'info'
    },
    resetQuery() {
      this.query = emptyQuery()
      this.applied = {}
      this.page = 1
    },
    handleSearch() {
      this.applied = { ...this.query }
      this.page = 1
    },
    toggleStatus(row) {
      const next = row.status === '已启用' ? '已停用' : '已启用'
      this.$confirm(`确认${next === '已启用' ? '启用' : '停用'}该报价？`, '二次确认', { type: 'warning' })
        .then(() => {
          row.status = next
          this.$message.success(`已${next === '已启用' ? '启用' : '停用'}`)
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.quoting-list-table >>> .el-table .cell {
  white-space: nowrap;
  line-height: 22px;
}
.cell-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  cursor: default;
}
</style>
