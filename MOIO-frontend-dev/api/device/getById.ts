import useAsyncQuery from "~/composables/useAsyncQuery"
import type { IAllDevicesResponse } from "~/api/device/getAll"


export default async function apiDeviceGetById (deviceId:string):Promise<[IAllDevicesResponse]> {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.get(path + '/device/GetDevice?deviceId=' + deviceId)
  })
}
