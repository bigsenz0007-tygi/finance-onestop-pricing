import React, { useState, useEffect } from 'react';
import IndexPage from './pages/IndexPage.jsx';
import DetailDrawerPage from './pages/DetailDrawerPage.jsx';
import LogModalPage from './pages/LogModalPage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState(window.__INITIAL_PAGE_KEY__ || 'index');

  useEffect(() => {
    const handlePageChange = () => {
      const pageKey = document.querySelector('[data-page-key]')?.getAttribute('data-page-key');
      if (pageKey && pageKey !== currentPage) {
        setCurrentPage(pageKey);
      }
    };
    handlePageChange();
  }, []);

  useEffect(() => {
    window.__setCurrentPage = (pageKey) => {
      if (pageKey) setCurrentPage(pageKey);
    };
    return () => { delete window.__setCurrentPage; };
  }, []);

  useEffect(() => {
    const rootEl = document.querySelector('[data-page-key]');
    if (!rootEl) return;
    const observer = new MutationObserver(() => {
      const newKey = rootEl.getAttribute('data-page-key');
      if (newKey) setCurrentPage(newKey);
    });
    observer.observe(rootEl, { attributes: true, attributeFilter: ['data-page-key'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-100 mx-auto w-[1440px] font-sans text-gray-800" data-page-key={currentPage} data-ai-alt="根页面容器" data-knowledge-citationId="kg://1777964534209843202/2055342445715042305/2055342445782151170/2#2055342445782151170_chunk_0_v20260516014005">
      {currentPage === 'index' && <IndexPage />}
      {currentPage === 'detailDrawer' && <DetailDrawerPage />}
      {currentPage === 'logModal' && <LogModalPage />}
    </div>
  );
}

export default App;