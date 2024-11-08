import useAsyncQuery from '~/composables/useAsyncQuery'
import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiGroupRemoveUsers (groupsIds:string[], usersLogins:string[] = [], usersIds:number[] = []) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.delete(path + '/v1/groups/remove/users', {
        data: {
          usersLogins,
          usersIds,
          groupsIds,
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
