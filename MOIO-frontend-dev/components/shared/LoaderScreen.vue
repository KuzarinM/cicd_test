<template>
  <div v-if="isLoading" class="loader">
    <div class="loader-item-wrapper">
      <div class="loader-item --first" />
      <div class="loader-item --second" />
      <div class="loader-item --third" />
    </div>
  </div>
</template>


<script setup lang="ts">
const props = defineProps({
  isLoading: {
    type: Boolean,
    default: true,
  },
})
</script>

<style lang="scss">
@import "assets/styles/components/loader-screen";
@import "assets/styles/utils/loader-animation";
</style>
