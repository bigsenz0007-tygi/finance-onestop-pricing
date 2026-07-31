import React, { useState } from 'react';
import Layout from '../components/Layout';
import QuotationSteps from '../components/QuotationSteps';
import AddressEditorModal from '../components/AddressEditorModal';
import PartitionImportModalFrame from '../components/PartitionImportModalFrame';
import PartitionImportContent from '../components/PartitionImportContent';

const PricePartitionPage = ({ navigate, quotationConfig, setQuotationConfig }) => {
  const [selectedDims, setSelectedDims] = useState([]);
  const [partitions, setPartitions] = useState([
    { id: Date.now(), name: '', applyNo: '', contractCode: '', fromCity: '', toCity: '', statGroup: '', feeItem: '', orderType: '', deliveryType: '', direction: '', statBillingObject: '' }
  ]);
  const [addressModalConfig, setAddressModalConfig] = useState({ isOpen: false, field: '', partitionId: null, initialValue: '' });

  const handleDimChange = (dim) => {
    setSelectedDims(prev => 
      prev.includes(dim) ? prev.filter(d => d !== dim) : [...prev, dim]
    );
  };

  const isStat = (quotationConfig?.baseInfo?.quotationMethod === '产品报价' || quotationConfig?.baseInfo?.quotationMethod === '场景报价') && (quotationConfig?.baseInfo?.billingStrategy === '统计考核' || quotationConfig?.baseInfo?.billingStrategy === '统计+合单');

  const handleAddPartition = () => {
    setPartitions([...partitions, { id: Date.now(), name: '', applyNo: '', contractCode: '', fromCity: '', toCity: '', statGroup: '', feeItem: '', orderType: '', deliveryType: '', direction: '', statBillingObject: '' }]);
  };

  const handleRemovePartition = (id) => {
    if (partitions.length > 1) {
      setPartitions(partitions.filter(p => p.id !== id));
    }
  };

  const updatePartition = (id, field, value) => {
    setPartitions(partitions.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleOpenAddressEditor = (partitionId, field, initialValue) => {
    setAddressModalConfig({ isOpen: true, field, partitionId, initialValue });
  };

  const handleAddressConfirm = (address) => {
    updatePartition(addressModalConfig.partitionId, addressModalConfig.field, address);
  };

  const [importOpen, setImportOpen] = useState(false);
  const handleImportedPartitions = (list) => {
    if (!Array.isArray(list) || list.length === 0) { setImportOpen(false); return; }
    setPartitions(prev => [...prev, ...list]);
    setImportOpen(false);
  };

  const handleNext = () => {
    if (setQuotationConfig) {
      setQuotationConfig({
        ...quotationConfig,
        partitionConfig: { partitions }
      });
    }
    navigate('priceDetailPage');
  };

  return (
    <Layout currentPage="pricePartitionPage" title="一站式报价配置" showBack={true} onBack={() => navigate('index')}>
      <div className="max-w-[1440px] mx-auto">
        <QuotationSteps currentStep={2} onStepClick={navigate} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 min-h-[400px]" data-ai-alt="价格分区配置">
          <div className="flex items-center justify-between mb-6 border-b pb-3">
            <h3 className="text-lg font-bold text-gray-800">价格分区配置</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">可选报价维度</label>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2"><input type="checkbox" checked={selectedDims.includes('费用项')} onChange={() => handleDimChange('费用项')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> 费用项</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={selectedDims.includes('商家订单类型')} onChange={() => handleDimChange('商家订单类型')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> 商家订单类型</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={selectedDims.includes('配送类型')} onChange={() => handleDimChange('配送类型')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> 配送类型</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={selectedDims.includes('正逆向')} onChange={() => handleDimChange('正逆向')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> 正逆向</label>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <h4 className="text-base font-bold text-gray-800">分区列表</h4>
            <div className="flex items-center gap-[12px]">
              <button 
                className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 text-sm font-medium transition-colors"
                onClick={handleAddPartition}
              >
                + 添加分区
              </button>
              <button
                className="px-4 py-1.5 bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
                data-ai-alt="区分导入按钮" data-ai-changelog-id="partition-import" data-ai-changelog-title="新增区分导入" data-ai-changelog-desc="在添加分区右侧新增区分导入入口"
                onClick={() => setImportOpen(true)}
              >
                区分导入
              </button>
            </div>
          </div>
          <div className="space-y-4" data-ai-changelog-id="price-partition-multi" data-ai-changelog-title="支持多个价格分区" data-ai-changelog-desc="可添加和配置多个价格分区" data-ai-list="true">
            {partitions.map((partition, index) => (
              <div key={partition.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative" data-ai-alt="分区项">
                {partitions.length > 1 && (
                  <button 
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                    onClick={() => handleRemovePartition(partition.id)}
                    title="删除分区"
                  >
                    ✕
                  </button>
                )}
                <div className="grid grid-cols-3 gap-4 mr-8">
                  {isStat && (
                    <div className="flex flex-col gap-2" data-ai-changelog-id="stat-group-no-field" data-ai-changelog-title="统计分组号字段" data-ai-changelog-desc="按条件显示在分区名称前的统计分组号">
                      <label className="text-sm font-medium text-gray-700">统计分组号</label>
                      <input 
                        type="text" 
                        className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white" 
                        placeholder="请输入统计分组号"
                        value={partition.statGroup}
                        onChange={(e) => updatePartition(partition.id, 'statGroup', e.target.value)}
                      />
                    </div>
                  )}
                  {isStat && (
                    <div className="flex flex-col gap-2" data-ai-changelog-id="stat-billing-object" data-ai-changelog-title="计费和统计对象" data-ai-changelog-desc="当计费策略为统计+合单或统计考核时，在分区列表中新增计费和统计对象字段">
                      <label className="text-sm font-medium text-gray-700">计费和统计对象</label>
                      <select 
                        className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={partition.statBillingObject}
                        onChange={(e) => updatePartition(partition.id, 'statBillingObject', e.target.value)}
                      >
                        <option value="">请选择</option>
                        <option value="statAndBilling">统计+计费</option>
                        <option value="statOnly">统计</option>
                        <option value="billingOnly">计费</option>
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">价格分区名称 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white" 
                      placeholder="如：华东一区"
                      value={partition.name}
                      onChange={(e) => updatePartition(partition.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">报价申请单号 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white" 
                      placeholder="请输入单号"
                      value={partition.applyNo}
                      onChange={(e) => updatePartition(partition.id, 'applyNo', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">合同编码 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white" 
                      placeholder="请输入合同编码"
                      value={partition.contractCode}
                      onChange={(e) => updatePartition(partition.id, 'contractCode', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2" data-ai-changelog-id="price-partition-address-editor" data-ai-changelog-title="地址编辑器选择" data-ai-changelog-desc="始发地和目的地通过地址编辑器弹窗选择">
                    <label className="text-sm font-medium text-gray-700">始发地</label>
                    <input 
                      type="text" 
                      className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-gray-50 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap" 
                      placeholder="请点击选择始发地"
                      value={partition.fromCity}
                      readOnly
                      onClick={() => handleOpenAddressEditor(partition.id, 'fromCity', partition.fromCity)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">目的地</label>
                    <input 
                      type="text" 
                      className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-gray-50 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap" 
                      placeholder="请点击选择目的地"
                      value={partition.toCity}
                      readOnly
                      onClick={() => handleOpenAddressEditor(partition.id, 'toCity', partition.toCity)}
                    />
                  </div>

                  {selectedDims.includes('费用项') && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">费用项</label>
                      <select 
                        className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={partition.feeItem}
                        onChange={(e) => updatePartition(partition.id, 'feeItem', e.target.value)}
                      >
                        <option value="">请选择</option>
                        <option value="freight">运费</option>
                        <option value="valueAdded">增值费</option>
                      </select>
                    </div>
                  )}
                  {selectedDims.includes('商家订单类型') && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">商家订单类型</label>
                      <select 
                        className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={partition.orderType}
                        onChange={(e) => updatePartition(partition.id, 'orderType', e.target.value)}
                      >
                        <option value="">请选择</option>
                        <option value="normal">普通订单</option>
                        <option value="special">特殊订单</option>
                      </select>
                    </div>
                  )}
                  {selectedDims.includes('配送类型') && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">配送类型</label>
                      <select 
                        className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={partition.deliveryType}
                        onChange={(e) => updatePartition(partition.id, 'deliveryType', e.target.value)}
                      >
                        <option value="">请选择</option>
                        <option value="express">快递</option>
                        <option value="freight">快运</option>
                      </select>
                    </div>
                  )}
                  {selectedDims.includes('正逆向') && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">正逆向</label>
                      <select 
                        className="h-10 px-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={partition.direction}
                        onChange={(e) => updatePartition(partition.id, 'direction', e.target.value)}
                      >
                        <option value="">请选择</option>
                        <option value="forward">正向</option>
                        <option value="reverse">逆向</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between border-t pt-6">
            <button className="px-6 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors" data-action="go-baseInfoPage" onClick={() => navigate('baseInfoPage')}>上一步</button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors" data-action="go-priceDetailPage" onClick={handleNext}>下一步，报价明细配置</button>
          </div>
        </div>
      </div>
      <AddressEditorModal 
        isOpen={addressModalConfig.isOpen}
        onClose={() => setAddressModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleAddressConfirm}
        initialValue={addressModalConfig.initialValue}
      />

      {importOpen && (
        <>
          <PartitionImportModalFrame onMaskClick={() => setImportOpen(false)}>
            <PartitionImportContent onClose={() => setImportOpen(false)} onImported={handleImportedPartitions} />
          </PartitionImportModalFrame>
        </>
      )}
    </Layout>
  );
};

export default PricePartitionPage;
