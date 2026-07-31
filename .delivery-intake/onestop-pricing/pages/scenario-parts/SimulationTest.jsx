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
  const [mode, setMode] = useState('');
  const [factorValues, setFactorValues] = useState({});
  const [priceValues, setPriceValues] = useState({});

  const resetValues = () => {
    setFactorValues({});
    setPriceValues({});
    setResult(null);
  };

  const handleModeChange = (e) => {
    const v = e.target.value;
    setMode(v);
    resetValues();
  };

  const setFactor = (k, v) => setFactorValues((prev) => ({ ...prev, [k]: v }));
  const setPrice = (k, v) => setPriceValues((prev) => ({ ...prev, [k]: v }));

  const isReady = () => {
    if (!mode) return false;
    const cfg = MODE_CONFIG[mode];
    const fOk = (cfg.factors || []).every((f) => factorValues[f.key] !== undefined && factorValues[f.key] !== '');
    const pOk = (cfg.priceItems || []).every((p) => priceValues[p.key] !== undefined && priceValues[p.key] !== '');
    return fOk && pOk;
  };

  const handleSimulate = () => {
    if (!isReady()) return;
    setLoading(true);

    // 简化测算逻辑：依据不同模式做基础计算，生成 demo 结果
    const num = (x) => parseFloat(x || 0);
    let total = 0;
    const detail = [];

    if (mode === '首续重计费') {
      const w = num(factorValues.weight);
      const limit = num(priceValues.firstWeightLimit);
      const firstFee = num(priceValues.firstWeightPrice);
      const contUnit = num(priceValues.continueUnitPrice);
      const contWeight = Math.max(0, w - limit);
      total = firstFee + contWeight * contUnit;
      detail.push({ name: '首重费', amount: firstFee.toFixed(2) });
      if (contWeight > 0) detail.push({ name: '续重费', amount: (contWeight * contUnit).toFixed(2) });
    } else if (mode === '按件型') {
      const n = num(factorValues.pieceCount);
      const unit = num(priceValues.unitPrice);
      const minFee = num(priceValues.minFee);
      total = Math.max(minFee, n * unit);
      detail.push({ name: '件数费用', amount: (n * unit).toFixed(2) });
      if (total === minFee) detail.push({ name: '起步价补差', amount: (minFee - n * unit).toFixed(2) });
    } else if (mode === '按方') {
      const v = num(factorValues.volume);
      const cbm = num(priceValues.cbmPrice);
      const minFee = num(priceValues.minFee);
      total = Math.max(minFee, v * cbm);
      detail.push({ name: '体积费用', amount: (v * cbm).toFixed(2) });
      if (total === minFee) detail.push({ name: '起步价补差', amount: (minFee - v * cbm).toFixed(2) });
    } else if (mode === '一口价') {
      total = num(priceValues.flatFee);
      detail.push({ name: '一口价', amount: total.toFixed(2) });
    } else if (mode === '百分比提成') {
      const base = num(factorValues.baseAmount);
      const rate = num(priceValues.rate) / 100;
      const minFee = num(priceValues.minFee);
      const fee = base * rate;
      total = Math.max(minFee || 0, fee);
      detail.push({ name: '提成额', amount: fee.toFixed(2) });
      if (minFee && total === minFee) detail.push({ name: '最低收费', amount: minFee.toFixed(2) });
    }

    setTimeout(() => {
      setResult({ totalFee: total.toFixed(2), detail });
      setLoading(false);
    }, 400);
  };

  const currentCfg = mode ? MODE_CONFIG[mode] : { factors: [], priceItems: [] };

  return (
    <div className="space-y-6"
      data-ai-alt="模拟测算区域"
      data-ai-changelog-id="simulation-test-step"
      data-ai-changelog-title="新增模拟测算步骤"
      data-ai-changelog-desc="在扩展点后新增模拟测算步骤，支持选择配置并输入因子验证价格"
    >
      {/* 测算配置 */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200"
        data-ai-alt="测算基础配置"
        data-ai-changelog-id="simulation-mode-linked-fields"
        data-ai-changelog-title="模拟测算：报价模式关联字段"
        data-ai-changelog-desc="在模拟测算中，报价模式与计费因子、价格项联动；切换模式重置字段"
      >
        <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center">
          <i className="fa-solid fa-sliders text-indigo-500 mr-2"></i>测算参数配置
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">报价模式</label>
            <select
              className="w-full h-10 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
              value={mode}
              onChange={handleModeChange}
              data-ai-alt="选择报价模式"
            >
              <option value="">请选择报价模式</option>
              {QUOTE_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 计费因子（第一层） */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200"
        data-ai-alt="计费因子层"
        data-ai-changelog-id="simulation-billing-factors"
        data-ai-changelog-title="模拟测算：计费因子层"
        data-ai-changelog-desc="将计费因子独立为第一层，随报价模式联动展示对应字段"
      >
        <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center">
          <i className="fa-solid fa-list-ol text-indigo-500 mr-2"></i>计费因子
        </h4>
        {currentCfg.factors.length === 0 ? (
          <div className="text-sm text-gray-500" data-ai-alt="无因子提示">该模式无需录入计费因子</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {currentCfg.factors.map((f) => (
              <div key={f.key} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  placeholder={f.placeholder || '请输入'}
                  value={factorValues[f.key] ?? ''}
                  onChange={(e) => setFactor(f.key, e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  data-ai-alt={`因子-${f.label}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 价格项（第二层） */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200"
        data-ai-alt="价格项层"
        data-ai-changelog-id="simulation-price-items"
        data-ai-changelog-title="模拟测算：价格项层"
        data-ai-changelog-desc="将价格项独立为第二层，随报价模式联动展示对应字段"
      >
        <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center">
          <i className="fa-solid fa-yen-sign text-indigo-500 mr-2"></i>价格项
        </h4>
        {currentCfg.priceItems.length === 0 ? (
          <div className="text-sm text-gray-500" data-ai-alt="无价格项提示">该模式无需单独配置价格项</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {currentCfg.priceItems.map((p) => (
              <div key={p.key} className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">{p.label}</label>
                <input
                  type={p.type || 'text'}
                  placeholder={p.placeholder || '请输入'}
                  value={priceValues[p.key] ?? ''}
                  onChange={(e) => setPrice(p.key, e.target.value)}
                  className="w-full h-10 px-3 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  data-ai-alt={`价格项-${p.label}`}
                />
              </div>
            ))}
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

      {/* 测算结果 */}
      {result && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 animate-fade-in">
          <h4 className="text-md font-bold text-green-800 mb-4 flex items-center">
            <i className="fa-solid fa-circle-check text-green-500 mr-2"></i>测算结果
          </h4>
          <div className="flex items-end gap-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">预估总金额：</div>
            <div className="text-3xl font-bold text-green-600">¥ {result.totalFee}</div>
          </div>
          <div className="bg-white rounded border border-green-100 p-4">
            <div className="text-sm font-bold text-gray-700 mb-3">费用明细</div>
            <div className="space-y-2">
              {result.detail.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="text-gray-800 font-medium">¥ {item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationTest;
