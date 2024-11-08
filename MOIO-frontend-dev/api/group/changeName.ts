import useAsyncQuery from '~/composables/useAsyncQuery'
import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiGroupChangeName (groupId:string, groupName:string) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.put(path + `/v1/groups/update/name`, { groupId, groupName })
      return response.status === 200 && response
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при изменении названия группы')
    }
  })
}

