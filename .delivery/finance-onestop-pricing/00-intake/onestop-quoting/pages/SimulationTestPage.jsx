import React from 'react';
import Layout from '../components/Layout';
import QuotationSteps from '../components/QuotationSteps';
import SimulationTest from './scenario-parts/SimulationTest';

const SimulationTestPage = ({ navigate, quotationConfig }) => {
  return (
    <Layout currentPage="simulationTestPage" title="一站式报价配置" showBack={true} onBack={() => navigate('index')}>
      <div className="max-w-[1440px] mx-auto">
        <QuotationSteps currentStep={5} onStepClick={navigate} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[400px]" data-ai-alt="报价测算页面">
          <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-3">报价测算</h3>
          
          <SimulationTest formData={quotationConfig} />

          <div className="mt-8 flex justify-between border-t pt-6">
            <button className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors" data-action="go-extensionRulesPage" onClick={() => navigate('extensionRulesPage')}>上一步</button>
            <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition-colors" onClick={() => alert('配置完成！')}>提交配置</button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimulationTestPage;
