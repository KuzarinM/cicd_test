<template>
  <div class="automation-condition">
    <h2 class="automation-condition__header">
      Условие {{ idx }}
    </h2>
    <div class="automation-condition__body">
      <div class="automation-condition__description">
        {{ !type.includes('time')
          ? 'Сценарий выполняется если сработал датчик'
          : 'Время начала активности автоматизации:'
        }}
      </div>
      <div
        v-if="type===AutomationConditionTypesEnum.time"
        class="automation-condition__time"
      >
        <div class="automation-condition__time-offset">
          {{ timeOffset ? timeOffset[0] : '' }}
        </div>
        <div class="automation-condition__time-value">
          <span v-if="!editable" class="time">
            {{ time }}
          </span>
          <input
            v-if="editable"
            ref="timeInput"
            v-model="timePoint"
            type="time"
            :disabled="Number(editable) === 0"
            @keydown.enter.stop="false"
            @keydown.enter.prevent="false"
          > часов
        </div>
      </div>
      <div
        v-if="type === AutomationConditionTypesEnum.timeRange"
        class="automation-condition__time"
      >
        <div class="automation-condition__time-offset">
          {{ timeOffset ? timeOffset[0] : '' }}
        </div>
        <div class="automation-condition__time-value">
          <span v-if="!editable" class="time">
            {{ timeRange?.startTime ?? 'err' }}
          </span>
          <input
            v-if="editable"
            ref="timeInput"
            v-model="timeStart"
            type="time"
            name=""
            :disabled="Number(editable) === 0"
            @keydown.enter.stop="false"
            @keydown.enter.prevent="false"
          >
          -
          <span v-if="!editable" class="time">
            {{ timeRange?.endTime ?? 'err' }}
          </span>
          <input
            v-if="editable"
            ref="timeInput"
            v-model="timeEnd"
            type="time"
            name=""
            :disabled="Number(editable) === 0"
            @keydown.enter.stop="false"
            @keydown.enter.prevent="false"
          >
          часов
        </div>
      </div>
      <div
        v-if="type === AutomationConditionTypesEnum.sensor ||
          type === AutomationConditionTypesEnum.temperature"
        class="automation-condition__sensors"
      >
        <div
          v-for="sensor in sensors"
          :key="sensor.id"
          :class="`automation-condition__sensor ${editable?'--editable':''}`"
          @click="editable&&emit('selectOption',{type, value:{deviceId:sensor.id}})"
        >
          <ui-icon
            :name="useIcoByDeviceType(sensor.type).name"
            size="28"
          />
          <span :class="`mask ${sensor.id === deviceId &&' --active'}`" />
          <div class="automation-condition__sensor-info">
            {{ sensor.name }}
            <div
              v-if="(temperatureRange||automationCondition) && sensor.id === deviceId"
              class="automation-condition__sensor-value"
            >
              {{ temperatureRange&&temperatureRange.min + '°C-' + temperatureRange.max + '°C' }}
              {{ automationCondition&&automationCondition.value + '°C' }}
            </div>
          </div>
          <span
            v-if="automationCondition && sensor.id === deviceId"
            class="automation-condition__sensor-condition"
          >
            {{ conditionSymbols[automationCondition.condition] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from "~/components/ui/UiIcon.vue"
import type { ICapability, ServiceProps } from "~/components/Service/TheService.vue"
import type { IAutomationValue } from "~/api/automations/create"
import { AutomationConditionTypesEnum } from "~/utils/enums"

export type AutomationConditionTypes = AutomationConditionTypesEnum
export interface AutomationConditionProps {
  idx:number|string
  type:AutomationConditionTypes
  sensors?:{
    id:string,
    name:string,
    type:string
    range?:ICapability["range"]
  }[],
  editable?:boolean
}
const props = withDefaults(defineProps<AutomationConditionProps & IAutomationValue>(),
  {
    timeRange: undefined,
    currTime: undefined,
    currSensor: undefined,
    editable: true,
    deviceId: undefined,
    temperatureRange: undefined,
    automationCondition: undefined,
    range: undefined,
  },
)

const emit = defineEmits<{
    selectOption:[{type:AutomationConditionTypes, value?:IAutomationValue}]
}>()
const timeOffset = Date()?.match(/GMT.\d\d?\d\d/gm)
const conditionSymbols = ['<', '>', '=']
const timeInput = ref<InstanceType<typeof HTMLInputElement>>()
const timeInputStart = ref<InstanceType<typeof HTMLInputElement>>()
const timeInputEnd = ref<InstanceType<typeof HTMLInputElement>>()
const timePoint = props.type === 'time' && computed({
  get () {
    return props.time
  },
  set (value) {
    emit('selectOption', { type: AutomationConditionTypesEnum.time, value: { time: value } })
  },
})
const timeEnd = props.type === 'time-range' && computed({
  get () {
    return props.timeRange?.endTime ?? '00:00'
  },
  set (value) {
    console.log(value)
    emit('selectOption', {
      type: AutomationConditionTypesEnum.timeRange,
      value: {
        timeRange: {
          startTime: props.timeRange?.startTime ?? '00:00',
          endTime: value,
        },
      },
    })
  },
})
const timeStart = props.type === 'time-range' && computed({
  get () {
    return props.timeRange?.startTime ?? '00:00'
  },
  set (value) {
    console.log(value)
    emit('selectOption', {
      type: AutomationConditionTypesEnum.timeRange,
      value: {
        timeRange: {
          startTime: value,
          endTime: props.timeRange?.endTime ?? '00:00',
        },
      },
    })
  },
})
function openTimeSelect () {
  if (props.editable) {
    timeInput.value?.showPicker()
  }
}
onMounted(() => {
  props.type === 'time' && emit('selectOption', { type: AutomationConditionTypesEnum.time, value: { time: props.currTime } })
})
</script>

<style lang="scss">
@import "assets/styles/components/automation-condition";
</style>
