import React from 'react';

function QuotationHomePage({ navigate, setQuotationConfig }) {
  const handleSelect = (type) => {
    // 初始化配置，固定报价方式和相关的结算方式限制
    setQuotationConfig({
      baseInfo: {
        quoteType: type,
        settleMethod: type === '场景报价' ? ['月结'] : []
      },
      billingRules: { rules: [] },
      quotationRules: {},
      extensionRules: {}
    });
    navigate('baseInfoPage');
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] flex flex-col items-center pt-[100px]" data-page-key="index" data-ai-alt="商家报价配置首页">
      <div className="text-center mb-[48px]">
        <div className="flex justify-center items-center gap-[8px] mb-[16px]">
          <span className="bg-gray-800 text-white text-[12px] px-[6px] py-[2px] rounded-[4px]">EN</span>
        </div>
        <h1 className="text-[32px] font-bold text-gray-900 mb-[16px]">商家报价配置中心</h1>
        <p className="text-[16px] text-gray-500">定义标准产品与通用场景的计费逻辑底层模型</p>
      </div>

      <div className="flex gap-[24px] max-w-[1000px] w-full px-[24px]">
        <div 
          className="flex-1 bg-white rounded-[12px] p-[32px] cursor-pointer hover:shadow-lg transition-all group"
          onClick={() => handleSelect('产品报价')}
          data-ai-alt="产品报价入口"
          data-action="go-baseInfoPage"
        >
          <div className="w-[64px] h-[64px] bg-blue-50 rounded-[12px] flex items-center justify-center mb-[24px]">
            <i className="fa-solid fa-box text-[28px] text-blue-600"></i>
          </div>
          <h2 className="text-[24px] font-bold text-gray-900 mb-[16px]">按产品报价</h2>
          <p className="text-[14px] text-gray-500 mb-[24px] leading-relaxed">
            适用于标准化的物流产品，如京东标快、京东特快等。支持快速配置产品属性、基础费用与固定业务关系。
          </p>
          <div className="flex flex-wrap gap-[8px]">
            <span className="px-[12px] py-[4px] bg-gray-50 text-gray-600 text-[12px] rounded-[4px]">京东标快</span>
            <span className="px-[12px] py-[4px] bg-gray-50 text-gray-600 text-[12px] rounded-[4px]">京东特快</span>
            <span className="px-[12px] py-[4px] bg-gray-50 text-gray-600 text-[12px] rounded-[4px]">城际速递</span>
          </div>
        </div>

        <div 
          className="flex-1 bg-white rounded-[12px] p-[32px] cursor-pointer hover:shadow-lg transition-all group"
          onClick={() => handleSelect('场景报价')}
          data-ai-alt="场景报价入口"
          data-action="go-baseInfoPage"
        >
          <div className="w-[64px] h-[64px] bg-indigo-50 rounded-[12px] flex items-center justify-center mb-[24px]">
            <i className="fa-solid fa-network-wired text-[28px] text-indigo-600"></i>
          </div>
          <h2 className="text-[24px] font-bold text-gray-900 mb-[16px]">按场景报价</h2>
          <p className="text-[14px] text-gray-500 mb-[24px] leading-relaxed">
            适用于灵活的业务场景，如合同物流、手工导单等。支持自定义计费规则、复杂报价阶梯及多维度扩展点配置。
          </p>
          <div className="flex flex-wrap gap-[8px]">
            <span className="px-[12px] py-[4px] bg-gray-50 text-gray-600 text-[12px] rounded-[4px]">合同物流</span>
            <span className="px-[12px] py-[4px] bg-gray-50 text-gray-600 text-[12px] rounded-[4px]">手工导单</span>
            <span className="px-[12px] py-[4px] bg-gray-50 text-gray-600 text-[12px] rounded-[4px]">冷链专运</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuotationHomePage;