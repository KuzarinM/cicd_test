<template>
  <div v-if="isMounted && capability" class="service-capability">
    <div v-if="type === 'devices.capabilities.color_setting'" class="service-capability__control --color">
      <label for="color">
        {{ $t(type) }}
      </label>
      <div
        v-if="Number.isInteger(capability.hsv?.h)" class="service-capability__color-preview"
        :style="`background: rgb(${Math.round(255 * rgb.red )}, ${Math.round(255 * rgb.green)}, ${Math.round(255 * rgb.blue)});`"
      />
      <div class="service-capability__color">
        <input
          v-if="capability.hsv?.h && capability.hsv?.s && Number.isInteger(capability.hsv?.h)" id="color"
          v-model="hue" step="1" type="range" :min="1" :max="360" name="" class="service-capability__hue" @input="capability.hsv.h=Number(hue);
                                                                                                                  capability.hsv.s=Number(saturation);
                                                                                                                  updateDevice()"
        >
      </div>
      <input
        v-if="Number.isInteger(capability.hsv?.s) && capability.hsv?.h && capability.hsv?.s" id="saturation"
        v-model="saturation" step="1" type="range" :min="1" :max="100" name="" class="service-capability__saturation"
        @input="capability.hsv.h=Number(hue);
                capability.hsv.s=Number(saturation);
                updateDevice()"
      >
    </div>
    <div
      v-if="type === 'devices.capabilities.on_off' && deviceType !== 'devices.types.openable.curtain'"
      :class="`service-capability__control ${capability?.value?'--checked':''}`" @click.stop="()=>false"
    >
      <ui-toggle
        role="button" :checked="capability.value" :ico="icon" vertical-large
        @check="(e)=>{toggleDevice(e);updateDevice()}"
      />
    </div>
    <div
      v-if="type === 'devices.capabilities.range' &&
        (instance?.includes('bright'))" :class="`service-capability__control --range --bright`"
    >
      <label for="range">
        {{ $t(`${type}-${instance}`) }}
      </label>
      <div class="service-capability__control-flex">
        <span>{{ capability.value + '%' }}</span>
        <input
          id="range" v-model="capability.value" type="range" :min="range?.min" :max="range?.max"
          :step="range?.precision" :class="`${instance?.includes('temperature') && '--temperature'}`"
          @input="updateDevice()"
        >
      </div>
    </div>
    <div v-if="instance === 'threshold_temperature' && deviceType !== 'devices.types.sensor'" class="service-capability__control --thermostat">
      <thermostat-input
        :value="capability.value" :step="capability.range?.precision || 1"
        :min="capability.range?.min || 20" :max="capability.range?.max || 40"
        @t-input="(e)=>{capability.value=e.value;updateDevice()}"
      />
    </div>
    <div v-if="instance === 'open' && type === 'devices.capabilities.range' && deviceType !== 'devices.types.openable.curtain'" :class="`service-capability__control`">
      <ui-toggle
        :checked="String(capability.value).includes('true')||String(capability.value).includes('open')"
        :ico="props.icon" vertical-large openable @check="(e)=>{
          if(e === false){
            capability.value = 'close'
          }
          if(e === true){
            capability.value = 'open'
          }
          updateDevice()
        }"
      />
    </div>
    <div
      v-if="instance === 'fan_speed' && type === 'devices.capabilities.mode'"
      class="service-capability__control service-capability__control--fan-speed"
    >
      <h2>
        {{ $t(`${type}-${instance}`) }}
      </h2>
      <div class="service-capability__modes">
        <ui-button
          v-for="speed in modeIcons"
          :key="speed.mode"
          :variant="Number.parseInt(capability.value) === speed.mode ? 'primary' : 'secondary'"
          class="service-capability__mode-button"
          @click="capability.value = speed.mode; updateDevice()"
        >
          <p>{{ speed.mode }}</p>
          <ui-icon :name="speed.icon" size="20" />
        </ui-button>
      </div>
    </div>

    <!-- Блок для Штор. У них особый range для специфического capability-->
    <div
      v-if="instance === 'open' && deviceType === 'devices.types.openable.curtain'"
      class="service-capability__control"
    >
      <div class="curtain-parent --range --bright">
        <input
          id="capability"
          v-model="capability.value"
          type="range"
          :min="capability.range?.min"
          :max="capability.range?.max"
          :step="capability.range?.precision"
          @input="updateDevice({ type, value: capability.value })"
        >
        <div class="curtain-parent__p-container">
          <p
            v-show="isNotFullyOpenOrClose === CurtainStatusEnum.Open"
            class="--curtain-status"
          >
            Открыто
          </p>

          <p
            v-show="isNotFullyOpenOrClose === CurtainStatusEnum.Close"
            class="--curtain-status"
          >
            Закрыто
          </p>

          <p
            v-show="isNotFullyOpenOrClose === CurtainStatusEnum.NotFully"
          >
            Открыто на
          </p>

          <div v-show="isNotFullyOpenOrClose === CurtainStatusEnum.NotFully" class="--openness-number">
            {{ `${capability.range?.max - capability?.value}%` }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiToggle from "~/components/ui/UiToggle.vue"
import ThermostatInput from "~/components/Service/ThermostatInput.vue"
import UiIcon from "~/components/ui/UiIcon.vue"
import type { ServiceCapability } from "~/components/Service/ServiceCapability.vue"
import type { ICapability } from "~/api/automations/getById"
import { modeIcons } from "~/utils/variables"

const props = defineProps<ServiceCapability & ICapability>()
const emit = defineEmits<{
    updateBoolVal:[any]
}>()

const capabilitySource = ref({ ...props })
const capability = computed({
  get: () => capabilitySource.value,
  set: (val) => {
    capabilitySource.value = val
  },
})
const isMounted = ref(false)
const hue = ref(Number(capability.value.hsv?.h))
const saturation = ref(Number(capability.value.hsv?.s))
const rgb = computed(() => useHSVToRGB(Number(hue.value), saturation.value, (capability.value.hsv?.v ?? 1)))

// Перечисление для значения "Открытости" Штор
enum CurtainStatusEnum {
  Open,
  Close,
  NotFully
}

// Вычисляемое значение для "Открытости" Штор
const isNotFullyOpenOrClose = computed(() => {
  if (Number.parseInt(capability.value.value) === capability.value.range?.min) {
    return CurtainStatusEnum.Open
  }

  if (Number.parseInt(capability.value.value) === capability.value.range?.max) {
    return CurtainStatusEnum.Close
  }

  return CurtainStatusEnum.NotFully
})

const toggleDevice = (bool:boolean) => {
  capability.value.value = bool
}
defineExpose({
  toggleDevice,
})
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
