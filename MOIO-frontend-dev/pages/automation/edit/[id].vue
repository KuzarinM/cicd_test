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
          <label v-if="!isChangeName" class="automation__param-label__name">{{ name }} <ui-icon style="cursor: pointer;"
              name="pencil" @click="isChangeName = !isChangeName" /></label>
          <div v-if="isChangeName" class="automation__param-label__input">
            <input v-model="name" class="automation__param-input" type="text" autocomplete="false" required>
            <ui-icon style="cursor: pointer;" name="check" @click="isChangeName = !isChangeName" />
          </div>
        </div>
      </div>
      <ui-button margin-inline="0" class="automation__delete" rounded="12px" padding="0"
        @click.prevent="deleteAutomation()">
        <ui-icon name="delete" size="20" />
        Удалить автоматизацию
      </ui-button>
      <div class="automation__conditions-container">
        <h2 class="automation__subheader">
          События
        </h2>
        <automation-add-condition @hide-modal="isConditionModalShow = false" @add-condition="e => {
          setCondition(newConditions.length + oldConditions.length + 1, e, undefined);
          isConditionModalShow = false;
          steper(1);
        }" />

        <div v-for="(item, i) in oldConditions" :key="item.id" class="automation__conditions">
          <automation-condition :type="item.type"
            :time1="item.type === AutomationConditionTypesEnum.time ? item.value?.time1 : undefined"
            :time-range="item.type === AutomationConditionTypesEnum.timeRange ? item.value?.timeRange : undefined"
            :automation-condition="item.type === AutomationConditionTypesEnum.temperature ? item.value?.automationCondition : undefined"
            :temperature-range="item.type === AutomationConditionTypesEnum.temperature ? item.value?.temperatureRange : undefined"
            :sensors="sensors" :show="true"
            :device-id="item.type === AutomationConditionTypesEnum.sensor || item.type === AutomationConditionTypesEnum.temperature ? item.value?.deviceId : undefined"
            :editable="false" :idx="i + 1" :neww="false" />
          <ui-button class-name="delete-outline" class="automation__conditions-delete" rounded="12px" margin-inline="0"
            @click.prevent="deleteCondition(item.id)">
            Удалить
          </ui-button>
        </div>
        <TransitionGroup name="wizard">
          <div v-for="(item, i) in newConditions" :key="item.id + i"
            :class="show && item.id === newConditions[newConditions.length - 1 > -1 ? newConditions.length - 1 : 0].id ? 'automation__conditions__new' : 'automation__conditions'">
            <automation-condition :type="item.type"
              :new-conditions="newConditions[newConditions.length - 1 > -1 ? newConditions.length - 1 : 0].id"
              :time1="item.type === AutomationConditionTypesEnum.time ? item.value?.time1 : undefined"
              :time-range="item.type === AutomationConditionTypesEnum.timeRange ? item?.value?.timeRange : undefined"
              :automation-condition="item.type === AutomationConditionTypesEnum.temperature ? item.value?.automationCondition : undefined"
              :temperature-range="item.type === AutomationConditionTypesEnum.temperature ? item.value?.temperatureRange : undefined"
              :sensors="sensors" :show="show"
              :device-id="item.type === AutomationConditionTypesEnum.sensor || item.type === AutomationConditionTypesEnum.temperature ? item.value?.deviceId : undefined"
              :editable="true" :idx="i + oldConditions.length + 1" :termostat="isTemperatureModalShow" :neww="true"
              @select-option="e => { setCondition(item.id, e.type, e.value); }"
              @next-step="(step) => steper(step.step)">
              <template #delete>
                <ui-button class-name="delete-outline" class="automation__conditions-delete" rounded="12px"
                  margin-inline="0" @click.prevent="deleteCondition(item.id)">
                  Удалить
                </ui-button>
              </template>
            </automation-condition>
          </div>
        </TransitionGroup>
        <transition name="wizard">
          <AutomationSelectRangeModal :is-shown="isTemperatureModalShow"
            :name="sensors.find(el => el.id === newConditions[newConditions.length - 1 > -1 ? newConditions.length - 1 : 0]?.value?.deviceId)?.name || ''"
            :range="sensors.find(el => el.id === newConditions[newConditions.length - 1 > -1 ? newConditions.length - 1 : 0]?.value?.deviceId)?.range"
            @save-automation-condition="e => { applyAutomationCondition(newConditions[newConditions.length - 1 > -1 ? newConditions.length - 1 : 0].id, e) }"
            @save-temperature-range="e => { applyTemperatureRangeCondition(newConditions[newConditions.length - 1 > -1 ? newConditions.length - 1 : 0].id, e) }"
            @next-step="(step) => steper(step.step)" @prev-step="(step) => steper(step.step)" />
        </transition>
        <transition name="wizard">
          <automation-add-device-to-scenarios :show="isAddDevice"
            @save-scenarios="scenario => { saveScenarios(scenario); show = false }"
            @prev-step="(step) => steper(step.step)" @get-devices-capability="e => setDevices(e)"
            @days="e => setConditionRepeats(newConditions[newConditions.length - 1 > -1 ? newConditions.length - 1 : 0].id, e.days)"
            @update-device-capabilities="e => updaterCapabilities(e)" />
        </transition>
      </div>
      <div v-if="selectedDevices?.length || scenarios?.length" class="automation__scenarios">
        <h2>Действия</h2>
        <div v-for="item in selectedDevices" :key="item.id" class="automation__scenarios-list">
          <p>
            <b>{{ item.name }}</b>
            <span>|</span>
            <span>Устройство</span>
            <button class="blank" @click="setDevices(item)">
              <ui-icon name="delete" />
            </button>
          </p>
          <p>
            <template v-for="capability in useDeviceCapabilitiesValues(item.capabilities)">
              <template v-if="capability?.value">
                {{ capability.value }}
              </template>
              <template v-if="capability?.red">
                <div
                  :style="`background:rgb(${Math.round(capability?.red * 255)},${Math.round(capability?.green * 255)},${Math.round(capability?.blue * 255)})`"
                  class="automation__scenarios-color" />
              </template>
              <span>|</span>
            </template>
            {{ useDeviceCapabilityOnOff(item.capabilities) }}
          </p>
        </div>
        <div v-for="item in scenarios.filter(item => item.name !== '')" :key="item.id"
          class="automation__scenarios-list">
          <p>
            <b>{{ item.name }}</b>
            <span>|</span>
            <span>Сценарий</span>
            <button class="blank" @click="selectScenarios(item.id)">
              <ui-icon name="delete" />
            </button>
          </p>
          <p>вкл</p>
        </div>
      </div>
      <div class="automation__buttons">
        <ui-button class="automation__button" variant="secondary" @click="cancleAutomation">
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
import UiModal from "~/components/ui/UiModal.vue"
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
import useSelectOnlySensors from "~/composables/useSelectOnlySensors"
import useSetAutomationCondition from "~/composables/useSetAutomationCondition"
import { AutomationConditionTypesEnum } from "~/utils/enums"
import type { IAutomationByIdResponse, IAutomatizationDevice, ICapability } from "~/api/automations/getById"
import { useDeviceCapabilitiesValues } from "~/composables/useDeviceCapabilitiesValues"
import { useDeviceCapabilityOnOff } from "~/composables/useDeviceCapabilityOnOff"

const route = useRoute()
const isLoading = ref(true)
const groupStore = useGroupsStore()
const repeats = ref<number[]>([])
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
const onStateUpdate = (data: any) => {
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
const cancleAutomation = () => {
  navigateTo('/automation')
}
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

function saveScenarios(scenario: { id: string, name: string }[]) {
  scenarios.value = scenarios.value.concat([...scenario])
}
function applyTemperatureRangeCondition(conditionId: number, range: Exclude<IAutomationValue["temperatureRange"], undefined>) {
  useApplyRangeAutomationCondition(newConditions, conditionId, range)
  isTemperatureModalShow.value = false
}
function applyAutomationCondition(conditionId: number, automationCondition: Exclude<IAutomationValue["automationCondition"], undefined>) {
  useApplyAutomationTemperatureCondition(newConditions, conditionId, automationCondition)
  isTemperatureModalShow.value = false
}
function selectScenarios(id: string) {
  const isScenarioExist = scenarios.value.findIndex(el => el.id === id)
  scenarios.value.splice(isScenarioExist, 1)
}
const updaterCapabilities = (capabilities: any) => {
  const deviceId = `${capabilities.deviceId + '_ch' + capabilities.chanel}`
  const index = selectedDevices.value?.findIndex(el => el.id === deviceId) ?? -1

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
sensors.value = useSelectOnlySensors(await groupStore.getGroupById(groupStore.currentHome)).map((el) => {
  return {
    id: el.id,
    name: el.name,
    type: el.type,
    range: el.capabilities?.find(el => el.type.includes('range'))?.range,
  }
})

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
  selectedDevices.value = response.devicesValueStates
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
        time1:
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
getData()
async function deleteAutomation() {
  isLoading.value = true
  await automationStore.deleteAutomation(id as string)
  isLoading.value = false
}
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
