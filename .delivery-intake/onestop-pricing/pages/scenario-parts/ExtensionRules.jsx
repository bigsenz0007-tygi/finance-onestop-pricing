import React, { useState, useEffect, useRef } from 'react';

const ExtensionRules = ({ data, onChange, formData }) => {
  const handleChange = (key, value) => {
    onChange({ ...data, [key]: value });
  };

  // 内部标题提示组件
  const TitleTooltip = ({ text }) => {
    const [show, setShow] = useState(false);
    return (
      <div 
        className="relative inline-block ml-2 cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        <i className="fa-regular fa-question-circle text-gray-400 hover:text-blue-600 text-sm"></i>
        {show && (
          <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg z-50 font-normal leading-relaxed pointer-events-none">
            {text}
            <div className="absolute left-1.5 top-full border-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    );
  };

  const DropdownMultiSelect = ({ label, tooltip, options, value = [], onChange, single }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (opt) => {
      if (single) {
        onChange([opt]);
        setIsOpen(false);
      } else {
        if (value.includes(opt)) {
          onChange(value.filter(v => v !== opt));
        } else {
          onChange([...value, opt]);
        }
      }
    };

    const removeOption = (e, opt) => {
      e.stopPropagation();
      onChange(value.filter(v => v !== opt));
    };

    return (
      <div className="flex items-start mb-4 text-sm" ref={containerRef} data-ai-changelog-id="extension-dropdown-multi-select" data-ai-changelog-title="扩展点字段下拉多选" data-ai-changelog-desc="配置字段从平铺标签调整为下拉多选组件">
        <div className="w-28 pt-2 text-gray-600 flex-shrink-0 flex items-center justify-end pr-4">
          {label}
          {tooltip && (
             <TitleTooltip text={tooltip} />
          )}
        </div>
        <div className="flex-1 relative">
          <div 
            className={`min-h-[38px] border rounded bg-white flex flex-wrap items-center gap-1.5 p-1.5 cursor-pointer transition-colors ${isOpen ? 'border-blue-500 shadow-sm' : 'border-gray-300 hover:border-gray-400'}`}
            onClick={() => setIsOpen(!isOpen)}
            data-ai-alt="下拉多选触发区"
          >
            {value.length === 0 && <span className="text-gray-400 pl-2">请选择</span>}
            {value.map(opt => (
              <span key={opt} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1">
                {opt}
                {!single && (
                  <i className="fa-solid fa-xmark cursor-pointer hover:text-red-500" onClick={(e) => removeOption(e, opt)}></i>
                )}
              </span>
            ))}
            <div className="ml-auto pr-2 text-gray-400">
              <i className={`fa-solid fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </div>
          </div>
          
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto" data-ai-alt="下拉选项面板">
              {options.map(opt => {
                const isSelected = value.includes(opt);
                return (
                  <div 
                    key={opt}
                    className={`px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-50 ${isSelected ? 'text-blue-600 bg-blue-50/50' : 'text-gray-700'}`}
                    onClick={() => toggleOption(opt)}
                    data-ai-alt={`选项-${opt}`}
                  >
                    <span>{opt}</span>
                    {isSelected && <i className="fa-solid fa-check"></i>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const firstRuleType = formData?.billingRules?.rules?.[0]?.billingType?.[0];
  const isOnlyBill = firstRuleType === '只计费';
  const isOnlyStat = firstRuleType === '只统计';

  useEffect(() => {
    if (isOnlyBill && data.enableStat) {
      onChange({ ...data, enableStat: false });
    } else if (isOnlyStat && !data.enableStat) {
      onChange({ ...data, enableStat: true });
    }
  }, [isOnlyBill, isOnlyStat, data.enableStat]);

  return (
    <div className="space-y-6">
      {/* 扩展点整体说明 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
        <div className="text-blue-600 pt-0.5">
          <i className="fa-solid fa-circle-info"></i>
        </div>
        <div className="text-sm text-blue-800 leading-relaxed">
          <div className="font-bold mb-1">扩展点配置说明</div>
          <p>扩展点用于定义标准计费流程之外的辅助处理逻辑。通过<span className="font-bold">合单规则</span>可以将多个碎片化订单合并计算以节省成本，通过<span className="font-bold">统计规则</span>可以定义业务数据的聚合维度，用于后续的对账与经营分析。此外还支持配置<span className="font-bold">无单计费</span>和<span className="font-bold">油价联动</span>等扩展能力。</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* 合单配置 */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-800 flex items-center">
                <i className="fa-solid fa-layer-group mr-2 text-blue-600"></i> 
                合单规则
                <TitleTooltip text="将满足特定条件（如同一收件人、同一天）的多个订单合并为一个逻辑单据进行计费，通常用于减少首重费用或满足最低收费标准。" />
            </h4>
            <div className="flex items-center gap-2">
                 <span className={`text-sm ${data.enableMerge ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                    {data.enableMerge ? '已启用' : '未启用'}
                 </span>
                 <button 
                    onClick={() => handleChange('enableMerge', !data.enableMerge)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors relative ${data.enableMerge ? 'bg-blue-600' : 'bg-gray-300'}`}
                 >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data.enableMerge ? 'translate-x-6' : 'translate-x-0'}`}></div>
                 </button>
            </div>
          </div>
          
          {data.enableMerge && (
              <div className="bg-white rounded p-4 shadow-sm space-y-2 animate-fade-in">
                <DropdownMultiSelect
                label="可用合单维度"
                tooltip="决定哪些订单会被合并处理的关键字段，如同一收件人的多笔订单合并（可多选）"
                options={['商家订单号', '寄件地址', '收件地址', '收件人手机']}
                value={data.mergeDimensions || []}
                onChange={(val) => handleChange('mergeDimensions', val)}
                />
                <DropdownMultiSelect
                label="可用合单对象"
                tooltip="合并时累加计算的具体物理量，如重量累加、件数累加（可多选）"
                options={['重量', '体积', '件数', '货值']}
                value={data.mergeTargets || []}
                onChange={(val) => handleChange('mergeTargets', val)}
                />
                <DropdownMultiSelect
                label="可用分摊依据"
                tooltip="将部门产品的费用通过一定的比例进行拆分（可多选）"
                options={['按重量分摊', '按体积分摊', '按件数分摊', '按金额分摊']}
                value={data.apportionBasis || []}
                onChange={(val) => handleChange('apportionBasis', val)}
                />
             </div>
          )}
        </div>

        {/* 统计配置 */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 transition-all">
           <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 flex items-center" data-ai-changelog-id="stat-rule-disabled" data-ai-changelog-title="计费策略控制统计规则开关" data-ai-changelog-desc="当计费策略为只计费时不可开启；如果是只统计则默认开启且不可关闭">
                    <i className="fa-solid fa-chart-bar mr-2 text-indigo-600"></i> 
                    统计规则 {isOnlyStat && <span className="text-xs text-red-500 ml-2 font-normal">*(只统计模式下必填)</span>}
                    <TitleTooltip text="定义业务数据报表的聚合维度和统计指标，配置结果将直接影响‘经营分析’看板中的数据展示粒度。" />
                </h4>
                <div className="flex items-center gap-2">
                    <span className={`text-sm ${data.enableStat ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>
                        {data.enableStat ? '已启用' : '未启用'}
                    </span>
                    <button 
                        onClick={() => {
                            if (isOnlyBill || isOnlyStat) return;
                            handleChange('enableStat', !data.enableStat);
                        }}
                        disabled={isOnlyBill || isOnlyStat}
                        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${data.enableStat ? 'bg-indigo-600' : 'bg-gray-300'} ${(isOnlyBill || isOnlyStat) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        data-ai-alt="统计规则开关"
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data.enableStat ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
          </div>

          {data.enableStat && (
              <div className="bg-white rounded p-4 shadow-sm space-y-2 animate-fade-in">
                <DropdownMultiSelect
                label="可用统计维度"
                tooltip="数据报表分组聚合的视角，如按承运商统计、按省份统计（可多选）"
                options={['商家', '始发仓', '承运商', '省份']}
                value={data.statDimensions || []}
                onChange={(val) => handleChange('statDimensions', val)}
                />
                <DropdownMultiSelect
                label="可用统计对象"
                tooltip="需要汇总分析的核心业务指标（可多选）"
                options={['票量', '总重量', '总运费', '异常单量']}
                value={data.statTargets || []}
                onChange={(val) => handleChange('statTargets', val)}
                />
             </div>
          )}
        </div>

        {/* 无单计费配置 */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 transition-all">
           <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 flex items-center">
                    <i className="fa-solid fa-file-excel mr-2 text-orange-600"></i> 
                    无单计费规则
                    <TitleTooltip text="在缺少源业务单据的情况下，基于其他凭证（如签收记录）直接生成计费数据。" />
                </h4>
                <div className="flex items-center gap-2">
                    <span className={`text-sm ${data.enableNoBill ? 'text-orange-600 font-bold' : 'text-gray-400'}`}>
                        {data.enableNoBill ? '已启用' : '未启用'}
                    </span>
                    <button 
                        onClick={() => handleChange('enableNoBill', !data.enableNoBill)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${data.enableNoBill ? 'bg-orange-600' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data.enableNoBill ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
          </div>

          {data.enableNoBill && (
              <div className="bg-white rounded p-4 shadow-sm space-y-2 animate-fade-in">
                <DropdownMultiSelect
                label="计费周期"
                tooltip="无单计费的结算周期"
                options={['按天', '按月']}
                value={data.noBillCycle || []}
                onChange={(val) => handleChange('noBillCycle', val)}
                single
                />
             </div>
          )}
        </div>

        {/* 油价联动配置 */}
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 transition-all">
           <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-800 flex items-center">
                    <i className="fa-solid fa-gas-pump mr-2 text-red-600"></i> 
                    油价联动规则
                    <TitleTooltip text="根据市场油价波动自动按比例调整运输费用，通常用于长途干线运输。" />
                </h4>
                <div className="flex items-center gap-2">
                    <span className={`text-sm ${data.enableFuelLink ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                        {data.enableFuelLink ? '已启用' : '未启用'}
                    </span>
                    <button 
                        onClick={() => handleChange('enableFuelLink', !data.enableFuelLink)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${data.enableFuelLink ? 'bg-red-600' : 'bg-gray-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${data.enableFuelLink ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
          </div>

          {data.enableFuelLink && (
              <div className="bg-white rounded p-4 shadow-sm space-y-2 animate-fade-in">
                <DropdownMultiSelect
                label="联动模式"
                tooltip="选择如何根据油价波动调整运费"
                options={['固定比例', '阶梯油价联动']}
                value={data.fuelMode || []}
                onChange={(val) => handleChange('fuelMode', val)}
                single
                />

                {data.fuelMode?.[0] === '固定比例' && (
                   <DropdownMultiSelect
                    label="调整基准"
                    tooltip="设置固定比例调价的基准对象"
                    options={['按总运费比例', '按单公里运费比例']}
                    value={data.fuelRatioBase || []}
                    onChange={(val) => handleChange('fuelRatioBase', val)}
                    single
                    />
                )}

                {data.fuelMode?.[0] === '阶梯油价联动' && (
                    <DropdownMultiSelect
                    label="阶梯步长"
                    tooltip="设置油价每波动多少触发一次阶梯调整"
                    options={['0.1元/L', '0.5元/L', '1.0元/L']}
                    value={data.fuelStep || []}
                    onChange={(val) => handleChange('fuelStep', val)}
                    single
                    />
                )}

                <DropdownMultiSelect
                label="调整系数"
                tooltip="油价联动时的运费调整乘数"
                options={['0.8', '1.0', '1.2']}
                value={data.fuelCoefficient || []}
                onChange={(val) => handleChange('fuelCoefficient', val)}
                single
                />
             </div>
          )}
        </div>
        
        <style jsx>{`
            .animate-fade-in {
                animation: fadeIn 0.3s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
      </div>
    </div>
  );
};

export default ExtensionRules;