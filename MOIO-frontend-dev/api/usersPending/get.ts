import useAsyncQuery from "~/composables/useAsyncQuery"


export interface IPendingResponse {
  code:string
  groups:[]
  id:string
  inviter:string
  name:string
}
export default async function apiUsersPendingGet (): Promise<IPendingResponse[]> {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.get(path + '/v1/pendingUsersGroups')
  })
}
