/** 场景定价下发的可选维度（枚举较多，配置页用可筛选多选下拉） */
export const SCENARIO_QUOTE_DIMS = [
  '费用项',
  '商家订单类型',
  '配送类型',
  '正逆向',
  '产品类型',
  '温层',
  '运输方式',
  '包裹类型',
  '结算币种',
  '时效产品',
  '渠道来源',
  '商家标签'
]

/** 场景 → 须报价的费用项清单（名称） */
export const SCENARIO_FEE_ITEMS = {
  大件特配: ['运费', '包装费'],
  普通重货: ['运费'],
  标准运输: ['运费'],
  生鲜特配: ['运费', '温控费'],
  大促活动: ['运费', '加急费'],
  同城特快: ['运费'],
  跨省加急: ['运费', '加急费'],
  默认: ['运费']
}

/** 费用项编码（多选展示用：名称(编码)） */
const FEE_ITEM_CODES = {
  运费: 'P-YF-001',
  包装费: 'lq-a-pack',
  温控费: 'lq-a-temp',
  加急费: 'lq-a-urgent'
}

export function getScenarioFeeItems(discountProduct, businessScenario) {
  if (!businessScenario) return SCENARIO_FEE_ITEMS.默认
  if (SCENARIO_FEE_ITEMS[businessScenario]) return SCENARIO_FEE_ITEMS[businessScenario]
  if (/配|促|加急|仓/.test(businessScenario)) return ['运费', '包装费']
  return SCENARIO_FEE_ITEMS.默认
}

/** 带编码的费用项选项，供分区费用项下拉（collapse-tags 多选观感） */
export function getScenarioFeeItemOptions(discountProduct, businessScenario) {
  return getScenarioFeeItems(discountProduct, businessScenario).map(name => ({
    value: name,
    label: `${name}(${FEE_ITEM_CODES[name] || name})`
  }))
}

/** 报价拓展规则：从场景定价带出的合单/统计枚举 */
export const QUOTE_MERGE_DIM_OPTIONS = ['相同收件人', '相同地址', '商家订单号', '运单号']
export const QUOTE_MERGE_TARGET_OPTIONS = ['重量', '体积', '件数', '金额', '票量']
export const QUOTE_APPORTION_OPTIONS = ['按重量分摊', '按体积分摊', '按件数分摊', '按金额分摊']
export const QUOTE_STAT_DIM_OPTIONS = ['始发城市', '目的城市', '商家', '产品类型']
export const QUOTE_STAT_TARGET_OPTIONS = ['商家单量', '重量', '体积', '票量']
export const SUBSTITUTE_MODE_RULES = ['身份优先替核', '商家优先替核', '价格本优先替核']
