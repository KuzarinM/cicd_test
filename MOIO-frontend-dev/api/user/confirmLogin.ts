import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiUserConfirmLogin (confirmationCode:string) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.put(path + '/v1/users/login/confirm', { confirmationCode })
      if (response.status === 200) {
        console.log(response)
        useNotification('info', 'Логин успешно изменен')
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при смене пароля')
    }
  })
}
