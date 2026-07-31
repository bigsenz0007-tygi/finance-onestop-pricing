import React, { useState } from 'react';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState({ keyword: '', billingType: '', direction: '', status: '' });
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    billingTarget: '整单',
    direction: '',
    billingType: '',
    remark: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full min-h-[1024px] bg-[#f5f5f5] p-[24px] flex flex-col gap-[16px]" data-page-key="index">
      {/* 查询区 */}
      <div className="bg-white p-[24px] rounded-[8px] flex items-center gap-[24px]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px] text-[#333]">业务场景</span>
          <input type="text" placeholder="业务场景编码或名称" className="h-[32px] px-[12px] border border-[#d9d9d9] rounded-[4px] text-[14px] w-[200px] focus:border-[#2b68ff] focus:outline-none" value={searchParams.keyword} onChange={e => setSearchParams({...searchParams, keyword: e.target.value})} />
        </div>
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px] text-[#333]">定价方式</span>
          <select className="h-[32px] px-[12px] border border-[#d9d9d9] rounded-[4px] text-[14px] w-[160px] focus:border-[#2b68ff] focus:outline-none bg-white" value={searchParams.billingType} onChange={e => setSearchParams({...searchParams, billingType: e.target.value})}>
            <option value="">全部</option><option value="产品定价">产品定价</option><option value="业务场景定价">业务场景定价</option>
          </select>
        </div>
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px] text-[#333]">收付方向</span>
          <select className="h-[32px] px-[12px] border border-[#d9d9d9] rounded-[4px] text-[14px] w-[160px] focus:border-[#2b68ff] focus:outline-none bg-white" value={searchParams.direction} onChange={e => setSearchParams({...searchParams, direction: e.target.value})}>
            <option value="">全部</option><option value="应收">应收</option><option value="应付">应付</option>
          </select>
        </div>
        <div className="flex items-center gap-[8px]">
          <span className="text-[14px] text-[#333]">状态</span>
          <select className="h-[32px] px-[12px] border border-[#d9d9d9] rounded-[4px] text-[14px] w-[160px] focus:border-[#2b68ff] focus:outline-none bg-white" value={searchParams.status} onChange={e => setSearchParams({...searchParams, status: e.target.value})}>
            <option value="">全部</option><option value="初始化">初始化</option><option value="启用">启用</option><option value="停用">停用</option>
          </select>
        </div>
        <div className="flex-1 flex justify-end">
          <button className="h-[32px] px-[16px] bg-[#2b68ff] text-white rounded-[4px] text-[14px] hover:bg-[#1a55e6]">查询</button>
        </div>
      </div>

      {/* 列表区 */}
      <div className="bg-white p-[24px] rounded-[8px] flex-1">
        <div className="mb-[16px]">
          <button className="h-[32px] px-[16px] bg-[#2b68ff] text-white rounded-[4px] text-[14px] hover:bg-[#1a55e6]" onClick={() => {
            setIsEdit(false);
            setFormData({ code: '', name: '', billingTarget: '整单', direction: '', billingType: '', remark: '' });
            setIsModalOpen(true);
          }}>新建</button>
        </div>
        <table className="w-full border-collapse text-[14px]">
          <thead className="bg-[#fafafa]">
            <tr>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">序号</th>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">业务场景编码</th>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">业务场景名称</th>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">计费对象</th>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">定价方式</th>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">收付方向</th>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">状态</th>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">创建人</th>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">创建时间</th>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">备注</th>
              <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">1</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">GPZZFW</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">共配增值服务</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">整单</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">产品定价</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">应收</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">启用</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">张三</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">2023-10-01 12:00:00</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">-</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0]">
                <button className="text-[#bfbfbf] cursor-not-allowed mr-[16px]" disabled title="仅停用状态可修改">修改</button>
                <button className="text-[#2b68ff]" onClick={() => setIsLogModalOpen(true)}>日志</button>
              </td>
            </tr>
            <tr>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">2</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">LL_BCTGCK</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">冷链B仓退供出库</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">明细</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">业务场景定价</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">应付</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">停用</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">李四</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">2023-10-02 14:30:00</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">-</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0]">
                <button className="text-[#2b68ff] mr-[16px]" onClick={() => {
                  setIsEdit(true);
                  setFormData({ code: 'LL_BCTGCK', name: '冷链B仓退供出库', billingTarget: '明细', direction: '应付', billingType: '业务场景定价', remark: '' });
                  setIsModalOpen(true);
                }}>修改</button>
                <button className="text-[#2b68ff]" onClick={() => setIsLogModalOpen(true)}>日志</button>
              </td>
            </tr>
            <tr>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">3</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">TEST_DIS</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">测试停用数据</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">整单</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">产品定价</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">应付</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">停用</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">王五</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">2023-10-03 09:15:00</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">-</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0]">
                <button className="text-[#2b68ff] mr-[16px]" onClick={() => {
                  setIsEdit(true);
                  setFormData({ code: 'TEST_DIS', name: '测试停用数据', billingTarget: '整单', direction: '应付', billingType: '产品定价', remark: '' });
                  setIsModalOpen(true);
                }}>修改</button>
                <button className="text-[#2b68ff]" onClick={() => setIsLogModalOpen(true)}>日志</button>
              </td>
            </tr>
            <tr>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">4</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">INIT_TEST</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">测试初始化数据</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">明细</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">产品定价</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">应收</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">初始化</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">赵六</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">2023-10-04 16:45:00</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">-</td>
              <td className="p-[12px_16px] border-b border-[#f0f0f0]">
                <button className="text-[#2b68ff] mr-[16px]">启用</button>
                <button className="text-[#2b68ff] mr-[16px]" onClick={() => {
                  setIsEdit(true);
                  setFormData({ code: 'INIT_TEST', name: '测试初始化数据', billingTarget: '明细', direction: '应收', billingType: '产品定价', remark: '' });
                  setIsModalOpen(true);
                }}>修改</button>
                <button className="text-[#2b68ff] mr-[16px]">删除</button>
                <button className="text-[#2b68ff]" onClick={() => setIsLogModalOpen(true)}>日志</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 弹窗区 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-50 flex items-center justify-center">
          <div className="w-[900px] bg-white rounded-[8px] shadow-sm overflow-hidden flex flex-col" data-ai-alt="弹窗容器">
        {/* Header */}
        <div className="h-[56px] border-b border-[#f0f0f0] flex items-center justify-between px-[24px]" data-ai-alt="弹窗头部">
          <div className="flex-1 text-center text-[16px] text-[#333] font-medium" data-ai-alt="弹窗标题">
            业务场景档案-编辑
          </div>
          <button className="text-[#999] hover:text-[#333] cursor-pointer" data-ai-alt="关闭按钮" onClick={() => setIsModalOpen(false)}>
            <i className="fas fa-times text-[16px] w-[16px] h-[16px] flex items-center justify-center" data-ai-alt="关闭图标"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-[40px_24px_60px]" data-ai-alt="表单内容区">
          <div className="grid grid-cols-2 gap-x-[40px] gap-y-[24px] max-w-[800px] mx-auto" data-ai-alt="表单网格">
            {/* Row 1 */}
            <div className="flex items-center" data-ai-alt="编码表单项">
              <label className="w-[100px] text-right text-[14px] text-[#333] mr-[16px]" data-ai-alt="编码标签">
                <span className="text-[#ff4d4f] mr-[4px]" data-ai-alt="必填星号">*</span>
                业务场景编码
              </label>
              <input 
                type="text" 
                className={`flex-1 h-[32px] px-[12px] border border-[#d9d9d9] rounded-[4px] text-[14px] focus:border-[#2b68ff] focus:outline-none transition-colors ${isEdit ? 'bg-[#f5f5f5] text-[#999] cursor-not-allowed' : ''}`}
                value={formData.code}
                onChange={e => handleChange('code', e.target.value)}
                disabled={isEdit}
                data-ai-alt="编码输入框"
              />
            </div>
            <div className="flex items-center" data-ai-alt="名称表单项">
              <label className="w-[100px] text-right text-[14px] text-[#333] mr-[16px]" data-ai-alt="名称标签">
                <span className="text-[#ff4d4f] mr-[4px]" data-ai-alt="必填星号">*</span>
                业务场景名称
              </label>
              <input 
                type="text" 
                className="flex-1 h-[32px] px-[12px] border border-[#d9d9d9] rounded-[4px] text-[14px] focus:border-[#2b68ff] focus:outline-none transition-colors"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                data-ai-alt="名称输入框"
              />
            </div>

            {/* Row 2 */}
            <div className="flex items-center" data-ai-alt="计费对象表单项">
              <label className="w-[100px] text-right text-[14px] text-[#333] mr-[16px]" data-ai-alt="计费标签">
                <span className="text-[#ff4d4f] mr-[4px]" data-ai-alt="必填星号">*</span>
                计费对象
              </label>
              <div className="flex-1 relative" data-ai-alt="计费下拉容器">
                <select 
                  className="w-full h-[32px] pl-[12px] pr-[30px] border border-[#d9d9d9] rounded-[4px] text-[14px] appearance-none focus:border-[#2b68ff] focus:outline-none bg-white cursor-pointer"
                  value={formData.billingTarget}
                  onChange={e => handleChange('billingTarget', e.target.value)}
                  data-ai-alt="计费下拉框"
                >
                  <option value="整单" data-ai-alt="整单选项">整单</option>
                  <option value="明细" data-ai-alt="明细选项">明细</option>
                </select>
                <i className="fas fa-chevron-down absolute right-[10px] top-[10px] text-[#bfbfbf] text-[12px] pointer-events-none w-[12px] h-[12px] flex items-center justify-center" data-ai-alt="下拉图标"></i>
              </div>
            </div>
            <div className="flex items-center" data-ai-alt="收付方向表单项">
              <label className="w-[100px] text-right text-[14px] text-[#333] mr-[16px]" data-ai-alt="收付方向标签">
                <span className="text-[#ff4d4f] mr-[4px]" data-ai-alt="必填星号">*</span>
                收付方向
              </label>
              <div className="flex-1 relative" data-ai-alt="收付方向容器">
                <select 
                  className="w-full h-[32px] pl-[12px] pr-[30px] border border-[#d9d9d9] rounded-[4px] text-[14px] appearance-none focus:border-[#2b68ff] focus:outline-none bg-white cursor-pointer"
                  value={formData.direction}
                  onChange={e => handleChange('direction', e.target.value)}
                  data-ai-alt="收付方向下拉框"
                  data-ai-changelog-id="index-field-direction"
                  data-ai-changelog-title="新增收付方向字段"
                  data-ai-changelog-desc="在表单中新增收付方向的选择，为必填项"
                >
                  <option value="" data-ai-alt="空选项">请选择</option>
                  <option value="应收" data-ai-alt="应收选项">应收</option>
                  <option value="应付" data-ai-alt="应付选项">应付</option>
                </select>
                <i className="fas fa-chevron-down absolute right-[10px] top-[10px] text-[#bfbfbf] text-[12px] pointer-events-none w-[12px] h-[12px] flex items-center justify-center" data-ai-alt="下拉图标"></i>
              </div>
            </div>

            {/* Row 3 */}
            <div className="flex items-center" data-ai-alt="定价方式表单项">
              <label className="w-[100px] text-right text-[14px] text-[#333] mr-[16px]" data-ai-alt="定价方式标签">
                <span className="text-[#ff4d4f] mr-[4px]" data-ai-alt="必填星号">*</span>
                定价方式
              </label>
              <div className="flex-1 relative" data-ai-alt="定价方式下拉容器">
                <select 
                  className="w-full h-[32px] pl-[12px] pr-[30px] border border-[#d9d9d9] rounded-[4px] text-[14px] appearance-none focus:border-[#2b68ff] focus:outline-none bg-white cursor-pointer"
                  value={formData.billingType}
                  onChange={e => handleChange('billingType', e.target.value)}
                  data-ai-alt="定价方式下拉框"
                  data-ai-changelog-id="index-field-pricing"
                  data-ai-changelog-title="调整为定价方式字段"
                  data-ai-changelog-desc="在表单中新增定价方式的枚举选择，为必填项"
                >
                  <option value="" data-ai-alt="空选项">请选择</option>
                  <option value="产品定价" data-ai-alt="产品定价选项">产品定价</option>
                  <option value="业务场景定价" data-ai-alt="业务场景定价选项">业务场景定价</option>
                </select>
                <i className="fas fa-chevron-down absolute right-[10px] top-[10px] text-[#bfbfbf] text-[12px] pointer-events-none w-[12px] h-[12px] flex items-center justify-center" data-ai-alt="下拉图标"></i>
              </div>
            </div>
            <div className="flex items-start" data-ai-alt="备注表单项">
              <label className="w-[100px] text-right text-[14px] text-[#333] mr-[16px] pt-[6px]" data-ai-alt="备注标签">
                备注
              </label>
              <textarea 
                placeholder="请输入内容"
                className="flex-1 h-[72px] p-[8px_12px] border border-[#d9d9d9] rounded-[4px] text-[14px] resize-none focus:border-[#2b68ff] focus:outline-none transition-colors"
                value={formData.remark}
                onChange={e => handleChange('remark', e.target.value)}
                data-ai-alt="备注输入框"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-[64px] border-t border-[#f0f0f0] flex items-center justify-center gap-[16px] bg-white mt-auto" data-ai-alt="弹窗底部操作区">
          <button className="min-w-[80px] h-[32px] px-[16px] border border-[#d9d9d9] rounded-[4px] text-[14px] text-[#333] hover:border-[#2b68ff] hover:text-[#2b68ff] transition-colors cursor-pointer" data-ai-alt="取消按钮" onClick={() => setIsModalOpen(false)}>
            取消
          </button>
          <button 
            className="min-w-[80px] h-[32px] px-[16px] border border-[#2b68ff] rounded-[4px] text-[14px] text-[#2b68ff] hover:bg-[#f0f5ff] transition-colors cursor-pointer"
            data-ai-alt="保存按钮"
            data-ai-changelog-id="index-action-save"
            data-ai-changelog-title="保存操作"
            data-ai-changelog-desc="提交表单数据"
          >
            保存
          </button>
          <button 
            className="min-w-[80px] h-[32px] px-[16px] bg-[#2b68ff] border border-[#2b68ff] rounded-[4px] text-[14px] text-white hover:bg-[#1a55e6] hover:border-[#1a55e6] transition-colors cursor-pointer"
            data-ai-alt="保存并启用按钮"
            data-ai-changelog-id="index-action-save-enable"
            data-ai-changelog-title="保存并启用操作"
            data-ai-changelog-desc="提交表单数据并启用"
          >
            保存并启用
          </button>
        </div>
      </div>
        </div>
      )}

      {/* 日志弹窗 */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.45)] z-50 flex items-center justify-center">
          <div className="w-[600px] bg-white rounded-[8px] shadow-sm overflow-hidden flex flex-col">
            <div className="h-[56px] border-b border-[#f0f0f0] flex items-center justify-between px-[24px]">
              <div className="text-[16px] text-[#333] font-medium">
                变更历史/操作日志
              </div>
              <button className="text-[#999] hover:text-[#333] cursor-pointer" onClick={() => setIsLogModalOpen(false)}>
                <i className="fas fa-times text-[16px] w-[16px] h-[16px] flex items-center justify-center"></i>
              </button>
            </div>
            <div className="p-[24px]">
              <table className="w-full border-collapse text-[14px]">
                <thead className="bg-[#fafafa]">
                  <tr>
                    <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">操作时间</th>
                    <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">操作人</th>
                    <th className="p-[12px_16px] text-left border-b border-[#f0f0f0] font-medium text-[#333]">操作内容</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">2023-10-10 10:00:00</td>
                    <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">张三</td>
                    <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">修改了计费对象</td>
                  </tr>
                  <tr>
                    <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">2023-10-01 12:00:00</td>
                    <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">李四</td>
                    <td className="p-[12px_16px] border-b border-[#f0f0f0] text-[#666]">新建了该数据</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="h-[56px] border-t border-[#f0f0f0] flex items-center justify-end px-[24px] bg-white mt-auto">
              <button className="min-w-[80px] h-[32px] px-[16px] border border-[#d9d9d9] rounded-[4px] text-[14px] text-[#333] hover:border-[#2b68ff] hover:text-[#2b68ff] transition-colors cursor-pointer" onClick={() => setIsLogModalOpen(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
