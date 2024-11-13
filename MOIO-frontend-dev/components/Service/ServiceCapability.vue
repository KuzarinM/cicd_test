<template>
  <loader-screen :is-loading="isLoading" />
  <div v-if="isMounted && capability" class="service-capability">
    <!-- Датчики: температуры, влажности и температуры и влажности -->
    <div
      v-if="type === 'devices.properties.float' && deviceType === 'devices.types.sensor'"
    >
      <p class="service-info__state__divider">
        <!-- Датчик температуры -->
        <span v-if="instance === 'temperature'" class="service-capability__control --sensor-temperature-humidity">
          {{ typeof value === 'number' ? value + '°C' : 'Нет данных' }}
          <!-- Если нужен разделитель для датчика температуры и влажности -->
          {{ capabilityCount > 1 ? '|' : '' }}
        </span>
        <!-- Датчик влажности -->
        <span v-if="instance === 'humidity'" class="service-capability__control --sensor-temperature-humidity">
          {{ typeof value === 'number' ? value + '%' : 'Нет данных' }}
        </span>
      </p>
    </div>

    <!-- РГБ лампы -->
    <div v-if="type === 'devices.capabilities.color_setting'" class="service-capability__control --color">
      <label for="color">
        {{ $t(type) }}
        <button class="service-capability__control-btn" @click="isAddColor = !isAddColor">Поменять цвет</button>
      </label>

      <!-- Добавление цветов -->
      <div v-if="isAddColor">
        <div
          class="service-capability__color-preview"
          :style="`background: rgb(${Math.round(255*rgb.red )}, ${Math.round(255*rgb.green)}, ${Math.round(255*rgb.blue)});`"
        />
        <div class="service-capability__color">
          <input
            id="color"
            v-model="hue"
            step="1"
            type="range"
            :min="1"
            :max="360"
            name=""
            class="service-capability__hue"
            @input="updateDevice({type,value:{s:Number(saturation),v:capability.hsv?.v,h:Number(hue)}})"
          >
        </div>
        <input
          id=""
          v-model="saturation"
          step="1"
          type="range"
          :min="1"
          :max="100"
          name=""
          class="service-capability__saturation"
          @input="updateDevice({type,value:{s:Number(saturation),v:capability.hsv?.v,h:Number(hue)}})"
        >
        <ui-button
          variant="secondary"
          @click="saveColor(hue,saturation,capability.hsv?.v)"
        >
          Сохранить цвет
        </ui-button>
      </div>
      <h2 style="margin-top: 20px;">
        Сохранённые цвета
      </h2>
      <div class="service-capability__preset">
        <template
          v-for="color in rgbNew">
          <div
            v-show="color.def === false"
            class="service-capability__preset-list"
          >
            <div
              class="service-capability__preset-list-item"
              :style="`background: rgb(${Math.round(255 * color.red )}, ${Math.round(255 * color.green)}, ${Math.round(255 * color.blue)});`"
              @click="updateDevice({type: props.type, value:{s:Number(color.s),v:color.v,h:color.h}}), hue = color.h, saturation = color.s, capability.hsv.v = color.v"
            />
          </div>
        </template>
      </div>
      <h2 class="service-capability__header">
        Пресеты
      </h2>
      <div class="service-capability__preset">
        <template
          v-for="color in rgbNew">
          <div
            v-show="color.def === true"
            class="service-capability__preset-list"
          >
            <div
              class="service-capability__preset-list-item"
              :style="`background: rgb(${Math.round(255 * color.red )}, ${Math.round(255 * color.green)}, ${Math.round(255 * color.blue)});`"
              @click="updateDevice({type: props.type, value:{s:Number(color.s),v:color.v,h:color.h}}), hue = color.h, saturation = color.s, capability.hsv.v = color.v"            />
          </div>
        </template>
      </div>
    </div>
    <div
      v-if="type === 'devices.capabilities.range' &&
        (instance?.includes('bright'))"
      :class="`service-capability__control --range --bright`"
    >
      <label for="range">
        {{ $t(`${type}-${instance}`) }}
      </label>
      <div class="service-capability__control__flex">
        <p>{{ capability.value }}%</p>
        <input
          id="range"
          v-model="capability.value"
          type="range"
          :min="range?.min"
          :max="range?.max"
          :step="range?.precision"
          :class="`${instance?.includes('temperature') && '--temperature'}`"
          @input="updateDevice({type,value:capability.value})"
        >
      </div>
    </div>

    <!-- Нагреватель -->
    <div v-if="instance === 'threshold_temperature' && deviceType !== 'devices.types.sensor'" class="service-capability__control --thermostat">
      <thermostat-input
        :current="float"
        :value="capability.value"
        :step="capability.range?.precision ?? 1"
        :min="capability.range?.min ?? 20"
        :max="capability.range?.max ?? 40"
        @t-input="(e)=>{capability.value=e.value;updateDevice({type:'devices.capabilities.range',value:Number(e.value)},e.delay)}"
      />
    </div>
    <div
      v-if="instance === 'open' &&
        type === 'devices.capabilities.range'
        && deviceType !== 'devices.types.openable.curtain'"
      :class="`service-capability__control`"
    >
      <ui-toggle
        :checked="String(capability.value).includes('open')||String(capability.value).includes('true')"
        vertical-large openable
        :ico="icon??toggleSwitchIco?.name"
        @check="(e)=>{capability.value=e;updateDevice({type:instance,value:capability.value})}"
      />
    </div>

    <!-- Вентилятор -->
    <div v-if="instance === 'fan_speed' && type === 'devices.capabilities.mode'" class="service-capability__control service-capability__control--fan-speed">
      <h2>
        {{ $t(`${type}-${instance}`) }}
      </h2>
      <div class="service-capability__modes">
        <ui-button
          v-for="speed in modeIcons"
          :key="speed.mode"
          class="service-capability__mode-button"          
          :variant="Number.parseInt(capability.value) === speed.mode ? 'primary' : 'secondary'"
          @click="() => { capability.value=speed.mode; updateDevice({ type, value: capability.value }) }"
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
import { throttle } from "@antfu/utils"
import LoaderScreen from "../shared/LoaderScreen.vue"
import { useDevicesStore } from "~/store/devices"
import ThermostatInput from "~/components/Service/ThermostatInput.vue"
import useHSVToRGB from "~/composables/useHSVToRGB"
import UiIcon from "~/components/ui/UiIcon.vue"
import type { TUiIconNames } from "#build/types/ui-icon"
import type { ICapability } from '~/api/automations/getById'

import { modeIcons } from "~/utils/variables"

export interface ServiceCapability {
  instance:string
  deviceType:string
  deviceId:string
  chanel:string
  float?:number
  icon?:TUiIconNames
  type: string
  capabilityCount: number
}

const props = defineProps<ServiceCapability & ICapability & {brightness?:number, isPending?:boolean}>()
const emit = defineEmits<{
    updateBoolVal:[void]
}>()
const deviceStore = useDevicesStore()

const devicesStore = useDevicesStore()
const toggleSwitchIco = useIcoByDeviceType(props.deviceType)
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
const rgb = computed(() => useHSVToRGB(Number(hue.value), saturation.value, (capability.value.brightness ?? capability.value.hsv?.v ?? 1)))
const rgbNew = computed(() => deviceStore.allColor.map(item => useHSVToRGB(item.h, item.s, item.v, item.isDefaultColor)))
const isLoading = ref(false)
const isAddColor = ref(false)

const throttledAction = throttle(2000, actionFabric)
const mainActionProps = {
  deviceId: props.deviceId,
}

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

async function saveColor (h:number, s:number, v:number|undefined) {
  isLoading.value = true
  await deviceStore.saveColor({ h, s, v })
  await deviceStore.getColor()
  isLoading.value = false
}

if (capability.value && String(capability.value?.value)?.indexOf('close') > -1) {
  capability.value.value = false
}
if (capability.value && String(capability.value?.value)?.indexOf('open') > -1) {
  capability.value.value = true
}

async function actionFabric (fnName:'changeOnOf'|'changeTemperature'|'changeBrightness'|'changeRGB'|'changeSpeed'|'changeOpenness', args:any) {
  // Обращаемся к action из store, передаем аргументы
  // вынесено для вызова в Throttle, чтобы работали замыкания
  return await devicesStore[fnName](args)
}

// Обновление состояния устройства
function updateDevice (val: { type:string, value:any }, delay?:number) {
  switch (val.type) {
    case 'devices.capabilities.range':
      if (props?.instance === 'threshold_temperature') {
        throttledAction('changeTemperature', { ...mainActionProps, temperature: val.value })
      }
      if (props?.instance === 'brightness' || capability.value?.hsv?.v || props.instance === 'hsv') {
        throttledAction('changeBrightness', { ...mainActionProps, brightness: val.value })
      }
      // Если это шторы, то они открываются на какой-то процент
      if (props?.instance === 'open' && props?.deviceType === 'devices.types.openable.curtain') {
        throttledAction('changeOpenness', { ...mainActionProps, percentageOpen: val.value })
      }
      break
    case 'devices.capabilities.color_setting':
      throttledAction('changeRGB', { ...mainActionProps, ...val.value })
      break
    case 'devices.capabilities.mode':
      throttledAction('changeSpeed', { ...mainActionProps, speedMode: val.value })
      break
  }
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
