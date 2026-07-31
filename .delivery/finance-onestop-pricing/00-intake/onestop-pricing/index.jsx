import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './pages/Home';
import ProductPricing from './pages/ProductPricing';
import ScenarioPricing from './pages/ScenarioPricing';

const App = () => {
  const [currentPage, setCurrentPage] = useState('index');

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
        return <Home navigate={navigate} />;
      case 'productPricing':
        return <ProductPricing navigate={navigate} />;
      case 'scenarioPricing':
        return <ScenarioPricing navigate={navigate} />;
      default:
        return <Home navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-page-key={currentPage}>
      {renderPage()}
    </div>
  );
};

export default App;