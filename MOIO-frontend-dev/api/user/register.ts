import useAsyncQuery from '~/composables/useAsyncQuery'
import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IRegisterUserProps {
    name: string,
    login: string,
    password: string,
    clientId?:string,
    confirmationCode?:string
}
export interface IRegisterUserResponse {
    accessToken: string,
    refreshToken: string,
    username: string,
    role: string
}
export default async function apiUserRegister (props:IRegisterUserProps):Promise<IRegisterUserResponse|undefined> {
  if (props.name.includes(`'`) || props.name.includes(`"`)) {
    useNotification('error', 'Недопустимый символ в имени')
    return
  }
  return await useAsyncQuery(async ({ axios, path }) => {
    const response = await axios.post(path + '/v1/users/Register', props)
    try {
      if (response.status === 200) {
        return response
      }
    } catch (e) {
      useValidationBackendError(e, 'Произошла ошибка при регистрации')
    }
  })
}
