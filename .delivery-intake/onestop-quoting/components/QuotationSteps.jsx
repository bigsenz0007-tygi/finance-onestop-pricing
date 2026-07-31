import React from 'react';

const QuotationSteps = ({ currentStep, onStepClick }) => {
  const steps = [
    { id: 1, title: '基础信息', key: 'baseInfoPage' },
    { id: 2, title: '价格分区', key: 'pricePartitionPage' },
    { id: 3, title: '报价明细', key: 'priceDetailPage' },
    { id: 4, title: '报价拓展规则', key: 'extensionRulesPage' },
    { id: 5, title: '报价测算', key: 'simulationTestPage' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isDone = step.id < currentStep;
          const canClick = onStepClick && (isDone || isActive || currentStep > 0); // 简单逻辑：只要在流程中，允许点击切换
          
          return (
            <div key={step.id} className="flex items-center">
              {/* 连接线 */}
              {index > 0 && (
                <div className={`w-24 h-[2px] mx-4 ${isDone || isActive ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              )}
              
              <div 
                className={`flex items-center gap-2 ${canClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                onClick={() => canClick && onStepClick && onStepClick(step.key)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : isDone 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {isDone ? <i className="fa-solid fa-check"></i> : step.id}
                </div>
                <span className={`text-sm font-bold ${isActive ? 'text-indigo-900' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuotationSteps;