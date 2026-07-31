import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import BaseInfo from './scenario-parts/BaseInfo';
import BillingRules from './scenario-parts/BillingRules';
import QuotationRules from './scenario-parts/QuotationRules';
import ExtensionRules from './scenario-parts/ExtensionRules';
import SimulationTest from './scenario-parts/SimulationTest';

const ScenarioPricing = ({ navigate }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    baseInfo: {},
    billingRules: { rules: [] },
    quotationRules: {}, 
    extensionRules: {},
    simulationTest: {}
  });

  const [showAiSearch, setShowAiSearch] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearchStatus, setAiSearchStatus] = useState('idle');

  const steps = useMemo(() => {
    return [
      { id: 'base', title: '基础信息', icon: 'fa-file-alt', component: BaseInfo, key: 'baseInfo' },
      { id: 'billing', title: '计费场景', icon: 'fa-calculator', component: BillingRules, key: 'billingRules' },
      { id: 'quotation', title: '定价规则', icon: 'fa-tags', component: QuotationRules, key: 'quotationRules' },
      { id: 'extension', title: '扩展点', icon: 'fa-puzzle-piece', component: ExtensionRules, key: 'extensionRules' },
      { id: 'simulation', title: '模拟测算', icon: 'fa-flask', component: SimulationTest, key: 'simulationTest' }
    ];
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (moduleKey, data) => {
    setFormData(prev => ({
      ...prev,
      [moduleKey]: data
    }));
  };

  const handleAiSearch = () => {
    if (!aiQuery.trim()) return;
    setAiSearchStatus('loading');
    setTimeout(() => {
        if (aiQuery.length > 5) {
            setAiSearchStatus('success');
        } else {
            setAiSearchStatus('no_result');
        }
    }, 1200);
  };

  const applyAiResult = () => {
      setFormData({
          baseInfo: { name: '2024Q2合同物流大促(推荐)', owner: 'zhangsan', startDate: '2024-04-01', endDate: '2024-06-30', desc: aiQuery },
          billingRules: { 
            rules: [
              { 
                id: Date.now(), 
                name: '标准计费', 
                isBase: true, 
                billTypes: ['青龙运单'], 
                dimensions: ['整单'], 
                items: ['运费'] 
              }
            ] 
          },
          quotationRules: { 
              dimensions: ['始发城市', '温层'], 
              modes: ['首续重计费'],
              ladders: ['重量'],
              bizRounding: ['四舍五入取整'],
              volumetricDivisor: ['6000'],
              moneyRounding: ['保留2位小数']
          },
          extensionRules: { enableMerge: true, mergeDimensions: ['商家订单号'], enableStat: false }
      });
      setShowAiSearch(false);
      setAiSearchStatus('idle');
      setAiQuery('');
      alert('已成功应用推荐的场景配置！');
  };

  const closeAiModal = () => {
      setShowAiSearch(false);
      setAiSearchStatus('idle');
  };

  // 防止 currentStep 越界
  const safeStep = currentStep >= steps.length ? steps.length - 1 : currentStep;
  const CurrentComponent = steps[safeStep].component;

  return (
    <Layout 
      title="场景定价配置" 
      showBack 
      onBack={() => navigate('index')} 
      currentPage="scenarioPricing"
    >
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between px-10 relative">
            <div className="absolute left-[10%] right-[10%] top-[24px] h-[2px] bg-gray-100 z-0"></div>
            
            {steps.map((step, index) => {
              const isActive = index === currentStep;
              const isDone = index < currentStep;
              
              return (
                <div 
                  key={step.id} 
                  className="flex flex-col items-center gap-3 relative z-10 cursor-pointer group"
                  onClick={() => setCurrentStep(index)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 ${
                    isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110' 
                      : isDone 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-400 group-hover:border-blue-300'
                  }`}>
                    {isDone ? <i className="fa-solid fa-check text-lg"></i> : <i className={`fa-solid ${step.icon} text-lg`}></i>}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-bold transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </div>
                    {isActive && <div className="text-xs text-blue-400 mt-1 font-medium">正在配置</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {currentStep === 0 && (
          <div className="bg-white rounded-lg shadow-sm px-8 py-4 flex items-center justify-end min-h-[60px]">
            <button 
              onClick={() => setShowAiSearch(true)}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-5 py-2.5 rounded-full transition-all border border-indigo-200 hover:border-indigo-600 shadow-sm font-medium fade-in"
            >
              <i className="fa-solid fa-robot"></i>
              <span>AI 场景计费检索</span>
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm flex flex-col min-h-[500px]">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">{steps[safeStep].title}</h3>
              <span className="text-sm text-gray-400">步骤 {safeStep + 1} / {steps.length}</span>
          </div>
          
          <div className="p-8 flex-1">
            <CurrentComponent 
              data={formData[steps[safeStep].key]} 
              onChange={(data) => updateFormData(steps[safeStep].key, data)} 
              formData={formData}
            />
          </div>

          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 rounded-b-lg flex justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-6 py-2.5 rounded border font-medium transition-all ${
                currentStep === 0 
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed' 
                  : 'border-gray-300 text-gray-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              上一步
            </button>

            <div className="flex gap-3">
              {currentStep === steps.length - 1 ? (
                <button
                  onClick={() => alert('配置已提交！')}
                  className="px-8 py-2.5 bg-green-600 text-white rounded font-medium shadow hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-check"></i> 完成并发布
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded font-medium shadow hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  下一步 <i className="fa-solid fa-arrow-right"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAiSearch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-[600px] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                  <i className="fa-solid fa-robot text-indigo-600"></i>
                  AI 场景计费检索
                </h3>
                <button onClick={closeAiModal} className="text-gray-400 hover:text-gray-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200">
                  <i className="fa-solid fa-times text-lg"></i>
                </button>
              </div>
              
              <div className="p-6 flex-1 max-h-[70vh] overflow-y-auto">
                <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">描述您的业务场景</label>
                    <textarea
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-gray-50 text-sm transition-all"
                    placeholder="请输入详细的业务描述，系统将自动匹配最适合的计费模板。例如：‘客户主要经营生鲜电商，每日单量约5000单，需要冷链运输，按省份和重量阶梯收费...’"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    />
                </div>
                
                <button 
                  onClick={handleAiSearch}
                  disabled={!aiQuery.trim() || aiSearchStatus === 'loading'}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                      !aiQuery.trim() || aiSearchStatus === 'loading'
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                  }`}
                >
                  {aiSearchStatus === 'loading' ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> 智能分析检索中...</>
                  ) : (
                      <><i className="fa-solid fa-search"></i> 检索匹配模板</>
                  )}
                </button>

                {aiSearchStatus === 'success' && (
                  <div className="mt-8 border-t border-gray-100 pt-6 animate-fade-in">
                    <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i>
                        为您推荐以下场景计费模版
                    </h4>
                    <div className="space-y-4">
                      <div className="border border-indigo-200 bg-indigo-50/50 rounded-lg p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="font-bold text-indigo-900 text-lg mb-1">电商冷链标准计费 (推荐)</div>
                                <div className="text-xs text-gray-600 flex items-center gap-3">
                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">匹配度: 98%</span>
                                    <span>近1个月被引用 150+ 次</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-sm text-gray-700 bg-white p-3 rounded border border-indigo-100">
                            <b>包含规则：</b>标准计费(整单)、温层与城市维度定价、首续重阶梯、四舍五入等进位配置，已开启订单合并计算。
                        </div>
                        <div className="flex justify-end">
                            <button 
                                onClick={applyAiResult}
                                className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <i className="fa-solid fa-download"></i> 导入此配置
                            </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {aiSearchStatus === 'no_result' && (
                  <div className="mt-8 border-t border-gray-100 pt-8 text-center animate-fade-in">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                      <i className="fa-solid fa-folder-open text-2xl"></i>
                    </div>
                    <h4 className="text-gray-800 font-bold mb-2">未找到高度匹配的计费模板</h4>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">您的业务场景较为特殊，当前库中没有合适的模板。建议您关闭弹窗，继续使用手工分步配置。</p>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}
    </Layout>
  );
};

export default ScenarioPricing;
