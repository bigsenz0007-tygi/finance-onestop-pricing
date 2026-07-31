/**
 * 新建报价模式 · 公式测算（对齐产品原型）
 * 右侧字段由计费因子 + 价格项驱动；计算过程对公式做变量替换后逐步展开。
 */

export const FACTOR_OPTIONS = [
  { label: '【F_001】计费重量', value: '计费重量' },
  { label: '【F_002】计费件数', value: '计费件数' },
  { label: '【F_003】计费体积', value: '计费体积' }
]

export const PRICE_ITEM_OPTIONS = [
  { label: '【P_001】首重单价', value: '首重单价' },
  { label: '【P_002】续重单价', value: '续重单价' },
  { label: '【P_003】操作费单价', value: '操作费单价' }
]

export const SPECIAL_VARS = ['计费重量', '油价系数']

export const DEFAULT_NEW_MODE = () => ({
  name: '',
  factors: ['计费重量'],
  priceItems: ['首重单价', '续重单价'],
  formula: '首重单价 + max(0, 计费重量 - 1) * 续重单价',
  desc: '',
  demoValues: {
    计费重量: '2.5',
    首重单价: '12',
    续重单价: '5'
  }
})

export function buildDemoFields(factors = [], priceItems = []) {
  const fields = []
  const seen = new Set()
  ;(factors || []).forEach(name => {
    if (!name || seen.has(name)) return
    seen.add(name)
    fields.push({ key: name, label: `${name} (因子)`, kind: 'factor' })
  })
  ;(priceItems || []).forEach(name => {
    if (!name || seen.has(name)) return
    seen.add(name)
    fields.push({ key: name, label: `${name} (价格项)`, kind: 'price' })
  })
  return fields
}

function formatNum(n) {
  if (!Number.isFinite(n)) return '0'
  const s = String(Math.round(n * 1000) / 1000)
  return s
}

/** 最长优先替换变量名 */
function substituteVars(formula, values) {
  let out = formula || ''
  const keys = Object.keys(values || {}).sort((a, b) => b.length - a.length)
  keys.forEach(key => {
    if (!key || !out.includes(key)) return
    const num = Number(values[key])
    const text = Number.isFinite(num) ? formatNum(num) : '0'
    out = out.split(key).join(text)
  })
  return out
}

/** 展开一层 max/min(a, b) 中可直接求值的参数 */
function expandFnOnce(expr) {
  const re = /(max|min)\(\s*([^()]+?)\s*,\s*([^()]+?)\s*\)/
  const m = expr.match(re)
  if (!m) return null
  const fn = m[1]
  const left = safeEvalArithmetic(m[2].trim())
  const right = safeEvalArithmetic(m[3].trim())
  if (left === null || right === null) return null
  const val = fn === 'max' ? Math.max(left, right) : Math.min(left, right)
  return expr.replace(m[0], formatNum(val))
}

/** 仅允许数字与 + - * / ( ) 空格 */
function safeEvalArithmetic(src) {
  const cleaned = String(src).replace(/\s+/g, '')
  if (!/^[-+*/().\d]+$/.test(cleaned)) return null
  try {
    // eslint-disable-next-line no-new-func
    const v = Function(`"use strict"; return (${cleaned})`)()
    return Number.isFinite(v) ? v : null
  } catch (e) {
    return null
  }
}

/**
 * @returns {{ lines: string[], total: string }}
 */
export function evaluateFormulaDemo(formula, demoValues) {
  const raw = (formula || '').trim()
  if (!raw) {
    return { lines: ['请输入公式'], total: '0.00' }
  }
  const substituted = substituteVars(raw, demoValues)
  const lines = [substituted]
  let cur = substituted

  // 逐步展开 max/min
  for (let i = 0; i < 8; i += 1) {
    const next = expandFnOnce(cur)
    if (!next || next === cur) break
    cur = next
    lines.push(`= ${cur}`)
  }

  // 若仍含 * /，按乘法优先级拆一步（常见：a + b * c）
  const mulMatch = cur.match(/^(.+?)\+\s*([0-9.]+)\s*\*\s*([0-9.]+)\s*$/)
  if (mulMatch) {
    const left = mulMatch[1].trim().replace(/\s+$/, '')
    const product = Number(mulMatch[2]) * Number(mulMatch[3])
    cur = `${left} + ${formatNum(product)}`
    lines.push(`= ${cur}`)
  }

  let total = safeEvalArithmetic(cur.replace(/max|min/g, ''))
  if (total === null) {
    // 最后尝试：去掉已无 max 的表达式整算
    total = safeEvalArithmetic(cur)
  }
  if (total === null) {
    // 回退：对替换后公式尽量整算（含嵌套已展开）
    let evalExpr = cur
    for (let i = 0; i < 8; i += 1) {
      const n = expandFnOnce(evalExpr)
      if (!n) break
      evalExpr = n
    }
    total = safeEvalArithmetic(evalExpr)
  }

  if (total === null) {
    return { lines, total: '-' }
  }

  const last = (lines[lines.length - 1] || '').replace(/^=\s*/, '')
  if (last !== formatNum(total) && Number(last) !== total) {
    lines.push(`= ${formatNum(total)}`)
  }

  return { lines, total: Number(total).toFixed(2) }
}

export function appendFormulaToken(formula, token) {
  const prev = formula || ''
  if (token === 'max' || token === 'min' || token === 'which') {
    return `${prev}${token}()`
  }
  if (SPECIAL_VARS.includes(token) || /[\u4e00-\u9fff]/.test(token)) {
    const needSpace = prev && !/[\s(+\-*/,<>=]$/.test(prev)
    return `${prev}${needSpace ? ' ' : ''}${token}`
  }
  return `${prev}${token}`
}
