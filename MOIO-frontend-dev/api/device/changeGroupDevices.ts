import useAsyncQuery from '~/composables/useAsyncQuery'
import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IDeviceChangeGroup{
  groupId:string | number | undefined,
  devicesIds:string[]
}

export default async function apiDevicesChangeGroup (props:IDeviceChangeGroup) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.put(path + `/v1/devices/update/group`,
        {
          ...props,
        })
      if (response.status === 200) {
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при изменении группы устройства')
    }
  })
}

