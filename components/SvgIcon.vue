<template>
  <svg class="svg-icon" aria-hidden="true" :style="{'font-size': size + 'px'}">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script>
export default {
  name: 'svg-icon',
  props: {
    iconClass: {
      type: String,
      required: true
    },
    size: {
      default: 16,
      type: Number,
      required: false
    }
  },
  computed: {
    iconName() {
      return `#icon-${this.iconClass}`
    }
  }
}
</script>

<style>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.25em;
  fill: currentColor;
  overflow: hidden;
}
</style>