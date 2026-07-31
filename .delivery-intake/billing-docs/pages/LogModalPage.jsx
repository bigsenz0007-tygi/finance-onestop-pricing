import React from 'react';
import ModalFrame from '../components/ModalFrame.jsx';
import LogContent from '../components/LogContent.jsx';

function LogModalPage() {
  return (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center" data-ai-alt="日志弹窗独立页面" data-ai-changelog-id="page-logModal" data-ai-changelog-title="操作日志页面整体需求" data-ai-changelog-desc="展示单据的操作历史日志。">
      <ModalFrame onClose={() => {}} title="操作日志">
        <LogContent />
      </ModalFrame>
    </div>
  );
}

export default LogModalPage;