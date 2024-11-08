import useAsyncQuery from "~/composables/useAsyncQuery"
import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiDeviceDelete (deviceId:string) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.delete(path + '/v1/devices/remove/', { data: { deviceId } })
      if (response.status === 200) {
        useNotification('info', 'Устройство успешно удалено')
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при удалении устройства')
    }
  })
}
