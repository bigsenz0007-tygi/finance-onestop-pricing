<template>
  <div class="wb">
    <header class="wb-header" aria-label="顶部导航">
      <div class="wb-header__brand">
        <span class="wb-header__logo-wrap">
          <span class="wb-header__logo" aria-label="JDL 京东物流" role="img">
            <span class="wb-header__logo-slot" style="inset: 0% 87.85% 78.39% 8.06%">
              <img :src="asset('d2c-assets/nav/logo-fill1.svg')" alt="">
            </span>
            <span class="wb-header__logo-slot" style="inset: 26.5% 87.85% 0 0">
              <img :src="asset('d2c-assets/nav/logo-mark.svg')" alt="">
            </span>
            <span class="wb-header__logo-slot" style="inset: 0 62.76% 3.45% 12.97%">
              <img :src="asset('d2c-assets/nav/logo-fill5.svg')" alt="">
            </span>
            <span class="wb-header__logo-slot" style="inset: 27.67% 45.12% 3.45% 41.34%">
              <img :src="asset('d2c-assets/nav/logo-fill7.svg')" alt="">
            </span>
            <span class="wb-header__logo-slot" style="inset: 27.67% 29.95% 3.45% 56.51%">
              <img :src="asset('d2c-assets/nav/logo-fill9.svg')" alt="">
            </span>
            <span class="wb-header__logo-slot" style="inset: 27.67% 15.09% 3.45% 71.58%">
              <img :src="asset('d2c-assets/nav/logo-fill11.svg')" alt="">
            </span>
            <span class="wb-header__logo-slot" style="inset: 27.67% 0 3.45% 86.46%">
              <img :src="asset('d2c-assets/nav/logo-fill13.svg')" alt="">
            </span>
          </span>
        </span>
        <span class="wb-header__title">财务计费工作台</span>
      </div>
      <div class="wb-header__search">
        <input
          v-model="menuSearch"
          class="wb-header__search-input"
          type="text"
          placeholder="请输入搜索内容"
          aria-label="全局搜索"
        >
        <span
          class="wb-header__search-icon"
          aria-hidden="true"
          :style="iconMaskStyle('d2c-assets/nav/icon-search.svg')"
        />
      </div>
      <div class="wb-header__actions">
        <button type="button" class="wb-header__tool" aria-label="工具入口">
          <span
            class="wb-header__tool-icon"
            aria-hidden="true"
            :style="iconMaskStyle('d2c-assets/nav/icon-swap.svg')"
          />
        </button>
        <button type="button" class="wb-header__user" aria-label="用户菜单">
          <span class="wb-avatar" aria-hidden="true">
            <img
              class="wb-avatar__img"
              :src="asset('d2c-assets/nav/avatar.svg')"
              width="40"
              height="40"
              alt=""
            >
          </span>
          <span class="wb-header__username">郝铭梓</span>
          <span class="wb-header__caret" aria-hidden="true">
            <span
              class="wb-header__caret-glyph"
              :style="iconMaskStyle('d2c-assets/nav/icon-arrow-down.svg')"
            />
          </span>
        </button>
      </div>
    </header>

    <div class="wb-body">
      <aside class="wb-rail">
        <button
          v-for="item in sidebarMenus"
          :key="item.id"
          type="button"
          class="wb-rail__item"
          :class="{
            'is-active': activeRail === item.id,
            'is-hover': hoverRail === item.id && activeRail !== item.id
          }"
          @mouseenter="onRailEnter(item)"
          @mouseleave="onRailLeave"
          @click="onRailClick(item)"
        >
          <span
            class="wb-rail__icon"
            aria-hidden="true"
            :style="iconMaskStyle(item.iconSrc)"
          />
          <span>{{ item.label }}</span>
        </button>
      </aside>

      <aside
        v-show="showSubnav"
        class="wb-subnav"
        @mouseenter="onSubnavEnter"
        @mouseleave="onSubnavLeave"
      >
        <button
          v-for="item in filteredSubmenus"
          :key="item.id"
          type="button"
          class="wb-subnav__item"
          :class="{ 'is-active': activeSubmenu === item.id }"
          @click="openSubmenu(item)"
        >{{ item.label }}</button>
        <div v-if="!filteredSubmenus.length" class="wb-subnav__empty">无匹配菜单</div>
      </aside>

      <main class="wb-main">
        <div v-if="activePage === 'home'" class="wb-home page-shell">
          <div class="table-card">
            <div class="table-toolbar">
              <h3>工作台首页（模拟）</h3>
            </div>
            <p class="wb-home__tip">请从左侧「定价中心 / 报价中心」进入菜单。本次接入：计费单据、定价能力、一站定价、一站报价。</p>
          </div>
        </div>

        <BillingDocs v-else-if="activePage === 'billing-docs'" />
        <PricingCapability v-else-if="activePage === 'pricing-capability'" />

        <div v-else-if="activePage === 'onestop-pricing-home'">
          <OnestopPricingHome
            :list="pricingList"
            @create="openPricingDetail"
            @open="openPricingDetail"
          />
        </div>
        <div v-else-if="activePage === 'onestop-pricing'">
          <OnestopPricing
            :detail-mode="pricingDetailMode"
            @published="onPricingPublished"
            @back="navigate('onestop-pricing-home')"
          />
        </div>

        <div v-else-if="activePage === 'onestop-quoting-home'">
          <OnestopQuotingHome
            :list="quotingList"
            @create="openQuotingDetail"
            @open="openQuotingDetail"
          />
        </div>
        <div v-else-if="activePage === 'onestop-quoting'">
          <OnestopQuoting
            :key="'quote-' + quotingDetailMode + '-' + ((quotingSourceRow && quotingSourceRow.id) || 'new')"
            :detail-mode="quotingDetailMode"
            :source-row="quotingSourceRow"
            @published="onQuotingPublished"
            @back="navigate('onestop-quoting-home')"
          />
        </div>

        <div v-else class="page-shell">
          <div class="table-card">
            <h3>菜单预览占位</h3>
            <p class="wb-home__tip">「{{ placeholderLabel }}」尚未接入业务页，仅作导航演示。</p>
          </div>
        </div>

        <el-dialog
          title="场景定价详情"
          :visible.sync="pricingViewVisible"
          width="960px"
          top="4vh"
          custom-class="lui-form-dialog pricing-view-dialog"
          append-to-body
          :close-on-click-modal="false"
          destroy-on-close
        >
          <OnestopPricing
            v-if="pricingViewVisible"
            detail-mode="view"
            embedded
            @back="pricingViewVisible = false"
          />
        </el-dialog>

        <el-dialog
          title="报价方案详情"
          :visible.sync="quotingViewVisible"
          width="1080px"
          top="4vh"
          custom-class="lui-form-dialog pricing-view-dialog"
          append-to-body
          :close-on-click-modal="false"
          destroy-on-close
        >
          <OnestopQuoting
            v-if="quotingViewVisible"
            detail-mode="view"
            embedded
            :source-row="quotingSourceRow"
            @back="quotingViewVisible = false"
          />
        </el-dialog>
      </main>
    </div>
  </div>
</template>

<script>
import BillingDocs from './views/BillingDocs.vue'
import PricingCapability from './views/PricingCapability.vue'
import OnestopPricing from './views/OnestopPricing.vue'
import OnestopQuoting from './views/OnestopQuoting.vue'
import OnestopPricingHome from './views/OnestopPricingHome.vue'
import OnestopQuotingHome from './views/OnestopQuotingHome.vue'
import {
  SIDEBAR_MENUS,
  getSubmenus,
  resolveSubmenuId
} from './mock/workbenchNav'
import { publicAsset } from './utils/publicAsset'

export default {
  name: 'App',
  components: {
    BillingDocs,
    PricingCapability,
    OnestopPricing,
    OnestopQuoting,
    OnestopPricingHome,
    OnestopQuotingHome
  },
  data() {
    return {
      sidebarMenus: SIDEBAR_MENUS,
      menuSearch: '',
      activeRail: 'home',
      hoverRail: '',
      subnavHover: false,
      hideSubnavTimer: null,
      activeSubmenu: '',
      activePage: 'home',
      placeholderLabel: '',
      pricingDetailMode: 'create',
      pricingViewVisible: false,
      quotingDetailMode: 'create',
      quotingViewVisible: false,
      quotingSourceRow: null,
      pricingList: [
        { id: 'P2', name: '大促活动场景价', mode: '场景定价', target: '大促活动', status: '草稿', creator: '李**', createdAt: '2026-07-22 14:10:00' },
        { id: 'P3', name: '冷链退供场景价', mode: '场景定价', target: '冷链B仓退供出库', status: '已停用', creator: '王**', createdAt: '2026-07-18 09:00:00' },
        { id: 'P4', name: '生鲜特配场景价', mode: '场景定价', target: '生鲜特配', status: '已启用', creator: '张**', createdAt: '2026-07-20 10:20:00' }
      ],
      quotingList: [
        {
          id: 'Q1',
          schemeCode: 'BJ-20260721-001',
          name: '商家A-标快报价-7月',
          method: '场景报价',
          merchantCode: '1829189081092',
          merchantName: '京东自营测试客户',
          businessScenario: '大件特配',
          productType: '重货标快',
          discountProduct: '重货标快',
          strategy: '统计考核',
          status: '已启用',
          creator: '张**',
          createdAt: '2026-07-21 11:00:00',
          signRegion: '华东',
          effectiveRange: ['2026-07-01', '2026-12-31'],
          complexQuoteOpen: false,
          selectedDims: ['费用项', '商家订单类型', '正逆向'],
          partitions: [{
            id: 'Q1-P1',
            name: '默认分区',
            applyNo: 'SQ-20260721-001',
            contractCode: 'HT-20260721-001',
            statGroup: '1',
            statBillingObject: '统计+计费',
            fromAddress: ['上海市-上海市-徐汇区-斜土路街道'],
            toAddress: ['广东省-深圳市-南山区-粤海街道'],
            feeItem: '运费',
            orderType: '普通订单',
            deliveryType: '',
            direction: '正向'
          }],
          detailMap: {
            'Q1-P1': {
              stairMode: '计费重量',
              stairProgress: '全量累进',
              statTarget: '月度单量',
              intervalType: '前开后闭',
              businessCarry: '0.5 进位',
              lightThrow: '6000',
              rows: [{
                id: 'Q1-R1',
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
          },
          extension: {
            mergeDimensions: [],
            mergeTargets: [],
            apportionBasis: [],
            statDimensions: ['始发城市'],
            statTargets: ['商家单量']
          },
          base: {
            quotationName: '商家A-标快报价-7月',
            merchantCode: '1829189081092',
            merchantName: '京东自营测试客户',
            signRegion: '华东',
            effectiveRange: ['2026-07-01', '2026-12-31'],
            quotationMethod: '场景报价',
            discountProduct: '重货标快',
            businessScenario: '大件特配',
            settlementMethod: '月结',
            billingStrategy: '统计考核',
            statisticsMethod: '按考核开始月份',
            assessmentStartMonth: '2026-07',
            amountRounding: '四舍五入取整',
            separateMerchantAccount: '否',
            hasIdentityPriority: '否',
            identityPriority: '',
            substituteModeRule: '',
            addressLevelMatch: '是'
          }
        },
        {
          id: 'Q2',
          schemeCode: 'BJ-20260725-002',
          name: '商家B-大促场景报价',
          method: '场景报价',
          merchantCode: '21212',
          merchantName: '大促测试客户',
          businessScenario: '大促活动',
          productType: '京东标快',
          discountProduct: '京东标快',
          strategy: '统计+合单',
          status: '草稿',
          creator: '李**',
          createdAt: '2026-07-25 16:30:00',
          selectedDims: ['费用项', '配送类型'],
          partitions: [{
            id: 'Q2-P1',
            name: '大促分区',
            applyNo: 'SQ-20260725-002',
            contractCode: 'HT-20260725-002',
            statGroup: '2',
            statBillingObject: '统计+计费',
            fromAddress: ['北京市-北京市-朝阳区'],
            toAddress: ['浙江省-杭州市-余杭区'],
            feeItem: '运费',
            orderType: '',
            deliveryType: '快递',
            direction: ''
          }],
          detailMap: {
            'Q2-P1': {
              stairMode: '计费重量',
              stairProgress: '超量累进',
              statTarget: '月度金额',
              intervalType: '前闭后开',
              businessCarry: '四舍五入取整',
              lightThrow: '8000',
              rows: [{
                id: 'Q2-R1',
                statMin: 0,
                statMax: 100,
                stairMin: 0,
                stairMax: '无穷大',
                discountMode: '折扣率',
                discountDetail: '95',
                firstWeight: '',
                firstWeightPrice: '',
                continueWeight: '',
                continueWeightPrice: '',
                rowLightThrow: ''
              }]
            }
          },
          extension: {
            mergeDimensions: ['商家订单号'],
            mergeTargets: ['重量'],
            apportionBasis: ['按重量分摊'],
            statDimensions: ['始发城市'],
            statTargets: ['商家单量']
          }
        },
        {
          id: 'Q3',
          schemeCode: 'BJ-20260715-003',
          name: '商家C-退换货报价',
          method: '场景报价',
          merchantCode: '121212',
          merchantName: '逆向测试客户',
          businessScenario: '逆向退换货',
          productType: '京东特快',
          discountProduct: '京东特快',
          strategy: '普通',
          status: '已停用',
          creator: '王**',
          createdAt: '2026-07-15 08:40:00',
          selectedDims: ['费用项', '正逆向'],
          partitions: [{
            id: 'Q3-P1',
            name: '逆向分区',
            applyNo: 'SQ-20260715-003',
            contractCode: 'HT-20260715-003',
            statGroup: '',
            statBillingObject: '',
            fromAddress: [],
            toAddress: [],
            feeItem: '运费',
            orderType: '',
            deliveryType: '',
            direction: '逆向'
          }],
          detailMap: {
            'Q3-P1': {
              stairMode: '无',
              stairProgress: '',
              statTarget: '',
              intervalType: '',
              businessCarry: '',
              lightThrow: '',
              rows: [{
                id: 'Q3-R1',
                statMin: '',
                statMax: '',
                stairMin: '',
                stairMax: '',
                discountMode: '一口价',
                discountDetail: '12',
                firstWeight: '',
                firstWeightPrice: '',
                continueWeight: '',
                continueWeightPrice: '',
                rowLightThrow: ''
              }]
            }
          },
          extension: {
            mergeDimensions: [],
            mergeTargets: [],
            apportionBasis: [],
            statDimensions: [],
            statTargets: []
          }
        }
      ]
    }
  },
  computed: {
    showSubnav() {
      return this.hoverRail === 'pricing' || this.hoverRail === 'quoting'
    },
    currentSubmenus() {
      return getSubmenus(this.hoverRail)
    },
    filteredSubmenus() {
      const kw = (this.menuSearch || '').trim()
      if (!kw) return this.currentSubmenus
      return this.currentSubmenus.filter(i => i.label.includes(kw))
    }
  },
  beforeDestroy() {
    this.clearHideSubnavTimer()
  },
  methods: {
    asset: publicAsset,
    iconMaskStyle(src) {
      const url = `url("${publicAsset(src)}")`
      return {
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center'
      }
    },
    clearHideSubnavTimer() {
      if (this.hideSubnavTimer) {
        clearTimeout(this.hideSubnavTimer)
        this.hideSubnavTimer = null
      }
    },
    scheduleHideSubnav() {
      this.clearHideSubnavTimer()
      this.hideSubnavTimer = setTimeout(() => {
        if (!this.subnavHover) this.hoverRail = ''
      }, 120)
    },
    onRailEnter(item) {
      this.clearHideSubnavTimer()
      if (item.hasSub) {
        this.hoverRail = item.id
      } else {
        this.hoverRail = ''
      }
    },
    onRailLeave() {
      this.scheduleHideSubnav()
    },
    onSubnavEnter() {
      this.subnavHover = true
      this.clearHideSubnavTimer()
    },
    onSubnavLeave() {
      this.subnavHover = false
      this.hoverRail = ''
    },
    onRailClick(item) {
      this.activeRail = item.id
      if (item.hasSub) {
        this.hoverRail = item.id
        const subs = getSubmenus(item.id)
        const first = subs[0]
        if (first) this.openSubmenu(first)
        return
      }
      this.hoverRail = ''
      this.activeSubmenu = ''
      if (item.id === 'home') {
        this.navigate('home')
      } else {
        this.placeholderLabel = item.label
        this.activePage = 'placeholder'
      }
    },
    openSubmenu(item) {
      this.activeSubmenu = item.id
      this.navigate(item.route)
      // 点击后收起二级菜单，符合“移开收起”的交互
      this.hoverRail = ''
      this.subnavHover = false
    },
    navigate(page) {
      this.activePage = page
      if (page === 'billing-docs' || page === 'pricing-capability' || page.indexOf('onestop-pricing') === 0) {
        this.activeRail = 'pricing'
      } else if (page.indexOf('onestop-quoting') === 0) {
        this.activeRail = 'quoting'
      } else if (page === 'home') {
        this.activeRail = 'home'
        this.activeSubmenu = ''
        return
      }
      const sub = resolveSubmenuId(page)
      if (sub) this.activeSubmenu = sub
    },
    openPricingDetail(row, mode) {
      if (mode === 'view') {
        this.pricingDetailMode = 'view'
        this.pricingViewVisible = true
        return
      }
      if (row) {
        this.pricingDetailMode = 'edit'
      } else {
        this.pricingDetailMode = 'create'
      }
      this.navigate('onestop-pricing')
    },
    openQuotingDetail(row, mode) {
      if (mode === 'view') {
        this.quotingSourceRow = row || null
        this.quotingDetailMode = 'view'
        this.quotingViewVisible = true
        return
      }
      if (row) {
        this.quotingSourceRow = row
        this.quotingDetailMode = 'edit'
      } else {
        this.quotingSourceRow = null
        this.quotingDetailMode = 'create'
      }
      this.navigate('onestop-quoting')
    },
    onPricingPublished(row) {
      this.pricingList.unshift(row)
      this.navigate('onestop-pricing-home')
      this.$message.success('发布成功')
    },
    onQuotingPublished(row) {
      const idx = this.quotingList.findIndex(item => item.id === row.id)
      if (idx >= 0) {
        // 整单替换，保留发布快照字段（分区/明细/维度等）
        this.$set(this.quotingList, idx, { ...row })
      } else {
        this.quotingList.unshift(row)
      }
      this.quotingSourceRow = null
      this.navigate('onestop-quoting-home')
      this.$message.success(idx >= 0 ? '保存成功' : '发布成功')
    }
  }
}
</script>

<style scoped>
.wb {
  min-height: 100vh;
  background: #f5f5f6;
  display: flex;
  flex-direction: column;
}
.wb-header {
  position: relative;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 24px 0 0;
  background: #fff;
  border-bottom: 1px solid #f1f2f4;
  z-index: 20;
  box-sizing: border-box;
  min-width: 1280px;
}
.wb-header__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  height: 64px;
  padding-left: 16px;
  box-sizing: border-box;
}
.wb-header__logo-wrap {
  display: flex;
  align-items: center;
  padding: 8px 0 12px;
  box-sizing: border-box;
}
.wb-header__logo {
  position: relative;
  display: block;
  width: 120px;
  height: 20px;
  flex-shrink: 0;
  overflow: hidden;
}
.wb-header__logo-slot {
  position: absolute;
  display: block;
  overflow: hidden;
}
.wb-header__logo-slot img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: fill;
  pointer-events: none;
}
.wb-header__title {
  font-size: 16px;
  font-weight: 600;
  color: #23252b;
  white-space: nowrap;
  line-height: 18px;
}
.wb-header__search {
  position: absolute;
  left: 294px;
  top: 17px;
  width: 400px;
  min-width: 80px;
  height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px 5px 12px;
  box-sizing: border-box;
  border: 1px solid #e4e5e9;
  border-radius: 8px;
  background: #fff;
}
.wb-header__search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 22px;
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #23252b;
  font-size: 14px;
  line-height: 22px;
}
.wb-header__search-input::placeholder {
  color: #babec7;
}
.wb-header__search:focus-within {
  border-color: #3c6ef0;
}
.wb-header__search-icon {
  display: block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  background: currentColor;
  color: #868d9f;
}
.wb-header__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-left: auto;
  flex-shrink: 0;
}
.wb-header__tool {
  width: 32px;
  height: 32px;
  padding: 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #525765;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.wb-header__tool:hover {
  background: #f5f5f6;
  color: #3c6ef0;
}
.wb-header__tool-icon {
  display: block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  background: currentColor;
}
.wb-header__user {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  height: 40px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  overflow: hidden;
}
.wb-avatar {
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  overflow: hidden;
  display: inline-flex;
  flex-shrink: 0;
  background: #e4e5e9;
}
.wb-avatar__img {
  display: block;
  width: 40px;
  height: 40px;
  object-fit: cover;
  flex-shrink: 0;
}
.wb-header__username {
  color: #23252b;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  white-space: nowrap;
}
.wb-header__caret {
  position: relative;
  display: block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.wb-header__caret-glyph {
  position: absolute;
  left: 50%;
  top: calc(50% + 0.2px);
  width: 4.39052px;
  height: 8px;
  background: currentColor;
  color: #868d9f;
  transform: translate(-50%, -50%) scaleX(-1) rotate(90deg);
  transform-origin: center;
}
.wb-body {
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
}
.wb-rail {
  width: 72px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e4e5e9;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 15;
  box-sizing: border-box;
}
.wb-rail__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 56px;
  margin: 0;
  border: 0;
  border-radius: 8px;
  background: #fff;
  color: #868d9f;
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
  padding: 6px 0 4px;
  text-align: center;
  box-sizing: border-box;
}
.wb-rail__icon {
  display: block;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  background: currentColor;
}
.wb-rail__item:hover,
.wb-rail__item.is-hover {
  background: #f5f5f6;
  color: #868d9f;
}
.wb-rail__item.is-active {
  background: rgba(60, 110, 240, 0.1);
  color: #3c6ef0;
}
.wb-rail__item.is-active:hover {
  background: rgba(60, 110, 240, 0.1);
  color: #3c6ef0;
}
.wb-rail__item span:last-child {
  width: 48px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wb-subnav {
  position: absolute;
  left: 72px;
  top: 0;
  bottom: 0;
  width: 168px;
  z-index: 14;
  background: #fff;
  border-right: 1px solid #e4e5e9;
  box-shadow: 4px 0 12px rgba(35, 37, 43, 0.06);
  padding: 12px 8px;
  overflow: auto;
}
.wb-subnav__item {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 10px 12px;
  border-radius: 6px;
  color: #525765;
  font-size: 13px;
  cursor: pointer;
  margin-bottom: 2px;
  line-height: 1.4;
}
.wb-subnav__item:hover {
  background: #f5f5f6;
  color: #3c6ef0;
}
.wb-subnav__item.is-active {
  background: rgba(60, 110, 240, 0.1);
  color: #3c6ef0;
}
.wb-subnav__empty {
  padding: 12px;
  color: #babec7;
  font-size: 12px;
}
.wb-main {
  flex: 1;
  min-width: 0;
  overflow: auto;
}
.wb-home__tip {
  margin: 0;
  color: #868d9f;
  font-size: 13px;
  line-height: 1.6;
}
.wb-detail-bar {
  padding-top: 8px;
}
</style>

<style>
.pricing-view-dialog.el-dialog {
  margin-bottom: 4vh;
  width: 1080px !important;
  height: 800px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
}
.pricing-view-dialog .el-dialog__header {
  padding-left: 24px;
  padding-right: 24px;
  flex-shrink: 0;
}
.pricing-view-dialog .el-dialog__body {
  flex: 1 1 auto;
  height: auto;
  max-height: none;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  /* 与大标题同轨：内容区左右 24px，小标题距弹窗最左 24px */
  padding: 8px 24px 16px;
  box-sizing: border-box;
}
.pricing-view-dialog .pricing-view-embed {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.pricing-view-dialog .pricing-view-embed > .table-card {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.pricing-view-dialog .pricing-view-embed .wizard-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
}
.pricing-view-dialog .pricing-view-embed .quoting-view-tabs.lui-pill-tabs {
  margin: 0 0 24px;
  border-bottom: none;
}
/* 去掉 table-card 额外 16px，避免小标题比大标题更靠右 */
.pricing-view-dialog .table-card--view {
  padding: 0;
  min-height: 0;
  background: transparent;
  border-radius: 0;
}
.pricing-view-dialog .table-card--view .section-title,
.pricing-view-dialog .table-card--view .table-toolbar .section-title {
  margin-left: 0;
  padding-left: 0;
  text-align: left;
}
/* 仅隐藏弹窗外层页头工具栏；分区/明细小标题须保留 */
.pricing-view-dialog .pricing-view-embed > .table-card > .table-toolbar {
  display: none;
}
.pricing-view-dialog .pricing-view-embed .wizard-footer {
  display: none;
}
/* 查看态：去掉下拉/日期箭头与操作控件，仅保留内容预览 */
.pricing-view-dialog .table-card--view .el-form-item.is-required:not(.is-no-asterisk) > .el-form-item__label:before {
  display: none !important;
}
.pricing-view-dialog .table-card--view .el-input__suffix,
.pricing-view-dialog .table-card--view .el-input__prefix,
.pricing-view-dialog .table-card--view .el-select .el-input__suffix,
.pricing-view-dialog .table-card--view .el-range__icon,
.pricing-view-dialog .table-card--view .el-range__close-icon,
.pricing-view-dialog .table-card--view .el-input__icon,
.pricing-view-dialog .table-card--view .el-tag__close,
.pricing-view-dialog .table-card--view .el-select .el-tag__close,
.pricing-view-dialog .table-card--view .el-switch,
.pricing-view-dialog .table-card--view .el-button:not(.field-tip-btn) {
  display: none !important;
}
.pricing-view-dialog .table-card--view .el-input__inner,
.pricing-view-dialog .table-card--view .el-textarea__inner,
.pricing-view-dialog .table-card--view .el-range-editor.el-input__inner {
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
.pricing-view-dialog .table-card--view .el-range-editor {
  width: auto !important;
}
.pricing-view-dialog .table-card--view .el-range-separator {
  width: auto;
  padding: 0 4px;
  line-height: 22px;
}
.pricing-view-dialog .table-card--view .el-range-input {
  background: transparent;
  width: auto;
  flex: none;
}
.pricing-view-dialog .table-card--view .el-radio__input {
  display: none !important;
}
.pricing-view-dialog .table-card--view .el-radio__label {
  padding-left: 0 !important;
}
.pricing-view-dialog .table-card--view .el-checkbox__input {
  pointer-events: none;
}
.pricing-view-dialog .table-card--view .merchant-codes {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  min-height: 0;
  cursor: default;
}
.pricing-view-dialog .table-card--view .merchant-codes__input {
  display: none;
}
.pricing-view-dialog .table-card--view .el-tag {
  pointer-events: none;
}
.pricing-view-dialog .table-card--view .pricing-section + .pricing-section {
  margin-top: 24px;
  padding-top: 0;
}
.pricing-view-dialog .table-card--view .quoting-section + .quoting-section {
  margin-top: 0;
  padding-top: 0;
}
.pricing-view-dialog .table-card--view .quoting-section {
  margin-top: 0;
}
.pricing-view-dialog .table-card--view .section-title--module {
  margin-top: 24px;
  margin-bottom: 12px;
}
.pricing-view-dialog .table-card--view .ext-block--plain {
  margin-top: 0;
}
.pricing-view-dialog .table-card--view .partition-card {
  margin-top: 24px;
}
.pricing-view-dialog .table-card--view .pricing-section__sub {
  margin-top: 24px;
}
.pricing-view-dialog .table-card--view .section-title {
  font-size: 16px !important;
  line-height: 22px !important;
  font-weight: 500;
}
/* 预览表单：回退 LUI 右对齐 label120 + 双列 1fr */
.pricing-view-dialog .table-card--view .lui-form-grid.el-form {
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
.pricing-view-dialog .table-card--view .lui-form-grid .el-form-item {
  margin-bottom: 0 !important;
  min-height: 22px;
  align-items: center;
  width: 100%;
}
.pricing-view-dialog .table-card--view .lui-form-grid .el-form-item__label {
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
  float: none !important;
  box-sizing: border-box;
  height: 22px !important;
  line-height: 22px !important;
}
.pricing-view-dialog .table-card--view .lui-form-grid .el-form-item__content {
  margin-left: 0 !important;
  padding-left: 0 !important;
  flex: 1 1 0%;
  min-width: 0;
  line-height: 22px !important;
  min-height: 22px;
}
.pricing-view-dialog .table-card--view .complex-quote-form.lui-form-grid.el-form,
.pricing-view-dialog .table-card--view .quoting-base-form.lui-form-grid.el-form,
.pricing-view-dialog .table-card--view .detail-meta-form.lui-form-grid.el-form,
.pricing-view-dialog .table-card--view .ext-rule-form.lui-form-grid.el-form,
.pricing-view-dialog .table-card--view .partition-dims-form.lui-form-grid.el-form {
  justify-content: stretch !important;
  width: 100% !important;
}
/* 预览：基础信息 / 复杂报价 / 明细元信息 / 拓展规则同轨三列 */
.pricing-view-dialog .table-card--view .complex-quote-form.lui-form-grid.el-form,
.pricing-view-dialog .table-card--view .quoting-base-form.lui-form-grid.el-form,
.pricing-view-dialog .table-card--view .detail-meta-form.lui-form-grid.el-form,
.pricing-view-dialog .table-card--view .ext-rule-form.lui-form-grid.el-form {
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  column-gap: 48px !important;
}
.pricing-view-dialog .table-card--view .partition-dims-form.lui-form-grid.el-form {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  column-gap: 48px !important;
}
.pricing-view-dialog .table-card--view .complex-quote-form .el-form-item__content,
.pricing-view-dialog .table-card--view .complex-quote-form .view-plain-text,
.pricing-view-dialog .table-card--view .complex-quote-form .ext-block__status,
.pricing-view-dialog .table-card--view .complex-quote-form .ext-block__switch {
  min-height: 22px !important;
  height: 22px !important;
  line-height: 22px !important;
}
.pricing-view-dialog .table-card--view .partition-dims-form.lui-form-grid.el-form {
  --lui-form-label-width: 120px;
  row-gap: 0 !important;
}
.pricing-view-dialog .table-card--view .partition-dims-form .el-form-item__label {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  padding-right: 12px !important;
  text-align: right !important;
  justify-content: flex-end !important;
  height: 22px !important;
  line-height: 22px !important;
}
.pricing-view-dialog .table-card--view .dims-readonly {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  align-content: flex-start;
  width: 100%;
  min-width: 0;
  min-height: 22px;
  gap: 8px;
}
.pricing-view-dialog .table-card--view .partition-dims-form .el-form-item.lui-form-grid__span-all .el-form-item__content {
  width: 100% !important;
  max-width: none !important;
  flex: 1 1 auto !important;
}
/* 正文内容统一 14px（含 small 表单、单选、标签、表格） */
.pricing-view-dialog .table-card--view,
.pricing-view-dialog .table-card--view .el-form,
.pricing-view-dialog .table-card--view .el-form--small .el-form-item__label,
.pricing-view-dialog .table-card--view .el-form--small .el-form-item__content,
.pricing-view-dialog .table-card--view .el-form-item__label,
.pricing-view-dialog .table-card--view .el-form-item__content,
.pricing-view-dialog .table-card--view .el-input__inner,
.pricing-view-dialog .table-card--view .el-textarea__inner,
.pricing-view-dialog .table-card--view .el-range-input,
.pricing-view-dialog .table-card--view .el-range-separator,
.pricing-view-dialog .table-card--view .el-radio__label,
.pricing-view-dialog .table-card--view .el-checkbox__label,
.pricing-view-dialog .table-card--view .el-select-dropdown__item,
.pricing-view-dialog .table-card--view .el-tag,
.pricing-view-dialog .table-card--view .el-tag--mini,
.pricing-view-dialog .table-card--view .el-tag--small,
.pricing-view-dialog .table-card--view .drawer-view-text,
.pricing-view-dialog .table-card--view .view-plain-text,
.pricing-view-dialog .table-card--view .ext-rule-form__label,
.pricing-view-dialog .table-card--view .ext-block__status,
.pricing-view-dialog .table-card--view .ext-block__title,
.pricing-view-dialog .table-card--view .dims-readonly,
.pricing-view-dialog .table-card--view .dims-readonly__tag,
.pricing-view-dialog .table-card--view .addr-select,
.pricing-view-dialog .table-card--view .addr-select__placeholder,
.pricing-view-dialog .table-card--view .field-tip {
  font-size: 14px !important;
  line-height: 22px !important;
  font-family: var(--lui-font-sans);
}
/* 表格字号/色：PC3.0 14px / #525765，行高跟随表组件默认 */
.pricing-view-dialog .table-card--view .el-table,
.pricing-view-dialog .table-card--view .el-table th.el-table__cell,
.pricing-view-dialog .table-card--view .el-table td.el-table__cell,
.pricing-view-dialog .table-card--view .el-table .cell,
.pricing-view-dialog .table-card--view .addr-view-text {
  font-size: 14px !important;
  font-family: var(--lui-font-sans);
}
.pricing-view-dialog .table-card--view .partition-table-wrap {
  margin-top: 24px;
  margin-bottom: 0;
}
.pricing-view-dialog .table-card--view .detail-meta-form.lui-form-grid {
  margin: 0;
}
.pricing-view-dialog .table-card--view .detail-stair-table {
  margin-top: 24px;
  margin-bottom: 24px;
}
.pricing-view-dialog .table-card--view .detail-stair-table + .section-title--module {
  margin-top: 0;
}
.pricing-view-dialog .table-card--view .el-table th.el-table__cell,
.pricing-view-dialog .table-card--view .el-table th.el-table__cell .cell {
  color: #525765 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
}
.pricing-view-dialog .table-card--view .el-table td.el-table__cell,
.pricing-view-dialog .table-card--view .el-table td.el-table__cell .cell,
.pricing-view-dialog .table-card--view .el-table .view-plain-text,
.pricing-view-dialog .table-card--view .el-table .addr-view-text {
  color: #525765 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
}
.pricing-view-dialog .table-card--view .lui-form-grid .el-form-item__label {
  color: #525765 !important;
}
.pricing-view-dialog .table-card--view .view-plain-text {
  display: inline;
  color: #23252b;
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;
}
.pricing-view-dialog .table-card--view .el-table .view-plain-text {
  white-space: nowrap;
  line-height: 16px;
  color: #525765 !important;
}
.pricing-view-dialog .table-card--view .el-select__tags {
  max-width: none !important;
  flex-wrap: wrap;
}
.pricing-view-dialog .table-card--view .el-select .el-input {
  height: auto !important;
}
.pricing-view-dialog .table-card--view .el-select .el-input__inner {
  height: auto !important;
  min-height: 22px;
}
.pricing-view-dialog .table-card--view .table-h-scroll {
  pointer-events: auto;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
}
.pricing-view-dialog .table-card--view .table-h-scroll .el-table {
  width: max-content !important;
  min-width: 100%;
}
.pricing-view-dialog .table-card--view .table-h-scroll .el-table__header-wrapper,
.pricing-view-dialog .table-card--view .table-h-scroll .el-table__body-wrapper {
  overflow: visible !important;
}
.pricing-view-dialog .table-card--view .table-h-scroll::-webkit-scrollbar {
  height: 8px;
}
.pricing-view-dialog .table-card--view .table-h-scroll::-webkit-scrollbar-thumb {
  min-width: 48px;
  background: #c0c4cc;
  border-radius: 4px;
}
.pricing-view-dialog .table-card--view .quote-form .el-form-item__label {
  width: 120px !important;
  min-width: 120px !important;
  max-width: 120px !important;
  padding-right: 12px !important;
  box-sizing: border-box;
  text-align: right !important;
  justify-content: flex-end !important;
  color: #525765 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
}
.pricing-view-dialog .table-card--view .quote-form .el-form-item__content {
  margin-left: 0 !important;
}
.pricing-view-dialog .table-card--view .quote-form .el-form-item__content > .dimension-alias-grid,
.pricing-view-dialog .table-card--view .quote-form .el-form-item__content > .mode-row,
.pricing-view-dialog .table-card--view .quote-form .el-form-item__content > .table-h-scroll,
.pricing-view-dialog .table-card--view .quote-form .el-form-item__content > .el-select {
  margin: 0;
  padding: 0;
  width: 100%;
}
.pricing-view-dialog .table-card--view .quote-form .dimension-alias-table .el-table .cell,
.pricing-view-dialog .table-card--view .quote-form .quote-sub-table .el-table .cell {
  padding-left: 12px;
  padding-right: 12px;
}
.pricing-view-dialog .table-card--view .quote-form .el-select .el-input {
  display: none !important;
}
.pricing-view-dialog .table-card--view .quote-form .el-select .el-select__tags {
  position: static !important;
  transform: none !important;
  top: auto !important;
  left: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  max-width: none !important;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pricing-view-dialog .table-card--view .quote-form .el-select .el-tag {
  margin: 0 !important;
}
.pricing-view-dialog .table-card--view .quote-form .field-label-with-tip {
  width: 100%;
  justify-content: flex-end;
}
.pricing-view-dialog .table-card--view .ext-rule-form__label,
.pricing-view-dialog .table-card--view .ext-block__status {
  color: #23252b;
}
.pricing-view-dialog .table-card--view .table-cell-full {
  white-space: nowrap;
}
.pricing-view-dialog .table-card--view .condition-row--nowrap {
  flex-wrap: nowrap;
}
.pricing-view-dialog .table-card--view .field-tip-btn {
  display: inline-flex !important;
  pointer-events: auto;
}
.pricing-view-dialog .table-card--view .field-tip-trigger {
  pointer-events: auto;
}
</style>
