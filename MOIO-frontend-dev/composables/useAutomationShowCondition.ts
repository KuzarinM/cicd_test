import type { Ref } from "vue"
import type { IAutomationSensor } from "~/pages/automation/create/index.vue"
import { IAutomationValue } from "~/api/automations/create"
import type { AutomationConditionTypes } from "~/components/Automation/AutomationCondition.vue"

export default function useAutomationShowCondition (sensors:IAutomationSensor[], conditions:Ref<{value:IAutomationValue, type:AutomationConditionTypes, id:number}[]>, isConditionModalShow:Ref<boolean>, newId:number) {
  if (sensors.length > 0 && conditions.value.filter(el => el.type === AutomationConditionTypesEnum.time).length === 0) {
    isConditionModalShow.value = true
    return
  }
  conditions.value.push({
    type: AutomationConditionTypesEnum.time,
    id: newId,
    value: { time: `${new Date().getHours()}:${new Date().getMinutes()}` },
  })
}
