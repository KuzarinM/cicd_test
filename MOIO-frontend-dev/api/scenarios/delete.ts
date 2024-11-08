import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiScenariosDelete (id:string) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response =
      await axios.delete(path + '/v1/scenarios/remove', { data: { scenariosIdList: [id] } })
      if (response.status === 200) {
        useNotification('info', "Сценарий успешно удален")
        setTimeout(() => useRouter().back(), 1000)
      }
    } catch (e) {
      useValidationBackendError(e, "Произошла ошибка при удалении")
    }
  })
}
