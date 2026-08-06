<template>
  <div
    class="quoting-root"
    :class="{
      'page-shell': !embedded,
      'page-shell--wizard': !isViewMode && !embedded,
      'pricing-view-embed': isViewMode && embedded
    }"
  >
    <div
      class="table-card"
      :class="{
        'table-card--wizard': !isViewMode && !embedded,
        'table-card--view': isViewMode
      }"
    >
      <!-- 产品报价本期不做：仅场景报价，隐藏切换 Tab -->
      <div v-if="false" class="lui-line-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="lui-line-tabs__item"
          :class="{ 'is-active': base.quotationMethod === '产品报价' }"
          @click="switchQuoteMode('产品报价')"
        >产品报价</button>
        <button
          type="button"
          role="tab"
          class="lui-line-tabs__item"
          :class="{ 'is-active': base.quotationMethod === '场景报价' }"
          @click="switchQuoteMode('场景报价')"
        >场景报价</button>
      </div>

      <div v-if="isViewMode && !embedded" class="table-toolbar">
        <h3>报价方案详情</h3>
      </div>

      <LuiArrowSteps
        v-if="!isViewMode"
        :steps="quoteSteps"
        :active="step"
        @change="onStepChange"
      />

      <div
        v-if="isViewMode"
        class="lui-pill-tabs quoting-view-tabs"
        role="tablist"
      >
        <button
          v-for="(tab, idx) in viewTabs"
          :key="tab.key"
          type="button"
          role="tab"
          class="lui-pill-tabs__item"
          :class="{
            'is-active': viewTab === tab.key,
            'has-divider': idx > 0
          }"
          :aria-selected="viewTab === tab.key ? 'true' : 'false'"
          @click="onViewTabChange(tab.key)"
        >{{ tab.title }}</button>
      </div>

      <div class="wizard-body">
      <!-- 预览态勿用 fieldset disabled：会禁用分区切换等只读交互，导致明细无法完整查看 -->
      <div class="quoting-fieldset" :class="{ 'quoting-fieldset--view': isViewMode }">
      <!-- Step 1 基础信息 -->
      <div v-show="showSection('base', 0)" class="quoting-section">
        <h3 class="section-title">基础信息</h3>
        <el-form :model="base" class="lui-form-grid quoting-base-form" size="small">
          <el-form-item label="报价方案名称" required :class="{ 'is-error': fieldErrors.quotationName }">
            <span v-if="isViewMode" class="view-plain-text">{{ base.quotationName || '-' }}</span>
            <template v-else>
              <el-input
                v-model="base.quotationName"
                placeholder="请输入报价方案名称"
                :class="{ 'is-error': fieldErrors.quotationName }"
                @input="clearFieldError('quotationName')"
              />
              <lui-field-error :message="fieldErrors.quotationName" />
            </template>
          </el-form-item>
          <el-form-item label="商家编码" required :class="{ 'is-error': fieldErrors.merchantCode }">
            <span v-if="isViewMode" class="view-plain-text">{{ base.merchantCode || '-' }}</span>
            <template v-else>
              <el-input
                v-model="base.merchantCode"
                placeholder="请输入商家编码"
                :class="{ 'is-error': fieldErrors.merchantCode }"
                @input="onMerchantCode(); clearFieldError('merchantCode')"
              />
              <lui-field-error :message="fieldErrors.merchantCode" />
            </template>
          </el-form-item>
          <el-form-item label="商家名称" required>
            <span v-if="isViewMode" class="view-plain-text">{{ base.merchantName || '-' }}</span>
            <el-input v-else v-model="base.merchantName" disabled placeholder="输入商家编码后自动带出" />
          </el-form-item>
          <el-form-item label="签约区域" required>
            <span v-if="isViewMode" class="view-plain-text">{{ base.signRegion || '-' }}</span>
            <el-input v-else v-model="base.signRegion" disabled placeholder="输入商家编码自动带出" />
          </el-form-item>
          <el-form-item label="生效时间" required class="lui-form-item--range">
            <span v-if="isViewMode" class="view-plain-text">{{ formatRangeText(base.effectiveRange) }}</span>
            <el-date-picker
              v-else
              v-model="base.effectiveRange"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="报价方式" required>
            <span v-if="isViewMode" class="view-plain-text">{{ base.quotationMethod || '-' }}</span>
            <el-select v-else v-model="base.quotationMethod" disabled placeholder="请选择">
              <el-option label="场景报价" value="场景报价" />
            </el-select>
          </el-form-item>
          <el-form-item label="折扣产品" required :class="{ 'is-error': fieldErrors.discountProduct }">
            <span v-if="isViewMode" class="view-plain-text">{{ base.discountProduct || '-' }}</span>
            <template v-else>
              <el-select
                v-model="base.discountProduct"
                clearable
                placeholder="请选择"
                :class="{ 'is-error': fieldErrors.discountProduct }"
                @change="onDiscountProductChange(); clearFieldError('discountProduct')"
              >
                <el-option label="重货标快" value="重货标快" />
                <el-option label="京东标快" value="京东标快" />
                <el-option label="京东特快" value="京东特快" />
              </el-select>
              <lui-field-error :message="fieldErrors.discountProduct" />
            </template>
          </el-form-item>
          <el-form-item
            v-if="base.quotationMethod === '场景报价'"
            label="业务场景"
            required
            :class="{ 'is-error': fieldErrors.businessScenario }"
          >
            <span v-if="isViewMode" class="view-plain-text">{{ base.businessScenario || '-' }}</span>
            <template v-else>
              <el-select
                v-model="base.businessScenario"
                clearable
                placeholder="请选择"
                :disabled="!scenarios.length"
                :class="{ 'is-error': fieldErrors.businessScenario }"
                @change="onBusinessScenarioChange(); clearFieldError('businessScenario')"
              >
                <el-option v-for="s in scenarios" :key="s" :label="s" :value="s" />
              </el-select>
              <lui-field-error :message="fieldErrors.businessScenario" />
            </template>
          </el-form-item>
          <el-form-item label="结算方式" required>
            <span v-if="isViewMode" class="view-plain-text">{{ base.settlementMethod || '-' }}</span>
            <el-select
              v-else
              v-model="base.settlementMethod"
              clearable
              placeholder="请选择"
              :disabled="base.quotationMethod === '场景报价'"
              @change="onSettleChange"
            >
              <el-option label="月结" value="月结" />
              <el-option v-if="base.quotationMethod !== '场景报价'" label="寄付现结" value="寄付现结" />
              <el-option v-if="base.quotationMethod !== '场景报价'" label="到付现结" value="到付现结" />
            </el-select>
          </el-form-item>
          <el-form-item label="计费策略" required :class="{ 'is-error': fieldErrors.billingStrategy }">
            <span v-if="isViewMode" class="view-plain-text">{{ base.billingStrategy || '-' }}</span>
            <template v-else>
              <el-select
                v-model="base.billingStrategy"
                clearable
                placeholder="请选择"
                :disabled="isCash"
                :class="{ 'is-error': fieldErrors.billingStrategy }"
                @change="clearFieldError('billingStrategy')"
              >
                <el-option label="普通" value="普通" />
                <el-option v-if="!isCash" label="统计考核" value="统计考核" />
                <el-option v-if="!isCash" label="合单计费" value="合单计费" />
                <el-option v-if="!isCash" label="统计+合单" value="统计+合单" />
              </el-select>
              <lui-field-error :message="fieldErrors.billingStrategy" />
            </template>
          </el-form-item>
          <el-form-item v-if="isStats" label="统计考核方式" required>
            <span v-if="isViewMode" class="view-plain-text">{{ base.statisticsMethod || '-' }}</span>
            <el-select v-else v-model="base.statisticsMethod" clearable placeholder="请选择">
              <el-option label="按考核开始月份" value="按考核开始月份" />
              <el-option label="按月中签合同考核" value="按月中签合同考核" />
              <el-option label="按整月考核" value="按整月考核" />
              <el-option label="按项目周期考核" value="按项目周期考核" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="isStats" label="考核起始月" required>
            <span v-if="isViewMode" class="view-plain-text">{{ base.assessmentStartMonth || '-' }}</span>
            <el-date-picker v-else v-model="base.assessmentStartMonth" type="month" value-format="yyyy-MM" placeholder="请选择" />
          </el-form-item>
        </el-form>

        <h3 class="section-title section-title--module section-title-with-tip">
          <span class="section-title__text">复杂报价</span>
          <el-tooltip
            placement="top"
            effect="dark"
            popper-class="quote-tip-popper"
            content="复杂报价说明：默认不启用；启用后可配置单独核算商家、身份核算优先级、金额取整及地址逐级匹配等辅助规则。"
          >
            <span class="field-tip-trigger" tabindex="0" aria-label="说明">?</span>
          </el-tooltip>
        </h3>
        <div class="ext-block ext-block--plain">
          <el-form
            ref="complexForm"
            :model="base"
            class="lui-form-grid complex-quote-form"
            label-width="120px"
            size="small"
          >
            <el-form-item :label="isViewMode ? '启用状态' : '是否启用'">
              <div class="ext-block__switch">
                <span class="ext-block__status">{{ complexQuoteOpen ? '已启用' : '未启用' }}</span>
                <el-switch v-if="!isViewMode" v-model="complexQuoteOpen" />
              </div>
            </el-form-item>
            <el-form-item v-if="complexQuoteOpen" label="金额取整">
              <span v-if="isViewMode" class="view-plain-text">{{ base.amountRounding || '-' }}</span>
              <el-select v-else v-model="base.amountRounding" clearable placeholder="请选择">
                <el-option label="四舍五入取整" value="四舍五入取整" />
                <el-option label="保留2位小数" value="保留2位小数" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="complexQuoteOpen && !isCash" label="地址逐级匹配">
              <span v-if="isViewMode" class="view-plain-text">{{ base.addressLevelMatch || '-' }}</span>
              <el-radio-group v-else v-model="base.addressLevelMatch">
                <el-radio label="是">是</el-radio>
                <el-radio label="否">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="complexQuoteOpen" label="单独核算商家">
              <span v-if="isViewMode" class="view-plain-text">{{ base.separateMerchantAccount || '-' }}</span>
              <el-radio-group v-else v-model="base.separateMerchantAccount">
                <el-radio label="否">否</el-radio>
                <el-radio label="是">是</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="complexQuoteOpen" label="身份核算优先级">
              <span v-if="isViewMode" class="view-plain-text">{{ base.hasIdentityPriority || '-' }}</span>
              <el-radio-group v-else v-model="base.hasIdentityPriority" @change="onIdentityPriorityToggle">
                <el-radio label="否">否</el-radio>
                <el-radio label="是">是</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="complexQuoteOpen && base.hasIdentityPriority === '是'"
              label="身份优先级"
              required
              :class="{ 'is-error': fieldErrors.identityPriority }"
            >
              <span v-if="isViewMode" class="view-plain-text">{{ base.identityPriority || '-' }}</span>
              <template v-else>
                <el-input
                  :value="base.identityPriority"
                  placeholder="请输入数字，如 1"
                  :class="{ 'is-error': fieldErrors.identityPriority }"
                  @input="onIntFieldInput(base, 'identityPriority', $event); clearFieldError('identityPriority')"
                />
                <lui-field-error :message="fieldErrors.identityPriority" />
              </template>
            </el-form-item>
            <el-form-item
              v-if="complexQuoteOpen && base.hasIdentityPriority === '是'"
              label="替核模式规则"
              required
              :class="{ 'is-error': fieldErrors.substituteModeRule }"
            >
              <span v-if="isViewMode" class="view-plain-text">{{ base.substituteModeRule || '-' }}</span>
              <template v-else>
                <el-select
                  v-model="base.substituteModeRule"
                  clearable
                  placeholder="请选择"
                  :class="{ 'is-error': fieldErrors.substituteModeRule }"
                  @change="clearFieldError('substituteModeRule')"
                >
                  <el-option v-for="r in substituteModeRules" :key="r" :label="r" :value="r" />
                </el-select>
                <lui-field-error :message="fieldErrors.substituteModeRule" />
              </template>
            </el-form-item>
            <!-- 价格本优先级 / 跨月计费：本期不做（PRD + 图2） -->
          </el-form>
        </div>
      </div>

      <!-- Step 2 价格分区 -->
      <div v-show="showSection('partition', 1)" class="quoting-section">
        <h3 class="section-title">价格分区配置</h3>
        <el-form class="lui-form-grid partition-dims-form" size="small" label-width="120px">
          <el-form-item
            :label="isViewMode ? '已选报价维度' : '可选报价维度'"
            :class="{ 'lui-form-grid__span-all': isViewMode }"
          >
            <div v-if="isViewMode" class="dims-readonly">
              <el-tag
                v-for="d in selectedDims"
                :key="d"
                size="small"
                type="info"
                effect="plain"
                class="dims-readonly__tag"
              >{{ d }}</el-tag>
              <span v-if="!selectedDims.length" class="view-plain-text">-</span>
            </div>
            <el-select
              v-else
              v-model="selectedDims"
              multiple
              filterable
              clearable
              collapse-tags
              placeholder="请选择报价维度"
              class="dims-select lui-select-no-tag-tip"
            >
              <el-option
                v-for="d in dimOptions"
                :key="d"
                :label="d"
                :value="d"
              />
            </el-select>
          </el-form-item>
          <div v-if="!isViewMode" class="partition-dims-actions">
            <el-button size="small" type="primary" plain @click="importVisible = true">分区导入</el-button>
            <el-tooltip
              effect="dark"
              placement="top"
              content="在表格最后一行之后新增一条价格分区"
            >
              <span class="partition-dims-actions__btn-wrap">
                <el-button size="small" @click="addPartition">添加</el-button>
              </span>
            </el-tooltip>
            <el-tooltip
              effect="dark"
              placement="top"
              content="仅支持删除表格最后一行；至少保留一条分区"
            >
              <span class="partition-dims-actions__btn-wrap">
                <el-button
                  size="small"
                  :disabled="partitions.length <= 1"
                  @click="removeLastPartition"
                >删除</el-button>
              </span>
            </el-tooltip>
          </div>
        </el-form>
        <div class="table-h-scroll partition-table-wrap">
        <el-table
          :key="'partition-table-' + partitionTableKey"
          ref="partitionTable"
          :data="pagedPartitions"
          row-key="id"
          size="small"
          border
          class="partition-table quoting-data-table quoting-editable-table"
        >
          <el-table-column min-width="184">
            <template slot="header"><span class="th-required">价格分区名称</span></template>
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(row.name)"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="String(row.name || '-')"
              >
                <span class="view-plain-text cell-ellipsis" :class="{ 'is-truncated': needEllipsis(row.name) }">{{ displayText(row.name) }}</span>
              </el-tooltip>
              <el-input v-else v-model="row.name" size="small" placeholder="请输入" />
            </template>
          </el-table-column>
          <el-table-column v-if="isStats" min-width="184">
            <template slot="header"><span class="th-required">统计分组号</span></template>
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(row.statGroup)"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="String(row.statGroup || '-')"
              >
                <span class="view-plain-text cell-ellipsis" :class="{ 'is-truncated': needEllipsis(row.statGroup) }">{{ displayText(row.statGroup) }}</span>
              </el-tooltip>
              <el-input v-else v-model="row.statGroup" size="small" placeholder="请输入" />
            </template>
          </el-table-column>
          <el-table-column v-if="isStats" min-width="184">
            <template slot="header"><span class="th-required">计费和统计对象</span></template>
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(row.statBillingObject)"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="String(row.statBillingObject || '-')"
              >
                <span class="view-plain-text cell-ellipsis" :class="{ 'is-truncated': needEllipsis(row.statBillingObject) }">{{ displayText(row.statBillingObject) }}</span>
              </el-tooltip>
              <el-select v-else v-model="row.statBillingObject" size="small" clearable placeholder="请选择">
                <el-option label="统计+计费" value="统计+计费" />
                <el-option label="统计" value="统计" />
                <el-option label="计费" value="计费" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column min-width="184">
            <template slot="header"><span class="th-required">报价申请单号</span></template>
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(row.applyNo)"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="String(row.applyNo || '-')"
              >
                <span class="view-plain-text cell-ellipsis" :class="{ 'is-truncated': needEllipsis(row.applyNo) }">{{ displayText(row.applyNo) }}</span>
              </el-tooltip>
              <el-input v-else v-model="row.applyNo" size="small" placeholder="请输入" />
            </template>
          </el-table-column>
          <el-table-column min-width="184">
            <template slot="header"><span class="th-required">合同编码</span></template>
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(row.contractCode)"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="String(row.contractCode || '-')"
              >
                <span class="view-plain-text cell-ellipsis" :class="{ 'is-truncated': needEllipsis(row.contractCode) }">{{ displayText(row.contractCode) }}</span>
              </el-tooltip>
              <el-input v-else v-model="row.contractCode" size="small" placeholder="请输入" />
            </template>
          </el-table-column>
          <el-table-column label="始发地" min-width="208">
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(formatAddressLine(row.fromAddress))"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="formatAddressLine(row.fromAddress)"
              >
                <span
                  class="addr-view-text cell-ellipsis"
                  :class="{ 'is-truncated': needEllipsis(formatAddressLine(row.fromAddress)) }"
                >{{ displayText(formatAddressLine(row.fromAddress)) }}</span>
              </el-tooltip>
              <el-tooltip
                v-else
                effect="dark"
                placement="top"
                :disabled="!(row.fromAddress && row.fromAddress.length)"
                :open-delay="200"
                popper-class="addr-hover-tip"
              >
                <div slot="content" class="addr-hover-tip__list">
                  <p
                    v-for="(item, idx) in (row.fromAddress || [])"
                    :key="'from-tip-' + idx"
                    class="addr-hover-tip__item"
                  >{{ fullAddressLabel(item) }}</p>
                </div>
                <div
                  class="addr-select"
                  :class="{ 'is-empty': !(row.fromAddress && row.fromAddress.length) }"
                  @click="openAddressEditor(row, 'fromAddress')"
                >
                  <template v-if="row.fromAddress && row.fromAddress.length">
                    <el-tag
                      size="mini"
                      type="info"
                      effect="plain"
                      disable-transitions
                      class="addr-select__tag"
                      closable
                      @close.stop="removeAddressItem(row, 'fromAddress', 0)"
                    >{{ shortAddressLabel(row.fromAddress[0]) }}</el-tag>
                    <el-tag
                      v-if="row.fromAddress.length > 1"
                      size="mini"
                      type="info"
                      effect="plain"
                      disable-transitions
                      class="addr-select__more"
                    >+ {{ row.fromAddress.length - 1 }}</el-tag>
                  </template>
                  <span v-else class="addr-select__placeholder">请点击选择始发地</span>
                  <i class="el-icon-arrow-down addr-select__caret" />
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="目的地" min-width="208">
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(formatAddressLine(row.toAddress))"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="formatAddressLine(row.toAddress)"
              >
                <span
                  class="addr-view-text cell-ellipsis"
                  :class="{ 'is-truncated': needEllipsis(formatAddressLine(row.toAddress)) }"
                >{{ displayText(formatAddressLine(row.toAddress)) }}</span>
              </el-tooltip>
              <el-tooltip
                v-else
                effect="dark"
                placement="top"
                :disabled="!(row.toAddress && row.toAddress.length)"
                :open-delay="200"
                popper-class="addr-hover-tip"
              >
                <div slot="content" class="addr-hover-tip__list">
                  <p
                    v-for="(item, idx) in (row.toAddress || [])"
                    :key="'to-tip-' + idx"
                    class="addr-hover-tip__item"
                  >{{ fullAddressLabel(item) }}</p>
                </div>
                <div
                  class="addr-select"
                  :class="{ 'is-empty': !(row.toAddress && row.toAddress.length) }"
                  @click="openAddressEditor(row, 'toAddress')"
                >
                  <template v-if="row.toAddress && row.toAddress.length">
                    <el-tag
                      size="mini"
                      type="info"
                      effect="plain"
                      disable-transitions
                      class="addr-select__tag"
                      closable
                      @close.stop="removeAddressItem(row, 'toAddress', 0)"
                    >{{ shortAddressLabel(row.toAddress[0]) }}</el-tag>
                    <el-tag
                      v-if="row.toAddress.length > 1"
                      size="mini"
                      type="info"
                      effect="plain"
                      disable-transitions
                      class="addr-select__more"
                    >+ {{ row.toAddress.length - 1 }}</el-tag>
                  </template>
                  <span v-else class="addr-select__placeholder">请点击选择目的地</span>
                  <i class="el-icon-arrow-down addr-select__caret" />
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column v-if="selectedDims.includes('费用项')" min-width="184">
            <template slot="header"><span class="th-required">费用项</span></template>
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(feeItemLabel(row.feeItem))"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="feeItemLabel(row.feeItem)"
              >
                <span class="view-plain-text cell-ellipsis" :class="{ 'is-truncated': needEllipsis(feeItemLabel(row.feeItem)) }">{{ displayText(feeItemLabel(row.feeItem)) }}</span>
              </el-tooltip>
              <div v-else class="lui-field" :class="{ 'is-error': rowFieldError(row, 'feeItem') }">
                <el-select
                  v-model="row.feeItem"
                  size="small"
                  clearable
                  filterable
                  allow-create
                  placeholder="请选择"
                  :class="{ 'is-error': rowFieldError(row, 'feeItem') }"
                  @change="clearRowFieldError(row, 'feeItem')"
                >
                  <el-option
                    v-for="f in scenarioFeeItemOptions"
                    :key="f.value"
                    :label="f.label"
                    :value="f.value"
                  />
                </el-select>
                <lui-field-error overlay :message="rowFieldError(row, 'feeItem')" />
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="selectedDims.includes('商家订单类型')" label="商家订单类型" min-width="184">
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(row.orderType)"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="String(row.orderType || '-')"
              >
                <span class="view-plain-text cell-ellipsis" :class="{ 'is-truncated': needEllipsis(row.orderType) }">{{ displayText(row.orderType) }}</span>
              </el-tooltip>
              <el-select v-else v-model="row.orderType" size="small" clearable placeholder="请选择">
                <el-option label="普通订单" value="普通订单" />
                <el-option label="特殊订单" value="特殊订单" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column v-if="selectedDims.includes('配送类型')" label="配送类型" min-width="184">
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(row.deliveryType)"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="String(row.deliveryType || '-')"
              >
                <span class="view-plain-text cell-ellipsis" :class="{ 'is-truncated': needEllipsis(row.deliveryType) }">{{ displayText(row.deliveryType) }}</span>
              </el-tooltip>
              <el-select v-else v-model="row.deliveryType" size="small" clearable placeholder="请选择">
                <el-option label="快递" value="快递" />
                <el-option label="快运" value="快运" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column v-if="selectedDims.includes('正逆向')" label="正逆向" min-width="184">
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(row.direction)"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="String(row.direction || '-')"
              >
                <span class="view-plain-text cell-ellipsis" :class="{ 'is-truncated': needEllipsis(row.direction) }">{{ displayText(row.direction) }}</span>
              </el-tooltip>
              <el-select v-else v-model="row.direction" size="small" clearable placeholder="请选择">
                <el-option label="正向" value="正向" />
                <el-option label="逆向" value="逆向" />
              </el-select>
            </template>
          </el-table-column>
        </el-table>
        </div>
        <div class="pager partition-pager">
          <span>共 {{ partitions.length }} 条</span>
          <el-pagination
            layout="prev, pager, next, sizes, jumper"
            :total="partitions.length"
            :current-page="partitionPage"
            :page-size="partitionPageSize"
            :page-sizes="[10, 20, 50]"
            @size-change="onPartitionSizeChange"
            @current-change="onPartitionPageChange"
          />
        </div>
      </div>

      <!-- Step 3 报价明细 -->
      <div v-show="showSection('detail', 2)" class="quoting-section">
        <h3 class="section-title">报价明细配置</h3>
        <!-- 编辑：参数表单；预览：仅分区筛选，其余字段并入表格 -->
        <div class="detail-meta-bar" :class="{ 'detail-meta-bar--view-filter': isViewMode }">
          <el-form
            :model="currentDetail"
            class="lui-form-grid detail-meta-form"
            :class="{ 'detail-meta-form--view-filter': isViewMode }"
            label-width="120px"
            size="small"
          >
            <el-form-item
              v-if="isViewMode || partitions.length > 1"
              label="选择配置分区"
              :required="!isViewMode && partitions.length > 1"
              :class="{ 'detail-partition-filter-item': isViewMode }"
            >
              <el-select
                v-model="activePartitionId"
                class="detail-partition-filter"
                :clearable="!isViewMode"
                placeholder="请选择分区"
                :class="{ 'is-error': detailFieldErrors.activePartitionId }"
                @change="clearDetailFieldError('activePartitionId')"
              >
                <el-option
                  v-for="p in partitions"
                  :key="String(p.id)"
                  :label="p.name || '未命名分区'"
                  :value="String(p.id)"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-else-if="!isViewMode" label="配置分区">
              <span class="view-plain-text detail-meta-partition-text">{{ activePartitionName }}</span>
            </el-form-item>
            <template v-if="!isViewMode">
              <el-form-item v-if="showStatTarget" label="统计对象" required :class="{ 'is-error': detailFieldErrors.statTarget }">
                <el-select
                  v-model="currentDetail.statTarget"
                  clearable
                  placeholder="请选择"
                  :class="{ 'is-error': detailFieldErrors.statTarget }"
                  @change="clearDetailFieldError('statTarget')"
                >
                  <el-option label="月度单量" value="月度单量" />
                  <el-option label="月度金额" value="月度金额" />
                </el-select>
                <lui-field-error :message="detailFieldErrors.statTarget" />
              </el-form-item>
              <el-form-item label="单票阶梯模式" required :class="{ 'is-error': detailFieldErrors.stairMode }">
                <el-select
                  v-model="currentDetail.stairMode"
                  clearable
                  placeholder="请选择"
                  :class="{ 'is-error': detailFieldErrors.stairMode }"
                  @change="clearDetailFieldError('stairMode')"
                >
                  <el-option label="计费重量" value="计费重量" />
                  <el-option label="体积" value="体积" />
                  <el-option label="无" value="无" />
                </el-select>
                <lui-field-error :message="detailFieldErrors.stairMode" />
              </el-form-item>
              <el-form-item v-if="showStairColumns" label="阶梯累进" required :class="{ 'is-error': detailFieldErrors.stairProgress }">
                <el-select
                  v-model="currentDetail.stairProgress"
                  clearable
                  placeholder="请选择"
                  :class="{ 'is-error': detailFieldErrors.stairProgress }"
                  @change="clearDetailFieldError('stairProgress')"
                >
                  <el-option label="全量累进" value="全量累进" />
                  <el-option label="超量累进" value="超量累进" />
                </el-select>
                <lui-field-error :message="detailFieldErrors.stairProgress" />
              </el-form-item>
              <el-form-item v-if="showStairColumns" label="区间开闭类型" required :class="{ 'is-error': detailFieldErrors.intervalType }">
                <el-select
                  v-model="currentDetail.intervalType"
                  clearable
                  placeholder="请选择"
                  :class="{ 'is-error': detailFieldErrors.intervalType }"
                  @change="clearDetailFieldError('intervalType')"
                >
                  <el-option label="前开后闭" value="前开后闭" />
                  <el-option label="前闭后开" value="前闭后开" />
                </el-select>
                <lui-field-error :message="detailFieldErrors.intervalType" />
              </el-form-item>
              <el-form-item v-if="showBusinessCarry" label="业务进位" required :class="{ 'is-error': detailFieldErrors.businessCarry }">
                <el-select
                  v-model="currentDetail.businessCarry"
                  clearable
                  placeholder="请选择"
                  :class="{ 'is-error': detailFieldErrors.businessCarry }"
                  @change="clearDetailFieldError('businessCarry')"
                >
                  <el-option label="0.5 进位" value="0.5 进位" />
                  <el-option label="四舍五入取整" value="四舍五入取整" />
                </el-select>
                <lui-field-error :message="detailFieldErrors.businessCarry" />
              </el-form-item>
              <el-form-item v-if="currentDetail.stairMode === '计费重量'" label="轻抛系数" required :class="{ 'is-error': detailFieldErrors.lightThrow }">
                <el-input
                  :value="currentDetail.lightThrow"
                  placeholder="请输入"
                  :class="{ 'is-error': detailFieldErrors.lightThrow }"
                  @input="onDecimalInput(currentDetail, 'lightThrow', $event, 'lightThrowError'); clearDetailFieldError('lightThrow')"
                />
                <lui-field-error :message="detailFieldErrors.lightThrow" />
              </el-form-item>
              <el-form-item class="detail-meta-actions-item">
                <div class="detail-table-actions">
                  <el-button size="small" type="primary" plain @click="detailImportVisible = true">导入报价明细</el-button>
                  <el-tooltip
                    effect="dark"
                    placement="top"
                    content="在表格最后一行之后新增一条明细"
                  >
                    <span class="detail-table-actions__btn-wrap">
                      <el-button size="small" @click="addStairRow">添加</el-button>
                    </span>
                  </el-tooltip>
                  <el-tooltip
                    effect="dark"
                    placement="top"
                    content="仅支持删除表格最后一行；至少保留一条明细"
                  >
                    <span class="detail-table-actions__btn-wrap">
                      <el-button
                        size="small"
                        :disabled="currentDetail.rows.length <= 1"
                        @click="removeLastStairRow"
                      >删除</el-button>
                    </span>
                  </el-tooltip>
                </div>
              </el-form-item>
            </template>
          </el-form>
        </div>
        <div class="table-h-scroll detail-table-wrap" :class="{ 'detail-table-wrap--view': isViewMode }">
        <el-table
          :key="'detail-stair-' + activePartitionId + '-' + detailTableKey + (isViewMode ? '-view' : '')"
          ref="detailStairTable"
          :data="pagedDetailRows"
          row-key="id"
          size="small"
          border
          :max-height="isViewMode ? null : 480"
          class="partition-table detail-stair-table quoting-data-table quoting-editable-table"
        >
          <!-- 预览：分区级参数并入表格，切换分区后随 currentDetail 刷新 -->
          <el-table-column v-if="isViewMode && showStatTarget" label="统计对象" min-width="184">
            <template slot-scope>
              <span class="view-plain-text cell-ellipsis">{{ displayText(currentDetail.statTarget) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isViewMode" label="单票阶梯模式" min-width="184">
            <template slot-scope>
              <span class="view-plain-text cell-ellipsis">{{ displayText(currentDetail.stairMode) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isViewMode && showStairColumns" label="阶梯累进" min-width="184">
            <template slot-scope>
              <span class="view-plain-text cell-ellipsis">{{ displayText(currentDetail.stairProgress) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isViewMode && showStairColumns" label="区间开闭类型" min-width="184">
            <template slot-scope>
              <span class="view-plain-text cell-ellipsis">{{ displayText(currentDetail.intervalType) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isViewMode && showBusinessCarry" label="业务进位" min-width="184">
            <template slot-scope>
              <span class="view-plain-text cell-ellipsis">{{ displayText(currentDetail.businessCarry) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isViewMode && currentDetail.stairMode === '计费重量'" label="轻抛系数" min-width="184">
            <template slot-scope>
              <span class="view-plain-text cell-ellipsis">{{ displayText(currentDetail.lightThrow) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="showStatColumns" min-width="184">
            <template slot="header"><span :class="{ 'th-required': !isViewMode }">统计最小值(不含)</span></template>
            <template slot-scope="{ row }">
              <span v-if="isViewMode" class="view-plain-text">{{ row.statMin === 0 || row.statMin ? row.statMin : '-' }}</span>
              <div v-else class="lui-field" :class="{ 'is-error': rowFieldError(row, 'statMin') }">
                <el-input
                  :value="row.statMin"
                  size="small"
                  class="detail-stair-control"
                  :class="{ 'is-error': rowFieldError(row, 'statMin') }"
                  @input="onDecimalInput(row, 'statMin', $event); clearRowFieldError(row, 'statMin')"
                />
                <lui-field-error overlay :message="rowFieldError(row, 'statMin')" />
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="showStatColumns" min-width="184">
            <template slot="header"><span :class="{ 'th-required': !isViewMode }">统计最大值(含)</span></template>
            <template slot-scope="{ row }">
              <span v-if="isViewMode" class="view-plain-text">{{ row.statMax === 0 || row.statMax ? row.statMax : '-' }}</span>
              <div v-else class="lui-field" :class="{ 'is-error': rowFieldError(row, 'statMax') }">
                <el-input
                  :value="row.statMax"
                  size="small"
                  class="detail-stair-control"
                  :class="{ 'is-error': rowFieldError(row, 'statMax') }"
                  @input="onDecimalInput(row, 'statMax', $event); clearRowFieldError(row, 'statMax')"
                />
                <lui-field-error overlay :message="rowFieldError(row, 'statMax')" />
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="showStairColumns" min-width="184">
            <template slot="header"><span :class="{ 'th-required': !isViewMode }">单票阶梯最小值(不含)</span></template>
            <template slot-scope="{ row }">
              <span v-if="isViewMode" class="view-plain-text">{{ row.stairMin === 0 || row.stairMin ? row.stairMin : '-' }}</span>
              <div v-else class="lui-field" :class="{ 'is-error': rowFieldError(row, 'stairMin') }">
                <el-input
                  :value="row.stairMin"
                  size="small"
                  class="detail-stair-control"
                  :class="{ 'is-error': rowFieldError(row, 'stairMin') }"
                  @input="onDecimalInput(row, 'stairMin', $event); clearRowFieldError(row, 'stairMin')"
                />
                <lui-field-error overlay :message="rowFieldError(row, 'stairMin')" />
              </div>
            </template>
          </el-table-column>
          <el-table-column v-if="showStairColumns" min-width="184">
            <template slot="header"><span :class="{ 'th-required': !isViewMode }">单票阶梯最大值(含)</span></template>
            <template slot-scope="{ row }">
              <span v-if="isViewMode" class="view-plain-text">{{ row.stairMax || '-' }}</span>
              <div v-else class="lui-field" :class="{ 'is-error': rowFieldError(row, 'stairMax') }">
                <el-input
                  :value="row.stairMax"
                  size="small"
                  class="detail-stair-control"
                  :class="{ 'is-error': rowFieldError(row, 'stairMax') }"
                  @input="onStairMaxInput(row, $event); clearRowFieldError(row, 'stairMax')"
                />
                <lui-field-error overlay :message="rowFieldError(row, 'stairMax')" />
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="184">
            <template slot="header"><span :class="{ 'th-required': !isViewMode }">折扣模式</span></template>
            <template slot-scope="{ row }">
              <span v-if="isViewMode" class="view-plain-text cell-ellipsis">{{ displayText(row.discountMode) }}</span>
              <div v-else class="lui-field" :class="{ 'is-error': rowFieldError(row, 'discountMode') }">
                <el-select
                  v-model="row.discountMode"
                  size="small"
                  clearable
                  placeholder="请选择"
                  class="detail-stair-control"
                  :class="{ 'is-error': rowFieldError(row, 'discountMode') }"
                  @change="clearRowFieldError(row, 'discountMode')"
                >
                  <el-option label="折扣率" value="折扣率" />
                  <el-option label="一口价" value="一口价" />
                  <el-option label="首续重报价" value="首续重报价" />
                </el-select>
                <lui-field-error overlay :message="rowFieldError(row, 'discountMode')" />
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="480">
            <template slot="header"><span :class="{ 'th-required': !isViewMode }">报价明细</span></template>
            <template slot-scope="{ row }">
              <el-tooltip
                v-if="isViewMode"
                :disabled="!needEllipsis(formatDiscountDetailView(row))"
                placement="top"
                effect="dark"
                :open-delay="200"
                :content="formatDiscountDetailView(row)"
              >
                <span
                  class="view-plain-text cell-ellipsis"
                  :class="{ 'is-truncated': needEllipsis(formatDiscountDetailView(row)) }"
                >{{ displayText(formatDiscountDetailView(row)) }}</span>
              </el-tooltip>
              <div v-else-if="row.discountMode === '首续重报价'" class="detail-first-continue">
                <div class="detail-first-continue__item">
                  <span class="detail-first-continue__label">首重:</span>
                  <el-input
                    :value="row.firstWeight"
                    size="small"
                    class="detail-stair-control detail-stair-control--sm"
                    :class="{ 'is-error': rowFieldError(row, 'firstWeight') }"
                    @input="onDecimalInput(row, 'firstWeight', $event); clearRowFieldError(row, 'firstWeight')"
                  />
                </div>
                <div class="detail-first-continue__item">
                  <span class="detail-first-continue__label">首重价格:</span>
                  <el-input
                    :value="row.firstWeightPrice"
                    size="small"
                    class="detail-stair-control detail-stair-control--sm"
                    :class="{ 'is-error': rowFieldError(row, 'firstWeightPrice') }"
                    @input="onDecimalInput(row, 'firstWeightPrice', $event); clearRowFieldError(row, 'firstWeightPrice')"
                  />
                </div>
                <div class="detail-first-continue__item">
                  <span class="detail-first-continue__label">续重公斤:</span>
                  <el-input
                    :value="row.continueWeight"
                    size="small"
                    class="detail-stair-control detail-stair-control--sm"
                    :class="{ 'is-error': rowFieldError(row, 'continueWeight') }"
                    @input="onDecimalInput(row, 'continueWeight', $event); clearRowFieldError(row, 'continueWeight')"
                  />
                </div>
                <div class="detail-first-continue__item">
                  <span class="detail-first-continue__label">续重价格:</span>
                  <el-input
                    :value="row.continueWeightPrice"
                    size="small"
                    class="detail-stair-control detail-stair-control--sm"
                    :class="{ 'is-error': rowFieldError(row, 'continueWeightPrice') }"
                    @input="onDecimalInput(row, 'continueWeightPrice', $event); clearRowFieldError(row, 'continueWeightPrice')"
                  />
                </div>
                <div class="detail-first-continue__item">
                  <span class="detail-first-continue__label">轻抛系数:</span>
                  <el-input
                    :value="row.rowLightThrow"
                    size="small"
                    class="detail-stair-control detail-stair-control--sm"
                    @input="onDecimalInput(row, 'rowLightThrow', $event)"
                  />
                </div>
              </div>
              <div
                v-else
                class="detail-value-cell lui-field"
                :class="{
                  'detail-value-cell--unit': row.discountMode === '折扣率',
                  'is-error': rowFieldError(row, 'discountDetail')
                }"
              >
                <el-input
                  :value="row.discountDetail"
                  size="small"
                  class="detail-stair-control"
                  :class="{
                    'detail-stair-control--unit': row.discountMode === '折扣率',
                    'is-error': rowFieldError(row, 'discountDetail')
                  }"
                  placeholder="请输入数值"
                  @input="onDecimalInput(row, 'discountDetail', $event); clearRowFieldError(row, 'discountDetail')"
                >
                  <template v-if="row.discountMode === '折扣率'" slot="suffix">
                    <span class="detail-input-unit">%</span>
                  </template>
                </el-input>
                <lui-field-error overlay :message="rowFieldError(row, 'discountDetail')" />
              </div>
            </template>
          </el-table-column>
        </el-table>
        </div>
        <div class="pager detail-pager">
          <span>共 {{ currentDetail.rows.length }} 条</span>
          <el-pagination
            layout="prev, pager, next, sizes, jumper"
            :total="currentDetail.rows.length"
            :current-page="detailPage"
            :page-size="detailPageSize"
            :page-sizes="[10, 20, 50]"
            @size-change="onDetailSizeChange"
            @current-change="onDetailPageChange"
          />
        </div>
      </div>

      <!-- 报价拓展规则：向导跟明细同一步；预览独立 Tab -->
      <div v-show="showSection('extension', 2)" class="quoting-section">
        <h3
          class="section-title"
          :class="{ 'section-title--module': !isViewMode }"
        >报价拓展规则</h3>
        <div v-if="showMergeRules" class="ext-block ext-block--plain">
          <div class="ext-block__title">合单规则</div>
          <el-form class="lui-form-grid ext-rule-form" size="small">
            <el-form-item label="合单维度">
              <div v-if="isViewMode" class="dims-readonly">
                <el-tag
                  v-for="item in extension.mergeDimensions"
                  :key="'md-' + item"
                  size="small"
                  type="info"
                  effect="plain"
                  class="dims-readonly__tag"
                >{{ item }}</el-tag>
                <span v-if="!(extension.mergeDimensions && extension.mergeDimensions.length)" class="view-plain-text">-</span>
              </div>
              <el-select v-else v-model="extension.mergeDimensions" multiple collapse-tags clearable placeholder="取自场景定价" class="lui-select-no-tag-tip">
                <el-option v-for="item in mergeDimOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="合单对象">
              <div v-if="isViewMode" class="dims-readonly">
                <el-tag
                  v-for="item in extension.mergeTargets"
                  :key="'mt-' + item"
                  size="small"
                  type="info"
                  effect="plain"
                  class="dims-readonly__tag"
                >{{ item }}</el-tag>
                <span v-if="!(extension.mergeTargets && extension.mergeTargets.length)" class="view-plain-text">-</span>
              </div>
              <el-select v-else v-model="extension.mergeTargets" multiple collapse-tags clearable placeholder="含票量扩展" class="lui-select-no-tag-tip">
                <el-option v-for="item in mergeTargetOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="分摊依据">
              <div v-if="isViewMode" class="dims-readonly">
                <el-tag
                  v-for="item in extension.apportionBasis"
                  :key="'ab-' + item"
                  size="small"
                  type="info"
                  effect="plain"
                  class="dims-readonly__tag"
                >{{ item }}</el-tag>
                <span v-if="!(extension.apportionBasis && extension.apportionBasis.length)" class="view-plain-text">-</span>
              </div>
              <el-select v-else v-model="extension.apportionBasis" multiple collapse-tags clearable placeholder="取自场景定价" class="lui-select-no-tag-tip">
                <el-option v-for="item in apportionOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div v-if="showStatRules" class="ext-block ext-block--plain">
          <el-form class="lui-form-grid ext-rule-form" size="small">
            <el-form-item label="统计维度">
              <div v-if="isViewMode" class="dims-readonly">
                <el-tag
                  v-for="item in extension.statDimensions"
                  :key="'sd-' + item"
                  size="small"
                  type="info"
                  effect="plain"
                  class="dims-readonly__tag"
                >{{ item }}</el-tag>
                <span v-if="!(extension.statDimensions && extension.statDimensions.length)" class="view-plain-text">-</span>
              </div>
              <el-select v-else v-model="extension.statDimensions" multiple collapse-tags clearable placeholder="取自场景定价" class="lui-select-no-tag-tip">
                <el-option v-for="item in statDimOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="统计对象">
              <div v-if="isViewMode" class="dims-readonly">
                <el-tag
                  v-for="item in extension.statTargets"
                  :key="'st-' + item"
                  size="small"
                  type="info"
                  effect="plain"
                  class="dims-readonly__tag"
                >{{ item }}</el-tag>
                <span v-if="!(extension.statTargets && extension.statTargets.length)" class="view-plain-text">-</span>
              </div>
              <el-select v-else v-model="extension.statTargets" multiple collapse-tags clearable placeholder="取自场景定价" class="lui-select-no-tag-tip">
                <el-option v-for="item in statTargetOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <div v-if="!showMergeRules && !showStatRules" class="field-tip">当前计费策略无需配置拓展规则。</div>
      </div>

      <!-- Step 4 测算 -->
      <div v-show="!isViewMode && step === 3" class="quoting-section">
        <div class="sim-card">
          <h3 class="section-title">测算参数配置</h3>
          <el-form class="lui-form-grid sim-param-config-form" size="small">
            <el-form-item label="测算类型" required>
              <el-radio-group v-model="sim.type" @change="onSimTypeChange">
                <el-radio label="虚单">虚单测算</el-radio>
                <el-radio label="实单">实单测算</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="报价分区" required>
              <el-select v-model="sim.partitionId" clearable placeholder="选择价格分区后带出明细" @change="onSimPartitionChange">
                <el-option
                  v-for="p in partitions"
                  :key="String(p.id)"
                  :label="p.name || '未命名分区'"
                  :value="String(p.id)"
                />
              </el-select>
            </el-form-item>
            <template v-if="sim.type === '实单'">
              <el-form-item label="运单号" required>
                <el-input v-model="sim.orderNo" placeholder="输入真实运单号验证计费结果" />
              </el-form-item>
            </template>
            <template v-else>
              <el-form-item label="重量(kg)">
                <el-input v-model="sim.weight" placeholder="请输入重量" />
              </el-form-item>
              <el-form-item label="体积(m³)">
                <el-input v-model="sim.volume" placeholder="请输入体积" />
              </el-form-item>
              <el-form-item label="统计业务量">
                <el-input v-model="sim.businessVolume" placeholder="如月度单量" />
              </el-form-item>
            </template>
            <el-form-item class="sim-run-item">
              <el-button type="primary" size="small" @click="runSim">开始测算</el-button>
            </el-form-item>
          </el-form>
          <div v-if="sim.partitionId && simDetailPreview" class="sim-detail-preview">
            <div class="sim-detail-preview__meta">
              <span>当前分区：{{ simDetailPreview.name }}</span>
              <span v-if="showStatTarget">统计对象：{{ simDetailPreview.statTarget }}</span>
              <span>单票阶梯：{{ simDetailPreview.stairMode }}</span>
              <span>区间开闭：{{ simDetailPreview.intervalType }}</span>
            </div>
            <el-table :data="pagedSimDetailRows" size="mini">
              <el-table-column v-if="showStatColumns" prop="statMin" label="统计最小" min-width="80" />
              <el-table-column v-if="showStatColumns" prop="statMax" label="统计最大" min-width="80" />
              <el-table-column prop="stairMin" label="阶梯最小" min-width="80" />
              <el-table-column prop="stairMax" label="阶梯最大" min-width="80" />
              <el-table-column prop="discountMode" label="折扣模式" min-width="90" />
              <el-table-column prop="discountDetail" label="明细" min-width="80" />
            </el-table>
            <div v-if="simDetailRowTotal > 10" class="pager sim-detail-pager">
              <span>共 {{ simDetailRowTotal }} 条</span>
              <el-pagination
                layout="prev, pager, next"
                :total="simDetailRowTotal"
                :current-page="simDetailPage"
                :page-size="10"
                @current-change="onSimDetailPageChange"
              />
            </div>
          </div>
          <div v-if="sim.result" class="sim-result">
            <div class="sim-result__head">
              <span class="sim-result__title">测算结果</span>
            </div>
            <div class="sim-result__amount-row">
              <span class="sim-result__amount-label">预估总金额:</span>
              <span class="sim-result__currency">¥</span>
              <span class="sim-result__amount">{{ sim.result.total }}</span>
            </div>
            <div class="sim-result__process">
              <span class="sim-result__process-label">计算过程：</span>
              <span class="sim-result__process-text">{{ sim.result.formula }}</span>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>

      <div v-if="!(isViewMode && embedded)" class="wizard-footer">
        <template v-if="isViewMode">
          <el-button size="small" type="primary" @click="$emit('back')">关闭</el-button>
        </template>
        <template v-else>
          <el-button size="small" :disabled="step === 0" @click="step -= 1">上一步</el-button>
          <el-button v-if="step < 3" type="primary" size="small" @click="nextStep">
            {{ step === 2 ? '下一步，报价测算' : '下一步' }}
          </el-button>
          <template v-else>
            <el-button type="primary" size="small" @click="submitQuote">完成并发布</el-button>
          </template>
        </template>
      </div>
    </div>

    <AddressEditorModal
      :visible.sync="addressEditor.visible"
      :title="addressEditor.title"
      :value="addressEditor.value"
      @confirm="onAddressConfirm"
    />

    <el-dialog
      title="分区导入"
      :visible.sync="importVisible"
      width="480px"
      custom-class="lui-form-dialog lui-dialog--sm lui-upload-dialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="lui-upload-panel">
        <el-upload drag action="#" :auto-upload="false" accept=".xlsx,.xls" class="lui-upload-drag">
          <img class="lui-upload-drag__icon" :src="uploadIcon" alt="" width="40" height="40">
          <div class="el-upload__text">将 Excel 模板拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip">支持扩展名：.xlsx / .xls；单次建议不超过 10000 行</div>
        </el-upload>
        <div class="lui-upload-drag__extra">
          <el-button type="text" class="lui-upload-drag__link" @click="downloadPartitionTemplate">下载导入模板</el-button>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="importVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="mockImport">确认导入</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="导入报价明细"
      :visible.sync="detailImportVisible"
      width="480px"
      custom-class="lui-form-dialog lui-dialog--sm lui-upload-dialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <div class="lui-upload-panel">
        <el-upload drag action="#" :auto-upload="false" accept=".xlsx,.xls" class="lui-upload-drag">
          <img class="lui-upload-drag__icon" :src="uploadIcon" alt="" width="40" height="40">
          <div class="el-upload__text">将报价明细模板拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip">支持扩展名：.xlsx / .xls；请按模板列顺序填写后上传</div>
        </el-upload>
        <div class="lui-upload-drag__extra">
          <el-button type="text" class="lui-upload-drag__link" @click="downloadDetailTemplate">下载导入模板</el-button>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="detailImportVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="detailImportVisible = false; $message.success('明细导入成功（预览）')">确认导入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import LuiArrowSteps from '../components/LuiArrowSteps.vue'
import LuiFieldError from '../components/LuiFieldError.vue'
import AddressEditorModal from '../components/quoting/AddressEditorModal.vue'
import { DISCOUNT_PRODUCT_SCENARIOS } from '../mock/cascade'
import {
  SCENARIO_QUOTE_DIMS,
  getScenarioFeeItems,
  getScenarioFeeItemOptions,
  QUOTE_MERGE_DIM_OPTIONS,
  QUOTE_MERGE_TARGET_OPTIONS,
  QUOTE_APPORTION_OPTIONS,
  QUOTE_STAT_DIM_OPTIONS,
  QUOTE_STAT_TARGET_OPTIONS,
  SUBSTITUTE_MODE_RULES
} from '../mock/scenarioPricing'
import { validateScenarioFeeCoverage } from '../utils/scenarioQuoteValidate'
import { publicAsset } from '../utils/publicAsset'

const PARTITION_LIMIT = 10000

function createPartition(partial = {}) {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: '',
    applyNo: '',
    contractCode: '',
    statGroup: '',
    statBillingObject: '',
    fromAddress: [],
    toAddress: [],
    feeItem: '',
    orderType: '',
    deliveryType: '',
    direction: '',
    ...partial
  }
}

function createDetail() {
  return {
    stairMode: '计费重量',
    stairProgress: '全量累进',
    statTarget: '月度单量',
    intervalType: '前开后闭',
    businessCarry: '0.5 进位',
    lightThrow: '',
    rows: [{
      id: Date.now(),
      statMin: 0,
      statMax: 30,
      stairMin: 0,
      stairMax: '无穷大',
      discountMode: '折扣率',
      discountDetail: '100',
      firstWeight: '',
      firstWeightPrice: '',
      continueWeight: '',
      continueWeightPrice: '',
      rowLightThrow: ''
    }]
  }
}

export default {
  name: 'OnestopQuoting',
  components: { LuiArrowSteps, AddressEditorModal, LuiFieldError },
  props: {
    detailMode: {
      type: String,
      default: 'create'
    },
    embedded: {
      type: Boolean,
      default: false
    },
    sourceRow: {
      type: Object,
      default: null
    }
  },
  data() {
    const first = createPartition({
      name: '',
      applyNo: '',
      contractCode: '',
      feeItem: '运费'
    })
    return {
      step: 0,
      editingId: null,
      complexQuoteOpen: false,
      cycleError: '',
      lightThrowError: '',
      priorityError: '',
      fieldErrors: {},
      detailFieldErrors: {},
      quoteSteps: [
        { title: '基础信息' },
        { title: '价格分区' },
        { title: '报价明细' },
        { title: '报价测算' }
      ],
      viewTabs: [
        { key: 'base', title: '基础信息' },
        { key: 'partition', title: '价格分区' },
        { key: 'detail', title: '报价明细' },
        { key: 'extension', title: '报价拓展规则' }
      ],
      viewTab: 'base',
      base: {
        quotationName: '',
        merchantCode: '',
        merchantName: '',
        signRegion: '',
        effectiveRange: [],
        quotationMethod: '场景报价',
        discountProduct: '',
        businessScenario: '',
        settlementMethod: '月结',
        billingStrategy: '统计考核',
        statisticsMethod: '',
        assessmentStartMonth: '',
        amountRounding: '四舍五入取整',
        separateMerchantAccount: '否',
        hasIdentityPriority: '否',
        identityPriority: '',
        substituteModeRule: '',
        addressLevelMatch: '是',
        hasPricePriority: '否',
        pricePriority: '',
        isCrossMonth: '否',
        crossMonthPrev: '',
        crossMonthPrevDay: '',
        crossMonthCurrentDay: ''
      },
      dimOptions: SCENARIO_QUOTE_DIMS.slice(),
      selectedDims: [],
      partitions: [first],
      partitionPage: 1,
      partitionPageSize: 10,
      partitionTableKey: 0,
      detailPage: 1,
      detailPageSize: 10,
      detailTableKey: 0,
      detailMap: {},
      activePartitionId: String(first.id),
      mergeDimOptions: QUOTE_MERGE_DIM_OPTIONS.slice(),
      mergeTargetOptions: QUOTE_MERGE_TARGET_OPTIONS.slice(),
      apportionOptions: QUOTE_APPORTION_OPTIONS.slice(),
      statDimOptions: QUOTE_STAT_DIM_OPTIONS.slice(),
      statTargetOptions: QUOTE_STAT_TARGET_OPTIONS.slice(),
      substituteModeRules: SUBSTITUTE_MODE_RULES.slice(),
      extension: {
        mergeDimensions: [],
        mergeTargets: [],
        apportionBasis: [],
        statDimensions: [],
        statTargets: []
      },
      sim: {
        type: '虚单',
        partitionId: '',
        orderNo: '',
        weight: '2.5',
        volume: '',
        businessVolume: '',
        result: null
      },
      simDetailPage: 1,
      importVisible: false,
      detailImportVisible: false,
      addressEditor: {
        visible: false,
        title: '请选择地址',
        field: 'fromAddress',
        partitionId: null,
        value: []
      }
    }
  },
  created() {
    if (this.isViewMode || this.isEditMode) {
      this.hydrateFromRecord(this.sourceRow)
    }
  },
  watch: {
    step(val) {
      if (val === 1 || this.isViewMode) {
        this.$nextTick(() => this.layoutPartitionTable())
      }
      if (val === 2 || this.isViewMode) {
        this.$nextTick(() => this.layoutDetailStairTable())
      }
    },
    viewTab(val) {
      if (!this.isViewMode) return
      this.$nextTick(() => {
        if (val === 'partition') this.layoutPartitionTable()
        if (val === 'detail') this.layoutDetailStairTable()
      })
    },
    selectedDims() {
      this.partitionTableKey += 1
      this.$nextTick(() => {
        this.$nextTick(() => this.layoutPartitionTable())
      })
    },
    activePartitionId() {
      this.detailPage = 1
      this.detailTableKey += 1
      this.$nextTick(() => this.layoutDetailStairTable())
    },
    partitions: {
      handler() {
        this.clampPartitionPage()
      },
      deep: false
    },
    'currentDetail.rows.length'() {
      this.clampDetailPage()
    },
    'currentDetail.stairMode'() {
      this.detailTableKey += 1
      this.$nextTick(() => this.layoutDetailStairTable())
    }
  },
  computed: {
    isViewMode() {
      return this.detailMode === 'view'
    },
    isEditMode() {
      return this.detailMode === 'edit'
    },
    isCash() {
      return ['寄付现结', '到付现结'].includes(this.base.settlementMethod)
    },
    isStats() {
      return ['统计考核', '统计+合单'].includes(this.base.billingStrategy)
    },
    showStatTarget() {
      return this.isStats
    },
    showStatColumns() {
      return this.isStats
    },
    showStairColumns() {
      return this.currentDetail.stairMode && this.currentDetail.stairMode !== '无'
    },
    showBusinessCarry() {
      return ['计费重量', '体积'].includes(this.currentDetail.stairMode)
    },
    showMergeDims() {
      return ['合单计费', '统计+合单'].includes(this.base.billingStrategy)
    },
    showMergeRules() {
      return this.showMergeDims
    },
    showStatRules() {
      return this.isStats
    },
    scenarios() {
      return DISCOUNT_PRODUCT_SCENARIOS[this.base.discountProduct] || []
    },
    scenarioFeeOptions() {
      return getScenarioFeeItems(this.base.discountProduct, this.base.businessScenario)
    },
    scenarioFeeItemOptions() {
      return getScenarioFeeItemOptions(this.base.discountProduct, this.base.businessScenario)
    },
    simDetailPreview() {
      if (!this.sim.partitionId) return null
      const p = this.partitions.find(i => String(i.id) === String(this.sim.partitionId))
      if (!p) return null
      const detail = this.detailMap[String(p.id)] || createDetail()
      return {
        name: p.name || '未命名分区',
        statTarget: detail.statTarget,
        stairMode: detail.stairMode,
        intervalType: detail.intervalType,
        rows: (detail.rows || []).slice()
      }
    },
    simDetailRowTotal() {
      return (this.simDetailPreview && this.simDetailPreview.rows && this.simDetailPreview.rows.length) || 0
    },
    pagedSimDetailRows() {
      const rows = (this.simDetailPreview && this.simDetailPreview.rows) || []
      if (!rows.length) return []
      const size = 10
      const maxPage = Math.max(1, Math.ceil(rows.length / size))
      const page = Math.min(maxPage, Math.max(1, Number(this.simDetailPage) || 1))
      const start = (page - 1) * size
      return rows.slice(start, start + size)
    },
    uploadIcon() {
      return publicAsset('d2c-assets/icon-upload.svg')
    },
    activePartitionName() {
      const p = this.partitions.find(i => String(i.id) === String(this.activePartitionId))
      return (p && p.name) || '未命名分区'
    },
    currentDetail: {
      get() {
        const id = String(this.activePartitionId)
        if (!this.detailMap[id]) {
          this.$set(this.detailMap, id, createDetail())
        }
        return this.detailMap[id]
      }
    },
    pagedPartitions() {
      const list = Array.isArray(this.partitions) ? this.partitions : []
      if (!list.length) return []
      const size = Math.max(1, Number(this.partitionPageSize) || 10)
      const maxPage = Math.max(1, Math.ceil(list.length / size))
      const page = Math.min(maxPage, Math.max(1, Number(this.partitionPage) || 1))
      const start = (page - 1) * size
      const rows = list.slice(start, start + size)
      // 防御：页码异常导致空切片时回退首页，避免「共 N 条」却暂无数据
      return rows.length ? rows : list.slice(0, size)
    },
    pagedDetailRows() {
      const rows = (this.currentDetail && Array.isArray(this.currentDetail.rows))
        ? this.currentDetail.rows
        : []
      if (!rows.length) return []
      const size = Math.max(1, Number(this.detailPageSize) || 10)
      const maxPage = Math.max(1, Math.ceil(rows.length / size))
      const page = Math.min(maxPage, Math.max(1, Number(this.detailPage) || 1))
      const start = (page - 1) * size
      const pageRows = rows.slice(start, start + size)
      return pageRows.length ? pageRows : rows.slice(0, size)
    }
  },
  methods: {
    showSection(tabKey, stepIndex) {
      if (this.isViewMode) return this.viewTab === tabKey
      return this.step === stepIndex
    },
    onViewTabChange(key) {
      this.viewTab = key
    },
    isLastPartitionRow(row) {
      const last = this.partitions[this.partitions.length - 1]
      return !!(last && row && last.id === row.id)
    },
    isLastDetailRow(row) {
      const rows = (this.currentDetail && this.currentDetail.rows) || []
      const last = rows[rows.length - 1]
      return !!(last && row && last.id === row.id)
    },
    clampPartitionPage() {
      const size = Math.max(1, Number(this.partitionPageSize) || 10)
      const maxPage = Math.max(1, Math.ceil((this.partitions || []).length / size) || 1)
      const page = Math.max(1, Number(this.partitionPage) || 1)
      if (page !== this.partitionPage) this.partitionPage = page
      if (this.partitionPage > maxPage) this.partitionPage = maxPage
      if (Number(this.partitionPageSize) !== size) this.partitionPageSize = size
    },
    clampDetailPage() {
      const total = ((this.currentDetail && this.currentDetail.rows) || []).length
      const size = Math.max(1, Number(this.detailPageSize) || 10)
      const maxPage = Math.max(1, Math.ceil(total / size) || 1)
      const page = Math.max(1, Number(this.detailPage) || 1)
      if (page !== this.detailPage) this.detailPage = page
      if (this.detailPage > maxPage) this.detailPage = maxPage
      if (Number(this.detailPageSize) !== size) this.detailPageSize = size
    },
    onPartitionPageChange(page) {
      this.partitionPage = Math.max(1, Number(page) || 1)
      this.$nextTick(() => this.layoutPartitionTable())
    },
    onPartitionSizeChange(size) {
      this.partitionPageSize = Math.max(1, Number(size) || 10)
      this.partitionPage = 1
      this.$nextTick(() => this.layoutPartitionTable())
    },
    onDetailPageChange(page) {
      this.detailPage = Math.max(1, Number(page) || 1)
      this.$nextTick(() => this.layoutDetailStairTable())
    },
    onDetailSizeChange(size) {
      this.detailPageSize = Math.max(1, Number(size) || 10)
      this.detailPage = 1
      this.$nextTick(() => this.layoutDetailStairTable())
    },
    formatAddress(list) {
      if (!list || !list.length) return ''
      const short = list.map(item => this.shortAddressLabel(item))
      if (short.length <= 2) return short.join('、')
      return `${short.slice(0, 2).join('、')} 等${short.length}项`
    },
    formatAddressFull(list) {
      if (!list || !list.length) return ''
      return list.join('、')
    },
    /** 预览态：地址单行展示（截断由 displayText 处理） */
    formatAddressLine(list) {
      if (!list || !list.length) return '-'
      return list.map(item => this.shortAddressLabel(item)).join('、')
    },
    /** @deprecated 使用 formatAddressLine + displayText */
    formatAddressView(list) {
      return this.displayText(this.formatAddressLine(list))
    },
    needEllipsis(text) {
      const raw = text == null ? '' : String(text)
      return Array.from(raw).length > 16
    },
    displayText(text) {
      const raw = text == null || text === '' ? '' : String(text)
      if (!raw) return '-'
      const chars = Array.from(raw)
      if (chars.length <= 16) return raw
      return `${chars.slice(0, 16).join('')}...`
    },
    shortAddressLabel(value) {
      const s = String(value || '')
      const parts = s.split(/[-/]/).filter(Boolean)
      return parts.length ? parts[parts.length - 1] : s
    },
    /** 气泡：省-市-区-地址 完整层级 */
    fullAddressLabel(value) {
      const s = String(value || '').trim()
      if (!s) return '-'
      const parts = s.split(/[-/]/).filter(Boolean)
      return parts.length ? parts.join('-') : s
    },
    removeAddressItem(partition, field, index) {
      const list = (partition[field] || []).slice()
      if (index < 0 || index >= list.length) return
      list.splice(index, 1)
      this.$set(partition, field, list)
    },
    feeItemLabel(value) {
      if (!value) return '-'
      const hit = this.scenarioFeeItemOptions.find(f => f.value === value)
      return (hit && hit.label) || value
    },
    warnNonNumber() {
      this.$message.warning('仅支持输入数字')
    },
    onCycleIntInput(key, val) {
      const raw = val == null ? '' : String(val)
      const cleaned = raw.replace(/\D/g, '')
      if (raw && cleaned !== raw) {
        this.cycleError = '计费周期仅支持输入数字'
        this.warnNonNumber()
      } else if (cleaned) {
        this.cycleError = ''
      }
      this.$set(this.base, key, cleaned)
    },
    onIntFieldInput(target, key, val, errorKey) {
      const raw = val == null ? '' : String(val)
      const cleaned = raw.replace(/\D/g, '')
      if (raw && cleaned !== raw) {
        if (errorKey) this[errorKey] = '仅支持输入数字'
        this.warnNonNumber()
      } else if (errorKey) {
        this[errorKey] = ''
      }
      this.$set(target, key, cleaned)
    },
    onDecimalInput(target, key, val, errorKey) {
      const raw = val == null ? '' : String(val)
      let cleaned = raw.replace(/[^\d.]/g, '')
      const parts = cleaned.split('.')
      if (parts.length > 2) cleaned = `${parts[0]}.${parts.slice(1).join('')}`
      if (raw && cleaned !== raw) {
        if (errorKey) this[errorKey] = '仅支持输入数字'
        this.warnNonNumber()
      } else if (errorKey) {
        this[errorKey] = ''
      }
      this.$set(target, key, cleaned)
    },
    onStairMaxInput(row, val) {
      const raw = val == null ? '' : String(val)
      if (raw === '无穷大' || raw.indexOf('无穷') === 0) {
        this.$set(row, 'stairMax', '无穷大')
        return
      }
      this.onDecimalInput(row, 'stairMax', val)
    },
    openAddressEditor(partition, field) {
      this.addressEditor = {
        visible: true,
        title: field === 'fromAddress' ? '请选择始发地' : '请选择目的地',
        field,
        partitionId: partition.id,
        value: (partition[field] || []).slice()
      }
    },
    onAddressConfirm(list) {
      const p = this.partitions.find(i => i.id === this.addressEditor.partitionId)
      if (!p) return
      this.$set(p, this.addressEditor.field, list.slice())
    },
    switchQuoteMode(type) {
      // 产品报价本期不做，强制场景报价
      if (type !== '场景报价') type = '场景报价'
      if (this.base.quotationMethod === type) return
      this.base.quotationMethod = type
      this.base.businessScenario = ''
      this.selectedDims = []
      this.base.settlementMethod = '月结'
      this.base.billingStrategy = '统计考核'
      this.base.statisticsMethod = ''
      this.base.assessmentStartMonth = ''
      if (this.partitions[0] && !this.partitions[0].feeItem) {
        this.partitions[0].feeItem = '运费'
      }
      this.step = 0
      if (!this.activePartitionId && this.partitions[0]) {
        this.activePartitionId = String(this.partitions[0].id)
      }
    },
    onDiscountProductChange() {
      this.base.businessScenario = ''
    },
    onBusinessScenarioChange() {
      const fees = this.scenarioFeeOptions
      if (!fees.length || !this.partitions.length) return
      // 多费用项场景：为首个分区预填第一项，避免无法演示下一步；完整覆盖在提交时校验
      if (!this.partitions[0].feeItem) {
        this.partitions[0].feeItem = fees[0]
      }
    },
    resolveMerchantByCode(code) {
      const val = (code || '').trim()
      if (!val) {
        this.base.merchantName = ''
        this.base.signRegion = ''
        return false
      }
      // 预览：非空即视为档案校验通过并回填（对齐原型：输入即带出）
      this.base.merchantName = '京东自营测试客户（自动获取）'
      this.base.signRegion = '华北'
      return true
    },
    onMerchantCode(val) {
      this.resolveMerchantByCode(val)
    },
    onSettleChange(val) {
      if (['寄付现结', '到付现结'].includes(val)) {
        this.base.billingStrategy = '普通'
        this.base.statisticsMethod = ''
        this.base.assessmentStartMonth = ''
      }
    },
    onPricePriorityToggle(val) {
      if (val === '是' && !this.base.pricePriority) this.base.pricePriority = '1'
      if (val === '否') this.base.pricePriority = ''
    },
    onIdentityPriorityToggle(val) {
      if (val === '是') {
        if (!this.base.identityPriority) this.base.identityPriority = '1'
        if (!this.base.substituteModeRule) this.base.substituteModeRule = this.substituteModeRules[0] || ''
      } else {
        this.base.identityPriority = ''
        this.base.substituteModeRule = ''
      }
    },
    onCrossMonthToggle(val) {
      if (val === '否') {
        this.base.crossMonthPrev = ''
        this.base.crossMonthPrevDay = ''
        this.base.crossMonthCurrentDay = ''
        this.cycleError = ''
      }
    },
    onSimTypeChange() {
      this.sim.result = null
      if (this.sim.type === '虚单') this.sim.orderNo = ''
    },
    onSimPartitionChange() {
      this.sim.result = null
      this.simDetailPage = 1
    },
    onSimDetailPageChange(page) {
      this.simDetailPage = Math.max(1, Number(page) || 1)
    },
    isBlank(v) {
      return v === '' || v === null || v === undefined
    },
    clearFieldError(key) {
      if (this.fieldErrors && this.fieldErrors[key]) this.$delete(this.fieldErrors, key)
    },
    clearDetailFieldError(key) {
      if (this.detailFieldErrors && this.detailFieldErrors[key]) this.$delete(this.detailFieldErrors, key)
    },
    clearRowFieldError(row, key) {
      if (row && row._errors && row._errors[key]) this.$delete(row._errors, key)
    },
    rowFieldError(row, key) {
      return (row && row._errors && row._errors[key]) || ''
    },
    markStepFieldErrors(step) {
      const ERR = '请填写'
      if (step === 0) {
        const errors = {}
        if (this.complexQuoteOpen && this.base.hasIdentityPriority === '是') {
          if (!this.base.identityPriority) errors.identityPriority = ERR
          if (!this.base.substituteModeRule) errors.substituteModeRule = ERR
        }
        if (!this.base.quotationName) errors.quotationName = ERR
        if (!(this.base.merchantCode || '').trim()) errors.merchantCode = ERR
        if (!this.base.billingStrategy) errors.billingStrategy = ERR
        if (this.base.quotationMethod === '场景报价') {
          if (!this.base.discountProduct) errors.discountProduct = ERR
          if (!this.base.businessScenario) errors.businessScenario = ERR
        }
        this.fieldErrors = errors
        return
      }
      if (step === 1) {
        this.fieldErrors = {}
        ;(this.partitions || []).forEach((row) => {
          const pe = {}
          if (!(row.name || '').trim()) pe.name = ERR
          if (!(row.applyNo || '').trim()) pe.applyNo = ERR
          if (!(row.contractCode || '').trim()) pe.contractCode = ERR
          if (this.isStats) {
            if (!(row.statGroup || '').trim()) pe.statGroup = ERR
            if (!(row.statBillingObject || '').trim()) pe.statBillingObject = ERR
          }
          if (this.selectedDims.includes('费用项') && !(row.feeItem || '').trim()) pe.feeItem = ERR
          this.$set(row, '_errors', pe)
        })
        return
      }
      if (step === 2) {
        const de = {}
        if (!this.activePartitionId) de.activePartitionId = ERR
        const d = this.currentDetail || {}
        if (!d.stairMode) de.stairMode = ERR
        if (this.showStatTarget && !d.statTarget) de.statTarget = ERR
        if (this.showStairColumns) {
          if (!d.stairProgress) de.stairProgress = ERR
          if (!d.intervalType) de.intervalType = ERR
        }
        if (this.showBusinessCarry && !d.businessCarry) de.businessCarry = ERR
        if (d.stairMode === '计费重量' && this.isBlank(d.lightThrow)) de.lightThrow = ERR
        this.detailFieldErrors = de
        ;(d.rows || []).forEach((r) => {
          const re = {}
          if (this.showStatColumns) {
            if (this.isBlank(r.statMin)) re.statMin = ERR
            if (this.isBlank(r.statMax)) re.statMax = ERR
          }
          if (this.showStairColumns) {
            if (this.isBlank(r.stairMin)) re.stairMin = ERR
            if (this.isBlank(r.stairMax)) re.stairMax = ERR
          }
          if (!r.discountMode) re.discountMode = ERR
          if (r.discountMode === '首续重报价') {
            if (!r.firstWeight) re.firstWeight = ERR
            if (!r.firstWeightPrice) re.firstWeightPrice = ERR
            if (!r.continueWeight) re.continueWeight = ERR
            if (!r.continueWeightPrice) re.continueWeightPrice = ERR
          } else if (this.isBlank(r.discountDetail)) {
            re.discountDetail = ERR
          }
          this.$set(r, '_errors', re)
        })
      }
    },
        validateStep(step) {
      if (step === 0) {
        if (this.complexQuoteOpen && this.base.hasIdentityPriority === '是') {
          if (!this.base.identityPriority) return '请填写身份优先级'
          if (!this.base.substituteModeRule) return '请选择替核模式规则'
        }
        if (!this.base.quotationName) return '请填写报价方案名称'
        if (!(this.base.merchantCode || '').trim()) return '请填写商家编码'
        this.resolveMerchantByCode(this.base.merchantCode)
        if (!this.base.billingStrategy) return '请选择计费策略'
        if (this.base.quotationMethod === '场景报价') {
          if (!this.base.discountProduct) return '请选择折扣产品'
          if (!this.base.businessScenario) return '请选择业务场景'
        }
      }
      if (step === 1) {
        if (!this.partitions.length) return '请至少添加一个价格分区'
        if (this.partitions.length > PARTITION_LIMIT) return `分区数量超过上限 ${PARTITION_LIMIT}`
        const badName = this.partitions.find(p => !(p.name || '').trim())
        if (badName) return '请填写价格分区名称'
        const badApply = this.partitions.find(p => !(p.applyNo || '').trim())
        if (badApply) return '请填写报价申请单号'
        const badContract = this.partitions.find(p => !(p.contractCode || '').trim())
        if (badContract) return '请填写合同编码'
        if (this.isStats) {
          const badGroup = this.partitions.find(p => !(p.statGroup || '').trim())
          if (badGroup) return '请填写统计分组号'
          const badObj = this.partitions.find(p => !(p.statBillingObject || '').trim())
          if (badObj) return '请选择计费和统计对象'
        }
        if (this.selectedDims.includes('费用项')) {
          const badFee = this.partitions.find(p => !(p.feeItem || '').trim())
          if (badFee) return '请选择费用项'
        }
      }
      if (step === 2) {
        if (!this.activePartitionId) return '请选择配置分区'
        const d = this.currentDetail
        if (!d.stairMode) return '请选择单票阶梯模式'
        if (this.showStatTarget && !d.statTarget) return '请选择统计对象'
        if (this.showStairColumns) {
          if (!d.stairProgress) return '请选择阶梯累进'
          if (!d.intervalType) return '请选择区间开闭类型'
        }
        if (this.showBusinessCarry && !d.businessCarry) return '请选择业务进位'
        if (d.stairMode === '计费重量' && (d.lightThrow === '' || d.lightThrow == null)) {
          return '请填写轻抛系数'
        }
        const badRow = (d.rows || []).find(r => {
          if (this.showStatColumns) {
            if (r.statMin === '' || r.statMin == null) return true
            if (r.statMax === '' || r.statMax == null) return true
          }
          if (this.showStairColumns) {
            if (r.stairMin === '' || r.stairMin == null) return true
            if (r.stairMax === '' || r.stairMax == null) return true
          }
          if (!r.discountMode) return true
          if (r.discountMode === '首续重报价') {
            return !r.firstWeight || !r.firstWeightPrice || !r.continueWeight || !r.continueWeightPrice
          }
          return r.discountDetail === '' || r.discountDetail == null
        })
        if (badRow) return '请完善报价明细必填项'
      }
      return ''
    },
    nextStep() {
      const msg = this.validateStep(this.step)
      if (msg) {
        this.markStepFieldErrors(this.step)
        this.$message.warning(msg)
        return
      }
      this.fieldErrors = {}
      this.detailFieldErrors = {}
      this.step += 1
      if (!this.activePartitionId && this.partitions[0]) {
        this.activePartitionId = String(this.partitions[0].id)
      }
    },
    onStepChange(index) {
      if (index > this.step) {
        for (let s = this.step; s < index; s += 1) {
          const msg = this.validateStep(s)
          if (msg) {
            this.markStepFieldErrors(s)
            this.$message.warning(msg)
            return
          }
        }
      }
      this.step = index
      if (!this.activePartitionId && this.partitions[0]) {
        this.activePartitionId = String(this.partitions[0].id)
      }
    },
    addPartition() {
      if (this.partitions.length >= PARTITION_LIMIT) {
        this.$message.warning(`分区数量已达上限 ${PARTITION_LIMIT}`)
        return
      }
      const p = createPartition()
      this.partitions.push(p)
      this.activePartitionId = String(p.id)
      this.partitionPage = Math.ceil(this.partitions.length / this.partitionPageSize) || 1
      this.$nextTick(() => this.layoutPartitionTable())
    },
    removePartition(id) {
      if (this.partitions.length <= 1) return
      this.partitions = this.partitions.filter(p => p.id !== id)
      this.activePartitionId = String(this.partitions[0].id)
      this.clampPartitionPage()
      this.$nextTick(() => this.layoutPartitionTable())
    },
    removeLastPartition() {
      if (this.partitions.length <= 1) {
        this.$message.warning('至少保留一条价格分区')
        return
      }
      const last = this.partitions[this.partitions.length - 1]
      this.removePartition(last.id)
    },
    layoutPartitionTable() {
      const t = this.$refs.partitionTable
      if (t && typeof t.doLayout === 'function') t.doLayout()
    },
    mockImport() {
      this.partitions.push(createPartition({
        name: '导入分区-华东',
        applyNo: 'SQ-IMPORT-001',
        contractCode: 'HT-IMPORT-001',
        fromAddress: ['斜土路街道'],
        toAddress: ['深圳市']
      }))
      this.partitionPage = Math.ceil(this.partitions.length / this.partitionPageSize) || 1
      this.importVisible = false
      this.$message.success('分区导入成功（预览）')
      this.$nextTick(() => this.layoutPartitionTable())
    },
    downloadPartitionTemplate() {
      this.$message.info('已开始下载分区导入模板（预览）')
    },
    downloadDetailTemplate() {
      this.$message.info('已开始下载报价明细导入模板（预览）')
    },
    addStairRow() {
      this.currentDetail.rows.push({
        id: Date.now(),
        statMin: '',
        statMax: '',
        stairMin: '',
        stairMax: '无穷大',
        discountMode: '折扣率',
        discountDetail: '',
        firstWeight: '',
        firstWeightPrice: '',
        continueWeight: '',
        continueWeightPrice: '',
        rowLightThrow: ''
      })
      this.detailPage = Math.ceil(this.currentDetail.rows.length / this.detailPageSize) || 1
      this.$nextTick(() => this.layoutDetailStairTable())
    },
    formatDiscountDetailView(row) {
      if (!row) return '-'
      if (row.discountMode === '首续重报价') {
        const parts = [
          row.firstWeight ? `首重 ${row.firstWeight}` : '',
          row.firstWeightPrice ? `首重价格 ${row.firstWeightPrice}` : '',
          row.continueWeight ? `续重公斤 ${row.continueWeight}` : '',
          row.continueWeightPrice ? `续重价格 ${row.continueWeightPrice}` : '',
          row.rowLightThrow ? `轻抛系数 ${row.rowLightThrow}` : ''
        ].filter(Boolean)
        return parts.length ? parts.join('，') : '-'
      }
      if (!row.discountDetail && row.discountDetail !== 0) return '-'
      return row.discountMode === '折扣率' ? `${row.discountDetail}%` : String(row.discountDetail)
    },
    removeStairRow(index) {
      if (index !== this.currentDetail.rows.length - 1) {
        this.$message.warning('请从后往前删除阶梯，避免留空档')
        return
      }
      this.currentDetail.rows.splice(index, 1)
      this.clampDetailPage()
      this.$nextTick(() => this.layoutDetailStairTable())
    },
    removeStairRowById(id) {
      const index = this.currentDetail.rows.findIndex(r => r.id === id)
      if (index < 0) return
      this.removeStairRow(index)
    },
    removeLastStairRow() {
      const rows = (this.currentDetail && this.currentDetail.rows) || []
      if (rows.length <= 1) {
        this.$message.warning('至少保留一条报价明细')
        return
      }
      this.removeStairRow(rows.length - 1)
    },
    layoutDetailStairTable() {
      const t = this.$refs.detailStairTable
      if (t && typeof t.doLayout === 'function') t.doLayout()
    },
    formatRangeText(range) {
      if (!range || !range.length) return '-'
      return `${range[0] || '-'} 至 ${range[1] || '-'}`
    },
    /** 查看/编辑：优先回填发布快照；无快照时用与列表字段一致的默认配置（勿默认勾选全部维度） */
    hydrateFromRecord(row) {
      const src = row || {}
      this.editingId = src.id || null
      const method = '场景报价'
      const strategy = (src.base && src.base.billingStrategy) || src.strategy || '统计考核'
      const isScene = true
      const isStats = ['统计考核', '统计+合单'].includes(strategy)
      const isMerge = ['合单计费', '统计+合单'].includes(strategy)
      const baseSrc = src.base && typeof src.base === 'object' ? src.base : {}

      this.base = {
        ...this.base,
        quotationName: baseSrc.quotationName || src.name || '',
        merchantCode: baseSrc.merchantCode || src.merchantCode || '',
        merchantName: baseSrc.merchantName || src.merchantName || '',
        signRegion: baseSrc.signRegion || src.signRegion || '华东',
        effectiveRange: Array.isArray(baseSrc.effectiveRange) && baseSrc.effectiveRange.length
          ? baseSrc.effectiveRange.slice()
          : (Array.isArray(src.effectiveRange) && src.effectiveRange.length
            ? src.effectiveRange.slice()
            : ['2026-07-01', '2026-12-31']),
        quotationMethod: baseSrc.quotationMethod || method,
        discountProduct: baseSrc.discountProduct || src.discountProduct || src.productType || '京东标快',
        businessScenario: isScene
          ? (baseSrc.businessScenario || src.businessScenario || '逆向退换货')
          : '',
        settlementMethod: baseSrc.settlementMethod || (isScene ? '月结' : (src.settlementMethod || '月结')),
        billingStrategy: strategy,
        statisticsMethod: isStats
          ? (baseSrc.statisticsMethod || src.statisticsMethod || '按考核开始月份')
          : '',
        assessmentStartMonth: isStats
          ? (baseSrc.assessmentStartMonth || src.assessmentStartMonth || '2026-07')
          : '',
        amountRounding: baseSrc.amountRounding || src.amountRounding || '四舍五入取整',
        separateMerchantAccount: baseSrc.separateMerchantAccount || src.separateMerchantAccount || '否',
        hasIdentityPriority: baseSrc.hasIdentityPriority || src.hasIdentityPriority || '否',
        identityPriority: baseSrc.identityPriority || src.identityPriority || '',
        substituteModeRule: baseSrc.substituteModeRule || src.substituteModeRule || '',
        addressLevelMatch: baseSrc.addressLevelMatch || src.addressLevelMatch || '是',
        hasPricePriority: baseSrc.hasPricePriority || '否',
        pricePriority: baseSrc.pricePriority || '',
        isCrossMonth: baseSrc.isCrossMonth || '否',
        crossMonthPrev: baseSrc.crossMonthPrev || '',
        crossMonthPrevDay: baseSrc.crossMonthPrevDay || '',
        crossMonthCurrentDay: baseSrc.crossMonthCurrentDay || ''
      }
      this.complexQuoteOpen = src.complexQuoteOpen != null
        ? !!src.complexQuoteOpen
        : (baseSrc.complexQuoteOpen != null ? !!baseSrc.complexQuoteOpen : false)

      if (Array.isArray(src.selectedDims)) {
        this.selectedDims = src.selectedDims.slice()
      } else {
        // 无快照时与默认分区字段对齐，避免预览勾选全部维度却无对应列数据
        this.selectedDims = ['费用项', '商家订单类型', '正逆向']
      }

      if (Array.isArray(src.partitions) && src.partitions.length) {
        this.partitions = src.partitions.map((p, idx) => {
          const id = p && p.id != null ? p.id : `P-${Date.now()}-${idx}`
          return createPartition({ ...p, id })
        })
      } else {
        const p = createPartition({
          name: '',
          applyNo: '',
          contractCode: '',
          statGroup: isStats ? '1' : '',
          statBillingObject: isStats ? '统计+计费' : '',
          fromAddress: [],
          toAddress: [],
          feeItem: '运费',
          orderType: '',
          direction: ''
        })
        this.partitions = [p]
      }
      this.activePartitionId = String(this.partitions[0].id)
      this.partitionPage = 1

      const rawDetail = src.detailMap && typeof src.detailMap === 'object' ? src.detailMap : {}
      const rawKeys = Object.keys(rawDetail)
      this.detailMap = {}
      this.partitions.forEach((p, idx) => {
        const id = String(p.id)
        let d = rawDetail[id] || rawDetail[p.id]
        if (!d && rawKeys[idx] != null) d = rawDetail[rawKeys[idx]]
        if (d && typeof d === 'object') {
          this.$set(this.detailMap, id, {
            ...createDetail(),
            ...d,
            rows: Array.isArray(d.rows) && d.rows.length
              ? d.rows.map(r => ({ ...r }))
              : createDetail().rows
          })
        } else {
          this.$set(this.detailMap, id, createDetail())
        }
      })

      if (src.extension && typeof src.extension === 'object') {
        this.extension = {
          mergeDimensions: Array.isArray(src.extension.mergeDimensions) ? src.extension.mergeDimensions.slice() : [],
          mergeTargets: Array.isArray(src.extension.mergeTargets) ? src.extension.mergeTargets.slice() : [],
          apportionBasis: Array.isArray(src.extension.apportionBasis) ? src.extension.apportionBasis.slice() : [],
          statDimensions: Array.isArray(src.extension.statDimensions) ? src.extension.statDimensions.slice() : [],
          statTargets: Array.isArray(src.extension.statTargets) ? src.extension.statTargets.slice() : []
        }
      } else {
        this.extension = {
          mergeDimensions: isMerge ? ['商家订单号'] : [],
          mergeTargets: isMerge ? ['重量'] : [],
          apportionBasis: isMerge ? ['按重量分摊'] : [],
          statDimensions: isStats ? ['始发城市'] : [],
          statTargets: isStats ? ['商家单量'] : []
        }
      }
      this.sim.partitionId = String(this.partitions[0].id)
      this.viewTab = 'base'
      this.step = 0
      this.detailPage = 1
      this.partitionTableKey += 1
      this.detailTableKey += 1
    },
    buildPublishPayload(createdAt) {
      const partitions = JSON.parse(JSON.stringify(this.partitions || []))
      const detailMap = {}
      partitions.forEach(p => {
        const id = String(p.id)
        const src = this.detailMap[id] || this.detailMap[p.id] || createDetail()
        detailMap[id] = JSON.parse(JSON.stringify(src))
      })
      const extension = {
        mergeDimensions: (this.extension.mergeDimensions || []).slice(),
        mergeTargets: (this.extension.mergeTargets || []).slice(),
        apportionBasis: (this.extension.apportionBasis || []).slice(),
        statDimensions: (this.extension.statDimensions || []).slice(),
        statTargets: (this.extension.statTargets || []).slice()
      }
      const base = { ...this.base }
      return {
        id: this.editingId || `Q-${Date.now()}`,
        schemeCode: (this.sourceRow && this.sourceRow.schemeCode) || `BJ-${Date.now()}`,
        name: this.base.quotationName || '未命名报价方案',
        method: this.base.quotationMethod || '场景报价',
        merchantCode: this.base.merchantCode || '-',
        merchantName: this.base.merchantName || '-',
        businessScenario: this.base.businessScenario || '-',
        productType: this.base.discountProduct || '-',
        discountProduct: this.base.discountProduct || '-',
        strategy: this.base.billingStrategy || '-',
        status: (this.sourceRow && this.sourceRow.status) || '已启用',
        creator: (this.sourceRow && this.sourceRow.creator) || '预览用户',
        createdAt: (this.sourceRow && this.sourceRow.createdAt) || createdAt,
        signRegion: this.base.signRegion || '',
        effectiveRange: Array.isArray(this.base.effectiveRange) ? this.base.effectiveRange.slice() : [],
        complexQuoteOpen: !!this.complexQuoteOpen,
        base,
        selectedDims: (this.selectedDims || []).slice(),
        partitions,
        detailMap,
        extension
      }
    },
    runSim() {
      if (!this.sim.partitionId) {
        this.$message.warning('请选择报价分区')
        return
      }
      if (this.sim.type === '实单') {
        if (!this.sim.orderNo) {
          this.$message.warning('请输入运单号')
          return
        }
      } else if (!this.sim.weight && !this.sim.volume && !this.sim.businessVolume) {
        this.$message.warning('请至少录入一项计费因子')
        return
      }
      const partName = (this.simDetailPreview && this.simDetailPreview.name) || this.activePartitionName
      const merchant = this.base.merchantName || this.base.merchantCode || '-'
      const method = this.base.quotationMethod || '-'
      const strategy = this.base.billingStrategy || '-'
      const interval = (this.currentDetail && this.currentDetail.intervalType) || '-'
      const lightThrow = (this.currentDetail && this.currentDetail.lightThrow) || '-'
      const total = '36.80'
      const path = [
        `测算类型：${this.sim.type === '实单' ? '实单测算' : '虚单测算'}`,
        `匹配商家 ${merchant}`,
        `报价方式：${method} / 策略：${strategy}`,
        `分区：${partName}`
      ]
      let formula = ''
      if (this.sim.type === '实单') {
        path.push(`运单号 ${this.sim.orderNo}，回写计费过程（预览）`)
        formula = `运单号[${this.sim.orderNo}]匹配商家[${merchant}](自动获取)；分区[${partName}]，报价方式[${method}]/策略[${strategy}]，金额取整后输出总额[${total}]`
      } else {
        const w = this.sim.weight || '-'
        const v = this.sim.volume || '-'
        const bv = this.sim.businessVolume || '-'
        path.push(`计费因子：重量 ${w}kg / 体积 ${v}m³ / 业务量 ${bv}`)
        path.push(`区间 ${interval}，金额取整后输出总额 ${total}`)
        formula = `计费重量=max(重量[${w}],体积[${v}]/轻抛系数[${lightThrow}])；统计业务量[${bv}]；匹配分区[${partName}]，区间[${interval}]，金额取整后输出总额[${total}]`
      }
      this.sim.result = { total, path, formula }
    },
    submitQuote() {
      for (let s = 0; s <= 1; s += 1) {
        const msg = this.validateStep(s)
        if (msg) {
          this.markStepFieldErrors(s)
          this.$message.warning(msg)
          this.step = s
          return
        }
      }
      const feeCheck = validateScenarioFeeCoverage({
        quotationMethod: this.base.quotationMethod,
        discountProduct: this.base.discountProduct,
        businessScenario: this.base.businessScenario,
        partitions: this.partitions,
        selectedDims: this.selectedDims
      })
      if (!feeCheck.ok) {
        this.$message.error(feeCheck.message || '报价不完整')
        this.step = 1
        return
      }
      this.$confirm(this.isEditMode ? '确定保存本次报价修改吗？' : '确定发布本次报价设置吗？', '报价方案确定', { type: 'warning' })
        .then(() => {
          const d = new Date()
          const p = n => String(n).padStart(2, '0')
          const createdAt = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
          this.$emit('published', this.buildPublishPayload(createdAt))
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.quoting-fieldset {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}
.quoting-fieldset--view {
  /* 预览态允许切换分区查看完整明细；表单控件本身已用 isViewMode 切只读文案 */
}
/* 正文统一 14px（覆盖 el-form size=small 默认 13/12）——与定价页一致 */
.table-card--view,
.table-card--wizard {
  font-size: 14px;
  /* 表宽跟随页面：内容区相对白卡片左右各 24 */
  padding-left: 24px !important;
  padding-right: 24px !important;
  box-sizing: border-box;
}
.table-card--view >>> .el-form--small .el-form-item__label,
.table-card--wizard >>> .el-form--small .el-form-item__label,
.table-card--view >>> .el-form-item__label,
.table-card--wizard >>> .el-form-item__label,
.table-card--view >>> .el-form-item__content,
.table-card--wizard >>> .el-form-item__content,
.table-card--view >>> .el-input__inner,
.table-card--wizard >>> .el-input__inner,
.table-card--view >>> .el-radio__label,
.table-card--wizard >>> .el-radio__label,
.table-card--view >>> .el-checkbox__label,
.table-card--wizard >>> .el-checkbox__label,
.table-card--view >>> .el-tag,
.table-card--wizard >>> .el-tag,
.table-card--view >>> .view-plain-text,
.table-card--wizard >>> .view-plain-text,
.table-card--view >>> .ext-block__status,
.table-card--wizard >>> .ext-block__status,
.table-card--view >>> .dims-readonly,
.table-card--wizard >>> .dims-readonly,
.table-card--view >>> .addr-select,
.table-card--wizard >>> .addr-select {
  font-size: 14px !important;
  line-height: 22px !important;
}
/* 表单 label 色与定价页一致 */
.table-card--wizard >>> .el-form-item__label,
.table-card--view >>> .el-form-item__label {
  color: #525765 !important;
  font-weight: 400 !important;
}
/* 表格：PC3.0 正文 14 / 行高随表头表体规范（勿强行 22） */
.table-card--view >>> .el-table,
.table-card--wizard >>> .el-table,
.table-card--view >>> .el-table th,
.table-card--wizard >>> .el-table th,
.table-card--view >>> .el-table td,
.table-card--wizard >>> .el-table td,
.table-card--view >>> .el-table .cell,
.table-card--wizard >>> .el-table .cell {
  font-size: 14px !important;
}
/* 小标题：对齐定价页 OnestopPricing（向导 16 / 预览 14） */
.section-title {
  font-size: 16px !important;
  line-height: 22px !important;
  font-weight: 500;
  color: #23252b;
  margin-top: 0;
  margin-bottom: 12px;
}
.table-card--view .section-title {
  font-size: 16px !important;
  line-height: 22px !important;
  margin-bottom: 12px;
}
.table-card--view .section-title,
.table-card--wizard .section-title {
  margin-bottom: 12px;
}
.section-title::before {
  height: 16px;
  margin-right: 4px;
  vertical-align: -3px;
  flex-shrink: 0;
}
.quoting-section + .quoting-section {
  margin-top: 24px;
  padding-top: 0;
  border-top: none;
}
/* 向导用 v-show 切换：隐藏态仍占兄弟选择器，避免步骤条下叠出额外间距（同定价） */
.table-card--wizard .quoting-section + .quoting-section {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}
/* 预览：模块间距 24，去掉多余分割横线（图1）；Tab 切换时隐藏块仍占兄弟选择器，清零相邻间距 */
.table-card--view .quoting-section + .quoting-section {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}
.table-card--view .quoting-section {
  margin-top: 0;
}
/* 模块间距固定 24px：上一模块内容 → 下一模块小标题（同定价 pricing-section__sub） */
.table-card--view .section-title--module,
.table-card--wizard .section-title--module,
.section-title--module {
  margin-top: 24px;
  margin-bottom: 12px;
}
/* 表格距上下各 24px */
.table-card--view .partition-table-wrap,
.table-card--wizard .partition-table-wrap,
.table-card--view .detail-table-wrap,
.table-card--wizard .detail-table-wrap {
  margin-top: 24px;
  margin-bottom: 24px;
}
.table-card--view .detail-stair-table + .section-title--module,
.detail-table-wrap + .section-title--module {
  margin-top: 0;
}
/* 预览：分区表已是 section 末项，下一块 quoting-section 的 24 即表下间距，去掉表自身 margin-bottom 避免 48 */
.table-card--view .quoting-section > .partition-table-wrap:last-child {
  margin-bottom: 0;
}
/* 小标题下的内容区不再叠额外上边距，避免模块间距被撑大 */
.table-card--view .ext-block--plain,
.table-card--wizard .ext-block--plain,
.section-title + .ext-block--plain,
.section-title--module + .ext-block--plain {
  margin-top: 0;
}
.partition-dims-form {
  margin-bottom: 0;
  --lui-form-label-width: 120px;
}
.partition-dims-form.lui-form-grid.el-form {
  margin-bottom: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  column-gap: 48px !important;
  row-gap: 16px !important;
  align-items: center;
}
.partition-dims-form >>> .el-form-item {
  margin-bottom: 0;
  align-items: center;
  min-height: 32px;
}
.partition-dims-form >>> .el-form-item.lui-form-grid__span-all {
  align-items: flex-start;
  min-height: 22px;
}
.partition-dims-form >>> .el-form-item.lui-form-grid__span-all .el-form-item__label {
  height: auto !important;
  line-height: 22px !important;
  padding-top: 0 !important;
}
.partition-dims-form >>> .el-form-item.lui-form-grid__span-all .el-form-item__content {
  width: 100%;
  min-width: 0;
  line-height: 22px;
}
.partition-dims-form >>> .el-form-item__label {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  padding-right: 12px !important;
  line-height: 32px !important;
  height: 32px !important;
}
.table-card--view .partition-dims-form >>> .el-form-item__content {
  line-height: 22px;
  min-height: 22px;
}
.table-card--view .dims-readonly {
  min-height: 22px;
  gap: 8px;
}
/* 可选报价维度：占栅格一列；右侧操作区右对齐（一行三列） */
.dims-select {
  width: 100%;
}
.dims-select >>> .el-input__inner {
  min-height: 32px;
}
.partition-dims-actions {
  grid-column: 2 / -1;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  justify-self: end;
  min-height: 32px;
  align-self: center;
  gap: 12px;
}
.partition-dims-actions > *,
.partition-dims-actions .el-button,
.partition-dims-actions .el-button + .el-button {
  margin-left: 0 !important;
}
/* 操作按钮无描边（含 hover / focus / disabled） */
.partition-dims-actions .el-button,
.partition-dims-actions .el-button:hover,
.partition-dims-actions .el-button:focus,
.partition-dims-actions .el-button:active,
.partition-dims-actions .el-button.is-disabled,
.partition-dims-actions .el-button.is-disabled:hover {
  border: none !important;
  border-color: transparent !important;
  outline: none !important;
  box-shadow: none !important;
}
.partition-dims-actions__btn-wrap,
.partition-dims-actions__delete-wrap {
  display: inline-flex;
}
.partition-pager,
.detail-pager {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--lui-table-divider, #f1f2f4);
  box-sizing: border-box;
}
/*
 * 可编辑表统一（分区 + 明细）：
 * 1) 表宽 = 容器宽（卡片左右已预留 24，如弹窗 1000 → 内容区 952）
 * 2) 列少：min-width 列自动铺满表宽；列多需横滑：列最小 184（内容≥160 + 左右各 12 间距）
 * 3) 录入项 width:100% 随列宽伸缩
 */
.table-h-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: #c0c4cc transparent;
  box-sizing: border-box;
}
.partition-table-wrap.table-h-scroll,
.detail-table-wrap.table-h-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  position: relative;
  border-radius: 8px;
  box-sizing: border-box;
}
.table-card--view .table-h-scroll {
  pointer-events: auto;
  border-radius: 8px;
}
.table-h-scroll >>> .el-table.quoting-data-table,
.table-h-scroll >>> .el-table.quoting-editable-table,
.partition-table-wrap >>> .el-table.quoting-editable-table,
.partition-table-wrap >>> .el-table.quoting-data-table,
.partition-table-wrap >>> .el-table.partition-table,
.detail-table-wrap >>> .el-table.quoting-editable-table,
.detail-table-wrap >>> .el-table.quoting-data-table,
.detail-table-wrap >>> .el-table.detail-stair-table {
  width: 100% !important;
  min-width: 100% !important;
  max-width: none !important;
  border-radius: 8px;
}
.partition-table-wrap >>> .el-table__header .el-table__cell .cell,
.partition-table-wrap >>> .el-table__body .el-table__cell .cell,
.detail-table-wrap >>> .el-table__header .el-table__cell .cell,
.detail-table-wrap >>> .el-table__body .el-table__cell .cell {
  padding-left: 12px !important;
  padding-right: 12px !important;
  box-sizing: border-box;
}
.partition-table-wrap .el-input,
.partition-table-wrap .el-select,
.partition-table-wrap .addr-select,
.detail-table-wrap .el-input,
.detail-table-wrap .el-select {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 100%;
  box-sizing: border-box;
}
.detail-table-wrap .detail-first-continue .el-input,
.detail-table-wrap .detail-first-continue .el-input .el-input__inner {
  width: 100% !important;
  min-width: 72px !important;
  max-width: none !important;
}
.detail-table-wrap .detail-value-cell {
  width: 160px;
  max-width: 160px;
}
.detail-table-wrap .detail-value-cell .el-input {
  max-width: none;
}
.quoting-data-table >>> .el-table__header-wrapper {
  border-radius: 8px 8px 0 0;
}
.quoting-data-table >>> .el-table__header th.el-table__cell:first-child {
  border-top-left-radius: 8px;
}
.quoting-data-table >>> .el-table__header th.el-table__cell:last-child {
  border-top-right-radius: 8px;
}
.quoting-data-table >>> .el-table__body tr:last-child td.el-table__cell:first-child {
  border-bottom-left-radius: 8px;
}
.quoting-data-table >>> .el-table__body tr:last-child td.el-table__cell:last-child {
  border-bottom-right-radius: 8px;
}
/* 分区/明细统一：列多时由 body 横滑；表头与表体由 el-table 同步 */
.partition-table-wrap >>> .el-table__header-wrapper,
.detail-table-wrap >>> .el-table__header-wrapper,
.table-h-scroll >>> .el-table__header-wrapper {
  overflow: hidden !important;
}
.partition-table-wrap >>> .el-table__body-wrapper,
.detail-table-wrap >>> .el-table__body-wrapper,
.table-h-scroll >>> .el-table__body-wrapper {
  overflow-x: auto !important;
}
/* 编辑态明细有 max-height：表内纵向滚动；预览与分区表一致：自然撑高 */
.table-card--wizard .detail-table-wrap >>> .el-table__body-wrapper {
  overflow-y: auto !important;
}
.table-card--view .detail-table-wrap >>> .el-table__body-wrapper {
  overflow-y: visible !important;
}
.table-h-scroll::-webkit-scrollbar,
.table-h-scroll >>> .el-table__body-wrapper::-webkit-scrollbar {
  height: 8px;
}
.table-h-scroll::-webkit-scrollbar-track,
.table-h-scroll >>> .el-table__body-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
.table-h-scroll::-webkit-scrollbar-thumb,
.table-h-scroll >>> .el-table__body-wrapper::-webkit-scrollbar-thumb {
  min-width: 48px;
  background: #c0c4cc;
  border-radius: 4px;
}
/* 固定列：抬离横滑条，且禁止行高被容器拉高 */
.partition-table-wrap >>> .el-table__fixed-right,
.partition-table-wrap >>> .el-table__fixed {
  bottom: 8px !important;
}
.partition-table-wrap >>> .el-table__fixed-right .el-table__fixed-body-wrapper,
.partition-table-wrap >>> .el-table__fixed .el-table__fixed-body-wrapper {
  height: auto !important;
  max-height: none !important;
}
.partition-table-wrap >>> .el-table__fixed-right .el-table__body,
.partition-table-wrap >>> .el-table__fixed .el-table__body,
.partition-table-wrap >>> .el-table__fixed-right table,
.partition-table-wrap >>> .el-table__fixed table {
  height: auto !important;
}
.partition-table-wrap >>> .el-table__fixed-right-patch {
  background: #fff;
}
.partition-table-wrap >>> .el-table__body td.el-table__cell,
.partition-table-wrap >>> .el-table__fixed-right .el-table__body td.el-table__cell,
.detail-table-wrap >>> .el-table__body td.el-table__cell {
  vertical-align: middle;
}
/* 分区/明细：表头表体一律单行，禁止任何换行（含 th-required） */
.quoting-data-table >>> .el-table__header th.el-table__cell,
.quoting-data-table >>> .el-table__header th.el-table__cell .cell,
.quoting-data-table >>> .el-table__header .th-required,
.quoting-data-table >>> .el-table__body td.el-table__cell,
.quoting-data-table >>> .el-table__body td.el-table__cell .cell,
.partition-table >>> .el-table__header th.el-table__cell,
.partition-table >>> .el-table__header th.el-table__cell .cell,
.partition-table >>> .el-table__header .th-required,
.partition-table >>> .el-table__body td.el-table__cell .cell,
.detail-stair-table >>> .el-table__header th.el-table__cell,
.detail-stair-table >>> .el-table__header th.el-table__cell .cell,
.detail-stair-table >>> .el-table__header .th-required,
.detail-stair-table >>> .el-table__body td.el-table__cell .cell {
  white-space: nowrap !important;
  word-break: keep-all !important;
  overflow-wrap: normal !important;
}
.partition-table-wrap >>> .el-table__header .el-table__cell .cell,
.partition-table-wrap >>> .el-table__body .el-table__cell .cell,
.detail-table-wrap >>> .el-table__header .el-table__cell .cell,
.detail-table-wrap >>> .el-table__body .el-table__cell .cell {
  padding-left: 12px !important;
  padding-right: 12px !important;
  box-sizing: border-box;
  white-space: nowrap !important;
}
/* 预览：正文单行；编辑：控件框完整显示，禁止 overflow 裁切边框 */
.table-card--view .partition-table-wrap >>> .el-table__body td.el-table__cell .cell,
.table-card--view .detail-table-wrap >>> .el-table__body td.el-table__cell .cell {
  text-overflow: clip !important;
  white-space: nowrap !important;
  overflow: hidden !important;
}
.table-card--wizard .partition-table-wrap >>> .el-table__body td.el-table__cell .cell,
.table-card--wizard .detail-table-wrap >>> .el-table__body td.el-table__cell .cell {
  text-overflow: clip !important;
  white-space: nowrap !important;
  overflow: visible !important;
  line-height: normal !important;
}
.partition-ops {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 24px;
  white-space: nowrap;
  line-height: 22px;
}
.partition-ops .el-button {
  margin: 0;
  padding: 0;
  height: auto;
  line-height: 22px;
}
/* 分区/明细表头必填星号 */
.partition-table >>> .th-required::before,
.detail-stair-table >>> .th-required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
.table-card--view .partition-table >>> .th-required::before,
.table-card--view .detail-stair-table >>> .th-required::before {
  display: none;
}
.partition-table,
.detail-stair-table,
.quoting-data-table {
  border-radius: 8px;
}
.detail-table-wrap .detail-stair-table,
.detail-table-wrap .quoting-data-table,
.table-card--view .detail-table-wrap .quoting-data-table {
  width: 100% !important;
}
.partition-table >>> .el-table__header th.el-table__cell {
  font-size: 14px;
  font-weight: 400 !important;
  color: #525765 !important;
  background: #f5f7fa !important;
}
/* 表内正文：PC3.0 次文本 #525765 */
.partition-table >>> .el-table__body td.el-table__cell,
.partition-table >>> .el-table__body td.el-table__cell .cell,
.partition-table >>> .view-plain-text,
.partition-table >>> .addr-view-text,
.detail-stair-table >>> .view-plain-text {
  color: #525765 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
}
.partition-table >>> .view-plain-text,
.partition-table >>> .addr-view-text,
.detail-stair-table >>> .view-plain-text {
  line-height: 16px !important;
  white-space: nowrap;
}
.partition-table .el-input,
.partition-table .el-select,
.detail-stair-table .el-input,
.detail-stair-table .el-select {
  width: 100%;
  min-width: 0;
}
.partition-table .el-input >>> .el-input__inner,
.partition-table .el-select >>> .el-input__inner,
.detail-stair-table .el-input >>> .el-input__inner,
.detail-stair-table .el-select >>> .el-input__inner {
  height: 32px !important;
  line-height: 30px !important;
  width: 100%;
  box-sizing: border-box;
}
.partition-table .addr-select {
  min-width: 0;
}
.partition-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 22px;
  margin-bottom: 12px;
}
.partition-head strong {
  font-size: 14px;
  line-height: 22px;
  color: #23252b;
  font-weight: 600;
}
.dims-readonly {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  gap: 8px;
  align-items: center;
  align-content: flex-start;
  width: 100%;
  min-width: 0;
  min-height: 22px;
}
.dims-readonly__tag {
  margin: 0;
  flex: 0 0 auto;
  max-width: 100%;
  border-color: #e4e5e9;
  color: #525765;
  background: #f7f8fa;
}
.detail-toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 12px 0;
}
.field-tip { margin-top: 8px; color: #868d9f; font-size: 12px; line-height: 18px; }
.view-plain-text {
  color: #23252b;
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
}
.ext-block {
  margin-top: 12px;
}
.ext-block--plain {
  margin-top: 0;
  margin-bottom: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
}
/* 与基础信息同一套 LUI 栅格：3 列 / 列距 48 / 行距 16；项内 label120 | 1fr 保证跨行竖线对齐 */
.quoting-base-form.lui-form-grid.el-form,
.complex-quote-form.lui-form-grid.el-form {
  --lui-form-label-width: 120px;
  --lui-form-item-gap: 12px;
  --lui-form-col-gap: 48px;
  --lui-form-row-gap: 16px;
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  column-gap: 48px !important;
  row-gap: 16px !important;
  justify-content: stretch !important;
  align-items: start !important;
  width: 100%;
}
@media (max-width: 1199px) {
  .quoting-base-form.lui-form-grid.el-form,
  .complex-quote-form.lui-form-grid.el-form {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
@media (max-width: 767px) {
  .quoting-base-form.lui-form-grid.el-form,
  .complex-quote-form.lui-form-grid.el-form {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}
.complex-quote-form >>> .el-form-item {
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  align-items: center !important;
  justify-content: flex-start !important;
  min-width: 0 !important;
  max-width: 100% !important;
  width: 100% !important;
  min-height: 32px;
  margin-bottom: 0 !important;
  margin-right: 0 !important;
  box-sizing: border-box;
}
.complex-quote-form >>> .el-form-item__label {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  padding: 0 12px 0 0 !important;
  text-align: right !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  line-height: 32px !important;
  height: 32px !important;
  box-sizing: border-box !important;
  flex: 0 0 120px !important;
  float: none !important;
}
.complex-quote-form >>> .el-form-item__content {
  flex: 1 1 0% !important;
  min-width: 0 !important;
  width: auto !important;
  margin-left: 0 !important;
  padding-left: 0 !important;
  line-height: 32px;
  min-height: 32px;
  display: flex !important;
  align-items: center !important;
}
.complex-quote-form >>> .el-form-item__content > .el-select,
.complex-quote-form >>> .el-form-item__content > .el-input,
.complex-quote-form >>> .el-form-item__content > .el-radio-group,
.complex-quote-form >>> .el-form-item__content > .ext-block__switch {
  width: 100%;
  max-width: 100%;
}
.complex-quote-form >>> .el-form-item__content > .el-radio-group {
  width: auto;
}
.complex-quote-form >>> .view-plain-text,
.complex-quote-form >>> .ext-block__status {
  line-height: 32px;
}
/* 预览态：回退为 LUI 右对齐 label120；双列 1fr 保持跨区块值起点对齐 */
.table-card--view .lui-form-grid.el-form {
  --lui-form-label-width: 120px;
  --lui-form-item-gap: 12px;
  --lui-form-col-gap: 48px;
  --lui-form-row-gap: 12px;
  width: 100% !important;
  max-width: 100% !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  column-gap: 48px !important;
  row-gap: 12px !important;
  justify-content: stretch !important;
}
.table-card--view .lui-form-grid >>> .el-form-item {
  align-items: center;
  margin-bottom: 0 !important;
  width: 100%;
}
.table-card--view .lui-form-grid >>> .el-form-item__label {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  padding-right: 12px !important;
  text-align: right !important;
  justify-content: flex-end !important;
  overflow: hidden !important;
  text-overflow: clip !important;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  box-sizing: border-box;
  height: 22px !important;
  line-height: 22px !important;
  float: none !important;
}
.table-card--view .lui-form-grid >>> .el-form-item__content {
  margin-left: 0 !important;
  padding-left: 0 !important;
  flex: 1 1 0%;
  min-width: 0;
  line-height: 22px !important;
  min-height: 22px;
}
.table-card--view .lui-form-grid >>> .view-plain-text,
.table-card--view .lui-form-grid >>> .ext-block__status,
.table-card--view .lui-form-grid >>> .ext-block__switch {
  display: inline-block;
  padding: 0 !important;
  margin: 0 !important;
  line-height: 22px !important;
  min-height: 22px;
  color: #23252b;
}
.table-card--view .complex-quote-form.lui-form-grid.el-form,
.table-card--view .quoting-base-form.lui-form-grid.el-form,
.table-card--view .ext-rule-form.lui-form-grid.el-form,
.table-card--view .partition-dims-form.lui-form-grid.el-form {
  --lui-form-label-width: 120px;
  width: 100% !important;
}
/* 预览：基础信息 / 复杂报价 / 拓展规则同轨三列 */
.table-card--view .complex-quote-form.lui-form-grid.el-form,
.table-card--view .quoting-base-form.lui-form-grid.el-form,
.table-card--view .ext-rule-form.lui-form-grid.el-form {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  column-gap: 48px !important;
  row-gap: 12px !important;
}
.table-card--view .partition-dims-form.lui-form-grid.el-form {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  column-gap: 48px !important;
  row-gap: 16px !important;
}
.table-card--view .complex-quote-form >>> .el-form-item {
  min-height: 22px;
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
}
.table-card--view .complex-quote-form >>> .el-form-item__label {
  flex: 0 0 120px !important;
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  height: 22px !important;
  line-height: 22px !important;
  text-align: right !important;
  justify-content: flex-end !important;
}
.table-card--view .complex-quote-form >>> .el-form-item__content,
.table-card--view .complex-quote-form >>> .view-plain-text,
.table-card--view .complex-quote-form >>> .ext-block__status,
.table-card--view .complex-quote-form >>> .ext-block__switch {
  min-height: 22px;
  height: 22px;
  line-height: 22px !important;
}
.table-card--view .table-h-scroll {
  width: 100%;
}
.table-card--view .partition-table-wrap .partition-table,
.table-card--view .partition-table-wrap .quoting-data-table,
.table-card--view .partition-table-wrap .quoting-editable-table,
.table-card--view .detail-table-wrap .quoting-data-table,
.table-card--view .detail-table-wrap .detail-stair-table,
.table-card--view .detail-table-wrap .quoting-editable-table {
  width: 100% !important;
  min-width: 100% !important;
}
.ext-block__title {
  font-size: 14px;
  font-weight: 500;
  color: #23252b;
  line-height: 20px;
  margin: 0 0 8px;
}
.sim-detail-preview {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e4e5e9;
}
.sim-detail-preview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 22px;
  color: #525765;
}
.ext-rule-form.lui-form-grid {
  --lui-form-label-width: 120px;
  width: 100% !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  column-gap: 48px !important;
  row-gap: 16px !important;
  justify-content: stretch !important;
}
@media (max-width: 1199px) {
  .ext-rule-form.lui-form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
@media (max-width: 767px) {
  .ext-rule-form.lui-form-grid {
    grid-template-columns: minmax(0, 1fr) !important;
  }
}
.ext-merge-fields.lui-form-grid {
  --lui-form-label-width: 112px;
  margin-top: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
}
@media (max-width: 1199px) {
  .ext-merge-fields.lui-form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
.ext-rule-form__label,
.ext-block__status {
  color: #23252b;
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}
.ext-block__switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #23252b;
  font-size: 14px;
  line-height: 22px;
  height: 32px;
}
.field-label-with-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.field-tip-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid #babec7;
  color: #868d9f;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.sim-card {
  margin-bottom: 12px;
  padding: 0;
  border: none;
  background: transparent;
}
.sim-card .section-title {
  margin: 0 0 12px;
}
/* 图1：测算参数表单横向居中；开始测算跟在选择项后一列 */
.sim-card .sim-param-config-form.lui-form-grid.el-form {
  max-width: 980px;
  margin-left: auto;
  margin-right: auto;
}
.sim-card .sim-run-item {
  margin-bottom: 0 !important;
}
.sim-card .sim-run-item >>> .el-form-item__label {
  display: none !important;
  width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}
.sim-card .sim-run-item >>> .el-form-item__content {
  margin-left: 0 !important;
  display: flex !important;
  justify-content: flex-start;
  align-items: center;
  line-height: 32px;
  min-height: 32px;
}
.sim-detail-pager {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--lui-table-divider, #f1f2f4);
}
/* 图3：蓝色结果卡 + 图4 式计算过程 */
.sim-result {
  margin-top: 24px;
  padding: 16px 20px;
  border-radius: 8px;
  background: rgba(60, 110, 240, 0.08);
  border: 1px solid rgba(60, 110, 240, 0.28);
  box-sizing: border-box;
}
.sim-result__head {
  margin-bottom: 12px;
}
.sim-result__title {
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  color: #3c6ef0;
}
.sim-result__amount-row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin-bottom: 12px;
  font-family: var(--lui-font-number);
  line-height: 36px;
}
.sim-result__amount-label {
  font-size: 14px;
  font-weight: 500;
  color: #23252b;
  font-family: var(--lui-font-sans);
  line-height: 22px;
}
.sim-result__currency {
  margin-right: 2px;
  font-size: 20px;
  font-weight: 500;
  color: #3c6ef0;
}
.sim-result__amount {
  font-size: 28px;
  font-weight: 500;
  color: #3c6ef0;
}
.sim-result__process {
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e4e5e9;
  border-radius: 8px;
  font-size: 14px;
  line-height: 22px;
  color: #23252b;
  word-break: break-word;
}
.sim-result__process-label {
  font-weight: 500;
}
.sim-result__process-text {
  font-weight: 400;
  color: #525765;
}
.section-title-with-tip {
  display: inline-flex !important;
  align-items: center;
  gap: 4px;
}
.section-title-with-tip::before {
  margin-right: 0;
}
.section-title-with-tip .section-title__text {
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  color: inherit;
  display: inline-block;
}
.section-title-with-tip .field-tip-trigger {
  margin-left: 0;
  position: relative;
  z-index: 2;
}
.ext-block__switch--row {
  margin-bottom: 12px;
}
.quoting-view-tabs.lui-pill-tabs {
  display: inline-flex;
  align-items: center;
  gap: 0;
  width: auto;
  max-width: 100%;
  height: 40px;
  padding: 4px;
  margin: 0 0 24px;
  box-sizing: border-box;
  border-radius: 8px;
  background: #f0f1f5;
  flex-shrink: 0;
  border-bottom: none;
}
.table-card--view .quoting-view-tabs {
  margin-top: 0;
}
.lui-pill-tabs__item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  min-width: 88px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  line-height: 22px;
  font-weight: 400;
  color: #23252b;
  outline: none;
  white-space: nowrap;
  transition: color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}
.lui-pill-tabs__item.has-divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 1px;
  height: 14px;
  margin-top: -7px;
  background: #e4e5e9;
}
.lui-pill-tabs__item.is-active.has-divider::before,
.lui-pill-tabs__item.is-active + .lui-pill-tabs__item.has-divider::before {
  display: none;
}
.lui-pill-tabs__item.is-active {
  background: #fff;
  color: #3c6ef0;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(35, 37, 43, 0.06);
}
.lui-pill-tabs__item:hover:not(.is-active) {
  color: #3c6ef0;
}
.lui-pill-tabs__item:disabled,
.lui-pill-tabs__item.is-disabled {
  color: #babec7;
  cursor: not-allowed;
}
.detail-toolbar-actions {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.detail-toolbar-actions > *,
.detail-toolbar-actions .el-button {
  margin-left: 0 !important;
}
/* 明细表上方右侧操作，间距统一 12px；与轻抛系数同一行右对齐 */
.detail-table-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin: 0;
  min-height: 32px;
  width: 100%;
}
.detail-table-actions > *,
.detail-table-actions .el-button,
.detail-table-actions .el-button + .el-button {
  margin-left: 0 !important;
}
/* 操作按钮无描边（含 hover / focus / disabled） */
.detail-table-actions .el-button,
.detail-table-actions .el-button:hover,
.detail-table-actions .el-button:focus,
.detail-table-actions .el-button:active,
.detail-table-actions .el-button.is-disabled,
.detail-table-actions .el-button.is-disabled:hover {
  border: none !important;
  border-color: transparent !important;
  outline: none !important;
  box-shadow: none !important;
}
.detail-table-actions__btn-wrap,
.detail-table-actions__delete-wrap {
  display: inline-flex;
}
.detail-meta-form >>> .detail-meta-actions-item {
  grid-column: 2 / -1;
  margin-bottom: 0 !important;
  align-self: center;
}
.detail-meta-form >>> .detail-meta-actions-item > .el-form-item__label {
  display: none !important;
  width: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}
.detail-meta-form >>> .detail-meta-actions-item > .el-form-item__content {
  margin-left: 0 !important;
  display: flex !important;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  min-height: 32px;
  line-height: 32px;
}
.detail-meta-form + .detail-table-wrap,
.detail-meta-bar + .detail-table-wrap {
  margin-top: 24px;
}
/* 明细参数一行三列：列间距 48，行间距 16（勿用 48 当行距） */
.detail-meta-bar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  margin: 0;
}
.detail-meta-bar--view-filter {
  margin-bottom: 0;
}
.detail-meta-form.lui-form-grid.el-form {
  width: 100%;
  margin: 0;
  --lui-form-label-width: 120px;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  column-gap: 24px !important;
  row-gap: 16px !important;
  align-items: center;
}
/* 预览：仅分区筛选，单列布局 */
.detail-meta-form--view-filter.lui-form-grid.el-form {
  grid-template-columns: minmax(240px, 360px) !important;
  column-gap: 0 !important;
  row-gap: 0 !important;
}
.detail-meta-form >>> .el-form-item {
  align-items: center;
}
.detail-meta-form >>> .el-form-item__label {
  color: #525765 !important;
  font-weight: 400 !important;
}
.detail-meta-partition-text {
  color: #23252b !important;
  font-weight: 500;
}
.detail-partition-filter {
  width: 100%;
}
.detail-table-wrap--view {
  margin-top: 16px;
}
.table-card--view .detail-table-wrap--view {
  margin-top: 16px;
}
/*
 * 分区/明细行高 48：
 * - 表头仅文字：padding 14 + line 16
 * - 表体含 32 高控件：padding 8 + 控件 32（14+32+14 会裁切边框，禁止）
 */
.quoting-data-table >>> .el-table__header th.el-table__cell,
.partition-table >>> .el-table__header th.el-table__cell,
.detail-stair-table >>> .el-table__header th.el-table__cell {
  padding-top: 14px !important;
  padding-bottom: 14px !important;
  height: 48px !important;
  box-sizing: border-box;
  vertical-align: middle;
}
.quoting-data-table >>> .el-table__body td.el-table__cell,
.partition-table >>> .el-table__body td.el-table__cell {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  height: 48px !important;
  box-sizing: border-box;
  vertical-align: middle;
}
.detail-stair-table >>> .el-table__body td.el-table__cell {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  height: auto !important;
  min-height: 48px;
  box-sizing: border-box;
  vertical-align: middle;
}
.quoting-data-table >>> .el-table__header th.el-table__cell .cell,
.partition-table >>> .el-table__header th.el-table__cell .cell,
.detail-stair-table >>> .el-table__header th.el-table__cell .cell {
  line-height: 16px !important;
  white-space: nowrap !important;
}
.quoting-data-table >>> .el-table__body td.el-table__cell .cell,
.partition-table >>> .el-table__body td.el-table__cell .cell,
.detail-stair-table >>> .el-table__body td.el-table__cell .cell {
  white-space: nowrap !important;
  line-height: normal !important;
}
.detail-stair-table >>> .el-table__body td.el-table__cell .cell .detail-first-continue {
  white-space: normal !important;
}
.detail-stair-table >>> .el-table__body tr:last-child td.el-table__cell {
  /* 末行与表体底边对齐，避免操作列“掉底” */
  border-bottom: none !important;
}
/* 录入项铺满单元格（与分区表一致；首续重小框除外） */
.detail-stair-table >>> .detail-stair-control:not(.detail-stair-control--sm),
.detail-stair-table >>> .detail-stair-control:not(.detail-stair-control--sm).el-input,
.detail-stair-table >>> .detail-stair-control:not(.detail-stair-control--sm).el-select,
.detail-stair-table >>> .detail-stair-control:not(.detail-stair-control--sm) .el-input__inner,
.detail-stair-table >>> .detail-value-cell .detail-stair-control,
.detail-stair-table >>> .detail-value-cell .detail-stair-control.el-input,
.detail-stair-table >>> .detail-value-cell .el-input__inner,
.detail-stair-table >>> .el-select {
  width: 100% !important;
  max-width: 100%;
  min-width: 0 !important;
  box-sizing: border-box;
}
.detail-stair-ops {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 24px;
  white-space: nowrap;
}
.detail-stair-ops .el-button {
  margin: 0;
  padding: 0;
  height: auto;
  line-height: 22px;
}
.addr-select {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
  width: 100%;
  height: 32px;
  min-height: 32px;
  max-height: 32px;
  padding: 0 24px 0 8px;
  box-sizing: border-box;
  border: 1px solid #e4e5e9;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.addr-view-text {
  display: inline;
  max-width: none;
  font-size: 14px;
  line-height: 16px;
  color: #525765;
  font-weight: 400;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  vertical-align: bottom;
}
.cell-ellipsis {
  display: inline;
  max-width: none;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
  vertical-align: bottom;
  cursor: default;
  color: #525765;
}
.cell-ellipsis.is-truncated,
.addr-view-text.is-truncated {
  cursor: pointer;
}
.addr-select:hover {
  border-color: #c0c4cc;
}
.addr-select.is-readonly {
  cursor: default;
  background: #f7f8fa;
  padding-right: 8px;
}
.addr-select.is-empty .addr-select__placeholder {
  color: #c0c4cc;
}
.addr-select__placeholder {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 28px;
  color: #c0c4cc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 地址标签：宽度随文案自适应，避免叉号压字（图2） */
.addr-select__tag {
  margin: 0;
  max-width: none;
  flex: 0 0 auto;
  display: inline-flex !important;
  align-items: center;
  height: 22px;
  line-height: 20px;
  padding: 0 4px 0 8px !important;
  box-sizing: border-box;
  overflow: visible;
  border-color: #e4e5e9;
  background: #f4f5f7;
  color: #525765;
}
.addr-select__tag >>> .el-tag__close {
  flex: 0 0 auto;
  position: static !important;
  top: auto !important;
  transform: none !important;
  margin-left: 4px;
  color: #868d9f;
}
.addr-select__more {
  margin: 0;
  max-width: none;
  flex-shrink: 0;
  border-color: #e4e5e9;
  background: #f4f5f7;
  color: #525765;
  cursor: pointer;
}
.addr-select__caret {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #c0c4cc;
  font-size: 12px;
  pointer-events: none;
}
.detail-value-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  /* 报价明细列因首续重加宽；折扣率/一口价仍按普通录入宽，不跟着拉长 */
  width: 160px;
  max-width: 160px;
  min-width: 0;
  box-sizing: border-box;
}
.detail-value-cell > span {
  flex-shrink: 0;
}
.detail-value-cell .el-input {
  flex: 1 1 auto;
  width: auto !important;
  min-width: 0 !important;
  max-width: none !important;
}
/* 折扣率单位：框内右侧后缀（对齐 LUI 辅助元素 kg 样式） */
.detail-value-cell--unit .el-input >>> .el-input__inner {
  padding-right: 28px;
}
.detail-input-unit {
  display: inline-flex;
  align-items: center;
  height: 100%;
  padding-right: 4px;
  color: var(--lui-text-secondary, #868d9f);
  font-size: 14px;
  line-height: 32px;
  pointer-events: none;
  user-select: none;
}
.detail-stair-control--unit >>> .el-input__suffix {
  display: flex;
  align-items: center;
  right: 8px;
}
.detail-stair-control--unit >>> .el-input__suffix-inner {
  display: inline-flex;
  align-items: center;
  height: 100%;
}
/* 首续重录入：一行三列，间距 12px */
.detail-first-continue {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.detail-first-continue__item {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.detail-first-continue__label {
  color: #525765;
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;
  flex-shrink: 0;
}
.detail-stair-table >>> .detail-first-continue .detail-stair-control--sm,
.detail-stair-table >>> .detail-first-continue .detail-stair-control--sm.el-input,
.detail-stair-table >>> .detail-first-continue .detail-stair-control--sm .el-input__inner,
.detail-stair-table >>> .detail-first-continue .el-input,
.detail-stair-table >>> .detail-first-continue .el-input .el-input__inner {
  width: 100% !important;
  min-width: 72px !important;
  max-width: none !important;
  flex: 1 1 auto !important;
}
.detail-stair-table >>> .detail-stair-control--sm,
.detail-stair-table >>> .detail-stair-control--sm.el-input,
.detail-stair-table >>> .detail-stair-control--sm .el-input__inner {
  width: 72px !important;
  max-width: 72px;
}
</style>
