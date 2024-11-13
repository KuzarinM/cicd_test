<template>
  <div class="automation">
    <loader-screen :is-loading="isLoading" />
    <h1 class="automation__header">
      Автоматизации
    </h1>
    <form class="automation__params" method="post" @submit.prevent="update()">
      <div class="automation__params-main">
        <div class="automation__param">
          <div class="automation__param-label">
            Название автоматизации
          </div>
          <div class="automation__input-row">
            <label v-show="!isChangeName" class="automation__param-name">{{ name }}</label>
            <ui-button 
               v-show="!isChangeName"
              @click="isChangeName = !isChangeName"
              >
              <ui-icon name="pencil"/>
            </ui-button>
            <input
              v-show="isChangeName"
              v-model="name"
              class="automation__param-input"
              type="text"
              autocomplete="false"
              required
            >
            <ui-button
              v-show="isChangeName"
              @click="isChangeName = !isChangeName" 
            >
              <ui-icon name="check"/>
            </ui-button>
          </div>
          <ui-button
            class="automation__delete"
            @click.prevent="isModalOpen = true"
          >
            <ui-icon
              name="delete"
              size="20"
            />
            Удалить автоматизацию
          </ui-button>
          <delete-confirmation :is-modal-open="isModalOpen" @cancel="isModalOpen = false" @delete="deleteAutomation()">
            <template #heading>
              Удалить автоматизацию?
            </template>
            <template #description>
              Отменить это действие невозможно
            </template>
          </delete-confirmation>
        </div>
      </div>
      <div class="automation__conditions-container">
        <h2 class="automation__param-label">
          События
        </h2>
        <automation-add-condition
          @hide-modal="isConditionModalShow=false"
          @add-condition="e=>{
            setCondition(newConditions.length + oldConditions.length + 1,e,undefined);
            isConditionModalShow = false;
            steper(1);
          }"
        />
        <transition name="wizard">
          <AutomationSelectRangeModal
            :is-shown="isTemperatureModalShow"
            :name="currentSensor?.name || ''"
            :range="currentSensor?.range"
            @save-automation-condition="e=>{applyAutomationCondition(newConditions[newConditions.length-1 > -1 ? newConditions.length-1 : 0].id, e)}"
            @save-temperature-range="e=>{applyTemperatureRangeCondition(newConditions[newConditions.length-1 > -1 ? newConditions.length-1 : 0].id, e)}"
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
            @get-devices-capability="e => setDevices(e)"
            @days="e => setConditionRepeats(newConditions[newConditions.length-1 > -1 ? newConditions.length-1 : 0].id,e.days)"
            @update-device-capabilities="e => updateCapabilities(e)"
          />
        </transition>
      </div>
      <div v-show="oldConditions.length || newConditions.length" class="automation__conditions-list">
        <TransitionGroup name="wizard">
          <div v-for="(condition, i) in oldConditions" 
            :key="condition.id" 
            class="automation__conditions">
            <automation-condition
              :type="condition.type"
              :time-point="condition.type === AutomationConditionTypesEnum.time ? condition.value?.timePoint : undefined"
              :time-range="condition.type === AutomationConditionTypesEnum.timeRange ? condition.value?.timeRange : undefined"
              :automation-condition="condition.type === AutomationConditionTypesEnum.temperature ? condition.value?.automationCondition : undefined"
              :temperature-range="condition.type === AutomationConditionTypesEnum.temperature ? condition.value?.temperatureRange : undefined"
              :sensors="sensors"
              :show="true"
              :device-id="condition.type === AutomationConditionTypesEnum.sensor || condition.type === AutomationConditionTypesEnum.temperature ? condition.value?.deviceId : undefined"
              :editable="false"
              :idx="i+1"
              :is-condition-new="false"
            />
          <ui-button class-name="delete-outline" class="automation__conditions-delete" rounded="12px" margin-inline="0"
            @click.prevent="deleteCondition(condition.id)">
            Удалить
          </ui-button>
          </div>
        </TransitionGroup>
        <TransitionGroup name="wizard">
          <div v-for="(condition, i) in newConditions" 
            :key="condition.id + i"
            :class="show && condition.id === newConditions[newConditions.length - 1 > -1 ? newConditions.length - 1 : 0].id ? 'automation__conditions__new' : 'automation__conditions'">
            <automation-condition :type="condition.type"
              :new-conditions="newConditions[newConditions.length - 1 > -1 ? newConditions.length - 1 : 0].id"
              :time-point="condition.type === AutomationConditionTypesEnum.time ? condition.value?.timePoint : undefined"
              :time-range="condition.type === AutomationConditionTypesEnum.timeRange ? condition?.value?.timeRange : undefined"
              :automation-condition="condition.type === AutomationConditionTypesEnum.temperature ? condition.value?.automationCondition : undefined"
              :temperature-range="condition.type === AutomationConditionTypesEnum.temperature ? condition.value?.temperatureRange : undefined"
              :sensors="sensors" :show="show"
              :device-id="condition.type === AutomationConditionTypesEnum.sensor || condition.type === AutomationConditionTypesEnum.temperature ? condition.value?.deviceId : undefined"
              :editable="true" 
              :idx="i + oldConditions.length + 1" 
              :termostat="isTemperatureModalShow" 
              :is-condition-new="true"
              @select-option="e => { setCondition(condition.id, e.type, e.value); }"
              @next-step="(step) => steper(step.step)">
              <template #delete>
                <ui-button
                  class="automation__conditions-delete"
                  @click.prevent="deleteCondition(condition.id)"
                >
                  Удалить
                </ui-button>
              </template>
            </automation-condition>
          </div>
        </TransitionGroup>
      </div>
      <div v-if="selectedDevices?.length || scenarios?.length" class="automation__scenarios">
        <h2>Действия</h2>
        <div class="automation__scenarios-list">
          <div v-for="device in selectedDevices" :key="device.id" class="automation__scenarios-item">
            <p>
              <b>{{ device.name }}</b>
              <span>|</span>
              <span>Устройство</span>
              <button class="blank" @click="setDevices(device)">
                <ui-icon name="delete"/>
              </button>
            </p>
            <p>
              <template v-for="capability in useDeviceCapabilitiesValues(device.capabilities)">  
                <template v-if="capability?.value">
                  {{ capability.value }}
                </template>
                <template v-if="capability?.red !== undefined">
                  <div :style="`background:rgb(${Math.round(capability?.red*255)},${Math.round(capability?.green*255)},${Math.round(capability?.blue*255)})`" class="automation__scenarios-color" />
                </template>
                <span>|</span>
              </template>
              {{ useDeviceCapabilityOnOff(device.capabilities) }}
            </p>
          </div>
          <div v-for="scenario in scenarios.filter(scenario => scenario.name !== '')" 
            :key="scenario.id" 
            class="automation__scenarios-item">
            <p>
              <b>{{ scenario.name }}</b>
              <span>|</span>
              <span>Сценарий</span>
              <button class="blank" @click="selectScenarios(scenario)">
                <ui-icon name="delete"/>
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
          Сохранить изменения
        </ui-button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia"
import { useScenarioStore } from "~/store/scenario"
import { useAutomationStore } from "~/store/automation"

import LoaderScreen from "~/components/shared/LoaderScreen.vue"
import type { IAutomationUpdateProps } from "~/api/automations/update"
import { useGroupsStore } from "~/store/groups"
import { type IAutomationValue } from "~/api/automations/create"
import type { AutomationConditionTypes } from "~/components/Automation/AutomationCondition.vue"
import type { IAutomationSensor, IBaseCondition } from "~/pages/automation/create/index.vue"
import useAutomationShowCondition from "~/composables/useAutomationShowCondition"
import useApplyRangeAutomationCondition from "~/composables/useApplyRangeAutomationCondition"
import useApplyAutomationTemperatureCondition from "~/composables/useApplyAutomationTemperatureCondition"
import useFilteredByRoleDeviceFromGroup from "~/composables/useFilteredByRoleDeviceFromGroup"
import useSetAutomationCondition from "~/composables/useSetAutomationCondition"
import { AutomationConditionTypesEnum } from "~/utils/enums"
import type { IAutomationByIdResponse, IAutomatizationDevice, ICapability } from "~/api/automations/getById"
import { useDeviceCapabilitiesValues } from "~/composables/useDeviceCapabilitiesValues"
import { useDeviceCapabilityOnOff } from "~/composables/useDeviceCapabilityOnOff"

const route = useRoute()
const isLoading = ref(true)
const groupStore = useGroupsStore()
const automationStore = useAutomationStore()
const show = ref(false)
const { canAutomate } = storeToRefs(groupStore)
if (!canAutomate.value) {
  useRouter().back()
}
const isAddDevice = ref(false)
const id = route.params.id
const name = ref('')
const selectedDevices = ref<IAutomationByIdResponse['devicesValueStates']>([])
const isChangeName = ref(false)
const isModalOpen = ref(false)
const onStateUpdate = (data:any) => {
}
const { $bus } = useNuxtApp()
onMounted(() => {
  $bus.on('automationSelectDevice', onStateUpdate)
})
onUnmounted(() => {
  $bus.off('automationSelectDevice', onStateUpdate)
})
export interface IDevice {
  devicesValueStates1: {
    [key: string]: {
      type: string,
      value: string,
      hsv?: {
        h: number,
        s: number,
        v: number
      }
    }[]
  }[]
}
const oldConditions = ref<IBaseCondition<string>[]>([])
const newConditions = ref<IBaseCondition<number>[]>([])
const removeCondition = ref<string[]>([])

const scenarios = ref<{ id: string, name: string }[]>([])
const anonScenario = ref<{ scenarioId: string, orderId: number }>()
const existingScenarios = await useScenarioStore().getAll(groupStore.currentHome)
isLoading.value = false
const runByAllConditions = ref(true)

const isTemperatureModalShow = ref(false)
const isConditionModalShow = ref(false)
const sensors = ref<IAutomationSensor[]>([])

// находим сенсор, который используется в текущем(последнем) условии
const currentSensor = computed(() => {
  const lastSensorIndex = newConditions.value.length - 1 > -1 ? newConditions.value.length - 1 : 0

  return sensors.value.find(sensor => sensor.id === newConditions.value[lastSensorIndex]?.value?.deviceId)
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

const setConditionRepeats = (conditionId: number, days: number[]) => {
  const idx = newConditions.value.findIndex(el => el.id === conditionId)
  if (newConditions.value[idx]) {
    newConditions.value[idx].value.days = [...days]
  }
}

function setShowConditionalModal() {
  const newId = oldConditions.value.length + newConditions.value.length + 1
  if (oldConditions.value.find(el => el.type === AutomationConditionTypesEnum.time)) {
    newConditions.value.push({
      type: AutomationConditionTypesEnum.time,
      id: newId,
      value: { time: `${new Date().getHours()}:${new Date().getMinutes()}` },
    })
    return
  }
  useAutomationShowCondition(sensors.value, newConditions, isConditionModalShow, newId)
}
function selectScenarios(scenario: { id: string, name: string }) {
  const index = scenarios.value.findIndex(el => el.id == scenario.id)
  if (index === -1) {
    scenarios.value.push(scenario)
  } else {
    scenarios.value.splice(index, 1)
  }
}

function applyTemperatureRangeCondition(conditionId: number, range: Exclude<IAutomationValue["temperatureRange"], undefined>) {
  useApplyRangeAutomationCondition(newConditions, conditionId, range)
  isTemperatureModalShow.value = false
}

function applyAutomationCondition(conditionId: number, automationCondition: Exclude<IAutomationValue["automationCondition"], undefined>) {
  useApplyAutomationTemperatureCondition(newConditions, conditionId, automationCondition)
  isTemperatureModalShow.value = false
}
const updateCapabilities = (capabilities: any) => {
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

sensors.value = useFilteredByRoleDeviceFromGroup(await groupStore.getGroupById(groupStore.currentHome), 'sensor')

function deleteCondition(id: any) {
  show.value = false
  if (!Number.isSafeInteger(id)) {
    const oldConditionIdx = oldConditions.value.findIndex(el => el.id === id)
    removeCondition.value.push(oldConditions.value[oldConditionIdx].id)
    oldConditions.value.splice(
      oldConditionIdx,
      1,
    )
    return
  }
  newConditions.value.splice(newConditions.value.findIndex(el => el.id === id), 1)
}

function setCondition(id: number, type: AutomationConditionTypes, value?: any, days?: number[]) {
  useSetAutomationCondition(id, type, sensors.value, newConditions, isTemperatureModalShow, value, oldConditions.value, days)
}

async function update() {
  if (!name.value.length) {
    useNotification("error", "Введите название автоматизации")
    return
  }
  if (name.value.length > 30) {
    useNotification("error", "Название автоматизации не должно превышать 30 символов")
    return
  }
  if (!newConditions.value.length && !oldConditions.value.length) {
    useNotification("error", "Не выбрано условие активации")
    return
  }
  if (!scenarios.value.length && !selectedDevices.value.length) {
    useNotification("error", "Не выбрано действие")
    return
  }
  isLoading.value = true
  let isSensorsValid = true
  const newTriggersArr: IAutomationUpdateProps['newTriggers'] = []
  for (const iAutomationValue of newConditions.value) {
    const isSensorCondition = iAutomationValue.type === 'sensor' || iAutomationValue.type === 'temperature'
    if (!iAutomationValue.value.deviceId && isSensorCondition) {
      isSensorsValid = false
      useNotification('error', 'Не выбран датчик для условия с датчиком')
      break
    }
    if (isSensorCondition) {
      newTriggersArr.push({ deviceId: iAutomationValue.value.deviceId, automationCondition: { value: iAutomationValue.value.automationCondition?.value, condition: iAutomationValue.value.automationCondition?.condition } })
    }
    if (iAutomationValue.type === AutomationConditionTypesEnum.time) {
      if (!iAutomationValue.value.time) {
        isSensorsValid = false
        break
      }
      newTriggersArr.push({ time: new Date(`2077/01/01 ${iAutomationValue.value?.time}`).toISOString() })
    }
    newTriggersArr.push({ days: iAutomationValue.value.days })
    if (iAutomationValue.type === AutomationConditionTypesEnum.timeRange) {
      if (!iAutomationValue.value?.timeRange?.startTime || !iAutomationValue.value?.timeRange?.endTime) {
        isSensorsValid = false
        break
      }
      newTriggersArr.push({
        timeRange: {
          startTime: new Date(`2077/01/01 ${iAutomationValue.value?.timeRange?.startTime}`).toISOString(),
          endTime: new Date(`2077/01/01 ${iAutomationValue.value?.timeRange?.endTime}`).toISOString(),
        },
      })
    }
  }

  newConditions.value.forEach((el) => {
    if (!el.value.deviceId && (el.type === AutomationConditionTypesEnum.sensor || el.type === AutomationConditionTypesEnum.temperature)) {
      isSensorsValid = false
      useNotification('error', 'Не выбран датчик для условия с датчиком')
    }
    if (el.type === AutomationConditionTypesEnum.time) {
      return
    }
    return el.value
  })
  function transformDevicesValueStates(devices: IAutomatizationDevice[]) {
    return devices?.reduce((result, item) => {
      result[item.id] = item.capabilities?.map(device => ({ type: device.type, value: device.value, hsv: device.hsv }))
      return result
    }, {}) ?? {}
  }
  const correctScenarios = selectedDevices.value?.length ? [...scenarios.value, anonScenario.value] : scenarios.value
  const automationData: IAutomationUpdateProps = {
    id: id as string,
    devicesValueStates: transformDevicesValueStates(selectedDevices.value),
    name: name.value,
    scenariosIds: correctScenarios.map(scenario => scenario?.id ?? scenario) ?? [],
    newTriggers: newTriggersArr,
    removeTriggerIds: removeCondition.value,
    allConditions: runByAllConditions.value,
  }
  isSensorsValid && await automationStore.update(automationData)
  isLoading.value = false
}
async function getData() {
  isLoading.value = true
  const response = await automationStore.getById(id as string)
  isLoading.value = false
  const getValidTimePart = (part: string | number) => String(part).length === 1 ? '0' + part : part
  if (!response?.id?.length || !response?.name?.length) {
    setTimeout(() => {
      useRouter().back()
    }, 2000)
  }
  if (response.devicesValueStates) {
    response.devicesValueStates.forEach(el => {
      selectedDevices.value.push(el)
    })
  }
  name.value = response.name
  response.scenariosIds.forEach((scenarioId) => {
    const scenarioName = existingScenarios.find(existingScenario => existingScenario.id === scenarioId)?.name
    if (scenarioName) {
      scenarios.value.push({ id: scenarioId, name: scenarioName })
    } else {
      anonScenario.value = scenarioId
    }
  })
  response.triggers?.time?.forEach((el) => {
    const timePoint = new Date(`2077/01/01 ${el.time} UTC`)
    oldConditions.value.push({
      id: el.automationTriggerId,
      type: AutomationConditionTypesEnum.time,
      value: {
        timePoint:
          [`${getValidTimePart(timePoint.getHours())}`, `${getValidTimePart(timePoint.getMinutes())}`],
      },
    })
  })
  response.triggers?.rangeTime?.forEach((el) => {
    const startTime = new Date(`2077/01/01 ${el.startTime} UTC`)
    const endTime = new Date(`2077/01/01 ${el.endTime} UTC`)
    oldConditions.value.push({
      id: el.automationTriggerId,
      type: AutomationConditionTypesEnum.timeRange,
      value: {
        timeRange: {
          startTime1: [`${getValidTimePart(startTime.getHours())}`, `${getValidTimePart(startTime.getMinutes())}`],
          endTime1: [`${getValidTimePart(endTime.getHours())}`, `${getValidTimePart(endTime.getMinutes())}`],
        },
      },
    })
  })
  response.triggers?.sensors?.forEach((el) => {
    oldConditions.value.push({
      id: el.automationTriggerId,
      type: el.condition || el.temperatureRange ? AutomationConditionTypesEnum.temperature : AutomationConditionTypesEnum.sensor,
      value: {
        deviceId: el.id,
        temperatureRange: el.temperatureRange,
        automationCondition: el.condition,
      },
    })
  })
}
async function deleteAutomation() {
  isLoading.value = true
  await automationStore.deleteAutomation(id as string)
  isLoading.value = false
}

onMounted(() => getData())
</script>

<style lang="scss">
.action-header {
  font-size: 24px;
  font-weight: 600;
  width: 100%;
  color: #fff;

  @media screen and (max-width:768px) {
    font-size: 20px;
  }

  @media screen and (max-width:768px) {
    font-size: 20px;
  }
}

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
