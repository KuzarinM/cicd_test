import type { ServiceProps } from "~/components/Service/TheService.vue"
import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IScenarioResponse {
  id:string,
  name:string
  devicesScenarios:ServiceProps[]
}
export default async function apiScenariosGetById (id:string):Promise<IScenarioResponse> {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.get(path + '/v1/scenarios/' + id)
      return response.status === 200 && response
    } catch (e) {
      useValidationBackendError(e, 'Ошибка при получении сценария')
    }
  })
}
