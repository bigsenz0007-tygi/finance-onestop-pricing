import React, { useEffect, useState, useRef } from 'react';
import TagSelect from '../../components/TagSelect';

const SearchSelect = ({ label, tooltip, options, value = [], onChange, single, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = single ? (value[0] || '请选择') : (value.length > 0 ? value.join(', ') : '请选择');
  const filteredOptions = options.filter(o => o.toLowerCase().includes(searchText.toLowerCase()));

  const handleSelect = (opt) => {
    if (single) {
      onChange([opt]);
      setIsOpen(false);
      setSearchText('');
    } else {
      const isSelected = value.includes(opt);
      if (isSelected) {
        onChange(value.filter(v => v !== opt));
      } else {
        onChange([...value, opt]);
      }
    }
  };

  return (
    <div className="flex items-start gap-4 mb-5" ref={wrapperRef}>
      <div className="flex items-center justify-end gap-1.5 mt-2 w-[100px] shrink-0">
        {required && <span className="text-red-500 leading-none mt-1">*</span>}
        <span className="text-sm font-medium text-gray-700 text-right">{label.replace(' (单选)', '').replace(' (多选)', '')}</span>
        {tooltip && <i className="fa-solid fa-circle-question text-gray-400 text-xs cursor-help" title={tooltip}></i>}
      </div>
      <div className="relative flex-1">
        <div 
          className="border border-gray-300 rounded px-3 py-2 text-sm cursor-pointer flex justify-between items-center bg-white min-h-[38px]"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={value.length > 0 ? 'text-gray-800' : 'text-gray-400'}>{displayValue}</span>
          <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} text-gray-400 text-xs`}></i>
        </div>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 flex flex-col">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                  placeholder="搜索..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="overflow-y-auto p-1 flex-1">
              {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                <div 
                  key={opt}
                  className={`px-3 py-2 text-sm cursor-pointer rounded hover:bg-blue-50 flex items-center justify-between ${value.includes(opt) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                  onClick={(e) => { e.stopPropagation(); handleSelect(opt); }}
                >
                  <span>{opt}</span>
                  {value.includes(opt) && <i className="fa-solid fa-check text-xs"></i>}
                </div>
              )) : (
                <div className="px-3 py-2 text-sm text-gray-400 text-center">暂无匹配项</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DIMENSION_OPTIONS = [
  { code: '101', name: '单据类型', options: [{code: '01', name: '正向单据'}, {code: '02', name: '逆向单据'}] },
  { code: '102', name: '是否保价', options: [{code: '1', name: '是'}, {code: '0', name: '否'}] },
  { code: '103', name: '产品类型', options: [{code: 'P1', name: '特快重货'}, {code: 'P2', name: '标快重货'}] },
  { code: '122', name: '支付方式', options: [{code: '01', name: '在线支付'}, {code: '02', name: '货到付款'}, {code: '03', name: '扫码付'}, {code: '04', name: '非扫码付'}] },
  { code: '106', name: '重量', options: [] },
];

const BillingRules = ({ data, onChange, isQuotation }) => {
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [tempConditions, setTempConditions] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const openConditionModal = () => {
    const currentConds = currentRule?.conditions || [];
    setTempConditions(
      currentConds.length > 0 
        ? currentConds.map(c => {
            const [dim, val] = c.split('=');
            // 处理回显：若为多选，拆分
            const valArray = val ? val.split(',') : [];
            return { id: Date.now() + Math.random(), dimension: dim || '', values: valArray, inputValue: val || '' };
          })
        : [{ id: Date.now(), dimension: '', values: [], inputValue: '' }]
    );
    setIsConditionModalOpen(true);
  };

  const handleAddCondition = () => {
    setTempConditions([...tempConditions, { id: Date.now(), dimension: '', values: [], inputValue: '' }]);
  };

  const handleRemoveCondition = (id) => {
    setTempConditions(tempConditions.filter(c => c.id !== id));
  };

  const handleConditionChange = (id, field, val) => {
    setTempConditions(tempConditions.map(c => {
      if (c.id === id) {
        if (field === 'dimension') {
          return { ...c, dimension: val, values: [], inputValue: '' };
        }
        return { ...c, [field]: val };
      }
      return c;
    }));
  };

  const handleCheckboxChange = (id, code, checked) => {
    setTempConditions(tempConditions.map(c => {
      if (c.id === id) {
        const newValues = checked 
          ? [...c.values, code] 
          : c.values.filter(v => v !== code);
        return { ...c, values: newValues, inputValue: newValues.join(',') };
      }
      return c;
    }));
  };

  const handleInputChange = (id, val) => {
    setTempConditions(tempConditions.map(c => {
      if (c.id === id) {
        // 如果手动输入了不匹配任何选中code的值，清空values，只保留输入文本
        return { ...c, inputValue: val, values: val ? val.split(',') : [] };
      }
      return c;
    }));
  };

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const saveConditions = () => {
    const validConditions = tempConditions
      .filter(c => c.dimension && c.inputValue)
      .map(c => `${c.dimension}=${c.inputValue}`);
    handleUpdateRule(currentRule.id, 'conditions', validConditions);
    setIsConditionModalOpen(false);
  };

  const getDimensionName = (code) => {
    const opt = DIMENSION_OPTIONS.find(d => d.code === code);
    return opt ? opt.name : code;
  };

  const getValueName = (dimCode, valCodes) => {
    const dimOpt = DIMENSION_OPTIONS.find(d => d.code === dimCode);
    if (!dimOpt || !dimOpt.options || dimOpt.options.length === 0) return valCodes.join(',');
    return valCodes.map(v => {
      const vOpt = dimOpt.options.find(o => o.code === v);
      return vOpt ? vOpt.name : v;
    }).join(',');
  };

  const renderConditionModal = () => {
    if (!isConditionModalOpen) return null;
    
    const selectedText = tempConditions
      .filter(c => c.dimension && c.inputValue)
      .map(c => `${c.dimension}=${c.inputValue}`)
      .join('\n');

    const previewText = tempConditions
      .filter(c => c.dimension && c.inputValue)
      .map(c => {
         const valuesArr = c.inputValue.split(',');
         return `${getDimensionName(c.dimension)} = ${getValueName(c.dimension, valuesArr)}`;
      })
      .join(' AND ');

    return (
      <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-[800px] shadow-xl flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-bold text-gray-800">计费条件编辑</h3>
            <button onClick={() => setIsConditionModalOpen(false)} className="text-gray-400 hover:text-gray-600">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          
          <div className="p-6 flex-1 overflow-y-auto">
            {tempConditions.map((cond, index) => {
              const currentDimOpt = DIMENSION_OPTIONS.find(d => d.code === cond.dimension);
              const hasOptions = currentDimOpt && currentDimOpt.options && currentDimOpt.options.length > 0;

              return (
              <div key={cond.id} className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-16 text-right text-gray-600">计费条件</span>
                  <select 
                    className="border border-gray-300 rounded px-3 py-1.5 w-40 text-sm focus:border-blue-500 focus:outline-none"
                    value={cond.dimension}
                    onChange={(e) => handleConditionChange(cond.id, 'dimension', e.target.value)}
                  >
                    <option value="">请选择</option>
                    {DIMENSION_OPTIONS.map(opt => (
                      <option key={opt.code} value={opt.code}>{opt.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 relative">
                  <span className="text-sm font-medium w-16 text-right text-gray-600">条件值</span>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="text"
                      className="border border-gray-300 rounded px-3 py-1.5 w-48 text-sm focus:border-blue-500 focus:outline-none pr-8"
                      placeholder={hasOptions ? "请下拉或直接输入" : "请直接输入"}
                      value={cond.inputValue}
                      onChange={(e) => handleInputChange(cond.id, e.target.value)}
                      onClick={() => hasOptions && setActiveDropdown(cond.id)}
                    />
                    {hasOptions && (
                      <button 
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                        onClick={() => setActiveDropdown(activeDropdown === cond.id ? null : cond.id)}
                      >
                        <i className={`fa-solid fa-chevron-${activeDropdown === cond.id ? 'up' : 'down'}`}></i>
                      </button>
                    )}
                    {activeDropdown === cond.id && hasOptions && (
                      <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 shadow-lg rounded z-10 py-1">
                        {currentDimOpt.options.map(opt => (
                          <label key={opt.code} className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer">
                            <input 
                              type="checkbox"
                              className="mr-2 cursor-pointer"
                              checked={cond.values.includes(opt.code)}
                              onChange={(e) => handleCheckboxChange(cond.id, opt.code, e.target.checked)}
                            />
                            <span className="text-sm text-gray-700">{opt.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  className="text-gray-600 hover:text-red-500 text-sm px-4 py-1.5 bg-gray-100 hover:bg-red-50 rounded transition-colors"
                  onClick={() => handleRemoveCondition(cond.id)}
                >
                  删除
                </button>
                {index === tempConditions.length - 1 && (
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded transition-colors"
                    onClick={handleAddCondition}
                  >
                    添加
                  </button>
                )}
              </div>
            )})}

            <div className="mt-8 flex flex-col gap-5">
              <div className="flex gap-4">
                <div className="text-sm font-medium w-12 text-right pt-2 text-gray-600">已选择</div>
                <textarea 
                  className="flex-1 border border-gray-200 bg-gray-50 rounded p-3 text-sm text-gray-500 min-h-[80px] resize-none focus:outline-none"
                  readOnly
                  placeholder="这里将显示您已选择的条件配置..."
                  value={selectedText}
                />
              </div>
              <div className="flex gap-4">
                <div className="text-sm font-medium w-12 text-right pt-2 text-gray-600">预览</div>
                <textarea 
                  className="flex-1 border border-gray-200 bg-gray-50 rounded p-3 text-sm text-gray-500 min-h-[80px] resize-none focus:outline-none"
                  readOnly
                  placeholder="这里将展示条件组合预览..."
                  value={previewText}
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-lg">
            <button 
              className="px-6 py-2 border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50 text-sm transition-colors"
              onClick={() => setIsConditionModalOpen(false)}
            >
              取消
            </button>
            <button 
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors shadow-sm"
              onClick={saveConditions}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  };
  // 初始化数据结构
  useEffect(() => {
    if (!data.rules || data.rules.length === 0) {
      const initialRule = {
        id: Date.now(),
        name: '场景规则',
        isBase: true,
        billingType: data.billingType || ['计费+统计'],
        billDocuments: data.billDocuments || [
          { id: Date.now(), sourceSystem: [], billType: [], tradeType: [] }
        ],
        dimensions: data.dimensions || [],
        items: data.items || [],
        nodes: data.nodes || [],
        conditions: data.conditions || []
      };
      onChange({ rules: [initialRule] });
    }
  }, []);

  const rules = data.rules || [];
  const activeRuleId = data.activeRuleId || (rules[0] ? rules[0].id : null);

  const handleUpdateRule = (ruleId, field, value) => {
    const newRules = rules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    );
    onChange({ ...data, rules: newRules });
  };

  const handleSetBase = (ruleId) => {
    const newRules = rules.map(rule => ({
      ...rule,
      isBase: rule.id === ruleId
    }));
    onChange({ ...data, rules: newRules });
  };

  const setActiveRule = (id) => {
    onChange({ ...data, activeRuleId: id });
  };

  const handleAddRule = () => {
    let newRule;
    if (rules.length > 0) {
      const lastRule = rules[rules.length - 1];
      newRule = {
        ...JSON.parse(JSON.stringify(lastRule)),
        id: Date.now(),
        name: `场景规则 ${rules.length + 1}`,
        isBase: false
      };
      // 更新深层元素的 id，避免 key 重复问题
      if (newRule.billDocuments) {
        newRule.billDocuments = newRule.billDocuments.map(doc => ({...doc, id: Date.now() + Math.random()}));
      }
    } else {
      newRule = {
        id: Date.now(),
        name: `场景规则 1`,
        isBase: true,
        billingType: ['计费+统计'],
        billDocuments: [
          { id: Date.now(), sourceSystem: [], billType: [], tradeType: [] }
        ],
        dimensions: [],
        items: [],
        nodes: [],
        conditions: []
      };
    }
    onChange({ ...data, rules: [...rules, newRule], activeRuleId: newRule.id });
  };

  const handleDeleteRule = (e, id) => {
    e.stopPropagation();
    if (rules.length === 1) {
      alert('至少需要保留一条计费场景');
      return;
    }
    const newRules = rules.filter(r => r.id !== id);
    // 如果删除的是基准规则，默认将剩下的第一个设为基准
    if (rules.find(r => r.id === id)?.isBase) {
        newRules[0].isBase = true;
    }
    const newActiveId = activeRuleId === id ? newRules[0].id : activeRuleId;
    onChange({ ...data, rules: newRules, activeRuleId: newActiveId });
  };

  const currentRule = rules.find(r => r.id === activeRuleId);

  if (!currentRule) return <div>加载中...</div>;

  const checkDuplicateRules = () => {
    const duplicatePairs = [];
    for (let i = 0; i < rules.length; i++) {
      for (let j = i + 1; j < rules.length; j++) {
        const rule1 = { ...rules[i], id: null, name: null, isBase: null };
        const rule2 = { ...rules[j], id: null, name: null, isBase: null };
        if (rule1.billDocuments) rule1.billDocuments = rule1.billDocuments.map(d => ({ ...d, id: null }));
        if (rule2.billDocuments) rule2.billDocuments = rule2.billDocuments.map(d => ({ ...d, id: null }));
        
        if (JSON.stringify(rule1) === JSON.stringify(rule2)) {
          duplicatePairs.push(`[${rules[i].name}] 与 [${rules[j].name}]`);
        }
      }
    }
    return duplicatePairs;
  };

  const duplicates = checkDuplicateRules();

  return (
    <div className="flex flex-col gap-6">
      {/* 计费规则业务说明提示 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
        <div className="text-blue-600 pt-0.5">
          <i className="fa-solid fa-circle-info"></i>
        </div>
        <div className="text-sm text-blue-800 leading-relaxed">
          <div className="font-bold mb-1">计费场景配置说明</div>
          <p>定义什么单据，在什么条件下，计什么费；生效后，如果变更，会影响使用该场景报价的商家；</p>
        </div>
      </div>

      {duplicates.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex gap-3 -mt-2">
          <div className="text-orange-500 pt-0.5">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div className="text-sm text-orange-800">
            <span className="font-bold">重复提示：</span>发现配置完全相同的场景：{duplicates.join('、')}，请注意修改避免冲突。
          </div>
        </div>
      )}

      {/* 规则 Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        {rules.map(rule => (
          <div
            key={rule.id}
            onClick={() => setActiveRule(rule.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 cursor-pointer transition-all flex-shrink-0 ${
              activeRuleId === rule.id
                ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{rule.name}</span>
            {rule.isBase && (
              <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded scale-90">
                默认
              </span>
            )}
            {rules.length > 1 && (
                <span 
                    onClick={(e) => handleDeleteRule(e, rule.id)}
                    className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 text-gray-400 transition-colors"
                >
                    <i className="fa-solid fa-times text-[10px]"></i>
                </span>
            )}
          </div>
        ))}
        
        <button
            onClick={handleAddRule}
            className="ml-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded border border-dashed border-blue-300 transition-colors flex items-center gap-1 flex-shrink-0"
        >
            <i className="fa-solid fa-plus"></i> 新增场景
        </button>
      </div>

      {/* 规则详情与操作 */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 relative">
        <div className="absolute right-4 top-4">
           {!currentRule.isBase ? (
             <button
                onClick={() => handleSetBase(currentRule.id)}
                className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 bg-white px-3 py-1.5 rounded border border-gray-200 shadow-sm"
             >
               <i className="fa-regular fa-star"></i> 设为默认场景
             </button>
           ) : (
             <span className="text-sm text-orange-500 flex items-center gap-1 bg-white px-3 py-1.5 rounded border border-orange-200 shadow-sm">
               <i className="fa-solid fa-star"></i> 当前默认场景
             </span>
           )}
        </div>

        <div className="flex flex-col gap-1 mt-6">
          {!isQuotation && (
            <>
              <div data-ai-changelog-id="billing-strategy-dropdown" data-ai-changelog-title="计费策略下拉搜索" data-ai-changelog-desc="将计费策略配置方式调整为下拉选择，支持模糊搜索">
                <SearchSelect
                  label="计费策略 (单选)"
                  tooltip="定义该场景的费用结算方式"
                  options={['计费+统计', '只统计', '只计费']}
                  value={currentRule.billingType || ['计费+统计']}
                  onChange={(val) => handleUpdateRule(currentRule.id, 'billingType', val)}
                  single={true}
                  required={true}
                />
              </div>
              
              {/* 计费单据组合（单组） */}
              <div className="flex items-start gap-4 mb-5" data-ai-changelog-id="billing-document-single" data-ai-changelog-title="计费单据单组选择" data-ai-changelog-desc="名称调整为计费单据，多组配置调整为仅限单组">
                <div className="flex items-center justify-end gap-1.5 mt-2 w-[100px] shrink-0">
                  <span className="text-red-500 leading-none mt-1">*</span>
                  <span className="text-sm font-medium text-gray-700 text-right">计费单据</span>
                </div>
                
                <div className="flex-1 bg-white border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-sm text-center border-collapse" data-ai-changelog-id="billing-document-table" data-ai-changelog-title="计费单据表格样式优化" data-ai-changelog-desc="计费单据的来源系统、单据类型、交易类型采用无边框下拉列表展现，居中对齐，更省空间">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-2.5 border-b border-r border-gray-200 font-medium w-1/3 last:border-r-0">来源系统</th>
                        <th className="px-4 py-2.5 border-b border-r border-gray-200 font-medium w-1/3 last:border-r-0">单据类型</th>
                        <th className="px-4 py-2.5 border-b border-gray-200 font-medium w-1/3">交易类型</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(currentRule.billDocuments || []).slice(0, 1).map((doc, index) => (
                        <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-2 border-r border-gray-200 align-middle last:border-r-0">
                            <select
                              className="w-full bg-transparent text-center text-gray-700 outline-none cursor-pointer appearance-none"
                              value={doc.sourceSystem?.[0] || '青龙系统'}
                              onChange={(e) => {
                                const newDocs = currentRule.billDocuments.map(d => d.id === doc.id ? { ...d, sourceSystem: [e.target.value] } : d);
                                handleUpdateRule(currentRule.id, 'billDocuments', newDocs);
                              }}
                              data-ai-alt="选择来源系统"
                            >
                              <option value="青龙系统">青龙系统</option>
                              <option value="仓储系统">仓储系统</option>
                              <option value="运输系统">运输系统</option>
                              <option value="其他系统">其他系统</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 border-r border-gray-200 align-middle last:border-r-0">
                            <select
                              className="w-full bg-transparent text-center text-gray-700 outline-none cursor-pointer appearance-none"
                              value={doc.billType?.[0] || '青龙运单'}
                              onChange={(e) => {
                                const newDocs = currentRule.billDocuments.map(d => d.id === doc.id ? { ...d, billType: [e.target.value] } : d);
                                handleUpdateRule(currentRule.id, 'billDocuments', newDocs);
                              }}
                              data-ai-alt="选择单据类型"
                            >
                              <option value="青龙运单">青龙运单</option>
                              <option value="销售出库单">销售出库单</option>
                              <option value="采购入库单">采购入库单</option>
                              <option value="调拨单">调拨单</option>
                              <option value="退货单">退货单</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 border-r border-gray-200 align-middle last:border-r-0">
                            <select
                              className="w-full bg-transparent text-center text-gray-700 outline-none cursor-pointer appearance-none"
                              value={doc.tradeType?.[0] || 'KA青龙运单'}
                              onChange={(e) => {
                                const newDocs = currentRule.billDocuments.map(d => d.id === doc.id ? { ...d, tradeType: [e.target.value] } : d);
                                handleUpdateRule(currentRule.id, 'billDocuments', newDocs);
                              }}
                              data-ai-alt="选择交易类型"
                            >
                              <option value="KA青龙运单">KA青龙运单</option>
                              <option value="正向交易">正向交易</option>
                              <option value="逆向交易">逆向交易</option>
                              <option value="换货">换货</option>
                              <option value="退款">退款</option>
                              <option value="快运纯配">快运纯配</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div data-ai-changelog-id="billing-item-dropdown" data-ai-changelog-title="计费项目下拉搜索" data-ai-changelog-desc="将计费项目配置方式调整为下拉选择，支持模糊搜索">
                <SearchSelect
                  label="计费项目 (单选)"
                  tooltip="具体的费用名目，如运费、操作费、上楼费等"
                  options={['运费', '保价费', '出库费', '包装费', '装卸费', '上楼费', '快递运费', '快运运费']}
                  value={currentRule.items || []}
                  onChange={(val) => handleUpdateRule(currentRule.id, 'items', val)}
                  single={true}
                  required={true}
                />
              </div>
            </>
          )}
          
          <div data-ai-changelog-id="billing-node-dropdown" data-ai-changelog-title="计费节点下拉搜索" data-ai-changelog-desc="将计费节点配置方式调整为下拉选择，支持模糊搜索">
            <SearchSelect
              label="计费节点 (多选)"
              tooltip="触发费用产生的业务操作环节"
              options={['揽收', '妥投', '出库', '入库', '中转']}
              value={currentRule.nodes || []}
              onChange={(val) => handleUpdateRule(currentRule.id, 'nodes', val)}
              single={false}
              required={true}
            />
          </div>

          {!isQuotation && (
            <div data-ai-changelog-id="billing-condition-modal" data-ai-changelog-title="计费条件弹窗配置" data-ai-changelog-desc="将计费条件配置改为弹窗形式，支持更复杂的规则编辑">
              <div className="flex items-start gap-4 mb-5">
                <div className="flex items-center justify-end gap-1.5 mt-2 w-[100px] shrink-0">
                  <span className="text-sm font-medium text-gray-700 text-right">计费条件</span>
                  <i className="fa-solid fa-circle-question text-gray-400 text-xs cursor-help" title="触发特定费用的前置筛选逻辑，满足条件才会计费"></i>
                </div>
                <div className="flex flex-wrap gap-2 items-center flex-1">
                  {(currentRule.conditions || []).map((cond, idx) => {
                    const [dim, val] = cond.split('=');
                    const valArr = val ? val.split(',') : [];
                    const displayName = `${getDimensionName(dim)}=${getValueName(dim, valArr)}`;
                    return (
                      <div key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm border border-gray-200 shadow-sm">
                        {displayName}
                      </div>
                    );
                  })}
                  <button 
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 px-3 py-1.5 rounded-md border border-dashed border-blue-300 hover:bg-blue-50 transition-colors"
                    onClick={openConditionModal}
                  >
                    <i className="fa-solid fa-plus"></i> 配置条件
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {renderConditionModal()}
    </div>
  );
};

export default BillingRules;
