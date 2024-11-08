<template>
  <NuxtLink :to="`/automation/${id}`">
    <div class="automation-item">
      <div class="automation-item__description">
        <div class="automation-item__description name">
          {{ automationName }}
        </div>
        <div class="automation-item__description type">
          {{ deviceType }}
        </div>
      </div>
      <div class="automation-item__activation-event">
        {{ activationEvent }}
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
export type AutomationItem = {
  id:number|string
  automationName:string
  deviceType: string
  activationEvent: string
}
const props = defineProps<AutomationItem>()
</script>

<style lang="scss">
@import "assets/styles/components/_automation-item";
</style>
