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
    // 保留业务自定义「展示全部已选」气泡（地址多选 / 定价多选）
    if (
      el.classList.contains('addr-hover-tip') ||
      el.classList.contains('multi-select-hover-tip')
    ) {
      return
    }
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

/**
 * 多选下拉：仅「最近一次点选」的已选项保留背景高亮
 * （其余已选：蓝字 + checkbox，无背景）
 */
function itemLabel(el) {
  return ((el && el.textContent) || '').replace(/\s+/g, ' ').trim()
}

function clearLastSelected(dropdown) {
  if (!dropdown) return
  dropdown.querySelectorAll('.el-select-dropdown__item.is-last-selected').forEach((el) => {
    el.classList.remove('is-last-selected')
  })
}

function findSelectedByLabel(dropdown, label) {
  if (!dropdown || !label) return null
  const selected = dropdown.querySelectorAll('.el-select-dropdown__item.selected:not(.is-disabled)')
  for (let i = 0; i < selected.length; i += 1) {
    if (itemLabel(selected[i]) === label) return selected[i]
  }
  return null
}

function paintLastSelected(dropdown, label) {
  if (!dropdown) return false
  clearLastSelected(dropdown)
  if (!label) {
    dropdown.__luiLastSelectedLabel = ''
    return false
  }
  const hit = findSelectedByLabel(dropdown, label)
  if (!hit) return false
  hit.classList.add('is-last-selected')
  dropdown.__luiLastSelectedLabel = label
  return true
}

function fallbackLastInOrder(dropdown) {
  const order = Array.isArray(dropdown.__luiSelectedOrder) ? dropdown.__luiSelectedOrder : []
  for (let i = order.length - 1; i >= 0; i -= 1) {
    if (paintLastSelected(dropdown, order[i])) return true
  }
  // 无顺序记录时：用当前 DOM 已选末项
  const selected = dropdown.querySelectorAll('.el-select-dropdown__item.selected:not(.is-disabled)')
  if (selected.length) {
    const last = selected[selected.length - 1]
    last.classList.add('is-last-selected')
    dropdown.__luiLastSelectedLabel = itemLabel(last)
    return true
  }
  clearLastSelected(dropdown)
  dropdown.__luiLastSelectedLabel = ''
  return false
}

function markMultiSelectLastSelected(item, wasSelectedBeforeClick) {
  const dropdown = item && item.closest && item.closest('.el-select-dropdown.is-multiple')
  if (!dropdown) return
  const label = itemLabel(item)
  if (!Array.isArray(dropdown.__luiSelectedOrder)) dropdown.__luiSelectedOrder = []

  if (!wasSelectedBeforeClick) {
    dropdown.__luiSelectedOrder = dropdown.__luiSelectedOrder.filter((lab) => lab !== label)
    dropdown.__luiSelectedOrder.push(label)
    dropdown.__luiLastSelectedLabel = label
    if (!paintLastSelected(dropdown, label)) {
      // DOM 尚未加上 .selected，稍后重试
      setTimeout(() => {
        if (!paintLastSelected(dropdown, label)) fallbackLastInOrder(dropdown)
      }, 0)
      setTimeout(() => paintLastSelected(dropdown, label) || fallbackLastInOrder(dropdown), 48)
    }
  } else {
    dropdown.__luiSelectedOrder = dropdown.__luiSelectedOrder.filter((lab) => lab !== label)
    setTimeout(() => fallbackLastInOrder(dropdown), 0)
    setTimeout(() => fallbackLastInOrder(dropdown), 48)
  }
}

function reapplyStoredLastSelected(dropdown) {
  if (!dropdown || !dropdown.classList.contains('is-multiple')) return
  const label = dropdown.__luiLastSelectedLabel
  if (label) {
    if (!paintLastSelected(dropdown, label)) fallbackLastInOrder(dropdown)
  }
}

function findElSelectVm(node) {
  let cur = node
  while (cur) {
    let vm = cur.__vue__
    while (vm) {
      if (vm.multiple && Array.isArray(vm.selected)) return vm
      const name = vm.$options && vm.$options.name
      if (name === 'ElSelect' || name === 'LuiSelect') return vm
      vm = vm.$parent
    }
    cur = cur.parentElement
  }
  return null
}

function getMultiSelectLabels(selectVm) {
  if (!selectVm) return []
  const selected = selectVm.selected
  if (Array.isArray(selected) && selected.length) {
    return selected
      .map((item) => item.currentLabel || item.label || String(item.value == null ? '' : item.value))
      .filter(Boolean)
  }
  return []
}

/** 全局：hover 首标签 / +N 时展示全部已选（顿号横排） */
function setupMultiSelectHoverTip() {
  if (typeof document === 'undefined') return
  let tipEl = document.querySelector('.multi-select-hover-tip')
  if (!tipEl) {
    tipEl = document.createElement('div')
    tipEl.className = 'multi-select-hover-tip is-hidden el-tooltip__popper is-dark addr-hover-tip'
    tipEl.setAttribute('aria-hidden', 'true')
    document.body.appendChild(tipEl)
  }

  function hideTip() {
    tipEl.classList.add('is-hidden')
    tipEl.textContent = ''
  }

  function showTip(text, x, y) {
    if (!text) {
      hideTip()
      return
    }
    tipEl.textContent = text
    tipEl.classList.remove('is-hidden')
    const pad = 8
    const rect = tipEl.getBoundingClientRect()
    let left = x
    let top = y
    if (left - rect.width / 2 < pad) left = pad + rect.width / 2
    if (left + rect.width / 2 > window.innerWidth - pad) left = window.innerWidth - pad - rect.width / 2
    if (top - rect.height - 10 < pad) {
      tipEl.style.transform = 'translate(-50%, 12px)'
    } else {
      tipEl.style.transform = 'translate(-50%, calc(-100% - 10px))'
    }
    tipEl.style.left = `${left}px`
    tipEl.style.top = `${top}px`
  }

  function resolveHoverTarget(e) {
    const t = e.target
    if (!t || !t.closest) return null
    // 首标签、+N（均为 .el-tag），或 tags 区域
    const tag = t.closest('.el-select__tags .el-tag')
    if (tag) return tag
    const close = t.closest('.el-select__tags .el-tag__close')
    if (close) return close.closest('.el-tag') || close
    const tags = t.closest('.el-select__tags')
    if (tags && tags.closest('.el-select')) return tags
    return null
  }

  document.addEventListener(
    'mousemove',
    (e) => {
      const host = resolveHoverTarget(e)
      if (!host) return
      const selectRoot = host.closest('.el-select')
      if (!selectRoot || !selectRoot.querySelector('.el-select__tags')) return
      const vm = findElSelectVm(selectRoot)
      if (!vm || !vm.multiple) return
      const labels = getMultiSelectLabels(vm)
      if (labels.length < 2) {
        hideTip()
        return
      }
      showTip(labels.join('、'), e.clientX, e.clientY)
    },
    true
  )

  document.addEventListener(
    'mouseover',
    (e) => {
      const host = resolveHoverTarget(e)
      if (!host) return
      const selectRoot = host.closest('.el-select')
      if (!selectRoot || !selectRoot.querySelector('.el-select__tags')) return
      const vm = findElSelectVm(selectRoot)
      if (!vm || !vm.multiple) return
      const labels = getMultiSelectLabels(vm)
      if (labels.length < 2) {
        hideTip()
        return
      }
      const r = host.getBoundingClientRect()
      showTip(labels.join('、'), r.left + r.width / 2, r.top)
    },
    true
  )

  document.addEventListener(
    'mouseout',
    (e) => {
      const to = e.relatedTarget
      if (to && to.closest && to.closest('.el-select__tags')) return
      if (to && to.closest && to.closest('.multi-select-hover-tip')) return
      hideTip()
    },
    true
  )

  document.addEventListener('scroll', hideTip, true)
}

if (typeof window !== 'undefined') {
  document.addEventListener(
    'click',
    (e) => {
      const item =
        e.target && e.target.closest && e.target.closest('.el-select-dropdown.is-multiple .el-select-dropdown__item')
      if (!item || item.classList.contains('is-disabled')) return
      const wasSelectedBeforeClick = item.classList.contains('selected')
      requestAnimationFrame(() => {
        requestAnimationFrame(() => markMultiSelectLastSelected(item, wasSelectedBeforeClick))
      })
    },
    true
  )
  setupMultiSelectHoverTip()
}

if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    hideSelectTagBubbles()
    mutations.forEach((m) => {
      const nodes = []
      if (m.target && m.target.nodeType === 1) nodes.push(m.target)
      if (m.addedNodes) {
        m.addedNodes.forEach((n) => {
          if (n && n.nodeType === 1) nodes.push(n)
        })
      }
      nodes.forEach((node) => {
        let dropdown = null
        if (node.classList && node.classList.contains('el-select-dropdown') && node.classList.contains('is-multiple')) {
          dropdown = node
        } else if (node.closest) {
          dropdown = node.closest('.el-select-dropdown.is-multiple')
        }
        if (!dropdown && node.querySelector) {
          dropdown = node.querySelector('.el-select-dropdown.is-multiple')
        }
        if (dropdown) reapplyStoredLastSelected(dropdown)
      })
    })
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })
  document.addEventListener('mouseover', hideSelectTagBubbles, true)
  document.addEventListener('mousemove', hideSelectTagBubbles, true)
}

new Vue({
  render: h => h(App)
}).$mount('#app')
