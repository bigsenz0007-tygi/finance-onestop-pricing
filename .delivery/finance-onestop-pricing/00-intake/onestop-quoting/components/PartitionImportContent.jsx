import React, { useRef, useState } from 'react';

function PartitionImportContent({ showCloseButton = true, onClose, onImported }) {
  const fileRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const handleDownload = () => {
    const header = '分区名称,报价申请单号,合同编码,始发城市,目的城市\n';
    const blob = new Blob([header], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = '价格区分导入模板.csv'; a.click();
    URL.revokeObjectURL(url);
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result || '';
        // 极简解析：按行拆分，忽略首行表头，仅作演示
        const lines = String(text).split(/\r?\n/).filter(Boolean).slice(1);
        const partitions = lines.map((line, idx) => {
          const [name, applyNo, contractCode, fromCity, toCity] = line.split(',');
          return {
            id: Date.now() + idx,
            name: name || '',
            applyNo: applyNo || '',
            contractCode: contractCode || '',
            fromCity: fromCity || '',
            toCity: toCity || '',
            statGroup: '', feeItem: '', orderType: '', deliveryType: '', direction: ''
          };
        });
        if (onImported) onImported(partitions);
      } catch (e2) {
        // 轻提示用内联元素展示，避免使用 alert
        setFileName('文件解析失败，请检查格式');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full h-full flex flex-col" data-ai-alt="导入内容区" data-ai-changelog-id="partition-import" data-ai-changelog-title="新增区分导入" data-ai-changelog-desc="在分区列表旁新增区分导入按钮，点击后提供模板下载与本地文件导入，将解析结果追加到分区列表">
      <div className="flex items-center justify-between px-[16px] h-[56px] border-b-[1px] border-gray-200">
        <div className="text-[16px] font-bold text-gray-800">价格区分导入</div>
        {showCloseButton && (
          <button className="px-[10px] py-[6px] text-gray-500 hover:text-gray-700" onClick={onClose} data-ai-alt="关闭">✕</button>
        )}
      </div>
      <div className="p-[20px] flex-1 overflow-y-auto" data-ai-alt="导入操作区">
        <div className="mb-[16px] text-[14px] text-gray-700">请先下载模板，按示例填写后再导入。支持 CSV 文件。</div>
        <div className="flex items-center gap-[12px] mb-[16px]">
          <button className="px-[12px] py-[8px] bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 text-[14px]" onClick={handleDownload} data-ai-alt="下载模板">下载模板</button>
          <button className="px-[12px] py-[8px] bg-white text-gray-700 rounded border border-gray-300 hover:bg-gray-50 text-[14px]" onClick={() => fileRef.current?.click()} data-ai-alt="选择文件">选择文件</button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
          <span className="text-[12px] text-gray-500">{fileName || '未选择文件'}</span>
        </div>
        <div className="text-[12px] text-gray-500">模板字段：分区名称、报价申请单号、合同编码、始发城市、目的城市（首行为表头）。</div>
      </div>
      <div className="px-[16px] py-[12px] border-t-[1px] border-gray-200 flex justify-end gap-[12px]">
        <button className="px-[12px] py-[8px] border border-gray-300 rounded text-gray-700 hover:bg-gray-50" onClick={onClose} data-ai-alt="取消">取消</button>
      </div>
    </div>
  );
}

export default PartitionImportContent;
