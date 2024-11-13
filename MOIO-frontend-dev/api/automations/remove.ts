import useValidationBackendError from "~/composables/useValidationBackendError"

export default async function apiAutomationsRemove (automationId: string) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.delete(path + '/v1/automations/' + automationId)
      console.log(response)
      if (response?.status === 200) {
        useNotification('info', 'Автоматизация успешно удалена')
        setTimeout(() => {
          useRouter().push('/automation')
        }, 1000)
      }
      return response
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при удалении автоматизации')
    }
  })
}
