import Vue from 'vue'
import Lui from '@lui/lui-ui'
import locale from '@lui/lui-ui/lib/locale'
import lang from '@lui/lui-ui/lib/locale/lang/zh-CN'
import '@lui/lui-ui/lib/theme-chalk/index.css'
import App from './App.vue'
import './styles/global.css'
import { publicAsset } from './utils/publicAsset'

// 静态资源基路径：兼容 GitHub Pages 子目录部署
document.documentElement.style.setProperty(
  '--asset-table-empty',
  `url("${publicAsset('d2c-assets/table-empty.png')}")`
)

// 覆盖表格空态文案：不再使用「暂时没有数据」
if (lang && lang.el) {
  if (lang.el.table) lang.el.table.emptyText = '暂无数据'
  if (lang.el.tree) lang.el.tree.emptyText = '暂无数据'
  if (lang.el.empty) lang.el.empty.description = '暂无数据'
}
locale.use(lang)

Vue.use(Lui)
Vue.config.productionTip = false

/**
 * LUI Select 多选 tag 自带 dark Tooltip（文案回显）。
 * Select 直接 import Tooltip 模块，仅改 Vue.options.components 可能无效，
 * 因此同时 patch 注册组件 + 源模块，并加 DOM 兜底隐藏。
 */
function isInsideSelectTooltip(vm) {
  let parent = vm && vm.$parent
  while (parent) {
    const name = parent.$options && parent.$options.name
    if (name === 'ElSelect' || name === 'LuiSelect') return true
    parent = parent.$parent
  }
  return false
}

function patchTooltipCtor(Ctor) {
  if (!Ctor) return
  const options = Ctor.options || Ctor
  if (!options.methods) return
  ;['show', 'handleShowPopper', 'handleFocus'].forEach((fnName) => {
    const original = options.methods[fnName]
    if (typeof original !== 'function' || original.__luiSelectTipPatched) return
    function patched() {
      if (isInsideSelectTooltip(this)) {
        this.expectedState = false
        this.showPopper = false
        if (this.timeout) clearTimeout(this.timeout)
        return
      }
      return original.apply(this, arguments)
    }
    patched.__luiSelectTipPatched = true
    options.methods[fnName] = patched
  })
}

function patchSelectTooltips() {
  patchTooltipCtor(Vue.options.components.ElTooltip)
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const mod = require('@lui/lui-ui/packages/tooltip/src/main.js')
    patchTooltipCtor(mod && (mod.default || mod))
  } catch (e) {
    /* ignore */
  }
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const mod = require('@lui/lui-ui/lib/tooltip')
    patchTooltipCtor(mod && (mod.default || mod))
  } catch (e) {
    /* ignore */
  }
}

function collectSelectTagTexts() {
  const texts = new Set()
  document.querySelectorAll('.el-select__tags .el-tag').forEach((tag) => {
    const raw = (tag.textContent || '').replace(/[×xX＋+]/g, ' ').replace(/\s+/g, ' ').trim()
    if (raw) texts.add(raw)
  })
  return texts
}

function hideSelectTagBubbles() {
  const tagTexts = collectSelectTagTexts()
  document.querySelectorAll('.el-tooltip__popper.is-dark').forEach((el) => {
    const text = (el.textContent || '').trim()
    if (!text) return
    let hide = tagTexts.has(text)
    if (!hide) {
      // 参考节点在 Select tags 内
      const id = el.id
      if (id) {
        const ref = document.querySelector(`[aria-describedby="${id}"]`)
        if (ref && ref.closest && ref.closest('.el-select__tags')) hide = true
      }
    }
    if (!hide) {
      const selects = document.querySelectorAll('.el-select .el-input__inner')
      for (let i = 0; i < selects.length; i += 1) {
        const val = (selects[i].value || '').trim()
        if (val && val === text) {
          hide = true
          break
        }
      }
    }
    if (hide) {
      el.style.display = 'none'
      el.style.visibility = 'hidden'
      el.style.opacity = '0'
      el.style.pointerEvents = 'none'
      el.setAttribute('aria-hidden', 'true')
      el.classList.add('is-select-tag-tip')
    }
  })

  // 运行时关掉 Select 内 Tooltip 实例
  document.querySelectorAll('.el-select__tags .el-tooltip, .el-select__tags .item').forEach((node) => {
    let vm = node.__vue__
    while (vm) {
      if (vm.$options && vm.$options.name === 'ElTooltip') {
        vm.disabled = true
        vm.expectedState = false
        vm.showPopper = false
        break
      }
      vm = vm.$parent
    }
  })
}

patchSelectTooltips()

if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(hideSelectTagBubbles)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  document.addEventListener('mouseover', hideSelectTagBubbles, true)
  document.addEventListener('mousemove', hideSelectTagBubbles, true)
}

new Vue({
  render: h => h(App)
}).$mount('#app')
