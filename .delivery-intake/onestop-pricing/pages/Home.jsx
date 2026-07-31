import React from 'react';
import Layout from '../components/Layout';

const Home = ({ navigate }) => {
  return (
    <Layout currentPage="index">
      <div className="max-w-5xl mx-auto py-12">
        {/* 顶部切换提示，用于演示不同角色的入口 */}
        <div className="mb-8 flex justify-end">
           <button 
             onClick={() => navigate('quotationIndex')}
             className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm hover:bg-black transition-colors flex items-center gap-2 shadow-lg"
           >
             <i className="fa-solid fa-user-tie"></i> 
             切换至销售视角：报价配置中心
           </button>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">定价配置中心</h2>
          <p className="text-gray-500 text-lg">定义标准产品与通用场景的计费逻辑底层模型</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 选项 A：按产品定价 */}
          <div 
            onClick={() => navigate('productPricing')}
            className="group relative bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-blue-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <i className="fa-solid fa-cube text-9xl text-blue-600"></i>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                 <i className="fa-solid fa-box text-3xl text-blue-600 group-hover:text-white transition-colors"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">按产品定价</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                适用于标准化的物流产品，如京东标快、京东特快等。支持快速配置产品属性、基础费用与固定业务关系。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">京东标快</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">京东特快</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">城际速递</span>
              </div>
              <div className="mt-8 flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                开始配置 <i className="fa-solid fa-arrow-right ml-2"></i>
              </div>
            </div>
          </div>

          {/* 选项 B：按场景定价 */}
          <div 
            onClick={() => navigate('scenarioPricing')}
            className="group relative bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all cursor-pointer border border-transparent hover:border-indigo-500 overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <i className="fa-solid fa-layer-group text-9xl text-indigo-600"></i>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                 <i className="fa-solid fa-network-wired text-3xl text-indigo-600 group-hover:text-white transition-colors"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">按场景定价</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">
                适用于灵活的业务场景，如合同物流、手工导单等。支持自定义计费规则、复杂报价阶梯及多维度扩展点配置。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">合同物流</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">手工导单</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">冷链专运</span>
              </div>
              <div className="mt-8 flex items-center text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                开始配置 <i className="fa-solid fa-arrow-right ml-2"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;