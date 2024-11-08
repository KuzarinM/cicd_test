import useAsyncQuery from '~/composables/useAsyncQuery'
import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IAddGroupPayload {
  name: string,
  typeId?: number,
  parentId?:string,
  devicesIds?: string[]
  groupIds?: string[]
}
export default async function apiGroupAddRoom ({ name, typeId, parentId, devicesIds, groupIds }:IAddGroupPayload) {
  if (name.includes(`'`) || name.includes(`"`)) {
    useNotification('error', 'Недопустимый символ в названии группы')
    return false
  }
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.post(path + '/v1/groups/AddGroup', {
        name,
        typeId,
        parentId,
        devicesIds,
        groupIds,
      })
      return response.status === 200 && response
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при создании группы')
    }
  })
}
