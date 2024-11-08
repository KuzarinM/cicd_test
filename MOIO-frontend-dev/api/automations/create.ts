import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IAutomationValue {
  timeRange?:{
    startTime:string
    endTime:string
  },
  deviceId?:string
  temperatureRange?: {
    min: number,
    max: number
  },
  automationCondition?: {
    value: number,
    condition: 0 | 1 | 2
  },
  time?: string
}
export interface IAutomationCreateProps {
  name: string,
  value: IAutomationValue[]
  homeId:string
  scenariosOrder: {
     scenarioId: string,
     orderId: number
   }[]
}
export default async function apiAutomationsCreate (props:IAutomationCreateProps) {
  if (props.name.includes(`'`) || props.name.includes(`"`)) {
    useNotification('error', 'Недопустимый символ в названии автоматизации')
    return false
  }
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.post(path + '/v1/automations/create', props)
      if (response.status === 200) {
        useNotification('info', 'Автоматизация успешно создана')
        setTimeout(() => {
          useRouter().push('/automation')
        }, 500)
      }
      return response
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при создании автоматизации')
    }
  })
}
