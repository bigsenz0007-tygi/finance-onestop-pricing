import React from 'react';
import PartitionImportModalFrame from '../components/PartitionImportModalFrame';
import PartitionImportContent from '../components/PartitionImportContent';

function PartitionImportModalPage() {
  return (
    <div className="w-full h-full" data-ai-alt="区分导入独立页">
      <PartitionImportModalFrame>
        <PartitionImportContent showCloseButton={false} />
      </PartitionImportModalFrame>
    </div>
  );
}

export default PartitionImportModalPage;
