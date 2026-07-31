import React from 'react';
import PriceDetailImportModalFrame from '../components/PriceDetailImportModalFrame';
import PriceDetailImportContent from '../components/PriceDetailImportContent';

function PriceDetailImportModalPage() {
  return (
    <div className="w-full h-full bg-gray-50">
      <PriceDetailImportModalFrame>
        <PriceDetailImportContent onClose={() => console.log('Close Import Modal')} />
      </PriceDetailImportModalFrame>
    </div>
  );
}

export default PriceDetailImportModalPage;
