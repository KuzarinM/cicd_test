<template>
  <div class="automation">
    <loader-screen :is-loading="isLoading" />
    <h1 class="automation__header">
      Настройка автоматизации
    </h1>
    <form class="automation__params" method="post" @submit.prevent="create()">
      <div class="automation__params-main">
        <div class="automation__param">
          <label class="automation__param-label">
            Название автоматизации
          </label>
          <input 
            v-model="name" 
            class="automation__param-input" 
            type="text" 
            autocomplete="false"
            placeholder="Введите название автоматизации" 
            required
          />
        </div>
      </div>
      <div class="automation__conditions-container">
        <h2 class="automation__param-label">
          Условия
        </h2>
        <automation-add-condition
          @hide-modal="isConditionModalShow=false"
          @add-condition="e=>{
            setCondition(conditions.length + 1, e);
            isConditionModalShow = false;
            steper(1);
          }"
        />
        <transition name="wizard">
          <AutomationSelectRangeModal
            :is-shown="isTemperatureModalShow"
            :name="currentSensor?.name || ''"
            :range="currentSensor?.range"
            @save-automation-condition="e=>{applyAutomationCondition(conditions[conditions.length-1 > -1 ? conditions.length-1 : 0].id, e)}"
            @save-temperature-range="e=>{applyTemperatureRangeCondition(conditions[conditions.length-1 > -1 ? conditions.length-1 : 0].id, e)}"
            @next-step="(step) => steper(step.step)"
            @prev-step="(step) => steper(step.step)"
          />
        </transition>
        <transition name="wizard">
          <automation-add-device-to-scenarios 
            :show="isAddDevice"
            :selected-devices="selectedDevices.map(device => device.id)"
            :selected-scenarios="scenarios.map(scenario => scenario.id)"
            @select-scenario="scenario => { selectScenarios(scenario); show = false; console.log(scenario) }" 
            @prev-step="(step) => steper(step.step)"
            @get-devices-capability="device => setDevices(device)"
            @days="e => { setConditionRepeats(conditions[conditions.length - 1 > -1 ? conditions.length - 1 : 0].id, e.days) }"
            @update-device-capabilities="capabilities => updateCapabilities(capabilities)" />
        </transition>
      </div>
      <div v-show="conditions.length" class="automation__conditions-list">
        <TransitionGroup name="wizard">
          <div v-for="(condition, i) in conditions" 
            :key="condition.id + i"
            :class="show && condition.id === conditions[conditions.length - 1 > -1 ? conditions.length - 1 : 0].id ? 'automation__conditions__new' : 'automation__conditions'">
            <automation-condition 
              :type="condition.type"
              :new-conditions="conditions[conditions.length - 1 > -1 ? conditions.length - 1 : 0].id"
              :time-point="condition.type === AutomationConditionTypesEnum.time ? condition.value?.timePoint : undefined"
              :time-range="condition.type === AutomationConditionTypesEnum.timeRange ? condition?.value?.timeRange : undefined"
              :automation-condition="condition.type === AutomationConditionTypesEnum.temperature ? condition.value?.automationCondition : undefined"
              :temperature-range="condition.type === AutomationConditionTypesEnum.temperature ? condition.value?.temperatureRange : undefined"
              :sensors="sensors" :show="show"
              :device-id="condition.type === AutomationConditionTypesEnum.sensor || condition.type === AutomationConditionTypesEnum.temperature ? condition.value?.deviceId : undefined"
              :editable="true" :idx="i + 1" 
              :termostat="isTemperatureModalShow" 
              :is-condition-new="true"
              @select-option="e => { setCondition(condition.id, e.type, e.value, e.days); }"
              @next-step="(step) => steper(step.step)">
              <template #delete>
                <ui-button
                  class="automation__conditions-delete"
                  @click.prevent="deleteCondition(condition.id)">
                  Удалить
                </ui-button>
              </template>
            </automation-condition>
          </div>
        </TransitionGroup>
      </div>
      <div v-if="selectedDevices?.length || scenarios?.length" class="automation__scenarios">
        <h2 class="automation__param-label">Действия</h2>
        <div class="automation__scenarios-list">
          <div v-for="device in selectedDevices" 
            :key="device.id" 
            class="automation__scenarios-item">
            <p>
              <b>{{ device.name }}</b>
              <span>|</span>
              <span>Устройство</span>
              <button class="blank" @click="setDevices(device)">
                <ui-icon name="delete" />
              </button>
            </p>
            <p>
              <template v-for="capability in useDeviceCapabilitiesValues(device.capabilities)">
                <template v-if="capability?.value">
                  {{ capability.value }}
                </template>
                <template v-if="capability?.red !== undefined">
                  <div
                    :style="`background:rgb(${Math.round(capability?.red * 255)},${Math.round(capability?.green * 255)},${Math.round(capability?.blue * 255)})`"
                    class="automation__scenarios-color" />
                </template>
                <span>|</span>
              </template>
              {{ useDeviceCapabilityOnOff(device.capabilities) }}
            </p>
          </div>
          <div v-for="scenario in scenarios" :key="scenario.id" class="automation__scenarios-item">
            <p>
              <b>{{ scenario.name }}</b>
              <span>|</span>
              <span>Сценарий</span>
              <button class="blank" @click="selectScenarios(scenario)">
                <ui-icon name="delete" />
              </button>
            </p>
            <p>вкл</p>
          </div>
        </div>
      </div>
      <div class="automation__buttons">
        <ui-button class="automation__button" variant="secondary" @click="useGoToPreviousPage">
          Отменить
        </ui-button>
        <ui-button class="automation__button" type="submit" variant="primary">
          Сохранить
        </ui-button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useAutomationStore } from "~/store/automation"
import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import { useGroupsStore } from "~/store/groups"
import useApplyRangeAutomationCondition from "~/composables/useApplyRangeAutomationCondition"
import useApplyAutomationTemperatureCondition from "~/composables/useApplyAutomationTemperatureCondition"
import type { IAutomationCreateProps, IAutomationValue } from "~/api/automations/create"
import useFilteredByRoleDeviceFromGroup from "~/composables/useFilteredByRoleDeviceFromGroup"
import useSetAutomationCondition from "~/composables/useSetAutomationCondition"
import type { AutomationConditionTypes } from "~/components/Automation/AutomationCondition.vue"
import type { IAutomationByIdResponse, IAutomatizationDevice, ICapability } from "~/api/automations/getById"
import { useDeviceCapabilitiesValues } from "~/composables/useDeviceCapabilitiesValues"

export interface IAutomationSensor {
  id: string
  name: string
  type: string
  range?: ICapability["range"]
}
export interface IBaseCondition<T> {
  id: T
  value: IAutomationValue
  type: AutomationConditionTypes
}
const groupStore = useGroupsStore()
const automationStore = useAutomationStore()
const { canAutomate } = storeToRefs(groupStore)
if (!canAutomate.value) {
  useRouter().back()
}
const isLoading = ref(false)
const isConditionModalShow = ref(false)
const isTemperatureModalShow = ref(false)
const conditions = ref<IBaseCondition<number>[]>([])
const show = ref(false)
const isAddDevice = ref(false)
const selectedDevices = ref<IAutomationByIdResponse['devicesValueStates']>([])

const scenarios = ref<{ id: string, name: string }[]>([])
const name = ref('')
const sensors = ref<IAutomationSensor[]>([])

// находим сенсор, который используется в текущем(последнем) условии
const currentSensor = computed(() => {
  const lastSensorIndex = conditions.value.length - 1 > -1 ? conditions.value.length - 1 : 0

  return sensors.value.find(sensor => sensor.id === conditions.value[lastSensorIndex]?.value?.deviceId)
})
const steper = (step: number) => {
  if (step === 0) {
    show.value = false
    isTemperatureModalShow.value = false
    isAddDevice.value = false
    return
  }
  if (step === 1) {
    show.value = true
    isTemperatureModalShow.value = false
    isAddDevice.value = false
    return
  }
  if (step === 2) {
    show.value = true
    isTemperatureModalShow.value = true
    isAddDevice.value = false
    return
  }
  if (step === 3) {
    show.value = true
    isTemperatureModalShow.value = false
    isAddDevice.value = true
  }
}
function deleteCondition(id: number) {
  show.value = false
  conditions.value.splice(
    conditions.value.findIndex(el => el.id === id),
    1,
  )
  const isSensorConditionExist = conditions.value.find(el => el.type === 'sensor' || el.type === 'temperature')
  if (!isSensorConditionExist) {
    conditions.value.forEach((el) => {
      if (el.type === 'time-range') {
        el.type = 'time'
      }
    })
  }
}
const updateCapabilities = (capabilities:any) => {
  const index = selectedDevices.value?.findIndex(el => el.id === capabilities.deviceId) ?? -1

  if (index === -1) { return }

  const capabilitiesIdx = selectedDevices.value[index].capabilities?.findIndex(value => value.type === capabilities.type) ?? -1

  if (capabilitiesIdx !== -1) {
    selectedDevices.value[index].capabilities[capabilitiesIdx] = capabilities
  } else {
    selectedDevices.value[index].capabilities?.push(capabilities)
  }
}
const setDevices = (data: IAutomatizationDevice) => {
  const index = selectedDevices.value?.findIndex(el => el.id === data.id)
  if (index === -1) {
    selectedDevices.value.push(data)
  } else {
    selectedDevices.value.splice(index, 1)
  }
}
const setConditionRepeats = (conditionId: number, days: number[]) => {
  const idx = conditions.value.findIndex(el => el.id === conditionId)
  if (conditions.value[idx]) {
    conditions.value[idx].value = { ...conditions.value[idx].value }
    conditions.value[idx].value.days = [...days]
  }
}
function applyTemperatureRangeCondition(conditionId: number, range: Exclude<IAutomationValue["temperatureRange"], undefined>) {
  useApplyRangeAutomationCondition(conditions, conditionId, range)
  isTemperatureModalShow.value = false
}
function applyAutomationCondition(conditionId: number, automationCondition: Exclude<IAutomationValue["automationCondition"], undefined>) {
  useApplyAutomationTemperatureCondition(conditions, conditionId, automationCondition)
  isTemperatureModalShow.value = false
}
function setCondition(id: number, type: AutomationConditionTypes, value?: IAutomationValue, days?: number[]) {
  useSetAutomationCondition(id, type, sensors.value, conditions, isTemperatureModalShow, value, days)
}
sensors.value = useFilteredByRoleDeviceFromGroup(await groupStore.getGroupById(groupStore.currentHome), 'sensor')
function selectScenarios(scenario: { id: string, name: string }) {
  const index = scenarios.value.findIndex(el => el.id == scenario.id)
  if (index === -1) {
    scenarios.value.push(scenario)
    console.log(scenarios.value);
  } else {
    scenarios.value.splice(index, 1)
  }
}
async function create() {
  if (!name.value?.length) {
    useNotification("error", "Введите название автоматизации")
    return
  }
  if (name.value.length > 30) {
    useNotification("error", "Название автоматизации не должно превышать 30 символов")
    return
  }
  if (!conditions.value?.length) {
    useNotification("error", "Не выбрано условие активации")
    return
  }
  if (!scenarios.value.length && !selectedDevices.value.length) {
    useNotification("error", "Не выбрано действие")
    return
  }
  let isSensorsValid = true
  function transformDevicesValueStates(devices: IAutomatizationDevice[]) {
    return devices.reduce((result, item) => {
      result[item.id] = item.capabilities?.map(el => ({ type: el.type, value: el.value, hsv: el.hsv }))
      return result
    }, {})
  }

  const automationData: IAutomationCreateProps = {
    name: name.value,
    devicesValueStates: transformDevicesValueStates(selectedDevices.value),
    groupId: groupStore.currentHome,
    value: conditions.value.map((el) => {
      if ((el.type === "sensor" || el.type === "temperature") && !el.value?.deviceId?.length) {
        isSensorsValid = false
        useNotification('error', `Не выбран датчик для условия ${el.id}`)
      }
      if (el.type === 'time') {
        if (!el.value.time) {
          isSensorsValid = false
          useNotification('error', 'Введите время')
        }
        if (el.value.days?.length === 0) {
          el.value.time = new Date(`2077/01/01 ${el.value.time}`).toISOString()
        } else {
          el.value = { time: new Date(`2077/01/01 ${el.value.time}`).toISOString() }
        }
      }
      if (el.type === 'time-range') {
        if (!el.value?.timeRange || !el.value?.timeRange.endTime || !el.value.timeRange.startTime) {
          isSensorsValid = false
          useNotification('error', 'Не указан дипазон времнеи')
        }
        el.value.timeRange = {
          startTime: new Date(`2077/01/01 ${el.value?.timeRange?.startTime}`).toISOString(),
          endTime: new Date(`2077/01/01 ${el.value?.timeRange?.endTime}`).toISOString(),
        }
      }
      return unref(el.value)
    }),
    scenariosIds: scenarios.value.map(el => el.id),
  }
  isLoading.value = true
  isSensorsValid && await automationStore.create(automationData)
  isLoading.value = false
}
</script>

<style lang="scss">
.wizard-enter-active,
.wizard-leave-active {
  transition: all 0.5s ease;
}

.wizard-enter-from,
.wizard-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.wizard-enter-to,
.wizard-leave-from {
  transform: translateY(0);
  opacity: 1;
}

@import "assets/styles/page/automation-create";
</style>
