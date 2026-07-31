import React from 'react';
import DrawerFrame from '../components/DrawerFrame.jsx';
import DetailFormContent from '../components/DetailFormContent.jsx';

function DetailDrawerPage() {
  return (
    <div className="w-full h-full bg-gray-100" data-ai-alt="详情抽屉独立页面" data-ai-changelog-id="page-detailDrawer" data-ai-changelog-title="计费要素详情页面整体需求" data-ai-changelog-desc="用于新建、查看、编辑单据的计费要素信息。">
      <DrawerFrame onClose={() => {}} title="单据计费要素详情">
        <DetailFormContent mode="view" />
      </DrawerFrame>
    </div>
  );
}

export default DetailDrawerPage;