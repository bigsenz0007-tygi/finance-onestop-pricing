import React, { useState } from 'react';
import { TABLE_DATA } from '../mockData.js';
import DrawerFrame from '../components/DrawerFrame.jsx';
import DetailFormContent from '../components/DetailFormContent.jsx';
import ModalFrame from '../components/ModalFrame.jsx';
import LogContent from '../components/LogContent.jsx';

function IndexPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('view');

  const handleOpenDrawer = (mode) => {
    setDrawerMode(mode);
    setIsDrawerOpen(true);
  };

  return (
    <div className="p-6 w-full h-full flex flex-col gap-4" data-ai-alt="列表页面容器" data-ai-changelog-id="page-index" data-ai-changelog-title="单据计费要素管理页面整体需求" data-ai-changelog-desc="用于管理单据计费要素，提供查询、列表展示和相关操作。">
      {/* 查询条件区域 */}
      <div className="bg-white rounded-lg p-6 shadow-sm flex flex-col gap-4" data-ai-alt="查询区" data-ai-changelog-id="func-search" data-ai-changelog-title="查询条件配置" data-ai-changelog-desc="包含来源系统、单据类型、交易类型、状态、业务条线、收付方向等筛选。">
        <div className="grid grid-cols-3 gap-6">
          <div className="flex items-center gap-2" data-ai-alt="搜索项-来源系统">
            <label className="w-24 text-right text-sm text-gray-600">来源系统：</label>
            <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500">
              <option>全部</option>
              <option>仓储系统</option>
              <option>配送系统</option>
            </select>
          </div>
          <div className="flex items-center gap-2" data-ai-alt="搜索项-单据类型">
            <label className="w-24 text-right text-sm text-gray-600">单据类型：</label>
            <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500">
              <option>全部</option>
              <option>入库单</option>
              <option>派车单</option>
            </select>
          </div>
          <div className="flex items-center gap-2" data-ai-alt="搜索项-交易类型">
            <label className="w-24 text-right text-sm text-gray-600">交易类型：</label>
            <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500">
              <option>全部</option>
              <option>正常交易</option>
              <option>客退交易</option>
            </select>
          </div>
          <div className="flex items-center gap-2" data-ai-alt="搜索项-状态">
            <label className="w-24 text-right text-sm text-gray-600">状态：</label>
            <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500">
              <option>全部</option>
              <option>已启用</option>
              <option>已停用</option>
            </select>
          </div>
          <div className="flex items-center gap-2" data-ai-alt="搜索项-业务条线">
            <label className="w-24 text-right text-sm text-gray-600">业务条线：</label>
            <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500">
              <option>全部</option>
              <option>冷链物流</option>
              <option>大件物流</option>
            </select>
          </div>
          <div className="flex items-center gap-2" data-ai-alt="搜索项-收付方向">
            <label className="w-24 text-right text-sm text-gray-600">收付方向：</label>
            <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500">
              <option>全部</option>
              <option>应收</option>
              <option>应付</option>
            </select>
          </div>
          <div className="flex items-center gap-2" data-ai-alt="搜索项-是否按商家接入">
            <label className="w-24 text-right text-sm text-gray-600">按商家接入：</label>
            <select className="flex-1 border rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500">
              <option>全部</option>
              <option>是</option>
              <option>否</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-2" data-ai-alt="搜索操作区">
          <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors" data-ai-alt="重置按钮">重置</button>
          <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors" data-ai-alt="查询按钮">查询</button>
        </div>
      </div>

      {/* 表格区域 */}
      <div className="bg-white rounded-lg p-6 shadow-sm flex-1 flex flex-col" data-ai-alt="列表区" data-ai-changelog-id="func-table" data-ai-changelog-title="单据计费列表" data-ai-changelog-desc="展示单据唯一ID及多项业务属性和操作项。">
        <div className="flex justify-between items-center mb-4" data-ai-alt="表格工具栏">
          <h3 className="text-base font-medium" data-ai-alt="列表标题">计费要素管理列表</h3>
          <button 
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors" 
            onClick={() => handleOpenDrawer('create')}
            data-action="go-detailDrawer"
            data-module="createBtn"
            data-ai-alt="新建按钮"
          >
            新建
          </button>
        </div>
        <div className="flex-1 overflow-x-auto" data-ai-alt="表格容器">
          <table className="w-full text-sm text-left border-collapse" data-ai-alt="数据表格" data-knowledge-citationId="kg://1968161163836211202/2065393163708956673/2065393178996985857/2#1781263088219648_ecd3c57279ab44e7_202606121928_23">
            <thead className="bg-gray-50 border-y" data-ai-alt="表头">
              <tr>
                <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-来源系统">来源系统</th>
                <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-单据类型">单据类型</th>
                <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-交易类型">交易类型</th>
                <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-收付方向">收付方向</th>
                <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-计费状态">计费状态</th>
                <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-业务条线">业务条线</th>
                <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-按商家接入">按商家接入</th>
                <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-状态">状态</th>
                <th className="py-3 px-4 font-medium text-gray-700" data-ai-alt="表头-操作">操作</th>
              </tr>
            </thead>
            <tbody data-ai-list="true" data-ai-alt="表格主体">
              {TABLE_DATA.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-blue-50/50 transition-colors" data-ai-alt={`数据行-${idx}`}>
                  <td className="py-3 px-4" data-ai-alt="单元格-来源系统">{row.sourceSystem}</td>
                  <td className="py-3 px-4" data-ai-alt="单元格-单据类型">{row.docType}</td>
                  <td className="py-3 px-4" data-ai-alt="单元格-交易类型">{row.tradeType}</td>
                  <td className="py-3 px-4" data-ai-alt="单元格-收付方向">{row.direction}</td>
                  <td className="py-3 px-4" data-ai-alt="单元格-计费状态">{row.billingNode}</td>
                  <td className="py-3 px-4" data-ai-alt="单元格-业务条线">{row.bizLine}</td>
                  <td className="py-3 px-4" data-ai-alt="单元格-按商家接入">{row.isMerchantAccess}</td>
                  <td className="py-3 px-4" data-ai-alt="单元格-状态">
                    <span className={`px-2 py-0.5 rounded text-xs ${row.status === '已启用' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} data-ai-alt="状态标签">
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4" data-ai-alt="单元格-操作">
                    <div className="flex items-center gap-3 text-blue-600" data-ai-alt="操作按钮组">
                      <button className="hover:text-blue-800" onClick={() => handleOpenDrawer('view')} data-action="go-detailDrawer" data-ai-alt="查看按钮">查看</button>
                      <button className="hover:text-blue-800" onClick={() => handleOpenDrawer('edit')} data-action="go-detailDrawer" data-ai-alt="编辑按钮">编辑</button>
                      <button className="hover:text-blue-800" data-ai-alt="启停按钮">{row.status === '已启用' ? '停用' : '启用'}</button>
                      <button className="hover:text-blue-800" onClick={() => setIsLogOpen(true)} data-action="go-logModal" data-ai-alt="日志按钮">日志</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 详情抽屉 */} 
      {isDrawerOpen && (
        <DrawerFrame onClose={() => setIsDrawerOpen(false)} title={drawerMode === 'create' ? '新建单据计费要素' : drawerMode === 'edit' ? '编辑单据计费要素' : '查看单据计费要素'}>
          <DetailFormContent mode={drawerMode} />
        </DrawerFrame>
      )}

      {/* 日志弹窗 */}
      {isLogOpen && (
        <ModalFrame onClose={() => setIsLogOpen(false)} title="操作日志">
          <LogContent />
        </ModalFrame>
      )}
    </div>
  );
}

export default IndexPage;