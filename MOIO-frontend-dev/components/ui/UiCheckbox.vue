<template>
  <div class="ui-checkbox" @click="emit('check', !checked)">
    <input type="checkbox" name="checkbox" :checked="checked">
    <ui-icon name="check" size="20" />
  </div>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon.vue"

export interface ICheckboxProps{
  size?:number,
  checked?:boolean
  initialBg?:string
  checkedBg?:string
}
const props = withDefaults(defineProps<ICheckboxProps>(), {
  size: 20,
  checked: false,
  checkedBg: 'var(--color-active)',
  initialBg: 'var(--bg-primary)',
})

const emit = defineEmits<{
    check:[boolean]
}>()
</script>

<style lang="scss">
.ui-checkbox{
  position: relative;
  color: $settings-color;
  display: flex;
  justify-content: center;
  align-items: center;
  width: v-bind(size + 4);
  height: v-bind(size + 4);
  input[type="checkbox"]{
    position: absolute;
    opacity: 0;
    right: 0;
    inset: 0;
    z-index: 5;
    cursor: pointer;
    &:checked ~ .ui-icon {
      background: v-bind(checkedBg);
      border-color: v-bind(checkedBg);
      svg {
        opacity: 1;
      }
    }
  }
  .ui-icon{
    width: 24px;
    height: 24px;
    background: v-bind(initialBg);
    border-radius: 3px;
    border: 2px solid v-bind(initialBg);
    svg {
      opacity: 0;
    }
  }
}
</style>
