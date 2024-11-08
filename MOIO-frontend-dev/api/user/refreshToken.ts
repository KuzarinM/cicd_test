import useAsyncQuery from "~/composables/useAsyncQuery"
import { useUserStore } from "~/store/user"

export interface UserRefreshTokenResponse{
    accessToken:string,
    username: string
    role: string
}
export default async function apiUserRefreshToken (refresh_token :string):Promise<UserRefreshTokenResponse> {
  return await useAsyncQuery(async ({ axios, path }) => {
    try {
      return await axios.post(path + '/v1/users/RefreshToken', {
        tokenHash: refresh_token,
      })
    } catch (e) {
      await useUserStore().logout()
    }
  })
}
