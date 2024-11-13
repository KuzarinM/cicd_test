import type { Ref } from "vue"
import { type AutomationConditionTypes } from "~/components/Automation/AutomationCondition.vue"
import type { IAutomationSensor, IBaseCondition } from "~/pages/automation/create/index.vue"
import { AutomationConditionTypesEnum } from "~/utils/enums"
import { type IAutomationValue } from "~/api/automations/create"

export default function useSetAutomationCondition (id:number,
  type:AutomationConditionTypes,
  sensors:IAutomationSensor[],
  newConditions:Ref<IBaseCondition<number>[]>,
  isTemperatureModalShow:Ref<boolean>,
  value:IAutomationValue,
  oldConditions?:IBaseCondition<string>[],
  days?:number[]) {
  const oldConditionsLength = oldConditions?.length ?? 0
  const validInitialTime = `${new Date().getHours()}:${new Date().getMinutes()}`
  const isSensorConditionExist = newConditions.value
    .find(el => el.type === AutomationConditionTypesEnum.sensor ||
        el.type === AutomationConditionTypesEnum.temperature) ||
      oldConditions?.find(el => el.type === AutomationConditionTypesEnum.sensor ||
          el.type === AutomationConditionTypesEnum.temperature)

  const isSensorCondition = type === AutomationConditionTypesEnum.sensor ||
      type === AutomationConditionTypesEnum.temperature
  const sensorProps = (id:string) => isSensorCondition
    ? sensors?.find(el => el.id === id)
    : undefined

  const isTemperatureSensor = (id:string) => isSensorCondition
    ? sensorProps(id)?.type?.includes('temp') || sensorProps(id)?.type?.includes('therm')
    : undefined

  const isConditionExist = newConditions.value
    .findIndex(el => el.id === id && el.type === type)

  if (isConditionExist > -1) {
    if (!isSensorCondition) {
      if (isSensorConditionExist) {
        newConditions.value[isConditionExist].value = value
        newConditions.value[isConditionExist].type = AutomationConditionTypesEnum.timeRange
        return
      }
      newConditions.value[isConditionExist].value = value
      newConditions.value[isConditionExist].type = AutomationConditionTypesEnum.time
      return
    }

    newConditions.value[isConditionExist].value = value
    newConditions.value[isConditionExist].type = isTemperatureSensor(value?.deviceId || '')
      ? AutomationConditionTypesEnum.temperature
      : AutomationConditionTypesEnum.sensor

    newConditions.value.forEach((el) => {
      if (el.type === 'time') {
        el.type = AutomationConditionTypesEnum.timeRange
      }
    })
    return
  }
  if (isConditionExist === -1) {
    if (!isSensorCondition) {
      if (isSensorConditionExist) {
        newConditions.value.push({
          id: newConditions.value.length + oldConditionsLength + 1,
          type: AutomationConditionTypesEnum.timeRange,
          value: {
            timeRange: {
              startTime: validInitialTime,
              endTime: validInitialTime,
            },
          },
        })
        return
      }
      newConditions.value.push({
        id: newConditions.value.length + oldConditionsLength + 1,
        type: AutomationConditionTypesEnum.time,
        value: { time: validInitialTime },
      })
      return
    }

    newConditions.value.push({
      id: newConditions.value.length + oldConditionsLength + 1,
      type: isTemperatureSensor(sensors[0]?.id)
        ? AutomationConditionTypesEnum.temperature
        : AutomationConditionTypesEnum.sensor,
      value: { deviceId: sensors[0]?.id },
    })
  }
}
