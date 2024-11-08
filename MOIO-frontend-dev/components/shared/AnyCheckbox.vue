<template>
  <div class="block-check">
    <input
      class="checkbox"
      :checked="isChecked"
      name="check"
      type="checkbox"
      @click="emit('check', !isChecked)"
    >
    <label class="checked" for="check" />
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
    width: 180px;
    height: 120px;

    @media screen and (max-width: 425px) {
        width: 48%;
    }
    @media screen and (max-width: 350px) {
        width: 95%;
        aspect-ratio: auto;
    }
}
</style>
