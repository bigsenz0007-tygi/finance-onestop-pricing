import React, { useState } from 'react';

// 报价模式 → 计费因子 & 价格项 配置映射
const MODE_CONFIG = {
  '首续重计费': {
    factors: [
      { key: 'weight', label: '实重 (kg)', type: 'number', placeholder: '请输入实重' },
    ],
    priceItems: [
      { key: 'firstWeightLimit', label: '首重阈值 (kg)', type: 'number', placeholder: '如 1 或 3' },
      { key: 'firstWeightPrice', label: '首重价 (元)', type: 'number', placeholder: '如 10.00' },
      { key: 'continueUnitPrice', label: '续重单价 (元/kg)', type: 'number', placeholder: '如 2.50' },
    ],
  },
  '按件型': {
    factors: [
      { key: 'pieceCount', label: '件数 (件)', type: 'number', placeholder: '请输入件数' },
    ],
    priceItems: [
      { key: 'unitPrice', label: '单件价 (元)', type: 'number', placeholder: '如 5.00' },
      { key: 'minFee', label: '起步价 (元)', type: 'number', placeholder: '如 10.00' },
    ],
  },
  '按方': {
    factors: [
      { key: 'volume', label: '体积 (m³)', type: 'number', placeholder: '请输入体积' },
    ],
    priceItems: [
      { key: 'cbmPrice', label: '方单价 (元/m³)', type: 'number', placeholder: '如 120.00' },
      { key: 'minFee', label: '起步价 (元)', type: 'number', placeholder: '如 50.00' },
    ],
  },
  '一口价': {
    factors: [],
    priceItems: [
      { key: 'flatFee', label: '一口价 (元)', type: 'number', placeholder: '如 200.00' },
    ],
  },
  '百分比提成': {
    factors: [
      { key: 'baseAmount', label: '基数金额 (元)', type: 'number', placeholder: '请输入基数金额' },
    ],
    priceItems: [
      { key: 'rate', label: '提成比例 (%)', type: 'number', placeholder: '如 5 表示 5%' },
      { key: 'minFee', label: '最低收费 (元)', type: 'number', placeholder: '可不填' },
    ],
  },
};

const QUOTE_MODES = Object.keys(MODE_CONFIG);

const SimulationTest = ({ data, onChange, formData }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [partition, setPartition] = useState('');

  // 模拟从第2步获取分区列表，如果没有则给默认mock数据
  const partitionList = formData?.partitions?.length > 0 
    ? formData.partitions 
    : [{ id: 'mock1', name: '华东一区' }, { id: 'mock2', name: '华北一区' }];
  const [testType, setTestType] = useState('manual'); // manual | realOrder
  const [factorValues, setFactorValues] = useState({ weight: '', volume: '', businessVolume: '', orderNo: '' });

  const resetValues = () => {
    setFactorValues({ weight: '', volume: '', businessVolume: '', orderNo: '' });
    setResult(null);
  };

  const setFactor = (k, v) => setFactorValues((prev) => ({ ...prev, [k]: v }));

  const isReady = () => {
    if (!partition) return false;
    if (testType === 'manual') {
      return factorValues.weight || factorValues.volume || factorValues.businessVolume;
    }
    return !!factorValues.orderNo;
  };

  const handleSimulate = () => {
    if (!isReady()) return;
    setLoading(true);

    // 简化测算逻辑：结合带出的明细，依据输入的因子做简单的模拟费用计算
    const num = (x) => parseFloat(x || 0);
    let total = 0;
    const detail = [];

    const w = testType === 'manual' ? num(factorValues.weight) : 5;
    const v = testType === 'manual' ? num(factorValues.volume) : 0.02;
    const bv = testType === 'manual' ? num(factorValues.businessVolume) : 10;

    if (w > 0) {
      const weightFee = w * 2.5; // 假设重量单价2.5
      total += weightFee;
      detail.push({ name: '重量费用 (2.5元/kg)', amount: weightFee.toFixed(2) });
    }
    if (v > 0) {
      const volumeFee = v * 120; // 假设体积单价120
      total += volumeFee;
      detail.push({ name: '体积费用 (120元/m³)', amount: volumeFee.toFixed(2) });
    }
    if (bv > 0) {
      const bvFee = bv * 1.2; // 假设操作单价1.2
      total += bvFee;
      detail.push({ name: '操作费用 (1.2元/单)', amount: bvFee.toFixed(2) });
    }
    
    // 模拟匹配到明细中折扣 100%
    if (total > 0) {
      detail.push({ name: '匹配折扣 (100%)', amount: total.toFixed(2) });
    }

    setTimeout(() => {
      const processText = "计算过程：计费重量=max(重量[3.68],体积[7361.579]/轻抛系数[8000]),[0.5进位]（业务进位）;计费重量[4]>首重[3],金额=(首重价格[4.9608]+(计费重量[4]-首重公斤[3])/续重公斤[1]*续重价格[0.901]),[保留9位小数]（金额进位）";
      setResult({ totalFee: total.toFixed(2), calculationProcess: processText });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="space-y-6"
      data-ai-alt="模拟测算区域"
      data-ai-changelog-id="simulation-test-step"
      data-ai-changelog-title="新增模拟测算步骤"
      data-ai-changelog-desc="在扩展点后新增模拟测算步骤，支持选择配置并输入因子验证价格"
    >
      {/* 价格分区选择 */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200"
        data-ai-alt="价格分区选择"
        data-ai-changelog-id="simulation-partition-select"
        data-ai-changelog-title="测算价格分区选择"
        data-ai-changelog-desc="价格分区选择从第2步录入的信息中获取"
      >
        <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center">
          <i className="fa-solid fa-map-location-dot text-indigo-500 mr-2"></i>价格分区选择
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">选择价格分区</label>
            <select
              className="w-full h-10 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              value={partition}
              onChange={(e) => setPartition(e.target.value)}
              data-ai-alt="选择对应的价格分区"
            >
              <option value="">请选择在第2步中录入的价格分区</option>
              {partitionList.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* 选中分区后带出报价明细展示 */}
        {partition && (
          <div className="mt-6 pt-6 border-t border-gray-200" data-ai-alt="分区报价明细展示">
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-700">
              <div className="font-medium text-gray-900">当前配置分区: <span className="ml-1 font-bold">{partition}</span></div>
              <div className="flex items-center gap-2">
                <span>统计对象:</span>
                <span className="px-2 py-1 border border-gray-300 rounded bg-white text-xs">月度单量</span>
              </div>

              <div className="flex items-center gap-2">
                <span>单票阶梯模式:</span>
                <span className="px-2 py-1 border border-gray-300 rounded bg-white text-xs">计费重量</span>
              </div>
              <div className="flex items-center gap-2">
                <span>区间开闭类型:</span>
                <span className="px-2 py-1 border border-gray-300 rounded bg-white text-xs">前开后闭</span>
              </div>
              <div className="flex items-center gap-2">
                <span>业务进位:</span>
                <select className="h-7 px-2 border border-gray-300 rounded text-xs outline-none bg-white">
                  <option>0.5进位</option>
                  <option>1进位</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span>轻抛系数:</span>
                <input type="text" placeholder="请输入" className="h-7 w-20 px-2 border border-gray-300 rounded text-xs outline-none bg-white" />
              </div>
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="py-2 px-3 font-medium">统计最小值(不含)</th>
                    <th className="py-2 px-3 font-medium">统计最大值(含)</th>
                    <th className="py-2 px-3 font-medium">单票阶梯最小值(不含)</th>
                    <th className="py-2 px-3 font-medium">单票阶梯最大值(含)</th>
                    <th className="py-2 px-3 font-medium">折扣模式</th>
                    <th className="py-2 px-3 font-medium">报价明细</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr>
                    <td className="py-2 px-3">0</td>
                    <td className="py-2 px-3">30</td>
                    <td className="py-2 px-3">0</td>
                    <td className="py-2 px-3">无穷大</td>
                    <td className="py-2 px-3">折扣率</td>
                    <td className="py-2 px-3">数值: 100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 计费因子录入 */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200"
        data-ai-alt="计费因子录入"
        data-ai-changelog-id="simulation-billing-factors"
        data-ai-changelog-title="测算计费因子录入"
        data-ai-changelog-desc="在测算中基于报价明细录入测试的业务量、重量、体积等计费因子"
      >
        <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center">
          <i className="fa-solid fa-list-ol text-indigo-500 mr-2"></i>计费因子录入
        </h4>

        <div className="flex items-center gap-6 mb-6" data-ai-alt="测算类型选择">
          <label className="text-sm font-medium text-gray-700">测算类型:</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="testType" 
                value="manual" 
                checked={testType === 'manual'} 
                onChange={() => setTestType('manual')} 
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">手工录入</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="testType" 
                value="realOrder" 
                checked={testType === 'realOrder'} 
                onChange={() => setTestType('realOrder')} 
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">实单</span>
            </label>
          </div>
        </div>

        {testType === 'manual' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">重量 (kg)</label>
              <input type="number" value={factorValues.weight} onChange={(e) => setFactor('weight', e.target.value)} placeholder="请输入重量" className="h-9 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">体积 (m³)</label>
              <input type="number" value={factorValues.volume} onChange={(e) => setFactor('volume', e.target.value)} placeholder="请输入体积" className="h-9 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">统计对象业务量 (月度单量)</label>
              <input type="number" value={factorValues.businessVolume} onChange={(e) => setFactor('businessVolume', e.target.value)} placeholder="请输入当月单量" className="h-9 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">业务单号</label>
              <input type="text" value={factorValues.orderNo} onChange={(e) => setFactor('orderNo', e.target.value)} placeholder="请输入业务单号获取真实单据信息进行测算" className="h-9 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm" />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSimulate}
            disabled={loading || !isReady()}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded font-medium shadow hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
            data-ai-alt="开始测算按钮"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-calculator"></i>}
            开始模拟测算
          </button>
        </div>
      </div>

      {/* 费用计算结果 */}
      {result && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 animate-fade-in"
          data-ai-alt="费用计算结果"
          data-ai-changelog-id="simulation-calculation-result"
          data-ai-changelog-title="测算费用计算"
          data-ai-changelog-desc="展示计费过程和总金额结果"
        >
          <h4 className="text-md font-bold text-green-800 mb-4 flex items-center">
            <i className="fa-solid fa-file-invoice-dollar text-green-500 mr-2"></i>费用计算
          </h4>
          <div className="flex items-end gap-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">预估总金额：</div>
            <div className="text-3xl font-bold text-green-600">¥ {result.totalFee}</div>
          </div>
          <div className="bg-white rounded border border-green-100 p-4">
            <div className="text-sm font-bold text-gray-700 mb-3">计算过程</div>
            <div className="text-sm text-gray-600 leading-relaxed break-words">
              {result.calculationProcess}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationTest;
