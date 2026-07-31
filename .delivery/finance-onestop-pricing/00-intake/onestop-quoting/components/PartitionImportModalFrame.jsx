import React from 'react';

function PartitionImportModalFrame({ children, onMaskClick }) {
  return (
    <>
      <div data-ai-alt="遮罩" className="fixed inset-0 bg-black/40 z-40" onClick={onMaskClick}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="w-[960px] max-w-[96%] h-[560px] bg-white rounded-[12px] shadow-xl overflow-hidden flex flex-col" data-ai-alt="导入弹窗容器">
          {children}
        </div>
      </div>
    </>
  );
}

export default PartitionImportModalFrame;
