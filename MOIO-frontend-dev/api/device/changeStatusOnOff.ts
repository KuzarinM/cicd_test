import useAsyncQuery from "~/composables/useAsyncQuery"
import type { IChangeDeviceStatusPayload } from "~/api/device/types"

export interface IDeviceChangeStatusOnOff extends IChangeDeviceStatusPayload{
  onOffStatus:boolean
}
export default async function apiDeviceChangeOnOff (props:IDeviceChangeStatusOnOff) {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.put(path + '/v1/devices/update/state/on', { ...props })
  })
}
