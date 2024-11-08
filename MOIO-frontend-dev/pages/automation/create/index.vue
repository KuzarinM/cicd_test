<template>
  <div class="automation">
    <loader-screen :is-loading="isLoading" />
    <h1 class="automation__header">
      Настройка автоматизации
    </h1>
    <form class="automation__params" method="post" @submit.prevent="create()">
      <div class="automation__params-main">
        <div class="automation__param">
          <div class="automation__param-label">
            Название автоматизации
          </div>
          <input v-model="name" class="automation__param-input" type="text" autocomplete="false" required>
        </div>
      </div>
      <div class="automation__conditions-container">
        <h2 class="automation__subheader">
          Условия
        </h2>
        <ui-modal
          width="536px"
          :is-shown="isConditionModalShow"
          transition-content-name="translate"
          backdrop-filter="blur(5px)"
          @click-outside="isConditionModalShow = false"
        >
          <template #inner>
            <automation-add-condition
              @hide-modal="isConditionModalShow=false"
              @add-condition="e=>{
                setCondition(conditions.length + 1, e ,undefined);
                isConditionModalShow = false
              }"
            />
          </template>
        </ui-modal>
        <div
          v-for="(item, i) in conditions"
          :key="item.id"
          class="automation__conditions"
        >
          <automation-condition
            :type="item.type"
            :time="item.type === 'time' ? item.value?.time : undefined"
            :time-range="item.type === 'time-range' ? item.value?.timeRange : undefined"
            :automation-condition="item.type === 'temperature' ? item.value.automationCondition : undefined"
            :temperature-range="item.type === 'temperature' ? item.value.temperatureRange : undefined"
            :sensors="sensors"
            :device-id="item.type === 'sensor' || item.type === 'temperature' ? item.value.deviceId : undefined"
            :idx="i + 1"
            @select-option="e=>setCondition(item.id, item.type, e.value)"
          />
          <ui-button
            margin-inline="0"
            class-name="delete-outline"
            rounded="12px"
            class="automation__conditions-delete"
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
        @click.prevent="setShowConditionalModal"
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
        <ui-button type="submit" rounded="16px">
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
import { useGroupsStore } from "~/store/groups"
import useAutomationShowCondition from "~/composables/useAutomationShowCondition"
import useApplyRangeAutomationCondition from "~/composables/useApplyRangeAutomationCondition"
import useApplyAutomationTemperatureCondition from "~/composables/useApplyAutomationTemperatureCondition"
import type { IAutomationCreateProps, IAutomationValue } from "~/api/automations/create"
import useSelectOnlySensors from "~/composables/useSelectOnlySensors"
import useSetAutomationCondition from "~/composables/useSetAutomationCondition"
import type { ICapability, ServiceProps } from "~/components/Service/TheService.vue"
import type { AutomationConditionTypes } from "~/components/Automation/AutomationCondition.vue"

export interface IAutomationSensor {
  id:string
  name:string
  type:string
  range?:ICapability["range"]
}
export interface IBaseCondition<T>{
  id:T
  value:IAutomationValue
  type:AutomationConditionTypes
}
const groupStore = useGroupsStore()
const scenarioStore = useScenarioStore()
const automationStore = useAutomationStore()
const { canAutomate } = storeToRefs(groupStore)
if (!canAutomate.value) {
  useRouter().back()
}
const isLoading = ref(false)
const isConditionModalShow = ref(false)
const isTemperatureModalShow = ref(false)
const conditions = ref<IBaseCondition<number>[]>([])

const scenarios = ref<string[]>([])
const name = ref('')
const sensors = ref<IAutomationSensor[]>([])

const existingScenarios = await scenarioStore.getAll(groupStore.currentHome)
function setShowConditionalModal () {
  useAutomationShowCondition(sensors.value, conditions, isConditionModalShow, conditions.value.length + 1)
}

function deleteCondition (id:number) {
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
function applyTemperatureRangeCondition (conditionId:number, range:Exclude<IAutomationValue["temperatureRange"], undefined>) {
  useApplyRangeAutomationCondition(conditions, conditionId, range)
  isTemperatureModalShow.value = false
}
function applyAutomationCondition (conditionId:number, automationCondition:Exclude<IAutomationValue["automationCondition"], undefined>) {
  useApplyAutomationTemperatureCondition(conditions, conditionId, automationCondition)
  isTemperatureModalShow.value = false
}
function setCondition (id:number, type:AutomationConditionTypes, value?:IAutomationValue) {
  useSetAutomationCondition(id, type, sensors.value, conditions, isTemperatureModalShow, value)
}

sensors.value = useSelectOnlySensors(await groupStore.getGroupById(groupStore.currentHome)).map((el) => {
  return {
    id: el.id,
    name: el.name,
    type: el.type,
    range: el.capabilities?.find(el => el.type.includes('range'))?.range,
  }
})
function selectScenarios (id:string) {
  const isScenarioExist = scenarios.value.findIndex(el => el === id)
  if (isScenarioExist > -1) {
    scenarios.value.splice(isScenarioExist, 1)
    return
  }
  scenarios.value.push(id)
}

async function create () {
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
  if (!scenarios.value?.length) {
    useNotification("error", "Не выбран сценарий")
    return
  }
  let isSensorsValid = true
  const automationData:IAutomationCreateProps = {
    name: name.value,
    homeId: groupStore.currentHome,
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
        el.value.time = new Date(`2077/01/01 ${el.value?.time}`).toISOString()
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
    scenariosOrder: scenarios.value.map((el, id) => {
      return {
        scenarioId: el,
        orderId: id,
      }
    }),
  }
  isLoading.value = true
  isSensorsValid && await automationStore.create(automationData)
  isLoading.value = false
}
</script>

<style lang="scss">
@import "assets/styles/page/automation-create";
</style>
