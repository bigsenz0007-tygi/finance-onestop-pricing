<template>
  <div class="page-shell">
    <div class="query-card">
      <el-form :model="query" class="lui-form-grid" size="small" data-field-count="5">
        <el-form-item label="方案名称">
          <el-input v-model="query.name" clearable placeholder="请输入" />
        </el-form-item>
        <el-form-item label="业务场景">
          <el-input v-model="query.target" clearable placeholder="请输入" />
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
        <h3>一站定价列表</h3>
        <el-button type="primary" size="small" @click="$emit('create')">新建场景定价</el-button>
      </div>
      <el-table :data="filteredList" class="lui-table-fill">
        <el-table-column prop="name" label="方案名称" min-width="160" />
        <el-table-column prop="mode" label="定价方式" min-width="100" />
        <el-table-column prop="target" label="业务场景" min-width="140" />
        <el-table-column prop="status" label="状态" min-width="90">
          <template slot-scope="{ row }">
            <el-tag size="small" :type="statusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="creator" label="创建人" min-width="80" />
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
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
          :page-size="10"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OnestopPricingHome',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      query: { name: '', target: '', status: '', creator: '', range: [] },
      applied: {}
    }
  },
  computed: {
    filteredList() {
      const q = this.applied
      return (this.list || []).filter(row => {
        return (!q.name || row.name.includes(q.name))
          && (!q.target || row.target.includes(q.target))
          && (!q.status || row.status === q.status)
          && (!q.creator || row.creator.includes(q.creator))
      })
    }
  },
  methods: {
    statusTagType(status) {
      if (status === '已启用' || status === '启用') return 'success'
      if (status === '已停用' || status === '停用') return 'danger'
      return 'info'
    },
    resetQuery() {
      this.query = { name: '', target: '', status: '', creator: '', range: [] }
      this.applied = {}
    },
    handleSearch() {
      this.applied = { ...this.query }
    },
    toggleStatus(row) {
      const next = row.status === '已启用' ? '已停用' : '已启用'
      this.$confirm(`确认${next === '已启用' ? '启用' : '停用'}该方案？`, '二次确认', { type: 'warning' })
        .then(() => {
          row.status = next
          this.$message.success(`已${next === '已启用' ? '启用' : '停用'}`)
        })
        .catch(() => {})
    }
  }
}
</script>
