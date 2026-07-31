import React, { useState, useRef, useEffect } from 'react';

const DateRangePicker = ({ value, onChange, placeholder = ['起始日期', '结束日期'] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const [startStr, endStr] = value || ['', ''];

  // 处理点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShortcut = (type) => {
    const today = new Date();
    const start = new Date(today);
    let end = new Date(today);

    if (type === 'one-year') {
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
    } else if (type === 'second-year-same-month') {
      end.setFullYear(end.getFullYear() + 2);
      end.setDate(0); // 暂定为上月底，实际按业务定义
    } else if (type === 'one-month') {
      end.setMonth(end.getMonth() + 1);
      end.setDate(end.getDate() - 1);
    }

    const format = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    onChange([format(start), format(end)]);
    setIsOpen(false);
  };

  // 简化的双日历展示结构 (仅作为交互示意)
  const currentMonth = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(currentMonth.getMonth() + 1);

  const renderCalendar = (date) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    // 简化：渲染1到30的网格示意
    const dummyDays = Array.from({ length: 30 }, (_, i) => i + 1);
    
    return (
      <div className="flex-1 p-[16px]">
        <div className="flex items-center justify-between mb-[16px]">
          <div className="flex gap-[8px]">
            <button className="text-gray-400 hover:text-gray-600">«</button>
            <button className="text-gray-400 hover:text-gray-600">‹</button>
          </div>
          <span className="font-medium text-[14px]">{date.getFullYear()} 年 {date.getMonth() + 1} 月</span>
          <div className="flex gap-[8px]">
            <button className="text-gray-400 hover:text-gray-600">›</button>
            <button className="text-gray-400 hover:text-gray-600">»</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-[12px] text-center mb-[8px]">
          {days.map(d => <span key={d} className="text-[12px] text-gray-500">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-[8px] text-center">
          {/* 前置空白占位 */}
          <span className="p-[4px] text-gray-300">28</span>
          <span className="p-[4px] text-gray-300">29</span>
          <span className="p-[4px] text-gray-300">30</span>
          {dummyDays.map(d => (
            <button 
              key={d} 
              className="p-[4px] text-[13px] hover:bg-blue-50 rounded-[4px]"
              onClick={() => setIsOpen(false)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* 触发器 */}
      <div 
        className={`flex items-center h-[40px] px-3 border rounded-[4px] bg-white cursor-pointer transition-all ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300 hover:border-gray-400'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`flex-1 text-[13px] ${startStr ? 'text-gray-800' : 'text-gray-400'}`}>
          {startStr || placeholder[0]}
        </span>
        <span className="text-gray-300 px-[12px]">-</span>
        <span className={`flex-1 text-[13px] ${endStr ? 'text-gray-800' : 'text-gray-400'}`}>
          {endStr || placeholder[1]}
        </span>
        <i className="fa-regular fa-calendar ml-[8px] text-gray-400"></i>
      </div>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute z-50 top-[44px] right-0 flex bg-white border border-gray-200 rounded-[4px] shadow-lg overflow-hidden" style={{ width: '600px' }}>
          {/* 左侧快捷选项 */}
          <div className="w-[100px] border-r border-gray-100 bg-gray-50 py-[8px]">
            <div className="px-[16px] py-[8px] text-[13px] text-gray-700 hover:bg-blue-50 cursor-pointer" onClick={() => handleShortcut('one-year')}>一年</div>
            <div className="px-[16px] py-[8px] text-[13px] text-gray-700 hover:bg-blue-50 cursor-pointer" onClick={() => handleShortcut('second-year-same-month')}>第二年同月</div>
            <div className="px-[16px] py-[8px] text-[13px] text-gray-700 hover:bg-blue-50 cursor-pointer" onClick={() => handleShortcut('one-month')}>一个月</div>
          </div>
          
          {/* 右侧双日历 */}
          <div className="flex-1 flex">
            {renderCalendar(currentMonth)}
            <div className="w-[1px] bg-gray-100 my-[16px]"></div>
            {renderCalendar(nextMonth)}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
