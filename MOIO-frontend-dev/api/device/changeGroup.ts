import useAsyncQuery from '~/composables/useAsyncQuery'
import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiDevicesChangeDevices (groupId:string, devicesIds:string[]) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.put(path + `/v1/devices/update/group`,
        {
          groupId,
          devicesIds,
        },
      )
      if (response.status === 200) {
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при изменении группы устройства')
    }
  })
}

