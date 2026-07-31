import React, { useState } from 'react';

const TagSelect = ({ label, options = [], value = [], onChange, allowAdd = true, single = false, tooltip = '', disabled = false, required = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [localOptions, setLocalOptions] = useState(options);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSelect = (option) => {
    if (disabled) return;
    if (single) {
      onChange([option]);
      return;
    }
    
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleAdd = () => {
    if (newOption.trim()) {
      const newValue = newOption.trim();
      if (!localOptions.includes(newValue)) {
        setLocalOptions([...localOptions, newValue]);
      }
      if (!value.includes(newValue) && !single) {
        onChange([...value, newValue]);
      }
      if (single) {
          onChange([newValue]);
      }
      setNewOption('');
      setIsAdding(false);
    }
  };

  const handleDeleteOption = (e, optionToDelete) => {
    e.stopPropagation();
    if (disabled) return;
    setLocalOptions(localOptions.filter(opt => opt !== optionToDelete));
    if (value.includes(optionToDelete)) {
        onChange(value.filter(v => v !== optionToDelete));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4 py-4 border-b border-dashed border-gray-200 last:border-0">
      <div className="w-[120px] pt-1.5 flex items-center gap-1 flex-shrink-0">
        <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {required && <span className="text-red-500 mr-1">*</span>}
          {label}
        </span>
        {tooltip && (
          <div 
            className="relative group cursor-help"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <i className="fa-regular fa-question-circle text-gray-400 hover:text-blue-500 text-xs"></i>
            {showTooltip && (
              <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50 pointer-events-none">
                {tooltip}
                <div className="absolute left-1.5 top-full border-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-wrap gap-2">
        {localOptions.map((opt, idx) => {
          const isSelected = value.includes(opt);
          return (
            <div key={idx} className="group relative inline-flex items-center">
              <button
                onClick={() => handleSelect(opt)}
                disabled={disabled}
                className={`px-4 py-1.5 rounded text-sm transition-all border flex items-center gap-2 ${
                  disabled 
                    ? (isSelected ? 'bg-gray-100 border-gray-300 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-300')
                    : isSelected 
                      ? 'bg-blue-50 border-blue-600 text-blue-600 font-medium' 
                      : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-500'
                }`}
              >
                {opt}
                {!disabled && (
                  <span 
                    onClick={(e) => handleDeleteOption(e, opt)}
                    className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 text-gray-300 transition-colors opacity-0 group-hover:opacity-100"
                    title="删除选项"
                  >
                    <i className="fa-solid fa-times text-xs scale-75"></i>
                  </span>
                )}
              </button>
            </div>
          );
        })}

        {allowAdd && !disabled && (
          !isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-1.5 rounded text-sm border border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 flex items-center gap-1 transition-all"
            >
              <i className="fa-solid fa-plus"></i> 添加
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-fade-in">
              <input
                type="text"
                autoFocus
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="输入新值"
                className="w-[120px] px-3 py-1.5 text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button 
                onClick={handleAdd}
                className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700"
              >
                <i className="fa-solid fa-check text-xs"></i>
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="w-7 h-7 bg-gray-200 text-gray-500 rounded flex items-center justify-center hover:bg-gray-300"
              >
                <i className="fa-solid fa-times text-xs"></i>
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default TagSelect;