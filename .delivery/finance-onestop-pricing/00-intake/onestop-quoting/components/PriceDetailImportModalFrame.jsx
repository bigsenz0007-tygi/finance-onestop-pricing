import React from 'react';

function PriceDetailImportModalFrame({ children, onMaskClick }) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/45 z-40"
        onClick={onMaskClick}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </>
  );
}

export default PriceDetailImportModalFrame;
