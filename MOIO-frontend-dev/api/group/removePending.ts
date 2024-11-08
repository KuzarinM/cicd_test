import useAsyncQuery from '~/composables/useAsyncQuery'
import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiGroupRejectPending (code:string) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.delete(path + '/v1/groups/remove/pendings', {
        data: {
          code,
        },
      })
      if (response.status === 200) {
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при удалении пользователя из группы')
    }
  })
}
