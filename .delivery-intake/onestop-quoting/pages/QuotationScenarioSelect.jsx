import React, { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import QuotationSteps from '../components/QuotationSteps';
import BillingRules from './scenario-parts/BillingRules';
import QuotationRules from './scenario-parts/QuotationRules';
import ExtensionRules from './scenario-parts/ExtensionRules';

// 接收父组件传入的状态管理函数
const QuotationScenarioSelect = ({ navigate, quotationConfig, setQuotationConfig }) => {
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [mode, setMode] = useState(''); // 'ai' or 'manual'
  const [fileName, setFileName] = useState('');
  const resultSectionRef = useRef(null);
  const fileInputRef = useRef(null);

  // 使用本地状态管理表单，只在提交时同步到父组件，或者实时同步
  // 这里选择实时同步，方便
  const formData = quotationConfig;

  const updateFormData = (moduleKey, data) => {
    setQuotationConfig(prev => ({
      ...prev,
      [moduleKey]: data
    }));
  };

  const handleAnalyze = () => {
    if (!desc.trim() && !fileName) return;
    setLoading(true);
    setMode('ai');
    
    // 模拟AI分析与数据生成
    setTimeout(() => {
        setQuotationConfig({
            billingRules: { 
              rules: [
                { 
                  id: Date.now(), 
                  name: fileName ? '解析场景: 文件导入' : '推荐场景: 冷链标快', 
                  isBase: true, 
                  billTypes: ['青龙运单'], 
                  dimensions: ['整单', '包裹'], 
                  items: ['运费', '包装费'],
                  conditions: ['温层=冷冻']
                }
              ] 
            },
            quotationRules: { 
                dimensions: ['始发城市', '目的城市', '温层'], 
                modes: ['首续重计费'],
                ladders: ['重量', '体积'],
                bizRounding: ['四舍五入取整'],
                volumetricDivisor: ['6000'],
                moneyRounding: ['保留2位小数']
            },
            extensionRules: { 
                enableMerge: true,
                mergeDimensions: ['收件地址', '收件人手机'],
                mergeTargets: ['重量'],
                mergeCycles: ['按天'],
                enableStat: false,
                statDimensions: ['温层', '承运商']
            }
        });
        setLoading(false);
        setShowResult(true);
        setTimeout(() => resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setDesc(prev => prev || `已上传业务文件：${file.name}，请分析其中的计费逻辑。`);
    }
  };

  const handleManualConfig = () => {
    setMode('manual');
    // 手动模式初始化
    setQuotationConfig({
        billingRules: { 
            rules: [
              { 
                id: Date.now(), 
                name: '默认场景', 
                isBase: true, 
                billTypes: ['青龙运单'], 
                dimensions: ['整单'], 
                items: ['运费'] 
              }
            ] 
        },
        quotationRules: {},
        extensionRules: { enableMerge: false, enableStat: false }
    });
    setShowResult(true);
    setTimeout(() => resultSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // 如果是已配置状态回来，自动展开结果
  useEffect(() => {
     if (quotationConfig.billingRules?.rules?.length > 0) {
         setShowResult(true);
     }
  }, []);

  return (
    <Layout 
        currentPage="quotationScenarioSelect" 
        title="场景报价" 
        showBack 
        onBack={() => navigate('index')}
    >
      <div className="max-w-[1440px] mx-auto">
        <QuotationSteps currentStep={1} onStepClick={navigate} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 左侧：AI 智能推荐 */}
            <div className={`bg-white rounded-lg shadow-sm p-6 border-2 transition-all ${
                mode === 'ai' ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-transparent hover:border-indigo-200'
            }`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">AI 智能推荐</h3>
                        <p className="text-xs text-gray-500">输入业务描述或上传文件，自动匹配计费模型</p>
                    </div>
                </div>
                
                <textarea 
                    className="w-full h-24 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-gray-50 mb-3 text-sm"
                    placeholder="请描述客户的业务场景，例如：‘客户主要经营生鲜电商，每日单量约5000单，需要冷链运输...’"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                ></textarea>

                <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-3 mb-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-center gap-3"
                    onClick={() => fileInputRef.current.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".xlsx,.xls,.csv" 
                        onChange={handleFileUpload}
                    />
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <i className="fa-solid fa-file-excel"></i>
                    </div>
                    <div className="text-sm text-gray-600">
                        {fileName ? (
                            <span className="font-bold text-gray-800">{fileName}</span>
                        ) : (
                            <span>点击上传 <span className="font-bold">Excel/CSV</span> 业务数据文件</span>
                        )}
                    </div>
                    {fileName && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); setFileName(''); setDesc(''); }}
                            className="text-gray-400 hover:text-red-500"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    )}
                </div>
                
                <button 
                    onClick={handleAnalyze}
                    disabled={(!desc.trim() && !fileName) || loading}
                    className={`w-full py-2.5 rounded font-medium flex items-center justify-center gap-2 transition-all ${
                        (!desc.trim() && !fileName) || loading 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200'
                    }`}
                >
                    {loading ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> 正在分析场景...</>
                    ) : (
                        <><i className="fa-solid fa-robot"></i> 开始智能分析</>
                    )}
                </button>
            </div>

            {/* 右侧：手动选择模板 */}
            <div className={`bg-white rounded-lg shadow-sm p-6 border-2 transition-all flex flex-col ${
                mode === 'manual' ? 'border-blue-600 ring-2 ring-blue-50' : 'border-transparent hover:border-blue-200'
            }`}>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <i className="fa-solid fa-hand-pointer"></i>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">按模板配置</h3>
                        <p className="text-xs text-gray-500">跳过AI分析，手动选择计费场景模板</p>
                    </div>
                </div>

                <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                        <select 
                            className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            data-ai-alt="选择产品"
                            data-ai-changelog-id="scenario-product-filter"
                            data-ai-changelog-title="产品检索"
                            data-ai-changelog-desc="按场景报价，新增产品检索"
                        >
                            <option value="">选择产品</option>
                            <option value="express">特快送</option>
                            <option value="cold">冷链快运</option>
                            <option value="heavy">大件专线</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <select 
                            className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            data-ai-alt="选择业务场景类型"
                            data-ai-changelog-id="scenario-biztype-filter"
                            data-ai-changelog-title="业务场景类型检索"
                            data-ai-changelog-desc="按场景报价，新增业务场景类型检索"
                        >
                            <option value="">选择业务场景类型</option>
                            <option value="b2b">B2B</option>
                            <option value="b2c">B2C</option>
                            <option value="c2c">C2C</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100 overflow-y-auto max-h-[160px]">
                    <label className="text-xs font-bold text-gray-500 mb-2 block">常用场景模板</label>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors">
                            <input type="radio" name="template" className="accent-blue-600" defaultChecked />
                            <span className="text-sm text-gray-700">标准电商配送（按单计费）</span>
                        </label>
                        <label className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors">
                            <input type="radio" name="template" className="accent-blue-600" />
                            <span className="text-sm text-gray-700">冷链专运（按包裹+温层）</span>
                        </label>
                        <label className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:border-blue-400 transition-colors">
                            <input type="radio" name="template" className="accent-blue-600" />
                            <span className="text-sm text-gray-700">大件物流（按方/按重量）</span>
                        </label>
                    </div>
                </div>

                <button 
                    onClick={handleManualConfig}
                    className="w-full py-2.5 bg-white border border-blue-600 text-blue-600 rounded font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                    <i className="fa-solid fa-pen-to-square"></i> 确认并配置
                </button>
            </div>
        </div>

        {showResult && (
            <div ref={resultSectionRef} id="config-section" className="fade-in space-y-6 pb-20">
                <div className="flex items-center justify-between border-t border-gray-200 pt-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            {mode === 'ai' ? 'AI 推荐计费' : '按模板配置计费'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {mode === 'ai' 
                                ? '系统已为您生成初步配置，您可点击下方卡片展开并修改具体规则' 
                                : '请按需配置计费规则、定价规则及扩展服务'}
                        </p>
                    </div>
                    <button 
                        onClick={() => navigate('quotationPriceConfig')}
                        className="bg-indigo-600 text-white px-8 py-2.5 rounded hover:bg-indigo-700 shadow-md font-medium flex items-center gap-2"
                    >
                        确认配置并下一步 <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* 1. 计费规则模块 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                            <span className="font-bold text-blue-800 text-lg">
                                <i className="fa-solid fa-calculator mr-2"></i> 计费场景
                            </span>
                            {mode === 'ai' && <span className="text-xs bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-200 shadow-sm">AI 推荐</span>}
                        </div>
                        <div className="p-6">
                            <BillingRules 
                                data={formData.billingRules} 
                                onChange={(data) => updateFormData('billingRules', data)} 
                                isQuotation={true}
                            />
                        </div>
                    </div>

                    {/* 2. 定价规则模块 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex items-center justify-between">
                            <span className="font-bold text-green-800 text-lg">
                                <i className="fa-solid fa-tags mr-2"></i> 定价规则
                            </span>
                            <span className="text-xs bg-white text-green-600 px-3 py-1 rounded-full border border-green-200 shadow-sm">基准配置</span>
                        </div>
                        <div className="p-6">
                            <QuotationRules 
                                data={formData.quotationRules} 
                                onChange={(data) => updateFormData('quotationRules', data)} 
                            />
                        </div>
                    </div>

                    {/* 3. 扩展点模块 */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center justify-between">
                            <span className="font-bold text-purple-800 text-lg">
                                <i className="fa-solid fa-puzzle-piece mr-2"></i> 扩展服务
                            </span>
                            {mode === 'ai' && <span className="text-xs bg-white text-purple-600 px-3 py-1 rounded-full border border-purple-200 shadow-sm">AI 推荐</span>}
                        </div>
                        <div className="p-6">
                            <ExtensionRules 
                                data={formData.extensionRules} 
                                onChange={(data) => updateFormData('extensionRules', data)} 
                                formData={formData}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}
        <style jsx>{`
            .fade-in {
                animation: fadeIn 0.5s ease-out;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
      </div>
    </Layout>
  );
};

export default QuotationScenarioSelect;