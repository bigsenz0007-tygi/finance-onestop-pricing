import React, { useState, useRef, useEffect } from 'react';

const MultiSelectDropdown = ({ label, tooltip, options, value = [], onChange, placeholder = "请选择" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (opt) => {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 flex-shrink-0 text-right">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {tooltip && (
          <div className="text-xs text-gray-400 mt-0.5">{tooltip}</div>
        )}
      </div>
      <div className="flex-1 max-w-md relative" ref={dropdownRef}>
        <div 
          className="w-full min-h-[38px] px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm flex items-center justify-between cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onClick={() => setIsOpen(!isOpen)}
          data-ai-alt={`点击展开${label}下拉`}
        >
          <div className="flex flex-wrap gap-1.5">
            {value.length > 0 ? (
              value.map(val => (
                <span key={val} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {val}
                  <button 
                    type="button" 
                    className="flex-shrink-0 ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-600 hover:bg-blue-200 hover:text-blue-900 focus:outline-none"
                    onClick={(e) => { e.stopPropagation(); handleToggleOption(val); }}
                    data-ai-alt={`移除${val}`}
                  >
                    <i className="fa-solid fa-xmark text-[10px]"></i>
                  </button>
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400">{placeholder}</span>
            )}
          </div>
          <i className={`fa-solid fa-chevron-down text-gray-400 text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
        </div>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1 max-h-60 overflow-auto">
            {options.map((opt) => {
              const isSelected = value.includes(opt);
              return (
                <div 
                  key={opt} 
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center justify-between"
                  onClick={() => handleToggleOption(opt)}
                  data-ai-alt={`选择${opt}`}
                >
                  <span className={isSelected ? 'text-blue-600 font-medium' : 'text-gray-700'}>{opt}</span>
                  {isSelected && <i className="fa-solid fa-check text-blue-600"></i>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const QuotationRules = ({ data, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };


  return (
    <div className="flex flex-col gap-6">
      {/* 业务规则说明提示 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
        <div className="text-blue-600 pt-0.5">
          <i className="fa-solid fa-circle-info"></i>
        </div>
        <div className="text-sm text-blue-800 leading-relaxed">
          <div className="font-bold mb-1">定价规则说明</div>
          <p>定义该计费场景下可用的定价规则，定价维度和；避免报价过程中使用了该规则但不通的情况；</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative">
        <div className="absolute right-4 top-4">
            <span className="text-sm text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded border border-green-100 shadow-sm">
              <i className="fa-solid fa-check-circle"></i> 默认基准配置
            </span>
        </div>

        <div className="mb-6 max-w-sm">
           <h3 className="text-lg font-bold text-gray-800">报价基准配置</h3>
           <p className="text-sm text-gray-500 mt-1">请勾选本场景下通用的计费维度与模式</p>
        </div>

        <div className="space-y-6">
          <MultiSelectDropdown
            label="报价维度"
            tooltip="决定价格差异的核心因素"
            options={['始发城市', '目的城市', '商家业务类型', '配送区域', '时效等级']}
            value={data.dimensions || []}
            onChange={(val) => handleChange('dimensions', val)}
            placeholder="请选择报价维度 (可多选)"
          />
          
          <MultiSelectDropdown
            label="报价模式"
            tooltip="价格计算的基础算法模型"
            options={['首续重计费', '按件型', '按方', '一口价', '百分比提成']}
            value={data.modes || []}
            onChange={(val) => handleChange('modes', val)}
            placeholder="请选择报价模式 (可多选)"
          />
          
          <MultiSelectDropdown
            label="单票报价阶梯"
            tooltip="价格随数量变化的梯度区间"
            options={['重量', '件数', '体积', '金额', '距离']}
            value={data.ladders || []}
            onChange={(val) => handleChange('ladders', val)}
            placeholder="请选择单票报价阶梯 (可多选)"
          />
        </div>
      </div>
    </div>
  );
};

export default QuotationRules;