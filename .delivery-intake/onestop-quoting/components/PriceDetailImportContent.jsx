import React, { useState } from 'react';

function PriceDetailImportContent({ onClose }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    // 模拟上传过程
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
    }, 1500);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">导入报价明细</h2>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 transition-colors"
          data-ai-alt="关闭弹窗"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto">
        {!uploadSuccess ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded p-4 text-sm text-blue-800">
              <p className="mb-2 font-medium">导入说明：</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>请先下载标准报价明细模板。</li>
                <li>按照模板格式填写价格数据，不要修改表头。</li>
                <li>上传填写好的 Excel 文件进行导入。</li>
              </ol>
            </div>

            <div className="flex justify-center">
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                data-ai-alt="下载模板"
              >
                <i className="fa-solid fa-download"></i>
                下载模板
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer" onClick={handleUpload}>
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <i className="fa-solid fa-spinner fa-spin text-blue-500 text-3xl mb-3"></i>
                  <p className="text-gray-500 text-sm">正在上传解析中...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <i className="fa-solid fa-cloud-arrow-up text-gray-400 text-4xl mb-3"></i>
                  <p className="text-gray-700 font-medium mb-1">点击或拖拽文件到此处上传</p>
                  <p className="text-gray-500 text-xs">支持 .xlsx, .xls 格式</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-check text-3xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">导入成功</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              报价明细数据已成功导入并解析，您可以继续编辑或保存配置。
            </p>
            <button 
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={onClose}
              data-ai-alt="完成并关闭"
            >
              完成
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PriceDetailImportContent;
