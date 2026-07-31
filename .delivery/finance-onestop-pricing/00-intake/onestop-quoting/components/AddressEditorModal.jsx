import React, { useState } from 'react';

const LABELS = [
  '东北（含蒙东）', '东北（无蒙东）', '全国（无港澳台钓）', '内陆（无新疆）', 
  '华东', '华中', '华北（含内蒙）', '华北（含蒙西）', '华南', '西北', '西南'
];

const PROVINCES = [
  '北京', '上海', '天津', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江', 
  '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', 
  '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾', 
  '内蒙古', '广西', '西藏', '宁夏', '新疆', '香港', '澳门'
];

const AddressEditorModal = ({ isOpen, onClose, onConfirm, initialValue }) => {
  const [activeTab, setActiveTab] = useState('国内');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedProvinces, setSelectedProvinces] = useState(initialValue ? initialValue.split(',') : []);

  if (!isOpen) return null;

  const toggleLabel = (label) => {
    setSelectedLabels(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const toggleProvince = (province) => {
    setSelectedProvinces(prev => 
      prev.includes(province) ? prev.filter(p => p !== province) : [...prev, province]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProvinces(PROVINCES);
    } else {
      setSelectedProvinces([]);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedProvinces.join(','));
    onClose();
  };

  const isAllSelected = PROVINCES.length > 0 && selectedProvinces.length === PROVINCES.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45" data-ai-alt="地址编辑器弹窗">
      <div className="bg-white w-[600px] max-h-[80vh] rounded-lg shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-800">请选择地址</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-6 border-b mb-4">
            <button 
              className={`pb-2 font-medium ${activeTab === '国内' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('国内')}
            >国内</button>
            <button 
              className={`pb-2 font-medium ${activeTab === '国际' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              onClick={() => setActiveTab('国际')}
            >国际</button>
          </div>

          {activeTab === '国内' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">地址标签：</p>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {LABELS.map(label => (
                    <label key={label} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        checked={selectedLabels.includes(label)}
                        onChange={() => toggleLabel(label)}
                      /> 
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <textarea 
                  className="w-full h-24 p-3 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  placeholder="请输入省份/城市/县区搜索，多个用逗号、顿号或换行分隔；上限300"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <div className="flex items-center pb-2 border-b">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  /> 
                  全选
                </label>
              </div>

              <div className="space-y-1">
                {PROVINCES.map(province => (
                  <div key={province} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => toggleProvince(province)}>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedProvinces.includes(province)}
                        onChange={() => toggleProvince(province)}
                      /> 
                      {province}
                    </label>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === '国际' && (
            <div className="text-center py-10 text-gray-500 text-sm">国际地址配置开发中...</div>
          )}
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50" onClick={onClose}>取消</button>
          <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleConfirm}>确定</button>
        </div>
      </div>
    </div>
  );
};

export default AddressEditorModal;
