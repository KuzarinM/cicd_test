import type { IAutomationValue } from "~/api/automations/create"

export interface ICapability {
  type: string
  capabilityCustomType: string
  retrievable?: boolean
  reportable?: boolean
  value?: any
  instance?: string
  range?: {
    min: number
    max: number
    precision: number
  }
  hsv?: {
    h: number
    s: number
    v: number
  }
}

export interface IAutomatizationDevice {
  id: string,
  name: string,
  type?: string,
  deviceCustomType: string
  icon?: string,
  capabilities?: ICapability[]
}

export interface IAutomationByIdResponse {
  id: string,
  name: string
  devicesValueStates: IAutomatizationDevice[]
  scenariosIds: string[]
  isEnable: boolean
  triggers: {
    time: {
      automationTriggerId: string,
      time: string
    }[]
    sensors?: {
      automationTriggerId: string,
      id: string
      name: string
      type: string
      condition: IAutomationValue['automationCondition'],
      temperatureRange: IAutomationValue['temperatureRange']
    }[]
    rangeTime?: {
      automationTriggerId: string,
      startTime: string
      endTime: string
    }[]
  }
}
export default async function apiAutomationsGetById(id: string): Promise<IAutomationByIdResponse> {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.get(path + '/v1/automations/' + id)
  })
}
