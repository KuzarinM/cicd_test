<template>
  <div class="scrollable-content">
    <div class="automation-condition">
      <h2 class="automation-condition__header">
        Условие {{ idx }}
        <ui-button
          v-if="isConditionNew && (show && idx === newConditions)"
          margin-inline="0"
          padding="0"
          class="automation-condition__next"
          @click="editable&&
            saveTimeHandle()"
        >
          Далее
        </ui-button>
      </h2>
      <div class="automation-condition__body">
        <div class="automation-condition__description">
          {{ !type.includes('time')
            ? 'Сценарий выполняется если сработал датчик'
            : 'Время активности автоматизации:'
          }}
        </div>
        <div v-if="type===AutomationConditionTypesEnum.time && !isConditionNew || (type===AutomationConditionTypesEnum.time && isConditionNew && !(idx === newConditions) || type===AutomationConditionTypesEnum.time&& (!show && idx === newConditions))" class="automation-condition__description">
          В определённое время - {{ time3 }}
        </div>
        <div v-if="type===AutomationConditionTypesEnum.timeRange && !isConditionNew" class="automation-condition__description">
          В интервале {{ time1 }} - {{ time2 }}
        </div>
        <div
          v-if="type===AutomationConditionTypesEnum.time && (isConditionNew && (show && idx === newConditions))"
          class="automation-condition__time"
        >
          <div class="automation-select-range__tab-value-condition-list">
            <div
              :class="`automation-select-range__tab-value-condition-item`"
              @click="condition.value = 1"
            >
              <ui-checkbox
                :initial-bg="'var(--settings-color)'"
                :checked="condition.value === 1"
                @check="condition.value = 1"
              />
              Восход солнца
            </div>

            <div
              :class="`automation-select-range__tab-value-condition-item`"
              @click="condition.value = 0"
            >
              <ui-checkbox
                :initial-bg="'var(--settings-color)'"
                :checked="condition.value === 0"
                @check="condition.value = 0"
              />
              Закат
            </div>
            <div
              :class="`automation-select-range__tab-value-condition-item`"
              @click="condition.value = 2"
            >
              <ui-checkbox
                :initial-bg="'var(--settings-color)'"
                :checked="condition.value === 2"
                @check="condition.value = 2"
              />
              В определённое время <span v-if="condition.value === 2" class="selected"> {{ `${scrollPickerModal2[0]}:${scrollPickerModal2[1]}` }}</span>
            </div>
          </div>
          <ScrollPicker
            v-if="condition.value === 2"
            v-model="scrollPickerModal2"
            :options="options"
          />
        </div>
        <div
          v-if="type === AutomationConditionTypesEnum.timeRange && (isConditionNew)"
          class="automation-condition__time"
        >
          В интервале <span class="selected" @click="condition.time = 0">{{ `${scrollPickerModal[0]}:${scrollPickerModal[1]}` }}</span> - <span class="selected" @click="condition.time = 1">{{ `${scrollPickerModal1[0]}:${scrollPickerModal1[1]}` }}</span>
          <span
            v-if="isConditionNew && (savedTime1 != time1 || savedTime2 != time2) && (time1 !='00:00' || time2 != '00:00') && !show"
            class="savetime"
            @click="emit('selectOption',
                        {
                          type: AutomationConditionTypesEnum.timeRange,
                          value: {
                            timeRange: {
                              startTime: time1,
                              endTime: time2,
                            },
                          },
                        }
            );savedTime1 = time1; savedTime2 = time2; condition.time=2"
          >Сохранить изменения</span>
          <ScrollPicker
            v-if="condition.time === 0"
            v-model="scrollPickerModal"
            :options="options"
          />
          <ScrollPicker
            v-if="condition.time === 1"
            v-model="scrollPickerModal1"
            :options="options"
          />
        </div>
        <transition name="add-menu">
          <div
            v-if="type === AutomationConditionTypesEnum.sensor ||
              type === AutomationConditionTypesEnum.temperature"
            class="automation-condition__sensors"
          >
            <template
              v-for="sensor in sensors"
              :key="sensor.id"
            >
              <div
                v-if="sensor.id === deviceId || (show && idx === newConditions)"
                :class="`automation-condition__sensor ${sensor.id === deviceId ? ' --active' : ''} --editable`"
                @click="(show && idx === newConditions) ? emit('selectOption',{type, value:{deviceId:sensor.id}}) : ''"
              >
                <span :class="`mask ${sensor.id === deviceId ? ' --active' : ''}`" />
                <div class="automation-condition__sensor-info">
                  <div class="automation-condition__sensor-info__check">
                    <ui-icon
                      :name="useIcoByDeviceType(sensor.type).name"
                      size="28"
                    />
                  </div>
                  {{ sensor.name }}
                  <div
                    v-if="(temperatureRange || automationCondition) && sensor.id === deviceId"
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
            </template>
          </div>
        </transition>
      </div>
    </div>
    <slot name="delete"/>
  </div>
</template>

<script setup lang="ts">
import ScrollPicker from 'vue3-scroll-picker'
import type { IAutomationValue } from "~/api/automations/create"
import { AutomationConditionTypesEnum } from "~/utils/enums"
import type { ICapability } from '~/api/automations/getById'
import UiIcon from "~/components/ui/UiIcon.vue"
import ScenarioService from '~/components/Scenarios/ScenarioService.vue'

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
  termostat?: boolean
  editable?:boolean
  isConditionNew?:boolean
  show?:boolean
  newConditions?:number
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
interface ICondition {
  value: 0|1|2
  time?: 0|1|2
}
const emit = defineEmits<{
  selectOption: [{ id: number, type?: AutomationConditionTypesEnum, value?: IAutomationValue, days: any, unknowntype?:AutomationConditionTypes}],
  nextStep:[{step:number}]
}>()

const conditionSymbols = ['<', '>', '=']
const condition = ref<ICondition>({ value: 2 })
const timeInput = ref<InstanceType<typeof HTMLInputElement>>()
const savedTime1 = ref()
const savedTime2 = ref()
const options = computed(() => {
  const arra:[{value:string, label:string}[], {value:string, label:string}[]] = [[], []]
  for (let i = 0; i <= 23; i++) {
    if (i <= 9) {
      arra[0].push({ value: `0${i}`, label: `0${i}` })
    } else {
      arra[0].push({ value: `${i}`, label: `${i}` })
    }
  }
  for (let j = 0; j <= 59; j++) {
    if (j <= 9) {
      arra[1].push({ value: `0${j}`, label: `0${j}` })
    } else {
      arra[1].push({ value: `${j}`, label: `${j}` })
    }
  }
  return arra
})
const saveTimeHandle = () => {
  if (props.type === AutomationConditionTypesEnum.timeRange) {
    emit('selectOption', {
      type: AutomationConditionTypesEnum.timeRange,
      value: {
        timeRange: {
          startTime: time1,
          endTime: time2,
        },
      },
    })
    savedTime1.value = time1.value
    savedTime2.value = time2.value
    condition.value.time = 2
  }
  if (props.type === AutomationConditionTypesEnum.time) {
    emit('selectOption', {
      type: AutomationConditionTypesEnum.time,
      value: {
        time: time3,
      },
    })
  }
  if (props.type === (AutomationConditionTypesEnum.temperature || AutomationConditionTypesEnum.sensor)) {
    emit('nextStep', { step: 2 })
  } else {
    emit('nextStep', { step: 3 })
  }
}
const scrollPickerModal = ref(props.timeRange?.startTime1 ?? ["00", "00"])
const time1 = computed(() => `${scrollPickerModal.value[0]}:${scrollPickerModal.value[1]}`)
const scrollPickerModal1 = ref(props.timeRange?.endTime1 ?? ["00", "00"])
const time2 = computed(() => `${scrollPickerModal1.value[0]}:${scrollPickerModal1.value[1]}`)
const scrollPickerModal2 = ref(props.timePoint ?? ["00", "00"])
const time3 = computed(() =>
  condition.value.value === 2
    ? `${scrollPickerModal2.value[0]}:${scrollPickerModal2.value[1]}`
    : '' ||
condition.value.value === 1
      ? `06:00`
      : '' ||
condition.value.value === 0
        ? `19:00`
        : '',
)
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

  .column-content{
    overflow: hidden !important;
  }

.add-menu-enter-active,
.add-menu-leave-active {
  transition: all 1s ease;
}

.add-menu-enter-from,
.add-menu-leave-to {
  transform: translateY(-100%);
}
.add-menu-enter-to,
.add-menu-leave-from {
  transform: translateY(0);
}
@import "assets/styles/components/automation-condition";
  .selected{
    color: $color-active;
    cursor: pointer;
    &:hover{
      text-decoration: underline;
    }
  }
.pad-bottom-overlay-custom{
  background: none !important;
}
.pad-top-overlay-custom{
  background: none !important;
}
.scroll-picker-container{
  justify-content: flex-start !important;
  width: 100px !important;
}

.scroll-picker-item-custom-option{
  display: flex;
  align-items: center;
  padding: 10px;
  height: 45px;
  font-weight: 700;
  font-size: 20px;
}
.savetime{
  margin-left: 20px;
  background-color: $bg-service-primary;
  border-radius: 12px;
  cursor: pointer;
  padding: 10px;
  &:hover{
    color: $color-active;
  }
}
</style>
