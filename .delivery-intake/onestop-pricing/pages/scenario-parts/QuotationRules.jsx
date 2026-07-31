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
  const [isCreateModeOpen, setIsCreateModeOpen] = useState(false);
  const [modalFactors, setModalFactors] = useState([]);
  const [modalPriceItems, setModalPriceItems] = useState([]);
  const [isAppControlOpen, setIsAppControlOpen] = useState(false);
  const [currentAppControlMode, setCurrentAppControlMode] = useState(null);

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
          <div 
            className="space-y-2"
            data-ai-changelog-id="quotation-dimensions-alias"
            data-ai-changelog-title="报价维度别名设置"
            data-ai-changelog-desc="在选择了报价维度后，下方展开对应项的别名输入框"
          >
            <MultiSelectDropdown
              label="报价维度"
              tooltip="决定价格差异的核心因素"
              options={['始发城市', '目的城市', '商家业务类型', '配送区域', '时效等级']}
              value={data.dimensions || []}
              onChange={(val) => handleChange('dimensions', val)}
              placeholder="请选择报价维度 (可多选)"
            />
            {data.dimensions && data.dimensions.length > 0 && (
              <div className="pl-36 mt-2">
                <div className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                      <tr>
                        <th className="px-4 py-2.5 font-medium border-r border-gray-200 w-1/3">维度名称</th>
                        <th className="px-4 py-2.5 font-medium border-r border-gray-200 w-1/3">录入限制</th>
                        <th className="px-4 py-2.5 font-medium w-1/3">别名</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data.dimensions.map((dim) => (
                        <tr key={dim}>
                          <td className="px-4 py-2.5 border-r border-gray-200 text-gray-800">{dim}</td>
                          <td className="px-4 py-2.5 border-r border-gray-200">
                            <button type="button" className="text-blue-600 hover:text-blue-800 text-sm font-medium" data-ai-alt={`${dim}录入限制编辑`}>编辑</button>
                          </td>
                          <td className="px-4 py-2.5">
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" 
                              placeholder="别名"
                              value={data.dimensionAliases?.[dim] || ''}
                              onChange={(e) => handleChange('dimensionAliases', { ...data.dimensionAliases, [dim]: e.target.value })}
                              data-ai-alt={`${dim}设置别名`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          
          <div 
            className="flex items-start gap-4"
            data-ai-changelog-id="quotation-create-mode-entry"
            data-ai-changelog-title="新建报价模式入口"
            data-ai-changelog-desc="在报价模式右侧增加新建报价模式的按钮"
          >
            <div className="flex-1 space-y-2">
              <MultiSelectDropdown
                label="报价模式"
                tooltip="价格计算的基础算法模型"
                options={['首续重计费', '按件型', '按方', '一口价', '百分比提成']}
                value={data.modes || []}
                onChange={(val) => handleChange('modes', val)}
                placeholder="请选择报价模式 (可多选)"
              />
            </div>
            <button
              className="mt-1 flex items-center justify-center px-4 py-1.5 border border-blue-500 text-blue-500 rounded hover:bg-blue-50 text-sm whitespace-nowrap"
              onClick={() => setIsCreateModeOpen(true)}
              data-ai-alt="新建报价模式"
            >
              <i className="fa-solid fa-plus mr-1"></i> 新建报价模式
            </button>
          </div>

          {data.modes && data.modes.length > 0 && (
            <div 
              className="mt-4 border border-gray-200 rounded-lg overflow-x-auto shadow-sm"
              data-ai-changelog-id="quotation-modes-detail-table"
              data-ai-changelog-title="报价模式详情表格"
              data-ai-changelog-desc="选择报价模式后，展示后附模式的计费公式、定价维度、价格项和计费因子等详情"
              data-ai-alt="选中报价模式的详情表格"
            >
              <table className="w-full text-sm text-left whitespace-nowrap min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium border-r border-gray-200">报价模式</th>
                    <th className="px-4 py-3 font-medium border-r border-gray-200">别名</th>
                    <th className="px-4 py-3 font-medium border-r border-gray-200">对应公式</th>
                    <th className="px-4 py-3 font-medium border-r border-gray-200">定价维度</th>
                    <th className="px-4 py-3 font-medium border-r border-gray-200">价格项</th>
                    <th className="px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
                  {data.modes.map((mode, index) => {
                    const mockDetails = {
                      '首续重计费': { formula: 'first_continue_weight_new_min_charge', dim: '国际起始地(157); 清关模式(158);', priceItems: '最低收费(107); 首重(108); 首重价格(109); 续重价格(110); 续重公斤(111); 轻抛系数(117);' },
                      '按件型': { formula: 'carton_count_box_gauge', dim: '冷医商品温层(315);', priceItems: '元/箱(128);' },
                      '按方': { formula: 'volume_charge', dim: '起始地; 目的地;', priceItems: '元/方(129);' },
                      '一口价': { formula: 'fixed_price', dim: '', priceItems: '固定金额(130);' },
                      '百分比提成': { formula: 'percentage_commission', dim: 'JDL&DP网融-运营模式(374);', priceItems: '提成比例(131);' }
                    };
                    const detail = mockDetails[mode] || { formula: '-', dim: '-', priceItems: '-' };
                    return (
                      <tr key={mode} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}>
                        <td className="px-4 py-3 border-r border-gray-200">{mode}</td>
                        <td className="px-4 py-3 border-r border-gray-200">
                           <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" 
                              placeholder="别名"
                              value={data.modeAliases?.[mode] || ''}
                              onChange={(e) => handleChange('modeAliases', { ...data.modeAliases, [mode]: e.target.value })}
                              data-ai-alt={`${mode}设置别名`}
                            />
                        </td>
                        <td className="px-4 py-3 border-r border-gray-200">{detail.formula}</td>
                        <td className="px-4 py-3 border-r border-gray-200">{detail.dim}</td>
                        <td className="px-4 py-3 border-r border-gray-200">{detail.priceItems}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            onClick={() => {
                              setCurrentAppControlMode(mode);
                              setIsAppControlOpen(true);
                            }}
                            data-ai-alt="点击应用管控"
                          >
                            应用管控
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
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

      {isCreateModeOpen && (
        <>
          <div className="fixed inset-0 bg-black/45 z-40" onClick={() => setIsCreateModeOpen(false)} data-ai-alt="弹窗遮罩"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
              data-ai-changelog-id="quotation-create-mode-modal"
              data-ai-changelog-title="报价模式创建弹窗"
              data-ai-changelog-desc="包含报价模式定义和报价模式测算两部分，支持公式编辑"
              data-ai-alt="报价模式创建弹窗"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">新建报价模式</h2>
                <button 
                  onClick={() => setIsCreateModeOpen(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  data-ai-alt="关闭弹窗"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6">
                {/* 左侧：报价模式定义 */}
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-2">报价模式定义</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="text-red-500 mr-1">*</span>报价模式名称
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="请输入报价模式名称"
                        data-ai-alt="输入报价模式名称"
                      />
                    </div>
                    <div>
                      <MultiSelectDropdown
                        label="计费因子"
                        options={['【F_001】计费重量', '【F_002】计费件数', '【F_003】计费体积']}
                        value={modalFactors}
                        onChange={(val) => setModalFactors(val)}
                        placeholder="请选择计费因子"
                      />
                    </div>
                    <div>
                      <MultiSelectDropdown
                        label="价格项"
                        options={['【P_001】首重单价', '【P_002】续重单价', '【P_003】操作费单价', '【P_004】派送费单价']}
                        value={modalPriceItems}
                        onChange={(val) => setModalPriceItems(val)}
                        placeholder="请选择价格项"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                         <label className="block text-sm font-medium text-gray-700">
                           <span className="text-red-500 mr-1">*</span>报价模式公式内容
                         </label>
                      </div>
                      <div className="bg-gray-50 p-2 border border-gray-200 rounded mb-2 space-y-2" data-ai-alt="公式快捷操作">
                         <div className="flex items-start gap-2">
                            <span className="text-xs text-gray-500 w-16 pt-1">计算符号:</span>
                            <div className="flex flex-wrap gap-1 flex-1">
                               {['+', '-', '*', '/', '<', '<=', '>', '>=', '=', '(', ')'].map(sym => (
                                 <button key={sym} className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 text-xs hover:bg-gray-100 min-w-[28px]" data-ai-alt={`添加符号${sym}`}>{sym}</button>
                               ))}
                            </div>
                         </div>
                         <div className="flex items-start gap-2">
                            <span className="text-xs text-gray-500 w-16 pt-1">计算函数:</span>
                            <div className="flex flex-wrap gap-1 flex-1">
                               {['max', 'min', 'which'].map(func => (
                                 <button key={func} className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 text-xs hover:bg-gray-100" data-ai-alt={`添加函数${func}`}>{func}</button>
                               ))}
                            </div>
                         </div>
                         <div className="flex items-start gap-2">
                            <span className="text-xs text-gray-500 w-16 pt-1">特殊变量:</span>
                            <div className="flex flex-wrap gap-1 flex-1">
                               {['计费重量', '油价系数'].map(sym => (
                                 <button key={sym} className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 text-xs hover:bg-gray-100" data-ai-alt={`添加变量${sym}`}>{sym}</button>
                               ))}
                            </div>
                         </div>
                      </div>
                      <textarea 
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={3}
                        defaultValue="首重单价 + max(0, 计费重量 - 1) * 续重单价"
                        placeholder="请输入或点击上方按钮组合公式"
                        data-ai-alt="编写公式表达式"
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <span className="text-red-500 mr-1">*</span>公式描述
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={2}
                        placeholder="请描述该公式的业务含义"
                        data-ai-alt="输入公式描述"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* 右侧：报价模式测算 */}
                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <h3 className="font-bold text-gray-800 mb-4 border-l-4 border-green-500 pl-2">报价模式测算</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      录入计费因子和价格项的值，输出计算过程和测算结果。
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-medium text-gray-700 mb-1">计费重量 (因子)</label>
                         <input type="number" defaultValue={2.5} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="值" data-ai-alt="输入测算因子" />
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-gray-700 mb-1">首重单价 (价格项)</label>
                         <input type="number" defaultValue={12} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="值" data-ai-alt="输入首重单价" />
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-gray-700 mb-1">续重单价 (价格项)</label>
                         <input type="number" defaultValue={5} className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="值" data-ai-alt="输入续重单价" />
                       </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 mt-4">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-gray-700">计算过程：</span>
                        <div className="mt-1 p-2 bg-gray-100 rounded text-xs text-gray-600 font-mono break-all" data-ai-alt="计算过程展示">
                          12 + max(0, 2.5 - 1) * 5<br/>
                          = 12 + 1.5 * 5<br/>
                          = 12 + 7.5<br/>
                          = 19.5
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm font-bold text-gray-800">测算结果：</span>
                        <span className="text-lg font-bold text-red-500">¥ 19.50</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-sm"
                  onClick={() => setIsCreateModeOpen(false)}
                  data-ai-alt="取消"
                >取消</button>
                <button 
                  className="px-4 py-2 border border-transparent rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                  onClick={() => setIsCreateModeOpen(false)}
                  data-ai-alt="保存报价模式"
                >保存报价模式</button>
              </div>
            </div>
          </div>
        </>
      )}

      {isAppControlOpen && (
        <>
          <div className="fixed inset-0 bg-black/45 z-40" onClick={() => setIsAppControlOpen(false)} data-ai-alt="应用管控弹窗遮罩"></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
              data-ai-changelog-id="quotation-app-control-modal"
              data-ai-changelog-title="应用管控弹窗"
              data-ai-changelog-desc="修改定价维度和价格项别名，以及价格项录入限制和填写说明"
              data-ai-alt="应用管控弹窗容器"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">应用管控 - {currentAppControlMode}</h2>
                <button 
                  onClick={() => setIsAppControlOpen(false)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  data-ai-alt="关闭应用管控弹窗"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 border-l-4 border-blue-500 pl-2">定价维度</h3>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                        <tr>
                          <th className="px-4 py-3 font-medium border-r border-gray-200 w-1/3">维度名称</th>
                          <th className="px-4 py-3 font-medium border-r border-gray-200 w-1/3">录入限制</th>
                          <th className="px-4 py-3 font-medium">别名</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
                        {['国际起始地(157)', '清关模式(158)'].map((dim, idx) => (
                          <tr key={idx} className="bg-white hover:bg-gray-50">
                            <td className="px-4 py-3 border-r border-gray-200">{dim}</td>
                            <td className="px-4 py-3 border-r border-gray-200">
                               <button type="button" className="text-blue-600 hover:text-blue-800 text-sm" data-ai-alt={`编辑${dim}限制`}>编辑</button>
                            </td>
                            <td className="px-4 py-3">
                               <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" placeholder="别名" data-ai-alt={`${dim}别名`} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 mb-3 border-l-4 border-blue-500 pl-2">价格项</h3>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                        <tr>
                          <th className="px-4 py-3 font-medium border-r border-gray-200 w-1/3">价格项</th>
                          <th className="px-4 py-3 font-medium border-r border-gray-200 w-1/3">录入限制</th>
                          <th className="px-4 py-3 font-medium">别名</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
                        {['最低收费(107)', '首重(108)', '首重价格(109)', '续重价格(110)'].map((item, idx) => (
                          <tr key={idx} className="bg-white hover:bg-gray-50">
                            <td className="px-4 py-3 border-r border-gray-200">{item}</td>
                            <td className="px-4 py-3 border-r border-gray-200">
                               <select className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" data-ai-alt={`${item}录入限制`}>
                                 <option>无限制</option>
                                 <option>仅限正数</option>
                                 <option>仅限整数</option>
                               </select>
                            </td>
                            <td className="px-4 py-3">
                               <input type="text" className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500" placeholder="输入别名" data-ai-alt={`${item}别名`} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 text-sm"
                  onClick={() => setIsAppControlOpen(false)}
                  data-ai-alt="取消应用管控"
                >取消</button>
                <button 
                  className="px-4 py-2 border border-transparent rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                  onClick={() => setIsAppControlOpen(false)}
                  data-ai-alt="保存应用管控"
                >保存</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default QuotationRules;