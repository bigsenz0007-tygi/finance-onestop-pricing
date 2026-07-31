/**
 * 财务计费工作台导航（对齐 Figma：0629导航更新 / 230:22605）
 * 一级栏顺序：首页 → 数据中心 → 一键中心 → 报价中心 → 定价中心 → 异常中心 → 测算中心
 * 图标为 Figma 导出资源（public/d2c-assets/nav）
 * 定价 / 报价保留二级浮层，接入现有业务页
 */
const NAV_ICON = (name) => {
  const base = process.env.BASE_URL || '/'
  return `${base}d2c-assets/nav/${name}`
}

export const SIDEBAR_MENUS = [
  { id: 'home', label: '首页', iconSrc: NAV_ICON('icon-home.svg') },
  { id: 'data', label: '数据中心', iconSrc: NAV_ICON('icon-data.svg') },
  { id: 'onelink', label: '一键中心', iconSrc: NAV_ICON('icon-onelink.svg') },
  { id: 'quoting', label: '报价中心', iconSrc: NAV_ICON('icon-quoting.svg'), hasSub: true },
  { id: 'pricing', label: '定价中心', iconSrc: NAV_ICON('icon-pricing.svg'), hasSub: true },
  { id: 'exception', label: '异常中心', iconSrc: NAV_ICON('icon-exception.svg') },
  { id: 'calc', label: '测算中心', iconSrc: NAV_ICON('icon-calc.svg') }
]

/** 定价中心二级菜单（3 项） */
export const PRICING_SUBMENUS = [
  { id: 'billing-docs', label: '计费单据管理', route: 'billing-docs' },
  { id: 'pricing-capability', label: '业务类型管理', route: 'pricing-capability' },
  { id: 'onestop-pricing', label: '一站定价', route: 'onestop-pricing-home' }
]

/** 报价中心二级菜单（1 项） */
export const QUOTING_SUBMENUS = [
  { id: 'onestop-quoting', label: '一站报价', route: 'onestop-quoting-home' }
]

export function getSubmenus(railId) {
  if (railId === 'pricing') return PRICING_SUBMENUS
  if (railId === 'quoting') return QUOTING_SUBMENUS
  return []
}

/** 根据业务页反查应高亮的二级菜单 id */
export function resolveSubmenuId(page) {
  if (page === 'billing-docs') return 'billing-docs'
  if (page === 'pricing-capability') return 'pricing-capability'
  if (page === 'onestop-pricing-home' || page === 'onestop-pricing') return 'onestop-pricing'
  if (page === 'onestop-quoting-home' || page === 'onestop-quoting') return 'onestop-quoting'
  return ''
}
