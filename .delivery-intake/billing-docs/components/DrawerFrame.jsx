import React, { useState } from 'react';

function DrawerFrame({ children, onClose, title }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" data-ai-alt="弹窗遮罩容器">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} data-ai-alt="遮罩层"></div>
      <div className={`relative bg-white shadow-xl flex flex-col rounded-lg transition-all duration-300 ${isFullscreen ? 'w-full h-full' : 'w-[800px] max-h-[90vh]'}`} data-ai-alt="弹窗主体">
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" data-ai-alt="弹窗头部">
          <h2 className="text-lg font-medium text-gray-900" data-ai-alt="弹窗标题">{title}</h2>
          <div className="flex items-center gap-4">
            <button 
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? '退出全屏' : '全屏'}
            </button>
            <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={onClose} data-ai-alt="关闭按钮">×</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6" data-ai-alt="弹窗内容区">
          {children}
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 shrink-0 rounded-b-lg" data-ai-alt="弹窗底部操作区">
          <button className="px-5 py-2 border rounded text-sm hover:bg-gray-100 transition-colors" onClick={onClose} data-ai-alt="取消按钮">取消</button>
          <button className="px-5 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" data-ai-alt="确定按钮">确定</button>
        </div>
      </div>
    </div>
  );
}

export default DrawerFrame;