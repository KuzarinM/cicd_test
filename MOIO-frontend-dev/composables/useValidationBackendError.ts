import { type AxiosError } from "axios"

export default function useValidationBackendError (e:unknown, fallbackErrorText?:string) {
  if ((e as any)?.response?.data?.length && !((e as AxiosError)?.response?.data as string)?.toLowerCase().includes('<html')) {
    useNotification('error', <string>(e as AxiosError)?.response?.data ?? fallbackErrorText ?? 'Что-то пошло не так')
  }
  console.log((e as any)?.response?.data?.errors)
  console.log((e as any)?.response)
  if ((e as any)?.response?.data?.errors) {
    const validationErrors:string[] = Object.values((e as any)?.response?.data?.errors)
    validationErrors.forEach((el) => {
      if (el?.length) {
        useNotification('error', el)
      }
    })
  }
  if ((e as any)?.response?.status >= 500) {
    useNotification('error', 'Сервер временно недоступен')
  }
}
