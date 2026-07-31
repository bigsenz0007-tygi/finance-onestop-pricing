import React from 'react';

const Layout = ({ children, title, showBack, onBack, currentPage }) => {
  return (
    /* 添加 overflow-y-scroll 强制显示滚动条槽，防止页面内容因滚动条出现/消失而水平跳动 */
    <div className="h-screen overflow-y-scroll bg-[#f5f5f5] flex flex-col font-sans text-[#333]">
      {/* 顶部导航栏 */}
      <header className="bg-white h-[60px] shadow-sm flex items-center px-6 sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
            <i className="fa-solid fa-box-open"></i>
          </div>
          <h1 className="text-lg font-bold text-gray-800 tracking-wide">物流定价规则配置中心</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-gray-500">当前用户：产品规划岗</span>
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <i className="fa-solid fa-user"></i>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-6">
        {/* 面包屑/返回栏 */}
        {(title || showBack) && (
          <div className="mb-6 flex items-center gap-2">
            {showBack && (
              <button 
                onClick={onBack} 
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm transition-all text-gray-600"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>
            )}
            {title && <h2 className="text-xl font-bold text-gray-800">{title}</h2>}
          </div>
        )}
        
        <div className="fade-in w-full">
          {children}
        </div>
      </main>
      
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Layout;