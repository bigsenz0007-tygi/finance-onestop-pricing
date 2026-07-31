export const TABLE_DATA = [
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
];

export const ELEMENTS_MOCK = [
  { name: '重量', code: 'WEIGHT', dataDimension: '包裹', dimension: true, factor: true, condition: false },
  { name: '体积', code: 'VOLUME', dataDimension: '包裹', dimension: true, factor: true, condition: false },
  { name: '始发省', code: 'START_PROV', dataDimension: '整单', dimension: true, factor: false, condition: true },
  { name: '始发城市', code: 'START_CITY', dataDimension: '整单', dimension: true, factor: false, condition: true },
  { name: '商家编码', code: 'MERCHANT_ID', dataDimension: '整单', dimension: false, factor: false, condition: true },
  { name: '业务单号', code: 'BIZ_NO', dataDimension: '整单', dimension: false, factor: false, condition: false }
];

export const LOG_DATA = [
  { operator: '张**', action: '新建单据计费要素', time: '2026-06-15 10:20:00' },
  { operator: '李**', action: '启用单据', time: '2026-06-15 11:30:15' }
];