import useAsyncQuery from '~/composables/useAsyncQuery'
import type { IAllDevicesResponse } from "~/api/device/getAll"
import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IGroupResponseItem{
    id: string,
    parentId: string|null,
    typeId: number|null,
    inverseParent: IGroupResponseItem[],
    clientId?:string
    parent: string|null,
    type: {
        id:string
        code:string|null
        name:string|null
    },
    groupId?:string|number
    name?: string|null,
    devices: IAllDevicesResponse[],
    groupCreatorId:number
    isPending?:boolean
    canAutomate?:boolean
}

export default async function apiGroupGetAll (homeId:string):Promise<IGroupResponseItem[]> {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      const response = await axios.get(path + '/v1/groups/' + homeId)
      if (response.status === 200) {
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при получении групп')
    }
  })
}
