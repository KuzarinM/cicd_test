import useValidationBackendError from "~/composables/useValidationBackendError"

export interface ISaveColor {
    h: Number
    s: Number
    v: number | undefined
}

export default async function apiSaveColor (props:ISaveColor) {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = axios.post(path + '/v1/colors/create', props)
      return response
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при сохранении цвета')
    }
  })
}
