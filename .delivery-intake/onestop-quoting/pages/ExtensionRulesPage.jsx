import React from 'react';
import Layout from '../components/Layout';
import QuotationSteps from '../components/QuotationSteps';

const ExtensionRulesPage = ({ navigate, quotationConfig, setQuotationConfig }) => {
  const strategy = quotationConfig?.baseInfo?.billingStrategy || '普通';
  const isStats = strategy === '统计考核' || strategy === '统计+合单';
  const isCombine = strategy === '合单计费' || strategy === '统计+合单';
  const isProductQuotation = quotationConfig?.baseInfo?.quotationMethod === '产品报价';

  const showStatsConfig = isStats && !isProductQuotation;
  const showCombineConfig = isCombine;
  const showNoConfig = !showStatsConfig && !showCombineConfig;

  return (
    <Layout currentPage="extensionRulesPage" title="一站式报价配置" showBack={true} onBack={() => navigate('index')}>
      <div className="max-w-[1440px] mx-auto">
        <QuotationSteps currentStep={4} onStepClick={navigate} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[400px]" data-ai-alt="报价拓展规则配置">
          <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3">报价拓展规则配置</h3>
          <div className="flex flex-col gap-8">
            {showStatsConfig && (
              <div className="border border-gray-200 rounded p-6 relative">
                <h4 className="absolute -top-3 left-4 bg-white px-2 text-sm font-bold text-gray-700">统计规则配置</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">统计维度</label>
                    <select className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                      <option>始发城市</option>
                      <option>目的城市</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">统计对象</label>
                    <select className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                      <option>商家单量</option>
                      <option>重量</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">开闭区间类型</label>
                    <select className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                      <option>左闭右开</option>
                      <option>左开右闭</option>
                      <option>全闭区间</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {showCombineConfig && (
              <div className="border border-gray-200 rounded p-6 relative">
                <h4 className="absolute -top-3 left-4 bg-white px-2 text-sm font-bold text-gray-700">合单规则配置</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">合单维度</label>
                    <select className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                      <option>相同收件人</option>
                      <option>相同地址</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">合单对象</label>
                    <select className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                      <option>重量</option>
                      <option>体积</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">分摊依据</label>
                    <select className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                      <option>按重量分摊</option>
                      <option>按体积分摊</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {showNoConfig && (
              <div className="text-gray-500 py-4" data-ai-changelog-id="ext-rule-no-config" data-ai-changelog-title="产品报价统计隐藏" data-ai-changelog-desc="产品报价下统计考核不展示时兜底提示">当前计费策略或报价方式组合无需配置扩展规则</div>
            )}
          </div>
          <div className="mt-8 flex justify-between border-t pt-6">
            <button className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors" data-action="go-priceDetailPage" onClick={() => navigate('priceDetailPage')}>上一步</button>
            <button className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium transition-colors" data-action="go-simulationTestPage" onClick={() => navigate('simulationTestPage')}>下一步</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExtensionRulesPage;
