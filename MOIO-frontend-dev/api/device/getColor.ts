import useAsyncQuery from '~/composables/useAsyncQuery'

export interface IColorResponse {
    id: string
    isDefaultColor: boolean
    h: number
    s: number
    v: number
}

export default async function apiColorGetAll ():Promise<IColorResponse[]> {
  return await useAsyncQuery(async ({ axios, path }) => {
    return await axios.get(path + '/v1/colors')
  })
}
