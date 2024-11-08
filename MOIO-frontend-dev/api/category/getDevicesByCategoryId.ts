import useAsyncQuery from '~/composables/useAsyncQuery'
import type { IAllDevicesResponse } from "~/api/device/getAll"
import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IDevicesInCategory {
    [key:string]:IAllDevicesResponse[]
}
export default async function apiCategoryGetDevicesById (categoryId:number, groupId:string):Promise<IDevicesInCategory> {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.get(path + `/v1/categories/${categoryId}/groups/${groupId}/devices`)
      return response.status === 200 && response
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при получении девайсов категорий')
    }
  })
}
