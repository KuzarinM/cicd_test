<template>
  <div 
    class="block-check"
    @click="emit('check', !isChecked)"
  >
    <ui-checkbox 
      :checked="isChecked" 
      
    />
    <slot name="item" :is-checked="isChecked" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{isChecked: boolean}>()
const emit = defineEmits<{
  check: [boolean]
}>()



</script>
<style lang="scss">
@import "assets/styles/components/any-checkbox";
.block-check{
  position: relative;
  height: 120px;
  cursor: pointer;
  
  .service {
    pointer-events: none;
  }
  
  .ui-checkbox {
    position: absolute;
    top: 12px;
    right: 12px;
  }
}
</style>
