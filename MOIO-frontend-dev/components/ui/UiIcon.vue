<template>
  <nuxt-icon
    v-if="name"
    class="ui-icon"
    :name="name"
    :filled="filled"
    :style="customStyle"
  />
</template>

<script lang="ts" setup>
import type { TUiIconNames } from '#build/types/ui-icon'

interface Props {
  name: TUiIconNames
  filled?: boolean
  size?: number|string
  color?:string
}

const props = withDefaults(defineProps<Props>(), { filled: false, size: 24, color: 'currentColor' })
const { filled, size, color } = toRefs(props)

const customStyle = computed(() => {
  if (!size.value) {
    return {}
  }
  return {
    fontSize: `${size.value}px`,
    color: color.value,
  }
})
</script>

<style lang="scss">
.ui-icon {
  &.nuxt-icon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
  &.nuxt-icon svg {
    margin-bottom: 0;
    max-width: 1em;
    width: 1em;
    height: 1em;
    fill: currentColor !important;
    color: currentColor;
    *{
      color: currentColor;
    }
    path {
      fill: currentColor;
    }
  }
}
</style>
