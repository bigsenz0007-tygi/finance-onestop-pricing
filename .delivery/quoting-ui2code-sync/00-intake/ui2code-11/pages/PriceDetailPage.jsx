import React, { useState } from 'react';
import Layout from '../components/Layout';
import QuotationSteps from '../components/QuotationSteps';
import PriceDetailImportModalFrame from '../components/PriceDetailImportModalFrame';
import PriceDetailImportContent from '../components/PriceDetailImportContent';

const PriceDetailPage = ({ navigate, quotationConfig, setQuotationConfig }) => {
  const strategy = quotationConfig?.baseInfo?.billingStrategy || '普通';
  const isStats = strategy === '统计考核' || strategy === '统计+合单';
  const isProductQuotation = quotationConfig?.baseInfo?.quotationMethod === '产品报价';
  const showStatFields = isProductQuotation && isStats;
  
  const partitions = quotationConfig?.partitionConfig?.partitions || [{ id: 'default', name: '默认分区' }];
  const [activePartitionId, setActivePartitionId] = useState(partitions[0]?.id);
  const activePartition = partitions.find(p => p.id === activePartitionId) || partitions[0];
  
  const [partitionConfigs, setPartitionConfigs] = useState({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const getPartitionConfig = (id) => {
    return partitionConfigs[id] || {
      stairMode: '计费重量',
      rows: [{ id: Date.now(), statMin: 0, statMax: 30, stairMin: 0, stairMax: '无穷大', discountMode: '折扣率', discountDetail: '100' }]
    };
  };

  const updatePartitionConfig = (id, newConfig) => {
    setPartitionConfigs(prev => ({ ...prev, [id]: newConfig }));
  };

  const currentConfig = getPartitionConfig(activePartitionId);
  const currentStairMode = currentConfig.stairMode;
  const tableData = currentConfig.rows;

  return (
    <Layout currentPage="priceDetailPage" title="一站式报价配置" showBack={true} onBack={() => navigate('index')}>
      <div className="max-w-[1440px] mx-auto">
        <QuotationSteps currentStep={3} onStepClick={navigate} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[400px]" data-ai-alt="报价明细配置">
          <div className="flex items-center justify-between mb-6 border-b pb-3">
            <h3 className="text-lg font-bold text-gray-800">报价明细配置</h3>
            <button
              className="px-3 py-1.5 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded shadow-sm hover:bg-gray-50 flex items-center gap-2"
              onClick={() => setIsImportModalOpen(true)}
              data-action="go-priceDetailImportModal"
              data-ai-alt="导入报价明细"
              data-ai-changelog-id="price-detail-import-btn"
              data-ai-changelog-title="导入报价明细"
              data-ai-changelog-desc="新增导入报价明细的按钮，点击弹出上传操作"
            >
              <i className="fa-solid fa-file-import text-blue-600"></i>
              导入报价明细
            </button>
          </div>
          
          <div 
            className="flex border-b border-gray-200 mb-6 gap-2 overflow-x-auto" 
            data-ai-changelog-id="price-detail-partition-tabs"
            data-ai-changelog-title="分区报价明细"
            data-ai-changelog-desc="根据价格分区选项卡分别配置价格"
            data-ai-list="true"
          >
            {partitions.map(p => (
              <button 
                key={p.id}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activePartitionId === p.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActivePartitionId(p.id)}
              >
                {p.name || '未命名分区'}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">当前配置分区：<strong className="text-gray-900">{activePartition?.name || '未命名分区'}</strong></span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                {showStatFields && (
                  <>
                    <div className="flex items-center gap-2"
                      data-ai-changelog-id="price-detail-stat-target"
                      data-ai-changelog-title="新增统计对象选择"
                      data-ai-changelog-desc="满足产品报价且统计相关策略时展示统计对象选项"
                    >
                      <label className="text-sm text-gray-700">统计对象</label>
                      <select 
                        className="h-8 px-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        value={currentConfig.statTarget || '月度单量'}
                        onChange={(e) => updatePartitionConfig(activePartitionId, { ...currentConfig, statTarget: e.target.value })}
                        data-ai-alt="统计对象选择"
                      >
                        <option value="月度单量">月度单量</option>
                        <option value="月度金额">月度金额</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2"
                  data-ai-changelog-id="price-detail-stair-mode"
                  data-ai-changelog-title="单票阶梯模式选项"
                  data-ai-changelog-desc="每个分区可单独设置，选项包含无"
                >
                  <label className="text-sm text-gray-700">单票阶梯模式</label>
                  <select 
                    className="h-8 px-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    value={currentStairMode}
                    onChange={(e) => updatePartitionConfig(activePartitionId, { ...currentConfig, stairMode: e.target.value })}
                    data-ai-alt="单票阶梯模式选择"
                  >
                    <option value="计费重量">计费重量</option>
                    <option value="体积">体积</option>
                    <option value="无">无</option>
                  </select>
                </div>
                
                {currentStairMode !== '无' && (
                  <div className="flex items-center gap-2"
                    data-ai-changelog-id="price-detail-stair-mode-type"
                    data-ai-changelog-title="单票阶梯模式类型"
                    data-ai-changelog-desc="选择有模式时露出，枚举有全量累进和超量累进"
                  >
                    <label className="text-sm text-gray-700">单票阶梯模式</label>
                    <select 
                      className="h-8 px-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      value={currentConfig.stairModeType || '全量累进'}
                      onChange={(e) => updatePartitionConfig(activePartitionId, { ...currentConfig, stairModeType: e.target.value })}
                      data-ai-alt="单票阶梯模式类型选择"
                    >
                      <option value="全量累进">全量累进</option>
                      <option value="超量累进">超量累进</option>
                    </select>
                  </div>
                )}
                
                {currentStairMode !== '无' && (
                  <div className="flex items-center gap-2"
                    data-ai-changelog-id="price-detail-interval-type"
                    data-ai-changelog-title="区间开闭类型选择"
                    data-ai-changelog-desc="设置区间的开闭类型"
                  >
                    <label className="text-sm text-gray-700">区间开闭类型</label>
                    <select 
                      className="h-8 px-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      value={currentConfig.intervalType || '前开后闭'}
                      onChange={(e) => updatePartitionConfig(activePartitionId, { ...currentConfig, intervalType: e.target.value })}
                      data-ai-alt="区间开闭类型选择"
                    >
                      <option value="前开后闭">前开后闭</option>
                      <option value="前闭后开">前闭后开</option>
                    </select>
                  </div>
                )}

                {(currentStairMode === '计费重量' || currentStairMode === '体积') && (
                  <div className="flex items-center gap-2"
                    data-ai-changelog-id="price-detail-business-carry"
                      data-ai-changelog-title="业务进位选择"
                      data-ai-changelog-desc="单票阶梯为计费重量时可设置，包含0.5进位和四舍五入取整"
                    >
                      <label className="text-sm text-gray-700">业务进位</label>
                      <select 
                        className="h-8 px-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        value={currentConfig.businessCarry || '0.5进位'}
                        onChange={(e) => updatePartitionConfig(activePartitionId, { ...currentConfig, businessCarry: e.target.value })}
                        data-ai-alt="业务进位选择"
                      >
                        <option value="0.5进位">0.5进位</option>
                        <option value="四舍五入取整">四舍五入取整</option>
                      </select>
                  </div>
                )}
                {currentStairMode === '计费重量' && (
                  <div className="flex items-center gap-2"
                    data-ai-changelog-id="price-detail-light-throw"
                      data-ai-changelog-title="轻抛系数输入"
                      data-ai-changelog-desc="单票阶梯为计费重量时可设置轻抛系数"
                    >
                      <label className="text-sm text-gray-700">轻抛系数</label>
                      <input 
                        type="text"
                        className="w-24 h-8 px-2 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        placeholder="请输入"
                        value={currentConfig.lightThrow || ''}
                        onChange={(e) => updatePartitionConfig(activePartitionId, { ...currentConfig, lightThrow: e.target.value })}
                        data-ai-alt="轻抛系数输入"
                      />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-[#f4f6fa] text-gray-600 border-b border-gray-200">
                  <tr>
                    {isStats && <th className="px-4 py-3 font-medium min-w-[120px]">统计最小值<br/><span className="text-xs text-gray-400">(不含)</span></th>}
                    {isStats && <th className="px-4 py-3 font-medium min-w-[120px]">统计最大值<br/><span className="text-xs text-gray-400">(含)</span></th>}
                    {currentStairMode !== '无' && (
                      <>
                        <th className="px-4 py-3 font-medium min-w-[140px]">单票阶梯最小值<br/><span className="text-xs text-gray-400">(不含)</span></th>
                        <th className="px-4 py-3 font-medium min-w-[140px]">单票阶梯最大值<br/><span className="text-xs text-gray-400">(含)</span></th>
                      </>
                    )}
                    <th className="px-4 py-3 font-medium min-w-[120px]">折扣模式</th>
                    <th className="px-4 py-3 font-medium min-w-[200px]" data-ai-alt="表头-报价明细">报价明细</th>
                    <th className="px-4 py-3 font-medium w-32 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tableData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {isStats && <td className="px-4 py-3">
                        <input type="text" className="w-full h-8 px-2 border border-gray-300 rounded text-sm" defaultValue={row.statMin} />
                      </td>}
                      {isStats && <td className="px-4 py-3">
                        <input type="text" className="w-full h-8 px-2 border border-gray-300 rounded text-sm" defaultValue={row.statMax} />
                      </td>}
                      {currentStairMode !== '无' && (
                        <>
                          <td className="px-4 py-3">
                            <input type="text" className="w-full h-8 px-2 border border-gray-300 rounded text-sm" defaultValue={row.stairMin} />
                          </td>
                          <td className="px-4 py-3">
                            <input type="text" className="w-full h-8 px-2 border border-gray-300 rounded text-sm" defaultValue={row.stairMax} />
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3">
                        <select 
                          className="w-full h-8 px-2 border border-gray-300 rounded text-sm" 
                          value={row.discountMode}
                          onChange={(e) => {
                            const newRows = tableData.map(r => r.id === row.id ? { ...r, discountMode: e.target.value } : r);
                            updatePartitionConfig(activePartitionId, { ...currentConfig, rows: newRows });
                          }}
                        >
                          <option value="折扣率">折扣率</option>
                          <option value="一口价">一口价</option>
                          <option value="首续重报价">首续重报价</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {row.discountMode === '首续重报价' ? (
                          <div 
                            className="flex flex-wrap items-center gap-2" 
                            data-ai-changelog-id="price-detail-first-continue-weight"
                            data-ai-changelog-title="首续重报价明细"
                            data-ai-changelog-desc="选择首续重报价时，明细列展示首重、续重、轻抛系数等输入框"
                          >
                            <span className="text-sm text-gray-600">首重:</span>
                            <input type="text" className="w-16 h-8 px-2 border border-gray-300 rounded text-sm" defaultValue={row.firstWeight || ''} onChange={(e) => {
                              const newRows = tableData.map(r => r.id === row.id ? { ...r, firstWeight: e.target.value } : r);
                              updatePartitionConfig(activePartitionId, { ...currentConfig, rows: newRows });
                            }} />
                            <span className="text-sm text-gray-600">首重价格:</span>
                            <input type="text" className="w-16 h-8 px-2 border border-gray-300 rounded text-sm" defaultValue={row.firstWeightPrice || ''} onChange={(e) => {
                              const newRows = tableData.map(r => r.id === row.id ? { ...r, firstWeightPrice: e.target.value } : r);
                              updatePartitionConfig(activePartitionId, { ...currentConfig, rows: newRows });
                            }} />
                            <span className="text-sm text-gray-600">续重公斤:</span>
                            <input type="text" className="w-16 h-8 px-2 border border-gray-300 rounded text-sm" defaultValue={row.continueWeight || ''} onChange={(e) => {
                              const newRows = tableData.map(r => r.id === row.id ? { ...r, continueWeight: e.target.value } : r);
                              updatePartitionConfig(activePartitionId, { ...currentConfig, rows: newRows });
                            }} />
                            <span className="text-sm text-gray-600">续重价格:</span>
                            <input type="text" className="w-16 h-8 px-2 border border-gray-300 rounded text-sm" defaultValue={row.continueWeightPrice || ''} onChange={(e) => {
                              const newRows = tableData.map(r => r.id === row.id ? { ...r, continueWeightPrice: e.target.value } : r);
                              updatePartitionConfig(activePartitionId, { ...currentConfig, rows: newRows });
                            }} />
                            <span className="text-sm text-gray-600">轻抛系数:</span>
                            <input type="text" className="w-16 h-8 px-2 border border-gray-300 rounded text-sm" defaultValue={row.rowLightThrow || ''} onChange={(e) => {
                              const newRows = tableData.map(r => r.id === row.id ? { ...r, rowLightThrow: e.target.value } : r);
                              updatePartitionConfig(activePartitionId, { ...currentConfig, rows: newRows });
                            }} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-600">数值:</span>
                            <input type="text" className="flex-1 h-8 px-2 border border-gray-300 rounded text-sm" defaultValue={row.discountDetail} onChange={(e) => {
                              const newRows = tableData.map(r => r.id === row.id ? { ...r, discountDetail: e.target.value } : r);
                              updatePartitionConfig(activePartitionId, { ...currentConfig, rows: newRows });
                            }} />
                            {row.discountMode === '折扣率' && <span className="text-sm text-gray-600">%</span>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {index === tableData.length - 1 && (
                          <div className="flex items-center justify-center gap-3">
                            <button 
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              onClick={() => {
                                const newRows = [...tableData, { id: Date.now(), statMin: '', statMax: '', stairMin: '', stairMax: '', discountMode: '折扣率', discountDetail: '' }];
                                updatePartitionConfig(activePartitionId, { ...currentConfig, rows: newRows });
                              }}
                            >
                              添加
                            </button>
                            {tableData.length > 1 && (
                              <button 
                                className="text-red-500 hover:text-red-700 text-sm"
                                onClick={() => {
                                  const newRows = tableData.filter(r => r.id !== row.id);
                                  updatePartitionConfig(activePartitionId, { ...currentConfig, rows: newRows });
                                }}
                              >
                                删除
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-8 flex justify-between border-t pt-6">
            <button className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors" data-action="go-pricePartitionPage" onClick={() => navigate('pricePartitionPage')}>上一步</button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors" data-action="go-extensionRulesPage" onClick={() => navigate('extensionRulesPage')}>下一步，报价拓展规则配置</button>
          </div>
        </div>
      </div>

      {isImportModalOpen && (
        <PriceDetailImportModalFrame onMaskClick={() => setIsImportModalOpen(false)}>
          <PriceDetailImportContent onClose={() => setIsImportModalOpen(false)} />
        </PriceDetailImportModalFrame>
      )}
    </Layout>
  );
};

export default PriceDetailPage;
