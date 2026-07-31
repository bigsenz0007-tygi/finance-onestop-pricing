<template>
  <div class="lui-arrow-steps-card">
    <div class="lui-arrow-steps" role="list">
      <div
        v-for="(step, index) in steps"
        :key="step.title"
        class="lui-arrow-steps__item"
        :class="itemClass(index)"
        role="listitem"
        :aria-current="index === active ? 'step' : null"
        :aria-disabled="isDisabled(index) ? 'true' : null"
        @click="onItemClick(index)"
      >
        <span class="lui-arrow-steps__skin" aria-hidden="true">
          <i class="lui-arrow-steps__cap lui-arrow-steps__cap--l" />
          <i class="lui-arrow-steps__body" />
          <i class="lui-arrow-steps__cap lui-arrow-steps__cap--r" />
        </span>
        <span class="lui-arrow-steps__num" aria-hidden="true">{{ index + 1 }}</span>
        <span class="lui-arrow-steps__label">
          <img
            class="lui-arrow-steps__icon"
            :src="stepIcon(index)"
            alt=""
          >
          <strong>{{ step.title }}</strong>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
const ICON_BASE = '/d2c-assets/figma-stepper'

export default {
  name: 'LuiArrowSteps',
  props: {
    steps: {
      type: Array,
      required: true
    },
    active: {
      type: Number,
      default: 0
    },
    /** 已解锁的最大步骤下标；未传则全部可点（兼容旧用法） */
    maxReachable: {
      type: Number,
      default: null
    }
  },
  methods: {
    isDisabled(index) {
      if (this.maxReachable === null || this.maxReachable === undefined) return false
      return index > this.maxReachable
    },
    itemClass(index) {
      return {
        'is-complete': index < this.active,
        'is-active': index === this.active,
        'is-pending': index > this.active,
        'is-disabled': this.isDisabled(index),
        'is-start': index === 0,
        'is-end': index === this.steps.length - 1,
        'is-middle': index > 0 && index < this.steps.length - 1
      }
    },
    stepIcon(index) {
      if (index < this.active) return `${ICON_BASE}/check.svg`
      if (index === this.active) return `${ICON_BASE}/icon-form.svg`
      return `${ICON_BASE}/icon-document.svg`
    },
    onItemClick(index) {
      if (this.isDisabled(index)) return
      this.$emit('change', index)
    }
  }
}
</script>

<style scoped>
/* 对齐国际考勤箭头步骤条状态色：当前 #3C6EF0 / 完成 #EDF2FF / 未到 #F1F2F4 */
.lui-arrow-steps-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  align-items: stretch;
  padding: 0;
  margin: 0 0 16px;
  border: 0;
  border-radius: 0;
  background: transparent;
}
.lui-arrow-steps-card::after {
  content: '';
  display: block;
  width: 100%;
  height: 0;
  margin-top: 16px;
  border-bottom: 1px solid #e4e5e9;
}
.lui-arrow-steps {
  display: flex;
  width: 100%;
  height: 48px;
  align-items: stretch;
  gap: 6px;
}

.lui-arrow-steps__item {
  position: relative;
  z-index: 1;
  display: flex;
  height: 48px;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  overflow: visible;
  color: #868d9f;
  background: transparent;
  cursor: pointer;
  user-select: none;
}

.lui-arrow-steps__item.is-start {
  z-index: 2;
}

.lui-arrow-steps__item.is-active {
  color: #fff;
  z-index: 3;
}

.lui-arrow-steps__item.is-complete {
  color: #23252b;
}

.lui-arrow-steps__item.is-pending {
  color: #525765;
}

.lui-arrow-steps__item.is-disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.lui-arrow-steps__skin {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: flex;
  align-items: stretch;
  pointer-events: none;
}

.lui-arrow-steps__cap,
.lui-arrow-steps__body {
  display: block;
  height: 48px;
  background-color: #f1f2f4;
}

.lui-arrow-steps__item.is-active .lui-arrow-steps__cap,
.lui-arrow-steps__item.is-active .lui-arrow-steps__body {
  background-color: #3c6ef0;
}

.lui-arrow-steps__item.is-complete .lui-arrow-steps__cap,
.lui-arrow-steps__item.is-complete .lui-arrow-steps__body {
  background-color: #edf2ff;
}

.lui-arrow-steps__item.is-pending .lui-arrow-steps__cap,
.lui-arrow-steps__item.is-pending .lui-arrow-steps__body {
  background-color: #f1f2f4;
}

.lui-arrow-steps__body {
  position: relative;
  z-index: 0;
  flex: 1 1 auto;
  min-width: 0;
  margin: 0 -2px;
}

.lui-arrow-steps__cap {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: 100% 100%;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: 100% 100%;
}

/* 默认中间段：左凹口 + 右尖头 */
.lui-arrow-steps__cap--l {
  width: 20px;
  -webkit-mask-image: url('/d2c-assets/figma-stepper/mask-end-left.svg');
  mask-image: url('/d2c-assets/figma-stepper/mask-end-left.svg');
}

.lui-arrow-steps__cap--r {
  width: 20px;
  -webkit-mask-image: url('/d2c-assets/figma-stepper/mask-tip-right.svg');
  mask-image: url('/d2c-assets/figma-stepper/mask-tip-right.svg');
}

.lui-arrow-steps__item.is-start .lui-arrow-steps__cap--l {
  width: 8px;
  -webkit-mask-image: url('/d2c-assets/figma-stepper/mask-start-left.svg');
  mask-image: url('/d2c-assets/figma-stepper/mask-start-left.svg');
}

.lui-arrow-steps__item.is-start .lui-arrow-steps__cap--r {
  width: 20px;
  -webkit-mask-image: url('/d2c-assets/figma-stepper/mask-tip-right.svg');
  mask-image: url('/d2c-assets/figma-stepper/mask-tip-right.svg');
}

.lui-arrow-steps__item.is-end .lui-arrow-steps__cap--l {
  width: 20px;
  -webkit-mask-image: url('/d2c-assets/figma-stepper/mask-end-left.svg');
  mask-image: url('/d2c-assets/figma-stepper/mask-end-left.svg');
}

.lui-arrow-steps__item.is-end .lui-arrow-steps__cap--r {
  width: 8px;
  -webkit-mask-image: url('/d2c-assets/figma-stepper/mask-end-right.svg');
  mask-image: url('/d2c-assets/figma-stepper/mask-end-right.svg');
}

.lui-arrow-steps__num {
  position: absolute;
  top: 50%;
  left: 36px;
  z-index: 1;
  display: block;
  height: 32px;
  font-size: 32px;
  font-style: italic;
  font-weight: 700;
  line-height: 32px;
  letter-spacing: -0.5px;
  transform: translateY(-50%);
  pointer-events: none;
  user-select: none;
  color: #3c6ef0;
  opacity: 0.18;
  font-family: Arial, Helvetica, sans-serif;
}

.lui-arrow-steps__item.is-start .lui-arrow-steps__num {
  left: 28px;
}

.lui-arrow-steps__item.is-end .lui-arrow-steps__num {
  left: 40px;
}

.lui-arrow-steps__item.is-active .lui-arrow-steps__num {
  color: #fff;
  opacity: 0.22;
}

.lui-arrow-steps__item.is-complete .lui-arrow-steps__num {
  color: #3c6ef0;
  opacity: 0.16;
}

.lui-arrow-steps__item.is-pending .lui-arrow-steps__num {
  color: #868d9f;
  opacity: 0.28;
}

.lui-arrow-steps__label {
  position: relative;
  z-index: 2;
  display: inline-flex;
  height: 20px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  max-width: calc(100% - 48px);
  padding: 0 8px;
  white-space: nowrap;
}

.lui-arrow-steps__icon {
  display: block;
  width: 16px;
  height: 16px;
  flex: 0 0 16px;
  object-fit: contain;
  flex-shrink: 0;
}

.lui-arrow-steps__label strong {
  color: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lui-arrow-steps__item.is-active .lui-arrow-steps__label strong {
  color: #fff;
}

.lui-arrow-steps__item.is-pending .lui-arrow-steps__label strong {
  color: #525765;
}

.lui-arrow-steps__item.is-complete .lui-arrow-steps__label strong {
  color: #23252b;
}
</style>
