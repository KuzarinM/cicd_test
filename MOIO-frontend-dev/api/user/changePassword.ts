import useValidationBackendError from "~/composables/useValidationBackendError"


export interface IChangePasswordPayload {
    oldPassword:string,
    newPassword:string
    confirmationCode?:string
}
export default async function apiUserChangePassword (props:IChangePasswordPayload) {
  return await useAsyncQuery(async ({ axios, path }) => {
    const response = await axios.put(path + '/v1/users/password', { ...props })
    try {
      if (response.status === 200) {
        useNotification('info',
          props.confirmationCode
            ? 'Данные успешно изменены'
            : 'На ваш email был отправлен код подтверждения',
        )
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при смене пароля')

      return response
    }
  })
}
