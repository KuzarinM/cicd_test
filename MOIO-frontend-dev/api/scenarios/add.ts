import useValidationBackendError from "~/composables/useValidationBackendError"

export interface IAddScenario {
  name: string,
  homeId:string
  devicesValueStates:{
    [key:string]:{
      type:string,
      value:any,
      hsv?:{
        h:number,
        s:number,
        v:number
      }
    }[]
  }
}
export default async function apiScenariosAdd (props:IAddScenario) {
  return await useAsyncQuery(async ({
    axios,
    path,
  }) => {
    if (props.name.includes(`'`) || props.name.includes(`"`)) {
      useNotification('error', 'Недопустимый символ в названии сценария')
      return false
    }
    try {
      const response = await axios.post(path + 'v1/scenarios/create', props)
      if (response.status === 200) {
        useNotification('info', "Сценарий успешно добавлен")
        setTimeout(() => {
          useRouter().push('/scenarios')
        }, 500)
      }
    } catch (e) {
      useValidationBackendError(e, 'Ошибка при создании сценария')
    }
  })
}
