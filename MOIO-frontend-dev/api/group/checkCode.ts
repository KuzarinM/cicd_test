import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiGroupCheckCode (code:string) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.post(path + '/v1/groups/CheckCode?code=' + code)
      if (response.status === 200) {
        useNotification('info', 'Приглашение подтверждено')
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Что-то пошло не так')
    }
  })
}
