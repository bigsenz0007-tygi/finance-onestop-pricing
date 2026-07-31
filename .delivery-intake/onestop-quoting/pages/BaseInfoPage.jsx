import React, { useState } from 'react';
import Layout from '../components/Layout';
import QuotationSteps from '../components/QuotationSteps';

const BaseInfoPage = ({ navigate, quotationConfig, setQuotationConfig }) => {
  const [formData, setFormData] = useState({
    quotationName: '',
    merchantCode: '',
    merchantName: '',
    signRegion: '',
    effectiveDate: '',
    quotationMethod: '产品报价',
    discountProduct: '',
    businessScenario: '',
    settlementMethod: '',
    addressLevelMatch: '是',
    billingStrategy: '不统计不合单',
    statisticsMethod: '',
    assessmentStartMonth: '',
    hasPricePriority: '否',
    pricePriority: '',
    customBillingNode: '',
    amountRounding: '四舍五入取整',
    isCrossMonth: '否',
    crossMonthPrev: '',
    crossMonthPrevDay: '',
    crossMonthCurrentDay: '',
    ...(quotationConfig?.baseInfo || {})
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const handleChange = (key, value) => {
    setFormData(prev => {
      const newData = { ...prev, [key]: value };
      if (key === 'settlementMethod' && ['寄付现结', '到付现结'].includes(value)) {
        newData.billingStrategy = '不统计不合单';
      }
      if (key === 'discountProduct') {
        newData.businessScenario = '';
      }
      if (key === 'merchantCode') {
        if (value) {
          newData.merchantName = '京东自营测试客户（自动获取）';
          newData.signRegion = '华北';
        } else {
          newData.merchantName = '';
          newData.signRegion = '';
        }
      }
      return newData;
    });
  };

  const isCash = ['寄付现结', '到付现结'].includes(formData.settlementMethod);
  const isCrossMonthEnabled = formData.isCrossMonth === '是';
  const crossMonthComplete = !isCrossMonthEnabled || Boolean(formData.crossMonthPrev && formData.crossMonthPrevDay && formData.crossMonthCurrentDay);
  const crossMonthCycleText = crossMonthComplete && isCrossMonthEnabled
    ? `上${formData.crossMonthPrev}月${formData.crossMonthPrevDay}日至当月${formData.crossMonthCurrentDay}日`
    : '未开启';

  const handleCrossMonthToggle = (value) => {
    if (value === '否') {
      setSubmitAttempted(false);
      setFormData(prev => ({
        ...prev,
        isCrossMonth: '否',
        crossMonthPrev: '',
        crossMonthPrevDay: '',
        crossMonthCurrentDay: ''
      }));
      return;
    }
    setFormData(prev => ({ ...prev, isCrossMonth: '是' }));
  };

  const handleNext = () => {
    setSubmitAttempted(true);
    if (!crossMonthComplete) return;
    setQuotationConfig && setQuotationConfig(prev => ({ ...prev, baseInfo: formData }));
    navigate('pricePartitionPage');
  };

  const getBusinessScenarios = () => {
    switch(formData.discountProduct) {
      case '重货标快': return ['大件特配', '普通重货'];
      case '京东标快': return ['标准运输', '生鲜特配', '大促活动'];
      case '京东特快': return ['同城特快', '跨省加急'];
      default: return [];
    }
  };
  const isStatsRequired = ['统计考核', '统计+合单'].includes(formData.billingStrategy);

  return (
    <Layout currentPage="baseInfoPage" title="一站式报价配置" showBack={true} onBack={() => navigate('index')}>
      <div className="max-w-[1440px] mx-auto">
        <QuotationSteps currentStep={1} onStepClick={navigate} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8" data-ai-alt="基础信息表单">
          <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3">基础信息</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2" data-ai-alt="报价方案名称">
              <label className="block text-sm font-medium text-gray-700">报价方案名称 <span className="text-red-500">*</span></label>
              <input type="text" className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none" value={formData.quotationName} onChange={(e) => handleChange('quotationName', e.target.value)} placeholder="请输入报价方案名称" />
            </div>
            <div className="space-y-2" data-ai-alt="商家编码">
              <label className="block text-sm font-medium text-gray-700">商家编码 <span className="text-red-500">*</span></label>
              <input type="text" className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none" value={formData.merchantCode} onChange={(e) => handleChange('merchantCode', e.target.value)} placeholder="请输入商家编码" />
            </div>
            <div className="space-y-2" data-ai-alt="商家名称" data-ai-changelog-id="baseinfo-auto-merchant-name" data-ai-changelog-title="商家名称自动带出" data-ai-changelog-desc="由商家编码带出，不可手工录入">
              <label className="block text-sm font-medium text-gray-700">商家名称 <span className="text-red-500">*</span></label>
              <input type="text" className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed" value={formData.merchantName} readOnly placeholder="输入商家编码后自动带出" disabled />
            </div>
            <div className="space-y-2" data-ai-alt="签约区域" data-ai-changelog-id="baseinfo-auto-sign-area" data-ai-changelog-title="签约区域自动带出" data-ai-changelog-desc="由商家编码带出，不可手工录入">
              <label className="block text-sm font-medium text-gray-700">签约区域 <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed" value={formData.signRegion} disabled>
                <option value="">输入商家编码自动带出</option>
                <option value="华北">华北</option>
                <option value="华东">华东</option>
                <option value="华南">华南</option>
              </select>
            </div>
            <div className="space-y-2" data-ai-alt="生效时间">
              <label className="block text-sm font-medium text-gray-700">生效时间 <span className="text-red-500">*</span></label>
              <input type="date" className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none" value={formData.effectiveDate} onChange={(e) => handleChange('effectiveDate', e.target.value)} />
            </div>
            <div className="space-y-2" data-ai-alt="报价方式" data-ai-changelog-id="baseinfo-quotation-method" data-ai-changelog-title="新增报价方式" data-ai-changelog-desc="支持产品报价和场景报价，影响业务场景展示">
              <label className="block text-sm font-medium text-gray-700">报价方式 <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" value={formData.quotationMethod} onChange={(e) => handleChange('quotationMethod', e.target.value)}>
                <option value="产品报价">产品报价</option>
                <option value="场景报价">场景报价</option>
              </select>
            </div>
            <div className="space-y-2" data-ai-alt="折扣产品">
              <label className="block text-sm font-medium text-gray-700">折扣产品 <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" value={formData.discountProduct} onChange={(e) => handleChange('discountProduct', e.target.value)}>
                <option value="">请选择折扣产品</option>
                <option value="重货标快">重货标快</option>
                <option value="京东标快">京东标快</option>
                <option value="京东特快">京东特快</option>
              </select>
            </div>
            {formData.quotationMethod === '场景报价' && (
              <div className="space-y-2" data-ai-alt="业务场景">
                <label className="block text-sm font-medium text-gray-700">业务场景 <span className="text-red-500">*</span></label>
                <select className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" value={formData.businessScenario} onChange={(e) => handleChange('businessScenario', e.target.value)}>
                  <option value="">请选择业务场景</option>
                  {getBusinessScenarios().map(sc => (
                    <option key={sc} value={sc}>{sc}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2" data-ai-alt="结算方式">
              <label className="block text-sm font-medium text-gray-700">结算方式 <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" value={formData.settlementMethod} onChange={(e) => handleChange('settlementMethod', e.target.value)}>
                <option value="">请选择结算方式</option>
                <option value="月结">月结</option>
                <option value="寄付现结">寄付现结</option>
                <option value="到付现结">到付现结</option>
              </select>
            </div>
            
            <div className="space-y-2" data-ai-alt="计费策略" data-ai-changelog-id="billing-strategy-select" data-ai-changelog-title="计费策略控制显示" data-ai-changelog-desc="结算为现结时仅可选普通">
              <label className="block text-sm font-medium text-gray-700">计费策略 <span className="text-red-500">*</span></label>
              <select className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white disabled:bg-gray-100" value={formData.billingStrategy} onChange={(e) => handleChange('billingStrategy', e.target.value)} disabled={isCash}>
                <option value="不统计不合单">不统计不合单</option>
                {!isCash && <option value="统计考核">统计考核</option>}
                {!isCash && <option value="合单计费">合单计费</option>}
                {!isCash && <option value="统计+合单">统计+合单</option>}
              </select>
            </div>

            {isStatsRequired && (
              <>
                <div className="space-y-2" data-ai-alt="统计考核方式">
                  <label className="block text-sm font-medium text-gray-700">统计考核方式 <span className="text-red-500">*</span></label>
                  <select className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" value={formData.statisticsMethod} onChange={(e) => handleChange('statisticsMethod', e.target.value)}>
                    <option value="">请选择统计考核方式</option>
                    <option value="按考核开始月份">按考核开始月份</option>
                    <option value="按月中签合同考核">按月中签合同考核</option>
                    <option value="按整月考核">按整月考核</option>
                    <option value="按项目周期考核">按项目周期考核</option>
                  </select>
                </div>
                <div className="space-y-2" data-ai-alt="考核开始月份">
                  <label className="block text-sm font-medium text-gray-700">考核开始月份 <span className="text-red-500">*</span></label>
                  <input type="month" className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none" value={formData.assessmentStartMonth} onChange={(e) => handleChange('assessmentStartMonth', e.target.value)} />
                </div>
              </>
            )}
          </div>

          <div className="mt-8 border-t pt-6" data-ai-alt="复杂报价分栏" data-ai-changelog-id="baseinfo-complex-quote" data-ai-changelog-title="复杂报价分栏" data-ai-changelog-desc="新增复杂报价分栏，包含地址匹配、优先级、金额进位和跨月计费">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800">复杂报价</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!isCash && (
                  <div className="space-y-2" data-ai-alt="地址逐级匹配" data-ai-changelog-id="baseinfo-address-match" data-ai-changelog-title="现结隐藏地址匹配" data-ai-changelog-desc="结算方式为现结时不露出是否地址逐级匹配">
                    <label className="block text-sm font-medium text-gray-700">是否地址逐级匹配 <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-6 h-10">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" className="w-4 h-4 text-blue-600" checked={formData.addressLevelMatch === '是'} onChange={() => handleChange('addressLevelMatch', '是')} />
                        <span>是</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" className="w-4 h-4 text-blue-600" checked={formData.addressLevelMatch === '否'} onChange={() => handleChange('addressLevelMatch', '否')} />
                        <span>否</span>
                      </label>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2" data-ai-alt="配置价格本优先级" data-ai-changelog-id="baseinfo-price-priority" data-ai-changelog-title="价格本优先级控制" data-ai-changelog-desc="选择是后需填写价格本优先级序号">
                  <label className="block text-sm font-medium text-gray-700">配置价格本优先级 <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-6 h-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" className="w-4 h-4 text-blue-600" checked={formData.hasPricePriority === '是'} onChange={() => { handleChange('hasPricePriority', '是'); if(!formData.pricePriority) handleChange('pricePriority', '1'); }} />
                      <span>是</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" className="w-4 h-4 text-blue-600" checked={formData.hasPricePriority === '否'} onChange={() => { handleChange('hasPricePriority', '否'); handleChange('pricePriority', ''); }} />
                      <span>否</span>
                    </label>
                  </div>
                </div>

                {formData.hasPricePriority === '是' && (
                  <div className="space-y-2" data-ai-alt="价格本优先级">
                    <label className="block text-sm font-medium text-gray-700">价格本优先级 <span className="text-red-500">*</span></label>
                    <select className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" value={formData.pricePriority} onChange={(e) => handleChange('pricePriority', e.target.value)}>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                    </select>
                  </div>
                )}

                <div className="space-y-2" data-ai-alt="金额进位" data-ai-changelog-id="baseinfo-amount-rounding" data-ai-changelog-title="金额进位配置" data-ai-changelog-desc="复杂报价新增金额进位下拉，枚举四舍五入取整和保留1位小数">
                  <label className="block text-sm font-medium text-gray-700">金额进位 <span className="text-red-500">*</span></label>
                  <select className="w-full h-10 px-3 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white" value={formData.amountRounding} onChange={(e) => handleChange('amountRounding', e.target.value)}>
                    <option value="四舍五入取整">四舍五入取整</option>
                    <option value="保留1位小数">保留1位小数</option>
                  </select>
                  <p className="text-xs text-gray-500">用于报价结果金额展示和后续明细计算口径。</p>
                </div>

                <div className="space-y-2" data-ai-alt="跨月计费" data-ai-changelog-id="baseinfo-cross-month" data-ai-changelog-title="跨月计费配置" data-ai-changelog-desc="选择跨月计费后配置上几月几日至当月几日">
                  <label className="block text-sm font-medium text-gray-700">跨月计费 <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-6 h-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" className="w-4 h-4 text-blue-600" checked={formData.isCrossMonth === '是'} onChange={() => handleCrossMonthToggle('是')} />
                      <span>是</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" className="w-4 h-4 text-blue-600" checked={formData.isCrossMonth === '否'} onChange={() => handleCrossMonthToggle('否')} />
                      <span>否</span>
                    </label>
                  </div>
                </div>

                {isCrossMonthEnabled && (
                  <div className="space-y-2 md:col-span-2" data-ai-alt="跨月计费周期">
                    <label className="block text-sm font-medium text-gray-700">计费周期 <span className="text-red-500">*</span></label>
                    <div className={`flex flex-wrap items-center gap-2 p-3 rounded border ${submitAttempted && !crossMonthComplete ? 'border-red-300 bg-red-50' : 'border-blue-100 bg-blue-50'}`}>
                      <span className="text-sm text-gray-600">上</span>
                      <input type="number" min="1" max="11" className="w-16 h-9 px-2 border border-gray-300 rounded text-center focus:border-blue-500 outline-none bg-white" value={formData.crossMonthPrev} onChange={(e) => handleChange('crossMonthPrev', e.target.value)} placeholder="几" />
                      <span className="text-sm text-gray-600">月</span>
                      <input type="number" min="1" max="31" className="w-16 h-9 px-2 border border-gray-300 rounded text-center focus:border-blue-500 outline-none bg-white" value={formData.crossMonthPrevDay} onChange={(e) => handleChange('crossMonthPrevDay', e.target.value)} placeholder="日" />
                      <span className="mx-1 text-gray-400">至</span>
                      <span className="text-sm text-gray-600">当月</span>
                      <input type="number" min="1" max="31" className="w-16 h-9 px-2 border border-gray-300 rounded text-center focus:border-blue-500 outline-none bg-white" value={formData.crossMonthCurrentDay} onChange={(e) => handleChange('crossMonthCurrentDay', e.target.value)} placeholder="日" />
                      <span className="text-sm text-gray-600">日</span>
                    </div>
                    {submitAttempted && !crossMonthComplete && (
                      <p className="text-xs text-red-600 flex items-center gap-1"><i className="fa-solid fa-circle-exclamation"></i> 已选择跨月计费，请完整填写起止周期。</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-6">
            <div className="text-sm text-gray-500">
              {submitAttempted && !crossMonthComplete ? (
                <span className="text-red-600 flex items-center gap-2"><i className="fa-solid fa-triangle-exclamation"></i> 请先补全跨月计费周期后再进入下一步</span>
              ) : (
                <span>下一步将带入基础信息、复杂报价及预览配置。</span>
              )}
            </div>
            <button className={`px-6 py-2 rounded font-medium transition-colors ${submitAttempted && !crossMonthComplete ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`} data-action="go-pricePartitionPage" onClick={handleNext}>
              下一步，价格分区配置
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BaseInfoPage;
