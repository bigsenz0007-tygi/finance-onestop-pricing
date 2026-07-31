/**
 * PRD：来源系统 / 单据类型 / 交易类型 三者级联；
 * 也可直接选下级并反带上级（数据口径来自交易类型管理，预览用静态树）。
 */
export const BILLING_DOC_CASCADE = [
  {
    value: '仓储系统',
    label: '仓储系统',
    children: [
      {
        value: '入库单',
        label: '入库单',
        children: [
          { value: '正常交易', label: '正常交易' },
          { value: '客退交易', label: '客退交易' }
        ]
      },
      {
        value: '销售出库单',
        label: '销售出库单',
        children: [
          { value: '正向交易', label: '正向交易' },
          { value: '逆向交易', label: '逆向交易' }
        ]
      },
      {
        value: '采购入库单',
        label: '采购入库单',
        children: [{ value: '正向交易', label: '正向交易' }]
      }
    ]
  },
  {
    value: '配送系统',
    label: '配送系统',
    children: [
      {
        value: '派车单',
        label: '派车单',
        children: [
          { value: '正常交易', label: '正常交易' },
          { value: '客退交易', label: '客退交易' }
        ]
      },
      {
        value: '青龙运单',
        label: '青龙运单',
        children: [
          { value: 'KA青龙运单', label: 'KA青龙运单' },
          { value: '快运纯配', label: '快运纯配' }
        ]
      }
    ]
  },
  {
    value: '青龙系统',
    label: '青龙系统',
    children: [
      {
        value: '青龙运单',
        label: '青龙运单',
        children: [
          { value: 'KA青龙运单', label: 'KA青龙运单' },
          { value: '快运纯配', label: '快运纯配' }
        ]
      },
      {
        value: '退货单',
        label: '退货单',
        children: [
          { value: '逆向交易', label: '逆向交易' },
          { value: '换货', label: '换货' },
          { value: '退款', label: '退款' }
        ]
      }
    ]
  },
  {
    value: '运输系统',
    label: '运输系统',
    children: [
      {
        value: '调拨单',
        label: '调拨单',
        children: [
          { value: '正向交易', label: '正向交易' },
          { value: '逆向交易', label: '逆向交易' }
        ]
      }
    ]
  }
]

/** 折扣产品 → 业务场景（报价原型 BaseInfoPage） */
export const DISCOUNT_PRODUCT_SCENARIOS = {
  重货标快: ['大件特配', '普通重货'],
  京东标快: ['标准运输', '生鲜特配', '大促活动'],
  京东特快: ['同城特快', '跨省加急']
}

/** 定价入口 → 可选业务场景（按定价方式过滤） */
export const SCENARIOS_BY_PRICING_ENTRY = {
  产品定价: [
    { value: '共配增值服务', label: '共配增值服务' },
    { value: '测试初始化数据', label: '测试初始化数据' }
  ],
  业务场景定价: [
    { value: '大促活动', label: '大促活动' },
    { value: '生鲜特配', label: '生鲜特配' },
    { value: '逆向退换货', label: '逆向退换货' },
    { value: '冷链B仓退供出库', label: '冷链B仓退供出库' }
  ]
}

export function listSourceSystems() {
  return BILLING_DOC_CASCADE.map(n => ({ value: n.value, label: n.label }))
}

export function listDocTypes(sourceSystem) {
  if (!sourceSystem) {
    const map = new Map()
    BILLING_DOC_CASCADE.forEach(s => {
      ;(s.children || []).forEach(d => map.set(d.value, d.label))
    })
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
  }
  const source = BILLING_DOC_CASCADE.find(s => s.value === sourceSystem)
  return (source && source.children ? source.children : []).map(d => ({
    value: d.value,
    label: d.label
  }))
}

export function listTradeTypes(sourceSystem, docType) {
  if (!sourceSystem && !docType) {
    const map = new Map()
    BILLING_DOC_CASCADE.forEach(s => {
      ;(s.children || []).forEach(d => {
        ;(d.children || []).forEach(t => map.set(t.value, t.label))
      })
    })
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }))
  }

  const results = []
  const seen = new Set()
  BILLING_DOC_CASCADE.forEach(s => {
    if (sourceSystem && s.value !== sourceSystem) return
    ;(s.children || []).forEach(d => {
      if (docType && d.value !== docType) return
      ;(d.children || []).forEach(t => {
        if (!seen.has(t.value)) {
          seen.add(t.value)
          results.push({ value: t.value, label: t.label })
        }
      })
    })
  })
  return results
}

/** 选交易类型时反带：若路径唯一则带出上级；多路径时优先匹配已选上级 */
export function resolveParentsByTradeType(tradeType, preferred = {}) {
  if (!tradeType) return { sourceSystem: '', docType: '' }
  const matches = []
  BILLING_DOC_CASCADE.forEach(s => {
    ;(s.children || []).forEach(d => {
      ;(d.children || []).forEach(t => {
        if (t.value === tradeType) {
          matches.push({ sourceSystem: s.value, docType: d.value })
        }
      })
    })
  })
  if (!matches.length) return { sourceSystem: preferred.sourceSystem || '', docType: preferred.docType || '' }
  if (preferred.sourceSystem) {
    const hit = matches.find(m => m.sourceSystem === preferred.sourceSystem
      && (!preferred.docType || m.docType === preferred.docType))
    if (hit) return hit
  }
  if (preferred.docType) {
    const hit = matches.find(m => m.docType === preferred.docType)
    if (hit) return hit
  }
  if (matches.length === 1) return matches[0]
  return matches[0]
}

/** 选单据类型时反带来源系统（路径唯一或与当前交易类型匹配） */
export function resolveSourceByDocType(docType, preferredTradeType) {
  if (!docType) return ''
  const matches = []
  BILLING_DOC_CASCADE.forEach(s => {
    ;(s.children || []).forEach(d => {
      if (d.value !== docType) return
      const trades = (d.children || []).map(t => t.value)
      matches.push({ sourceSystem: s.value, trades })
    })
  })
  if (!matches.length) return ''
  if (preferredTradeType) {
    const hit = matches.find(m => m.trades.includes(preferredTradeType))
    if (hit) return hit.sourceSystem
  }
  if (matches.length === 1) return matches[0].sourceSystem
  return matches[0].sourceSystem
}

export function isValidCascadePath(sourceSystem, docType, tradeType) {
  if (!sourceSystem || !docType || !tradeType) return false
  return listTradeTypes(sourceSystem, docType).some(t => t.value === tradeType)
}
