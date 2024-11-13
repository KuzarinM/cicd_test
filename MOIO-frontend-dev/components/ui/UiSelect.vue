<template>
  <div id="custom-select" class="custom-select" @click="selectCollapsed = !selectCollapsed">
    <div class="custom-select__current-value">
      {{ currentValue ? currentValueDescriptionByValue : selectName }}
    </div>
    <transition name="fade" mode="out-in">
      <div v-show="selectCollapsed" class="custom-select__options">
        <div class="scrollable-content scrollable-content--with-padding">
          <div class="custom-select__options-container">
            <div
              v-for="option in options"
              :key="option.value"
              class="custom-select__option"
              :class="option.value === currentValue ? '--active' : ''"
            >
              <label for="custom-select__option-label">
                {{ option.description }}
              </label>
              <span
                id="select-value" class="custom-select__option-value" role="radio"
                @click="emit('customSelect', currentValue === option.value ? '' : option.value)"
              />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">

export interface ISelectOption {
  description: string,
  value: any
}
export interface ISelectProps {
  options?: ISelectOption[]
  selectName: string,
  currentValue?: string | number,
}

const props = defineProps<ISelectProps>()
const emit = defineEmits<{
  customSelect: [string]
}>()
const selectCollapsed = ref(false)
const currentValueDescriptionByValue = computed(() => {
  if (props.options && props.currentValue && props.currentValue?.length > 0 && props.options?.length > 0) {
    return props.options.find(el => el?.value === props?.currentValue)?.description
  }
  return ""
})
</script>

<style lang="scss">
@import "assets/styles/utils/transitions";
@import "assets/styles/components/custom-select";
</style>
