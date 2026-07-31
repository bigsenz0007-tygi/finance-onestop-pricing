import React, { useState, useEffect } from 'react';
import QuotationHomePage from './pages/QuotationHomePage';
import BaseInfoPage from './pages/BaseInfoPage';
import PricePartitionPage from './pages/PricePartitionPage';
import PriceDetailPage from './pages/PriceDetailPage';
import ExtensionRulesPage from './pages/ExtensionRulesPage';
import PriceDetailImportModalPage from './pages/PriceDetailImportModalPage';
import SimulationTestPage from './pages/SimulationTestPage';

const App = () => {
  const [currentPage, setCurrentPage] = useState(window.__INITIAL_PAGE_KEY__ || 'index');
  
  // 提升的状态：报价配置数据，用于页面间共享
  const [quotationConfig, setQuotationConfig] = useState({
    billingRules: { rules: [] },
    quotationRules: {}, // 包含维度、模式、阶梯、进位等
    extensionRules: {}
  });

  useEffect(() => {
    const handlePageChange = () => {
      const pageKey = document.querySelector('[data-page-key]')?.getAttribute('data-page-key');
      if (pageKey && pageKey !== currentPage) {
        setCurrentPage(pageKey);
      }
    };
    handlePageChange();
  }, []);

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'index':
        return <QuotationHomePage navigate={navigate} setQuotationConfig={setQuotationConfig} />;
      case 'baseInfoPage':
        return <BaseInfoPage navigate={navigate} quotationConfig={quotationConfig} setQuotationConfig={setQuotationConfig} />;
      case 'pricePartitionPage':
        return <PricePartitionPage navigate={navigate} quotationConfig={quotationConfig} setQuotationConfig={setQuotationConfig} />;
      case 'priceDetailPage':
        return <PriceDetailPage navigate={navigate} quotationConfig={quotationConfig} setQuotationConfig={setQuotationConfig} />;
      case 'extensionRulesPage':
        return <ExtensionRulesPage navigate={navigate} quotationConfig={quotationConfig} setQuotationConfig={setQuotationConfig} />;
      case 'simulationTestPage':
        return <SimulationTestPage navigate={navigate} quotationConfig={quotationConfig} setQuotationConfig={setQuotationConfig} />;
      case 'priceDetailImportModal':
        return <PriceDetailImportModalPage />;
      default:
        return <BaseInfoPage navigate={navigate} quotationConfig={quotationConfig} setQuotationConfig={setQuotationConfig} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-page-key={currentPage}>
      {renderPage()}
    </div>
  );
};

export default App;