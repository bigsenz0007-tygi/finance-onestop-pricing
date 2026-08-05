<template>
  <div
    class="pricing-root"
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
      <div v-if="isViewMode && !embedded" class="table-toolbar">
        <h3>场景定价详情</h3>
      </div>
      <LuiArrowSteps
        v-if="!isViewMode"
        :steps="pricingSteps"
        :active="step"
        :max-reachable="maxReachedStep"
        @change="onStepChange"
      />

      <div class="wizard-body">
        <div v-show="isViewMode || step === 0" class="pricing-section">
          <h3 class="section-title">基础信息填写</h3>
          <fieldset class="pricing-fieldset">
          <el-form :model="scenario.base" class="lui-form-grid" size="small">
            <el-form-item label="业务场景" required>
              <el-select v-model="scenario.base.scenario" filterable clearable placeholder="请输入或选择业务场景">
                <el-option
                  v-for="item in scenarioOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="关联产品" required>
              <el-select v-model="scenario.base.product" filterable clearable placeholder="请输入或选择产品">
                <el-option label="P001 - 特快重货" value="P001" />
                <el-option label="P002 - 标快" value="P002" />
                <el-option label="P003 - 特快" value="P003" />
              </el-select>
            </el-form-item>
            <el-form-item label="责任人" required>
              <el-input v-model="scenario.base.owner" placeholder="请填写erp" />
            </el-form-item>
            <el-form-item label="效期时间" required class="lui-form-item--range">
              <span v-if="isViewMode" class="view-plain-text">{{ formatRangeText(scenario.base.range) }}</span>
              <el-date-picker
                v-else
                v-model="scenario.base.range"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
            <el-form-item label="限定商家使用" required>
              <span v-if="isViewMode">{{ scenario.base.isLimitMerchant ? '是' : '否' }}</span>
              <el-radio-group v-else v-model="scenario.base.isLimitMerchant" @change="onLimitMerchantChange">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="业务描述">
              <el-input v-model="scenario.base.desc" placeholder="请描述该定价场景适用的具体业务范围..." />
            </el-form-item>
            <el-form-item
              v-if="scenario.base.isLimitMerchant"
              label="商家编码"
              required
              class="lui-form-item--top lui-form-grid__span-all"
            >
              <div
                class="merchant-codes"
                :class="{ 'is-focused': merchantCodesFocused }"
                @click="focusMerchantInput"
              >
                <el-tag
                  v-for="(code, idx) in scenario.base.merchantCodes"
                  :key="'mc-' + code + '-' + idx"
                  size="small"
                  type="info"
                  effect="plain"
                  closable
                  disable-transitions
                  class="merchant-codes__tag"
                  @close="removeMerchantCode(idx)"
                >{{ code }}</el-tag>
                <input
                  ref="merchantCodeInputEl"
                  v-model="merchantCodeInput"
                  class="merchant-codes__input"
                  type="text"
                  placeholder="输入编码后回车或逗号自动添加，可录入多个商家编码"
                  @keydown.enter.prevent="commitMerchantCodes"
                  @input="onMerchantCodeInput"
                  @focus="merchantCodesFocused = true"
                  @blur="onMerchantInputBlur"
                >
              </div>
            </el-form-item>
          </el-form>
          </fieldset>

        <h3 class="section-title pricing-section__sub">计费场景配置</h3>
        <el-alert
          v-if="!isViewMode"
          type="warning"
          :closable="false"
          show-icon
          title="计费场景配置说明：定义什么单据，在什么条件下，计什么费；生效后，如果变更，会影响使用该场景报价的商家；"
          class="lui-inline-alert step-alert"
        />
        <fieldset class="pricing-fieldset">
        <div class="table-h-scroll">
        <el-table
          :data="scenario.billing.rules"
          border
          size="small"
          class="elements-table scene-rules-table"
        >
          <el-table-column label="交易类型" min-width="140">
            <template slot-scope="{ row }">
              <el-select
                v-model="row.tradeType"
                size="small"
                clearable
                placeholder="请选择"
                class="lui-select-no-tag-tip"
                :class="{ 'is-error': row._validateError && !row.tradeType }"
                @change="onRuleTradeTypeChange(row)"
              >
                <el-option
                  v-for="item in listTradeTypes(row.sourceSystem, row.docType)"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="来源系统" min-width="140">
            <template slot-scope="{ row }">
              <el-select
                v-model="row.sourceSystem"
                size="small"
                clearable
                placeholder="请选择"
                class="lui-select-no-tag-tip"
                :class="{ 'is-error': row._validateError && !row.sourceSystem }"
                @change="onRuleSourceChange(row)"
              >
                <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="单据类型" min-width="140">
            <template slot-scope="{ row }">
              <el-select
                v-model="row.docType"
                size="small"
                clearable
                placeholder="请选择"
                class="lui-select-no-tag-tip"
                :class="{ 'is-error': row._validateError && !row.docType }"
                @change="onRuleDocTypeChange(row)"
              >
                <el-option
                  v-for="item in listDocTypes(row.sourceSystem)"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="计费项目" min-width="120">
            <template slot-scope="{ row }">
              <el-select
                v-model="row.items"
                size="small"
                filterable
                clearable
                placeholder="请选择"
                class="lui-select-no-tag-tip"
                :class="{ 'is-error': row._validateError && !row.items }"
              >
                <el-option v-for="item in feeItemOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="计费节点" :min-width="isViewMode ? 200 : 160">
            <template slot-scope="{ row }">
              <el-select
                v-model="row.nodes"
                size="small"
                multiple
                :collapse-tags="!isViewMode"
                filterable
                clearable
                placeholder="请选择"
                class="lui-select-no-tag-tip"
                :class="{ 'is-error': row._validateError && !(row.nodes && row.nodes.length) }"
              >
                <el-option v-for="item in billingNodeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="计费条件" :min-width="isViewMode ? 520 : 320">
            <template slot-scope="{ row }">
              <div class="condition-row" :class="{ 'condition-row--nowrap': isViewMode }">
                <template v-if="row.conditions && row.conditions.length">
                  <el-tag
                    v-for="(cond, idx) in row.conditions"
                    :key="(cond.dimension || cond) + idx"
                    size="small"
                    type="info"
                    effect="plain"
                    disable-transitions
                    :class="[
                      'condition-tag',
                      { 'condition-tag--clickable': !isViewMode }
                    ]"
                    @click.native="!isViewMode && openConditionDialog(row)"
                  >{{ formatCondition(cond) }}</el-tag>
                </template>
                <template v-else>
                  <el-button
                    v-if="!isViewMode"
                    type="text"
                    class="element-ops__link element-ops__link--primary condition-config-link"
                    @click="openConditionDialog(row)"
                  >去配置</el-button>
                  <span v-else class="view-empty-text">—</span>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            v-if="!isViewMode"
            label="操作"
            width="88"
            align="left"
            header-align="left"
            fixed="right"
          >
            <template slot-scope="{ row }">
              <div class="scene-ops">
                <el-button
                  type="text"
                  class="element-ops__link element-ops__link--delete table-ops__link--delete"
                  @click="removeBillingRule(row.id)"
                >删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        </div>
        <div v-if="!isViewMode" class="elements-table__add-wrap">
          <button
            type="button"
            class="elements-table__add-row"
            @click="addBillingRule"
          >+新增</button>
        </div>
        </fieldset>
        </div>

      <div v-show="isViewMode || step === 1" class="pricing-section">
        <h3 class="section-title section-title-with-tip">
          <span class="section-title__text">定价规则</span>
          <el-tooltip
            placement="top"
            effect="dark"
            trigger="click"
            popper-class="quote-tip-popper"
            content="报价基准配置，请勾选本场景下通用的计费维度与模式"
          >
            <button type="button" class="field-tip-btn" aria-label="说明">
              <img
                class="field-tip-img"
                :src="assetTipIcon"
                alt=""
                width="14"
                height="14"
              >
            </button>
          </el-tooltip>
        </h3>
        <el-alert
          v-if="!isViewMode"
          type="warning"
          :closable="false"
          show-icon
          title="定价规则说明：定义该计费场景下可用的定价规则、定价维度；避免报价过程中使用了该规则但不通的情况；"
          class="lui-inline-alert step-alert"
        />
        <fieldset class="pricing-fieldset">
        <div class="quote-card">
          <el-form
            :model="scenario.quotation"
            class="lui-form-grid lui-form-grid--cols-1 quote-form"
            size="small"
            label-width="120px"
          >
            <el-form-item label="定价维度">
              <el-select
                v-model="scenario.quotation.dimensions"
                multiple
                :collapse-tags="!isViewMode"
                filterable
                clearable
                placeholder="请选择定价维度 (可多选)"
              >
                <el-option v-for="item in quoteDimensionOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item
              v-if="scenario.quotation.dimensions.length"
              label="维度别名"
              class="lui-form-item--top"
            >
              <div class="dimension-alias-grid">
                <el-table
                  v-for="row in dimensionAliasRows"
                  :key="'dim-alias-' + row.name"
                  :data="[row]"
                  size="small"
                  border
                  class="dimension-alias-table elements-table"
                >
                  <el-table-column label="维度名称" min-width="100">
                    <template slot-scope="{ row: item }">
                      <span>{{ item.name }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="别名" min-width="120">
                    <template slot-scope="{ row: item }">
                      <el-input
                        v-model="scenario.quotation.dimensionAliases[item.name]"
                        size="small"
                        class="lui-control"
                        placeholder="别名"
                      />
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-form-item>
            <el-form-item label="定价模式">
              <div class="mode-row">
                <el-select
                  v-model="scenario.quotation.modes"
                  multiple
                  :collapse-tags="!isViewMode"
                  filterable
                  clearable
                  placeholder="请选择定价模式 (可多选)"
                >
                  <el-option v-for="item in quoteModeOptions" :key="item" :label="item" :value="item" />
                </el-select>
                <el-button
                  v-if="!isViewMode"
                  type="primary"
                  plain
                  size="small"
                  @click="createModeVisible = true"
                >+ 新建报价模式</el-button>
              </div>
            </el-form-item>
            <el-form-item
              v-if="scenario.quotation.modes.length"
              label="模式详情"
              class="lui-form-item--top"
            >
              <div class="table-h-scroll">
              <el-table :data="modeDetailRows" size="small" border class="quote-sub-table quote-sub-table--full">
                <el-table-column prop="mode" label="报价模式" min-width="120" />
                <el-table-column label="别名" min-width="120">
                  <template slot-scope="{ row }">
                    <el-input
                      v-model="scenario.quotation.modeAliases[row.mode]"
                      size="small"
                      class="lui-control"
                      placeholder="别名"
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="formula" label="对应公式" min-width="300">
                  <template slot-scope="{ row }">
                    <span class="table-cell-full">{{ row.formula }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="dim" label="定价明细维度" min-width="280">
                  <template slot-scope="{ row }">
                    <span class="table-cell-full">{{ row.dim }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="priceItems" label="价格项" min-width="300">
                  <template slot-scope="{ row }">
                    <span class="table-cell-full">{{ row.priceItems }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-if="!isViewMode" label="操作" width="100" align="center">
                  <template slot-scope="{ row }">
                    <el-button type="text" @click="openAppControl(row.mode)">应用管控</el-button>
                  </template>
                </el-table-column>
              </el-table>
              </div>
            </el-form-item>
            <el-form-item>
              <span slot="label" class="field-label-with-tip">
                <span>单票报价阶梯</span>
                <el-tooltip
                  placement="top"
                  effect="dark"
                  popper-class="quote-tip-popper"
                  content="价格随数量变化的梯度区间，用于按重量、件数、体积等维度划分报价档位"
                >
                  <span class="field-tip-trigger" tabindex="0" aria-label="说明">?</span>
                </el-tooltip>
              </span>
              <el-select
                v-model="scenario.quotation.ladders"
                multiple
                :collapse-tags="!isViewMode"
                filterable
                clearable
                placeholder="请选择单票报价阶梯 (可多选)"
              >
                <el-option v-for="item in ladderOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <h3 class="section-title pricing-section__sub section-title-with-tip">
          <span class="section-title__text">扩展规则</span>
          <el-tooltip
            placement="top"
            effect="dark"
            trigger="click"
            popper-class="quote-tip-popper"
            content="说明内容待业务提供"
          >
            <span class="field-tip-trigger" tabindex="0" aria-label="说明">?</span>
          </el-tooltip>
        </h3>
        <div class="ext-block ext-block--plain">
          <el-form
            class="lui-form-grid lui-form-grid--cols-1 quote-form ext-rule-form"
            size="small"
            label-width="120px"
          >
            <el-form-item>
              <span slot="label" class="field-label-with-tip">
                <span class="ext-rule-form__label">合单规则</span>
                <el-tooltip
                  placement="top"
                  effect="dark"
                  popper-class="quote-tip-popper"
                  content="合单规则说明：合单规则用于定义标准计费流程之外的辅助处理逻辑，可将多个碎片化订单合并计算。"
                >
                  <span class="field-tip-trigger" tabindex="0" aria-label="说明">?</span>
                </el-tooltip>
              </span>
              <div class="ext-block__switch">
                <span class="ext-block__status">{{ scenario.extension.enableMerge ? '已启用' : '未启用' }}</span>
                <el-switch v-if="!isViewMode" v-model="scenario.extension.enableMerge" />
              </div>
            </el-form-item>
          </el-form>
          <el-form
            v-if="scenario.extension.enableMerge"
            class="lui-form-grid quote-form ext-merge-fields"
            size="small"
            label-width="112px"
          >
            <el-form-item label="可用合单维度">
              <el-select v-model="scenario.extension.mergeDimensions" multiple :collapse-tags="!isViewMode" clearable placeholder="请选择">
                <el-option v-for="item in mergeDimOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="可用合单对象">
              <el-select v-model="scenario.extension.mergeTargets" multiple :collapse-tags="!isViewMode" clearable placeholder="请选择">
                <el-option v-for="item in mergeTargetOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item label="可用分摊依据">
              <el-select v-model="scenario.extension.apportionBasis" multiple :collapse-tags="!isViewMode" clearable placeholder="请选择">
                <el-option v-for="item in apportionOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        </fieldset>
      </div>

      <div v-show="!isViewMode && step === 2" class="pricing-section">
        <fieldset class="pricing-fieldset">
        <div class="sim-card">
          <h4 class="section-title">测算参数配置</h4>
          <el-form class="lui-form-grid" size="small">
            <el-form-item label="测算类型" required>
              <el-radio-group v-model="scenario.sim.type" @change="onSimTypeChange">
                <el-radio label="模拟">模拟测算</el-radio>
                <el-radio label="实单">实单测算</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="报价模式" required>
              <el-select v-model="scenario.sim.mode" clearable placeholder="请选择" @change="onSimModeChange">
                <el-option
                  v-for="item in simModeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
            <template v-if="scenario.sim.type === '实单'">
              <el-form-item label="运单号" required>
                <el-input v-model="scenario.sim.orderNo" placeholder="输入真实运单号验证计费结果" />
              </el-form-item>
            </template>
          </el-form>
        </div>
        <div v-if="scenario.sim.type === '模拟' && scenario.sim.mode" class="sim-card">
          <h4 class="section-title">计费因子</h4>
          <el-form class="lui-form-grid sim-param-form" size="small" label-width="160px">
            <el-form-item
              v-for="item in currentSimConfig.factors"
              :key="item.key"
              :label="item.label"
              required
            >
              <el-input v-model="scenario.sim.factors[item.key]" :placeholder="item.placeholder" />
            </el-form-item>
          </el-form>
        </div>
        <div v-if="scenario.sim.type === '模拟' && scenario.sim.mode" class="sim-card">
          <h4 class="section-title">价格项</h4>
          <el-form class="lui-form-grid sim-param-form" size="small" label-width="160px">
            <el-form-item
              v-for="item in currentSimConfig.priceItems"
              :key="item.key"
              :label="item.label"
              required
            >
              <el-input v-model="scenario.sim.prices[item.key]" :placeholder="item.placeholder" />
            </el-form-item>
          </el-form>
        </div>
        </fieldset>
      </div>
      </div>

      <div v-if="!(isViewMode && embedded)" class="wizard-footer">
        <template v-if="isViewMode">
          <el-button size="small" @click="$emit('back')">返回</el-button>
        </template>
        <template v-else>
          <el-button size="small" :disabled="step === 0" @click="goPrevStep">上一步</el-button>
          <el-button v-if="step < 2" type="primary" size="small" @click="goNextStep">下一步</el-button>
          <template v-else>
            <el-button type="primary" size="small" @click="runSim">开始测算</el-button>
            <el-button type="primary" size="small" @click="publishPricing">发布</el-button>
          </template>
        </template>
      </div>
    </div>

    <el-dialog
      :title="isViewMode ? '计费条件' : '计费条件编辑'"
      :visible.sync="conditionVisible"
      width="720px"
      custom-class="lui-form-dialog condition-dialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <fieldset class="pricing-fieldset" :disabled="isViewMode">
      <div v-for="(cond, idx) in tempConditions" :key="cond.id" class="condition-edit-row">
        <el-select
          v-model="cond.dimension"
          size="small"
          placeholder="维度"
          class="condition-edit-row__dim"
          @change="onTempDimChange(cond)"
        >
          <el-option v-for="item in conditionDimOptions" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
        <el-select
          v-model="cond.operator"
          size="small"
          placeholder="比较符"
          class="condition-edit-row__op"
        >
          <el-option
            v-for="item in conditionOperatorOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select
          v-if="conditionValueOptions(cond.dimension).length"
          v-model="cond.values"
          size="small"
          multiple
          collapse-tags
          placeholder="条件值"
          class="condition-edit-row__value"
        >
          <el-option
            v-for="item in conditionValueOptions(cond.dimension)"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          />
        </el-select>
        <el-input
          v-else
          v-model="cond.inputValue"
          size="small"
          placeholder="请直接输入"
          class="condition-edit-row__value"
        />
        <div v-if="!isViewMode" class="condition-edit-row__actions">
          <el-button
            v-if="tempConditions.length > 1"
            type="text"
            class="condition-edit-row__link condition-edit-row__link--delete table-ops__link--delete"
            @click="tempConditions.splice(idx, 1)"
          >删除</el-button>
          <el-button
            v-if="idx === tempConditions.length - 1"
            type="text"
            class="condition-edit-row__link condition-edit-row__link--add"
            @click="addTempCondition"
          >添加</el-button>
        </div>
      </div>
      </fieldset>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="isViewMode" size="small" type="primary" @click="conditionVisible = false">关闭</el-button>
        <template v-else>
          <el-button size="small" @click="conditionVisible = false">取消</el-button>
          <el-button type="primary" size="small" @click="saveConditions">保存</el-button>
        </template>
      </div>
    </el-dialog>

    <el-dialog
      title="测算结果"
      :visible.sync="simResultVisible"
      width="560px"
      custom-class="lui-form-dialog sim-result-dialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <div v-if="scenario.sim.result" class="sim-result-dialog__body">
        <div class="sim-result-dialog__total">
          <span class="sim-result-dialog__currency">¥</span>
          <span class="sim-result-dialog__amount">{{ scenario.sim.result.total }}</span>
        </div>
        <el-timeline class="sim-result-dialog__timeline">
          <el-timeline-item v-for="(item, idx) in scenario.sim.result.path" :key="idx">{{ item }}</el-timeline-item>
        </el-timeline>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="simResultVisible = false">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="新建报价模式"
      :visible.sync="createModeVisible"
      width="960px"
      custom-class="lui-form-dialog lui-dialog--lg"
      append-to-body
      :close-on-click-modal="false"
      @open="resetNewMode"
    >
      <div class="create-mode">
        <div class="create-mode__col">
          <h3 class="section-title">报价模式定义</h3>
          <el-form class="create-mode__form" size="small" label-position="top">
            <el-form-item label="报价模式名称" required>
              <el-input v-model="newMode.name" placeholder="请输入报价模式名称" />
            </el-form-item>
            <div class="create-mode__pair">
              <el-form-item label="计费因子">
                <el-select
                  v-model="newMode.factors"
                  multiple
                  collapse-tags
                  clearable
                  placeholder="请选择计费因子"
                  @change="syncDemoValues"
                >
                  <el-option
                    v-for="opt in factorOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="价格项">
                <el-select
                  v-model="newMode.priceItems"
                  multiple
                  collapse-tags
                  clearable
                  placeholder="请选择价格项"
                  @change="syncDemoValues"
                >
                  <el-option
                    v-for="opt in priceItemOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </div>
            <el-form-item label="报价模式公式内容" required>
              <div class="formula-builder">
                <div
                  v-for="group in formulaGroups"
                  :key="group.label"
                  class="formula-builder__row"
                >
                  <span class="formula-builder__label">{{ group.label }}:</span>
                  <div class="formula-builder__tags">
                    <button
                      v-for="sym in group.items"
                      :key="group.label + sym"
                      type="button"
                      class="formula-builder__tag"
                      @click="appendFormula(sym)"
                    >{{ sym }}</button>
                  </div>
                </div>
              </div>
              <el-input
                v-model="newMode.formula"
                type="textarea"
                :rows="3"
                placeholder="请输入或点击上方按钮组合公式"
                class="formula-builder__input"
              />
            </el-form-item>
            <el-form-item label="公式描述" required>
              <el-input v-model="newMode.desc" type="textarea" :rows="2" placeholder="请描述该公式的业务含义" />
            </el-form-item>
          </el-form>
        </div>
        <div class="create-mode__col create-mode__col--side">
          <h3 class="section-title">报价模式测算</h3>
          <p class="field-tip">录入计费因子和价格项的值，输出计算过程和测算结果。</p>
          <el-form v-if="newModeDemoFields.length" class="create-mode__demo-grid" size="small" label-position="top">
            <el-form-item
              v-for="field in newModeDemoFields"
              :key="field.key"
              :label="field.label"
            >
              <el-input v-model="newMode.demoValues[field.key]" placeholder="请输入" />
            </el-form-item>
          </el-form>
          <p v-else class="field-tip">请先选择计费因子或价格项</p>
          <div class="demo-calc">
            <div>计算过程：</div>
            <pre>{{ newModeDemoProcess }}</pre>
            <div class="demo-calc__total">测算结果：<strong>¥ {{ newModeDemoTotal }}</strong></div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="createModeVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="saveNewMode">保存报价模式</el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="'应用管控 - ' + (appControlMode || '')"
      :visible.sync="appControlVisible"
      width="640px"
      custom-class="lui-form-dialog lui-dialog--md"
      append-to-body
      :close-on-click-modal="false"
    >
      <h3 class="section-title">定价维度</h3>
      <el-table :data="appControlDims" size="small">
        <el-table-column prop="name" label="维度名称" min-width="160" />
        <el-table-column label="别名" min-width="140">
          <template slot-scope="{ row }">
            <el-input v-model="row.alias" size="small" placeholder="别名" />
          </template>
        </el-table-column>
      </el-table>
      <h3 class="section-title" style="margin-top: 16px">价格项</h3>
      <el-table :data="appControlPrices" size="small">
        <el-table-column prop="name" label="价格项" min-width="160" />
        <el-table-column label="别名" min-width="140">
          <template slot-scope="{ row }">
            <el-input v-model="row.alias" size="small" placeholder="输入别名" />
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="appControlVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="saveAppControl">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { PRODUCT_FEE_ROWS } from '../mock/data'
import LuiArrowSteps from '../components/LuiArrowSteps.vue'
import {
  listSourceSystems,
  listDocTypes,
  listTradeTypes,
  resolveParentsByTradeType,
  resolveSourceByDocType,
  SCENARIOS_BY_PRICING_ENTRY
} from '../mock/cascade'
import {
  FACTOR_OPTIONS,
  PRICE_ITEM_OPTIONS,
  DEFAULT_NEW_MODE,
  buildDemoFields,
  evaluateFormulaDemo,
  appendFormulaToken
} from '../utils/quoteModeFormula'
import { publicAsset } from '../utils/publicAsset'

const SIM_MODE_CONFIG = {
  首续重计费: {
    factors: [{ key: 'weight', label: '实重 (kg)', placeholder: '请输入实重' }],
    priceItems: [
      { key: 'firstWeightLimit', label: '首重阈值 (kg)', placeholder: '如 1 或 3' },
      { key: 'firstWeightPrice', label: '首重价 (元)', placeholder: '如 10.00' },
      { key: 'continueUnitPrice', label: '续重单价 (元/kg)', placeholder: '如 2.50' }
    ]
  },
  按件型: {
    factors: [{ key: 'pieceCount', label: '件数 (件)', placeholder: '请输入件数' }],
    priceItems: [
      { key: 'unitPrice', label: '单件价 (元)', placeholder: '如 5.00' },
      { key: 'minFee', label: '起步价 (元)', placeholder: '如 10.00' }
    ]
  },
  按方: {
    factors: [{ key: 'volume', label: '体积 (m³)', placeholder: '请输入体积' }],
    priceItems: [
      { key: 'cbmPrice', label: '方单价 (元/m³)', placeholder: '如 120.00' },
      { key: 'minFee', label: '起步价 (元)', placeholder: '如 50.00' }
    ]
  },
  一口价: {
    factors: [],
    priceItems: [{ key: 'flatFee', label: '一口价 (元)', placeholder: '如 200.00' }]
  },
  百分比提成: {
    factors: [{ key: 'baseAmount', label: '基数金额 (元)', placeholder: '请输入基数金额' }],
    priceItems: [
      { key: 'rate', label: '提成比例 (%)', placeholder: '如 5 表示 5%' },
      { key: 'minFee', label: '最低收费 (元)', placeholder: '可不填' }
    ]
  }
}

let ruleSeq = 2

function createBillingRule(overrides = {}) {
  return {
    id: `rule-${Date.now()}-${ruleSeq++}`,
    name: '场景规则',
    isBase: false,
    billingType: '计费+统计',
    sourceSystem: '',
    docType: '',
    tradeType: '',
    items: '',
    nodes: [],
    conditions: [],
    _validateError: false,
    ...overrides
  }
}

export default {
  name: 'OnestopPricing',
  components: { LuiArrowSteps },
  props: {
    detailMode: {
      type: String,
      default: 'create'
    },
    embedded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const initialRule = createBillingRule({
      id: 'rule-1',
      name: '场景规则',
      isBase: true
    })
    return {
      mode: 'scenario',
      step: 0,
      maxReachedStep: 0,
      pricingEntry: '业务场景定价',
      pricingSteps: [
        { title: '基础信息' },
        { title: '定价规则' },
        { title: '模拟测算' }
      ],
      billingEnabled: true,
      statisticsEnabled: true,
      merchantCodeInput: '',
      merchantCodesFocused: false,
      activeBillingRuleId: 'rule-1',
      conditionVisible: false,
      simResultVisible: false,
      createModeVisible: false,
      tempConditions: [],
      feeItemOptions: ['运费', '保价费', '出库费', '包装费', '装卸费', '上楼费', '快递运费', '快运运费'],
      billingNodeOptions: ['揽收', '妥投', '出库', '入库', '中转'],
      quoteDimensionOptions: ['始发城市', '目的城市', '商家业务类型', '配送区域', '时效等级'],
      quoteModeOptions: ['首续重计费', '按件型', '按方', '一口价', '百分比提成'],
      ladderOptions: ['重量', '件数', '体积', '金额', '距离'],
      mergeDimOptions: ['商家订单号', '运单号', '收件人手机号'],
      mergeTargetOptions: ['件数', '重量', '体积', '金额'],
      apportionOptions: ['按重量分摊', '按件数分摊', '按体积分摊', '按金额分摊'],
      statDimOptions: ['商家', '始发城市', '目的城市', '产品类型'],
      statTargetOptions: ['票数', '重量', '体积', '金额'],
      conditionDimOptions: [
        { code: '101', name: '单据类型', options: [{ code: '01', name: '正向单据' }, { code: '02', name: '逆向单据' }] },
        { code: '102', name: '是否保价', options: [{ code: '1', name: '是' }, { code: '0', name: '否' }] },
        { code: '103', name: '产品类型', options: [{ code: 'P1', name: '特快重货' }, { code: 'P2', name: '标快重货' }] },
        { code: '122', name: '支付方式', options: [{ code: '01', name: '在线支付' }, { code: '02', name: '货到付款' }] },
        { code: '106', name: '重量', options: [] }
      ],
      conditionOperatorOptions: [
        { value: '=', label: '等于' },
        { value: '!=', label: '不等于' },
        { value: '>', label: '大于' },
        { value: '>=', label: '大于等于' },
        { value: '<', label: '小于' },
        { value: '<=', label: '小于等于' },
        { value: 'in', label: '包含' },
        { value: 'notIn', label: '不包含' }
      ],
      formulaGroups: [
        {
          label: '计算符号',
          items: ['+', '-', '*', '/', '<', '<=', '>', '>=', '=', '(', ')']
        },
        {
          label: '计算函数',
          items: ['max', 'min', 'which']
        },
        {
          label: '特殊变量',
          items: ['计费重量', '油价系数']
        }
      ],
      factorOptions: FACTOR_OPTIONS,
      priceItemOptions: PRICE_ITEM_OPTIONS,
      modeDetailMap: {
        首续重计费: { formula: 'first_continue_weight_new_min_charge', dim: '国际起始地(157); 清关模式(158);', priceItems: '最低收费(107); 首重(108); 首重价格(109);' },
        按件型: { formula: 'carton_count_box_gauge', dim: '冷医商品温层(315);', priceItems: '元/箱(128);' },
        按方: { formula: 'volume_charge', dim: '起始地; 目的地;', priceItems: '元/方(129);' },
        一口价: { formula: 'fixed_price', dim: '-', priceItems: '固定金额(130);' },
        百分比提成: { formula: 'percentage_commission', dim: '运营模式(374);', priceItems: '提成比例(131);' }
      },
      simModeConfig: SIM_MODE_CONFIG,
      appControlVisible: false,
      appControlMode: '',
      appControlDims: [],
      appControlPrices: [],
      newMode: DEFAULT_NEW_MODE(),
      product: {
        productName: '京东标快',
        productCode: 'P-THS-201810',
        category: '运配',
        owner: '杨庚',
        startDate: '2026-03-03',
        endDate: '',
        isMain: '是',
        version: '20.0',
        priceManage: '是',
        multiCurrency: '是',
        desc: '25年8月价格调整'
      },
      feeRows: PRODUCT_FEE_ROWS,
      sourceOptions: listSourceSystems(),
      scenario: {
        base: {
          scenario: '',
          product: '',
          owner: '',
          range: [],
          isLimitMerchant: false,
          merchantCodes: [],
          desc: ''
        },
        billing: {
          rules: [initialRule]
        },
        quotation: {
          dimensions: [],
          dimensionAliases: {},
          modes: [],
          modeAliases: {},
          ladders: []
        },
        extension: {
          enableMerge: true,
          mergeDimensions: ['商家订单号'],
          mergeTargets: ['件数'],
          apportionBasis: ['按重量分摊'],
          enableStat: false,
          statDimensions: [],
          statTargets: []
        },
        sim: {
          type: '模拟',
          mode: '',
          orderNo: '',
          orderWeight: '',
          factors: {},
          prices: {},
          result: null
        }
      }
    }
  },
  created() {
    if (this.isViewMode) {
      this.hydrateViewPreview()
    }
  },
  computed: {
    assetTipIcon() {
      return publicAsset('d2c-assets/tips/icon-question.png')
    },
    isViewMode() {
      return this.detailMode === 'view'
    },
    showStatEntry() {
      return this.billingEnabled && this.statisticsEnabled
    },
    statSwitchDisabled() {
      return !this.showStatEntry
    },
    scenarioOptions() {
      return SCENARIOS_BY_PRICING_ENTRY[this.pricingEntry] || []
    },
    activeBillingRule() {
      return (this.scenario.billing.rules || []).find(r => r.id === this.activeBillingRuleId) || null
    },
    duplicateBillingTypes() {
      const counts = {}
      ;(this.scenario.billing.rules || []).forEach(rule => {
        const type = (rule.billingType || '').trim()
        if (!type) return
        counts[type] = (counts[type] || 0) + 1
      })
      return Object.keys(counts).filter(type => counts[type] >= 2)
    },
    dimensionAliasRows() {
      return (this.scenario.quotation.dimensions || []).map(name => ({ name }))
    },
    modeDetailRows() {
      return (this.scenario.quotation.modes || []).map(mode => {
        const detail = this.modeDetailMap[mode] || { formula: '-', dim: '-', priceItems: '-' }
        return { mode, ...detail }
      })
    },
    simModeOptions() {
      const selected = this.scenario.quotation.modes || []
      return selected.length ? selected : Object.keys(this.simModeConfig)
    },
    currentSimConfig() {
      return this.simModeConfig[this.scenario.sim.mode] || { factors: [], priceItems: [] }
    },
    newModeDemoFields() {
      return buildDemoFields(this.newMode.factors, this.newMode.priceItems)
    },
    newModeDemoResult() {
      return evaluateFormulaDemo(this.newMode.formula, this.newMode.demoValues)
    },
    newModeDemoProcess() {
      return (this.newModeDemoResult.lines || []).join('\n')
    },
    newModeDemoTotal() {
      return this.newModeDemoResult.total || '0.00'
    }
  },
  watch: {
    'scenario.quotation.dimensions': {
      immediate: true,
      handler(list) {
        ;(list || []).forEach(name => {
          if (this.scenario.quotation.dimensionAliases[name] === undefined) {
            this.$set(this.scenario.quotation.dimensionAliases, name, '')
          }
        })
      }
    },
    'scenario.quotation.modes': {
      immediate: true,
      handler(list) {
        ;(list || []).forEach(mode => {
          if (this.scenario.quotation.modeAliases[mode] === undefined) {
            this.$set(this.scenario.quotation.modeAliases, mode, '')
          }
        })
        if (this.scenario.sim.mode && !(list || []).includes(this.scenario.sim.mode) && (list || []).length) {
          this.scenario.sim.mode = ''
          this.scenario.sim.result = null
        }
      }
    }
  },
  methods: {
    listDocTypes,
    listTradeTypes,
    switchMode(mode) {
      this.mode = mode
      if (mode === 'scenario') {
        this.pricingEntry = '业务场景定价'
        this.step = 0
        this.maxReachedStep = 0
      }
    },
    onStepChange(index) {
      if (index === this.step) return

      // 回看：仅允许已解锁且该步仍填写完整的步骤
      if (index < this.step) {
        if (index > this.maxReachedStep) return
        const backCheck = this.validateStep(index)
        if (!backCheck.ok) {
          this.$message.warning(backCheck.message || '请先完善该步骤必填项后再回看')
          return
        }
        this.step = index
        return
      }

      // 前进：未解锁步骤不可跳过；已解锁步骤可点回，但途经步骤需仍有效
      if (index > this.maxReachedStep) {
        if (index !== this.step + 1 || index !== this.maxReachedStep + 1) {
          this.$message.warning('请按流程逐步完成，不可跳步')
          return
        }
      }

      for (let i = this.step; i < index; i += 1) {
        const check = this.validateStep(i)
        if (!check.ok) {
          if (i === 0) this.markBillingRuleErrors()
          this.$message.warning(check.message || '请完成本步骤必填项后再进入下一步')
          return
        }
      }

      this.step = index
      this.maxReachedStep = Math.max(this.maxReachedStep, index)
    },
    validateStep(index) {
      if (index === 0) {
        const baseCheck = this.validateBaseInfo()
        if (!baseCheck.ok) return baseCheck
        if (!this.validateBillingRules()) {
          return { ok: false, message: '请完善计费场景中的必填项后再进入下一步' }
        }
        return { ok: true }
      }
      if (index === 1) {
        return this.validateQuotationRequired()
      }
      return { ok: true }
    },
    isBillingRuleIncomplete(row) {
      if (!row) return true
      return !row.sourceSystem || !row.docType || !row.tradeType || !row.items || !(row.nodes && row.nodes.length)
    },
    validateBillingRules() {
      const rules = this.scenario.billing.rules || []
      if (!rules.length) return false
      return rules.every(row => !this.isBillingRuleIncomplete(row))
    },
    markBillingRuleErrors() {
      ;(this.scenario.billing.rules || []).forEach(row => {
        this.$set(row, '_validateError', this.isBillingRuleIncomplete(row))
      })
    },
    goNextStep() {
      const curCheck = this.validateStep(this.step)
      if (!curCheck.ok) {
        if (this.step === 0) this.markBillingRuleErrors()
        this.$message.warning(curCheck.message || '请完成本步骤必填项后再进入下一步')
        return
      }
      const next = this.step + 1
      this.step = next
      this.maxReachedStep = Math.max(this.maxReachedStep, next)
    },
    goPrevStep() {
      if (this.step <= 0) return
      this.step -= 1
    },
    formatRangeText(range) {
      if (!(range && range.length === 2 && range[0] && range[1])) return '—'
      return `${range[0]} 至 ${range[1]}`
    },
    hydrateViewPreview() {
      const dims = ['始发城市', '目的城市', '商家业务类型', '配送区域', '时效等级']
      const modes = ['首续重计费', '按件型']
      this.scenario.base = {
        scenario: '逆向退换货',
        product: 'P001',
        owner: 'zhangsan',
        range: ['2026-01-01', '2026-12-31'],
        isLimitMerchant: false,
        merchantCodes: [],
        desc: '逆向退换货场景定价，适用于电商退货回仓计费'
      }
      this.scenario.billing.rules = [
        createBillingRule({
          id: 'rule-view-1',
          name: '场景规则',
          isBase: true,
          sourceSystem: '青龙系统',
          docType: '青龙运单',
          tradeType: 'KA青龙运单',
          items: '运费',
          nodes: ['揽收', '妥投'],
          conditions: [
            { dimension: '101', operator: 'in', values: ['01', '02'], inputValue: '' },
            { dimension: '106', operator: '>', values: [], inputValue: '1' }
          ]
        }),
        createBillingRule({
          id: 'rule-view-2',
          name: '场景规则 2',
          sourceSystem: '青龙系统',
          docType: '青龙运单',
          tradeType: 'KA青龙运单',
          items: '运费',
          nodes: ['揽收', '妥投'],
          conditions: [
            { dimension: '101', operator: '=', values: ['01'], inputValue: '' }
          ]
        })
      ]
      this.activeBillingRuleId = 'rule-view-1'
      this.scenario.quotation.dimensions = dims.slice()
      this.scenario.quotation.modes = modes.slice()
      this.scenario.quotation.ladders = ['重量', '件数']
      const aliases = {}
      dims.forEach(name => {
        aliases[name] = name
      })
      this.scenario.quotation.dimensionAliases = aliases
      this.scenario.quotation.modeAliases = {
        首续重计费: '首续重',
        按件型: '件型价'
      }
      this.scenario.extension = {
        enableMerge: true,
        mergeDimensions: ['商家订单号'],
        mergeTargets: ['件数'],
        apportionBasis: ['按重量分摊']
      }
    },
    onLimitMerchantChange(val) {
      if (!val) {
        this.scenario.base.merchantCodes = []
        this.merchantCodeInput = ''
      }
    },
    focusMerchantInput() {
      const el = this.$refs.merchantCodeInputEl
      if (el && el.focus) el.focus()
    },
    onMerchantInputBlur() {
      this.merchantCodesFocused = false
      this.commitMerchantCodes()
    },
    onMerchantCodeInput() {
      // 输入逗号/顿号时自动分割落标签
      if (/[,，、]/.test(this.merchantCodeInput || '')) {
        this.commitMerchantCodes()
      }
    },
    commitMerchantCodes() {
      const raw = this.merchantCodeInput || ''
      const parts = raw.split(/[,，、\s]+/).map(s => s.trim()).filter(Boolean)
      if (!parts.length) return
      parts.forEach(code => {
        if (!this.scenario.base.merchantCodes.includes(code)) {
          this.scenario.base.merchantCodes.push(code)
        }
      })
      this.merchantCodeInput = ''
    },
    removeMerchantCode(index) {
      this.scenario.base.merchantCodes.splice(index, 1)
    },
    syncCascadeValue(row, field, options) {
      if (row[field] && !options.some(o => o.value === row[field])) {
        row[field] = ''
      }
    },
    onRuleSourceChange(row) {
      this.syncCascadeValue(row, 'docType', listDocTypes(row.sourceSystem))
      this.syncCascadeValue(row, 'tradeType', listTradeTypes(row.sourceSystem, row.docType))
    },
    onRuleDocTypeChange(row) {
      if (row.docType && !row.sourceSystem) {
        row.sourceSystem = resolveSourceByDocType(row.docType, row.tradeType)
      }
      this.syncCascadeValue(row, 'tradeType', listTradeTypes(row.sourceSystem, row.docType))
    },
    onRuleTradeTypeChange(row) {
      if (!row.tradeType) return
      const parents = resolveParentsByTradeType(row.tradeType, {
        sourceSystem: row.sourceSystem,
        docType: row.docType
      })
      if (parents.sourceSystem) row.sourceSystem = parents.sourceSystem
      if (parents.docType) row.docType = parents.docType
    },
    addBillingRule() {
      const rule = createBillingRule({
        name: `场景规则 ${this.scenario.billing.rules.length + 1}`
      })
      this.scenario.billing.rules.push(rule)
      this.activeBillingRuleId = rule.id
    },
    removeBillingRule(id) {
      const rules = this.scenario.billing.rules
      const idx = rules.findIndex(r => r.id === id)
      if (idx < 0) return
      const removed = rules.splice(idx, 1)[0]
      if (removed.isBase && rules[0]) {
        rules[0].isBase = true
      }
      if (this.activeBillingRuleId === id) {
        this.activeBillingRuleId = rules.length ? rules[Math.max(0, idx - 1)].id : ''
      }
    },
    setDefaultBillingRule(id) {
      this.scenario.billing.rules.forEach(rule => {
        rule.isBase = rule.id === id
      })
    },
    isDuplicateBillingStrategy(rule) {
      if (!rule || !rule.billingType) return false
      return this.duplicateBillingTypes.indexOf(rule.billingType) >= 0
    },
    duplicateBillingTip(rule) {
      const names = (this.scenario.billing.rules || [])
        .filter(item => item.billingType === rule.billingType)
        .map(item => item.name)
      return `重复提示：发现配置完全相同的场景：${names.join('、')}，请注意修改避免冲突。`
    },
    formatCondition(cond) {
      if (typeof cond === 'string') return cond
      const dim = (this.conditionDimOptions.find(d => d.code === cond.dimension) || {}).name || cond.dimension
      const op = (this.conditionOperatorOptions.find(o => o.value === (cond.operator || '=')) || {}).label || cond.operator || '等于'
      const opts = this.conditionValueOptions(cond.dimension)
      if (opts.length) {
        const labels = (cond.values || []).map(code => {
          const hit = opts.find(o => o.code === code)
          return hit ? hit.name : code
        })
        return `${dim} ${op} ${labels.join(',')}`
      }
      return `${dim} ${op} ${cond.inputValue || ''}`
    },
    conditionValueOptions(dimension) {
      const dim = this.conditionDimOptions.find(d => d.code === dimension)
      return (dim && dim.options) || []
    },
    openConditionDialog(row) {
      const target = row || this.activeBillingRule
      if (!target) return
      this.activeBillingRuleId = target.id
      const list = target.conditions || []
      this.tempConditions = list.length
        ? list.map((c, i) => ({
          id: `c-${i}`,
          dimension: c.dimension || '',
          operator: c.operator || '=',
          values: (c.values || []).slice(),
          inputValue: c.inputValue || ''
        }))
        : [{ id: 'c-0', dimension: '', operator: '=', values: [], inputValue: '' }]
      this.conditionVisible = true
    },
    addTempCondition() {
      this.tempConditions.push({
        id: `c-${Date.now()}`,
        dimension: '',
        operator: '=',
        values: [],
        inputValue: ''
      })
    },
    onTempDimChange(cond) {
      cond.values = []
      cond.inputValue = ''
      if (!cond.operator) cond.operator = '='
    },
    saveConditions() {
      if (!this.activeBillingRule) return
      const incomplete = (this.tempConditions || []).some((c) => {
        if (!c.dimension || !c.operator) return true
        const opts = this.conditionValueOptions(c.dimension)
        if (opts.length) return !(c.values && c.values.length)
        return !(c.inputValue && String(c.inputValue).trim())
      })
      if (incomplete) {
        this.$message.warning('存在未填写的计费条件，请填写完整或删除后再保存')
        return
      }
      this.activeBillingRule.conditions = this.tempConditions.map(c => ({
        dimension: c.dimension,
        operator: c.operator || '=',
        values: (c.values || []).slice(),
        inputValue: c.inputValue || ''
      }))
      this.conditionVisible = false
    },
    appendFormula(sym) {
      this.newMode.formula = appendFormulaToken(this.newMode.formula, sym)
    },
    resetNewMode() {
      this.newMode = DEFAULT_NEW_MODE()
    },
    syncDemoValues() {
      const next = { ...(this.newMode.demoValues || {}) }
      this.newModeDemoFields.forEach(field => {
        if (next[field.key] === undefined) {
          this.$set(next, field.key, '')
        }
      })
      // 默认样例值（与产品原型一致）
      if (next['计费重量'] === '') next['计费重量'] = '2.5'
      if (next['首重单价'] === '') next['首重单价'] = '12'
      if (next['续重单价'] === '') next['续重单价'] = '5'
      this.newMode.demoValues = next
    },
    saveNewMode() {
      if (!this.newMode.name) {
        this.$message.warning('请填写报价模式名称')
        return
      }
      if (!this.newMode.formula) {
        this.$message.warning('请填写报价模式公式内容')
        return
      }
      if (!this.newMode.desc) {
        this.$message.warning('请填写公式描述')
        return
      }
      if (!this.quoteModeOptions.includes(this.newMode.name)) {
        this.quoteModeOptions.push(this.newMode.name)
      }
      if (!this.scenario.quotation.modes.includes(this.newMode.name)) {
        this.scenario.quotation.modes.push(this.newMode.name)
      }
      this.$set(this.modeDetailMap, this.newMode.name, {
        formula: this.newMode.formula || '-',
        dim: '-',
        priceItems: (this.newMode.priceItems || []).join('; ') || '-'
      })
      this.createModeVisible = false
      this.$message.success('报价模式已保存（预览）')
    },
    openAppControl(mode) {
      this.appControlMode = mode
      const detail = this.modeDetailMap[mode] || {}
      this.appControlDims = (detail.dim || '-')
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .filter(s => s !== '-')
        .map(name => ({ name, alias: '' }))
      if (!this.appControlDims.length) {
        this.appControlDims = [{ name: '默认维度', alias: '' }]
      }
      this.appControlPrices = (detail.priceItems || '-')
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .filter(s => s !== '-')
        .map(name => ({ name, limit: '无限制', alias: '' }))
      if (!this.appControlPrices.length) {
        this.appControlPrices = [{ name: '默认价格项', limit: '无限制', alias: '' }]
      }
      this.appControlVisible = true
    },
    saveAppControl() {
      this.$message.success('应用管控已保存（预览）')
      this.appControlVisible = false
    },
    onSimTypeChange() {
      this.scenario.sim.result = null
    },
    formatNow() {
      const d = new Date()
      const p = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
    },
    validateBaseInfo() {
      const base = this.scenario.base || {}
      if (!base.scenario) return { ok: false, message: '请选择业务场景' }
      if (!base.product) return { ok: false, message: '请选择关联产品' }
      if (!(base.owner || '').trim()) return { ok: false, message: '请填写责任人' }
      if (!(base.range && base.range.length === 2)) return { ok: false, message: '请选择有效期时间' }
      if (base.isLimitMerchant && !(base.merchantCodes && base.merchantCodes.length)) {
        return { ok: false, message: '请填写限定商家编码' }
      }
      return { ok: true }
    },
    validateQuotationRequired() {
      const q = this.scenario.quotation || {}
      if (!(q.dimensions && q.dimensions.length)) return { ok: false, message: '请选择定价维度' }
      if (!(q.modes && q.modes.length)) return { ok: false, message: '请选择定价模式' }
      if (!(q.ladders && q.ladders.length)) return { ok: false, message: '请选择单票报价阶梯' }
      return { ok: true }
    },
    publishPricing() {
      const baseCheck = this.validateBaseInfo()
      if (!baseCheck.ok) {
        this.step = 0
        this.$message.warning(baseCheck.message)
        return
      }
      if (!this.validateBillingRules()) {
        this.markBillingRuleErrors()
        this.step = 0
        this.$message.warning('存在未填写的计费场景行，请填写完整或删除后再发布')
        return
      }
      const quoteCheck = this.validateQuotationRequired()
      if (!quoteCheck.ok) {
        this.step = 1
        this.$message.warning(quoteCheck.message)
        return
      }
      this.$confirm('确定发布本次定价设置吗？', '确定发布', { type: 'warning' })
        .then(() => {
          const scenarioName = this.scenario.base.scenario || '未命名场景'
          this.$emit('published', {
            id: `P-${Date.now()}`,
            name: `${scenarioName}-场景价`,
            mode: '场景定价',
            target: scenarioName,
            status: '已启用',
            creator: '预览用户',
            createdAt: this.formatNow()
          })
        })
        .catch(() => {})
    },
    onSimModeChange() {
      this.scenario.sim.factors = {}
      this.scenario.sim.prices = {}
      this.scenario.sim.result = null
      const cfg = this.currentSimConfig
      cfg.factors.forEach(f => this.$set(this.scenario.sim.factors, f.key, ''))
      cfg.priceItems.forEach(p => this.$set(this.scenario.sim.prices, p.key, ''))
      if (this.scenario.sim.mode === '首续重计费') {
        this.scenario.sim.factors.weight = '10'
        this.scenario.sim.prices.firstWeightLimit = '1'
        this.scenario.sim.prices.firstWeightPrice = '2'
        this.scenario.sim.prices.continueUnitPrice = '3'
      }
    },
    runSim() {
      const mode = this.scenario.sim.mode
      if (!mode) {
        this.$message.warning('请选择报价模式')
        return
      }

      // 实单测算：对齐报价测算展示（路径时间线）
      if (this.scenario.sim.type === '实单') {
        if (!(this.scenario.sim.orderNo || '').trim()) {
          this.$message.warning('请输入运单号')
          return
        }
        this.scenario.sim.result = {
          total: '36.80',
          path: [
            `匹配场景 ${this.scenario.base.scenario || '当前场景'}`,
            `报价模式：${mode}`,
            `运单号 ${this.scenario.sim.orderNo}`,
            '金额取整后输出总额 36.80'
          ]
        }
        this.simResultVisible = true
        return
      }

      const cfg = this.currentSimConfig
      const num = x => parseFloat(x || 0)
      const factors = this.scenario.sim.factors
      const prices = this.scenario.sim.prices
      const missingFactor = cfg.factors.some(f => factors[f.key] === undefined || factors[f.key] === '')
      const missingPrice = cfg.priceItems.some(p => prices[p.key] === undefined || prices[p.key] === '')
      if (missingFactor || missingPrice) {
        this.$message.warning('请完整填写计费因子和价格项')
        return
      }
      let total = 0
      const path = [`报价模式：${mode}`]
      if (mode === '首续重计费') {
        const w = num(factors.weight)
        const limit = num(prices.firstWeightLimit)
        const firstFee = num(prices.firstWeightPrice)
        const contUnit = num(prices.continueUnitPrice)
        const contWeight = Math.max(0, w - limit)
        total = firstFee + contWeight * contUnit
        path.push(`计费重量 ${w}kg，首重 ${limit}kg`)
        path.push(`首重费 ${firstFee.toFixed(2)}`)
        if (contWeight > 0) path.push(`续重费 ${(contWeight * contUnit).toFixed(2)}`)
      } else if (mode === '按件型') {
        const n = num(factors.pieceCount)
        const unit = num(prices.unitPrice)
        const minFee = num(prices.minFee)
        const pieceFee = n * unit
        total = Math.max(minFee, pieceFee)
        path.push(`件数 ${n}，单件价 ${unit}`)
        path.push(`件数费用 ${pieceFee.toFixed(2)}`)
        if (total === minFee && minFee > pieceFee) {
          path.push(`起步价补差 ${(minFee - pieceFee).toFixed(2)}`)
        }
      } else if (mode === '按方') {
        const v = num(factors.volume)
        const cbm = num(prices.cbmPrice)
        const minFee = num(prices.minFee)
        const volFee = v * cbm
        total = Math.max(minFee, volFee)
        path.push(`体积 ${v}m³，方单价 ${cbm}`)
        path.push(`体积费用 ${volFee.toFixed(2)}`)
        if (total === minFee && minFee > volFee) {
          path.push(`起步价补差 ${(minFee - volFee).toFixed(2)}`)
        }
      } else if (mode === '一口价') {
        total = num(prices.flatFee)
        path.push(`一口价 ${total.toFixed(2)}`)
      } else if (mode === '百分比提成') {
        const base = num(factors.baseAmount)
        const rate = num(prices.rate) / 100
        const minFee = num(prices.minFee)
        const fee = base * rate
        total = Math.max(minFee, fee)
        path.push(`基数 ${base}，提成比例 ${(rate * 100).toFixed(2)}%`)
        path.push(`提成费用 ${fee.toFixed(2)}`)
      } else {
        total = 0
        path.push('暂无匹配算法，输出 0.00')
      }
      path.push(`金额取整后输出总额 ${total.toFixed(2)}`)
      this.scenario.sim.result = {
        total: total.toFixed(2),
        path
      }
      this.simResultVisible = true
    }
  }
}
</script>

<style scoped>
.pricing-fieldset {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}
.section-title {
  font-size: 16px !important;
  line-height: 22px !important;
  font-weight: 500;
  margin-bottom: 12px;
}
.table-card--view .section-title {
  font-size: 14px !important;
  line-height: 22px !important;
  margin-bottom: 12px;
}
.view-plain-text {
  display: inline;
  color: #23252b;
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;
}
.table-card--view .pricing-section + .pricing-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f2f4;
}
.table-card--view .pricing-section__sub {
  margin-top: 24px;
}
.table-card--view >>> .el-select__tags {
  max-width: none !important;
}
.table-card--view >>> .el-select .el-select__tags-text {
  display: inline;
}
.section-title::before {
  height: 16px;
  margin-right: 4px;
  vertical-align: -3px;
  flex-shrink: 0;
}
.section-title-with-tip {
  display: inline-flex !important;
  align-items: center;
  gap: 4px;
}
.section-title-with-tip::before {
  margin-right: 0;
}
.section-title__text {
  display: inline-block;
}
.section-title-with-tip .field-tip-btn {
  position: relative;
  z-index: 2;
}
.pricing-section + .pricing-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f1f2f4;
}
/* 向导用 v-show 切换：隐藏态仍占兄弟选择器，避免步骤条下叠出第二条线 */
.table-card--wizard .pricing-section + .pricing-section {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}
.pricing-section__sub {
  margin-top: 24px;
}
.pricing-section > .step-alert {
  margin-top: 0;
}
.pricing-section > .pricing-fieldset + .step-alert,
.quote-card + .section-title,
.quote-card + .step-alert {
  margin-top: 24px;
}
.table-card--view .pricing-section .section-title {
  margin-bottom: 12px;
}
.table-card--view .pricing-section + .pricing-section {
  margin-top: 24px;
  padding-top: 24px;
}
.table-card--view .wizard-body {
  pointer-events: none;
}
.table-card--view .field-tip-btn,
.table-card--view .field-tip-trigger,
.table-card--view .wizard-footer {
  pointer-events: auto;
}
.condition-tag {
  margin: 0 8px 4px 0;
}
.condition-tag--clickable {
  cursor: pointer;
}
.condition-config-link.el-button--text {
  padding: 0;
  height: auto;
  font-size: 14px;
  line-height: 22px;
}
.view-empty-text {
  color: #868d9f;
}
.table-card--view .wizard-footer {
  margin-top: 24px;
}
/* 查看预览：去掉控件样式，仅展示内容 */
.table-card--view >>> .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before,
.table-card--view >>> .el-form-item.is-required:not(.is-no-asterisk) .el-form-item__label-wrap > .el-form-item__label:before {
  display: none !important;
}
.table-card--view >>> .el-input__suffix,
.table-card--view >>> .el-input__prefix,
.table-card--view >>> .el-select .el-input__suffix,
.table-card--view >>> .el-range__icon,
.table-card--view >>> .el-range__close-icon,
.table-card--view >>> .el-input__icon,
.table-card--view >>> .el-tag__close,
.table-card--view >>> .el-select .el-tag__close {
  display: none !important;
}
.table-card--view >>> .el-input__inner,
.table-card--view >>> .el-textarea__inner,
.table-card--view >>> .el-range-editor.el-input__inner {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  cursor: default !important;
  color: #23252b !important;
  height: auto !important;
  min-height: 22px;
  line-height: 22px !important;
}
.table-card--view >>> .el-range-editor {
  width: auto !important;
}
.table-card--view >>> .el-range-separator {
  width: auto;
  padding: 0 4px;
  line-height: 22px;
}
.table-card--view >>> .el-range-input {
  background: transparent;
  width: auto;
}
.table-card--view >>> .el-radio__input {
  display: none !important;
}
.table-card--view >>> .el-radio__label {
  padding-left: 0 !important;
  color: #23252b !important;
}
.table-card--view >>> .el-radio {
  margin-right: 16px;
  pointer-events: none;
}
.table-card--view >>> .el-checkbox__input {
  pointer-events: none;
}
.table-card--view >>> .merchant-codes {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  min-height: 0;
  cursor: default;
}
.table-card--view >>> .merchant-codes__input {
  display: none;
}
.table-card--view >>> .el-switch {
  display: none !important;
}
.table-card--view >>> .el-button {
  display: none !important;
}
.table-card--view >>> .field-tip-btn {
  display: inline-flex !important;
}
.table-card--view >>> .el-select .el-input.is-focus .el-input__inner,
.table-card--view >>> .el-select:hover .el-input__inner {
  border: none !important;
}
.table-card--view >>> .elements-table .el-input__inner,
.table-card--view >>> .elements-table .el-select {
  pointer-events: none;
}
.pricing-view-embed {
  min-width: 0;
}
.pricing-view-embed .table-card {
  min-height: 0;
  padding: 0;
  background: transparent;
}
.merchant-codes {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  gap: 8px;
  width: 100%;
  min-height: 80px;
  padding: 5px 12px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #e4e5e9;
  border-radius: 8px;
  cursor: text;
}
.merchant-codes:hover {
  border-color: rgba(60, 110, 240, 0.1);
}
.merchant-codes.is-focused {
  border-color: #3c6ef0;
  box-shadow: 0 0 0 2px rgba(60, 110, 240, 0.1);
}
.merchant-codes__tag {
  margin: 0 !important;
  transition: none !important;
}
.merchant-codes__tag >>> .el-tag__close,
.merchant-codes__tag >>> .el-icon-close {
  color: #868d9f !important;
  background: transparent !important;
  transition: none !important;
  transform: none !important;
}
.merchant-codes__tag >>> .el-tag__close:hover,
.merchant-codes__tag >>> .el-icon-close:hover {
  color: #525765 !important;
  background: rgba(82, 87, 101, 0.12) !important;
  transform: none !important;
}
.merchant-codes__input {
  flex: 1 1 160px;
  min-width: 160px;
  height: 22px;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  color: #23252b;
  font-size: 14px;
  line-height: 22px;
}
.merchant-codes__input::placeholder {
  color: #babec7;
}
.step-alert {
  margin-bottom: 12px;
}
.elements-table__add-wrap {
  border-bottom: none;
  padding-bottom: 0;
}
.table-h-scroll {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}
.table-card--view .table-h-scroll {
  pointer-events: auto;
}
/* 仅保留表格 body 一条横滑，避免与外层双滚动条 */
.table-h-scroll >>> .el-table__header-wrapper {
  overflow: hidden !important;
}
.table-h-scroll >>> .el-table__body-wrapper {
  overflow-x: auto !important;
  overflow-y: hidden !important;
}
.table-h-scroll >>> .el-table__body-wrapper::-webkit-scrollbar {
  width: 48px;
  height: 4px;
}
.table-h-scroll >>> .el-table__body-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
.table-h-scroll >>> .el-table__body-wrapper::-webkit-scrollbar-thumb {
  min-width: 48px;
  background: #f1f2f4;
  border-radius: 2px;
}
.table-h-scroll >>> .el-table__body-wrapper {
  scrollbar-width: thin;
  scrollbar-color: #f1f2f4 transparent;
}
.scene-rules-table {
  width: 100%;
}
.scene-rules-table >>> .el-table__header th.el-table__cell {
  font-size: 14px;
  font-weight: 400 !important;
  color: #525765 !important;
  background: #f2f5f8 !important;
}
.scene-rules-table >>> .el-table__body .cell {
  overflow: hidden;
}
.table-card--wizard .scene-rules-table >>> .el-table__body .cell {
  overflow: visible !important;
}
.scene-rules-table >>> .el-table__body td.el-table__cell {
  vertical-align: middle;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
.scene-rules-table >>> .el-select {
  width: 100%;
}
.scene-rules-table >>> .el-input__inner,
.scene-rules-table >>> .el-select .el-input__inner {
  font-size: 14px !important;
  height: 32px !important;
  line-height: 32px !important;
}
.scene-rules-table__default {
  margin: 0;
  transition: none !important;
}
.scene-ops {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 24px;
  width: 100%;
}
.scene-ops .el-button + .el-button,
.scene-ops .el-button + .el-tag,
.scene-ops .el-tag + .el-button {
  margin-left: 0;
}
.scene-ops .element-ops__link.el-button--text {
  padding: 0;
  height: auto;
  font-size: 14px;
  line-height: 22px;
  transition: none;
}
.scene-ops .element-ops__link--primary.el-button--text {
  color: #3c6ef0;
}
.scene-rules-table >>> .el-table__header th.el-table__cell.is-left .cell,
.scene-rules-table >>> .el-table__body td.el-table__cell .scene-ops {
  text-align: left;
}
.scene-rules-table >>> .el-select.is-error .el-input__inner,
.scene-rules-table >>> .el-select.is-error .el-input.is-focus .el-input__inner,
.scene-rules-table >>> .el-select.is-error:hover .el-input:not(.is-disabled) .el-input__inner {
  border-color: #f53f3f !important;
  box-shadow: none !important;
}
.condition-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.condition-row--nowrap {
  flex-wrap: nowrap;
  width: max-content;
  max-width: none;
}
.condition-row--nowrap .condition-tag {
  flex-shrink: 0;
  margin-right: 0;
}
.quote-card {
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
}
.quote-form {
  max-width: 100%;
  --lui-form-label-width: 120px;
}
.quote-form >>> .el-form-item__label {
  display: flex !important;
  align-items: center;
  justify-content: flex-end !important;
  text-align: right !important;
  overflow: visible !important;
  float: none !important;
  width: var(--lui-form-label-width) !important;
  min-width: var(--lui-form-label-width) !important;
  max-width: var(--lui-form-label-width) !important;
  padding-right: 12px !important;
  box-sizing: border-box;
  color: #525765 !important;
  font-size: 14px !important;
  line-height: 22px !important;
  font-weight: 400 !important;
}
.quote-form >>> .el-form-item__content {
  min-width: 0;
  margin-left: 0 !important;
  flex: 1 1 0%;
}
/* 报价维度 / 维度别名 / 报价模式 / 模式详情 / 阶梯：内容左缘对齐 */
.quote-form >>> .el-form-item__content > .dimension-alias-grid,
.quote-form >>> .el-form-item__content > .mode-row,
.quote-form >>> .el-form-item__content > .table-h-scroll,
.quote-form >>> .el-form-item__content > .el-select {
  width: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.quote-form .dimension-alias-table,
.quote-form .quote-sub-table {
  margin: 0;
}
.quote-form .dimension-alias-table >>> .el-table .cell,
.quote-form .quote-sub-table >>> .el-table .cell {
  padding-left: 12px;
  padding-right: 12px;
}
.quote-form .field-label-with-tip {
  width: 100%;
  justify-content: flex-end;
}
/* 查看态：多选标签改为文档流排布，与表格左缘对齐 */
.table-card--view .quote-form >>> .el-select {
  display: block;
}
.table-card--view .quote-form >>> .el-select .el-input {
  display: none !important;
}
.table-card--view .quote-form >>> .el-select .el-select__tags {
  position: static !important;
  transform: none !important;
  top: auto !important;
  left: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.table-card--view .quote-form >>> .el-select .el-tag {
  margin: 0 !important;
}
.table-card--view .quote-form .mode-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.table-card--view .quote-form .mode-row .el-select {
  flex: 1;
  min-width: 0;
}
.field-label-with-tip {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  max-width: 100%;
  box-sizing: border-box;
  white-space: nowrap;
}
.field-tip-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  vertical-align: middle;
}
.field-tip-btn:hover .field-tip-img,
.field-tip-btn:focus .field-tip-img {
  opacity: 0.85;
}
.field-tip-btn:focus {
  outline: none;
}
.field-tip-img {
  display: block;
  width: 14px;
  height: 14px;
  object-fit: contain;
  flex-shrink: 0;
}
.field-tip-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin: 0;
  padding: 0;
  border: 1px solid #868d9f;
  border-radius: 50%;
  color: #868d9f;
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  line-height: 1;
  cursor: help;
  flex-shrink: 0;
  box-sizing: border-box;
  background: #fff;
  user-select: none;
}
.field-tip-trigger:hover,
.field-tip-trigger:focus {
  border-color: #525765;
  color: #525765;
  outline: none;
}
.field-tip-icon {
  color: #868d9f;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;
}
.field-tip-icon:hover {
  color: #525765;
}
.dimension-alias-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 24px;
  width: 100%;
}
.dimension-alias-table {
  width: 100%;
  min-width: 0;
  background: #fff;
}
.dimension-alias-table >>> .el-table__header th.el-table__cell {
  font-size: 14px;
  font-weight: 400 !important;
  color: #525765 !important;
  background: #f2f5f8 !important;
}
.dimension-alias-table >>> .el-table__body td.el-table__cell {
  vertical-align: middle;
}
.dimension-alias-table >>> .el-input.lui-control,
.dimension-alias-table >>> .lui-control {
  width: 100%;
  max-width: 100%;
}
.quote-sub-table {
  width: 100%;
  background: #fff;
}
.quote-sub-table >>> .el-input.lui-control,
.quote-sub-table >>> .lui-control {
  width: 160px;
  max-width: 100%;
}
.quote-sub-table--full >>> .el-table__body .cell {
  overflow: visible;
}
.table-cell-full {
  display: inline-block;
  white-space: nowrap;
  color: #23252b;
  font-size: 14px;
  line-height: 22px;
}
.strategy-dup-alert {
  margin-top: 8px;
  width: 100%;
}
.field-tip {
  margin-top: 4px;
  color: #8f959e;
  font-size: 12px;
  line-height: 1.4;
}
.mode-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.mode-row .el-select {
  flex: 1;
  min-width: 0;
}
.ext-block {
  margin-bottom: 12px;
  padding: 16px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
}
.ext-block--plain {
  margin-top: 12px;
  margin-bottom: 0;
  padding: 0;
  border: none;
  border-radius: 0;
  background: transparent;
}
.ext-rule-form.lui-form-grid {
  --lui-form-label-width: 120px;
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
.table-card--view .ext-rule-form >>> .el-select__tags,
.table-card--view .ext-merge-fields >>> .el-select__tags {
  max-width: none !important;
  flex-wrap: wrap;
}
.table-card--view .ext-rule-form >>> .el-select .el-select__tags-text,
.table-card--view .ext-merge-fields >>> .el-select .el-select__tags-text {
  max-width: none !important;
  overflow: visible;
  text-overflow: clip;
}
.sim-card {
  margin-bottom: 12px;
  padding: 16px 0;
  border: none;
  border-radius: 0;
  background: transparent;
}
.sim-card h4.section-title {
  margin: 0 0 12px;
}
.sim-param-form.lui-form-grid {
  --lui-form-label-width: 160px;
}
.sim-param-form >>> .el-form-item__label {
  overflow: visible !important;
  text-overflow: clip !important;
  white-space: nowrap;
}
.sim-card__action {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
.sim-result {
  margin-top: 16px;
  padding: 16px 0;
  background: transparent;
  border: none;
  border-radius: 0;
}
.sim-result h4 {
  margin: 0 0 8px;
  font-size: 15px;
  color: #23252b;
}
.condition-edit-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  width: 100%;
}
.condition-edit-row__dim {
  width: 140px;
  flex: 0 0 140px;
}
.condition-edit-row__op {
  width: 120px;
  flex: 0 0 120px;
}
.condition-edit-row__value {
  flex: 1 1 auto;
  min-width: 0;
  width: auto;
}
.condition-edit-row__actions {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  flex: 0 0 88px;
  width: 88px;
  gap: 12px;
}
.condition-edit-row__link.el-button--text {
  padding: 0;
  font-size: 14px;
  line-height: 22px;
}
.condition-edit-row__link--delete.el-button--text {
  color: #868d9f !important;
}
.condition-edit-row__link--delete.el-button--text:hover,
.condition-edit-row__link--delete.el-button--text:focus {
  color: #525765 !important;
}
.condition-edit-row__link--add.el-button--text {
  color: #3c6ef0;
}
.create-mode {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 16px;
}
.create-mode__col {
  padding: 12px 12px 4px;
  border-left: 3px solid #3c6ef0;
  background: #fafbfd;
  border-radius: 4px;
}
.create-mode__col--side {
  border-left-color: #52c41a;
}
.create-mode__form {
  width: 100%;
}
.create-mode__pair {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}
.create-mode__pair .el-select,
.create-mode__form .el-select {
  width: 100%;
}
.create-mode__demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 12px;
}
.formula-builder {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  background: #fff;
  box-sizing: border-box;
}
.formula-builder__row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 10px;
}
.formula-builder__row:last-child {
  margin-bottom: 0;
}
.formula-builder__label {
  flex: 0 0 72px;
  padding-top: 4px;
  color: #525765;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
}
.formula-builder__tags {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}
.formula-builder__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #23252b;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
}
.formula-builder__tag:hover {
  border-color: #3c6ef0;
  color: #3c6ef0;
}
.formula-builder__input {
  margin-top: 8px;
}
.demo-calc {
  margin-top: 8px;
  padding: 12px;
  background: #f5f5f6;
  border-radius: 6px;
  font-size: 13px;
  color: #646a73;
}
.demo-calc pre {
  margin: 8px 0;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.6;
}
.demo-calc__total strong {
  color: #f5222d;
  font-size: 18px;
}
@media (max-width: 960px) {
  .create-mode {
    grid-template-columns: 1fr;
  }
  .create-mode__pair,
  .create-mode__demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
/* tooltip 挂 body，需非 scoped；对齐 Figma 文字提示气泡 231:23461 */
.quote-tip-popper {
  max-width: 360px;
  padding: 8px 16px !important;
  background: rgba(35, 37, 43, 0.9) !important;
  border: none !important;
  color: #fff !important;
  font-size: 12px !important;
  line-height: 18px !important;
  font-weight: 400 !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 16px rgba(35, 37, 43, 0.1) !important;
}
.quote-tip-popper[x-placement^='top'] .popper__arrow {
  border-top-color: rgba(35, 37, 43, 0.9) !important;
}
.quote-tip-popper[x-placement^='top'] .popper__arrow::after {
  border-top-color: rgba(35, 37, 43, 0.9) !important;
}
.quote-tip-popper[x-placement^='bottom'] .popper__arrow {
  border-bottom-color: rgba(35, 37, 43, 0.9) !important;
}
.quote-tip-popper[x-placement^='bottom'] .popper__arrow::after {
  border-bottom-color: rgba(35, 37, 43, 0.9) !important;
}

.sim-result-dialog .sim-result-dialog__body {
  padding-top: 4px;
}
.sim-result-dialog .sim-result-dialog__total {
  margin: 0 0 16px;
  color: #23252b;
  font-family: var(--lui-font-number);
  line-height: 36px;
}
.sim-result-dialog .sim-result-dialog__currency {
  margin-right: 4px;
  font-size: 20px;
  font-weight: 400;
}
.sim-result-dialog .sim-result-dialog__amount {
  font-size: 28px;
  font-weight: 400;
}
.sim-result-dialog .sim-result-dialog__timeline.el-timeline {
  padding-left: 0;
}
.sim-result-dialog .sim-result-dialog__timeline .el-timeline-item {
  padding-bottom: 12px;
}
.sim-result-dialog .sim-result-dialog__timeline .el-timeline-item:last-child {
  padding-bottom: 0;
}
.sim-result-dialog .sim-result-dialog__timeline .el-timeline-item__timestamp {
  display: none;
}
</style>
