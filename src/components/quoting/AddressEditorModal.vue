<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    width="720px"
    custom-class="lui-form-dialog lui-dialog--md address-editor-dialog"
    append-to-body
    :close-on-click-modal="false"
    @open="onOpen"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="国内" name="domestic" />
      <el-tab-pane label="跨境" name="crossborder" />
    </el-tabs>

    <div v-if="activeTab === 'domestic'" class="addr-regions">
      <el-checkbox
        :indeterminate="regionIndeterminate"
        :value="allRegionsChecked"
        @change="toggleAllRegions"
      >全选大区</el-checkbox>
      <el-checkbox-group v-model="selectedRegions" class="addr-regions__group">
        <el-checkbox v-for="r in regions" :key="r" :label="r">{{ r }}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div v-else class="field-tip">跨境地址预览占位：可选国家/口岸（本期保留页签）。</div>

    <el-input
      v-model="searchText"
      type="textarea"
      :rows="2"
      class="addr-search"
      placeholder="请输入省份/城市/园区搜索，多个用逗号、顿号或换行分隔；上限300"
      @input="onSearchInput"
    />
    <div v-if="searchOverflow" class="field-tip field-tip--warn">已超过 300 条上限，仅保留前 300 条。</div>

    <div class="addr-tree">
      <div class="addr-tree__path">
        <el-checkbox :value="allLeafChecked" :indeterminate="leafIndeterminate" @change="toggleAllLeaves">全选</el-checkbox>
        <span class="addr-tree__crumb">{{ pathLabel }}</span>
      </div>
      <el-checkbox-group v-model="selectedLeaves" class="addr-tree__list">
        <el-checkbox v-for="leaf in visibleLeaves" :key="leaf.value" :label="leaf.value">{{ leaf.label }}</el-checkbox>
      </el-checkbox-group>
    </div>

    <div class="addr-selected">
      <div class="addr-selected__title">已选地址</div>
      <div class="addr-selected__tags">
        <el-tag
          v-for="(item, idx) in displaySelected"
          :key="item + idx"
          size="mini"
          closable
          @close="removeSelected(item)"
        >{{ item }}</el-tag>
        <el-button
          v-if="selectedLeaves.length > collapseCount"
          type="text"
          size="mini"
          class="addr-selected__more"
          @click="expanded = !expanded"
        >{{ expanded ? '收起' : `+${selectedLeaves.length - collapseCount}` }}</el-button>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" size="small" @click="confirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
const REGIONS = ['西北', '西南', '华北', '华南', '华中', '华东', '东北']

const LEAF_POOL = {
  华东: [
    { value: '斜土路街道', label: '斜土路街道' },
    { value: '枫林路街道', label: '枫林路街道' },
    { value: '长桥路街道', label: '长桥路街道' },
    { value: '田林街道', label: '田林街道' },
    { value: '虹梅路街道', label: '虹梅路街道' },
    { value: '康健新村街道', label: '康健新村街道' },
    { value: '徐家汇街道', label: '徐家汇街道' },
    { value: '凌云路街道', label: '凌云路街道' },
    { value: '龙华街道', label: '龙华街道' },
    { value: '漕河泾街道', label: '漕河泾街道' },
    { value: '华泾镇', label: '华泾镇' },
    { value: '漕河泾新兴技术开发区', label: '漕河泾新兴技术开发区' }
  ],
  华北: [
    { value: '朝阳区', label: '朝阳区' },
    { value: '海淀区', label: '海淀区' },
    { value: '和平区', label: '和平区' }
  ],
  华南: [
    { value: '广州市', label: '广州市' },
    { value: '深圳市', label: '深圳市' }
  ],
  默认: [
    { value: '示例园区A', label: '示例园区A' },
    { value: '示例园区B', label: '示例园区B' }
  ]
}

function parseSearchTokens(text) {
  if (!text || !String(text).trim()) return []
  return String(text)
    .split(/[,，、\n\r]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

export default {
  name: 'AddressEditorModal',
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '请选择地址' },
    value: { type: Array, default: () => [] }
  },
  data() {
    return {
      activeTab: 'domestic',
      regions: REGIONS,
      selectedRegions: ['华东'],
      searchText: '',
      selectedLeaves: [],
      expanded: false,
      collapseCount: 6,
      searchOverflow: false
    }
  },
  computed: {
    dialogVisible: {
      get() { return this.visible },
      set(v) { this.$emit('update:visible', v) }
    },
    allRegionsChecked() {
      return this.selectedRegions.length === this.regions.length
    },
    regionIndeterminate() {
      const n = this.selectedRegions.length
      return n > 0 && n < this.regions.length
    },
    leafOptions() {
      const set = new Map()
      const keys = this.selectedRegions.length ? this.selectedRegions : ['默认']
      keys.forEach(r => {
        ;(LEAF_POOL[r] || LEAF_POOL.默认).forEach(item => set.set(item.value, item))
      })
      return Array.from(set.values())
    },
    searchTokens() {
      return parseSearchTokens(this.searchText).slice(0, 300)
    },
    visibleLeaves() {
      if (!this.searchTokens.length) return this.leafOptions
      return this.leafOptions.filter(l =>
        this.searchTokens.some(t => l.label.includes(t) || l.value.includes(t))
      )
    },
    allLeafChecked() {
      return this.visibleLeaves.length > 0 && this.visibleLeaves.every(l => this.selectedLeaves.includes(l.value))
    },
    leafIndeterminate() {
      const n = this.visibleLeaves.filter(l => this.selectedLeaves.includes(l.value)).length
      return n > 0 && n < this.visibleLeaves.length
    },
    pathLabel() {
      const region = this.selectedRegions[0] || '未选大区'
      return `${region} - 请选择`
    },
    displaySelected() {
      if (this.expanded) return this.selectedLeaves
      return this.selectedLeaves.slice(0, this.collapseCount)
    }
  },
  methods: {
    onOpen() {
      this.selectedLeaves = Array.isArray(this.value) ? this.value.slice() : []
      this.searchText = ''
      this.searchOverflow = false
      this.expanded = false
      this.activeTab = 'domestic'
    },
    onSearchInput(val) {
      const tokens = parseSearchTokens(val)
      this.searchOverflow = tokens.length > 300
      if (this.searchOverflow) {
        this.searchText = tokens.slice(0, 300).join('，')
      }
    },
    toggleAllRegions(val) {
      this.selectedRegions = val ? this.regions.slice() : []
    },
    toggleAllLeaves(val) {
      const ids = this.visibleLeaves.map(l => l.value)
      if (val) {
        const set = new Set(this.selectedLeaves.concat(ids))
        this.selectedLeaves = Array.from(set)
      } else {
        const drop = new Set(ids)
        this.selectedLeaves = this.selectedLeaves.filter(v => !drop.has(v))
      }
    },
    removeSelected(item) {
      this.selectedLeaves = this.selectedLeaves.filter(v => v !== item)
    },
    confirm() {
      this.$emit('input', this.selectedLeaves.slice())
      this.$emit('confirm', this.selectedLeaves.slice())
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.addr-regions {
  margin-bottom: 12px;
}
.addr-regions__group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 8px;
}
.addr-search {
  margin-bottom: 8px;
}
.addr-tree {
  border: 1px solid #e4e5e9;
  border-radius: 8px;
  padding: 12px;
  max-height: 220px;
  overflow: auto;
  margin-bottom: 12px;
}
.addr-tree__path {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.addr-tree__crumb {
  color: #868d9f;
  font-size: 12px;
}
.addr-tree__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px 8px;
}
.addr-selected__title {
  font-size: 13px;
  color: #525765;
  margin-bottom: 6px;
}
.addr-selected__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-height: 28px;
}
.addr-selected__more {
  padding: 0 4px;
}
.field-tip {
  margin: 4px 0 8px;
  color: #8f959e;
  font-size: 12px;
}
.field-tip--warn {
  color: #fc3737;
}
</style>
