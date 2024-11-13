import useAsyncQuery from "~/composables/useAsyncQuery"
import type { IChangeDeviceStatusPayload } from "~/api/device/types"

export interface IDeviceChangeOpenness extends IChangeDeviceStatusPayload {
  percentageOpen: number
}

export default async function apiDeviceChangeOpenness (props:IDeviceChangeOpenness) {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.put(path + '/v1/devices/update/state/percentageOpen', { ...props })
  })
}
