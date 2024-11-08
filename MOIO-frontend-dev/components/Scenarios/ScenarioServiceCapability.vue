<template>
  <div v-if="isMounted && capability" class="service-capability">
    <div v-if="type === 'devices.capabilities.color_setting'" class="service-capability__control --color">
      <label for="color">
        {{ $t(type) }}
      </label>
      <div
        v-if="Number.isInteger(capability.hsv?.h)"
        class="service-capability__color-preview"
        :style="`background: rgb(${Math.round(255 * rgb.red )}, ${Math.round(255 * rgb.green)}, ${Math.round(255 * rgb.blue)});`"
      />
      <div class="service-capability__color">
        <input
          v-if="capability.hsv?.h && capability.hsv?.s && Number.isInteger(capability.hsv?.h)"
          id="color"
          v-model="hue"
          step="1"
          type="range"
          :min="1"
          :max="360"
          name=""
          class="service-capability__hue"
          @input="capability.hsv.h=Number(hue);
                  capability.hsv.s=Number(saturation);
                  updateDevice()"
        >
      </div>
      <input
        v-if="Number.isInteger(capability.hsv?.s) && capability.hsv?.h && capability.hsv?.s"
        id="saturation"
        v-model="saturation"
        step="1"
        type="range"
        :min="1"
        :max="100"
        name=""
        class="service-capability__saturation"
        @input="capability.hsv.h=Number(hue);
                capability.hsv.s=Number(saturation);
                updateDevice()"
      >
    </div>
    <div
      v-if="type === 'devices.capabilities.on_off'"
      :class="`service-capability__control ${capability?.value?'--checked':''}`" @click.stop="()=>false"
    >
      <ui-toggle
        role="button"
        :checked="capability.value"
        :ico="icon"
        vertical-large
        @check="(e)=>{capability.value=e;updateDevice()}"
      />
    </div>
    <div
      v-if="type === 'devices.capabilities.range' &&
        (instance?.includes('bright'))"
      :class="`service-capability__control --range --bright`"
    >
      <label for="range">
        {{ $t(`${type}-${instance}`) }}
      </label>
      <ui-icon name="service/devices/lightbulb-variant-outline" size="24" />
      <input
        id="range"
        v-model="capability.value"
        type="range"
        :min="range?.min"
        :max="range?.max"
        :step="range?.precision"
        :class="`${instance?.includes('temperature') && '--temperature'}`"
        @input="updateDevice()"
      >
    </div>
    <div v-if="instance?.includes('temperature')" class="service-capability__control --thermostat">
      <thermostat-input
        :value="capability.value"
        :step="capability.range?.precision || 1"
        :min="capability.range?.min || 20"
        :max="capability.range?.max || 40"
        @t-input="(e)=>{capability.value=e.value;updateDevice()}"
      />
    </div>
    <div v-if="instance === 'open' && type === 'devices.capabilities.range'" :class="`service-capability__control`">
      <ui-toggle
        :checked="String(capability.value).includes('true')||String(capability.value).includes('open')"
        :ico="props.icon"
        vertical-large
        openable
        @check="(e)=>{
          capability.value=e;
          updateDevice()
        }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiToggle from "~/components/ui/UiToggle.vue"
import ThermostatInput from "~/components/Service/ThermostatInput.vue"
import { useUserStore } from "~/store/user"
import UiIcon from "~/components/ui/UiIcon.vue"
import type { ServiceCapability } from "~/components/Service/ServiceCapability.vue"
import type { ICapability } from "~/components/Service/TheService.vue"

const props = defineProps<ServiceCapability & ICapability>()
const emit = defineEmits<{
    updateBoolVal:[any]
}>()
const capabilitySource = ref({ ...props })
const capability = ref(capabilitySource)
const isMounted = ref(false)
const hue = ref(Number(capability.value.hsv?.h))
const saturation = ref(Number(capability.value.hsv?.s))
const rgb = computed(() => useHSVToRGB(Number(hue.value), saturation.value / 100, capability.value.hsv?.v / 100))

if (capability.value && String(capability.value?.value)?.indexOf('close') > -1) {
  capability.value.value = false
}
if (capability.value && String(capability.value?.value)?.indexOf('open') > -1) {
  capability.value.value = true
}

const userStore = useUserStore()
function updateDevice () {
  emit('updateBoolVal', capability.value)
}

onMounted(() => {
  setTimeout(() => {
    isMounted.value = true
  }, 100)
})
watch(props, (newVal) => {
  capabilitySource.value = { ...newVal }
}, { deep: true })
</script>


<style lang="scss">
@import "assets/styles/components/service-capability";
</style>
