import useAsyncQuery from '~/composables/useAsyncQuery'
import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IGetAllResponseItem {
    id: number|string,
    name: string,
    devices: any
}

export default async function apiCategoryGetAll ():Promise<IGetAllResponseItem[]> {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.get(path + '/v1/categories')
      return response.status === 200 && response
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при получении категорий')
    }
  })
}
