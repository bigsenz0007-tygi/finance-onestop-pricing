import React, { useState, useRef, useEffect } from 'react';
import DateRangePicker from '../../components/DateRangePicker';

const SearchableSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const displayValue = isOpen ? search : (selectedOption ? selectedOption.label : '');
  
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        className="w-full h-10 px-3 pr-8 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        placeholder={placeholder}
        value={displayValue}
        onClick={() => { setIsOpen(true); setSearch(''); }}
        onChange={(e) => { setIsOpen(true); setSearch(e.target.value); }}
      />
      <i className={`fa-solid fa-chevron-down absolute right-3 top-3.5 text-gray-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.value}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearch('');
                }}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500 text-center">无匹配结果</div>
          )}
        </div>
      )}
    </div>
  );
};

const PRODUCTS = [
  { value: 'p1', label: '重货标快' },
  { value: 'p2', label: '京东标快' },
  { value: 'p3', label: '京东特快' }
];

const SCENARIOS = [
  { value: 's1', label: '大促活动' },
  { value: 's2', label: '生鲜特配' },
  { value: 's3', label: '逆向退换货' }
];

const BaseInfo = ({ data, onChange }) => {
  const settleMethods = Array.isArray(data.settleMethod) ? data.settleMethod : (data.settleMethod ? [data.settleMethod] : []);

  const handleSettleChange = (method) => {
    let newMethods = [...settleMethods];
    if (method === '月结') {
      newMethods = newMethods.includes('月结') ? [] : ['月结'];
    } else {
      if (newMethods.includes('月结')) newMethods = [];
      if (newMethods.includes(method)) {
        newMethods = newMethods.filter(m => m !== method);
      } else {
        newMethods.push(method);
      }
    }
    
    const newData = { ...data, settleMethod: newMethods };
    const isPureCash = newMethods.length > 0 && !newMethods.includes('月结');
    if (isPureCash) {
      newData.strategy = '不统计不合单';
      delete newData.addressMatch;
    }
    onChange(newData);
  };

  const handleChange = (key, value) => {
    const newData = { ...data, [key]: value };
    // 计费策略改变，清理统计考核相关字段
    if (key === 'strategy' && !['统计考核', '统计+合单'].includes(value)) {
      delete newData.assessMethod;
      delete newData.assessMonth;
    }
    // 模拟商家编码带出商家名称和签约区域
    if (key === 'merchantCode') {
      if (value) {
        newData.merchantName = '京东自营测试商家';
        newData.signArea = '华北片区';
      } else {
        newData.merchantName = '';
        newData.signArea = '';
      }
    }
    onChange(newData);
  };

  const isCash = data.quoteType === '场景报价' ? false : (settleMethods.length > 0 && !settleMethods.includes('月结'));
  const showAssess = ['统计考核', '统计+合单'].includes(data.strategy);

  return (
    <div className="max-w-[800px] space-y-[24px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        <div className="flex items-center gap-[16px]" data-ai-alt="报价方案名称">
          <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            报价方案名称 <span className="text-red-500">*</span>
          </label>
          <input type="text" className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none" placeholder="请输入方案名称" value={data.schemeName || ''} onChange={(e) => handleChange('schemeName', e.target.value)} />
        </div>
        <div className="flex items-center gap-[16px]" data-ai-alt="商家编码">
          <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            商家编码 <span className="text-red-500">*</span>
          </label>
          <input type="text" className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none" placeholder="请输入商家编码" value={data.merchantCode || ''} onChange={(e) => handleChange('merchantCode', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]" data-ai-changelog-id="baseinfo-merchant-auto-fill" data-ai-changelog-title="商家信息自动带出" data-ai-changelog-desc="商家名称和签约区域由商家编码自动带出，不允许手工录入">
        <div className="flex items-center gap-[16px]" data-ai-alt="商家名称">
          <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            商家名称 <span className="text-red-500">*</span>
          </label>
          <input type="text" className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] bg-gray-50 text-gray-500 outline-none cursor-not-allowed" placeholder="输入商家编码后自动带出" value={data.merchantName || ''} readOnly />
        </div>
        <div className="flex items-center gap-[16px]" data-ai-alt="签约区域">
          <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            签约区域 <span className="text-red-500">*</span>
          </label>
          <input type="text" className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] bg-gray-50 text-gray-500 outline-none cursor-not-allowed" placeholder="输入商家编码后自动带出" value={data.signArea || ''} readOnly />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        <div className="flex items-center gap-[16px]" data-ai-alt="生效时间" data-ai-changelog-id="baseinfo-effective-time-range" data-ai-changelog-title="生效时间范围选择" data-ai-changelog-desc="支持选择开始时间和截止时间">
          <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            生效时间 <span className="text-red-500">*</span>
          </label>
          <div className="flex-1">
            <DateRangePicker 
              value={[data.effectiveTimeStart, data.effectiveTimeEnd]}
              onChange={([start, end]) => {
                handleChange('effectiveTimeStart', start);
                handleChange('effectiveTimeEnd', end);
              }}
            />
          </div>
        </div>
        <div className="flex items-center gap-[16px]" data-ai-alt="报价方式" data-ai-changelog-id="baseinfo-quote-type" data-ai-changelog-title="新增报价方式" data-ai-changelog-desc="新增报价方式单选，选择产品报价时隐藏业务场景">
          <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            报价方式 <span className="text-red-500">*</span>
          </label>
          <select className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-gray-500 cursor-not-allowed" value={data.quoteType || '产品报价'} disabled>
            <option value="产品报价">产品报价</option>
            <option value="场景报价">场景报价</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]" data-ai-changelog-id="baseinfo-products-scenarios" data-ai-changelog-title="新增关联产品和业务场景选择" data-ai-changelog-desc="在基础信息中新增关联产品和业务场景的选择">
        <div className="flex items-center gap-[16px]" data-ai-alt="折扣产品选择">
          <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            折扣产品 <span className="text-red-500">*</span>
          </label>
          <div className="flex-1" data-ai-changelog-id="baseinfo-product-search" data-ai-changelog-title="产品模糊搜索单选" data-ai-changelog-desc="关联产品选择支持模糊搜索和单选">
            <SearchableSelect options={PRODUCTS} value={data.product} onChange={(val) => handleChange('product', val)} placeholder="请输入或选择产品" />
          </div>
        </div>
        {data.quoteType !== '产品报价' && (
          <div className="flex items-center gap-[16px]" data-ai-alt="业务场景选择">
            <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
              业务场景 <span className="text-red-500">*</span>
            </label>
            <div className="flex-1" data-ai-changelog-id="baseinfo-scenario-search" data-ai-changelog-title="业务场景模糊搜索单选" data-ai-changelog-desc="业务场景选择支持模糊搜索和单选">
              <SearchableSelect options={SCENARIOS} value={data.scenario} onChange={(val) => handleChange('scenario', val)} placeholder="请输入或选择业务场景" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        <div className="flex items-center gap-[16px]" data-ai-alt="结算方式" data-ai-changelog-id="baseinfo-settle-method-multi" data-ai-changelog-title="结算方式多选与互斥" data-ai-changelog-desc="寄付现结和到付现结可以多选；月结不参与多选（互斥）">
          <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            结算方式 <span className="text-red-500">*</span>
          </label>
          <div className="flex-1 flex items-center gap-[24px]" data-ai-changelog-id="baseinfo-settle-method-scenario" data-ai-changelog-title="场景报价结算方式限制" data-ai-changelog-desc="报价方式选择为场景报价时，结算方式仅可选择月结且不可修改">
            {['月结', '寄付现结', '到付现结'].map(method => {
              const isScenario = data.quoteType === '场景报价';
              const isChecked = isScenario ? method === '月结' : settleMethods.includes(method);
              return (
                <label key={method} className={`flex items-center gap-[8px] ${isScenario ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                  <input 
                    type="checkbox" 
                    className="w-[16px] h-[16px] text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed" 
                    checked={isChecked} 
                    onChange={() => {
                      if (isScenario) return;
                      handleSettleChange(method);
                    }}
                    disabled={isScenario}
                  />
                  <span className="text-[14px] text-gray-700">{method}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        <div className="flex items-center gap-[16px]" data-ai-alt="计费策略" data-ai-changelog-id="baseinfo-strategy" data-ai-changelog-title="计费策略联动" data-ai-changelog-desc="结算方式为现结时仅可选普通">
          <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            计费策略 <span className="text-red-500">*</span>
          </label>
          <select className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none bg-white disabled:bg-gray-100" value={data.strategy || '不统计不合单'} onChange={(e) => handleChange('strategy', e.target.value)} disabled={isCash}>
            <option value="不统计不合单">不统计不合单</option>
            {!isCash && <option value="统计考核">统计考核</option>}
            {!isCash && <option value="合单计费">合单计费</option>}
            {!isCash && <option value="统计+合单">统计+合单</option>}
          </select>
        </div>
      </div>

      {showAssess && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] bg-blue-50 p-[16px] rounded-[4px]" data-ai-alt="统计考核配置" data-ai-changelog-id="baseinfo-assess" data-ai-changelog-title="统计考核字段展示" data-ai-changelog-desc="计费策略包含统计时露出">
          <div className="flex items-center gap-[16px]">
            <label className="w-[104px] text-right text-[14px] font-medium text-gray-700 shrink-0">
              统计考核方式 <span className="text-red-500">*</span>
            </label>
            <select className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none" value={data.assessMethod || ''} onChange={(e) => handleChange('assessMethod', e.target.value)}>
              <option value="">请选择</option>
              <option value="按考核开始月份">按考核开始月份</option>
              <option value="按月中签合同考核">按月中签合同考核</option>
              <option value="按整月考核">按整月考核</option>
              <option value="按项目周期考核">按项目周期考核</option>
            </select>
          </div>
          <div className="flex items-center gap-[16px]">
            <label className="w-[104px] text-right text-[14px] font-medium text-gray-700 shrink-0">
              考核开始月份 <span className="text-red-500">*</span>
            </label>
            <input type="month" className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none" value={data.assessMonth || ''} onChange={(e) => handleChange('assessMonth', e.target.value)} />
          </div>
        </div>
      )}

      <div className="pt-[24px] mt-[24px] border-t border-gray-200" data-ai-alt="复杂报价分栏" data-ai-changelog-id="baseinfo-complex-quote" data-ai-changelog-title="复杂报价分栏" data-ai-changelog-desc="将地址逐级匹配移入，并新增价格本优先级">
        <h3 className="text-[16px] font-medium text-gray-900 mb-[24px]">复杂报价</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {!isCash && (
            <div className="flex items-center gap-[16px]" data-ai-alt="是否地址逐级匹配" data-ai-changelog-id="baseinfo-address-match" data-ai-changelog-title="是否地址逐级匹配控制" data-ai-changelog-desc="当结算方式为现结时，不露出此配置">
              <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
                是否地址逐级匹配 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-[16px] flex-1">
                <label className="flex items-center gap-[8px] cursor-pointer">
                  <input type="radio" className="w-[16px] h-[16px] text-blue-600 border-gray-300 focus:ring-blue-500" checked={data.addressMatch === true} onChange={() => handleChange('addressMatch', true)} />
                  <span>是</span>
                </label>
                <label className="flex items-center gap-[8px] cursor-pointer">
                  <input type="radio" className="w-[16px] h-[16px] text-blue-600 border-gray-300 focus:ring-blue-500" checked={data.addressMatch === false} onChange={() => handleChange('addressMatch', false)} />
                  <span>否</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center gap-[16px]" data-ai-alt="配置价格本优先级">
            <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
              配置价格本优先级
            </label>
            <div className="flex items-center gap-[16px] flex-1">
              <label className="flex items-center gap-[8px] cursor-pointer">
                <input type="radio" className="w-[16px] h-[16px] text-blue-600 border-gray-300 focus:ring-blue-500" checked={data.hasPricePriority === true} onChange={() => { handleChange('hasPricePriority', true); if (!data.pricePriority) handleChange('pricePriority', '1-优先级最高'); }} />
                <span>是</span>
              </label>
              <label className="flex items-center gap-[8px] cursor-pointer">
                <input type="radio" className="w-[16px] h-[16px] text-blue-600 border-gray-300 focus:ring-blue-500" checked={data.hasPricePriority === false} onChange={() => { handleChange('hasPricePriority', false); handleChange('pricePriority', undefined); }} />
                <span>否</span>
              </label>
            </div>
          </div>

          {data.hasPricePriority && (
            <div className="flex items-center gap-[16px]" data-ai-alt="价格本优先级">
              <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
                价格本优先级 <span className="text-red-500">*</span>
              </label>
              <select className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={data.pricePriority || '1-优先级最高'} onChange={(e) => handleChange('pricePriority', e.target.value)}>
                <option value="1-优先级最高">1-优先级最高</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-[16px]" data-ai-alt="金额进位" data-ai-changelog-id="baseinfo-amount-rounding" data-ai-changelog-title="金额进位配置" data-ai-changelog-desc="新增金额进位下拉选择">
            <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
              金额进位
            </label>
            <select className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={data.amountRounding || ''} onChange={(e) => handleChange('amountRounding', e.target.value)}>
              <option value="">请选择</option>
              <option value="四舍五入取整">四舍五入取整</option>
              <option value="保留1位小数">保留1位小数</option>
              <option value="报价不涉及">报价不涉及</option>
            </select>
          </div>

          <div className="flex items-center gap-[16px]" data-ai-alt="跨月计费" data-ai-changelog-id="baseinfo-cross-month" data-ai-changelog-title="跨月计费配置" data-ai-changelog-desc="支持跨月计费周期配置">

            <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
              跨月计费
            </label>
            <div className="flex items-center gap-[16px] flex-1">
              <label className="flex items-center gap-[8px] cursor-pointer">
                <input type="radio" className="w-[16px] h-[16px] text-blue-600 border-gray-300 focus:ring-blue-500" checked={data.isCrossMonth === true} onChange={() => handleChange('isCrossMonth', true)} />
                <span>是</span>
              </label>
              <label className="flex items-center gap-[8px] cursor-pointer">
                <input type="radio" className="w-[16px] h-[16px] text-blue-600 border-gray-300 focus:ring-blue-500" checked={data.isCrossMonth === false} onChange={() => { handleChange('isCrossMonth', false); handleChange('crossMonthPrev', undefined); handleChange('crossMonthPrevDay', undefined); handleChange('crossMonthCurrentDay', undefined); }} />
                <span>否</span>
              </label>
            </div>
          </div>

          {data.isCrossMonth && (
            <div className="flex items-center gap-[16px]" data-ai-alt="计费周期配置">
              <label className="w-[120px] text-right text-[14px] font-medium text-gray-700 shrink-0">
                计费周期 <span className="text-red-500">*</span>
              </label>
              <div className="flex-1 flex items-center gap-[8px] text-[14px]">
                <span className="text-gray-600">上</span>
                <input type="number" min="1" max="11" className="w-[60px] h-[40px] px-2 border border-gray-300 rounded-[4px] outline-none text-center focus:ring-2 focus:ring-blue-500 bg-white" value={data.crossMonthPrev || ''} onChange={e => handleChange('crossMonthPrev', e.target.value)} placeholder="X" />
                <span className="text-gray-600">月</span>
                <input type="number" min="1" max="31" className="w-[60px] h-[40px] px-2 border border-gray-300 rounded-[4px] outline-none text-center focus:ring-2 focus:ring-blue-500 bg-white" value={data.crossMonthPrevDay || ''} onChange={e => handleChange('crossMonthPrevDay', e.target.value)} placeholder="X" />
                <span className="mx-2 text-gray-400">至</span>
                <span className="text-gray-600">当月</span>
                <input type="number" min="1" max="31" className="w-[60px] h-[40px] px-2 border border-gray-300 rounded-[4px] outline-none text-center focus:ring-2 focus:ring-blue-500 bg-white" value={data.crossMonthCurrentDay || ''} onChange={e => handleChange('crossMonthCurrentDay', e.target.value)} placeholder="X" />
                <span className="text-gray-600">日</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseInfo;