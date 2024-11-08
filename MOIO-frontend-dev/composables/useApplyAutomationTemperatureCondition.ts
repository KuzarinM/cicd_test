import { Ref } from "vue"
import { IAutomationValue } from "~/api/automations/create"
import type { AutomationConditionTypes } from "~/components/Automation/AutomationCondition.vue"
import type { IBaseCondition } from "~/pages/automation/create/index.vue"

export default function useApplyAutomationTemperatureCondition (conditions:Ref<IBaseCondition<number>[]>, conditionId:number, automationCondition:Exclude<IAutomationValue["automationCondition"], undefined>) {
  const id = conditions.value.findIndex(el => el.id === conditionId)
  if (typeof automationCondition?.condition !== "undefined" && typeof automationCondition?.value !== "undefined" && id > -1) {
    conditions.value[id].value.automationCondition = { ...automationCondition }
    conditions.value[id].value.temperatureRange = undefined
  }
}
