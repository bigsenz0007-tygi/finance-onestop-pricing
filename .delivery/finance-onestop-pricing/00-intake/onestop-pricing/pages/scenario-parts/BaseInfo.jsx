import React, { useState, useRef, useEffect } from 'react';

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
  { value: 'p1', label: 'P001 - 特快重货' },
  { value: 'p2', label: 'P002 - 标快' },
  { value: 'p3', label: 'P003 - 特快' }
];

const SCENARIOS = [
  { value: 's1', label: '大促活动' },
  { value: 's2', label: '生鲜特配' },
  { value: 's3', label: '逆向退换货' }
];

const BaseInfo = ({ data, onChange }) => {
  const handleChange = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="max-w-[800px] space-y-[24px]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]" data-ai-changelog-id="baseinfo-products-scenarios" data-ai-changelog-title="新增关联产品和业务场景选择" data-ai-changelog-desc="在基础信息中新增关联产品和业务场景的选择">
        <div className="flex items-center gap-[16px]" data-ai-alt="业务场景选择">
          <label className="w-[100px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            业务场景 <span className="text-red-500">*</span>
          </label>
          <div className="flex-1" data-ai-changelog-id="baseinfo-scenario-search" data-ai-changelog-title="业务场景模糊搜索单选" data-ai-changelog-desc="业务场景选择支持模糊搜索和单选">
            <SearchableSelect
              options={SCENARIOS}
              value={data.scenario}
              onChange={(val) => handleChange('scenario', val)}
              placeholder="请输入或选择业务场景"
            />
          </div>
        </div>

        <div className="flex items-center gap-[16px]" data-ai-alt="关联产品选择">
          <label className="w-[100px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            关联产品 <span className="text-red-500">*</span>
          </label>
          <div className="flex-1" data-ai-changelog-id="baseinfo-product-search" data-ai-changelog-title="产品模糊搜索单选" data-ai-changelog-desc="关联产品选择支持模糊搜索和单选">
            <SearchableSelect
              options={PRODUCTS}
              value={data.product}
              onChange={(val) => handleChange('product', val)}
              placeholder="请输入或选择产品"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        <div className="flex items-center gap-[16px]" data-ai-alt="责任人输入框">
          <label className="w-[100px] text-right text-[14px] font-medium text-gray-700 shrink-0">
            责任人 <span className="text-red-500">*</span>
          </label>
          <div className="relative flex-1">
            <i className="fa-solid fa-search absolute left-3 top-3 text-gray-400"></i>
            <input
              type="text"
              className="w-full h-[40px] pl-10 pr-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="请填写erp"
              value={data.owner || ''}
              onChange={(e) => handleChange('owner', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-[16px]">
        <label className="w-[100px] text-right text-[14px] font-medium text-gray-700 shrink-0">
          效期时间 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-[8px] flex-1">
          <input
            type="date"
            className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none"
            value={data.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
          <span className="text-gray-400">至</span>
          <input
            type="date"
            className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none"
            value={data.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-[16px]" data-ai-alt="限定商家选择" data-ai-changelog-id="baseinfo-limit-merchant" data-ai-changelog-title="限定商家使用配置" data-ai-changelog-desc="选择限定商家使用，限定时露出编码录入">
        <label className="w-[100px] text-right text-[14px] font-medium text-gray-700 shrink-0">
          限定商家使用 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-[16px] flex-1">
          <label className="flex items-center gap-[8px] cursor-pointer">
            <input type="radio" className="w-[16px] h-[16px] text-blue-600 border-gray-300 focus:ring-blue-500" checked={data.isLimitMerchant === true} onChange={() => handleChange('isLimitMerchant', true)} />
            <span>是</span>
          </label>
          <label className="flex items-center gap-[8px] cursor-pointer">
            <input type="radio" className="w-[16px] h-[16px] text-blue-600 border-gray-300 focus:ring-blue-500" checked={data.isLimitMerchant !== true} onChange={() => handleChange('isLimitMerchant', false)} />
            <span>否</span>
          </label>
        </div>
      </div>

      {data.isLimitMerchant && (
        <div className="flex items-start gap-[16px]" data-ai-alt="商家编码输入" data-ai-changelog-id="baseinfo-merchant-codes" data-ai-changelog-title="商家编码录入" data-ai-changelog-desc="支持多条商家编码的录入和追加">
          <label className="w-[100px] text-right text-[14px] font-medium text-gray-700 shrink-0 mt-[10px]">
            商家编码 <span className="text-red-500">*</span>
          </label>
          <div className="flex-1 space-y-[12px]">
            <div className="flex gap-[8px]">
              <input
                type="text"
                className="flex-1 h-[40px] px-3 border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="请输入商家编码，仅这些商家在报价时可使用此业务场景"
                id="merchantCodeInput"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.target.value.trim();
                    if (val) {
                      const newCodes = [...(data.merchantCodes || []), val];
                      handleChange('merchantCodes', newCodes);
                      e.target.value = '';
                    }
                  }
                }}
              />
              <button
                type="button"
                className="px-[16px] h-[40px] bg-blue-600 text-white rounded-[4px] hover:bg-blue-700 transition-colors"
                onClick={() => {
                  const input = document.getElementById('merchantCodeInput');
                  if (input) {
                    const val = input.value.trim();
                    if (val) {
                      const newCodes = [...(data.merchantCodes || []), val];
                      handleChange('merchantCodes', newCodes);
                      input.value = '';
                    }
                  }
                }}
              >
                添加
              </button>
            </div>
            {data.merchantCodes && data.merchantCodes.length > 0 && (
              <div className="flex flex-wrap gap-[8px] p-[12px] bg-gray-50 border border-gray-200 rounded-[4px] min-h-[48px]">
                {data.merchantCodes.map((code, index) => (
                  <span key={index} className="inline-flex items-center gap-[4px] px-[8px] py-[4px] bg-white border border-gray-300 rounded-[4px] text-[12px] text-gray-700">
                    {code}
                    <i 
                      className="fa-solid fa-xmark cursor-pointer text-gray-400 hover:text-red-500" 
                      onClick={() => {
                        const newCodes = [...data.merchantCodes];
                        newCodes.splice(index, 1);
                        handleChange('merchantCodes', newCodes);
                      }}
                    ></i>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-start gap-[16px]">
        <label className="w-[100px] text-right text-[14px] font-medium text-gray-700 shrink-0 mt-[10px]">业务描述</label>
        <textarea
          className="flex-1 h-[120px] p-[12px] border border-gray-300 rounded-[4px] focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          placeholder="请描述该定价场景适用的具体业务范围..."
          value={data.desc || ''}
          onChange={(e) => handleChange('desc', e.target.value)}
        ></textarea>
      </div>
    </div>
  );
};

export default BaseInfo;