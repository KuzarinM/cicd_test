import useAsyncQuery from '~/composables/useAsyncQuery'

export interface IUserInfoResponse {
    id: any,
    name: string,
    login: string,
    password: string,
    devices: any,
    role: string
    clientId:string
}
export default async function getUserInfo ():Promise<IUserInfoResponse> {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.get(path + '/v1/users/current')
  })
}
