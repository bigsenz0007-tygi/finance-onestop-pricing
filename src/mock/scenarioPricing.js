/** 场景定价下发的可选维度与费用项（预览 mock） */
export const SCENARIO_QUOTE_DIMS = ['费用项', '商家订单类型', '配送类型', '正逆向']

/** 场景 → 须报价的费用项清单 */
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

export function getScenarioFeeItems(discountProduct, businessScenario) {
  if (!businessScenario) return SCENARIO_FEE_ITEMS.默认
  if (SCENARIO_FEE_ITEMS[businessScenario]) return SCENARIO_FEE_ITEMS[businessScenario]
  // 多费用项演示：名称含「配/促/加急」则两项
  if (/配|促|加急|仓/.test(businessScenario)) return ['运费', '包装费']
  return SCENARIO_FEE_ITEMS.默认
}
