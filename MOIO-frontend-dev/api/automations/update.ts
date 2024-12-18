import type { IAutomationValue } from "~/api/automations/create"
import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IAutomationUpdateProps {
  id: string,
  name: string,
  scenariosIds: string[]
  devicesValueStates:
  {
    [key: string]:
    {
      id: string
      name: string
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
  newTriggers: IAutomationValue[]
  removeTriggerIds: string[]
}

export default async function apiAutomationsUpdate(props: IAutomationUpdateProps) {
  if (props.name.includes(`'`) || props.name.includes(`"`)) {
    useNotification('error', 'Недопустимый символ в названии автоматизации')
    return false
  }
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.put(path + '/v1/automations', props)
      if (response.status === 200) {
        useNotification('info', 'Автоматизация успешно обновлена')
        setTimeout(() => {
          useRouter().push('/automation')
        }, 500)
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при обновлении автоматизации')
    }
  })
}
