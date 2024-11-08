import useAsyncQuery from '~/composables/useAsyncQuery'
import type { IDevicesInCategory } from "~/api/category/getDevicesByCategoryId"

export default async function apiGroupGetDevicesById (id:string):Promise<IDevicesInCategory> {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.get(path + '/v1/groups/GetDevicesByGroupAndCategory?groupid=' + id)
  })
}
