import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IAutomationValue {
  timeRange?: {
    startTime?: string
    endTime?: string
    startTime1?: string[]
    endTime1?: string[]
  },
  deviceId?: string
  temperatureRange?: {
    min: number,
    max: number
  },
  automationCondition?: {
    value: number | undefined
    condition: 0 | 1 | 2 | undefined
  },
  time?: string
  timePoint?: string[]
  days?: number[]
}
export interface IAutomationCreateProps {
  name: string,
  value: IAutomationValue[]
  devicesValueStates:
  {
    [key: string]:
    {
      type: string,
      value: string,
      hsv?:
      {
        h: number,
        s: number,
        v: number
      }
    }[]
  }
  groupId: string
  scenariosIds: string[]
}
export default async function apiAutomationsCreate(props: IAutomationCreateProps) {
  if (props.name.includes(`'`) || props.name.includes(`"`)) {
    useNotification('error', 'Недопустимый символ в названии автоматизации')
    return false
  }
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.post(path + '/v1/automations', props)
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
