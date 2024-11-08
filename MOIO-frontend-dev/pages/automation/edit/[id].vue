<template>
  <div class="automation">
    <loader-screen :is-loading="isLoading" />
    <h1 class="automation__header">
      Настройка автоматизации
    </h1>
    <form class="automation__params" method="post" @submit.prevent="update()">
      <div class="automation__params-main">
        <div class="automation__param">
          <div class="automation__param-label">
            Название автоматизации
          </div>
          <input
            v-model="name"
            class="automation__param-input"
            type="text"
            autocomplete="false"
            required
          >
        </div>
      </div>
      <div class="automation__conditions-container">
        <h2 class="automation__subheader">
          Условия
        </h2>

        <ui-modal
          :is-shown="isConditionModalShow"
          transition-content-name="translate"
          backdrop-filter="blur(5px)"
          width="536px"
          @click-outside="isConditionModalShow=false"
        >
          <template #inner>
            <automation-add-condition
              @hide-modal="isConditionModalShow=false"
              @add-condition="e=>{setCondition(newConditions.length + oldConditions.length + 1,e,undefined);isConditionModalShow = false}"
            />
          </template>
        </ui-modal>
        <div v-for="(item,i) in oldConditions" :key="item.id" class="automation__conditions">
          <automation-condition
            :type="item.type"
            :time="item.type === AutomationConditionTypesEnum.time ? item.value?.time : undefined"
            :time-range="item.type === AutomationConditionTypesEnum.timeRange ? item.value?.timeRange : undefined"
            :automation-condition="item.type === AutomationConditionTypesEnum.temperature ? item.value?.automationCondition : undefined"
            :temperature-range="item.type === AutomationConditionTypesEnum.temperature ? item.value?.temperatureRange : undefined"
            :sensors="sensors"
            :device-id="item.type === AutomationConditionTypesEnum.sensor || item.type === AutomationConditionTypesEnum.temperature ? item.value?.deviceId : undefined"
            :editable="false"
            :idx="i+1"
          />
          <ui-button
            class-name="delete-outline"
            class="automation__conditions-delete"
            rounded="12px"
            margin-inline="0"
            @click.prevent="deleteCondition(item.id)"
          >
            Удалить
          </ui-button>
        </div>
        <div v-for="(item,i) in newConditions" :key="item.id+i" class="automation__conditions">
          <automation-condition
            :type="item.type"
            :time="item.type === AutomationConditionTypesEnum.time ? item.value?.time : undefined"
            :time-range="item.type === AutomationConditionTypesEnum.timeRange ? item?.value?.timeRange : undefined"
            :automation-condition="item.type === AutomationConditionTypesEnum.temperature ? item.value?.automationCondition : undefined"
            :temperature-range="item.type === AutomationConditionTypesEnum.temperature ? item.value?.temperatureRange : undefined"
            :sensors="sensors"
            :device-id="item.type === AutomationConditionTypesEnum.sensor || item.type === AutomationConditionTypesEnum.temperature ? item.value?.deviceId : undefined"
            :editable="true"
            :idx="i+oldConditions.length+1"
            @select-option="e=>setCondition(item.id, e?.type, e.value)"
          />
          <ui-button
            class-name="delete-outline"
            class="automation__conditions-delete"
            rounded="12px"
            margin-inline="0"
            @click.prevent="deleteCondition(item.id)"
          >
            Удалить
          </ui-button>
          <ui-modal
            :is-shown="isTemperatureModalShow"
            width="432px"
            backdrop-filter="blur(3px)"
            transition-content-name="translate"
            transition-fade-name="fade"
          >
            <template #inner>
              <AutomationSelectRangeModal
                :name="sensors.find(el=>el.id === item.value?.deviceId)?.name || ''"
                :range="sensors.find(el=>el.id === item.value?.deviceId)?.range"
                @save-automation-condition="e=>{applyAutomationCondition(item.id, e)}"
                @save-temperature-range="e=>{applyTemperatureRangeCondition(item.id, e)}"
              />
            </template>
          </ui-modal>
        </div>
      </div>
      <ui-button
        rounded="16px"
        class="automation__add-condition"
        @click.prevent="setShowConditionalModal()"
      >
        Добавить условие
      </ui-button>

      <div class="scenarios">
        <h2 class="automation__subheader">
          Сценарий
        </h2>
        <ui-any-list-item
          v-for="scenario in existingScenarios"
          :key="scenario.id"
          :class="`scenario-item ${scenarios.findIndex(el=>el===scenario.id)>-1?'--active':''}`"
          @click="selectScenarios(scenario.id)"
        >
          <template #title>
            {{ scenario.name }}
          </template>
        </ui-any-list-item>
      </div>
      <div class="automation__submit-container">
        <ui-button
          margin-inline="0"
          class="automation__delete"
          rounded="16px"
          class-name="delete"
          @click.prevent="deleteAutomation()"
        >
          Удалить
        </ui-button>
        <ui-button
          type="submit"
          rounded="16px"
          margin-inline="0"
        >
          Сохранить
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

const route = useRoute()
const isLoading = ref(true)
const groupStore = useGroupsStore()
const automationStore = useAutomationStore()
const { canAutomate } = storeToRefs(groupStore)
if (!canAutomate.value) {
  useRouter().back()
}
const id = route.params.id
const name = ref('')

const oldConditions = ref<IBaseCondition<string>[]>([])
const newConditions = ref<IBaseCondition<number>[]>([])
const removeCondition = ref<string[]>([])

const scenarios = ref<string[]>([])
const existingScenarios = await useScenarioStore().getAll(groupStore.currentHome)
isLoading.value = false

const runByAllConditions = ref(true)

const isTemperatureModalShow = ref(false)
const isConditionModalShow = ref(false)
const sensors = ref<IAutomationSensor[]>([])

function setShowConditionalModal () {
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
function applyTemperatureRangeCondition (conditionId:number, range:Exclude<IAutomationValue["temperatureRange"], undefined>) {
  useApplyRangeAutomationCondition(newConditions, conditionId, range)
  isTemperatureModalShow.value = false
}
function applyAutomationCondition (conditionId:number, automationCondition:Exclude<IAutomationValue["automationCondition"], undefined>) {
  useApplyAutomationTemperatureCondition(newConditions, conditionId, automationCondition)
  isTemperatureModalShow.value = false
}


sensors.value = useSelectOnlySensors(await groupStore.getGroupById(groupStore.currentHome)).map((el) => {
  return {
    id: el.id,
    name: el.name,
    type: el.type,
    range: el.capabilities?.find(el => el.type.includes('range'))?.range,
  }
})

function deleteCondition (id:any) {
  console.log(id)
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
function setCondition (id:number, type:AutomationConditionTypes, value?:any) {
  useSetAutomationCondition(id, type, sensors.value, newConditions, isTemperatureModalShow, value, oldConditions.value)
}

function selectScenarios (id:string) {
  const isScenarioExist = scenarios.value.findIndex(el => el === id)
  if (isScenarioExist > -1) {
    scenarios.value.splice(isScenarioExist, 1)
    return
  }
  scenarios.value.push(id)
}
async function update () {
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
  if (!scenarios.value.length) {
    useNotification("error", "Не выбран сценарий")
    return
  }
  isLoading.value = true
  let isSensorsValid = true
  const newTriggersArr:IAutomationUpdateProps['newTriggers'] = []

  for (const iAutomationValue of newConditions.value) {
    const isSensorCondition = iAutomationValue.type === 'sensor' || iAutomationValue.type === 'temperature'
    if (!iAutomationValue.value.deviceId && isSensorCondition) {
      isSensorsValid = false
      useNotification('error', 'Не выбран датчик для условия с датчиком')
      break
    }
    if (isSensorCondition) {
      newTriggersArr.push({ ...iAutomationValue.value })
    }
    if (iAutomationValue.type === AutomationConditionTypesEnum.time) {
      if (!iAutomationValue.value.time) {
        isSensorsValid = false
        break
      }
      newTriggersArr.push({ time: new Date(`2077/01/01 ${iAutomationValue.value?.time}`).toISOString() })
    }
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

  const automationData:IAutomationUpdateProps = {
    id: id as string,
    name: name.value,
    scenarios: scenarios.value.map((el, id) => {
      return {
        scenarioId: el,
        orderId: id,
      }
    }),
    newTriggers: newTriggersArr,
    removeTriggerIds: removeCondition.value,
    allConditions: runByAllConditions.value,
  }
  isSensorsValid && await automationStore.update(automationData)
  isLoading.value = false
}
async function getData () {
  isLoading.value = true
  const response = await automationStore.getById(id as string)
  isLoading.value = false
  const getValidTimePart = (part:string|number) => String(part).length === 1 ? '0' + part : part
  if (!response?.id?.length || !response?.name?.length) {
    setTimeout(() => {
      useRouter().back()
    }, 2000)
  }
  scenarios.value = response.scenarios.map(el => el.scenarioId)
  name.value = response.name
  response.triggers?.time?.forEach((el) => {
    const timePoint = new Date(`2077/01/01 ${el.time} UTC`)
    oldConditions.value.push({
      id: el.automationTriggerId,
      type: AutomationConditionTypesEnum.time,
      value: {
        time:
            `${getValidTimePart(timePoint.getHours())}:${getValidTimePart(timePoint.getMinutes())}`,
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
          startTime: `${getValidTimePart(startTime.getHours())}:${getValidTimePart(startTime.getMinutes())}`,
          endTime: `${getValidTimePart(endTime.getHours())}:${getValidTimePart(endTime.getMinutes())}`,
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

async function deleteAutomation () {
  isLoading.value = true
  await automationStore.deleteAutomation(id as string)
  isLoading.value = false
}
</script>

<style lang="scss">
@import "assets/styles/page/automation-create";
</style>
