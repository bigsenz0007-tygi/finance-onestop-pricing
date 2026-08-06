<template>
  <p v-if="message" class="lui-field-error" :class="{ 'lui-field-error--overlay': overlay }">
    <img
      class="lui-field-error__icon"
      :src="iconSrc"
      alt=""
      width="14"
      height="14"
    >
    <span class="lui-field-error__text">{{ message }}</span>
  </p>
</template>

<script>
import { publicAsset } from '../utils/publicAsset'

export default {
  name: 'LuiFieldError',
  props: {
    message: {
      type: String,
      default: ''
    },
    overlay: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    iconSrc() {
      return publicAsset('d2c-assets/icon-hint-error.svg')
    }
  }
}
</script>
