import { type Ref } from "vue"
import { type IAutomationValue } from "~/api/automations/create"
import type { AutomationConditionTypes } from "~/components/Automation/AutomationCondition.vue"
import type { IBaseCondition } from "~/pages/automation/create/index.vue"

export default function useApplyRangeAutomationCondition (conditions:Ref<IBaseCondition<number>[]>, conditionId:number, range:Exclude<IAutomationValue["temperatureRange"], undefined>) {
  const id = conditions.value.findIndex(el => el.id === conditionId)
  if (typeof range?.min !== "undefined" && typeof range?.max !== "undefined" && id > -1) {
    conditions.value[id].value.temperatureRange = { ...range }
    conditions.value[id].value.automationCondition = undefined
  }
}
