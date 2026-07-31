import React from 'react';

function ModalFrame({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-ai-alt="弹窗遮罩容器">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} data-ai-alt="遮罩层"></div>
      <div className="relative w-[600px] max-h-[80vh] bg-white rounded-lg shadow-xl flex flex-col" data-ai-alt="弹窗主体">
        <div className="flex items-center justify-between px-6 py-4 border-b" data-ai-alt="弹窗头部">
          <h2 className="text-lg font-medium text-gray-900" data-ai-alt="弹窗标题">{title}</h2>
          <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={onClose} data-ai-alt="关闭按钮">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6" data-ai-alt="弹窗内容区">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ModalFrame;