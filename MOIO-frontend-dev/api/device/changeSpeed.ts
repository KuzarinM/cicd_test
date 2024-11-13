import useAsyncQuery from "~/composables/useAsyncQuery"
import type { IChangeDeviceStatusPayload } from "~/api/device/types"

export interface IDeviceChangeSpeed extends IChangeDeviceStatusPayload {
  speedMode: number
}
export default async function apiDeviceChangeSpeed (props:IDeviceChangeSpeed) {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.put(path + '/v1/devices/update/state/speed', { ...props })
  })
}