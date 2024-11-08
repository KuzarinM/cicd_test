import type { IAutomationValue } from "~/api/automations/create"

export interface IAutomationByIdResponse {
  id:string,
  name:string
  scenarios:{
    orderId:number,
    scenarioId:string
  }[]
  triggers:{
    time:{
      automationTriggerId: string,
      time: string
    }[]
    sensors?:{
      automationTriggerId: string,
      id: string
      name: string
      type: string
      condition: IAutomationValue['automationCondition'],
      temperatureRange: IAutomationValue['temperatureRange']
    }[]
    rangeTime?:{
      automationTriggerId: string,
      startTime:string
      endTime:string
    }[]
  }
}
export default async function apiAutomationsGetById (id:string):Promise<IAutomationByIdResponse> {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.get(path + '/v1/automations/' + id)
  })
}
