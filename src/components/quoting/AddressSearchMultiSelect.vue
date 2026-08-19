<template>
  <div
    v-clickoutside="closeDropdown"
    class="amp"
    :class="{ 'is-open': visible, 'is-error': error, 'has-query': !!queryTrim, 'is-focused': focused }"
  >
    <div class="amp__trigger" @click="onTriggerClick">
      <div class="amp__tags" @wheel.stop="onTagsWheel">
        <!-- 有输入时不挂气泡，避免输入过程弹出 -->
        <div
          v-if="selected.length && queryTrim"
          class="amp__tags-main"
          @click.stop
        >
          <span class="amp__tag">
            <span class="amp__tag-text">{{ selected[0] }}</span>
            <i class="el-icon-close amp__tag-close" @click.stop="removeAt(0)" />
          </span>
          <span v-if="overflowCount > 0" class="amp__more">+ {{ overflowCount }}</span>
        </div>
        <el-tooltip
          v-else-if="selected.length"
          :disabled="selected.length <= 1 || tipLocked"
          effect="dark"
          placement="top"
          :open-delay="300"
          popper-class="amp-tip-popper"
        >
          <div slot="content" class="amp-tip-content">
            <div v-for="(item, idx) in selected" :key="'tip-' + idx" class="amp-tip-content__line">
              {{ item }}
            </div>
          </div>
          <div
            class="amp__tags-main"
            @click.stop
            @mouseenter="tipLocked = false"
          >
            <span class="amp__tag">
              <span class="amp__tag-text">{{ selected[0] }}</span>
              <i class="el-icon-close amp__tag-close" @click.stop="removeAt(0)" />
            </span>
            <span v-if="overflowCount > 0" class="amp__more">+ {{ overflowCount }}</span>
          </div>
        </el-tooltip>
        <input
          ref="input"
          v-model="query"
          class="amp__search"
          :placeholder="selected.length ? '' : placeholder"
          @focus="onFocus"
          @blur="onBlur"
          @input="onQueryInput"
          @keydown.delete="onBackspace"
          @keydown.enter.prevent="onEnter"
          @keydown.esc.stop="onEsc"
        />
      </div>
      <span class="amp__suffix" @click.stop="onSuffixClick">
        <i
          v-if="queryTrim"
          class="el-icon-close amp__clear"
          aria-label="清除"
        />
        <i
          v-else
          class="el-icon-arrow-down amp__arrow"
          :class="{ 'is-reverse': visible }"
        />
      </span>
    </div>
    <p v-if="inputError" class="amp__input-error">{{ inputError }}</p>

    <div v-show="visible" class="amp__dropdown" @mousedown.prevent>
      <!-- 搜索时不展示推荐区域，仅结果 -->
      <div v-if="!queryTrim" class="amp__quick">
        <div class="amp__quick-tabs">
          <button
            type="button"
            class="amp__quick-tab"
            :class="{ 'is-active': quickTab === 'domestic' }"
            @click="quickTab = 'domestic'"
          >国内</button>
          <button
            type="button"
            class="amp__quick-tab"
            :class="{ 'is-active': quickTab === 'crossborder' }"
            @click="quickTab = 'crossborder'"
          >国际</button>
        </div>
        <div v-if="quickTab === 'domestic'" class="amp__quick-body">
          <div class="amp__quick-label">地址标签：</div>
          <el-checkbox-group v-model="quickRegions" class="amp__quick-group" @change="onQuickChange">
            <el-checkbox v-for="r in regionOptions" :key="r" :label="r">{{ r }}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div v-else class="amp__quick-body amp__quick-body--intl">
          国际地址预览占位：可选国家/口岸（本期保留页签）。
        </div>
      </div>

      <template v-if="queryTrim">
        <div class="amp__search-panel">
          <div v-if="searchOverflow" class="amp__search-tip">已超过 300 条上限，仅展示前 300 条</div>
          <div v-if="filteredOptions.length" class="amp__option-list">
            <label
              v-for="opt in filteredOptions"
              :key="opt.value"
              class="amp__option"
              :class="{ 'is-checked': isSelected(opt.pathText), 'is-exact': opt.matchType === 'exact' }"
            >
              <el-checkbox
                :value="isSelected(opt.pathText)"
                @change="val => togglePath(opt.pathText, opt.path, val)"
              >
                <span v-html="highlightLabel(opt.pathText)" />
              </el-checkbox>
            </label>
          </div>
          <div v-else class="amp__empty">无匹配地址，请换关键词或点击下拉选择地址</div>
        </div>
      </template>
      <template v-else-if="quickTab === 'domestic'">
        <div class="amp__cascade-wrap">
          <div class="amp__cascade-toolbar">
            <el-checkbox
              :value="allCitiesChecked"
              :indeterminate="allCitiesIndeterminate"
              @change="onToggleAllCities"
            >全选</el-checkbox>
          </div>
          <el-cascader-panel
            :key="panelKey"
            :value="cascaderValue"
            :options="cascaderOptions"
            :props="cascaderProps"
            @change="onCascaderChange"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import Clickoutside from '@lui/lui-ui/src/utils/clickoutside'

const REGION_OPTIONS = [
  '东北（含蒙东）',
  '东北（无蒙东）',
  '全国（无港澳台钓）',
  '内陆（无新藏）',
  '华东',
  '华中',
  '华北（含内蒙）',
  '华北（含蒙西）',
  '华南',
  '西北',
  '西南'
]

const REGION_ALIAS = {
  '东北（含蒙东）': '东北',
  '东北（无蒙东）': '东北',
  '全国（无港澳台钓）': null, // 全国：全部城市
  '内陆（无新藏）': '华中',
  华东: '华东',
  华中: '华中',
  '华北（含内蒙）': '华北',
  '华北（含蒙西）': '华北',
  华南: '华南',
  西北: '西北',
  西南: '西南'
}

const ADDRESS_TREE_BY_REGION = {
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
        海淀区: ['中关村街道', '海淀街道'],
        大兴区: ['兴丰街道', '林校路街道']
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
    },
    山东省: {
      济南市: {
        历下区: ['泉城路街道', '东关街道']
      },
      青岛市: {
        市南区: ['八大关街道', '中山路街道']
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

function buildProvinceCascader() {
  const provinces = {}
  Object.keys(ADDRESS_TREE_BY_REGION).forEach(region => {
    Object.keys(ADDRESS_TREE_BY_REGION[region] || {}).forEach(province => {
      provinces[province] = ADDRESS_TREE_BY_REGION[region][province]
    })
  })
  return Object.keys(provinces).map(province => ({
    value: province,
    label: province,
    children: Object.keys(provinces[province] || {}).map(city => ({
      value: city,
      label: city,
      children: Object.keys(provinces[province][city] || {}).map(district => ({
        value: district,
        label: district,
        children: (provinces[province][city][district] || []).map(street => ({
          value: street,
          label: street
        }))
      }))
    }))
  }))
}

/** 联级路径 → 展示文案：去重相邻同名后用 / 连接，如 北京市/大兴区 */
function formatPath(path) {
  const parts = (path || []).map(s => String(s || '').trim()).filter(Boolean)
  const compact = []
  parts.forEach(p => {
    if (!compact.length || compact[compact.length - 1] !== p) compact.push(p)
  })
  return compact.join('/')
}

/** 省 / 市 / 县区（及街道）检索索引，与引导文案一致 */
function buildSearchIndex(options, path = [], level = 0) {
  const LEVELS = ['province', 'city', 'district', 'street']
  const list = []
  ;(options || []).forEach(node => {
    const next = path.concat(node.value)
    const levelName = LEVELS[Math.min(level, LEVELS.length - 1)]
    // 引导：省份/城市/县区；街道作为补充命中
    if (level <= 2 || levelName === 'street') {
      list.push({
        value: `${levelName}:${next.join('/')}`,
        pathText: formatPath(next),
        label: node.label,
        path: next.slice(),
        level: levelName
      })
    }
    if (node.children && node.children.length) {
      list.push(...buildSearchIndex(node.children, next, level + 1))
    }
  })
  return list
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function pathTextToCascaderPath(text) {
  if (!text || REGION_OPTIONS.includes(text)) return null
  return String(text).split('/').map(s => s.trim()).filter(Boolean)
}

/** 将展示路径还原为联级 panel 的完整 value 路径 */
function resolveCascaderPaths(pathTexts, options) {
  const result = []
  const index = buildSearchIndex(options)
  ;(pathTexts || []).forEach(text => {
    if (REGION_OPTIONS.includes(text)) return
    const hit = index.find(item => item.pathText === text || item.value.endsWith(`:${text}`))
    if (hit) {
      result.push(hit.path.slice())
      return
    }
    const parts = pathTextToCascaderPath(text)
    if (parts && parts.length) result.push(parts)
  })
  const seen = new Set()
  return result.filter(p => {
    const key = p.join('/')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const CASCADER_OPTIONS = buildProvinceCascader()
const SEARCH_INDEX = buildSearchIndex(CASCADER_OPTIONS)
const SEARCH_LIMIT = 300

/** 全国城市（省/市 两级） */
function collectAllCities(options) {
  const cities = []
  ;(options || []).forEach(province => {
    ;(province.children || []).forEach(city => {
      const path = [province.value, city.value]
      const leafPaths = []
      function walk(nodes, prefix) {
        ;(nodes || []).forEach(n => {
          const next = prefix.concat(n.value)
          if (n.children && n.children.length) walk(n.children, next)
          else leafPaths.push(next.slice())
        })
      }
      walk(city.children || [], path)
      cities.push({
        path,
        pathText: formatPath(path),
        leafPaths
      })
    })
  })
  return cities
}

const ALL_CITIES = collectAllCities(CASCADER_OPTIONS)
const ALL_CITY_TEXTS = ALL_CITIES.map(c => c.pathText)
const ALL_CITY_LEAF_PATHS = ALL_CITIES.reduce((acc, c) => acc.concat(c.leafPaths), [])

/** 大区标签 → 下属城市 */
function citiesUnderRegionLabel(regionLabel) {
  if (regionLabel === '全国（无港澳台钓）' || REGION_ALIAS[regionLabel] === null) {
    return ALL_CITIES.slice()
  }
  const key = REGION_ALIAS[regionLabel] || regionLabel
  const tree = ADDRESS_TREE_BY_REGION[key]
  if (!tree) return []
  const out = []
  Object.keys(tree).forEach(province => {
    Object.keys(tree[province] || {}).forEach(city => {
      const path = [province, city]
      const leafPaths = []
      const districts = tree[province][city] || {}
      Object.keys(districts).forEach(district => {
        ;(districts[district] || []).forEach(street => {
          leafPaths.push([province, city, district, street])
        })
      })
      out.push({ path, pathText: formatPath(path), leafPaths })
    })
  })
  return out
}

/** 将输入词解析为地址索引项（优先城市） */
function resolveInputToken(token) {
  const raw = String(token || '').trim()
  if (!raw) return null
  const lower = raw.toLowerCase()
  const candidates = SEARCH_INDEX.filter(item => item.level === 'city' || item.level === 'province' || item.level === 'district')

  // 1) 精准：完整路径或节点名
  let hit = candidates.find(item => item.pathText.toLowerCase() === lower || item.label.toLowerCase() === lower)
  if (hit) return hit

  // 2) 补「市/省/区」后缀
  const withSuffix = [raw + '市', raw + '省', raw + '区', raw + '县']
  hit = candidates.find(item => withSuffix.some(s => item.label === s || item.pathText.endsWith(s)))
  if (hit) return hit

  // 3) 城市优先包含匹配
  const cityHits = ALL_CITIES.filter(c =>
    c.pathText.includes(raw) || c.path.some(p => p.includes(raw) || p.replace(/(省|市|区|县)$/, '') === raw)
  )
  if (cityHits.length === 1) {
    return SEARCH_INDEX.find(item => item.pathText === cityHits[0].pathText && item.level === 'city') || {
      pathText: cityHits[0].pathText,
      path: cityHits[0].path,
      label: cityHits[0].path[cityHits[0].path.length - 1],
      level: 'city'
    }
  }
  if (cityHits.length > 1) {
    // 更短路径优先（直辖市）
    cityHits.sort((a, b) => a.pathText.length - b.pathText.length)
    return {
      pathText: cityHits[0].pathText,
      path: cityHits[0].path,
      label: cityHits[0].path[cityHits[0].path.length - 1],
      level: 'city'
    }
  }

  // 4) 省 / 区县包含
  hit = candidates.find(item => item.label.includes(raw) || item.pathText.includes(raw))
  return hit || null
}

/** 精准 / 分段 / 模糊匹配 */
function fuzzyIncludes(text, keyword) {
  const t = String(text || '').toLowerCase()
  const k = String(keyword || '').toLowerCase()
  if (!k) return false
  if (t.includes(k)) return true
  // 模糊：关键字字符按序出现即可（如 bj → 不强制；中文按包含已覆盖）
  let i = 0
  for (let c = 0; c < t.length && i < k.length; c += 1) {
    if (t[c] === k[i]) i += 1
  }
  return i === k.length && k.length >= 2
}

function matchText(text, keywords) {
  const raw = String(text || '')
  const lower = raw.toLowerCase()
  const segments = raw.split('/').map(s => s.trim().toLowerCase())
  let best = ''
  keywords.forEach(kw => {
    const k = String(kw || '').toLowerCase()
    if (!k) return
    if (lower === k || segments.some(s => s === k)) {
      best = 'exact'
      return
    }
    if (segments.some(s => s.includes(k)) || lower.includes(k)) {
      if (best !== 'exact') best = 'segment'
      return
    }
    if (fuzzyIncludes(lower, k) && best !== 'exact' && best !== 'segment') {
      best = 'fuzzy'
    }
  })
  return best
}

export default {
  name: 'AddressSearchMultiSelect',
  directives: { Clickoutside },
  props: {
    value: { type: Array, default: () => [] },
    placeholder: { type: String, default: '请输入省份/城市/县区进行搜索，用逗号分隔，上限300；也可点击下拉选择地址' },
    error: { type: Boolean, default: false }
  },
  data() {
    return {
      visible: false,
      query: '',
      focused: false,
      tipLocked: true,
      inputError: '',
      panelKey: 0,
      quickTab: 'domestic',
      regionOptions: REGION_OPTIONS,
      cascaderOptions: CASCADER_OPTIONS,
      cascaderProps: {
        multiple: true,
        checkStrictly: false,
        expandTrigger: 'hover',
        emitPath: true
      },
      cascaderValue: [],
      quickRegions: [],
      syncing: false
    }
  },
  computed: {
    selected() {
      return Array.isArray(this.value) ? this.value : []
    },
    queryTrim() {
      return String(this.query || '').trim()
    },
    /** 其余折叠为 +N */
    overflowCount() {
      return Math.max(0, this.selected.length - 1)
    },
    selectedCityCount() {
      return ALL_CITY_TEXTS.filter(t => this.selected.includes(t)).length
    },
    allCitiesChecked() {
      return ALL_CITY_TEXTS.length > 0 && this.selectedCityCount === ALL_CITY_TEXTS.length
    },
    allCitiesIndeterminate() {
      return this.selectedCityCount > 0 && this.selectedCityCount < ALL_CITY_TEXTS.length
    },
    filteredOptions() {
      const q = this.queryTrim
      if (!q) return []
      // 引导：用逗号分隔多个省/市/县区
      const tokens = q
        .split(/[,，]+/)
        .map(s => s.trim())
        .filter(Boolean)
      const keywords = tokens.length ? tokens : [q]

      const scored = []
      const seen = new Set()

      // 大区标签也参与搜索
      REGION_OPTIONS.forEach(region => {
        const matchType = matchText(region, keywords)
        if (!matchType) return
        const key = `region:${region}`
        if (seen.has(key)) return
        seen.add(key)
        scored.push({
          value: key,
          pathText: region,
          label: region,
          path: [region],
          level: 'region',
          matchType,
          score: matchType === 'exact' ? 4 : 1
        })
      })

      SEARCH_INDEX.forEach(item => {
        const matchType = matchText(item.pathText, keywords) || matchText(item.label, keywords)
        if (!matchType) return
        if (seen.has(item.pathText)) return
        seen.add(item.pathText)
        const levelScore = item.level === 'province' ? 0.3 : item.level === 'city' ? 0.2 : item.level === 'district' ? 0.1 : 0
        scored.push({
          ...item,
          matchType,
          score:
            (matchType === 'exact' ? 4 : matchType === 'segment' ? 2 : 1) + levelScore
        })
      })

      scored.sort((a, b) => b.score - a.score)
      return scored.slice(0, SEARCH_LIMIT)
    },
    searchOverflow() {
      if (!this.queryTrim) return false
      // 粗略判断：结果刚好顶满上限时提示可能截断
      return this.filteredOptions.length >= SEARCH_LIMIT
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (this.syncing) return
        this.cascaderValue = resolveCascaderPaths(val, CASCADER_OPTIONS)
        this.quickRegions = REGION_OPTIONS.filter(r => (val || []).includes(r))
        this.panelKey += 1
      }
    }
  },
  methods: {
    isSelected(pathText) {
      return this.selected.includes(pathText)
    },
    emitValue(next) {
      this.syncing = true
      this.$emit('input', next.slice())
      this.$emit('change', next.slice())
      this.$nextTick(() => {
        this.syncing = false
      })
    },
    openDropdown() {
      this.visible = true
    },
    closeDropdown() {
      this.visible = false
      this.query = ''
      this.focused = false
      this.tipLocked = true
    },
    onFocus() {
      this.focused = true
      this.tipLocked = true
      this.openDropdown()
    },
    onBlur() {
      this.focused = false
    },
    onTriggerClick() {
      this.tipLocked = true
      this.openDropdown()
      this.$nextTick(() => {
        if (this.$refs.input) this.$refs.input.focus()
      })
    },
    onSuffixClick() {
      if (this.queryTrim) {
        this.query = ''
        this.$nextTick(() => {
          if (this.$refs.input) this.$refs.input.focus()
        })
        return
      }
      this.visible = !this.visible
      if (this.visible) {
        this.$nextTick(() => {
          if (this.$refs.input) this.$refs.input.focus()
        })
      }
    },
    onQueryInput() {
      this.tipLocked = true
      this.inputError = ''
      if (this.quickTab !== 'domestic') this.quickTab = 'domestic'
      if (!this.visible) this.visible = true
    },
    onEnter() {
      this.commitQueryTokens()
    },
    /** 回车：多地址自动勾选 + 校验不存在项 */
    commitQueryTokens() {
      const q = this.queryTrim
      if (!q) return
      const tokens = q
        .split(/[,，;；、]+/)
        .map(s => s.trim())
        .filter(Boolean)
      if (!tokens.length) return

      const matched = []
      const invalid = []
      tokens.forEach(token => {
        const hit = resolveInputToken(token)
        if (hit && hit.pathText) {
          if (!matched.includes(hit.pathText)) matched.push(hit.pathText)
        } else {
          invalid.push(token)
        }
      })

      if (matched.length) {
        const next = this.selected.slice()
        matched.forEach(t => {
          if (!next.includes(t)) next.push(t)
        })
        this.cascaderValue = resolveCascaderPaths(next, CASCADER_OPTIONS)
        this.quickRegions = REGION_OPTIONS.filter(r => next.includes(r))
        this.panelKey += 1
        this.emitValue(next)
      }

      if (invalid.length) {
        this.inputError = `以下地址不正确或不存在：${invalid.join('、')}`
        this.query = invalid.join('，')
        this.$message.warning(this.inputError)
        this.visible = true
        this.quickTab = 'domestic'
        this.$nextTick(() => {
          if (this.$refs.input) this.$refs.input.focus()
        })
        return
      }

      this.inputError = ''
      this.query = ''
      this.$message.success(`已自动勾选 ${matched.length} 个地址`)
      this.$nextTick(() => {
        if (this.$refs.input) this.$refs.input.focus()
      })
    },
    onToggleAllCities(checked) {
      // 全选与单个/标签选择互斥：开启全选时清空地址标签，并勾选全部城市
      if (checked) {
        const next = ALL_CITY_TEXTS.slice()
        this.cascaderValue = ALL_CITY_LEAF_PATHS.map(p => p.slice())
        this.quickRegions = []
        this.panelKey += 1
        this.emitValue(next)
      } else {
        this.cascaderValue = []
        this.quickRegions = []
        this.panelKey += 1
        this.emitValue([])
      }
      this.inputError = ''
    },
    onCascaderChange(val) {
      // 单个勾选：与「全选」互斥——只要不是全部城市，则退出全选态；父级勾选会带出下级（checkStrictly:false）
      const pathTexts = (val || []).map(p => formatPath(p)).filter(Boolean)
      const next = pathTexts.slice()
      this.cascaderValue = (val || []).map(p => p.slice())
      // 单个联级选择时清除大区标签，避免与全选/标签态叠加
      this.quickRegions = []
      this.emitValue(next)
      this.restoreDefaultAfterSelect()
    },
    onQuickChange(list) {
      // 地址标签与全选互斥；勾选标签时默认勾选其下全部城市
      const prevRegions = this.quickRegions.slice()
      const added = (list || []).filter(r => !prevRegions.includes(r))
      const removed = prevRegions.filter(r => !(list || []).includes(r))

      let next = this.selected.filter(x => !REGION_OPTIONS.includes(x) && !ALL_CITY_TEXTS.includes(x))
      // 先去掉被取消标签展开的城市
      removed.forEach(r => {
        const cities = citiesUnderRegionLabel(r)
        const set = new Set(cities.map(c => c.pathText))
        next = next.filter(x => !set.has(x))
      })

      // 保留仍勾选标签对应的城市，并加入新增标签城市
      const active = (list || []).slice()
      const leafSet = new Set()
      active.forEach(r => {
        citiesUnderRegionLabel(r).forEach(c => {
          if (!next.includes(c.pathText)) next.push(c.pathText)
          ;(c.leafPaths || []).forEach(p => leafSet.add(p.join('/')))
        })
        if (!next.includes(r)) next.push(r)
      })

      // 若此前是全选态，切换到标签后仅保留标签范围
      this.quickRegions = active
      this.cascaderValue = Array.from(leafSet).map(s => s.split('/'))
      this.panelKey += 1
      this.emitValue(next)
      this.restoreDefaultAfterSelect()
    },
    onEsc() {
      this.query = ''
      this.visible = false
      this.tipLocked = true
      this.inputError = ''
    },
    onBackspace(e) {
      if (this.query) return
      if (!this.selected.length) return
      e.preventDefault()
      this.removeAt(this.selected.length - 1)
    },
    onTagsWheel(e) {
      const el = e.currentTarget
      if (!el) return
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY
      }
    },
    highlightLabel(label) {
      const tokens = this.queryTrim
        .split(/[,，]+/)
        .map(s => s.trim())
        .filter(Boolean)
      const raw = String(label)
      if (!tokens.length) return escapeHtml(raw)
      let hit = ''
      let idx = -1
      tokens.forEach(kw => {
        const i = raw.toLowerCase().indexOf(kw.toLowerCase())
        if (i >= 0 && kw.length > hit.length) {
          hit = kw
          idx = i
        }
      })
      if (idx < 0) return escapeHtml(raw)
      return (
        escapeHtml(raw.slice(0, idx)) +
        `<em class="amp__hl">${escapeHtml(raw.slice(idx, idx + hit.length))}</em>` +
        escapeHtml(raw.slice(idx + hit.length))
      )
    },
    restoreDefaultAfterSelect() {
      this.query = ''
      this.$nextTick(() => {
        if (this.$refs.input) this.$refs.input.focus()
      })
    },
    togglePath(pathText, path, checked) {
      let next = this.selected.slice()
      if (checked) {
        if (!next.includes(pathText)) next.push(pathText)
      } else {
        next = next.filter(x => x !== pathText)
      }
      this.cascaderValue = resolveCascaderPaths(next, CASCADER_OPTIONS)
      this.quickRegions = REGION_OPTIONS.filter(r => next.includes(r))
      this.emitValue(next)
      this.restoreDefaultAfterSelect()
    },
    removeAt(index) {
      const next = this.selected.slice()
      next.splice(index, 1)
      this.cascaderValue = resolveCascaderPaths(next, CASCADER_OPTIONS)
      this.quickRegions = REGION_OPTIONS.filter(r => next.includes(r))
      this.emitValue(next)
      this.panelKey += 1
    }
  }
}
</script>

<style scoped>
.amp {
  position: relative;
  width: 100%;
}
.amp__trigger {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 1px 8px;
  border: 1px solid #e4e5e9;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
  cursor: text;
  transition: border-color 0.15s;
  box-shadow: none;
}
.amp.is-open .amp__trigger,
.amp__trigger:hover {
  background: #fff;
  border-color: #3c6ef0;
  box-shadow: none;
}
.amp.is-error .amp__trigger {
  background: #fff;
  border-color: #f53f3f;
  box-shadow: none;
}
.amp__tags {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}
.amp__tags::-webkit-scrollbar {
  display: none;
}
.amp__tags-main {
  display: inline-flex;
  align-items: center;
  flex: 0 1 auto;
  min-width: 0;
  max-width: 72%;
  gap: 6px;
}
.amp__tag {
  display: inline-flex;
  align-items: center;
  max-width: 220px;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  background: #f1f2f4;
  color: #525765;
  font-size: 12px;
  line-height: 24px;
  flex: 0 1 auto;
  min-width: 0;
}
.amp__tag-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.amp__tag-close {
  margin-left: 4px;
  font-size: 12px;
  cursor: pointer;
  color: #868d9f;
  flex-shrink: 0;
}
.amp__tag-close:hover {
  color: #525765;
}
.amp__more {
  flex: 0 0 auto;
  height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  background: #f1f2f4;
  color: #525765;
  font-size: 12px;
  line-height: 24px;
  white-space: nowrap;
}
.amp__search {
  flex: 1 1 48px;
  min-width: 48px;
  height: 26px;
  border: none;
  outline: none;
  background: transparent;
  color: #23252b;
  font-size: 14px;
  line-height: 26px;
}
.amp__search::placeholder {
  color: #c0c4cc;
}
.amp__suffix {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 4px;
  color: #babec7;
  cursor: pointer;
}
.amp__clear {
  font-size: 12px;
  color: #babec7 !important;
  font-weight: 600;
}
.amp__clear:hover {
  color: #868d9f !important;
}
.amp__arrow {
  transition: transform 0.2s;
  font-size: 14px;
}
.amp__arrow:hover {
  color: #868d9f;
}
.amp__arrow.is-reverse {
  transform: rotate(180deg);
}
.amp__dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 4px);
  z-index: 30;
  background: #fff;
  border: none;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(35, 37, 43, 0.12);
  max-height: min(480px, calc(100vh - 160px));
  overflow: auto;
}
.amp__cascade-wrap {
  padding: 8px 0 12px;
  overflow-x: auto;
}
.amp__cascade-toolbar {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 180px; /* 与联级首列 min-width 对齐 */
  height: 34px; /* 与 .el-cascader-node 行高一致 */
  min-height: 34px;
  padding: 0 30px 0 12px;
  margin: 0;
  border: none;
}
.amp__cascade-toolbar >>> .el-checkbox {
  display: flex;
  align-items: center;
  margin-right: 0;
  height: 34px;
}
.amp__cascade-toolbar >>> .el-checkbox__label {
  color: #23252b;
  font-size: 14px;
  padding-left: 10px;
  line-height: 34px;
}
.amp__cascade-wrap >>> .el-cascader-panel {
  border: none;
  background: transparent;
}
.amp__cascade-wrap >>> .el-cascader-menu {
  min-width: 180px;
}
/* 去掉 list 顶部多余 padding，保证「全选」与首项行距一致 */
.amp__cascade-wrap >>> .el-cascader-menu__list {
  padding: 0 2px 6px;
  box-sizing: border-box;
}
.amp__cascade-wrap >>> .el-cascader-node {
  height: 34px;
  line-height: 34px;
  padding-left: 10px;
  border-radius: 8px;
  box-sizing: border-box;
}
.amp__cascade-wrap >>> .el-cascader-node:not(.is-disabled):hover,
.amp__cascade-wrap >>> .el-cascader-node:not(.is-disabled):focus,
.amp__cascade-wrap >>> .el-cascader-node.in-active-path,
.amp__cascade-wrap >>> .el-cascader-node.is-active,
.amp__cascade-wrap >>> .el-cascader-node.in-checked-path {
  background-color: rgba(60, 110, 240, 0.1) !important;
  border-radius: 8px;
}
.amp__input-error {
  margin: 4px 0 0;
  color: #f53f3f;
  font-size: 12px;
  line-height: 18px;
}
.amp__search-panel {
  padding: 8px 0 12px;
  max-height: 280px;
  overflow: auto;
}
.amp__search-tip {
  padding: 4px 12px 8px;
  color: #ed7b2f;
  font-size: 12px;
  line-height: 18px;
}
.amp__option-list {
  display: flex;
  flex-direction: column;
}
.amp__option {
  display: block;
  padding: 6px 12px;
  margin: 0;
  cursor: pointer;
}
.amp__option.is-checked {
  background: rgba(60, 110, 240, 0.08);
}
.amp__option >>> .el-checkbox {
  display: flex;
  align-items: center;
  width: 100%;
}
.amp__option >>> .el-checkbox__label {
  color: #23252b;
  font-size: 14px;
  line-height: 22px;
  white-space: normal;
}
.amp__empty {
  padding: 16px 12px;
  color: #868d9f;
  font-size: 13px;
  text-align: center;
}
.amp__quick {
  padding: 12px 16px 14px;
  border-bottom: 1px solid #e4e5e9;
}
.amp__quick-tabs {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  border-bottom: 1px solid #e4e5e9;
}
.amp__quick-tab {
  position: relative;
  padding: 0 0 8px;
  border: none;
  background: transparent;
  color: #868d9f;
  font-size: 14px;
  line-height: 22px;
  cursor: pointer;
}
.amp__quick-tab.is-active {
  color: #3c6ef0;
}
.amp__quick-tab.is-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: #3c6ef0;
  border-radius: 1px;
}
.amp__quick-label {
  margin-bottom: 8px;
  color: #525765;
  font-size: 14px;
  line-height: 22px;
}
.amp__quick-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.amp__quick-group >>> .el-checkbox {
  margin-right: 0;
}
.amp__quick-group >>> .el-checkbox__label {
  color: #525765;
  font-size: 14px;
  padding-left: 6px;
}
.amp__quick-body--intl {
  color: #868d9f;
  font-size: 13px;
  line-height: 20px;
}
</style>

<style>
.amp__hl {
  color: #3c6ef0;
  font-style: normal;
}
.amp-tip-popper {
  max-width: 360px;
}
.amp-tip-content {
  max-height: 240px;
  overflow: auto;
}
.amp-tip-content__line {
  line-height: 20px;
  word-break: break-all;
}
.amp-tip-content__line + .amp-tip-content__line {
  margin-top: 4px;
}
</style>
