import useAsyncQuery from "~/composables/useAsyncQuery"
import type { IChangeDeviceStatusPayload } from "~/api/device/types"

export interface IDeviceChangeBrightness extends IChangeDeviceStatusPayload {
    brightness:number
}
export default async function apiDeviceChangeBrightness (props:IDeviceChangeBrightness) {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.put(path + '/v1/devices/update/state/brightness', { ...props })
  })
}
