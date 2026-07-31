import React, { useMemo } from 'react';
import Layout from '../components/Layout';
import QuotationSteps from '../components/QuotationSteps';

const QuotationPriceConfig = ({ navigate, quotationConfig }) => {

  // 1. 获取配置数据，如果为空则给默认值防止报错
  const { 
    dimensions = ['始发城市', '目的城市', '温层'], 
    ladders = ['重量'], 
    modes = ['首续重计费'],
    bizRounding = ['四舍五入取整']
  } = quotationConfig?.quotationRules || {};

  // 2. 构造表头数据
  // 阶梯列：如果有多个阶梯，这里只取第一个作为主阶梯展示区间，简化原型
  const mainLadder = ladders[0] || '重量';
  
  // 3. 模拟表格行数据
  const rows = useMemo(() => {
    return [1, 2, 3].map(i => ({
      id: i,
      dims: dimensions.map(d => d === '温层' ? (i===1?'冷冻':i===2?'冷藏':'常温') : '不限'),
      ladderStart: i === 1 ? '0' : ((i-1) * 10).toString(),
      ladderEnd: i === 3 ? '∞' : (i * 10).toString(), // 示例区间
      mode: modes[0] || '首续重计费', // 默认选中第一个模式
      prices: { base: '12.00', extra: '4.00', fixed: '100.00' }
    }));
  }, [dimensions, modes]);

  return (
    <Layout 
        currentPage="quotationPriceConfig" 
        title="场景报价" 
        showBack 
        onBack={() => navigate('quotationScenarioSelect')}
    >
      <div className="max-w-[1440px] mx-auto">
        <QuotationSteps currentStep={2} onStepClick={navigate} />

        <div className="w-full space-y-6">
            
            {/* 1. 基础信息区块 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-indigo-50/50 px-8 py-4 border-b border-indigo-100 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">1</span>
                    <h3 className="font-bold text-gray-800">基础信息</h3>
                </div>
                
                <div className="p-8 w-full">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">商家名称 <span className="text-red-500">*</span></label>
                            <input type="text" className="w-full h-10 px-3 border border-gray-300 rounded focus:border-indigo-500 outline-none" placeholder="输入商家名称" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">合同/报价单号</label>
                            <input type="text" className="w-full h-10 px-3 border border-gray-300 rounded focus:border-indigo-500 outline-none" placeholder="自动生成或手动输入" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">报价效期 <span className="text-red-500">*</span></label>
                            <div className="flex items-center gap-3">
                                <input type="date" className="flex-1 h-10 px-3 border border-gray-300 rounded focus:border-indigo-500 outline-none" />
                                <span className="text-gray-400">至</span>
                                <input type="date" className="flex-1 h-10 px-3 border border-gray-300 rounded focus:border-indigo-500 outline-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. 报价明细区块 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                 <div className="bg-indigo-50/50 px-8 py-4 border-b border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</span>
                        <h3 className="font-bold text-gray-800">报价明细</h3>
                    </div>
                    
                    {/* 全局参数展示 */}
                    <div className="flex items-center gap-4 text-xs bg-white px-3 py-1.5 rounded border border-indigo-100 text-gray-600 shadow-sm">
                         <div className="flex items-center gap-1">
                             <span className="font-bold text-gray-800">业务进位:</span>
                             <span className="bg-gray-100 px-1.5 rounded">{bizRounding[0]}</span>
                         </div>

                    </div>
                </div>

                <div className="p-8">
                    <div className="bg-yellow-50 border border-yellow-100 p-3 rounded mb-6 text-sm text-yellow-800 flex items-center gap-2">
                        <i className="fa-solid fa-lightbulb"></i>
                        <span>报价模板已根据您选择的 <b>[{dimensions.join(', ')}]</b> 维度和 <b>[{mainLadder}]</b> 阶梯自动生成。</span>
                    </div>

                    <div className="border border-gray-200 rounded overflow-hidden mb-6 overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[1000px]">
                            <thead className="bg-gray-50 text-gray-700 font-bold">
                                <tr>
                                    {/* 动态维度列 */}
                                    {dimensions.map((dim, idx) => (
                                        <th key={idx} className="p-3 border-b min-w-[100px]">{dim}</th>
                                    ))}
                                    
                                    {/* 动态阶梯列 */}
                                    <th className="p-3 border-b bg-indigo-50/30 min-w-[180px] text-indigo-900">
                                        {mainLadder}范围 (下限-上限)
                                    </th>

                                    {/* 报价模式选择列 */}
                                    <th className="p-3 border-b bg-indigo-50/50 min-w-[140px]">报价模式</th>

                                    {/* 价格配置列：根据模式动态变化，这里展示通用列 */}
                                    <th className="p-3 border-b bg-indigo-50/50 min-w-[100px] text-indigo-900">价格配置</th>
                                    
                                    <th className="p-3 border-b w-16 text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50 group">
                                        {/* 维度值 */}
                                        {row.dims.map((val, vIdx) => (
                                            <td key={vIdx} className="p-3">
                                                <input 
                                                    type="text" 
                                                    defaultValue={val} 
                                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-700" 
                                                />
                                            </td>
                                        ))}

                                        {/* 阶梯区间输入 */}
                                        <td className="p-3">
                                            <div className="flex items-center gap-1">
                                                <input 
                                                    type="text" 
                                                    defaultValue={row.ladderStart} 
                                                    placeholder="下限"
                                                    className="w-16 border border-gray-300 rounded px-1 py-0.5 text-center focus:border-indigo-500 outline-none"
                                                />
                                                <span className="text-gray-400">-</span>
                                                <input 
                                                    type="text" 
                                                    defaultValue={row.ladderEnd} 
                                                    placeholder="上限"
                                                    className="w-16 border border-gray-300 rounded px-1 py-0.5 text-center focus:border-indigo-500 outline-none"
                                                />
                                            </div>
                                        </td>

                                        {/* 报价模式选择 */}
                                        <td className="p-3">
                                            <select 
                                                className="w-full border border-gray-300 rounded px-1 py-0.5 text-sm focus:border-indigo-500 outline-none"
                                                defaultValue={row.mode}
                                            >
                                                {modes.map(m => <option key={m}>{m}</option>)}
                                                {/* 兜底：如果配置里选的模式不够多，这里可以补充其他标准模式，但按需求应“不限阶梯可以设置不同模式” */}
                                                <option>一口价</option>
                                            </select>
                                        </td>

                                        {/* 价格输入区：根据模式简单变化 placeholder */}
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {/* 简单模拟：首续重显示两个框，一口价显示一个框 */}
                                                <input type="text" placeholder="首重/固定" defaultValue={row.prices.base} className="w-20 border border-indigo-200 rounded px-1 py-0.5 text-center font-bold text-indigo-600" />
                                                <input type="text" placeholder="续重" defaultValue={row.prices.extra} className="w-20 border border-indigo-200 rounded px-1 py-0.5 text-center font-bold text-indigo-600" />
                                            </div>
                                        </td>

                                        <td className="p-3 text-center">
                                            <button className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-3 border-t bg-gray-50 flex justify-center">
                            <button className="text-indigo-600 text-sm hover:underline flex items-center gap-1">
                                <i className="fa-solid fa-plus"></i> 添加一行报价
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 底部按钮栏 */}
            <div className="flex justify-end gap-3 pt-6">
                <button 
                    onClick={() => navigate('quotationScenarioSelect')} 
                    className="px-8 py-3 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 font-medium"
                >
                    上一步
                </button>
                <button 
                    onClick={() => alert('报价单已生成并提交审批！')}
                    className="px-8 py-3 bg-green-600 text-white rounded hover:bg-green-700 shadow-lg hover:shadow-green-200 font-medium flex items-center gap-2"
                >
                    <i className="fa-solid fa-check"></i> 提交报价单
                </button>
            </div>
            
            <style jsx>{`
                .fade-in {
                    animation: fadeIn 0.3s ease-in-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; } 
                    to { opacity: 1; }
                }
            `}</style>
        </div>
      </div>
    </Layout>
  );
};

export default QuotationPriceConfig;