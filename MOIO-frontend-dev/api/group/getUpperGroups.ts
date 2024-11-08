import useAsyncQuery from "~/composables/useAsyncQuery"
import type { IGroupResponseItem } from "~/api/group/getAll"
import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiGroupsGetUpperGroups ():Promise<IGroupResponseItem[]> {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.get(path + '/v1/groups/GetUpUserGroup')
      if (response.status === 200) {
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при получении домов')
    }
  })
}
