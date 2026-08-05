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
      <el-checkbox-group v-model="selectedRegions" class="addr-regions__group" @change="onRegionChange">
        <el-checkbox v-for="r in regions" :key="r" :label="r">{{ r }}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div v-else class="field-tip">跨境地址预览占位：可选国家/口岸（本期保留页签）。</div>

    <el-input
      v-model="searchText"
      type="textarea"
      :rows="2"
      class="addr-search"
      placeholder="请输入省份/城市/区县，多个用逗号、顿号或换行分隔；上限300"
      @input="onSearchInput"
    />
    <div v-if="searchOverflow" class="field-tip field-tip--warn">已超过 300 条上限，仅保留前 300 条。</div>
    <div v-if="searchMiss" class="field-tip field-tip--warn">未匹配到地址，请换关键词或手动选择省市区。</div>

    <!-- 省 / 市 / 区 联级 -->
    <div v-if="activeTab === 'domestic'" class="addr-cascade">
      <el-select
        v-model="cascade.province"
        size="small"
        clearable
        placeholder="省"
        class="addr-cascade__item"
        @change="onProvinceChange"
      >
        <el-option v-for="p in provinceOptions" :key="p" :label="p" :value="p" />
      </el-select>
      <el-select
        v-model="cascade.city"
        size="small"
        clearable
        placeholder="市"
        class="addr-cascade__item"
        :disabled="!cascade.province"
        @change="onCityChange"
      >
        <el-option v-for="c in cityOptions" :key="c" :label="c" :value="c" />
      </el-select>
      <el-select
        v-model="cascade.district"
        size="small"
        clearable
        placeholder="区/县"
        class="addr-cascade__item"
        :disabled="!cascade.city"
        @change="onDistrictChange"
      >
        <el-option v-for="d in districtOptions" :key="d" :label="d" :value="d" />
      </el-select>
    </div>

    <div class="addr-tree">
      <div class="addr-tree__path">
        <el-checkbox :value="allLeafChecked" :indeterminate="leafIndeterminate" @change="toggleAllLeaves">全选</el-checkbox>
        <span class="addr-tree__crumb">{{ pathLabel }}</span>
      </div>
      <el-checkbox-group v-model="selectedLeaves" class="addr-tree__list">
        <el-checkbox v-for="leaf in visibleLeaves" :key="leaf.value" :label="leaf.value">{{ leaf.label }}</el-checkbox>
      </el-checkbox-group>
      <div v-if="!visibleLeaves.length" class="field-tip">请先选择省市区，或通过搜索定位街道/园区。</div>
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
        >{{ shortLeafLabel(item) }}</el-tag>
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

/** 大区 → 省 → 市 → 区 → 街道（预览 mock） */
const ADDRESS_TREE = {
  华东: {
    上海市: {
      上海市: {
        徐汇区: [
          '天平路街道', '湖南路街道', '斜土路街道', '枫林路街道', '长桥街道',
          '田林街道', '虹梅路街道', '康健新村街道', '徐家汇街道', '凌云路街道',
          '龙华街道', '漕河泾街道', '华泾镇', '漕河泾新兴技术开发区'
        ],
        黄浦区: ['南京东路街道', '外滩街道', '半淞园路街道']
      }
    },
    江苏省: {
      南京市: {
        鼓楼区: ['宁海路街道', '华侨路街道'],
        玄武区: ['梅园新村街道', '新街口街道']
      },
      苏州市: {
        姑苏区: ['双塔街道', '沧浪街道']
      }
    },
    浙江省: {
      杭州市: {
        西湖区: ['西溪街道', '灵隐街道'],
        滨江区: ['西兴街道', '长河街道']
      }
    }
  },
  华北: {
    北京市: {
      北京市: {
        朝阳区: ['建外街道', '朝外街道', '三里屯街道'],
        海淀区: ['中关村街道', '海淀街道']
      }
    },
    天津市: {
      天津市: {
        和平区: ['小白楼街道', '南市街道']
      }
    }
  },
  华南: {
    广东省: {
      广州市: {
        天河区: ['天河南街道', '石牌街道'],
        越秀区: ['北京街道', '洪桥街道']
      },
      深圳市: {
        南山区: ['粤海街道', '南头街道'],
        福田区: ['园岭街道', '华强北街道']
      }
    }
  },
  华中: {
    湖北省: {
      武汉市: {
        武昌区: ['积玉桥街道', '黄鹤楼街道']
      }
    }
  },
  西南: {
    四川省: {
      成都市: {
        武侯区: ['浆洗街街道', '望江路街道']
      }
    }
  },
  西北: {
    陕西省: {
      西安市: {
        雁塔区: ['小寨路街道', '大雁塔街道']
      }
    }
  },
  东北: {
    辽宁省: {
      沈阳市: {
        和平区: ['南湖街道', '马路湾街道']
      }
    },
    黑龙江省: {
      哈尔滨市: {
        南岗区: ['花园街道', '奋斗路街道', '大成街道', '曲线街道'],
        道里区: ['兆麟街道', '新阳路街道', '抚顺街道'],
        香坊区: ['香坊大街街道', '安埠街道']
      }
    },
    吉林省: {
      长春市: {
        朝阳区: ['南湖街道', '红旗街道']
      }
    }
  }
}

function parseSearchTokens(text) {
  if (!text || !String(text).trim()) return []
  return String(text)
    .split(/[,，、\n\r]+/)
    .map(s => s.trim())
    .filter(Boolean)
}

function leavesFromDistrict(region, province, city, district) {
  const streets = (((ADDRESS_TREE[region] || {})[province] || {})[city] || {})[district] || []
  return streets.map(s => ({
    value: `${province}-${city}-${district}-${s}`,
    label: s,
    region,
    province,
    city,
    district
  }))
}

/** 扁平检索索引：省/市/区/街道 */
function buildSearchIndex() {
  const index = []
  Object.keys(ADDRESS_TREE).forEach(region => {
    const provinces = ADDRESS_TREE[region] || {}
    Object.keys(provinces).forEach(province => {
      index.push({ level: 'province', region, province, city: '', district: '', street: '', text: province })
      const cities = provinces[province] || {}
      Object.keys(cities).forEach(city => {
        index.push({ level: 'city', region, province, city, district: '', street: '', text: city })
        const districts = cities[city] || {}
        Object.keys(districts).forEach(district => {
          index.push({ level: 'district', region, province, city, district, street: '', text: district })
          ;(districts[district] || []).forEach(street => {
            index.push({
              level: 'street',
              region,
              province,
              city,
              district,
              street,
              text: street,
              value: `${province}-${city}-${district}-${street}`
            })
          })
        })
      })
    })
  })
  return index
}

const SEARCH_INDEX = buildSearchIndex()

function matchToken(token) {
  const t = String(token || '').trim()
  if (!t) return null
  // 优先级：精确 > 包含；层级：市 > 区 > 省 > 街道（城市名搜索更常见）
  const levelRank = { city: 4, district: 3, province: 2, street: 1 }
  let best = null
  let bestScore = -1
  SEARCH_INDEX.forEach(item => {
    if (!item.text) return
    let score = 0
    if (item.text === t || item.text === `${t}市` || item.text === `${t}省` || item.text === `${t}区`) {
      score = 100 + (levelRank[item.level] || 0)
    } else if (item.text.includes(t) || t.includes(item.text.replace(/(省|市|区|县)$/, ''))) {
      score = 50 + (levelRank[item.level] || 0) + Math.min(20, item.text.length)
    }
    if (score > bestScore) {
      bestScore = score
      best = item
    }
  })
  return bestScore > 0 ? best : null
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
      searchOverflow: false,
      searchMiss: false,
      syncingFromSearch: false,
      cascade: {
        province: '上海市',
        city: '上海市',
        district: '徐汇区'
      }
    }
  },
  computed: {
    dialogVisible: {
      get() { return this.visible },
      set(v) { this.$emit('update:visible', v) }
    },
    primaryRegion() {
      return this.selectedRegions[0] || '华东'
    },
    provinceOptions() {
      const keys = this.selectedRegions.length ? this.selectedRegions : REGIONS
      const set = new Set()
      keys.forEach(r => {
        Object.keys(ADDRESS_TREE[r] || {}).forEach(p => set.add(p))
      })
      return Array.from(set)
    },
    cityOptions() {
      if (!this.cascade.province) return []
      const set = new Set()
      const regions = this.selectedRegions.length ? this.selectedRegions : REGIONS
      regions.forEach(r => {
        const cities = (ADDRESS_TREE[r] || {})[this.cascade.province]
        if (cities) Object.keys(cities).forEach(c => set.add(c))
      })
      return Array.from(set)
    },
    districtOptions() {
      if (!this.cascade.province || !this.cascade.city) return []
      const set = new Set()
      const regions = this.selectedRegions.length ? this.selectedRegions : REGIONS
      regions.forEach(r => {
        const districts = ((ADDRESS_TREE[r] || {})[this.cascade.province] || {})[this.cascade.city]
        if (districts) Object.keys(districts).forEach(d => set.add(d))
      })
      return Array.from(set)
    },
    allRegionsChecked() {
      return this.selectedRegions.length === this.regions.length
    },
    regionIndeterminate() {
      const n = this.selectedRegions.length
      return n > 0 && n < this.regions.length
    },
    leafOptions() {
      if (!this.cascade.province || !this.cascade.city || !this.cascade.district) return []
      const regions = this.selectedRegions.length ? this.selectedRegions : [this.primaryRegion]
      const map = new Map()
      regions.forEach(r => {
        leavesFromDistrict(r, this.cascade.province, this.cascade.city, this.cascade.district)
          .forEach(item => map.set(item.value, item))
      })
      return Array.from(map.values())
    },
    /** 搜索命中时：若匹配到市/区则展示该节点下街道；若匹配街道则展示命中街道 */
    searchLeafOptions() {
      const tokens = this.searchTokens
      if (!tokens.length) return null
      const map = new Map()
      tokens.forEach(token => {
        const hit = matchToken(token)
        if (!hit) return
        if (hit.level === 'street') {
          map.set(hit.value, {
            value: hit.value,
            label: hit.street,
            region: hit.region,
            province: hit.province,
            city: hit.city,
            district: hit.district
          })
          return
        }
        const districts = hit.level === 'district'
          ? [hit.district]
          : Object.keys((((ADDRESS_TREE[hit.region] || {})[hit.province] || {})[hit.city] || {}))
        const cities = hit.level === 'province'
          ? Object.keys((ADDRESS_TREE[hit.region] || {})[hit.province] || {})
          : [hit.city]
        cities.forEach(city => {
          const distMap = ((ADDRESS_TREE[hit.region] || {})[hit.province] || {})[city] || {}
          const distList = hit.level === 'district' ? [hit.district] : Object.keys(distMap)
          distList.forEach(district => {
            leavesFromDistrict(hit.region, hit.province, city, district).forEach(item => {
              map.set(item.value, item)
            })
          })
        })
      })
      return Array.from(map.values())
    },
    searchTokens() {
      return parseSearchTokens(this.searchText).slice(0, 300)
    },
    visibleLeaves() {
      if (this.searchTokens.length && this.searchLeafOptions) {
        return this.searchLeafOptions
      }
      return this.leafOptions
    },
    allLeafChecked() {
      return this.visibleLeaves.length > 0 && this.visibleLeaves.every(l => this.selectedLeaves.includes(l.value))
    },
    leafIndeterminate() {
      const n = this.visibleLeaves.filter(l => this.selectedLeaves.includes(l.value)).length
      return n > 0 && n < this.visibleLeaves.length
    },
    pathLabel() {
      const { province, city, district } = this.cascade
      if (province && city && district) return `${province} - ${city} - ${district}`
      if (province && city) return `${province} - ${city}`
      if (province) return province
      return '请选择省 / 市 / 区'
    },
    displaySelected() {
      if (this.expanded) return this.selectedLeaves
      return this.selectedLeaves.slice(0, this.collapseCount)
    }
  },
  methods: {
    shortLeafLabel(value) {
      const parts = String(value || '').split('-')
      return parts.length ? parts[parts.length - 1] : value
    },
    onOpen() {
      this.selectedLeaves = Array.isArray(this.value) ? this.value.slice() : []
      this.searchText = ''
      this.searchOverflow = false
      this.searchMiss = false
      this.expanded = false
      this.activeTab = 'domestic'
      this.selectedRegions = ['华东']
      this.cascade = { province: '上海市', city: '上海市', district: '徐汇区' }
    },
    applyMatch(hit) {
      if (!hit) return
      this.syncingFromSearch = true
      this.selectedRegions = [hit.region]
      this.cascade = {
        province: hit.province || '',
        city: hit.city || '',
        district: hit.district || ''
      }
      // 匹配到省/市时，自动落到第一个区，便于展示街道列表
      if (hit.level === 'province' || hit.level === 'city') {
        this.$nextTick(() => {
          if (!this.cascade.city && this.cityOptions.length) {
            this.cascade.city = this.cityOptions[0]
          }
          if (!this.cascade.district && this.districtOptions.length) {
            this.cascade.district = this.districtOptions[0]
          }
          this.syncingFromSearch = false
        })
      } else {
        this.$nextTick(() => {
          this.syncingFromSearch = false
        })
      }
    },
    onSearchInput(val) {
      const tokens = parseSearchTokens(val)
      this.searchOverflow = tokens.length > 300
      if (this.searchOverflow) {
        this.searchText = tokens.slice(0, 300).join('，')
      }
      const latest = tokens[tokens.length - 1]
      if (!latest) {
        this.searchMiss = false
        return
      }
      const hit = matchToken(latest)
      this.searchMiss = !hit
      if (hit) this.applyMatch(hit)
    },
    onRegionChange() {
      if (this.syncingFromSearch) return
      if (!this.provinceOptions.includes(this.cascade.province)) {
        this.cascade.province = this.provinceOptions[0] || ''
        this.onProvinceChange(this.cascade.province)
      }
    },
    onProvinceChange(val) {
      if (this.syncingFromSearch) return
      this.cascade.city = ''
      this.cascade.district = ''
      if (!val) return
      const cities = this.cityOptions
      if (cities.length) {
        this.cascade.city = cities[0]
        this.onCityChange(cities[0])
      }
    },
    onCityChange(val) {
      if (this.syncingFromSearch) return
      this.cascade.district = ''
      if (!val) return
      const districts = this.districtOptions
      if (districts.length) this.cascade.district = districts[0]
    },
    onDistrictChange() {},
    toggleAllRegions(val) {
      this.selectedRegions = val ? this.regions.slice() : []
      this.onRegionChange()
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
.addr-cascade {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.addr-cascade__item {
  flex: 1;
  min-width: 0;
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
