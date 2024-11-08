<template>
  <div>
    <slot name="devices.capabilities.on_off" />
    <slot name="devices.capabilities.range-brightness" />
    <slot name="devices.capabilities.range-open" />
    <slot name="devices.capabilities.range-threshold_temperature" />
    <slot name="devices.capabilities.mode-fan_speed" />
    <slot name="devices.capabilities.mode-thermostat" />
    <slot name="devices.capabilities.color_setting-hsv" />
    <slot name="devices.properties.float-electricity_meter" />
    <slot name="devices.properties.float-temperature" />
    <slot name="devices.properties.float-humidity" />
    <slot name="devices.properties.float-meter.water" />
    <slot name="devices.properties.event-button" />
    <slot name="devices.properties.event-motion" />
    <slot name="devices.properties.event-open" />
    <slot name="devices.properties.event-smoke" />
    <slot name="devices.properties.event-water_leak" />
  </div>
</template>

<script setup lang="ts">

</script>

<style lang="scss">

</style>
