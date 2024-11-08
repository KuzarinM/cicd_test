import useAsyncQuery from '~/composables/useAsyncQuery'
import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiGroupDelete (groupId:string) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.delete(path + `/v1/groups/remove`, { data: { groupId } })
      return response.status === 200 && response
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при удалении группы')
    }
  })
}

