/**
 * 预览用富数据：多价格分区 + 多报价明细行，便于验证分区筛选与表格横滑。
 */

const REGIONS = [
  {
    name: '华东-沪深线',
    from: ['上海市-上海市-徐汇区-斜土路街道', '上海市-上海市-浦东新区-陆家嘴街道'],
    to: ['广东省-深圳市-南山区-粤海街道', '广东省-广州市-天河区-天河南街道']
  },
  {
    name: '华北-京杭线',
    from: ['北京市-北京市-朝阳区-望京街道'],
    to: ['浙江省-杭州市-余杭区-五常街道', '浙江省-杭州市-西湖区-西溪街道']
  },
  {
    name: '华南-广蓉线',
    from: ['广东省-广州市-天河区-猎德街道'],
    to: ['四川省-成都市-武侯区-桂溪街道']
  },
  {
    name: '华中-汉渝线',
    from: ['湖北省-武汉市-武昌区-中南路街道'],
    to: ['重庆市-重庆市-渝北区-龙溪街道']
  },
  {
    name: '西南-蓉昆线',
    from: ['四川省-成都市-高新区-中和街道'],
    to: ['云南省-昆明市-五华区-华山街道']
  },
  {
    name: '西北-西安线',
    from: ['陕西省-西安市-雁塔区-小寨路街道'],
    to: ['甘肃省-兰州市-城关区-酒泉路街道']
  },
  {
    name: '东北-沈哈线',
    from: ['辽宁省-沈阳市-和平区-南湖街道'],
    to: ['黑龙江省-哈尔滨市-南岗区-革新街道']
  },
  {
    name: '华东-苏宁线',
    from: ['江苏省-南京市-鼓楼区-宁海路街道'],
    to: ['江苏省-苏州市-工业园区-唯亭街道']
  }
]

const ORDER_TYPES = ['普通订单', '预售订单', '赠品订单', '换货订单']
const DELIVERY_TYPES = ['快递', '快运', '整车', '落地配']
const DIRECTIONS = ['正向', '逆向']
const FEE_ITEMS = ['运费', '包装费', '保价费', '附加费']
const DISCOUNT_MODES = ['折扣率', '一口价', '首续重报价']

function buildStairRows(prefix, count, stairMode) {
  const rows = []
  for (let i = 0; i < count; i += 1) {
    const mode = DISCOUNT_MODES[i % DISCOUNT_MODES.length]
    const isLast = i === count - 1
    const showStat = stairMode !== '无'
    const showStair = stairMode === '计费重量' || stairMode === '体积'
    const row = {
      id: `${prefix}-R${i + 1}`,
      statMin: showStat ? i * 50 : '',
      statMax: showStat ? (isLast ? 9999 : (i + 1) * 50) : '',
      stairMin: showStair ? i * 5 : '',
      stairMax: showStair ? (isLast ? '无穷大' : (i + 1) * 5) : '',
      discountMode: mode,
      discountDetail: mode === '折扣率' ? String(100 - i * 2) : (mode === '一口价' ? String(8 + i) : ''),
      firstWeight: mode === '首续重报价' ? '1' : '',
      firstWeightPrice: mode === '首续重报价' ? String(10 + i) : '',
      continueWeight: mode === '首续重报价' ? '1' : '',
      continueWeightPrice: mode === '首续重报价' ? String(2 + (i % 3)) : '',
      rowLightThrow: mode === '首续重报价' ? String(5000 + i * 200) : ''
    }
    rows.push(row)
  }
  return rows
}

function buildPartitionsAndDetails({
  idPrefix,
  partitionCount,
  rowsPerPartition,
  selectedDims,
  withStats
}) {
  const partitions = []
  const detailMap = {}
  for (let i = 0; i < partitionCount; i += 1) {
    const region = REGIONS[i % REGIONS.length]
    const pid = `${idPrefix}-P${i + 1}`
    const feeItem = FEE_ITEMS[i % FEE_ITEMS.length]
    const stairMode = i % 5 === 4 ? '无' : (i % 3 === 2 ? '体积' : '计费重量')
    const partition = {
      id: pid,
      name: `${region.name}-${i + 1}`,
      applyNo: `SQ-${idPrefix}-${String(i + 1).padStart(3, '0')}`,
      contractCode: `HT-${idPrefix}-${String(i + 1).padStart(3, '0')}`,
      statGroup: withStats ? String((i % 5) + 1) : '',
      statBillingObject: withStats ? (i % 2 === 0 ? '统计+计费' : '仅计费') : '',
      fromAddress: region.from.slice(),
      toAddress: region.to.slice(),
      feeItem: selectedDims.includes('费用项') ? feeItem : '',
      orderType: selectedDims.includes('商家订单类型') ? ORDER_TYPES[i % ORDER_TYPES.length] : '',
      deliveryType: selectedDims.includes('配送类型') ? DELIVERY_TYPES[i % DELIVERY_TYPES.length] : '',
      direction: selectedDims.includes('正逆向') ? DIRECTIONS[i % DIRECTIONS.length] : ''
    }
    partitions.push(partition)

    const progress = i % 2 === 0 ? '全量累进' : '超量累进'
    const interval = i % 2 === 0 ? '前开后闭' : '前闭后开'
    detailMap[pid] = {
      stairMode,
      stairProgress: stairMode === '无' ? '' : progress,
      statTarget: withStats ? (i % 2 === 0 ? '月度单量' : '月度金额') : '',
      intervalType: stairMode === '无' ? '' : interval,
      businessCarry: stairMode === '计费重量' || stairMode === '体积'
        ? (i % 2 === 0 ? '0.5 进位' : '四舍五入取整')
        : '',
      lightThrow: stairMode === '计费重量' ? String(5000 + i * 300) : '',
      rows: buildStairRows(pid, rowsPerPartition, stairMode)
    }
  }
  return { partitions, detailMap }
}

/** 预览样例1：12 个分区，每区 15 条明细（>10，可看分页） */
export const QUOTING_PREVIEW_RICH_A = (() => {
  const selectedDims = ['费用项', '商家订单类型', '正逆向', '配送类型']
  const { partitions, detailMap } = buildPartitionsAndDetails({
    idPrefix: 'Q4',
    partitionCount: 12,
    rowsPerPartition: 15,
    selectedDims,
    withStats: true
  })
  return {
    id: 'Q4',
    schemeCode: 'BJ-20260806-004',
    name: '【预览】多分区横滑样例-华东网络',
    method: '场景报价',
    merchantCode: '880011001',
    merchantName: '多分区预览客户A',
    businessScenario: '大件特配',
    productType: '重货标快',
    discountProduct: '重货标快',
    strategy: '统计考核',
    status: '已启用',
    creator: '预览**',
    createdAt: '2026-08-06 10:00:00',
    signRegion: '华东',
    effectiveRange: ['2026-08-01', '2026-12-31'],
    complexQuoteOpen: false,
    selectedDims,
    partitions,
    detailMap,
    extension: {
      mergeDimensions: [],
      mergeTargets: [],
      apportionBasis: [],
      statDimensions: ['始发城市', '目的城市'],
      statTargets: ['商家单量', '商家金额']
    },
    base: {
      quotationName: '【预览】多分区横滑样例-华东网络',
      merchantCode: '880011001',
      merchantName: '多分区预览客户A',
      signRegion: '华东',
      effectiveRange: ['2026-08-01', '2026-12-31'],
      quotationMethod: '场景报价',
      discountProduct: '重货标快',
      businessScenario: '大件特配',
      settlementMethod: '月结',
      billingStrategy: '统计考核',
      statisticsMethod: '按考核开始月份',
      assessmentStartMonth: '2026-08',
      amountRounding: '四舍五入取整',
      separateMerchantAccount: '否',
      hasIdentityPriority: '否',
      identityPriority: '',
      substituteModeRule: '',
      addressLevelMatch: '是'
    }
  }
})()

/** 预览样例2：18 个分区，每区 16 条明细（分区筛选 + 表横滑 + 分页） */
export const QUOTING_PREVIEW_RICH_B = (() => {
  const selectedDims = ['费用项', '配送类型', '正逆向']
  const { partitions, detailMap } = buildPartitionsAndDetails({
    idPrefix: 'Q5',
    partitionCount: 18,
    rowsPerPartition: 16,
    selectedDims,
    withStats: true
  })
  return {
    id: 'Q5',
    schemeCode: 'BJ-20260806-005',
    name: '【预览】超多分区明细样例-全国网络',
    method: '场景报价',
    merchantCode: '880011002',
    merchantName: '多分区预览客户B',
    businessScenario: '大促活动',
    productType: '京东标快',
    discountProduct: '京东标快',
    strategy: '统计+合单',
    status: '草稿',
    creator: '预览**',
    createdAt: '2026-08-06 10:30:00',
    signRegion: '华北',
    effectiveRange: ['2026-08-01', '2027-01-31'],
    complexQuoteOpen: true,
    selectedDims,
    partitions,
    detailMap,
    extension: {
      mergeDimensions: ['商家订单号', '包裹号'],
      mergeTargets: ['重量', '体积'],
      apportionBasis: ['按重量分摊', '按体积分摊'],
      statDimensions: ['始发城市'],
      statTargets: ['商家单量']
    },
    base: {
      quotationName: '【预览】超多分区明细样例-全国网络',
      merchantCode: '880011002',
      merchantName: '多分区预览客户B',
      signRegion: '华北',
      effectiveRange: ['2026-08-01', '2027-01-31'],
      quotationMethod: '场景报价',
      discountProduct: '京东标快',
      businessScenario: '大促活动',
      settlementMethod: '月结',
      billingStrategy: '统计+合单',
      statisticsMethod: '按考核开始月份',
      assessmentStartMonth: '2026-08',
      amountRounding: '四舍五入取整',
      separateMerchantAccount: '否',
      hasIdentityPriority: '否',
      identityPriority: '',
      substituteModeRule: '',
      addressLevelMatch: '是'
    }
  }
})()

export const QUOTING_PREVIEW_SAMPLES = [QUOTING_PREVIEW_RICH_A, QUOTING_PREVIEW_RICH_B]
