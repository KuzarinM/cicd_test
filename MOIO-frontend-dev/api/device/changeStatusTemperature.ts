import useAsyncQuery from "~/composables/useAsyncQuery"
import type { IChangeDeviceStatusPayload } from "~/api/device/types"

export interface IDeviceChangeStatusTemperature extends IChangeDeviceStatusPayload {
    temperature:boolean
}
export default async function apiDeviceChangeTemperature (props:IDeviceChangeStatusTemperature) {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.put(path + '/v1/devices/update/state/temperature', { ...props })
  })
}
