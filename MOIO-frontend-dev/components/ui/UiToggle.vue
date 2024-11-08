<template>
  <div :class="`toggle-switch-wrapper ${verticalLarge?'--vertical-large':''}`">
    <label v-if="verticalLarge" for="toggle-switch">{{ openable ? "Открыть" : 'Вкл.' }}</label>
    <div :class="`toggle-switch ${verticalLarge?'--vertical-large':''}`">
      <input id="toggle-switch" v-model="currentValue" type="checkbox" class="toggle-switch__checkbox">
      <div class="toggle-switch__button">
        <div class="toggle-switch__button-icon">
          <ui-icon v-if="verticalLarge" :name="ico" size="40" />
        </div>
      </div>
      <div class="toggle-switch__layer" />
    </div>
    <label v-if="verticalLarge" for="toggle-switch">{{ openable ? "Закрыть" : 'Выкл.' }}</label>
  </div>
</template>

<script setup lang="ts">
import type { TUiIconNames } from "#build/types/ui-icon"

export interface IToggleSwitchProps {
  checked:boolean
  verticalLarge:boolean
  ico?:TUiIconNames
  openable?:boolean
}
const props = withDefaults(defineProps<IToggleSwitchProps>(), { ico: 'service/other/help' })
const emit = defineEmits<{
    check:[boolean]
}>()
const currentValue = computed({
  get () {
    return props.checked
  },
  set (value) {
    emit('check', value)
  },
})
</script>

<style lang="scss">
@import "assets/styles/components/toggle-switch";
</style>
