import React from 'react';
import Layout from '../components/Layout';

const ProductPricing = ({ navigate }) => {
  // 模拟参考图中的表单数据
  const formData = {
    productName: '京东标快',
    productCode: 'P-THS-201810',
    category: '运配',
    owner: '杨庚',
    startDate: '2026-03-03',
    endDate: '',
    isMain: '是',
    version: '20.0',
    rounding: '四舍五入取整',
    priceManage: '是',
    multiCurrency: '是',
    desc: '25年8月价格调整'
  };

  // 模拟表格数据
  const tableData = [
    {
      feeItem: '快递运费(QIPSF)',
      bizType: '',
      standardPrice: '京东标快20250801(250801JDBKZXJG)',
      currency: '人民币'
    },
    {
      feeItem: '快递运费(QIPSF)',
      bizType: '特惠送-内地至港澳(THS_THM)',
      standardPrice: '特惠送-内地至港澳报价(THS-NDZGAC)',
      currency: '人民币'
    },
    {
      feeItem: '快递运费(QIPSF)',
      bizType: '特惠送-香港出发(THS_HK)',
      standardPrice: '特惠送-香港出发报价新(特惠送-香港出发报价新)',
      currency: '港币'
    },
    {
      feeItem: '快递运费(QIPSF)',
      bizType: '特惠送-澳门出发(THS_MC)',
      standardPrice: '特惠送-澳门出发报价新(THS-AMJGX)',
      currency: '澳门元'
    },
    {
      feeItem: '快递运费(QIPSF)',
      bizType: '特惠送-仓配一体(QL-YW-010)',
      standardPrice: '京东标快20250801(250801JDBKZXJG)',
      currency: '人民币'
    }
  ];

  // 渲染表单字段组件
  const FormField = ({ label, value, required, type = 'text', placeholder = '', className = '' }) => (
    <div className={`flex items-center gap-3 ${className}`}>
      <label className="w-32 text-right text-sm font-bold text-gray-600 flex-shrink-0">
        {required && <span className="text-red-500 mr-1">*</span>}
        {label}
      </label>
      <div className="flex-1">
        {type === 'select' ? (
          <div className="relative">
            <select 
              className="w-full h-9 px-3 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600 outline-none appearance-none"
              defaultValue={value}
            >
              <option>{value || placeholder}</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-2.5 text-gray-400 text-xs pointer-events-none"></i>
          </div>
        ) : type === 'date' ? (
          <div className="relative">
            <input 
              type="text" 
              className="w-full h-9 px-3 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600 outline-none"
              defaultValue={value}
              placeholder={placeholder}
            />
            <i className="fa-regular fa-calendar absolute right-3 top-2.5 text-gray-400 text-xs"></i>
          </div>
        ) : (
          <input 
            type="text" 
            className="w-full h-9 px-3 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600 outline-none"
            defaultValue={value}
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );

  return (
    <Layout 
      title="物流产品档案-详情" 
      showBack={false} // 隐藏 Layout 默认的返回，使用自定义头部
      onBack={() => navigate('index')} 
      currentPage="productPricing"
    >
      <div className="bg-white min-h-full pb-16">
        {/* 头部：模仿参考图的弹窗 Header 样式，覆盖 Layout 默认样式 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 mb-6">
          <h2 className="text-lg font-bold text-gray-800">物流产品档案-详情</h2>
          <button 
            onClick={() => navigate('index')} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fa-solid fa-times text-lg"></i>
          </button>
        </div>

        {/* 表单区域 */}
        <div className="px-8 max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 gap-x-12 gap-y-5 mb-6">
            <FormField label="产品名称" value={formData.productName} required />
            <FormField label="产品编码" value={formData.productCode} required />
            
            <FormField label="产品分类" value={formData.category} required type="select" />
            <FormField label="产品负责人" value={formData.owner} required />
            
            <FormField label="生效日期" value={formData.startDate} required type="date" />
            <FormField label="失效日期" value={formData.endDate} type="date" placeholder="选择日期" />
            
            <FormField label="主产品" value={formData.isMain} type="select" />
            <FormField label="版本号" value={formData.version} />
            
            <FormField label="是否商家价格管理" value={formData.priceManage} type="select" />
            
            <FormField label="多币种报价" value={formData.multiCurrency} type="select" />
          </div>

          {/* 描述字段单独一行 */}
          <div className="flex items-center gap-3 mb-8">
            <label className="w-32 text-right text-sm font-bold text-gray-600 flex-shrink-0">
              <span className="text-red-500 mr-1">*</span>
              产品描述
            </label>
            <div className="flex-1">
              <input 
                type="text" 
                className="w-full h-9 px-3 bg-gray-100 border border-gray-200 rounded text-sm text-gray-600 outline-none"
                defaultValue={formData.desc}
              />
            </div>
          </div>

          {/* 表格区域 */}
          <div className="border border-gray-200 rounded-sm overflow-hidden">
            {/* 表头 */}
            <div className="bg-gray-50 border-b border-gray-200 flex text-sm font-bold text-gray-600">
              <div className="flex-1 py-3 px-4 text-center">费用项</div>
              <div className="flex-1 py-3 px-4 text-center">指定业务类型</div>
              <div className="flex-1 py-3 px-4 text-center">标准价</div>
              <div className="w-32 py-3 px-4 text-center">报价币种</div>
            </div>

            {/* 表格内容 */}
            <div className="divide-y divide-gray-100">
              {tableData.map((row, index) => (
                <div key={index} className="flex text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 py-4 px-4 flex items-center justify-center">
                    {row.feeItem}
                  </div>
                  <div className="flex-1 py-4 px-4 flex items-center justify-center text-center">
                    {row.bizType}
                  </div>
                  <div className="flex-1 py-4 px-4 flex items-center justify-center text-center">
                    <span className="text-blue-500 hover:text-blue-700 cursor-pointer">
                      {row.standardPrice}
                    </span>
                  </div>
                  <div className="w-32 py-4 px-4 flex items-center justify-center">
                    {row.currency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部按钮区 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end px-8 z-50">
           <button 
              onClick={() => navigate('index')}
              className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors"
           >
             取消
           </button>
        </div>
      </div>
    </Layout>
  );
};

export default ProductPricing;