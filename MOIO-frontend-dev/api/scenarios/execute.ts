import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiScenariosExecute (id:string) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.post(path + '/v1/scenarios/exec/' + id)
      if (response.status === 200) {
        useNotification('info', 'Сценарий успешно запущен')
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Ошибка при запуске сценария')
    }
  })
}
