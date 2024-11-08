import useAsyncQuery from '~/composables/useAsyncQuery'

export interface IAuthUserProps {
    login: string,
    password: string,
}
export interface IAuthUserResponse {
    accessToken: string,
    refreshToken: string,
    username: string,
    role: string,
    id:any
}
export default async function apiUserAuth (props:IAuthUserProps):Promise<IAuthUserResponse> {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.post(path + `/v1/users/Login`, props)
  })
}
