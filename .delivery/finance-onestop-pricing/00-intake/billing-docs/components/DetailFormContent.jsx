import React, { useState } from 'react';
import { ELEMENTS_MOCK } from '../mockData.js';

function DetailFormContent({ mode }) {
  const isView = mode === 'view';
  const [isMerchantAccess, setIsMerchantAccess] = useState('是');
  const [elements, setElements] = useState(ELEMENTS_MOCK);
  const [searchElementQuery, setSearchElementQuery] = useState('');

  const filteredElements = elements.filter(el => el.name.includes(searchElementQuery));

  const handleAddElement = () => {
    setElements([...elements, { name: '', code: '', dataDimension: '整单', dimension: false, factor: false, condition: false }]);
  };

  const handleDeleteElement = (index) => {
    const newElements = [...elements];
    newElements.splice(index, 1);
    setElements(newElements);
  };

  const handleElementChange = (index, field, value) => {
    const newElements = [...elements];
    newElements[index][field] = value;
    setElements(newElements);
  };

  return (
    <div className="flex flex-col gap-8" data-ai-alt="详情表单容器" data-ai-changelog-id="func-detail-form" data-ai-changelog-title="基础信息与计费要素表单" data-ai-changelog-desc="分为基础信息配置，和要素维度的定价、因子、条件定义。">
      {/* 基础信息 */}
      <div data-ai-alt="基础信息区块">
        <h3 className="text-base font-medium mb-4 pl-3 border-l-4 border-blue-600" data-ai-alt="基础信息标题">基础信息</h3>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
          <div className="flex items-center gap-2" data-ai-alt="表单项-来源系统">
            <label className="w-24 text-right text-sm text-gray-600 shrink-0">来源系统：</label>
            <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50" disabled={isView} defaultValue="仓储系统">
              <option>仓储系统</option>
              <option>配送系统</option>
            </select>
          </div>
          <div className="flex items-center gap-2" data-ai-alt="表单项-单据类型">
            <label className="w-24 text-right text-sm text-gray-600 shrink-0">单据类型：</label>
            <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50" disabled={isView} defaultValue="入库单">
              <option>入库单</option>
              <option>派车单</option>
            </select>
          </div>
          <div className="flex items-center gap-2" data-ai-alt="表单项-交易类型">
            <label className="w-24 text-right text-sm text-gray-600 shrink-0">交易类型：</label>
            <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50" disabled={isView} defaultValue="正常交易">
              <option>正常交易</option>
              <option>客退交易</option>
            </select>
          </div>
          <div className="flex items-center gap-2" data-ai-alt="表单项-计费状态">
            <label className="w-24 text-right text-sm text-gray-600 shrink-0">计费状态：</label>
            <div className="flex items-center gap-4 flex-1">
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" disabled={isView} defaultChecked /> 揽收</label>
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" disabled={isView} /> 妥投</label>
            </div>
          </div>
          <div className="flex items-center gap-2" data-ai-alt="表单项-是否按商家接入">
            <label className="w-24 text-right text-sm text-gray-600 shrink-0">是否按商家接入：</label>
            <select 
              className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-50" 
              disabled={isView} 
              value={isMerchantAccess}
              onChange={(e) => setIsMerchantAccess(e.target.value)}
            >
              <option value="是">是</option>
              <option value="否">否</option>
            </select>
          </div>

        </div>
      </div>

      {/* 计费要素 */}
      <div data-ai-alt="计费要素区块">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium pl-3 border-l-4 border-blue-600" data-ai-alt="计费要素标题">计费要素配置</h3>
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="查询业务要素..."
              className="border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 w-64"
              value={searchElementQuery}
              onChange={(e) => setSearchElementQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="border rounded overflow-hidden flex flex-col" data-ai-alt="要素配置整体容器">
          <div className="max-h-[240px] overflow-y-auto" data-ai-alt="要素配置表格滚动区">
            <table className="w-full text-sm text-left" data-ai-alt="要素配置表格">
            <thead className="sticky top-0 z-10 bg-gray-50 border-b shadow-[0_1px_0_0_#e5e7eb]" data-ai-alt="表头">
              <tr>
                <th className="py-2 px-4 font-medium text-gray-700" data-ai-alt="表头-业务要素">业务要素</th>
                <th className="py-2 px-4 font-medium text-gray-700" data-ai-alt="表头-业务要素编码">业务要素编码</th>
                <th className="py-2 px-4 font-medium text-gray-700" data-ai-alt="表头-数据维度">数据维度</th>
                <th className="py-2 px-4 font-medium text-gray-700 text-center" data-ai-alt="表头-定价维度">定价维度</th>
                <th className="py-2 px-4 font-medium text-gray-700 text-center" data-ai-alt="表头-计费因子">计费因子</th>
                <th className="py-2 px-4 font-medium text-gray-700 text-center" data-ai-alt="表头-计费条件">计费条件</th>
                {!isView && <th className="py-2 px-4 font-medium text-gray-700 text-center" data-ai-alt="表头-操作">操作</th>}
              </tr>
            </thead>
            <tbody data-ai-list="true" data-ai-alt="表格主体">
              {filteredElements.map((el, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-gray-50" data-ai-alt={`要素行-${idx}`}>
                  <td className="py-2 px-4" data-ai-alt="单元格-业务要素名称">
                    {isView ? el.name : <input className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-blue-500" value={el.name} onChange={(e) => handleElementChange(idx, 'name', e.target.value)} placeholder="请输入" />}
                  </td>
                  <td className="py-2 px-4" data-ai-alt="单元格-业务要素编码">
                    {isView ? <span className="text-gray-600">{el.code}</span> : <input className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-blue-500" value={el.code} onChange={(e) => handleElementChange(idx, 'code', e.target.value)} placeholder="请输入" />}
                  </td>
                  <td className="py-2 px-4" data-ai-alt="单元格-数据维度">
                    {isView ? <span className="text-gray-600">{el.dataDimension}</span> : (
                      <select className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-blue-500" value={el.dataDimension} onChange={(e) => handleElementChange(idx, 'dataDimension', e.target.value)}>
                        <option>整单</option>
                        <option>包裹</option>
                      </select>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center" data-ai-alt="单元格-定价维度选择">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" checked={el.dimension} onChange={(e) => handleElementChange(idx, 'dimension', e.target.checked)} disabled={isView} />
                  </td>
                  <td className="py-2 px-4 text-center" data-ai-alt="单元格-计费因子选择">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" checked={el.factor} onChange={(e) => handleElementChange(idx, 'factor', e.target.checked)} disabled={isView} />
                  </td>
                  <td className="py-2 px-4 text-center" data-ai-alt="单元格-计费条件选择">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300" checked={el.condition} onChange={(e) => handleElementChange(idx, 'condition', e.target.checked)} disabled={isView} />
                  </td>
                  {!isView && (
                    <td className="py-2 px-4 text-center" data-ai-alt="单元格-操作">
                      <button className="text-red-600 hover:text-red-800 text-sm" onClick={() => handleDeleteElement(idx)}>删除</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {!isView && (
            <div className="p-3 border-t bg-gray-50" data-ai-alt="添加要素操作区">
              <button 
                className="flex items-center justify-center w-full py-2 border border-dashed border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors text-sm"
                onClick={handleAddElement}
              >
                + 添加计费要素
              </button>
            </div>
          )}
          <div className="p-3 border-t bg-white flex items-center justify-between text-sm text-gray-500" data-ai-alt="分页容器">
            <div>共 {filteredElements.length} 条记录</div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>上一页</button>
              <span className="px-2">1 / 1</span>
              <button className="px-2 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>下一页</button>
              <select className="border rounded px-1 py-1 outline-none">
                <option>10 条/页</option>
                <option>20 条/页</option>
                <option>50 条/页</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailFormContent;