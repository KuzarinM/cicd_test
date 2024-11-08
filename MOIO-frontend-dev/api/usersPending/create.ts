import useAsyncQuery from '~/composables/useAsyncQuery'
import useNotification from '~/composables/useNotification'
import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IGroupUser {
    userLogin:string
    canAutomate: boolean
}
export interface IAddUserToGroupProps {
    groupsIds:string[]
    userPendingAutomationPermission:IGroupUser[]
}

export default async function apiUsersPendingCreate (data:IAddUserToGroupProps) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.post(path + '/v1/pendingusersgroups/create', { ...data })
      if (response?.status === 200) {
        useNotification('info', 'Пользователям был отправлен пригласительный код')
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при добавлении пользователя')
    }
  })
}
