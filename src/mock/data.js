export const BILLING_DOCS = [
  {
    id: 'DOC202606150001',
    sourceSystem: '仓储系统',
    docType: '入库单',
    tradeType: '正常交易',
    direction: '应收',
    billingNode: '揽收',
    bizLine: '冷链物流',
    status: '已启用',
    isMerchantAccess: '是'
  },
  {
    id: 'DOC202606150002',
    sourceSystem: '配送系统',
    docType: '派车单',
    tradeType: '客退交易',
    direction: '应付',
    billingNode: '妥投',
    bizLine: '大件物流',
    status: '已停用',
    isMerchantAccess: '否'
  }
]

export const BILLING_ELEMENTS = [
  { name: '重量', code: 'WEIGHT', dataDimension: '包裹', dimension: true, factor: true, condition: false },
  { name: '体积', code: 'VOLUME', dataDimension: '包裹', dimension: true, factor: true, condition: false },
  { name: '始发省', code: 'START_PROV', dataDimension: '整单', dimension: true, factor: false, condition: true },
  { name: '始发城市', code: 'START_CITY', dataDimension: '整单', dimension: true, factor: false, condition: true },
  { name: '商家编码', code: 'MERCHANT_ID', dataDimension: '整单', dimension: false, factor: false, condition: true },
  { name: '业务单号', code: 'BIZ_NO', dataDimension: '整单', dimension: false, factor: false, condition: false }
]

export const BILLING_LOGS = [
  { operator: '张**', action: '新建单据计费要素', time: '2026-06-15 10:20:00' },
  { operator: '李**', action: '启用单据', time: '2026-06-15 11:30:15' }
]

export const SCENARIOS = [
  {
    code: 'GPZZFW',
    name: '共配增值服务',
    billingTarget: '整单',
    billingType: '产品定价',
    direction: '应收',
    status: '启用',
    creator: '张三',
    createdAt: '2023-10-01 12:00:00',
    remark: '-'
  },
  {
    code: 'LL_BCTGCK',
    name: '冷链B仓退供出库',
    billingTarget: '明细',
    billingType: '业务场景定价',
    direction: '应付',
    status: '停用',
    creator: '李四',
    createdAt: '2023-10-02 14:30:00',
    remark: '-'
  },
  {
    code: 'TEST_DIS',
    name: '测试停用数据',
    billingTarget: '整单',
    billingType: '产品定价',
    direction: '应付',
    status: '停用',
    creator: '王五',
    createdAt: '2023-10-03 09:15:00',
    remark: '-'
  },
  {
    code: 'INIT_TEST',
    name: '测试初始化数据',
    billingTarget: '明细',
    billingType: '产品定价',
    direction: '应收',
    status: '启用',
    creator: '赵六',
    createdAt: '2023-10-04 16:45:00',
    remark: '-'
  }
]

export const BIZ_TYPES = [
  {
    code: 'THS_THM',
    name: '特惠送-内地至港澳',
    category: '运配',
    direction: '应收',
    status: '启用',
    creator: '张三',
    createdAt: '2023-10-01 12:00:00',
    remark: '-'
  },
  {
    code: 'THS_HK',
    name: '特惠送-香港出发',
    category: '运配',
    direction: '应收',
    status: '启用',
    creator: '李四',
    createdAt: '2023-10-02 14:30:00',
    remark: '-'
  },
  {
    code: 'THS_MC',
    name: '特惠送-澳门出发',
    category: '运配',
    direction: '应收',
    status: '停用',
    creator: '王五',
    createdAt: '2023-10-03 09:15:00',
    remark: '-'
  },
  {
    code: 'QL-YW-010',
    name: '特惠送-仓配一体',
    category: '仓配',
    direction: '应付',
    status: '启用',
    creator: '赵六',
    createdAt: '2023-10-04 16:45:00',
    remark: '-'
  }
]

export const PRODUCT_FEE_ROWS = [
  { feeItem: '快递运费(QIPSF)', bizType: '', standardPrice: '京东标快20250801(250801JDBKZXJG)', currency: '人民币' },
  { feeItem: '快递运费(QIPSF)', bizType: '特惠送-内地至港澳(THS_THM)', standardPrice: '特惠送-内地至港澳报价(THS-NDZGAC)', currency: '人民币' },
  { feeItem: '快递运费(QIPSF)', bizType: '特惠送-香港出发(THS_HK)', standardPrice: '特惠送-香港出发报价新', currency: '港币' },
  { feeItem: '快递运费(QIPSF)', bizType: '特惠送-澳门出发(THS_MC)', standardPrice: '特惠送-澳门出发报价新(THS-AMJGX)', currency: '澳门元' },
  { feeItem: '快递运费(QIPSF)', bizType: '特惠送-仓配一体(QL-YW-010)', standardPrice: '京东标快20250801(250801JDBKZXJG)', currency: '人民币' }
]
