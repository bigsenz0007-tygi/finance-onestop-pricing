import { getScenarioFeeItems } from '../mock/scenarioPricing'

/**
 * 场景报价：定价侧多费用项时，分区须覆盖全部费用项，否则「报价不完整」
 * @returns {{ ok: boolean, message?: string, missing?: string[] }}
 */
export function validateScenarioFeeCoverage({ quotationMethod, discountProduct, businessScenario, partitions, selectedDims }) {
  if (quotationMethod !== '场景报价') return { ok: true }
  if (!selectedDims || !selectedDims.includes('费用项')) {
    // 未勾选费用项维度时，按场景清单至少存在一条分区即可
    if (!partitions || !partitions.length) {
      return { ok: false, message: '报价不完整：请至少配置一个价格分区', missing: [] }
    }
    return { ok: true }
  }
  const required = getScenarioFeeItems(discountProduct, businessScenario)
  if (!required.length) return { ok: true }
  const quoted = new Set(
    (partitions || [])
      .map(p => (p.feeItem || '').trim())
      .filter(Boolean)
  )
  const missing = required.filter(fee => !quoted.has(fee))
  if (missing.length) {
    return {
      ok: false,
      message: `报价不完整：场景费用项须全部报价，缺少「${missing.join('、')}」`,
      missing
    }
  }
  return { ok: true }
}
