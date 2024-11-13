import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IAutomationEnable {
    automationId?: string
    enabled?: boolean
}

export default async function apiAutomationsEnable (props:IAutomationEnable) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.post(path + `/v1/automations/${props.automationId}/status?enabled=${props.enabled}`)
      return response
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при обновлении автоматизации')
    }
  })
}
