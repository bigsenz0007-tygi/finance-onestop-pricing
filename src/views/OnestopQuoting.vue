<template>
  <div class="page-shell page-shell--wizard">
    <div class="table-card table-card--wizard">
      <div class="lui-line-tabs" role="tablist">
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

      <div class="table-toolbar">
        <h3>一站式报价配置</h3>
      </div>

      <LuiArrowSteps :steps="quoteSteps" :active="step" @change="onStepChange" />

      <div class="wizard-body">
      <!-- Step 1 基础信息 -->
      <div v-show="step === 0">
        <h3 class="section-title">基础信息</h3>
        <el-form :model="base" class="lui-form-grid" size="small">
          <el-form-item label="报价方案名称" required>
            <el-input v-model="base.quotationName" placeholder="请输入报价方案名称" />
          </el-form-item>
          <el-form-item label="商家编码" required>
            <el-input v-model="base.merchantCode" placeholder="请输入商家编码" @input="onMerchantCode" />
          </el-form-item>
          <el-form-item label="商家名称" required>
            <el-input v-model="base.merchantName" disabled placeholder="输入商家编码后自动带出" />
          </el-form-item>
          <el-form-item label="签约区域" required>
            <el-input v-model="base.signRegion" disabled placeholder="输入商家编码自动带出" />
          </el-form-item>
          <el-form-item label="生效时间" required class="lui-form-item--range">
            <el-date-picker
              v-model="base.effectiveRange"
              type="daterange"
              value-format="yyyy-MM-dd"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item label="报价方式" required>
            <el-select v-model="base.quotationMethod" disabled placeholder="请选择">
              <el-option label="产品报价" value="产品报价" />
              <el-option label="场景报价" value="场景报价" />
            </el-select>
          </el-form-item>
          <el-form-item label="折扣产品" required>
            <el-select v-model="base.discountProduct" clearable placeholder="请选择" @change="onDiscountProductChange">
              <el-option label="重货标快" value="重货标快" />
              <el-option label="京东标快" value="京东标快" />
              <el-option label="京东特快" value="京东特快" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="base.quotationMethod === '场景报价'" label="业务场景" required>
            <el-select
              v-model="base.businessScenario"
              clearable
              placeholder="请选择"
              :disabled="!scenarios.length"
              @change="onBusinessScenarioChange"
            >
              <el-option v-for="s in scenarios" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>
          <el-form-item label="结算方式" required>
            <el-select
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
          <el-form-item label="计费策略" required>
            <el-select v-model="base.billingStrategy" clearable placeholder="请选择" :disabled="isCash">
              <el-option label="普通" value="普通" />
              <el-option v-if="!isCash" label="统计考核" value="统计考核" />
              <el-option v-if="!isCash" label="合单计费" value="合单计费" />
              <el-option v-if="!isCash" label="统计+合单" value="统计+合单" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="isStats" label="统计考核方式" required>
            <el-select v-model="base.statisticsMethod" clearable placeholder="请选择">
              <el-option label="按考核开始月份" value="按考核开始月份" />
              <el-option label="按月中签合同考核" value="按月中签合同考核" />
              <el-option label="按整月考核" value="按整月考核" />
              <el-option label="按项目周期考核" value="按项目周期考核" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="isStats" label="考核起始月" required>
            <el-date-picker v-model="base.assessmentStartMonth" type="month" value-format="yyyy-MM" placeholder="请选择" />
          </el-form-item>
        </el-form>

        <div class="complex-quote">
          <button type="button" class="complex-quote__toggle" @click="complexQuoteOpen = !complexQuoteOpen">
            <span>复杂报价（默认不启用，可展开配置）</span>
            <i :class="complexQuoteOpen ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </button>
          <el-form v-show="complexQuoteOpen" :model="base" class="lui-form-grid" size="small">
            <el-form-item label="金额取整">
              <el-select v-model="base.amountRounding" clearable placeholder="请选择">
                <el-option label="四舍五入取整" value="四舍五入取整" />
                <el-option label="保留2位小数" value="保留2位小数" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="!isCash" label="地址逐级匹配">
              <el-radio-group v-model="base.addressLevelMatch">
                <el-radio label="是">是</el-radio>
                <el-radio label="否">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="价格本优先级">
              <el-radio-group v-model="base.hasPricePriority" @change="onPricePriorityToggle">
                <el-radio label="否">否</el-radio>
                <el-radio label="是">是</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="base.hasPricePriority === '是'" label="优先级序号" required>
              <el-select v-model="base.pricePriority" clearable placeholder="请选择">
                <el-option v-for="n in 5" :key="n" :label="String(n)" :value="String(n)" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否跨月">
              <el-radio-group v-model="base.isCrossMonth" @change="onCrossMonthToggle">
                <el-radio label="否">否</el-radio>
                <el-radio label="是">是</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="base.isCrossMonth === '是'" label="计费周期" class="lui-form-grid__span-all lui-form-item--cycle" required>
              <div class="cross-month-cycle">
                <span class="cross-month-cycle__text">上</span>
                <el-input v-model="base.crossMonthPrev" class="cross-month-cycle__input" size="small" placeholder="几" />
                <span class="cross-month-cycle__text">月</span>
                <el-input v-model="base.crossMonthPrevDay" class="cross-month-cycle__input" size="small" placeholder="日" />
                <span class="cross-month-cycle__text">日至当月</span>
                <el-input v-model="base.crossMonthCurrentDay" class="cross-month-cycle__input" size="small" placeholder="日" />
                <span class="cross-month-cycle__text">日</span>
              </div>
              <div class="field-tip">示例：上 1 月 15 日至当月 14 日</div>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- Step 2 价格分区 -->
      <div v-show="step === 1">
        <div class="table-toolbar">
          <h3 class="section-title" style="margin: 0">价格分区配置</h3>
          <div>
            <el-button size="small" type="primary" plain @click="addPartition">+ 添加分区</el-button>
            <el-button size="small" @click="importVisible = true">分区导入</el-button>
          </div>
        </div>
        <div class="field-tip">价格分区与报价明细可能较多，建议系统上限 10000 条；当前 {{ partitions.length }} 条。</div>
        <el-form class="lui-form-grid">
          <el-form-item label="可选报价维度" class="lui-form-grid__span-all">
            <el-select
              v-model="selectedDims"
              multiple
              collapse-tags
              clearable
              placeholder="请勾选本场景下通用的计费维度"
              class="lui-control-block"
            >
              <el-option v-for="d in dimOptions" :key="d" :label="d" :value="d" />
            </el-select>
            <div class="field-tip">多选查询展开收起，不拉高操作框（collapse-tags）。</div>
          </el-form-item>
        </el-form>
        <div v-for="(p, idx) in partitions" :key="p.id" class="partition-card">
          <div class="partition-head">
            <strong>分区 {{ idx + 1 }}</strong>
            <el-button v-if="partitions.length > 1" type="text" @click="removePartition(p.id)">删除</el-button>
          </div>
          <el-form class="lui-form-grid lui-form-grid--partition">
            <el-form-item v-if="isStats" label="统计分组号">
              <el-input v-model="p.statGroup" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="价格分区名称" required>
              <el-input v-model="p.name" placeholder="如：华东一区" />
            </el-form-item>
            <el-form-item label="报价申请单号" required>
              <el-input v-model="p.applyNo" placeholder="请输入单号" />
            </el-form-item>
            <el-form-item label="合同编码" required>
              <el-input v-model="p.contractCode" placeholder="请输入合同编码" />
            </el-form-item>
            <el-form-item label="始发地">
              <el-input
                :value="formatAddress(p.fromAddress)"
                readonly
                placeholder="请点击选择始发地"
                class="addr-trigger"
                @click.native="openAddressEditor(p, 'fromAddress')"
              >
                <i slot="suffix" class="el-input__icon el-icon-location-outline" />
              </el-input>
            </el-form-item>
            <el-form-item label="目的地">
              <el-input
                :value="formatAddress(p.toAddress)"
                readonly
                placeholder="请点击选择目的地"
                class="addr-trigger"
                @click.native="openAddressEditor(p, 'toAddress')"
              >
                <i slot="suffix" class="el-input__icon el-icon-location-outline" />
              </el-input>
            </el-form-item>
            <el-form-item v-if="selectedDims.includes('费用项')" label="费用项">
              <el-select v-model="p.feeItem" clearable filterable allow-create placeholder="请选择或输入">
                <el-option v-for="f in scenarioFeeOptions" :key="f" :label="f" :value="f" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="selectedDims.includes('商家订单类型')" label="商家订单类型">
              <el-input v-model="p.orderType" placeholder="请输入" />
            </el-form-item>
            <el-form-item v-if="selectedDims.includes('配送类型')" label="配送类型">
              <el-input v-model="p.deliveryType" placeholder="请输入" />
            </el-form-item>
            <el-form-item v-if="selectedDims.includes('正逆向')" label="正逆向">
              <el-select v-model="p.direction" clearable placeholder="请选择">
                <el-option label="正向" value="正向" />
                <el-option label="逆向" value="逆向" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- Step 3 报价明细 -->
      <div v-show="step === 2">
        <div class="table-toolbar">
          <h3 class="section-title" style="margin: 0">报价明细配置</h3>
          <el-button size="small" type="primary" plain @click="detailImportVisible = true">导入报价明细</el-button>
        </div>
        <el-tabs v-model="activePartitionId" type="card">
          <el-tab-pane
            v-for="p in partitions"
            :key="String(p.id)"
            :label="p.name || '未命名分区'"
            :name="String(p.id)"
          />
        </el-tabs>
        <div class="detail-toolbar">
          <span>当前配置分区：<strong>{{ activePartitionName }}</strong></span>
          <div class="detail-controls">
            <div v-if="showStatTarget" class="detail-control">
              <span class="detail-control__label">统计对象</span>
              <el-select v-model="currentDetail.statTarget" class="lui-control" size="small" clearable placeholder="请选择">
                <el-option label="月度单量" value="月度单量" />
                <el-option label="月度金额" value="月度金额" />
              </el-select>
            </div>
            <div class="detail-control">
              <span class="detail-control__label">单票阶梯模式</span>
              <el-select v-model="currentDetail.stairMode" class="lui-control" size="small" clearable placeholder="请选择">
                <el-option label="无" value="无" />
                <el-option label="计费重量" value="计费重量" />
                <el-option label="体积" value="体积" />
              </el-select>
            </div>
            <div v-if="showStairColumns" class="detail-control">
              <span class="detail-control__label">阶梯累进</span>
              <el-select v-model="currentDetail.stairProgress" class="lui-control" size="small" clearable placeholder="请选择">
                <el-option label="全单累进" value="全单累进" />
                <el-option label="分段累进" value="分段累进" />
              </el-select>
            </div>
            <div class="detail-control">
              <span class="detail-control__label">区间开闭类型</span>
              <el-select v-model="currentDetail.intervalType" class="lui-control" size="small" clearable placeholder="请选择">
                <el-option label="前开后闭" value="前开后闭" />
                <el-option label="前闭后开" value="前闭后开" />
                <el-option label="双侧闭合" value="双侧闭合" />
              </el-select>
            </div>
            <div class="detail-control">
              <span class="detail-control__label">业务进位</span>
              <el-select v-model="currentDetail.businessCarry" class="lui-control" size="small" clearable placeholder="请选择">
                <el-option label="不进位" value="不进位" />
                <el-option label="0.5 进位" value="0.5 进位" />
                <el-option label="1 进位" value="1 进位" />
              </el-select>
            </div>
            <el-button size="small" type="primary" plain @click="addStairRow">添加阶梯</el-button>
          </div>
        </div>
        <el-form v-if="currentDetail.stairMode === '计费重量'" class="lui-form-grid" size="small" style="margin-bottom: 8px">
          <el-form-item label="轻抛系数">
            <el-input v-model="currentDetail.lightThrow" placeholder="请输入" />
          </el-form-item>
        </el-form>
        <el-table :data="currentDetail.rows" size="small">
          <el-table-column v-if="showStatColumns" label="统计最小值(不含)" min-width="120">
            <template slot-scope="{ row }"><el-input v-model="row.statMin" size="small" /></template>
          </el-table-column>
          <el-table-column v-if="showStatColumns" label="统计最大值(含)" min-width="120">
            <template slot-scope="{ row }"><el-input v-model="row.statMax" size="small" /></template>
          </el-table-column>
          <el-table-column v-if="showStairColumns" label="单票阶梯最小值(不含)" min-width="140">
            <template slot-scope="{ row }"><el-input v-model="row.stairMin" size="small" /></template>
          </el-table-column>
          <el-table-column v-if="showStairColumns" label="单票阶梯最大值(含)" min-width="140">
            <template slot-scope="{ row }"><el-input v-model="row.stairMax" size="small" /></template>
          </el-table-column>
          <el-table-column label="折扣模式" min-width="120">
            <template slot-scope="{ row }">
              <el-select v-model="row.discountMode" size="small" clearable placeholder="请选择">
                <el-option label="折扣率" value="折扣率" />
                <el-option label="标准单价" value="标准单价" />
                <el-option label="固定金额" value="固定金额" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="报价明细" min-width="140">
            <template slot-scope="{ row }">
              <div class="detail-value-cell">
                <span>数值:</span>
                <el-input v-model="row.discountDetail" size="small" />
                <span v-if="row.discountMode === '折扣率'">%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" align="center">
            <template slot-scope="{ $index }">
              <el-button
                type="text"
                class="table-ops__link--delete"
                :disabled="$index !== currentDetail.rows.length - 1 || currentDetail.rows.length <= 1"
                @click="removeStairRow($index)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="field-tip">阶梯不可留空档；删除仅允许从后往前删除。</div>
      </div>

      <!-- Step 4 拓展规则 -->
      <div v-show="step === 3">
        <h3 class="section-title">报价拓展规则</h3>
        <el-form class="lui-form-grid" size="small">
          <el-form-item v-if="!isCash" label="地址等级匹配">
            <el-radio-group v-model="extension.addressLevelMatch">
              <el-radio label="是">是</el-radio>
              <el-radio label="否">否</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="价格优先级">
            <el-input v-model="extension.pricePriority" placeholder="可选" />
          </el-form-item>
          <el-form-item label="自定义计费节点">
            <el-input v-model="extension.customBillingNode" placeholder="可选" />
          </el-form-item>
          <el-form-item v-if="showMergeDims" label="统计合单维度" class="lui-form-grid__span-all">
            <el-select v-model="extension.mergeDims" multiple collapse-tags clearable placeholder="请选择">
              <el-option label="商家订单号" value="商家订单号" />
              <el-option label="运单号" value="运单号" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- Step 5 测算 -->
      <div v-show="step === 4">
        <h3 class="section-title">报价测算</h3>
        <el-form class="lui-form-grid" size="small">
          <el-form-item label="运单号">
            <el-input v-model="sim.orderNo" placeholder="输入真实运单号验证计费结果" />
          </el-form-item>
          <el-form-item label="重量(kg)">
            <el-input v-model="sim.weight" placeholder="试算重量" />
          </el-form-item>
          <el-form-item label=" ">
            <el-button type="primary" size="small" @click="runSim">开始测算</el-button>
          </el-form-item>
        </el-form>
        <div v-if="sim.result" class="sim-result">
          <h4>测算结果 · 总额 ¥ {{ sim.result.total }}</h4>
          <el-timeline>
            <el-timeline-item v-for="(item, idx) in sim.result.path" :key="idx">{{ item }}</el-timeline-item>
          </el-timeline>
        </div>
      </div>
      </div>

      <div class="wizard-footer">
        <el-button size="small" :disabled="step === 0" @click="step -= 1">上一步</el-button>
        <el-button v-if="step < 4" type="primary" size="small" @click="nextStep">
          {{ step === 2 ? '下一步，报价拓展规则配置' : '下一步' }}
        </el-button>
        <el-button v-else type="success" size="small" @click="submitQuote">完成并发布</el-button>
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
      custom-class="lui-form-dialog lui-dialog--sm"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-upload drag action="#" :auto-upload="false" accept=".xlsx,.xls">
        <div class="el-upload__text">将 Excel 模板拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">支持批量导入分区与报价明细关联字段（预览占位）</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="importVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="mockImport">确认导入</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="导入报价明细"
      :visible.sync="detailImportVisible"
      width="480px"
      custom-class="lui-form-dialog lui-dialog--sm"
      append-to-body
      :close-on-click-modal="false"
    >
      <el-upload drag action="#" :auto-upload="false" accept=".xlsx,.xls">
        <div class="el-upload__text">将报价明细模板拖到此处，或<em>点击上传</em></div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="detailImportVisible = false">取消</el-button>
        <el-button type="primary" size="small" @click="detailImportVisible = false; $message.success('明细导入成功（预览）')">确认导入</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import LuiArrowSteps from '../components/LuiArrowSteps.vue'
import AddressEditorModal from '../components/quoting/AddressEditorModal.vue'
import { DISCOUNT_PRODUCT_SCENARIOS } from '../mock/cascade'
import { SCENARIO_QUOTE_DIMS, getScenarioFeeItems } from '../mock/scenarioPricing'
import { validateScenarioFeeCoverage } from '../utils/scenarioQuoteValidate'

const PARTITION_LIMIT = 10000

function createPartition(partial = {}) {
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    name: '',
    applyNo: '',
    contractCode: '',
    statGroup: '',
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
    stairProgress: '全单累进',
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
      discountDetail: '100'
    }]
  }
}

export default {
  name: 'OnestopQuoting',
  components: { LuiArrowSteps, AddressEditorModal },
  data() {
    const first = createPartition({
      name: '默认分区',
      applyNo: 'SQ-DEFAULT-001',
      contractCode: 'HT-DEFAULT-001',
      feeItem: '运费'
    })
    return {
      step: 0,
      complexQuoteOpen: false,
      quoteSteps: [
        { title: '基础信息' },
        { title: '价格分区' },
        { title: '报价明细' },
        { title: '报价拓展规则' },
        { title: '报价测算' }
      ],
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
        addressLevelMatch: '是',
        hasPricePriority: '否',
        pricePriority: '',
        isCrossMonth: '否',
        crossMonthPrev: '',
        crossMonthPrevDay: '',
        crossMonthCurrentDay: ''
      },
      dimOptions: SCENARIO_QUOTE_DIMS.slice(),
      selectedDims: SCENARIO_QUOTE_DIMS.slice(),
      partitions: [first],
      detailMap: {},
      activePartitionId: String(first.id),
      extension: {
        addressLevelMatch: '是',
        pricePriority: '',
        customBillingNode: '',
        mergeDims: []
      },
      sim: { orderNo: '', weight: '2.5', result: null },
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
  computed: {
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
    showMergeDims() {
      return ['合单计费', '统计+合单'].includes(this.base.billingStrategy)
    },
    scenarios() {
      return DISCOUNT_PRODUCT_SCENARIOS[this.base.discountProduct] || []
    },
    scenarioFeeOptions() {
      return getScenarioFeeItems(this.base.discountProduct, this.base.businessScenario)
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
    }
  },
  methods: {
    formatAddress(list) {
      if (!list || !list.length) return ''
      if (list.length <= 2) return list.join('、')
      return `${list.slice(0, 2).join('、')} 等${list.length}项`
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
      if (this.base.quotationMethod === type) return
      this.base.quotationMethod = type
      this.base.businessScenario = ''
      if (type === '场景报价') {
        this.base.settlementMethod = '月结'
        this.base.billingStrategy = '统计考核'
        this.base.statisticsMethod = ''
        this.base.assessmentStartMonth = ''
        this.selectedDims = SCENARIO_QUOTE_DIMS.slice()
        if (this.partitions[0] && !this.partitions[0].feeItem) {
          this.partitions[0].feeItem = '运费'
        }
      } else {
        this.selectedDims = []
        this.base.settlementMethod = ''
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
    onCrossMonthToggle(val) {
      if (val === '否') {
        this.base.crossMonthPrev = ''
        this.base.crossMonthPrevDay = ''
        this.base.crossMonthCurrentDay = ''
      }
    },
    validateStep(step) {
      if (step === 0) {
        // 对齐原型：跨月周期未填全时硬拦截；其余做必要轻校验，避免无法下一步
        if (this.base.isCrossMonth === '是') {
          if (!this.base.crossMonthPrev || !this.base.crossMonthPrevDay || !this.base.crossMonthCurrentDay) {
            return '已选择跨月计费，请完整填写计费周期'
          }
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
        const bad = this.partitions.find(p => !(p.name || '').trim())
        if (bad) return '请填写价格分区名称'
      }
      return ''
    },
    nextStep() {
      const msg = this.validateStep(this.step)
      if (msg) {
        this.$message.warning(msg)
        return
      }
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
    },
    removePartition(id) {
      if (this.partitions.length <= 1) return
      this.partitions = this.partitions.filter(p => p.id !== id)
      this.activePartitionId = String(this.partitions[0].id)
    },
    mockImport() {
      this.partitions.push(createPartition({
        name: '导入分区-华东',
        applyNo: 'SQ-IMPORT-001',
        contractCode: 'HT-IMPORT-001',
        fromAddress: ['斜土路街道'],
        toAddress: ['深圳市']
      }))
      this.importVisible = false
      this.$message.success('分区导入成功（预览）')
    },
    addStairRow() {
      this.currentDetail.rows.push({
        id: Date.now(),
        statMin: '',
        statMax: '',
        stairMin: '',
        stairMax: '无穷大',
        discountMode: '折扣率',
        discountDetail: ''
      })
    },
    removeStairRow(index) {
      if (index !== this.currentDetail.rows.length - 1) {
        this.$message.warning('请从后往前删除阶梯，避免留空档')
        return
      }
      this.currentDetail.rows.splice(index, 1)
    },
    runSim() {
      if (!this.sim.orderNo) {
        this.$message.warning('请输入运单号')
        return
      }
      this.sim.result = {
        total: '36.80',
        path: [
          `匹配商家 ${this.base.merchantName || this.base.merchantCode || '-'}`,
          `报价方式：${this.base.quotationMethod} / 策略：${this.base.billingStrategy}`,
          `分区：${this.activePartitionName}`,
          `计费重量 ${this.sim.weight || '-'}kg，区间 ${this.currentDetail.intervalType || '-'}`,
          '金额取整后输出总额 36.80'
        ]
      }
    },
    submitQuote() {
      for (let s = 0; s <= 1; s += 1) {
        const msg = this.validateStep(s)
        if (msg) {
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
      this.$confirm('确定发布嘛？', '二次确认', { type: 'warning' })
        .then(() => {
          const d = new Date()
          const p = n => String(n).padStart(2, '0')
          const createdAt = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
          this.$emit('published', {
            id: `Q-${Date.now()}`,
            name: this.base.quotationName || '未命名报价方案',
            method: this.base.quotationMethod || '场景报价',
            merchantCode: this.base.merchantCode || '-',
            merchantName: this.base.merchantName || '-',
            strategy: this.base.billingStrategy || '-',
            status: '已启用',
            creator: '预览用户',
            createdAt
          })
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.partition-card {
  background: #f8fafc;
  border: 1px solid #e5e6eb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
  margin-bottom: 0;
  box-sizing: border-box;
}
.partition-card + .partition-card {
  margin-top: 12px;
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
.detail-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 8px 0 12px;
}
.field-tip { margin-top: 8px; color: #8f959e; font-size: 12px; }
.sim-result {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}
.sim-result h4 { margin: 0 0 8px; }
.complex-quote {
  margin-top: 16px;
  border: 1px solid #e4e5e9;
  border-radius: 8px;
  padding: 0 12px 12px;
  background: #fff;
}
.complex-quote__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: #525765;
  font-size: 14px;
  padding: 0;
}
.addr-trigger {
  cursor: pointer;
}
.addr-trigger >>> .el-input__inner {
  cursor: pointer;
}
.detail-value-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.detail-value-cell .el-input {
  flex: 1;
  min-width: 0;
}
</style>
